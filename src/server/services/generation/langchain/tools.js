/**
 * LangChain Tools
 *
 * Structured tools for LangChain agents to interact with
 * the worldbuilding system.
 */

import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { toCombinedDocument } from './documents.js';

/**
 * Query World Tool
 *
 * Allows agents to query the world knowledge base.
 */
export class QueryWorldTool extends StructuredTool {
  name = 'query_world';
  description = 'Query the worldbuilding knowledge base for information about entities, places, characters, items, and events.';

  schema = z.object({
    entityId: z.string().optional().describe('UUID of a specific entity to focus on'),
    entityType: z.enum(['universe', 'place', 'character', 'item', 'event', 'narrative', 'tag'])
      .optional()
      .describe('Type of entities to focus on'),
    query: z.string().describe('What information to find')
  });

  /**
   * @param {Object} options
   * @param {ContextAssembler} options.assembler
   * @param {string} options.defaultUniverseId
   */
  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
    this.defaultUniverseId = options.defaultUniverseId;
  }

  async _call(input) {
    const { entityId, entityType, query } = input;

    try {
      const context = await this.assembler.assemble({
        entityId: entityId || null,
        universeId: this.defaultUniverseId,
        targetType: entityType || 'character'
      }, 'markdown');

      const doc = toCombinedDocument(context, { maxTokens: 2000 });
      return doc.pageContent || 'No relevant information found.';
    } catch (error) {
      return `Error querying world: ${error.message}`;
    }
  }
}

/**
 * Get Entity Context Tool
 *
 * Retrieves detailed context for a specific entity.
 */
export class GetEntityContextTool extends StructuredTool {
  name = 'get_entity_context';
  description = 'Get detailed context about a specific entity including its relationships, hierarchy, and tags.';

  schema = z.object({
    entityId: z.string().describe('UUID of the entity'),
    includeRelationships: z.boolean().optional().default(true)
      .describe('Whether to include relationship context'),
    includeTags: z.boolean().optional().default(true)
      .describe('Whether to include tag definitions')
  });

  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
  }

  async _call(input) {
    const { entityId, includeRelationships, includeTags } = input;

    try {
      const context = await this.assembler.assemble({
        entityId,
        targetType: 'character' // Default, will be overridden by actual type
      }, 'markdown');

      // Filter based on options
      let content = context.combinedContent;

      if (!includeRelationships) {
        // Remove relationship sections
        content = content.replace(/# Related Entities[\s\S]*?(?=# |$)/g, '');
        content = content.replace(/# Event Involvement[\s\S]*?(?=# |$)/g, '');
      }

      if (!includeTags) {
        content = content.replace(/# Style & Tone Tags[\s\S]*?(?=# |$)/g, '');
      }

      return content.trim() || 'Entity not found.';
    } catch (error) {
      return `Error getting entity context: ${error.message}`;
    }
  }
}

/**
 * Get Universe Overview Tool
 *
 * Provides a high-level overview of a universe.
 */
export class GetUniverseOverviewTool extends StructuredTool {
  name = 'get_universe_overview';
  description = 'Get an overview of a universe including its description, key locations, and available tags.';

  schema = z.object({
    universeId: z.string().describe('UUID of the universe')
  });

  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
  }

  async _call(input) {
    const { universeId } = input;

    try {
      const context = await this.assembler.assemble({
        entityId: universeId,
        universeId,
        targetType: 'universe'
      }, 'markdown');

      return context.combinedContent || 'Universe not found.';
    } catch (error) {
      return `Error getting universe overview: ${error.message}`;
    }
  }
}

/**
 * Get Related Entities Tool
 *
 * Finds entities related to a source entity.
 */
export class GetRelatedEntitiesTool extends StructuredTool {
  name = 'get_related_entities';
  description = 'Find entities related to a source entity through various relationships (siblings, events, tags).';

  schema = z.object({
    entityId: z.string().describe('UUID of the source entity'),
    relationshipType: z.enum(['siblings', 'events', 'tags', 'all'])
      .optional()
      .default('all')
      .describe('Type of relationships to include'),
    limit: z.number().optional().default(10).describe('Maximum entities to return')
  });

  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
  }

  async _call(input) {
    const { entityId, relationshipType, limit } = input;

    try {
      const context = await this.assembler.assemble({
        entityId,
        targetType: 'character'
      }, 'structured');

      let entities = context.entities;

      // Filter by relationship type
      if (relationshipType !== 'all') {
        entities = entities.filter(e => {
          switch (relationshipType) {
            case 'siblings':
              return e._contextRole === 'sibling';
            case 'events':
              return e._contextRole === 'relatedEvent' || e._contextRole === 'participant';
            case 'tags':
              return e.nodeType === 'tag' || e._contextRole?.includes('Tag');
            default:
              return true;
          }
        });
      }

      // Apply limit
      entities = entities.slice(0, limit);

      // Format output
      const formatted = entities.map(e =>
        `- ${e.name} (${e.nodeType}): ${e.content?.slice(0, 100) || 'No description'}...`
      ).join('\n');

      return formatted || 'No related entities found.';
    } catch (error) {
      return `Error finding related entities: ${error.message}`;
    }
  }
}

/**
 * Create all worldbuilding tools
 * @param {ContextAssembler} assembler
 * @param {Object} options
 * @returns {StructuredTool[]}
 */
export function createWorldbuildingTools(assembler, options = {}) {
  return [
    new QueryWorldTool({ assembler, ...options }),
    new GetEntityContextTool({ assembler }),
    new GetUniverseOverviewTool({ assembler }),
    new GetRelatedEntitiesTool({ assembler })
  ];
}
