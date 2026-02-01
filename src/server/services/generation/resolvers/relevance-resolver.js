/**
 * Relevance Resolver
 *
 * Scores and filters entities based on relevance to generation target.
 * Uses the RELEVANCE_MATRIX from context-config.
 */

import { BaseResolver } from './base-resolver.js';
import { RELEVANCE_MATRIX, PROVIDER_LIMITS } from '../context-config.js';

export class RelevanceResolver extends BaseResolver {
  get relationshipTypes() {
    return []; // Meta-resolver, doesn't handle specific relationships
  }

  /**
   * Score an entity's relevance to a generation target
   * @param {Object} entity - Entity to score
   * @param {string} generationTarget - Type being generated
   * @param {Object} context - Additional context for scoring
   * @returns {number} Relevance score 0-1
   */
  scoreEntity(entity, generationTarget, context = {}) {
    const { depth = 0, isUserSelected = false, sharedTags = 0 } = context;

    // User-selected entities are always highly relevant
    if (isUserSelected) return 1.0;

    const entityType = entity._nodeType?.toLowerCase();
    const targetMatrix = RELEVANCE_MATRIX[generationTarget] || {};
    const baseScore = targetMatrix[entityType] ?? 0.5;

    // Adjust for depth (closer = more relevant)
    const depthPenalty = Math.max(0, 1 - (depth * 0.1));

    // Bonus for shared tags
    const tagBonus = Math.min(sharedTags * 0.05, 0.2);

    return Math.min(1.0, baseScore * depthPenalty + tagBonus);
  }

  /**
   * Score and filter a list of entities
   * @param {Array} entities - Entities to score
   * @param {string} generationTarget - Type being generated
   * @param {Object} options
   * @param {number} options.minScore - Minimum score to include
   * @param {number} options.limit - Max entities to return
   * @returns {Array} Scored and filtered entities
   */
  filterByRelevance(entities, generationTarget, options = {}) {
    const { minScore = 0.3, limit } = options;

    const scored = entities.map(entity => ({
      ...entity,
      _relevanceScore: this.scoreEntity(entity, generationTarget, {
        depth: entity._depth,
        sharedTags: entity._sharedTags
      })
    }));

    const filtered = scored
      .filter(e => e._relevanceScore >= minScore)
      .sort((a, b) => b._relevanceScore - a._relevanceScore);

    if (limit) {
      return filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * Get suggested context entities for a generation
   * @param {string} entityId
   * @param {string} generationTarget
   * @param {Object} resolvers - Other resolver instances to use
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getSuggestedContext(entityId, generationTarget, resolvers, options = {}) {
    const { limit = PROVIDER_LIMITS.custom || 10 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'suggested', generationTarget, limit });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const suggestions = [];

    // Get siblings
    if (resolvers.sibling) {
      const siblings = await resolvers.sibling.getSameTypeSiblings(entityId, { limit: 5 });
      siblings.forEach(s => {
        s._source = 'sibling';
        s._depth = 1;
      });
      suggestions.push(...siblings);
    }

    // Get entities with same tags
    if (resolvers.tag) {
      const sameTagEntities = await resolvers.tag.getSameTagEntities(entityId, { limit: 5 });
      sameTagEntities.forEach(s => {
        s._source = 'sharedTag';
        s._depth = 2;
      });
      suggestions.push(...sameTagEntities);
    }

    // Get co-participants
    if (resolvers.involvement) {
      const coParticipants = await resolvers.involvement.getCoParticipants(entityId, { limit: 3 });
      coParticipants.forEach(s => {
        s._source = 'coParticipant';
        s._depth = 2;
      });
      suggestions.push(...coParticipants);
    }

    // Deduplicate by ID
    const seen = new Set();
    const unique = suggestions.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

    // Score and sort
    const scored = this.filterByRelevance(unique, generationTarget, { limit });

    this.setInCache(cacheKey, scored);
    return scored;
  }

  /**
   * Determine if a provider should be included based on target type
   * @param {string} providerName
   * @param {string} generationTarget
   * @returns {boolean}
   */
  shouldIncludeProvider(providerName, generationTarget) {
    const providerRelevance = {
      source: ['*'], // Always include
      hierarchy: ['*'], // Always include
      tag: ['*'], // Always include
      sibling: ['character', 'item', 'place', 'event'],
      involvement: ['event', 'character', 'narrative'],
      product: ['adaptation', 'section'], // Only for product-related
      custom: ['*'] // Always include if user selected
    };

    const relevantTargets = providerRelevance[providerName] || [];
    return relevantTargets.includes('*') || relevantTargets.includes(generationTarget);
  }

  // Required but not used directly
  async resolve(entityId, options = {}) {
    throw new Error('RelevanceResolver does not resolve directly. Use filterByRelevance or getSuggestedContext.');
  }
}
