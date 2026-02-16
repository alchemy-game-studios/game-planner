import { runQuery } from "./neo4j-client.js";
import crypto from "crypto";

// Helper: generate a short unique ID
const genId = () => crypto.randomUUID().slice(0, 8);

// Helper: convert Neo4j node to plain object with arrays
function nodeToEntity(record, alias = "n") {
  const props = record.get(alias).properties;
  // Neo4j stores arrays natively, but integers need conversion
  const result = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "object" && value !== null && value.toNumber) {
      result[key] = value.toNumber();
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Helper: build SET clause from input
function buildSetClause(input, alias = "n") {
  const sets = [];
  const params = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "properties") continue; // handled separately
    params[key] = value;
    sets.push(`${alias}.${key} = $${key}`);
  }
  return { sets, params };
}

// Generic CRUD factory for entity types
function makeEntityResolvers(label) {
  return {
    queryAll: async () => {
      const records = await runQuery(`MATCH (n:${label}) RETURN n ORDER BY n.name`);
      return records.map((r) => nodeToEntity(r));
    },

    queryOne: async (_, { id }) => {
      const records = await runQuery(`MATCH (n:${label} {id: $id}) RETURN n`, { id });
      return records.length ? nodeToEntity(records[0]) : null;
    },

    create: async (_, { input }) => {
      const id = genId();
      const now = new Date().toISOString();
      const { properties, ...fields } = input;
      const allFields = { ...fields, id, createdAt: now, updatedAt: now };

      // Build property string
      const propEntries = Object.entries(allFields)
        .map(([k, v]) => `${k}: $${k}`)
        .join(", ");

      const records = await runQuery(
        `CREATE (n:${label} {${propEntries}}) RETURN n`,
        allFields
      );

      const entity = nodeToEntity(records[0]);

      // Store custom properties as separate key-value pairs on the node
      if (properties && properties.length > 0) {
        for (const prop of properties) {
          await runQuery(
            `MATCH (n:${label} {id: $id}) SET n.\`prop_${prop.key}\` = $value`,
            { id, value: prop.value }
          );
        }
      }

      return entity;
    },

    update: async (_, { id, input }) => {
      const now = new Date().toISOString();
      const { properties, ...fields } = input;
      const { sets, params } = buildSetClause({ ...fields, updatedAt: now });

      if (sets.length === 0) return null;

      const records = await runQuery(
        `MATCH (n:${label} {id: $id}) SET ${sets.join(", ")} RETURN n`,
        { ...params, id }
      );
      return records.length ? nodeToEntity(records[0]) : null;
    },

    delete: async (_, { id }) => {
      const records = await runQuery(
        `MATCH (n:${label} {id: $id}) DETACH DELETE n RETURN count(n) as deleted`,
        { id }
      );
      const deleted = records[0]?.get("deleted")?.toNumber?.() ?? 0;
      return { success: deleted > 0, message: deleted > 0 ? "Deleted" : "Not found" };
    },
  };
}

// Create resolvers for each entity type
const placeResolvers = makeEntityResolvers("Place");
const characterResolvers = makeEntityResolvers("Character");
const itemResolvers = makeEntityResolvers("Item");
const eventResolvers = makeEntityResolvers("Event");
const factionResolvers = makeEntityResolvers("Faction");

// Relationship resolvers
async function getRelationshipsForEntity(entityId, entityType) {
  const records = await runQuery(
    `MATCH (a {id: $entityId})-[r]->(b)
     RETURN r, a, b, labels(a)[0] as sourceType, labels(b)[0] as targetType
     UNION
     MATCH (a)-[r]->(b {id: $entityId})
     RETURN r, a, b, labels(a)[0] as sourceType, labels(b)[0] as targetType`,
    { entityId }
  );

  return records.map((rec) => {
    const rel = rec.get("r");
    const source = rec.get("a").properties;
    const target = rec.get("b").properties;
    return {
      id: rel.properties.id || rel.identity.toString(),
      type: rel.type,
      sourceId: source.id,
      sourceType: rec.get("sourceType").toUpperCase(),
      sourceName: source.name,
      targetId: target.id,
      targetType: rec.get("targetType").toUpperCase(),
      targetName: target.name,
      description: rel.properties.description || null,
    };
  });
}

export default {
  Query: {
    hello: () => ({ message: "Hello from CanonKiln!" }),

    places: placeResolvers.queryAll,
    characters: characterResolvers.queryAll,
    items: itemResolvers.queryAll,
    events: eventResolvers.queryAll,
    factions: factionResolvers.queryAll,

    place: placeResolvers.queryOne,
    character: characterResolvers.queryOne,
    item: itemResolvers.queryOne,
    event: eventResolvers.queryOne,
    faction: factionResolvers.queryOne,

    relationships: async (_, { entityId }) => {
      return getRelationshipsForEntity(entityId);
    },

    searchCanon: async (_, { query, types }) => {
      const labelFilter = types && types.length > 0
        ? types.map((t) => t.charAt(0) + t.slice(1).toLowerCase()).join("|")
        : "Place|Character|Item|Event|Faction";

      const records = await runQuery(
        `MATCH (n) WHERE any(label IN labels(n) WHERE label IN $labels)
         AND (toLower(n.name) CONTAINS toLower($query) OR toLower(n.description) CONTAINS toLower($query))
         RETURN n, labels(n)[0] as entityType LIMIT 50`,
        {
          query,
          labels: labelFilter.split("|"),
        }
      );

      return records.map((r) => {
        const entity = nodeToEntity(r);
        entity.__typename = r.get("entityType");
        return entity;
      });
    },

    canonGraph: async (_, { rootId, depth = 3 } = {}) => {
      let cypher;
      let params = {};

      if (rootId) {
        cypher = `MATCH (n {id: $rootId})-[r*0..${depth}]-(m)
                  WITH collect(DISTINCT m) + collect(DISTINCT n) as allNodes,
                       [p IN collect(DISTINCT r) | head(p)] as allRels
                  UNWIND allNodes as node
                  WITH collect(DISTINCT node) as nodes, allRels
                  UNWIND allRels as rel
                  RETURN nodes, collect(DISTINCT rel) as rels`;
        params = { rootId };
      } else {
        cypher = `MATCH (n) WHERE n:Place OR n:Character OR n:Item OR n:Event OR n:Faction
                  OPTIONAL MATCH (n)-[r]-(m)
                  WITH collect(DISTINCT n) + collect(DISTINCT m) as allNodes, collect(DISTINCT r) as rels
                  UNWIND allNodes as node
                  WITH collect(DISTINCT node) as nodes, rels
                  RETURN nodes, rels LIMIT 1`;
        params = {};
      }

      try {
        const records = await runQuery(cypher, params);

        if (records.length === 0) {
          return { nodes: [], edges: [] };
        }

        const nodesRaw = records[0].get("nodes");
        const relsRaw = records[0].get("rels");

        const nodes = nodesRaw
          .filter((n) => n && n.properties)
          .map((n) => ({
            id: n.properties.id,
            name: n.properties.name || "Unknown",
            entityType: n.labels[0]?.toUpperCase() || "PLACE",
            description: n.properties.description || "",
            tags: n.properties.tags || [],
          }));

        const edges = relsRaw
          .filter((r) => r && r.start && r.end)
          .map((r) => ({
            id: r.properties?.id || r.identity?.toString() || genId(),
            source: r.start.toString(),
            target: r.end.toString(),
            type: r.type,
            description: r.properties?.description || null,
          }));

        return { nodes, edges };
      } catch (error) {
        console.error("Error fetching canon graph:", error);
        return { nodes: [], edges: [] };
      }
    },
  },

  Mutation: {
    submitText: (_, { input }) => ({
      message: `Received text: ${input.text}`,
    }),

    createPlace: placeResolvers.create,
    updatePlace: placeResolvers.update,
    deletePlace: placeResolvers.delete,

    createCharacter: characterResolvers.create,
    updateCharacter: characterResolvers.update,
    deleteCharacter: characterResolvers.delete,

    createItem: itemResolvers.create,
    updateItem: itemResolvers.update,
    deleteItem: itemResolvers.delete,

    createEvent: eventResolvers.create,
    updateEvent: eventResolvers.update,
    deleteEvent: eventResolvers.delete,

    createFaction: factionResolvers.create,
    updateFaction: factionResolvers.update,
    deleteFaction: factionResolvers.delete,

    createRelationship: async (_, { input }) => {
      const id = genId();
      const relType = input.type === "CUSTOM" && input.customType
        ? input.customType.toUpperCase().replace(/\s+/g, "_")
        : input.type;

      const records = await runQuery(
        `MATCH (a {id: $sourceId}), (b {id: $targetId})
         CREATE (a)-[r:\`${relType}\` {id: $id, description: $description}]->(b)
         RETURN r, a, b, labels(a)[0] as sourceType, labels(b)[0] as targetType`,
        {
          sourceId: input.sourceId,
          targetId: input.targetId,
          id,
          description: input.description || null,
        }
      );

      if (records.length === 0) throw new Error("Source or target entity not found");

      const rel = records[0].get("r");
      const source = records[0].get("a").properties;
      const target = records[0].get("b").properties;

      return {
        id,
        type: input.type,
        customType: input.customType || null,
        sourceId: source.id,
        sourceType: records[0].get("sourceType").toUpperCase(),
        sourceName: source.name,
        targetId: target.id,
        targetType: records[0].get("targetType").toUpperCase(),
        targetName: target.name,
        description: input.description || null,
      };
    },

    deleteRelationship: async (_, { id }) => {
      const records = await runQuery(
        `MATCH ()-[r {id: $id}]-() DELETE r RETURN count(r) as deleted`,
        { id }
      );
      const deleted = records[0]?.get("deleted")?.toNumber?.() ?? 0;
      return { success: deleted > 0, message: deleted > 0 ? "Deleted" : "Not found" };
    },
  },

  // Union type resolution
  CanonEntity: {
    __resolveType(obj) {
      return obj.__typename;
    },
  },

  // Field-level resolvers for relationships on entities
  Place: {
    relationships: (parent) => getRelationshipsForEntity(parent.id),
    properties: (parent) => extractProperties(parent),
  },
  Character: {
    relationships: (parent) => getRelationshipsForEntity(parent.id),
    properties: (parent) => extractProperties(parent),
  },
  Item: {
    relationships: (parent) => getRelationshipsForEntity(parent.id),
    properties: (parent) => extractProperties(parent),
  },
  Event: {
    relationships: (parent) => getRelationshipsForEntity(parent.id),
    properties: (parent) => extractProperties(parent),
  },
  Faction: {
    relationships: (parent) => getRelationshipsForEntity(parent.id),
    properties: (parent) => extractProperties(parent),
  },
};

// Extract custom properties (prefixed with prop_) from node
function extractProperties(entity) {
  const props = [];
  for (const [key, value] of Object.entries(entity)) {
    if (key.startsWith("prop_")) {
      props.push({ key: key.slice(5), value: String(value) });
    }
  }
  return props;
}
