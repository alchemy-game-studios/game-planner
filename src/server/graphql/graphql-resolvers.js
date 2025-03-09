export default {
  Query: {
      hello: () => {
        return {
          message: "Hello, world!"
        };
      },
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
  }
}