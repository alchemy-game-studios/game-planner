/**
 * Hierarchy Provider
 *
 * Provides parent chain context (ancestors up to universe).
 * Important for understanding entity's place in the world.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';

export class HierarchyProvider extends BaseProvider {
  get name() {
    return 'hierarchy';
  }

  /**
   * Always relevant - hierarchy provides world context
   */
  isRelevant() {
    return true;
  }

  /**
   * Gather ancestor entities up to universe
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { entityId } = params;

    if (!entityId) {
      return this.createResult([]);
    }

    const hierarchyResolver = this.resolvers.get('hierarchy');
    if (!hierarchyResolver) {
      return this.createResult([]);
    }

    const ancestors = await hierarchyResolver.resolve(entityId, {
      limit: PROVIDER_LIMITS.hierarchy
    });

    // Exclude the source entity itself (handled by SourceProvider)
    const parentChain = ancestors.filter(a => a.id !== entityId);

    // Add depth and role metadata
    parentChain.forEach((entity, index) => {
      entity._contextRole = index === parentChain.length - 1 ? 'universe' : 'ancestor';
      entity._depth = index + 1;
    });

    const universeNames = parentChain
      .filter(e => e._nodeType === 'universe')
      .map(e => e.name);

    return this.createResult(parentChain, {
      summary: parentChain.length > 0
        ? `Hierarchy: ${parentChain.map(e => e.name).join(' → ')}`
        : 'No parent hierarchy'
    });
  }
}
