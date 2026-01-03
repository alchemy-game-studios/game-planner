/**
 * Sibling Provider
 *
 * Provides sibling entities (same parent via CONTAINS).
 * Useful for consistency within a location/container.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';

export class SiblingProvider extends BaseProvider {
  get name() {
    return 'sibling';
  }

  /**
   * Relevant for entity types that benefit from sibling context
   */
  isRelevant(targetType) {
    const relevantTypes = ['character', 'item', 'place', 'event'];
    return relevantTypes.includes(targetType?.toLowerCase());
  }

  /**
   * Gather sibling entities - only includes explicitly selected siblings
   * Siblings are opt-in since they're contextually related via the parent
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { entityId, selectedContext = {} } = params;
    const { entities: selectedEntities = [] } = selectedContext;

    if (!entityId) {
      return this.createResult([]);
    }

    const siblingResolver = this.resolvers.get('sibling');
    if (!siblingResolver) {
      return this.createResult([]);
    }

    // Get all siblings to check which selected entities are siblings
    const allSiblings = await siblingResolver.resolve(entityId, {
      limit: PROVIDER_LIMITS.siblings
    });

    const siblingIds = new Set(allSiblings.map(s => s.id));

    // Only include siblings that were explicitly selected
    const selectedSiblingIds = selectedEntities
      .map(e => e.id || e)
      .filter(id => siblingIds.has(id));

    if (selectedSiblingIds.length === 0) {
      return this.createResult([], {
        summary: 'No siblings selected'
      });
    }

    // Get full sibling data for selected ones
    const selectedSiblings = allSiblings.filter(s => selectedSiblingIds.includes(s.id));

    // Add metadata
    selectedSiblings.forEach(entity => {
      entity._contextRole = 'sibling';
      entity._depth = 1;
      entity._userSelected = true;
    });

    return this.createResult(selectedSiblings, {
      summary: `Siblings: ${selectedSiblings.length} selected`
    });
  }
}
