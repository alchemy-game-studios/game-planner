/**
 * graphql-resolvers.js
 * Main resolver combiner for CanonKiln.
 * Merges: base, auth, entity, generation, project, stripe resolvers.
 */

import authResolvers from './resolvers/authResolvers.js';
import entityResolvers from './resolvers/entityResolvers.js';
import generationResolvers from './resolvers/generationResolvers.js';
import projectResolvers from './resolvers/projectResolvers.js';
import stripeResolvers from './resolvers/stripeResolvers.js';

// Deep merge helper for resolver maps
const mergeResolvers = (...resolverSets) => {
  const merged = {};
  for (const resolvers of resolverSets) {
    for (const [key, value] of Object.entries(resolvers)) {
      if (merged[key] && typeof merged[key] === 'object' && typeof value === 'object') {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }
  }
  return merged;
};

const baseResolvers = {
  Query: {
    hello: () => ({ message: 'CanonKiln API — v2.0' }),
  },
  Mutation: {
    submitText: (_, { input }) => ({
      message: `Received: ${input.text}`,
    }),
  },
};

export default mergeResolvers(
  baseResolvers,
  authResolvers,
  entityResolvers,
  generationResolvers,
  projectResolvers,
  stripeResolvers
);
