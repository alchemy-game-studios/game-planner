/**
 * Custom Provider
 *
 * Provides user-selected entities from the context UI.
 * These are explicitly chosen by the user for generation.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';

export class CustomProvider extends BaseProvider {
  get name() {
    return 'custom';
  }

  /**
   * Always relevant if user has selected entities
   */
  isRelevant() {
    return true;
  }

  /**
   * Gather user-selected entities
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { selectedContext = {} } = params;
    const { entities: selectedEntities = [] } = selectedContext;

    if (!selectedEntities || selectedEntities.length === 0) {
      return this.createResult([]);
    }

    // Entities should already be fetched by the client
    // Just add metadata for context
    const entities = selectedEntities
      .slice(0, PROVIDER_LIMITS.custom)
      .map((entity, index) => ({
        ...entity,
        _contextRole: 'userSelected',
        _depth: 0,
        _userSelected: true,
        _selectionOrder: index
      }));

    // Group by type for summary
    const byType = entities.reduce((acc, e) => {
      const type = e._nodeType || e.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const typeSummary = Object.entries(byType)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    return this.createResult(entities, {
      summary: entities.length > 0
        ? `User-selected: ${typeSummary}`
        : 'No user-selected entities'
    });
  }
}
