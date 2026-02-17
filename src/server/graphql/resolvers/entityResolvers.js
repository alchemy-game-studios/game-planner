/**
 * entityResolvers.js
 * Neo4j-backed CRUD resolvers for all CanonKiln entity types.
 * Entities: Place, Character, Item, Event, Faction
 * Labels in Neo4j mirror entity types (e.g. (:Place), (:Character))
 */

import { runQuery, toInt } from '../neo4j-driver.js';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';

// ─── Shared Helpers ───────────────────────────────────────────────────────────

/**
 * Map a Neo4j node to its GQL shape.
 * We spread node.properties and coerce the id.
 */
const nodeToEntity = (node) => {
  const props = node.properties;
  return {
    ...props,
    notableFeatures: props.notableFeatures || [],
    allegiances: props.allegiances || [],
    traits: props.traits || [],
    powers: props.powers || [],
    consequences: props.consequences || [],
    goals: props.goals || [],
    timelineOrder: props.timelineOrder ? toInt(props.timelineOrder) : null,
    entityType: props.entityType,
    relationships: [], // resolved by field resolver
  };
};

const requireProjectId = (projectId) => {
  if (!projectId) {
    throw new GraphQLError('projectId is required', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
};

// ─── Generic entity fetch by label ───────────────────────────────────────────

const fetchEntitiesByType = async (projectId, label) => {
  requireProjectId(projectId);
  const records = await runQuery(
    `MATCH (e:${label} {projectId: $projectId}) RETURN e ORDER BY e.name`,
    { projectId }
  );
  return records.map((r) => nodeToEntity(r.get('e')));
};

const fetchEntityById = async (id, label) => {
  const records = await runQuery(
    `MATCH (e:${label} {id: $id}) RETURN e`,
    { id }
  );
  if (!records.length) return null;
  return nodeToEntity(records[0].get('e'));
};

// ─── Create helpers ───────────────────────────────────────────────────────────

const createEntity = async (label, entityType, input) => {
  const id = uuidv4();
  const now = new Date().toISOString();
  const props = {
    id,
    entityType,
    createdAt: now,
    updatedAt: now,
    ...input,
    // ensure array fields are always arrays
    notableFeatures: input.notableFeatures || [],
    allegiances: input.allegiances || [],
    traits: input.traits || [],
    powers: input.powers || [],
    consequences: input.consequences || [],
    goals: input.goals || [],
  };

  const records = await runQuery(
    `CREATE (e:${label}:CanonEntity $props) RETURN e`,
    { props }
  );
  return nodeToEntity(records[0].get('e'));
};

const updateEntity = async (label, id, input) => {
  // Build dynamic SET clause from non-null inputs
  const setClause = Object.keys(input)
    .map((k) => `e.${k} = $${k}`)
    .join(', ');

  if (!setClause) {
    throw new GraphQLError('No fields to update', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const records = await runQuery(
    `MATCH (e:${label} {id: $id}) SET ${setClause}, e.updatedAt = $updatedAt RETURN e`,
    { id, updatedAt: new Date().toISOString(), ...input }
  );

  if (!records.length) {
    throw new GraphQLError(`${label} not found`, {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  return nodeToEntity(records[0].get('e'));
};

// ─── Relationship field resolver ──────────────────────────────────────────────

const resolveEntityRelationships = async (entity) => {
  const records = await runQuery(
    `MATCH (from {id: $id})-[r:RELATES_TO]->(to)
     RETURN r.id AS rid, r.label AS label, r.projectId AS projectId,
            r.createdAt AS createdAt,
            from.id AS fromId, from.name AS fromName, from.entityType AS fromType,
            to.id AS toId, to.name AS toName, to.entityType AS toType
     UNION
     MATCH (from)-[r:RELATES_TO]->(to {id: $id})
     RETURN r.id AS rid, r.label AS label, r.projectId AS projectId,
            r.createdAt AS createdAt,
            from.id AS fromId, from.name AS fromName, from.entityType AS fromType,
            to.id AS toId, to.name AS toName, to.entityType AS toType`,
    { id: entity.id }
  );

  return records.map((r) => ({
    id: r.get('rid'),
    fromId: r.get('fromId'),
    toId: r.get('toId'),
    fromName: r.get('fromName'),
    toName: r.get('toName'),
    fromType: r.get('fromType'),
    toType: r.get('toType'),
    label: r.get('label'),
    projectId: r.get('projectId'),
    createdAt: r.get('createdAt'),
  }));
};

// ─── Exported Resolvers ───────────────────────────────────────────────────────

const entityResolvers = {
  Query: {
    // Generic — returns all entity types for a project
    entities: async (_, { projectId, entityType }) => {
      requireProjectId(projectId);
      let cypher = `MATCH (e:CanonEntity {projectId: $projectId})`;
      const params = { projectId };

      if (entityType) {
        cypher += ` WHERE e.entityType = $entityType`;
        params.entityType = entityType;
      }

      cypher += ` RETURN e ORDER BY e.entityType, e.name`;
      const records = await runQuery(cypher, params);
      return records.map((r) => nodeToEntity(r.get('e')));
    },

    entity: async (_, { id }) => {
      const records = await runQuery(
        `MATCH (e:CanonEntity {id: $id}) RETURN e`,
        { id }
      );
      if (!records.length) return null;
      return nodeToEntity(records[0].get('e'));
    },

    places: async (_, { projectId }) => fetchEntitiesByType(projectId, 'Place'),
    characters: async (_, { projectId }) => fetchEntitiesByType(projectId, 'Character'),
    items: async (_, { projectId }) => fetchEntitiesByType(projectId, 'Item'),
    events: async (_, { projectId }) => fetchEntitiesByType(projectId, 'Event'),
    factions: async (_, { projectId }) => fetchEntitiesByType(projectId, 'Faction'),

    relationships: async (_, { projectId }) => {
      requireProjectId(projectId);
      const records = await runQuery(
        `MATCH (from)-[r:RELATES_TO {projectId: $projectId}]->(to)
         RETURN r.id AS rid, r.label AS label, r.projectId AS projectId,
                r.createdAt AS createdAt,
                from.id AS fromId, from.name AS fromName, from.entityType AS fromType,
                to.id AS toId, to.name AS toName, to.entityType AS toType`,
        { projectId }
      );
      return records.map((r) => ({
        id: r.get('rid'),
        fromId: r.get('fromId'),
        toId: r.get('toId'),
        fromName: r.get('fromName'),
        toName: r.get('toName'),
        fromType: r.get('fromType'),
        toType: r.get('toType'),
        label: r.get('label'),
        projectId: r.get('projectId'),
        createdAt: r.get('createdAt'),
      }));
    },

    relationshipsForEntity: async (_, { entityId }) => {
      return resolveEntityRelationships({ id: entityId });
    },

    // Optimized graph query — single Cypher call returns nodes + edges
    canonGraph: async (_, { projectId }) => {
      requireProjectId(projectId);

      const nodeRecords = await runQuery(
        `MATCH (e:CanonEntity {projectId: $projectId}) RETURN e`,
        { projectId }
      );

      const edgeRecords = await runQuery(
        `MATCH (from:CanonEntity {projectId: $projectId})-[r:RELATES_TO]->(to:CanonEntity {projectId: $projectId})
         RETURN r.id AS rid, r.label AS label,
                from.id AS fromId, to.id AS toId`,
        { projectId }
      );

      const nodes = nodeRecords.map((r) => {
        const e = r.get('e').properties;
        return {
          id: e.id,
          name: e.name,
          entityType: e.entityType,
          description: e.description || '',
          x: e.x || null,
          y: e.y || null,
        };
      });

      const edges = edgeRecords.map((r) => ({
        id: r.get('rid'),
        source: r.get('fromId'),
        target: r.get('toId'),
        label: r.get('label'),
      }));

      return {
        projectId,
        nodes,
        edges,
        entityCount: nodes.length,
        relationshipCount: edges.length,
      };
    },
  },

  Mutation: {
    // ── Places ──
    createPlace: async (_, { input }) => {
      return createEntity('Place', 'PLACE', input);
    },
    updatePlace: async (_, { id, input }) => updateEntity('Place', id, input),

    // ── Characters ──
    createCharacter: async (_, { input }) => {
      return createEntity('Character', 'CHARACTER', input);
    },
    updateCharacter: async (_, { id, input }) => updateEntity('Character', id, input),

    // ── Items ──
    createItem: async (_, { input }) => {
      return createEntity('Item', 'ITEM', input);
    },
    updateItem: async (_, { id, input }) => updateEntity('Item', id, input),

    // ── Events ──
    createEvent: async (_, { input }) => {
      return createEntity('Event', 'EVENT', input);
    },
    updateEvent: async (_, { id, input }) => updateEntity('Event', id, input),

    // ── Factions ──
    createFaction: async (_, { input }) => {
      return createEntity('Faction', 'FACTION', input);
    },
    updateFaction: async (_, { id, input }) => updateEntity('Faction', id, input),

    // ── Delete any entity ──
    deleteEntity: async (_, { id }) => {
      // Delete entity and all its relationships
      await runQuery(
        `MATCH (e:CanonEntity {id: $id})
         OPTIONAL MATCH (e)-[r:RELATES_TO]-()
         DELETE r, e`,
        { id }
      );
      return { message: `Entity ${id} deleted successfully` };
    },

    // ── Relationships ──
    createRelationship: async (_, { input }) => {
      const { projectId, fromId, toId, fromType, toType, label } = input;
      const id = uuidv4();
      const now = new Date().toISOString();

      // Verify both entities exist
      const fromRec = await runQuery(
        `MATCH (e:CanonEntity {id: $id}) RETURN e.name AS name, e.entityType AS entityType`,
        { id: fromId }
      );
      const toRec = await runQuery(
        `MATCH (e:CanonEntity {id: $id}) RETURN e.name AS name, e.entityType AS entityType`,
        { id: toId }
      );

      if (!fromRec.length) throw new GraphQLError(`Source entity ${fromId} not found`);
      if (!toRec.length) throw new GraphQLError(`Target entity ${toId} not found`);

      await runQuery(
        `MATCH (from:CanonEntity {id: $fromId}), (to:CanonEntity {id: $toId})
         CREATE (from)-[r:RELATES_TO {
           id: $id,
           label: $label,
           projectId: $projectId,
           createdAt: $createdAt
         }]->(to)`,
        { fromId, toId, id, label, projectId, createdAt: now }
      );

      return {
        id,
        fromId,
        toId,
        fromName: fromRec[0].get('name'),
        toName: toRec[0].get('name'),
        fromType: fromRec[0].get('entityType'),
        toType: toRec[0].get('entityType'),
        label,
        projectId,
        createdAt: now,
      };
    },

    updateRelationship: async (_, { id, label }) => {
      const records = await runQuery(
        `MATCH ()-[r:RELATES_TO {id: $id}]->()
         SET r.label = $label
         RETURN r.id AS rid, r.label AS label, r.projectId AS projectId,
                r.createdAt AS createdAt`,
        { id, label }
      );
      if (!records.length) throw new GraphQLError('Relationship not found');
      // Re-fetch full relationship data
      const edgeRec = await runQuery(
        `MATCH (from)-[r:RELATES_TO {id: $id}]->(to)
         RETURN r.id AS rid, r.label AS rlabel, r.projectId AS projectId,
                r.createdAt AS createdAt,
                from.id AS fromId, from.name AS fromName, from.entityType AS fromType,
                to.id AS toId, to.name AS toName, to.entityType AS toType`,
        { id }
      );
      const r = edgeRec[0];
      return {
        id: r.get('rid'),
        fromId: r.get('fromId'),
        toId: r.get('toId'),
        fromName: r.get('fromName'),
        toName: r.get('toName'),
        fromType: r.get('fromType'),
        toType: r.get('toType'),
        label: r.get('rlabel'),
        projectId: r.get('projectId'),
        createdAt: r.get('createdAt'),
      };
    },

    deleteRelationship: async (_, { id }) => {
      await runQuery(`MATCH ()-[r:RELATES_TO {id: $id}]->() DELETE r`, { id });
      return { message: `Relationship ${id} deleted` };
    },
  },

  // ── Union type resolver ──────────────────────────────────────────────────
  CanonEntity: {
    __resolveType(obj) {
      switch (obj.entityType) {
        case 'PLACE': return 'Place';
        case 'CHARACTER': return 'Character';
        case 'ITEM': return 'Item';
        case 'EVENT': return 'Event';
        case 'FACTION': return 'Faction';
        default: return null;
      }
    },
  },

  // ── Field resolvers for relationships on each type ───────────────────────
  Place: {
    relationships: (parent) => resolveEntityRelationships(parent),
  },
  Character: {
    relationships: (parent) => resolveEntityRelationships(parent),
  },
  Item: {
    relationships: (parent) => resolveEntityRelationships(parent),
  },
  Event: {
    relationships: (parent) => resolveEntityRelationships(parent),
  },
  Faction: {
    relationships: (parent) => resolveEntityRelationships(parent),
  },
};

export default entityResolvers;
