import { v4 as uuidv4 } from 'uuid';
import { getImageUrl, deleteImage as deleteS3Image } from '../storage/s3-client.js';

// Neo4j driver will be injected
let driver = null;

export function setDriver(neo4jDriver) {
  driver = neo4jDriver;
}

// Helper to run Neo4j queries
async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

// Helper to get images for an entity
async function getImagesForEntity(entityId) {
  const result = await runQuery(`
    MATCH (e {id: $entityId})-[r:HAS_IMAGE]->(i:Image)
    RETURN i, r.rank as rank
    ORDER BY r.rank
  `, { entityId });

  return result.records.map(record => {
    const img = record.get('i').properties;
    const rank = record.get('rank');
    return {
      id: img.id,
      filename: img.filename,
      url: getImageUrl(img.key),
      mimeType: img.mimeType,
      size: typeof img.size === 'object' ? img.size.toNumber() : img.size,
      rank: typeof rank === 'object' ? rank.toNumber() : rank,
      uploadedAt: img.uploadedAt
    };
  });
}

// Helper to get all images from entity and all descendants (recursive)
async function getAllImagesForEntity(entityId) {
  // Use variable-length path to get all descendants via CONTAINS relationship
  // Then collect images from the entity itself and all descendants
  const result = await runQuery(`
    MATCH (root {id: $entityId})

    // Get root entity images
    OPTIONAL MATCH (root)-[r1:HAS_IMAGE]->(img1:Image)
    WITH root, collect({
      image: img1,
      rank: r1.rank,
      entity: root,
      depth: 0
    }) AS rootImages

    // Get all descendant entities and their images (recursive CONTAINS)
    OPTIONAL MATCH path = (root)-[:CONTAINS*1..]->(descendant)
    OPTIONAL MATCH (descendant)-[r2:HAS_IMAGE]->(img2:Image)
    WITH root, rootImages, collect({
      image: img2,
      rank: r2.rank,
      entity: descendant,
      depth: length(path)
    }) AS descendantImages

    // Combine all images
    WITH rootImages + descendantImages AS allImageData
    UNWIND allImageData AS imgData
    WITH imgData
    WHERE imgData.image IS NOT NULL

    RETURN
      imgData.image AS image,
      imgData.rank AS rank,
      imgData.entity.id AS entityId,
      imgData.entity.name AS entityName,
      labels(imgData.entity)[0] AS entityType,
      imgData.depth AS depth
    ORDER BY depth, rank
  `, { entityId });

  return result.records.map(record => {
    const img = record.get('image').properties;
    const rank = record.get('rank');
    return {
      id: img.id,
      filename: img.filename,
      url: getImageUrl(img.key),
      mimeType: img.mimeType,
      size: typeof img.size === 'object' ? img.size.toNumber() : img.size,
      rank: typeof rank === 'object' ? rank.toNumber() : rank,
      uploadedAt: img.uploadedAt,
      entityId: record.get('entityId'),
      entityName: record.get('entityName'),
      entityType: record.get('entityType')?.toLowerCase() || 'unknown'
    };
  });
}

// Helper to get all descendant content entities (recursive)
async function getAllContentsForEntity(entityId) {
  const result = await runQuery(`
    MATCH (root {id: $entityId})

    // Get all descendant entities via CONTAINS (recursive)
    OPTIONAL MATCH path = (root)-[:CONTAINS*1..]->(descendant)
    WHERE descendant IS NOT NULL

    // Get the immediate parent of each descendant
    WITH root, descendant, path,
         length(path) AS depth,
         nodes(path)[-2] AS parent

    RETURN
      toLower(labels(descendant)[0]) AS _nodeType,
      properties(descendant) AS properties,
      parent.id AS parentId,
      parent.name AS parentName,
      depth
    ORDER BY depth, descendant.name
  `, { entityId });

  return result.records
    .filter(record => record.get('_nodeType') !== null)
    .map(record => {
      const depth = record.get('depth');
      return {
        _nodeType: record.get('_nodeType'),
        properties: record.get('properties'),
        parentId: record.get('parentId'),
        parentName: record.get('parentName'),
        depth: depth === null ? 0 : (typeof depth === 'object' ? depth.toNumber() : depth)
      };
    });
}

// Helper to get locations for an event (OCCURS_AT relationships)
async function getLocationsForEvent(eventId) {
  const result = await runQuery(`
    MATCH (e:Event {id: $eventId})-[:OCCURS_AT]->(p:Place)
    RETURN properties(p) AS place
  `, { eventId });

  return result.records.map(r => r.get('place'));
}

// Helper to get participants for an event (INVOLVES relationships)
async function getParticipantsForEvent(eventId) {
  const result = await runQuery(`
    MATCH (e:Event {id: $eventId})-[:INVOLVES]->(p)
    RETURN properties(p) AS participant,
           CASE
             WHEN p:Character THEN 'character'
             WHEN p:Item THEN 'item'
             ELSE 'unknown'
           END AS nodeType
  `, { eventId });

  return result.records.map(r => ({
    ...r.get('participant'),
    _nodeType: r.get('nodeType')
  }));
}

// Helper to get parent narrative for an event
async function getParentNarrativeForEvent(eventId) {
  const result = await runQuery(`
    MATCH (n:Narrative)-[:CONTAINS]->(e:Event {id: $eventId})
    RETURN properties(n) AS narrative
  `, { eventId });

  if (result.records.length === 0) return null;
  return result.records[0].get('narrative');
}

// Helper to get events for an entity (reverse lookup: OCCURS_AT or INVOLVES)
async function getEventsForEntity(entityId, entityType) {
  let relationship;
  if (entityType === 'Place') {
    relationship = 'OCCURS_AT';
  } else {
    relationship = 'INVOLVES';
  }

  const result = await runQuery(`
    MATCH (e:Event)-[:${relationship}]->(target {id: $entityId})
    RETURN properties(e) AS event
    ORDER BY e.startDate
  `, { entityId });

  return result.records.map(r => r.get('event'));
}

// Helper to get single entity with contents and tags
async function getEntity(type, id) {
  const result = await runQuery(`
    MATCH (e:${type} {id: $id})

    OPTIONAL MATCH (e)-[:CONTAINS]->(child)
    WITH e, child,
      CASE WHEN child IS NOT NULL THEN {
        _nodeType: toLower(labels(child)[0]),
        properties: properties(child)
      } ELSE NULL END AS contentItem

    WITH e, collect(contentItem) AS rawContents
    WITH e, [item IN rawContents WHERE item IS NOT NULL] AS contents

    OPTIONAL MATCH (e)-[:TAGGED]->(tag:Tag)
    WITH e, contents, collect(properties(tag)) AS tags

    RETURN {
      id: e.id,
      properties: properties(e),
      contents: contents,
      tags: tags
    } AS entity
  `, { id });

  if (result.records.length === 0) return null;

  const entity = result.records[0].get('entity');
  // Fetch images separately
  entity.images = await getImagesForEntity(id);
  // Fetch all images including descendants
  entity.allImages = await getAllImagesForEntity(id);
  // Fetch all descendant content entities
  entity.allContents = await getAllContentsForEntity(id);

  // Event-specific: fetch locations, participants, and parent narrative
  if (type === 'Event') {
    entity.locations = await getLocationsForEvent(id);
    entity.participants = await getParticipantsForEvent(id);
    entity.parentNarrative = await getParentNarrativeForEvent(id);
  }

  // Reverse lookup: fetch events for Place, Character, Item
  if (['Place', 'Character', 'Item'].includes(type)) {
    entity.events = await getEventsForEntity(id, type);
  }

  return entity;
}

// Helper to get all entities of a type
async function getAllEntities(type) {
  const result = await runQuery(`
    MATCH (e:${type})

    OPTIONAL MATCH (e)-[:CONTAINS]->(child)
    WITH e, child,
      CASE WHEN child IS NOT NULL THEN {
        _nodeType: toLower(labels(child)[0]),
        properties: properties(child)
      } ELSE NULL END AS contentItem

    WITH e, collect(contentItem) AS rawContents
    WITH e, [item IN rawContents WHERE item IS NOT NULL] AS contents

    OPTIONAL MATCH (e)-[:TAGGED]->(tag:Tag)
    WITH e, contents, collect(properties(tag)) AS tags

    RETURN {
      id: e.id,
      properties: properties(e),
      contents: contents,
      tags: tags
    } AS entity
  `);

  // For list views, we include empty arrays for now (fetch on demand for detail view)
  return result.records.map(r => ({
    ...r.get('entity'),
    images: [],
    allImages: [],
    allContents: []
  }));
}

// Helper to create entity
async function createEntity(type, input) {
  const id = input.id || uuidv4();

  // Build properties dynamically based on entity type
  const props = {
    id,
    name: input.name || '',
    description: input.description || '',
    type: input.type || ''
  };

  // Add Event-specific properties
  if (type === 'Event') {
    props.startDate = input.startDate || '';
    props.endDate = input.endDate || '';
  }

  const propEntries = Object.entries(props);
  const propString = propEntries.map(([key]) => `${key}: $${key}`).join(', ');

  await runQuery(`
    CREATE (e:${type} {${propString}})
  `, props);

  return { message: `${type} created successfully` };
}

// Helper to update entity
async function updateEntity(type, input) {
  const updates = [];
  const params = { id: input.id };

  if (input.name !== undefined) {
    updates.push('e.name = $name');
    params.name = input.name;
  }
  if (input.description !== undefined) {
    updates.push('e.description = $description');
    params.description = input.description;
  }
  if (input.type !== undefined) {
    updates.push('e.type = $type');
    params.type = input.type;
  }

  // Event-specific properties
  if (input.startDate !== undefined) {
    updates.push('e.startDate = $startDate');
    params.startDate = input.startDate;
  }
  if (input.endDate !== undefined) {
    updates.push('e.endDate = $endDate');
    params.endDate = input.endDate;
  }

  if (updates.length > 0) {
    await runQuery(`
      MATCH (e:${type} {id: $id})
      SET ${updates.join(', ')}
    `, params);
  }

  return { message: `${type} updated successfully` };
}

// Helper to delete entity
async function deleteEntity(type, id) {
  await runQuery(`
    MATCH (e:${type} {id: $id})
    DETACH DELETE e
  `, { id });
  return { message: `${type} deleted successfully` };
}

export default {
  Query: {
    hello: () => ({ message: "Hello from Game Planner API!" }),

    // Universe queries
    universe: async (_, { obj }) => getEntity('Universe', obj.id),
    universes: async () => getAllEntities('Universe'),

    // Place queries
    place: async (_, { obj }) => getEntity('Place', obj.id),
    places: async () => getAllEntities('Place'),

    // Character queries
    character: async (_, { obj }) => getEntity('Character', obj.id),
    characters: async () => getAllEntities('Character'),

    // Item queries
    item: async (_, { obj }) => getEntity('Item', obj.id),
    items: async () => getAllEntities('Item'),

    // Tag queries
    tag: async (_, { obj }) => getEntity('Tag', obj.id),
    tags: async () => getAllEntities('Tag'),

    // Event queries
    event: async (_, { obj }) => getEntity('Event', obj.id),
    events: async () => getAllEntities('Event'),

    // Narrative queries
    narrative: async (_, { obj }) => getEntity('Narrative', obj.id),
    narratives: async () => getAllEntities('Narrative'),

    // Search
    searchEntities: async (_, { query, type }) => {
      const typeFilter = type ? `:${type.charAt(0).toUpperCase() + type.slice(1)}` : '';
      const result = await runQuery(`
        MATCH (e${typeFilter})
        WHERE e.name =~ $pattern
        RETURN {
          id: e.id,
          properties: properties(e),
          contents: [],
          tags: []
        } AS entity
        LIMIT 20
      `, { pattern: `(?i).*${query}.*` });

      return result.records.map(r => r.get('entity'));
    }
  },

  Mutation: {
    submitText: (_, { input }) => ({
      message: `Received text: ${input.text}`
    }),

    // Universe mutations
    addUniverse: async (_, { universe }) => createEntity('Universe', universe),
    editUniverse: async (_, { universe }) => updateEntity('Universe', universe),
    removeUniverse: async (_, { universe }) => deleteEntity('Universe', universe.id),

    // Place mutations
    addPlace: async (_, { place }) => createEntity('Place', place),
    editPlace: async (_, { place }) => updateEntity('Place', place),
    removePlace: async (_, { place }) => deleteEntity('Place', place.id),

    // Character mutations
    addCharacter: async (_, { character }) => createEntity('Character', character),
    editCharacter: async (_, { character }) => updateEntity('Character', character),
    removeCharacter: async (_, { character }) => deleteEntity('Character', character.id),

    // Item mutations
    addItem: async (_, { item }) => createEntity('Item', item),
    editItem: async (_, { item }) => updateEntity('Item', item),
    removeItem: async (_, { item }) => deleteEntity('Item', item.id),

    // Tag mutations
    addTag: async (_, { tag }) => createEntity('Tag', tag),
    editTag: async (_, { tag }) => updateEntity('Tag', tag),
    removeTag: async (_, { tag }) => deleteEntity('Tag', tag.id),

    // Event mutations
    addEvent: async (_, { event }) => createEntity('Event', event),
    editEvent: async (_, { event }) => updateEntity('Event', event),
    removeEvent: async (_, { event }) => deleteEntity('Event', event.id),

    // Narrative mutations
    addNarrative: async (_, { narrative }) => createEntity('Narrative', narrative),
    editNarrative: async (_, { narrative }) => updateEntity('Narrative', narrative),
    removeNarrative: async (_, { narrative }) => deleteEntity('Narrative', narrative.id),

    // Relationship: CONTAINS
    relateContains: async (_, { relation }) => {
      // First, remove existing CONTAINS relationships
      await runQuery(`
        MATCH (parent {id: $id})-[r:CONTAINS]->()
        DELETE r
      `, { id: relation.id });

      // Then create new relationships
      if (relation.childIds && relation.childIds.length > 0) {
        await runQuery(`
          MATCH (parent {id: $id})
          UNWIND $childIds AS childId
          MATCH (child {id: childId})
          CREATE (parent)-[:CONTAINS]->(child)
        `, { id: relation.id, childIds: relation.childIds });
      }

      return { message: 'Contains relationships updated' };
    },

    // Relationship: TAGGED
    relateTagged: async (_, { relation }) => {
      // First, remove existing TAGGED relationships
      await runQuery(`
        MATCH (entity {id: $id})-[r:TAGGED]->()
        DELETE r
      `, { id: relation.id });

      // Then create new relationships
      if (relation.tagIds && relation.tagIds.length > 0) {
        await runQuery(`
          MATCH (entity {id: $id})
          UNWIND $tagIds AS tagId
          MATCH (tag:Tag {id: tagId})
          CREATE (entity)-[:TAGGED]->(tag)
        `, { id: relation.id, tagIds: relation.tagIds });
      }

      return { message: 'Tag relationships updated' };
    },

    // Event relationship: OCCURS_AT (Event -> Place)
    relateOccursAt: async (_, { relation }) => {
      // First, remove existing OCCURS_AT relationships
      await runQuery(`
        MATCH (e:Event {id: $eventId})-[r:OCCURS_AT]->()
        DELETE r
      `, { eventId: relation.eventId });

      // Then create new relationships
      if (relation.placeIds && relation.placeIds.length > 0) {
        await runQuery(`
          MATCH (e:Event {id: $eventId})
          UNWIND $placeIds AS placeId
          MATCH (p:Place {id: placeId})
          CREATE (e)-[:OCCURS_AT]->(p)
        `, { eventId: relation.eventId, placeIds: relation.placeIds });
      }

      return { message: 'Event location relationships updated' };
    },

    // Event relationship: INVOLVES (Event -> Character/Item)
    relateInvolves: async (_, { relation }) => {
      // First, remove existing INVOLVES relationships
      await runQuery(`
        MATCH (e:Event {id: $eventId})-[r:INVOLVES]->()
        DELETE r
      `, { eventId: relation.eventId });

      // Create character relationships
      if (relation.characterIds && relation.characterIds.length > 0) {
        await runQuery(`
          MATCH (e:Event {id: $eventId})
          UNWIND $characterIds AS charId
          MATCH (c:Character {id: charId})
          CREATE (e)-[:INVOLVES]->(c)
        `, { eventId: relation.eventId, characterIds: relation.characterIds });
      }

      // Create item relationships
      if (relation.itemIds && relation.itemIds.length > 0) {
        await runQuery(`
          MATCH (e:Event {id: $eventId})
          UNWIND $itemIds AS itemId
          MATCH (i:Item {id: itemId})
          CREATE (e)-[:INVOLVES]->(i)
        `, { eventId: relation.eventId, itemIds: relation.itemIds });
      }

      return { message: 'Event participant relationships updated' };
    },

    // Image mutations
    reorderImages: async (_, { entityId, imageIds }) => {
      // Update ranks based on array order
      for (let i = 0; i < imageIds.length; i++) {
        await runQuery(`
          MATCH (e {id: $entityId})-[r:HAS_IMAGE]->(i:Image {id: $imageId})
          SET r.rank = $rank
        `, {
          entityId,
          imageId: imageIds[i],
          rank: i + 1,
        });
      }

      return await getImagesForEntity(entityId);
    },

    removeImage: async (_, { imageId }) => {
      // Get image key before deleting
      const result = await runQuery(`
        MATCH (i:Image {id: $imageId})
        RETURN i.key as key
      `, { imageId });

      if (result.records.length === 0) {
        return { message: 'Image not found' };
      }

      const key = result.records[0].get('key');

      // Delete from S3/MinIO
      try {
        await deleteS3Image(key);
      } catch (e) {
        console.error('Error deleting from S3:', e);
      }

      // Delete from Neo4j
      await runQuery(`
        MATCH (i:Image {id: $imageId})
        DETACH DELETE i
      `, { imageId });

      return { message: 'Image deleted successfully' };
    }
  }
};
