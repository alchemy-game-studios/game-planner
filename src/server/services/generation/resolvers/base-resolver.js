/**
 * Base Resolver
 *
 * Abstract base class for relationship resolvers.
 * Provides caching and common Neo4j query utilities.
 */

import neo4j from 'neo4j-driver';

export class BaseResolver {
  /**
   * @param {Object} driver - Neo4j driver instance
   * @param {Object} options - Resolver options
   * @param {boolean} options.enableCache - Enable result caching
   * @param {number} options.cacheTTL - Cache TTL in milliseconds
   */
  constructor(driver, options = {}) {
    this.driver = driver;
    this.enableCache = options.enableCache ?? true;
    this.cacheTTL = options.cacheTTL ?? 60000; // 1 minute default
    this.cache = new Map();
    this.cacheTimestamps = new Map();
  }

  /**
   * Relationship types this resolver handles
   * @returns {string[]}
   */
  get relationshipTypes() {
    throw new Error('Subclass must implement relationshipTypes');
  }

  /**
   * Resolve related entities
   * @param {string} entityId - Source entity ID
   * @param {Object} options - Resolution options
   * @returns {Promise<Array>} Resolved relationships
   */
  async resolve(entityId, options = {}) {
    throw new Error('Subclass must implement resolve');
  }

  /**
   * Get relevance score for a relationship
   * @param {string} sourceType - Source entity type
   * @param {string} targetType - Target entity type
   * @param {string} generationTarget - Type being generated
   * @returns {number} Relevance score 0-1
   */
  getRelevance(sourceType, targetType, generationTarget) {
    return 0.5; // Default medium relevance
  }

  // ============================================
  // Caching utilities
  // ============================================

  /**
   * Generate cache key from entity ID and options
   * @param {string} entityId
   * @param {Object} options
   * @returns {string}
   */
  getCacheKey(entityId, options) {
    return `${entityId}:${JSON.stringify(options)}`;
  }

  /**
   * Get cached result if valid
   * @param {string} key
   * @returns {any|null}
   */
  getFromCache(key) {
    if (!this.enableCache) return null;

    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return null;

    if (Date.now() - timestamp > this.cacheTTL) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Store result in cache
   * @param {string} key
   * @param {any} value
   */
  setInCache(key, value) {
    if (!this.enableCache) return;

    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Clear all cached results
   */
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // ============================================
  // Neo4j query utilities
  // ============================================

  /**
   * Run a Cypher query
   * @param {string} cypher - Cypher query string
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async runQuery(cypher, params = {}) {
    // Convert integer params to Neo4j integers
    const processedParams = this.processParams(params);

    const session = this.driver.session();
    try {
      return await session.run(cypher, processedParams);
    } finally {
      await session.close();
    }
  }

  /**
   * Process params to convert numbers to Neo4j integers where needed
   * @param {Object} params
   * @returns {Object}
   */
  processParams(params) {
    const integerParamNames = ['limit', 'offset', 'maxDepth', 'depth', 'count'];
    const result = { ...params };

    for (const [key, value] of Object.entries(result)) {
      if (integerParamNames.includes(key) && typeof value === 'number') {
        result[key] = neo4j.int(Math.floor(value));
      }
    }

    return result;
  }

  /**
   * Extract entity properties from Neo4j record
   * @param {Object} node - Neo4j node
   * @returns {Object} Entity object
   */
  extractEntity(node) {
    if (!node) return null;

    const props = node.properties || node;
    const labels = node.labels || [];

    return {
      id: props.id,
      name: props.name,
      description: props.description,
      type: props.type,
      _nodeType: labels[0]?.toLowerCase() || props._nodeType,
      ...this.extractAdditionalProps(props)
    };
  }

  /**
   * Extract additional properties based on entity type
   * Override in subclasses for type-specific properties
   * @param {Object} props - Node properties
   * @returns {Object} Additional properties
   */
  extractAdditionalProps(props) {
    return {};
  }

  /**
   * Convert Neo4j integer to JavaScript number
   * @param {any} value - Neo4j value
   * @returns {number|any}
   */
  toNumber(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'object' && value.toNumber) {
      return value.toNumber();
    }
    return value;
  }

  /**
   * Process query results into entity array
   * @param {Object} result - Neo4j query result
   * @param {string} key - Record key to extract
   * @returns {Array} Array of entities
   */
  processResults(result, key) {
    return result.records.map(record => {
      const data = record.get(key);
      if (!data) return null;
      return this.extractEntity(data);
    }).filter(Boolean);
  }
}
