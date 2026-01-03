/**
 * Source Provider
 *
 * Provides the primary source entity being generated from.
 * Always included with highest priority.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';

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
      const hierarchyResolver = this.resolvers.get('hierarchy');
      if (hierarchyResolver) {
        const ancestors = await hierarchyResolver.resolve(entityId, { limit: 1 });
        // The first ancestor query will include the entity itself
        source = ancestors.find(e => e.id === entityId);
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
}
