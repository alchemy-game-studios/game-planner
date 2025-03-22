import neo4j from "neo4j-driver";
import commonResolverFactory from "./common.js"

// Configure the Neo4j driver
const driver = neo4j.driver(
  "bolt://localhost:7687", // Change if using a remote database
  neo4j.auth.basic("neo4j", "password") // Use your credentials
);

const commonResolver = commonResolverFactory(driver);

const NODE_UNIVERSE= "Universe"
const NODE_PLACE= "Place"
const NODE_CHARACTER= "Character"
const NODE_TAG= "Tag"


export default {
  Query: {
      universes: async () => {const result = await commonResolver.all(NODE_UNIVERSE); console.log(result[0].contents); return result;},
      places: async () => {return await commonResolver.all(NODE_PLACE)},
      characters: async () => {return await commonResolver.all(NODE_CHARACTER)},
      tags: async () => {return await commonResolver.all(NODE_TAG)}
  },
  Mutation: {
    addUniverse: async (_parent, { universe } ) => {await commonResolver.create(NODE_UNIVERSE, universe)},
    editUniverse: async (_parent, { obj }) => {await commonResolver.update(obj)},
    removeUniverse: async (_parent, { obj }) => {await commonResolver.delete(obj)},

    addPlace: async (_parent, { place }) => {await commonResolver.create(NODE_PLACE, place)},
    editPlace: async (_parent, { obj }) => {await commonResolver.update(obj)},
    removePlace: async (_parent, { obj }) => {await commonResolver.delete(obj)},

    addCharacter: async (_parent, { character }) => {await commonResolver.create(NODE_CHARACTER, character)},
    editCharacter: async (_parent, { obj }) => {await commonResolver.update(obj)},
    removeCharacter: async (_parent, { obj }) => {await commonResolver.delete(obj)},

    addTag: async (_parent, { tag }) => {await commonResolver.create(NODE_TAG, tag)},
    editTag: async (_parent, { obj }) => {await commonResolver.update(obj)},
    removeTag: async (_parent, { obj }) => {await commonResolver.delete(obj)},

    relateContains: async (_parent, { relation }) => {
      await relation.childIds.forEach(async childId => {
        await commonResolver.relateContains(relation.id, childId)
      });
    },
    relateTagged: async (_parent, { relation }) => {
      await relation.tagIds.forEach(async tagId => {
        await commonResolver.relateTagged(relation.id, tagId)
      });
    },
  }
}