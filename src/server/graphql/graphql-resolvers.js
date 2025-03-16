import neo4j from "neo4j-driver";
import tagResolverFactory from "./tag-resolver.js"
import tagRepo from "../repository/tag.js"
import commonResolverFactory from "./common.js"
import common from "./common.js";

// Configure the Neo4j driver
const driver = neo4j.driver(
  "bolt://localhost:7474", // Change if using a remote database
  neo4j.auth.basic("neo4j", "password") // Use your credentials
);

const commonResolver = commonResolverFactory(driver);

const NODE_UNIVERSE= "Universe"
const NODE_PLACE= "Place"
const NODE_CHARACTER= "Character"
const NODE_TAG= "Tag"


export default {
  Query: {
      universes: commonResolver.all(NODE_UNIVERSE),
      places: commonResolver.all(NODE_PLACE),
      characters: commonResolver.all(NODE_CHARACTER),
      tags: commonResolver.all(NODE_TAG)
  },
  Mutation: {
    addUniverse: async (obj) => {await commonResolver.create(NODE_UNIVERSE, obj)},
    editUniverse: async (obj) => {await commonResolver.update(obj)},
    removeUniverse: async (obj) => {await commonResolver.delete(obj)},

    addPlace: async (obj) => {await commonResolver.create(NODE_PLACE, obj)},
    editPlace: async (obj) => {await commonResolver.update(obj)},
    removePlace: async (obj) => {await commonResolver.delete(obj)},

    addCharacter: async (obj) => {await commonResolver.create(NODE_CHARACTER, obj)},
    editCharacter: async (obj) => {await commonResolver.update(obj)},
    removeCharacter: async (obj) => {await commonResolver.delete(obj)},

    addTag: async (obj) => {await commonResolver.create(NODE_TAG, obj)},
    editTag: async (obj) => {await commonResolver.update(obj)},
    removeTag: async (obj) => {await commonResolver.delete(obj)},

    relateContains: commonResolver.relateContains,
    relateTagged: commonResolver.relateTagged
  }
}