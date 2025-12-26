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

  // For list views, we include empty images array for now (fetch on demand for detail view)
  return result.records.map(r => ({
    ...r.get('entity'),
    images: []
  }));
}

// Helper to create entity
async function createEntity(type, input) {
  const id = input.id || uuidv4();
  await runQuery(`
    CREATE (e:${type} {id: $id, name: $name, description: $description, type: $type})
  `, {
    id,
    name: input.name || '',
    description: input.description || '',
    type: input.type || ''
  });
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
