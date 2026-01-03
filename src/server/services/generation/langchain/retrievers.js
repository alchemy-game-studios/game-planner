/**
 * LangChain Retrievers
 *
 * Custom retrievers for worldbuilding context.
 */

import { BaseRetriever } from '@langchain/core/retrievers';
import { toDocuments, toCombinedDocument } from './documents.js';

/**
 * Worldbuilding Retriever
 *
 * Retrieves relevant worldbuilding context for generation queries.
 * Uses the ContextAssembler to gather context based on entity relationships.
 */
export class WorldbuildingRetriever extends BaseRetriever {
  static lc_name() {
    return 'WorldbuildingRetriever';
  }

  /**
   * @param {Object} options
   * @param {ContextAssembler} options.assembler - Context assembler instance
   * @param {string} options.entityId - Default entity ID for context
   * @param {string} options.universeId - Default universe ID
   * @param {number} options.limit - Max documents to return
   * @param {number} options.minRelevance - Minimum relevance score
   */
  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
    this.entityId = options.entityId;
    this.universeId = options.universeId;
    this.limit = options.limit || 10;
    this.minRelevance = options.minRelevance || 0.3;
  }

  /**
   * Get relevant documents for a query
   * @param {string} query - The query string
   * @returns {Promise<Document[]>}
   */
  async _getRelevantDocuments(query) {
    if (!this.assembler) {
      throw new Error('WorldbuildingRetriever requires a ContextAssembler');
    }

    // Parse query for context hints
    const params = this.parseQuery(query);

    // Assemble context
    const context = await this.assembler.assemble({
      entityId: params.entityId || this.entityId,
      universeId: params.universeId || this.universeId,
      targetType: params.targetType || 'character',
      selectedContext: params.selectedContext || {}
    }, 'markdown');

    // Convert to documents
    let documents = toDocuments(context);

    // Filter by relevance
    documents = documents.filter(doc =>
      (doc.metadata.relevanceScore || 0) >= this.minRelevance
    );

    // Apply limit
    return documents.slice(0, this.limit);
  }

  /**
   * Parse query string for context parameters
   * @param {string} query
   * @returns {Object}
   */
  parseQuery(query) {
    const params = {};

    // Extract entity type mentions
    const typeMatches = query.match(/\b(character|place|item|event|narrative|universe)\b/gi);
    if (typeMatches && typeMatches.length > 0) {
      params.targetType = typeMatches[0].toLowerCase();
    }

    // Extract UUID patterns (potential entity IDs)
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const uuids = query.match(uuidPattern);
    if (uuids && uuids.length > 0) {
      params.entityId = uuids[0];
    }

    return params;
  }
}

/**
 * Entity Context Retriever
 *
 * Specialized retriever for a specific entity's context.
 * Caches results for repeated queries about the same entity.
 */
export class EntityContextRetriever extends BaseRetriever {
  static lc_name() {
    return 'EntityContextRetriever';
  }

  /**
   * @param {Object} options
   * @param {ContextAssembler} options.assembler
   * @param {string} options.entityId - The entity to retrieve context for
   * @param {string} options.targetType - Type of entity being generated
   * @param {Object} options.selectedContext - User-selected context
   */
  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
    this.entityId = options.entityId;
    this.targetType = options.targetType;
    this.selectedContext = options.selectedContext || {};
    this._cachedContext = null;
  }

  /**
   * Get relevant documents
   * @param {string} query - Query string (used for filtering)
   * @returns {Promise<Document[]>}
   */
  async _getRelevantDocuments(query) {
    // Use cached context if available
    if (!this._cachedContext) {
      this._cachedContext = await this.assembler.assemble({
        entityId: this.entityId,
        targetType: this.targetType,
        selectedContext: this.selectedContext
      }, 'markdown');
    }

    let documents = toDocuments(this._cachedContext);

    // Filter based on query keywords
    if (query) {
      const keywords = query.toLowerCase().split(/\s+/);
      documents = documents.filter(doc => {
        const content = doc.pageContent.toLowerCase();
        return keywords.some(kw => content.includes(kw));
      });
    }

    return documents;
  }

  /**
   * Clear cached context
   */
  clearCache() {
    this._cachedContext = null;
  }
}

/**
 * Product Context Retriever
 *
 * Retrieves context specific to product adaptation generation.
 */
export class ProductContextRetriever extends BaseRetriever {
  static lc_name() {
    return 'ProductContextRetriever';
  }

  /**
   * @param {Object} options
   * @param {ContextAssembler} options.assembler
   * @param {string} options.entityId - Source entity for adaptation
   * @param {Object} options.product - Product details
   */
  constructor(options = {}) {
    super();
    this.assembler = options.assembler;
    this.entityId = options.entityId;
    this.product = options.product;
  }

  /**
   * Get relevant documents for product adaptation
   * @param {string} query
   * @returns {Promise<Document[]>}
   */
  async _getRelevantDocuments(query) {
    const context = await this.assembler.assemble({
      entityId: this.entityId,
      targetType: 'adaptation',
      product: this.product,
      productId: this.product?.id
    }, 'markdown');

    return toDocuments(context);
  }
}

/**
 * Create a retriever for entity generation
 * @param {ContextAssembler} assembler
 * @param {Object} options
 * @returns {WorldbuildingRetriever}
 */
export function createWorldbuildingRetriever(assembler, options = {}) {
  return new WorldbuildingRetriever({
    assembler,
    ...options
  });
}

/**
 * Create a retriever for a specific entity
 * @param {ContextAssembler} assembler
 * @param {string} entityId
 * @param {Object} options
 * @returns {EntityContextRetriever}
 */
export function createEntityRetriever(assembler, entityId, options = {}) {
  return new EntityContextRetriever({
    assembler,
    entityId,
    ...options
  });
}
