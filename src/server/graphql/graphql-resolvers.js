import { v4 as uuidv4 } from 'uuid';
import neo4j from 'neo4j-driver';
import { getImageUrl, deleteImage as deleteS3Image } from '../storage/s3-client.js';
import { SUBSCRIPTION_TIERS, CREDIT_PACKAGES, getTierLimits, formatPrice, getCreditPackage } from '../config/tiers.js';
import Stripe from 'stripe';

// Initialize Stripe (will be null if no key configured)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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

// Helper to get the universe ID for any entity by traversing up the CONTAINS chain
async function getUniverseForEntity(entityId) {
  const result = await runQuery(`
    MATCH (e {id: $entityId})
    OPTIONAL MATCH path = (u:Universe)-[:CONTAINS*0..]->(e)
    WHERE u IS NOT NULL
    RETURN u.id AS universeId, properties(u) AS universe
    LIMIT 1
  `, { entityId });

  if (result.records.length === 0) return null;
  const record = result.records[0];
  return {
    id: record.get('universeId'),
    properties: record.get('universe')
  };
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

    // Get the immediate parent of each descendant (use shortest path to avoid duplicates)
    WITH descendant,
         min(length(path)) AS depth,
         head(collect(nodes(path)[-2])) AS parent

    RETURN DISTINCT
      toLower(labels(descendant)[0]) AS _nodeType,
      properties(descendant) AS properties,
      parent.id AS parentId,
      parent.name AS parentName,
      depth
    ORDER BY depth, properties(descendant).name
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

// Helper to get aggregated places from all events in a narrative
async function getAggregatedLocationsForNarrative(narrativeId) {
  const result = await runQuery(`
    MATCH (n:Narrative {id: $narrativeId})-[:CONTAINS]->(e:Event)-[:OCCURS_AT]->(p:Place)
    RETURN DISTINCT properties(p) AS place
    ORDER BY place.name
  `, { narrativeId });

  return result.records.map(r => r.get('place'));
}

// Helper to get aggregated characters and items from all events in a narrative
async function getAggregatedParticipantsForNarrative(narrativeId) {
  const result = await runQuery(`
    MATCH (n:Narrative {id: $narrativeId})-[:CONTAINS]->(e:Event)-[:INVOLVES]->(p)
    RETURN DISTINCT properties(p) AS participant,
           CASE
             WHEN p:Character THEN 'character'
             WHEN p:Item THEN 'item'
             ELSE 'unknown'
           END AS nodeType
    ORDER BY nodeType, participant.name
  `, { narrativeId });

  return result.records.map(r => ({
    ...r.get('participant'),
    _nodeType: r.get('nodeType')
  }));
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

// ============================================
// Product System Helpers
// ============================================

// Helper to get products for a universe
async function getProductsForUniverse(universeId) {
  const result = await runQuery(`
    MATCH (p:Product)-[:USES_IP]->(u:Universe {id: $universeId})
    RETURN {
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type,
      gameType: p.gameType,
      _nodeType: 'product',
      universe: {
        id: u.id,
        name: u.name
      },
      properties: {
        id: p.id,
        name: p.name,
        description: p.description,
        type: p.type
      }
    } AS product
    ORDER BY p.name
  `, { universeId });

  return result.records.map(r => r.get('product'));
}

// Helper to get adaptations for an entity (reverse lookup)
async function getAdaptationsForEntity(entityId) {
  const result = await runQuery(`
    MATCH (e {id: $entityId})<-[:ADAPTS]-(adapt:EntityAdaptation)-[:FOR_PRODUCT]->(p:Product)
    RETURN {
      id: adapt.id,
      displayName: adapt.displayName,
      flavorText: adapt.flavorText,
      role: adapt.role,
      appearance: adapt.appearance,
      product: {
        id: p.id,
        name: p.name,
        type: p.type,
        gameType: p.gameType
      }
    } AS adaptation
    ORDER BY p.name
  `, { entityId });

  // Return empty array instead of null when no adaptations
  return result.records.length > 0
    ? result.records.map(r => r.get('adaptation'))
    : [];
}

// Helper to get a single product with all related data
async function getProduct(id) {
  const result = await runQuery(`
    MATCH (p:Product {id: $id})

    // Get linked universe
    OPTIONAL MATCH (p)-[:USES_IP]->(u:Universe)

    // Get attribute definitions
    OPTIONAL MATCH (p)-[:CONTAINS]->(attr:AttributeDefinition)
    WITH p, u, collect(properties(attr)) AS attributes

    // Get mechanic definitions
    OPTIONAL MATCH (p)-[:CONTAINS]->(mech:MechanicDefinition)
    WITH p, u, attributes, collect(properties(mech)) AS mechanics

    // Get sections (for passive media)
    OPTIONAL MATCH (p)-[:CONTAINS]->(sec:Section)
    WITH p, u, attributes, mechanics, collect(properties(sec)) AS sections

    // Get entity adaptations with source entity info
    OPTIONAL MATCH (p)<-[:FOR_PRODUCT]-(adapt:EntityAdaptation)-[:ADAPTS]->(entity)
    WITH p, u, attributes, mechanics, sections,
         collect({
           id: adapt.id,
           displayName: adapt.displayName,
           flavorText: adapt.flavorText,
           attributeValues: adapt.attributeValues,
           mechanicValues: adapt.mechanicValues,
           artDirection: adapt.artDirection,
           role: adapt.role,
           appearance: adapt.appearance,
           sourceEntity: properties(entity),
           sourceType: toLower(labels(entity)[0])
         }) AS adaptations

    RETURN {
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type,
      gameType: p.gameType,
      universe: CASE WHEN u IS NOT NULL THEN properties(u) ELSE NULL END,
      attributes: attributes,
      mechanics: mechanics,
      sections: sections,
      adaptations: [a IN adaptations WHERE a.id IS NOT NULL]
    } AS product
  `, { id });

  if (result.records.length === 0) return null;

  const product = result.records[0].get('product');
  product.images = await getImagesForEntity(id);
  return product;
}

// Helper to get all products
async function getAllProducts() {
  const result = await runQuery(`
    MATCH (p:Product)

    // Get linked universe
    OPTIONAL MATCH (p)-[:USES_IP]->(u:Universe)

    RETURN {
      id: p.id,
      name: p.name,
      description: p.description,
      type: p.type,
      gameType: p.gameType,
      universe: CASE WHEN u IS NOT NULL THEN properties(u) ELSE NULL END,
      attributes: [],
      mechanics: [],
      sections: [],
      adaptations: []
    } AS product
  `);

  return result.records.map(r => ({
    ...r.get('product'),
    images: []
  }));
}

// Helper to create a product
async function createProduct(input) {
  const id = input.id || uuidv4();

  await runQuery(`
    CREATE (p:Product {
      id: $id,
      name: $name,
      description: $description,
      type: $type,
      gameType: $gameType
    })
  `, {
    id,
    name: input.name || '',
    description: input.description || '',
    type: input.type || 'game',
    gameType: input.gameType || ''
  });

  // Link to universe if provided
  if (input.universeId) {
    await runQuery(`
      MATCH (p:Product {id: $productId})
      MATCH (u:Universe {id: $universeId})
      CREATE (p)-[:USES_IP]->(u)
    `, { productId: id, universeId: input.universeId });
  }

  return { message: 'Product created successfully' };
}

// Helper to update a product
async function updateProduct(input) {
  const updates = [];
  const params = { id: input.id };

  if (input.name !== undefined) {
    updates.push('p.name = $name');
    params.name = input.name;
  }
  if (input.description !== undefined) {
    updates.push('p.description = $description');
    params.description = input.description;
  }
  if (input.type !== undefined) {
    updates.push('p.type = $type');
    params.type = input.type;
  }
  if (input.gameType !== undefined) {
    updates.push('p.gameType = $gameType');
    params.gameType = input.gameType;
  }

  if (updates.length > 0) {
    await runQuery(`
      MATCH (p:Product {id: $id})
      SET ${updates.join(', ')}
    `, params);
  }

  // Update universe link if provided
  if (input.universeId !== undefined) {
    // Remove existing link
    await runQuery(`
      MATCH (p:Product {id: $id})-[r:USES_IP]->()
      DELETE r
    `, { id: input.id });

    // Create new link if universeId is provided
    if (input.universeId) {
      await runQuery(`
        MATCH (p:Product {id: $id})
        MATCH (u:Universe {id: $universeId})
        CREATE (p)-[:USES_IP]->(u)
      `, { id: input.id, universeId: input.universeId });
    }
  }

  return { message: 'Product updated successfully' };
}

// Helper to delete a product
async function deleteProduct(id) {
  // Delete all related entities first
  await runQuery(`
    MATCH (p:Product {id: $id})
    OPTIONAL MATCH (p)-[:CONTAINS]->(child)
    OPTIONAL MATCH (adapt:EntityAdaptation)-[:FOR_PRODUCT]->(p)
    DETACH DELETE child, adapt, p
  `, { id });
  return { message: 'Product deleted successfully' };
}

// Helper to create AttributeDefinition
async function createAttributeDefinition(input) {
  const id = input.id || uuidv4();

  await runQuery(`
    MATCH (p:Product {id: $productId})
    CREATE (a:AttributeDefinition {
      id: $id,
      name: $name,
      description: $description,
      valueType: $valueType,
      defaultValue: $defaultValue,
      options: $options,
      min: $min,
      max: $max
    })
    CREATE (p)-[:CONTAINS]->(a)
  `, {
    productId: input.productId,
    id,
    name: input.name || '',
    description: input.description || '',
    valueType: input.valueType || 'text',
    defaultValue: input.defaultValue || '',
    options: input.options || '',
    min: input.min || null,
    max: input.max || null
  });

  return { message: 'Attribute definition created successfully' };
}

// Helper to update AttributeDefinition
async function updateAttributeDefinition(input) {
  const updates = [];
  const params = { id: input.id };

  if (input.name !== undefined) { updates.push('a.name = $name'); params.name = input.name; }
  if (input.description !== undefined) { updates.push('a.description = $description'); params.description = input.description; }
  if (input.valueType !== undefined) { updates.push('a.valueType = $valueType'); params.valueType = input.valueType; }
  if (input.defaultValue !== undefined) { updates.push('a.defaultValue = $defaultValue'); params.defaultValue = input.defaultValue; }
  if (input.options !== undefined) { updates.push('a.options = $options'); params.options = input.options; }
  if (input.min !== undefined) { updates.push('a.min = $min'); params.min = input.min; }
  if (input.max !== undefined) { updates.push('a.max = $max'); params.max = input.max; }

  if (updates.length > 0) {
    await runQuery(`
      MATCH (a:AttributeDefinition {id: $id})
      SET ${updates.join(', ')}
    `, params);
  }

  return { message: 'Attribute definition updated successfully' };
}

// Helper to delete AttributeDefinition
async function deleteAttributeDefinition(id) {
  await runQuery(`
    MATCH (a:AttributeDefinition {id: $id})
    DETACH DELETE a
  `, { id });
  return { message: 'Attribute definition deleted successfully' };
}

// Helper to create MechanicDefinition
async function createMechanicDefinition(input) {
  const id = input.id || uuidv4();

  await runQuery(`
    MATCH (p:Product {id: $productId})
    CREATE (m:MechanicDefinition {
      id: $id,
      name: $name,
      description: $description,
      category: $category,
      hasValue: $hasValue,
      valueType: $valueType
    })
    CREATE (p)-[:CONTAINS]->(m)
  `, {
    productId: input.productId,
    id,
    name: input.name || '',
    description: input.description || '',
    category: input.category || '',
    hasValue: input.hasValue || false,
    valueType: input.valueType || ''
  });

  return { message: 'Mechanic definition created successfully' };
}

// Helper to update MechanicDefinition
async function updateMechanicDefinition(input) {
  const updates = [];
  const params = { id: input.id };

  if (input.name !== undefined) { updates.push('m.name = $name'); params.name = input.name; }
  if (input.description !== undefined) { updates.push('m.description = $description'); params.description = input.description; }
  if (input.category !== undefined) { updates.push('m.category = $category'); params.category = input.category; }
  if (input.hasValue !== undefined) { updates.push('m.hasValue = $hasValue'); params.hasValue = input.hasValue; }
  if (input.valueType !== undefined) { updates.push('m.valueType = $valueType'); params.valueType = input.valueType; }

  if (updates.length > 0) {
    await runQuery(`
      MATCH (m:MechanicDefinition {id: $id})
      SET ${updates.join(', ')}
    `, params);
  }

  return { message: 'Mechanic definition updated successfully' };
}

// Helper to delete MechanicDefinition
async function deleteMechanicDefinition(id) {
  await runQuery(`
    MATCH (m:MechanicDefinition {id: $id})
    DETACH DELETE m
  `, { id });
  return { message: 'Mechanic definition deleted successfully' };
}

// Helper to create EntityAdaptation
async function createEntityAdaptation(input) {
  const id = input.id || uuidv4();
  const entityLabel = input.entityType.charAt(0).toUpperCase() + input.entityType.slice(1);

  await runQuery(`
    MATCH (p:Product {id: $productId})
    MATCH (e:${entityLabel} {id: $entityId})
    CREATE (a:EntityAdaptation {
      id: $id,
      displayName: $displayName,
      flavorText: $flavorText,
      attributeValues: $attributeValues,
      mechanicValues: $mechanicValues,
      artDirection: $artDirection,
      role: $role,
      appearance: $appearance
    })
    CREATE (a)-[:FOR_PRODUCT]->(p)
    CREATE (a)-[:ADAPTS]->(e)
  `, {
    productId: input.productId,
    entityId: input.entityId,
    id,
    displayName: input.displayName || '',
    flavorText: input.flavorText || '',
    attributeValues: input.attributeValues || '{}',
    mechanicValues: input.mechanicValues || '{}',
    artDirection: input.artDirection || '',
    role: input.role || '',
    appearance: input.appearance || ''
  });

  return { message: 'Entity adaptation created successfully' };
}

// Helper to update EntityAdaptation
async function updateEntityAdaptation(input) {
  const updates = [];
  const params = { id: input.id };

  if (input.displayName !== undefined) { updates.push('a.displayName = $displayName'); params.displayName = input.displayName; }
  if (input.flavorText !== undefined) { updates.push('a.flavorText = $flavorText'); params.flavorText = input.flavorText; }
  if (input.attributeValues !== undefined) { updates.push('a.attributeValues = $attributeValues'); params.attributeValues = input.attributeValues; }
  if (input.mechanicValues !== undefined) { updates.push('a.mechanicValues = $mechanicValues'); params.mechanicValues = input.mechanicValues; }
  if (input.artDirection !== undefined) { updates.push('a.artDirection = $artDirection'); params.artDirection = input.artDirection; }
  if (input.role !== undefined) { updates.push('a.role = $role'); params.role = input.role; }
  if (input.appearance !== undefined) { updates.push('a.appearance = $appearance'); params.appearance = input.appearance; }

  if (updates.length > 0) {
    await runQuery(`
      MATCH (a:EntityAdaptation {id: $id})
      SET ${updates.join(', ')}
    `, params);
  }

  return { message: 'Entity adaptation updated successfully' };
}

// Helper to delete EntityAdaptation
async function deleteEntityAdaptation(id) {
  await runQuery(`
    MATCH (a:EntityAdaptation {id: $id})
    DETACH DELETE a
  `, { id });
  return { message: 'Entity adaptation deleted successfully' };
}

// Helper to create Section
async function createSection(input) {
  const id = input.id || uuidv4();

  await runQuery(`
    MATCH (p:Product {id: $productId})
    CREATE (s:Section {
      id: $id,
      name: $name,
      description: $description,
      order: $order,
      sectionType: $sectionType
    })
    CREATE (p)-[:CONTAINS]->(s)
  `, {
    productId: input.productId,
    id,
    name: input.name || '',
    description: input.description || '',
    order: input.order || 0,
    sectionType: input.sectionType || ''
  });

  return { message: 'Section created successfully' };
}

// Helper to update Section
async function updateSection(input) {
  const updates = [];
  const params = { id: input.id };

  if (input.name !== undefined) { updates.push('s.name = $name'); params.name = input.name; }
  if (input.description !== undefined) { updates.push('s.description = $description'); params.description = input.description; }
  if (input.order !== undefined) { updates.push('s.order = $order'); params.order = input.order; }
  if (input.sectionType !== undefined) { updates.push('s.sectionType = $sectionType'); params.sectionType = input.sectionType; }

  if (updates.length > 0) {
    await runQuery(`
      MATCH (s:Section {id: $id})
      SET ${updates.join(', ')}
    `, params);
  }

  return { message: 'Section updated successfully' };
}

// Helper to delete Section
async function deleteSection(id) {
  await runQuery(`
    MATCH (s:Section {id: $id})
    DETACH DELETE s
  `, { id });
  return { message: 'Section deleted successfully' };
}

// Helper to get locations for a section
async function getLocationsForSection(sectionId) {
  const result = await runQuery(`
    MATCH (s:Section {id: $sectionId})-[:OCCURS_AT]->(p:Place)
    RETURN properties(p) AS place
  `, { sectionId });

  return result.records.map(r => r.get('place'));
}

// Helper to get participants for a section
async function getParticipantsForSection(sectionId) {
  const result = await runQuery(`
    MATCH (s:Section {id: $sectionId})-[:INVOLVES]->(p)
    RETURN properties(p) AS participant,
           CASE
             WHEN p:Character THEN 'character'
             WHEN p:Item THEN 'item'
             ELSE 'unknown'
           END AS nodeType
  `, { sectionId });

  return result.records.map(r => ({
    ...r.get('participant'),
    _nodeType: r.get('nodeType')
  }));
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
      _nodeType: toLower(labels(e)[0]),
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

  // Narrative-specific: fetch aggregated locations and participants from all events
  if (type === 'Narrative') {
    entity.locations = await getAggregatedLocationsForNarrative(id);
    entity.participants = await getAggregatedParticipantsForNarrative(id);
  }

  // Reverse lookup: fetch events for Place, Character, Item
  if (['Place', 'Character', 'Item'].includes(type)) {
    entity.events = await getEventsForEntity(id, type);
  }

  // Universe-specific: fetch products based on this universe
  if (type === 'Universe') {
    entity.products = await getProductsForUniverse(id);
  }

  // Get adaptations for this entity (cards in products, etc.)
  entity.adaptations = await getAdaptationsForEntity(id);

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
    props.day = input.day || 0;
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
  if (input.day !== undefined) {
    updates.push('e.day = $day');
    params.day = input.day;
  }
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

// ============================================
// User & Account Helpers
// ============================================

// Get user with tier limits (checks for credit reset)
async function getUserWithLimits(userId) {
  if (!userId) return null;

  const result = await runQuery(`
    MATCH (u:User {id: $userId})
    RETURN u
  `, { userId });

  if (result.records.length === 0) return null;

  const user = result.records[0].get('u').properties;

  // Check for credit reset (lazy reset)
  const now = new Date();
  const resetAt = user.creditsResetAt ? new Date(user.creditsResetAt) : null;

  if (resetAt && now >= resetAt) {
    const tierLimits = getTierLimits(user.subscriptionTier);
    const newResetAt = new Date();
    newResetAt.setMonth(newResetAt.getMonth() + 1);

    await runQuery(`
      MATCH (u:User {id: $userId})
      SET u.credits = $monthlyCredits,
          u.creditsResetAt = $newResetAt
      RETURN u
    `, {
      userId,
      monthlyCredits: tierLimits.monthlyCredits,
      newResetAt: newResetAt.toISOString()
    });

    user.credits = tierLimits.monthlyCredits;
    user.creditsResetAt = newResetAt.toISOString();
  }

  // Add limits to user object
  const limits = getTierLimits(user.subscriptionTier);
  return {
    ...user,
    credits: typeof user.credits === 'object' ? user.credits.toNumber() : user.credits,
    entityCount: typeof user.entityCount === 'object' ? user.entityCount.toNumber() : user.entityCount,
    limits: {
      maxEntities: limits.maxEntities === Infinity ? -1 : limits.maxEntities,
      maxUniverses: limits.maxUniverses === Infinity ? -1 : limits.maxUniverses,
      maxProducts: limits.maxProducts === Infinity ? -1 : limits.maxProducts,
      monthlyCredits: limits.monthlyCredits
    }
  };
}

// Get credit transaction history
async function getCreditHistory(userId, limit = 50) {
  const result = await runQuery(`
    MATCH (u:User {id: $userId})-[:HAS_TRANSACTION]->(t:CreditTransaction)
    RETURN t
    ORDER BY t.createdAt DESC
    LIMIT $limit
  `, { userId, limit });

  return result.records.map(r => {
    const t = r.get('t').properties;
    return {
      ...t,
      amount: typeof t.amount === 'object' ? t.amount.toNumber() : t.amount
    };
  });
}

// Record a credit transaction
async function recordCreditTransaction(userId, type, amount, description) {
  const transaction = {
    id: uuidv4(),
    type,
    amount,
    description,
    createdAt: new Date().toISOString()
  };

  await runQuery(`
    MATCH (u:User {id: $userId})
    CREATE (t:CreditTransaction $transaction)
    CREATE (u)-[:HAS_TRANSACTION]->(t)
  `, { userId, transaction });

  return transaction;
}

// Update user credits
async function updateUserCredits(userId, amount, description, type = 'usage') {
  // Get current user
  const user = await getUserWithLimits(userId);
  if (!user) throw new Error('User not found');

  const newCredits = user.credits + amount;
  if (newCredits < 0) throw new Error('Insufficient credits');

  // Update credits
  await runQuery(`
    MATCH (u:User {id: $userId})
    SET u.credits = $newCredits
  `, { userId, newCredits });

  // Record transaction
  await recordCreditTransaction(userId, type, amount, description);

  return { ...user, credits: newCredits };
}

// Ensure user is authenticated
function requireAuth(context) {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
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

    // Product queries
    product: async (_, { obj }) => getProduct(obj.id),
    products: async () => getAllProducts(),

    // Search (optionally filter by universe)
    searchEntities: async (_, { query, type, universeId }) => {
      const typeFilter = type ? `:${type.charAt(0).toUpperCase() + type.slice(1)}` : '';

      let cypher;
      let params = { pattern: `(?i).*${query}.*` };

      if (universeId) {
        // Filter to entities within the specified universe
        cypher = `
          MATCH (u:Universe {id: $universeId})-[:CONTAINS*0..]->(e${typeFilter})
          WHERE e.name =~ $pattern
          WITH DISTINCT e
          RETURN {
            id: e.id,
            properties: properties(e),
            contents: [],
            tags: []
          } AS entity
          LIMIT 20
        `;
        params.universeId = universeId;
      } else {
        cypher = `
          MATCH (e${typeFilter})
          WHERE e.name =~ $pattern
          RETURN {
            id: e.id,
            properties: properties(e),
            contents: [],
            tags: []
          } AS entity
          LIMIT 20
        `;
      }

      const result = await runQuery(cypher, params);
      return result.records.map(r => r.get('entity'));
    },

    // Get all entities in a universe (for @ mentions)
    entitiesInUniverse: async (_, { universeId, excludeId }) => {
      const result = await runQuery(`
        MATCH (u:Universe {id: $universeId})-[:CONTAINS*0..]->(e)
        WHERE e.id <> $excludeId
        WITH DISTINCT e
        RETURN {
          id: e.id,
          _nodeType: toLower(labels(e)[0]),
          properties: properties(e),
          contents: [],
          tags: []
        } AS entity
        ORDER BY e.name
        LIMIT 100
      `, { universeId, excludeId: excludeId || '' });

      return result.records.map(r => r.get('entity'));
    },

    // Get entities with a specific tag (paginated)
    taggedEntities: async (_, { tagId, limit = 10, offset = 0 }) => {
      // Get total count
      const countResult = await runQuery(`
        MATCH (entity)-[:TAGGED]->(tag:Tag {id: $tagId})
        RETURN count(DISTINCT entity) as total
      `, { tagId });
      const totalRaw = countResult.records[0]?.get('total');
      const total = typeof totalRaw === 'object' ? totalRaw.toNumber() : (totalRaw || 0);

      // Get paginated entities
      const result = await runQuery(`
        MATCH (entity)-[:TAGGED]->(tag:Tag {id: $tagId})
        WITH DISTINCT entity
        RETURN {
          id: entity.id,
          _nodeType: toLower(labels(entity)[0]),
          properties: properties(entity),
          contents: [],
          tags: []
        } AS entityData
        ORDER BY entityData.properties.name
        SKIP $offset
        LIMIT $limit
      `, { tagId, offset: neo4j.int(offset), limit: neo4j.int(limit) });

      const entities = result.records.map(r => r.get('entityData'));

      return {
        entities,
        total,
        hasMore: offset + entities.length < total
      };
    },

    // User/Account queries
    me: async (_, __, context) => {
      if (!context.user) return null;
      return getUserWithLimits(context.user.id);
    },

    creditHistory: async (_, { limit }, context) => {
      const user = requireAuth(context);
      return getCreditHistory(user.id, limit || 50);
    },

    creditPackages: () => {
      return CREDIT_PACKAGES.map(pkg => ({
        ...pkg,
        displayPrice: formatPrice(pkg.price)
      }));
    },

    subscriptionTiers: () => {
      return Object.entries(SUBSCRIPTION_TIERS).map(([id, tier]) => ({
        id,
        name: tier.name,
        price: tier.price,
        displayPrice: formatPrice(tier.price),
        limits: {
          maxEntities: tier.limits.maxEntities === Infinity ? -1 : tier.limits.maxEntities,
          maxUniverses: tier.limits.maxUniverses === Infinity ? -1 : tier.limits.maxUniverses,
          maxProducts: tier.limits.maxProducts === Infinity ? -1 : tier.limits.maxProducts,
          monthlyCredits: tier.limits.monthlyCredits
        }
      }));
    },

    billingHistory: async (_, { limit = 10, cursor }, context) => {
      const user = requireAuth(context);

      if (!stripe) {
        return { items: [], hasMore: false, nextCursor: null };
      }

      // Get user's Stripe customer ID
      const result = await runQuery(`
        MATCH (u:User {id: $userId})
        RETURN u.stripeCustomerId as customerId
      `, { userId: user.id });

      const customerId = result.records[0]?.get('customerId');
      if (!customerId) {
        return { items: [], hasMore: false, nextCursor: null };
      }

      // Fetch charges from Stripe (includes both subscriptions and one-time payments)
      const chargeParams = {
        customer: customerId,
        limit: limit + 1, // Fetch one extra to check if there are more
      };

      if (cursor) {
        chargeParams.starting_after = cursor;
      }

      const charges = await stripe.charges.list(chargeParams);

      // Only show charges with our metadata (tier for subscriptions, creditAmount for credits)
      const filteredCharges = charges.data.filter(charge =>
        charge.metadata?.tier || charge.metadata?.creditAmount
      );

      // Check if there are more results
      const hasMore = filteredCharges.length > limit;
      const items = filteredCharges.slice(0, limit);

      return {
        items: items.map(charge => {
          // Build description from metadata or fallback to charge description
          let description = charge.description || 'Payment';
          if (charge.metadata?.creditAmount) {
            description = `${charge.metadata.creditAmount} Credits`;
          } else if (charge.metadata?.tier) {
            const tierName = charge.metadata.tier.charAt(0).toUpperCase() + charge.metadata.tier.slice(1);
            description = `${tierName} Subscription`;
          }

          return {
            id: charge.id,
            date: new Date(charge.created * 1000).toISOString(),
            description,
            amount: charge.amount || 0,
            status: charge.status === 'succeeded' ? 'paid' : charge.status,
            invoiceUrl: charge.receipt_url || null
          };
        }),
        hasMore,
        nextCursor: hasMore ? items[items.length - 1]?.id : null
      };
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

    // Additive relationship: CONTAINS (adds without removing existing)
    addContains: async (_, { relation }) => {
      if (relation.childIds && relation.childIds.length > 0) {
        await runQuery(`
          MATCH (parent {id: $id})
          UNWIND $childIds AS childId
          MATCH (child {id: childId})
          MERGE (parent)-[:CONTAINS]->(child)
        `, { id: relation.id, childIds: relation.childIds });
      }

      return { message: 'Contains relationship added' };
    },

    // Additive relationship: INVOLVES (adds without removing existing)
    addInvolves: async (_, { relation }) => {
      if (relation.characterIds && relation.characterIds.length > 0) {
        await runQuery(`
          MATCH (e:Event {id: $eventId})
          UNWIND $characterIds AS charId
          MATCH (c:Character {id: charId})
          MERGE (e)-[:INVOLVES]->(c)
        `, { eventId: relation.eventId, characterIds: relation.characterIds });
      }

      if (relation.itemIds && relation.itemIds.length > 0) {
        await runQuery(`
          MATCH (e:Event {id: $eventId})
          UNWIND $itemIds AS itemId
          MATCH (i:Item {id: itemId})
          MERGE (e)-[:INVOLVES]->(i)
        `, { eventId: relation.eventId, itemIds: relation.itemIds });
      }

      return { message: 'Involves relationship added' };
    },

    // Additive relationship: OCCURS_AT (adds without removing existing)
    addOccursAt: async (_, { relation }) => {
      if (relation.placeIds && relation.placeIds.length > 0) {
        await runQuery(`
          MATCH (e:Event {id: $eventId})
          UNWIND $placeIds AS placeId
          MATCH (p:Place {id: placeId})
          MERGE (e)-[:OCCURS_AT]->(p)
        `, { eventId: relation.eventId, placeIds: relation.placeIds });
      }

      return { message: 'Occurs at relationship added' };
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
    },

    // ============================================
    // Product System Mutations
    // ============================================

    // Product mutations
    addProduct: async (_, { product }) => createProduct(product),
    editProduct: async (_, { product }) => updateProduct(product),
    removeProduct: async (_, { product }) => deleteProduct(product.id),

    // AttributeDefinition mutations
    addAttributeDefinition: async (_, { attr }) => createAttributeDefinition(attr),
    editAttributeDefinition: async (_, { attr }) => updateAttributeDefinition(attr),
    removeAttributeDefinition: async (_, { attr }) => deleteAttributeDefinition(attr.id),

    // MechanicDefinition mutations
    addMechanicDefinition: async (_, { mechanic }) => createMechanicDefinition(mechanic),
    editMechanicDefinition: async (_, { mechanic }) => updateMechanicDefinition(mechanic),
    removeMechanicDefinition: async (_, { mechanic }) => deleteMechanicDefinition(mechanic.id),

    // EntityAdaptation mutations
    addEntityAdaptation: async (_, { adaptation }) => createEntityAdaptation(adaptation),
    editEntityAdaptation: async (_, { adaptation }) => updateEntityAdaptation(adaptation),
    removeEntityAdaptation: async (_, { adaptation }) => deleteEntityAdaptation(adaptation.id),

    // Section mutations
    addSection: async (_, { section }) => createSection(section),
    editSection: async (_, { section }) => updateSection(section),
    removeSection: async (_, { section }) => deleteSection(section.id),

    // Section relationship: OCCURS_AT and INVOLVES (like Events)
    relateSectionEntities: async (_, { relation }) => {
      const sectionId = relation.sectionId;

      // Remove existing relationships
      await runQuery(`
        MATCH (s:Section {id: $sectionId})-[r:OCCURS_AT|INVOLVES]->()
        DELETE r
      `, { sectionId });

      // Create place relationships
      if (relation.placeIds && relation.placeIds.length > 0) {
        await runQuery(`
          MATCH (s:Section {id: $sectionId})
          UNWIND $placeIds AS placeId
          MATCH (p:Place {id: placeId})
          CREATE (s)-[:OCCURS_AT]->(p)
        `, { sectionId, placeIds: relation.placeIds });
      }

      // Create character relationships
      if (relation.characterIds && relation.characterIds.length > 0) {
        await runQuery(`
          MATCH (s:Section {id: $sectionId})
          UNWIND $characterIds AS charId
          MATCH (c:Character {id: charId})
          CREATE (s)-[:INVOLVES]->(c)
        `, { sectionId, characterIds: relation.characterIds });
      }

      // Create item relationships
      if (relation.itemIds && relation.itemIds.length > 0) {
        await runQuery(`
          MATCH (s:Section {id: $sectionId})
          UNWIND $itemIds AS itemId
          MATCH (i:Item {id: itemId})
          CREATE (s)-[:INVOLVES]->(i)
        `, { sectionId, itemIds: relation.itemIds });
      }

      return { message: 'Section entity relationships updated' };
    },

    // User/Account mutations
    updateProfile: async (_, { displayName }, context) => {
      const user = requireAuth(context);

      await runQuery(`
        MATCH (u:User {id: $userId})
        SET u.displayName = $displayName
      `, { userId: user.id, displayName });

      return getUserWithLimits(user.id);
    },

    createSubscriptionCheckout: async (_, { tier }, context) => {
      const user = requireAuth(context);

      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      const tierConfig = SUBSCRIPTION_TIERS[tier];
      if (!tierConfig || !tierConfig.stripePriceId) {
        throw new Error('Invalid subscription tier');
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
        });
        customerId = customer.id;

        await runQuery(`
          MATCH (u:User {id: $userId})
          SET u.stripeCustomerId = $customerId
        `, { userId: user.id, customerId });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{
          price: tierConfig.stripePriceId,
          quantity: 1
        }],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/account?success=subscription`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/account?canceled=true`,
        metadata: {
          userId: user.id,
          tier
        }
      });

      return { url: session.url };
    },

    cancelSubscription: async (_, __, context) => {
      const user = requireAuth(context);

      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      if (!user.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      // Cancel at period end
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await runQuery(`
        MATCH (u:User {id: $userId})
        SET u.subscriptionStatus = 'canceled'
      `, { userId: user.id });

      return getUserWithLimits(user.id);
    },

    purchaseCredits: async (_, { packageId }, context) => {
      const user = requireAuth(context);

      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      const creditPkg = getCreditPackage(packageId);
      if (!creditPkg) {
        throw new Error('Invalid credit package');
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
        });
        customerId = customer.id;

        await runQuery(`
          MATCH (u:User {id: $userId})
          SET u.stripeCustomerId = $customerId
        `, { userId: user.id, customerId });
      }

      // Create checkout session for one-time purchase
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{
          price: creditPkg.stripePriceId,
          quantity: 1
        }],
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/account?success=credits`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/account?canceled=true`,
        metadata: {
          userId: user.id,
          packageId,
          creditAmount: creditPkg.amount
        }
      });

      return { url: session.url };
    },

    useCredits: async (_, { amount, description }, context) => {
      const user = requireAuth(context);

      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      return updateUserCredits(user.id, -amount, description, 'usage');
    },

    // Stripe Elements: Create subscription with embedded checkout
    createSubscription: async (_, { tier }, context) => {
      const user = requireAuth(context);

      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      const tierConfig = SUBSCRIPTION_TIERS[tier];
      if (!tierConfig || !tierConfig.stripePriceId) {
        throw new Error('Invalid subscription tier');
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
        });
        customerId = customer.id;

        await runQuery(`
          MATCH (u:User {id: $userId})
          SET u.stripeCustomerId = $customerId
        `, { userId: user.id, customerId });
      }

      // Cancel any existing active subscription first
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });

      if (existingSubscriptions.data.length > 0) {
        await stripe.subscriptions.cancel(existingSubscriptions.data[0].id);
      }

      // Also cancel any incomplete subscriptions
      const incompleteSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'incomplete',
        limit: 10
      });

      for (const sub of incompleteSubscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
      }

      // Get the price to determine amount
      const price = await stripe.prices.retrieve(tierConfig.stripePriceId);
      const amount = price.unit_amount;

      // Create a PaymentIntent directly (like credits flow) for the subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        customer: customerId,
        setup_future_usage: 'off_session', // Save payment method for future billing
        metadata: {
          userId: user.id,
          tier,
          type: 'subscription'
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        subscriptionId: null, // Will create subscription after payment succeeds
        status: 'requires_payment'
      };
    },

    // Confirm subscription after payment succeeds
    confirmSubscription: async (_, { paymentIntentId, tier }, context) => {
      const user = requireAuth(context);
      console.time('confirmSubscription:total');

      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      // Verify the payment intent succeeded
      console.time('confirmSubscription:retrievePI');
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.timeEnd('confirmSubscription:retrievePI');
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not completed');
      }

      // Verify this payment belongs to this user
      if (paymentIntent.metadata?.userId !== user.id) {
        throw new Error('Payment does not belong to this user');
      }

      const tierConfig = SUBSCRIPTION_TIERS[tier];
      if (!tierConfig || !tierConfig.stripePriceId) {
        throw new Error('Invalid subscription tier');
      }

      // Create the subscription with the saved payment method
      console.time('confirmSubscription:createSub');
      const subscription = await stripe.subscriptions.create({
        customer: paymentIntent.customer,
        items: [{ price: tierConfig.stripePriceId }],
        default_payment_method: paymentIntent.payment_method,
        metadata: { userId: user.id, tier }
      });
      console.timeEnd('confirmSubscription:createSub');

      // Update user's subscription info
      console.time('confirmSubscription:neo4j');
      await runQuery(`
        MATCH (u:User {id: $userId})
        SET u.subscriptionTier = $tier,
            u.subscriptionStatus = 'active',
            u.stripeSubscriptionId = $subscriptionId
      `, { userId: user.id, tier, subscriptionId: subscription.id });
      console.timeEnd('confirmSubscription:neo4j');

      console.time('confirmSubscription:getUserWithLimits');
      const result = await getUserWithLimits(user.id);
      console.timeEnd('confirmSubscription:getUserWithLimits');
      console.timeEnd('confirmSubscription:total');
      return result;
    },

    // Stripe Elements: Create payment intent for credit purchase
    createCreditPaymentIntent: async (_, { packageId }, context) => {
      const user = requireAuth(context);

      if (!stripe) {
        throw new Error('Stripe is not configured');
      }

      const creditPkg = getCreditPackage(packageId);
      if (!creditPkg) {
        throw new Error('Invalid credit package');
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id }
        });
        customerId = customer.id;

        await runQuery(`
          MATCH (u:User {id: $userId})
          SET u.stripeCustomerId = $customerId
        `, { userId: user.id, customerId });
      }

      // Create PaymentIntent for one-time credit purchase
      const paymentIntent = await stripe.paymentIntents.create({
        amount: creditPkg.price,
        currency: 'usd',
        customer: customerId,
        metadata: {
          userId: user.id,
          packageId,
          creditAmount: creditPkg.amount.toString()
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    }
  },

  // Entity field resolvers
  Entity: {
    universeId: async (entity) => {
      // If the entity is a Universe, return its own ID
      if (entity.id && entity._nodeType === 'universe') {
        return entity.id;
      }

      // Otherwise, traverse up the CONTAINS chain to find the universe
      const universe = await getUniverseForEntity(entity.id);
      return universe?.id || null;
    }
  }
};
