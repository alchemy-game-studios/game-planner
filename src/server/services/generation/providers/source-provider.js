/**
 * Source Provider
 *
 * Provides the primary source entity being generated from.
 * Always included with highest priority.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';
import neo4j from 'neo4j-driver';

export class SourceProvider extends BaseProvider {
  get name() {
    return 'source';
  }

  /**
   * Always relevant - source entity is always needed
   */
  isRelevant() {
    return true;
  }

  /**
   * Gather the source entity with its tags
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { entityId, sourceEntity } = params;

    if (!entityId && !sourceEntity) {
      return this.createResult([]);
    }

    const entities = [];

    // Use provided source entity or fetch it
    let source = sourceEntity;
    if (!source && entityId) {
      // First try hierarchy resolver (includes the entity in its path)
      const hierarchyResolver = this.resolvers.get('hierarchy');
      if (hierarchyResolver) {
        const ancestors = await hierarchyResolver.resolve(entityId);
        // The path includes the entity itself at the end
        source = ancestors.find(e => e.id === entityId);
      }

      // If hierarchy didn't find it (e.g., event not in a CONTAINS chain), fetch directly
      if (!source) {
        source = await this.fetchEntityDirectly(entityId);
      }
    }

    if (source) {
      source._contextRole = 'source';
      source._depth = 0;
      entities.push(source);
    }

    // Get tags for the source entity
    const tagResolver = this.resolvers.get('tag');
    if (tagResolver && entityId) {
      const tags = await tagResolver.resolve(entityId, {
        limit: PROVIDER_LIMITS.tags
      });

      tags.forEach(tag => {
        tag._contextRole = 'sourceTag';
        tag._depth = 1;
      });

      entities.push(...tags);
    }

    return this.createResult(entities, {
      summary: source
        ? `Source: ${source.name} (${source._nodeType || 'entity'}) with ${entities.length - 1} tags`
        : 'No source entity'
    });
  }

  /**
   * Fetch an entity directly by ID when hierarchy doesn't find it
   * @param {string} entityId
   * @returns {Promise<Object|null>}
   */
  async fetchEntityDirectly(entityId) {
    // Get the driver from any resolver (they all share the same driver)
    const anyResolver = this.resolvers.get('hierarchy') || this.resolvers.get('tag');
    if (!anyResolver?.driver) return null;

    const session = anyResolver.driver.session();
    try {
      const result = await session.run(`
        MATCH (e {id: $entityId})
        RETURN {
          id: e.id,
          name: e.name,
          description: e.description,
          type: e.type,
          _nodeType: toLower(labels(e)[0])
        } AS entity
      `, { entityId });

      return result.records[0]?.get('entity') || null;
    } finally {
      await session.close();
    }
  }
}
