/**
 * Context Assembler Service
 *
 * Gathers relevant context from Neo4j for AI generation prompts.
 * Assembles entity hierarchies, relationships, tags, and sibling entities
 * to provide rich context for the generation layer.
 */

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

/**
 * Get entity with its full parent chain up to the universe
 * @param {string} entityId - The entity ID
 * @returns {Object} Entity with parentChain and universe
 */
export async function getEntityWithAncestors(entityId) {
  const result = await runQuery(`
    MATCH (e {id: $entityId})

    // Get the path from universe to this entity
    OPTIONAL MATCH path = (u:Universe)-[:CONTAINS*0..]->(e)
    WHERE u IS NOT NULL

    WITH e, u, path,
         [node IN nodes(path) | {
           id: node.id,
           name: node.name,
           description: node.description,
           type: node.type,
           _nodeType: toLower(labels(node)[0])
         }] AS pathNodes

    RETURN {
      entity: {
        id: e.id,
        name: e.name,
        description: e.description,
        type: e.type,
        _nodeType: toLower(labels(e)[0])
      },
      universe: CASE WHEN u IS NOT NULL THEN {
        id: u.id,
        name: u.name,
        description: u.description,
        type: u.type
      } ELSE NULL END,
      parentChain: pathNodes
    } AS result
  `, { entityId });

  if (result.records.length === 0) return null;
  return result.records[0].get('result');
}

/**
 * Get sibling entities (same parent, same type)
 * @param {string} entityId - The entity ID
 * @param {string} targetType - Optional: filter to specific type
 * @returns {Array} Sibling entities
 */
export async function getSiblingEntities(entityId, targetType = null) {
  const typeFilter = targetType
    ? `AND toLower(labels(sibling)[0]) = $targetType`
    : '';

  const result = await runQuery(`
    MATCH (parent)-[:CONTAINS]->(e {id: $entityId})
    MATCH (parent)-[:CONTAINS]->(sibling)
    WHERE sibling.id <> $entityId ${typeFilter}

    RETURN {
      id: sibling.id,
      name: sibling.name,
      description: sibling.description,
      type: sibling.type,
      _nodeType: toLower(labels(sibling)[0])
    } AS sibling
    ORDER BY sibling.name
    LIMIT 20
  `, { entityId, targetType: targetType?.toLowerCase() });

  return result.records.map(r => r.get('sibling'));
}

/**
 * Get all tags in a universe with entity counts
 * @param {string} universeId - The universe ID
 * @returns {Array} Tags with entity counts
 */
export async function getUniverseTags(universeId) {
  const result = await runQuery(`
    // Get all entities in the universe
    MATCH (u:Universe {id: $universeId})-[:CONTAINS*0..]->(e)

    // Find tags used by these entities
    MATCH (e)-[:TAGGED]->(t:Tag)

    WITH t, count(DISTINCT e) AS entityCount

    RETURN {
      id: t.id,
      name: t.name,
      description: t.description,
      type: t.type,
      entityCount: entityCount
    } AS tag
    ORDER BY entityCount DESC, t.name
  `, { universeId });

  return result.records.map(r => {
    const tag = r.get('tag');
    return {
      ...tag,
      entityCount: typeof tag.entityCount === 'object'
        ? tag.entityCount.toNumber()
        : tag.entityCount
    };
  });
}

/**
 * Get entity's tags
 * @param {string} entityId - The entity ID
 * @returns {Array} Tags applied to this entity
 */
export async function getEntityTags(entityId) {
  const result = await runQuery(`
    MATCH (e {id: $entityId})-[:TAGGED]->(t:Tag)
    RETURN {
      id: t.id,
      name: t.name,
      description: t.description
    } AS tag
    ORDER BY t.name
  `, { entityId });

  return result.records.map(r => r.get('tag'));
}

/**
 * Get entities related via INVOLVES (for events)
 * @param {string} entityId - The entity ID
 * @returns {Array} Related entities via INVOLVES
 */
export async function getInvolvedEntities(entityId) {
  const result = await runQuery(`
    // Check if this is an event with participants
    OPTIONAL MATCH (e:Event {id: $entityId})-[:INVOLVES]->(participant)
    WITH collect({
      id: participant.id,
      name: participant.name,
      description: participant.description,
      type: participant.type,
      _nodeType: toLower(labels(participant)[0])
    }) AS participants

    // Also check if this entity is involved in events
    OPTIONAL MATCH (event:Event)-[:INVOLVES]->(target {id: $entityId})
    WITH participants, collect({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      _nodeType: 'event'
    }) AS events

    RETURN {
      participants: [p IN participants WHERE p.id IS NOT NULL],
      events: [e IN events WHERE e.id IS NOT NULL]
    } AS result
  `, { entityId });

  if (result.records.length === 0) return { participants: [], events: [] };
  return result.records[0].get('result');
}

/**
 * Get children of an entity
 * @param {string} entityId - The entity ID
 * @param {string} targetType - Optional: filter to specific type
 * @returns {Array} Child entities
 */
export async function getChildEntities(entityId, targetType = null) {
  const typeFilter = targetType
    ? `WHERE toLower(labels(child)[0]) = $targetType`
    : '';

  const result = await runQuery(`
    MATCH (parent {id: $entityId})-[:CONTAINS]->(child)
    ${typeFilter}
    RETURN {
      id: child.id,
      name: child.name,
      description: child.description,
      type: child.type,
      _nodeType: toLower(labels(child)[0])
    } AS child
    ORDER BY child.name
    LIMIT 50
  `, { entityId, targetType: targetType?.toLowerCase() });

  return result.records.map(r => r.get('child'));
}

/**
 * Get suggested context entities based on relationships
 * @param {string} entityId - The entity ID
 * @param {string} universeId - The universe ID
 * @returns {Array} Suggested entities for context
 */
export async function getSuggestedContext(entityId, universeId) {
  const result = await runQuery(`
    MATCH (source {id: $entityId})

    // Get siblings (same parent)
    OPTIONAL MATCH (parent)-[:CONTAINS]->(source)
    OPTIONAL MATCH (parent)-[:CONTAINS]->(sibling)
    WHERE sibling.id <> $entityId
    WITH source, collect(DISTINCT sibling)[0..3] AS siblings

    // Get entities with same tags
    OPTIONAL MATCH (source)-[:TAGGED]->(tag:Tag)<-[:TAGGED]-(sameTag)
    WHERE sameTag.id <> $entityId
    WITH source, siblings, collect(DISTINCT sameTag)[0..3] AS sameTagEntities

    // Get related via events
    OPTIONAL MATCH (source)<-[:INVOLVES]-(event:Event)-[:INVOLVES]->(coParticipant)
    WHERE coParticipant.id <> $entityId
    WITH source, siblings, sameTagEntities, collect(DISTINCT coParticipant)[0..2] AS coParticipants

    // Combine all suggestions, filtering out nulls
    WITH [x IN siblings + sameTagEntities + coParticipants WHERE x IS NOT NULL] AS allSuggested
    UNWIND allSuggested AS suggested

    RETURN DISTINCT {
      id: suggested.id,
      name: suggested.name,
      description: suggested.description,
      type: suggested.type,
      _nodeType: toLower(labels(suggested)[0])
    } AS suggestion
    LIMIT 10
  `, { entityId, universeId });

  return result.records.map(r => r.get('suggestion'));
}

/**
 * Assemble full context for a generation request
 * @param {Object} params - Context parameters
 * @param {string} params.sourceEntityId - The source entity ID
 * @param {string} params.targetType - Type of entity to generate
 * @param {Array<string>} params.includeEntityIds - Additional entity IDs to include
 * @returns {Object} Full generation context
 */
export async function assembleEntityContext(params) {
  const { sourceEntityId, targetType, includeEntityIds = [] } = params;

  // Get source entity with ancestors
  const entityData = await getEntityWithAncestors(sourceEntityId);
  if (!entityData) {
    throw new Error(`Entity not found: ${sourceEntityId}`);
  }

  const { entity, universe, parentChain } = entityData;
  const universeId = universe?.id;

  // Gather context in parallel
  const [siblings, tags, entityTags, children, involved, suggested] = await Promise.all([
    getSiblingEntities(sourceEntityId, targetType),
    universeId ? getUniverseTags(universeId) : [],
    getEntityTags(sourceEntityId),
    getChildEntities(sourceEntityId, targetType),
    getInvolvedEntities(sourceEntityId),
    universeId ? getSuggestedContext(sourceEntityId, universeId) : []
  ]);

  // Fetch additional entities if specified
  let additionalContext = [];
  if (includeEntityIds.length > 0) {
    const additionalResult = await runQuery(`
      UNWIND $entityIds AS eid
      MATCH (e {id: eid})
      RETURN {
        id: e.id,
        name: e.name,
        description: e.description,
        type: e.type,
        _nodeType: toLower(labels(e)[0])
      } AS entity
    `, { entityIds: includeEntityIds });
    additionalContext = additionalResult.records.map(r => r.get('entity'));
  }

  return {
    sourceEntity: {
      ...entity,
      tags: entityTags
    },
    parentChain: parentChain || [],
    universe: universe || null,
    siblingEntities: siblings,
    childEntities: children,
    involvedEntities: involved,
    availableTags: tags,
    suggestedContext: suggested,
    additionalContext,
    // Summary for UI display
    summary: {
      entityCount: parentChain.length + siblings.length + children.length + additionalContext.length,
      tagCount: tags.length,
      hasInvolvements: involved.participants.length > 0 || involved.events.length > 0
    }
  };
}

/**
 * Assemble universe-level context
 * @param {string} universeId - The universe ID
 * @returns {Object} Universe context
 */
export async function assembleUniverseContext(universeId) {
  const result = await runQuery(`
    MATCH (u:Universe {id: $universeId})

    // Count entities by type
    OPTIONAL MATCH (u)-[:CONTAINS*1..]->(place:Place)
    WITH u, count(DISTINCT place) AS placeCount

    OPTIONAL MATCH (u)-[:CONTAINS*1..]->(char:Character)
    WITH u, placeCount, count(DISTINCT char) AS characterCount

    OPTIONAL MATCH (u)-[:CONTAINS*1..]->(item:Item)
    WITH u, placeCount, characterCount, count(DISTINCT item) AS itemCount

    OPTIONAL MATCH (u)-[:CONTAINS*1..]->(event:Event)
    WITH u, placeCount, characterCount, itemCount, count(DISTINCT event) AS eventCount

    OPTIONAL MATCH (u)-[:CONTAINS*1..]->(narrative:Narrative)
    WITH u, placeCount, characterCount, itemCount, eventCount, count(DISTINCT narrative) AS narrativeCount

    RETURN {
      universe: {
        id: u.id,
        name: u.name,
        description: u.description,
        type: u.type
      },
      entityCounts: {
        places: placeCount,
        characters: characterCount,
        items: itemCount,
        events: eventCount,
        narratives: narrativeCount
      }
    } AS result
  `, { universeId });

  if (result.records.length === 0) return null;

  const data = result.records[0].get('result');

  // Get tags for the universe
  const tags = await getUniverseTags(universeId);

  // Convert Neo4j integers
  const entityCounts = {};
  for (const [key, value] of Object.entries(data.entityCounts)) {
    entityCounts[key] = typeof value === 'object' ? value.toNumber() : value;
  }

  return {
    universe: data.universe,
    entityCounts,
    tags,
    totalEntities: Object.values(entityCounts).reduce((a, b) => a + b, 0)
  };
}

/**
 * Build a formatted context string for prompts
 * This will be used by the agent layer when constructing prompts
 * @param {Object} context - The assembled context
 * @param {Object} constraints - Generation constraints
 * @returns {string} Formatted context string
 */
export function buildPromptContext(context, constraints = {}) {
  const { sourceEntity, parentChain, universe, siblingEntities, availableTags, additionalContext } = context;
  const { tagIds = [], tone = {}, creativity = 0.5 } = constraints;

  const lines = [];

  // Universe context
  if (universe) {
    lines.push(`## Universe: ${universe.name}`);
    if (universe.description) {
      lines.push(universe.description);
    }
    lines.push('');
  }

  // Hierarchy context
  if (parentChain.length > 1) {
    const path = parentChain.map(n => n.name).join(' > ');
    lines.push(`## Location in World: ${path}`);
    lines.push('');
  }

  // Source entity
  lines.push(`## Source Entity: ${sourceEntity.name} (${sourceEntity._nodeType})`);
  if (sourceEntity.description) {
    lines.push(sourceEntity.description);
  }
  if (sourceEntity.tags?.length > 0) {
    lines.push(`Tags: ${sourceEntity.tags.map(t => t.name).join(', ')}`);
  }
  lines.push('');

  // Sibling entities (for reference/consistency)
  if (siblingEntities.length > 0) {
    lines.push(`## Existing ${siblingEntities[0]._nodeType}s in this location:`);
    for (const sib of siblingEntities.slice(0, 5)) {
      lines.push(`- ${sib.name}: ${sib.description?.slice(0, 100) || 'No description'}...`);
    }
    lines.push('');
  }

  // Additional context entities
  if (additionalContext.length > 0) {
    lines.push('## Additional Context:');
    for (const entity of additionalContext) {
      lines.push(`### ${entity.name} (${entity._nodeType})`);
      if (entity.description) {
        lines.push(entity.description);
      }
    }
    lines.push('');
  }

  // Active tag constraints
  if (tagIds.length > 0) {
    const activeTags = availableTags.filter(t => tagIds.includes(t.id));
    if (activeTags.length > 0) {
      lines.push('## Style/Tone Tags:');
      for (const tag of activeTags) {
        lines.push(`- ${tag.name}: ${tag.description || 'No description'}`);
      }
      lines.push('');
    }
  }

  // Tone settings
  if (tone.formality !== undefined || tone.mood !== undefined) {
    lines.push('## Tone Settings:');
    if (tone.formality !== undefined) {
      const formalityLabel = tone.formality < 0.3 ? 'Casual/Conversational'
        : tone.formality > 0.7 ? 'Formal/Literary'
          : 'Balanced';
      lines.push(`- Formality: ${formalityLabel}`);
    }
    if (tone.mood !== undefined) {
      const moodLabel = tone.mood < 0.3 ? 'Light/Optimistic'
        : tone.mood > 0.7 ? 'Dark/Serious'
          : 'Neutral';
      lines.push(`- Mood: ${moodLabel}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
