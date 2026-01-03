/**
 * Sibling Resolver
 *
 * Resolves sibling entities (same parent via CONTAINS).
 */

import { BaseResolver } from './base-resolver.js';

export class SiblingResolver extends BaseResolver {
  get relationshipTypes() {
    return ['CONTAINS']; // Uses CONTAINS to find shared parent
  }

  /**
   * Get sibling entities (same parent)
   * @param {string} entityId
   * @param {Object} options
   * @param {string} options.targetType - Filter to specific type
   * @param {number} options.limit - Max siblings to return
   * @returns {Promise<Array>}
   */
  async resolve(entityId, options = {}) {
    const { targetType, limit = 20 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'siblings', targetType, limit });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const typeFilter = targetType
      ? `AND toLower(labels(sibling)[0]) = $targetType`
      : '';

    const result = await this.runQuery(`
      MATCH (parent)-[:CONTAINS]->(e {id: $entityId})
      MATCH (parent)-[:CONTAINS]->(sibling)
      WHERE sibling.id <> $entityId ${typeFilter}
      RETURN {
        id: sibling.id,
        name: sibling.name,
        description: sibling.description,
        type: sibling.type,
        _nodeType: toLower(labels(sibling)[0])
      } AS sibling
      ORDER BY sibling.name
      LIMIT $limit
    `, { entityId, targetType: targetType?.toLowerCase(), limit });

    const siblings = result.records.map(r => r.get('sibling'));
    this.setInCache(cacheKey, siblings);

    return siblings;
  }

  /**
   * Get siblings of the same type
   * @param {string} entityId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getSameTypeSiblings(entityId, options = {}) {
    const { limit = 10 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'sameTypeSiblings', limit });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (parent)-[:CONTAINS]->(e {id: $entityId})
      WITH parent, labels(e)[0] AS sourceLabel
      MATCH (parent)-[:CONTAINS]->(sibling)
      WHERE sibling.id <> $entityId
        AND labels(sibling)[0] = sourceLabel
      RETURN {
        id: sibling.id,
        name: sibling.name,
        description: sibling.description,
        type: sibling.type,
        _nodeType: toLower(labels(sibling)[0])
      } AS sibling
      ORDER BY sibling.name
      LIMIT $limit
    `, { entityId, limit });

    const siblings = result.records.map(r => r.get('sibling'));
    this.setInCache(cacheKey, siblings);

    return siblings;
  }

  /**
   * Get sibling counts by type
   * @param {string} entityId
   * @returns {Promise<Object>} Map of type to count
   */
  async getSiblingCounts(entityId) {
    const cacheKey = this.getCacheKey(entityId, { type: 'siblingCounts' });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (parent)-[:CONTAINS]->(e {id: $entityId})
      MATCH (parent)-[:CONTAINS]->(sibling)
      WHERE sibling.id <> $entityId
      WITH toLower(labels(sibling)[0]) AS sibType, count(*) AS count
      RETURN sibType, count
    `, { entityId });

    const counts = {};
    for (const record of result.records) {
      const sibType = record.get('sibType');
      const count = this.toNumber(record.get('count'));
      counts[sibType] = count;
    }

    this.setInCache(cacheKey, counts);
    return counts;
  }

  getRelevance(sourceType, targetType, generationTarget) {
    // Higher relevance when generating same type
    if (targetType === generationTarget) return 0.8;
    return 0.5;
  }
}
