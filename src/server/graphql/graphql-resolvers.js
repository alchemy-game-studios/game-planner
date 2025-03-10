import neo4j from "neo4j-driver";
import tagRepo from "../repository/tag.js"

// Configure the Neo4j driver
const driver = neo4j.driver(
  "bolt://localhost:7687", // Change if using a remote database
  neo4j.auth.basic("neo4j", "password") // Use your credentials
);

const neo4JSession = () => {return driver.session()};

const tagRepository = tagRepo(driver)

export default {
  Query: {
      hello: () => {
        return {
          message: "Hello, world!"
        };
      },
      places: async () => {
        console.log("STARTING PLACES QUERY")
        const session = neo4JSession();
       
        try {
          const result = await session.run("MATCH (p:Place) RETURN p");
          console.log(result.records[0].get("p"))
          return result.records.map(record => record.get("p").properties);
        } catch (error) {
          console.error("Error fetching entities:", error);
          throw new Error("Failed to fetch entities");
        } finally {
          session.close();
        }
      },
      tags: async () => {
        return await tagRepository.readAll()
      }
  },
  Mutation: {
    submitText: (parent, { input }) => {
      // `input` contains the data sent from the client
      console.log('Received input:', input);

      // Process the data (e.g., save to database, perform business logic)
      // Example: return a response with a message
      return {
        message: `Received text: ${input.text}`,
      };
    },
    addTag: async (parent, { tag }) => {
      console.log('Received input:', tag);

      await tagRepository.create(tag);

      return {
        message: `Tag added: ${tag.id}`,
      };
    },
    editTag: async (parent, { tag }) => {
      console.log('Received input:', tag);

      await tagRepository.update(tag)
      return {
        message: `Tag updated: ${tag.id}`,
      };
    },
    removeTag: async (parent, { tag }) => {
      await tagRepository.delete(tag)
      return {
        message: `Tag Removed: ${tag.id}`,
      };
    },
  }
}