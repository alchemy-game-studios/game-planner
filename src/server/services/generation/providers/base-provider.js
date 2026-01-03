/**
 * Base Provider
 *
 * Abstract base class for context providers.
 * Providers gather context entities from specific sources.
 */

import { PROVIDER_PRIORITIES } from '../context-config.js';

export class BaseProvider {
  /**
   * @param {Object} resolvers - ResolverRegistry instance
   * @param {Object} serializers - SerializerRegistry instance
   * @param {Object} options
   */
  constructor(resolvers, serializers, options = {}) {
    this.resolvers = resolvers;
    this.serializers = serializers;
    this.options = options;
  }

  /**
   * Provider name for identification
   * @returns {string}
   */
  get name() {
    throw new Error('Subclass must implement name getter');
  }

  /**
   * Priority for ordering in context (higher = earlier)
   * @returns {number}
   */
  get priority() {
    return PROVIDER_PRIORITIES[this.name] ?? 50;
  }

  /**
   * Gather context entities from this provider's source
   * @param {Object} params - Generation parameters
   * @param {string} params.entityId - Source entity ID
   * @param {string} params.targetType - Type being generated
   * @param {string} params.universeId - Universe ID for context
   * @param {Object} params.selectedContext - User-selected context
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    throw new Error('Subclass must implement gather()');
  }

  /**
   * Check if this provider is relevant for the target type
   * @param {string} targetType - Type being generated
   * @returns {boolean}
   */
  isRelevant(targetType) {
    return true;
  }

  /**
   * Serialize entities using the serializer registry
   * @param {Array} entities - Entities to serialize
   * @param {Object} options - Serialization options
   * @returns {Array} Serialized entities
   */
  serializeEntities(entities, options = {}) {
    const { format = 'markdown', depth = 0 } = options;

    return entities.map(entity => {
      const serializer = this.serializers.get(entity._nodeType || entity.nodeType);
      return serializer.serialize(entity, { format, depth });
    });
  }

  /**
   * Create a provider result object
   * @param {Array} entities - Gathered entities
   * @param {Object} options
   * @returns {ProviderResult}
   */
  createResult(entities, options = {}) {
    const { source = this.name, summary = '' } = options;

    return {
      provider: this.name,
      priority: this.priority,
      source,
      entities,
      count: entities.length,
      summary
    };
  }
}

/**
 * @typedef {Object} ProviderResult
 * @property {string} provider - Provider name
 * @property {number} priority - Provider priority
 * @property {string} source - Context source description
 * @property {Array} entities - Gathered entities (raw)
 * @property {number} count - Number of entities
 * @property {string} summary - Optional summary of what was gathered
 */
