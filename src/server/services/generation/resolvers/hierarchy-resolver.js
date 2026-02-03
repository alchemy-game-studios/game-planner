/**
 * Hierarchy Resolver
 *
 * Resolves CONTAINS relationship chains (parent/child hierarchy).
 */

import { BaseResolver } from './base-resolver.js';

export class HierarchyResolver extends BaseResolver {
  get relationshipTypes() {
    return ['CONTAINS'];
  }

  /**
   * Get parent chain from entity up to universe
   * @param {string} entityId
   * @param {Object} options
   * @param {number} options.maxDepth - Maximum ancestor depth
   * @returns {Promise<Array>} Parent chain from universe down to entity
   */
  async resolve(entityId, options = {}) {
    const { maxDepth = 10 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'ancestors', maxDepth });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (e {id: $entityId})
      OPTIONAL MATCH path = (u:Universe)-[:CONTAINS*0..${maxDepth}]->(e)
      WHERE u IS NOT NULL
      WITH e, path,
           [node IN nodes(path) | {
             id: node.id,
             name: node.name,
             description: node.description,
             type: node.type,
             _nodeType: toLower(labels(node)[0])
           }] AS pathNodes
      RETURN pathNodes
      LIMIT 1
    `, { entityId });

    const parentChain = result.records[0]?.get('pathNodes') || [];
    this.setInCache(cacheKey, parentChain);

    return parentChain;
  }

  /**
   * Get direct children of an entity
   * @param {string} entityId
   * @param {Object} options
   * @param {string} options.targetType - Filter to specific child type
   * @param {number} options.limit - Max children to return
   * @returns {Promise<Array>}
   */
  async getChildren(entityId, options = {}) {
    const { targetType, limit = 50 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'children', targetType, limit });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const typeFilter = targetType
      ? `WHERE toLower(labels(child)[0]) = $targetType`
      : '';

    const result = await this.runQuery(`
      MATCH (parent {id: $entityId})-[:CONTAINS]->(child)
      ${typeFilter}
      RETURN {
        id: child.id,
        name: child.name,
        description: child.description,
        type: child.type,
        _nodeType: toLower(labels(child)[0])
      } AS child
      ORDER BY child.name
      LIMIT $limit
    `, { entityId, targetType: targetType?.toLowerCase(), limit });

    const children = result.records.map(r => r.get('child'));
    this.setInCache(cacheKey, children);

    return children;
  }

  /**
   * Get parent entity
   * @param {string} entityId
   * @returns {Promise<Object|null>}
   */
  async getParent(entityId) {
    const cacheKey = this.getCacheKey(entityId, { type: 'parent' });

    const cached = this.getFromCache(cacheKey);
    if (cached !== undefined) return cached;

    const result = await this.runQuery(`
      MATCH (parent)-[:CONTAINS]->(e {id: $entityId})
      RETURN {
        id: parent.id,
        name: parent.name,
        description: parent.description,
        type: parent.type,
        _nodeType: toLower(labels(parent)[0])
      } AS parent
      LIMIT 1
    `, { entityId });

    const parent = result.records[0]?.get('parent') || null;
    this.setInCache(cacheKey, parent);

    return parent;
  }

  /**
   * Get universe for an entity
   * @param {string} entityId
   * @returns {Promise<Object|null>}
   */
  async getUniverse(entityId) {
    const cacheKey = this.getCacheKey(entityId, { type: 'universe' });

    const cached = this.getFromCache(cacheKey);
    if (cached !== undefined) return cached;

    const result = await this.runQuery(`
      MATCH (u:Universe)-[:CONTAINS*0..]->(e {id: $entityId})
      RETURN {
        id: u.id,
        name: u.name,
        description: u.description,
        type: u.type,
        _nodeType: 'universe'
      } AS universe
      LIMIT 1
    `, { entityId });

    const universe = result.records[0]?.get('universe') || null;
    this.setInCache(cacheKey, universe);

    return universe;
  }

  getRelevance(sourceType, targetType, generationTarget) {
    // Hierarchy is always highly relevant
    return 0.9;
  }
}
