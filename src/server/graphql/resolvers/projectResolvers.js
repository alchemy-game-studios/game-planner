/**
 * projectResolvers.js
 * Projects group entities for CanonKiln.
 * Each project is a Neo4j node: (:Project {id, name, ...})
 */

import { runQuery } from '../neo4j-driver.js';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';

const nodeToProject = async (node) => {
  const props = node.properties;

  // Count entities and relationships for this project
  const countRecs = await runQuery(
    `MATCH (e:CanonEntity {projectId: $id})
     OPTIONAL MATCH (e)-[r:RELATES_TO]-()
     RETURN count(DISTINCT e) AS entityCount, count(DISTINCT r) AS relCount`,
    { id: props.id }
  );

  const entityCount = countRecs[0]?.get('entityCount')?.toNumber() || 0;
  const relationshipCount = countRecs[0]?.get('relCount')?.toNumber() || 0;

  return {
    ...props,
    entityCount,
    relationshipCount,
  };
};

const projectResolvers = {
  Query: {
    projects: async () => {
      const records = await runQuery(
        `MATCH (p:Project) RETURN p ORDER BY p.createdAt DESC`
      );
      return Promise.all(records.map((r) => nodeToProject(r.get('p'))));
    },

    project: async (_, { id }) => {
      const records = await runQuery(
        `MATCH (p:Project {id: $id}) RETURN p`,
        { id }
      );
      if (!records.length) {
        throw new GraphQLError('Project not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return nodeToProject(records[0].get('p'));
    },
  },

  Mutation: {
    createProject: async (_, { input }) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      const props = {
        id,
        name: input.name,
        description: input.description || null,
        genre: input.genre || null,
        createdAt: now,
        updatedAt: now,
      };

      const records = await runQuery(
        `CREATE (p:Project $props) RETURN p`,
        { props }
      );

      return nodeToProject(records[0].get('p'));
    },

    updateProject: async (_, { id, input }) => {
      const updates = { updatedAt: new Date().toISOString() };
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.genre !== undefined) updates.genre = input.genre;

      const setClause = Object.keys(updates).map((k) => `p.${k} = $${k}`).join(', ');

      const records = await runQuery(
        `MATCH (p:Project {id: $id}) SET ${setClause} RETURN p`,
        { id, ...updates }
      );

      if (!records.length) {
        throw new GraphQLError('Project not found', { extensions: { code: 'NOT_FOUND' } });
      }

      return nodeToProject(records[0].get('p'));
    },

    deleteProject: async (_, { id }) => {
      // Cascade: delete all entities and relationships in the project
      await runQuery(
        `MATCH (e:CanonEntity {projectId: $id})
         OPTIONAL MATCH (e)-[r:RELATES_TO]-()
         DELETE r, e`,
        { id }
      );
      await runQuery(
        `MATCH (p:Project {id: $id}) DELETE p`,
        { id }
      );
      return { message: `Project ${id} and all its entities deleted` };
    },
  },
};

export default projectResolvers;
