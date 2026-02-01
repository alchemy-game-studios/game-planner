/**
 * Product Provider
 *
 * Provides product context (attributes, mechanics, existing adaptations).
 * Only included when generating product-related entities.
 */

import { BaseProvider } from './base-provider.js';
import { requiresProductContext, PROVIDER_LIMITS } from '../context-config.js';

export class ProductProvider extends BaseProvider {
  get name() {
    return 'product';
  }

  /**
   * Only relevant for product-related generation targets
   */
  isRelevant(targetType) {
    return requiresProductContext(targetType);
  }

  /**
   * Gather product context
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { productId, product, entityId } = params;

    if (!productId && !product) {
      return this.createResult([]);
    }

    const entities = [];

    // Add the product itself
    if (product) {
      const productEntity = {
        ...product,
        _nodeType: 'product',
        _contextRole: 'product',
        _depth: 0
      };
      entities.push(productEntity);

      // Add product attributes
      if (product.attributes && Array.isArray(product.attributes)) {
        product.attributes.slice(0, PROVIDER_LIMITS.product).forEach((attr, index) => {
          entities.push({
            ...attr,
            _nodeType: 'attribute',
            _contextRole: 'productAttribute',
            _depth: 1,
            _index: index
          });
        });
      }

      // Add product mechanics
      if (product.mechanics && Array.isArray(product.mechanics)) {
        product.mechanics.slice(0, PROVIDER_LIMITS.product).forEach((mech, index) => {
          entities.push({
            ...mech,
            _nodeType: 'mechanic',
            _contextRole: 'productMechanic',
            _depth: 1,
            _index: index
          });
        });
      }

      // Add existing adaptations for the source entity (for consistency)
      if (entityId && product.adaptations && Array.isArray(product.adaptations)) {
        const entityAdaptations = product.adaptations
          .filter(a => a.entityId === entityId)
          .slice(0, PROVIDER_LIMITS.product);

        entityAdaptations.forEach(adaptation => {
          entities.push({
            ...adaptation,
            _nodeType: 'adaptation',
            _contextRole: 'existingAdaptation',
            _depth: 1
          });
        });
      }
    }

    return this.createResult(entities, {
      summary: product
        ? `Product: ${product.name} (${entities.length - 1} attributes/mechanics/adaptations)`
        : 'No product context'
    });
  }
}
