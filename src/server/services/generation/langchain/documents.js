/**
 * LangChain Document Converters
 *
 * Converts assembled context to LangChain Document format
 * for use with retrievers and chains.
 */

import { Document } from '@langchain/core/documents';

/**
 * Convert assembled context entities to LangChain Documents
 * @param {Object} assembledContext - Output from ContextAssembler
 * @returns {Document[]}
 */
export function toDocuments(assembledContext) {
  const { entities = [] } = assembledContext;

  return entities.map(entity => new Document({
    pageContent: entity.content || '',
    metadata: {
      entityId: entity.id,
      entityType: entity.nodeType,
      name: entity.name,
      contextRole: entity._contextRole,
      relevanceScore: entity._relevanceScore,
      provider: entity._provider,
      tags: entity.tags || []
    }
  }));
}

/**
 * Convert a single entity to a Document
 * @param {Object} entity - Serialized entity
 * @returns {Document}
 */
export function entityToDocument(entity) {
  return new Document({
    pageContent: entity.content || entity.description || '',
    metadata: {
      entityId: entity.id,
      entityType: entity.nodeType || entity._nodeType,
      name: entity.name,
      type: entity.type,
      contextRole: entity._contextRole
    }
  });
}

/**
 * Create a combined document from assembled context
 * Useful when you need all context in a single document
 * @param {Object} assembledContext - Output from ContextAssembler
 * @param {Object} options
 * @param {number} options.maxTokens - Approximate max tokens (chars/4)
 * @param {boolean} options.prioritize - Whether to prioritize by relevance
 * @returns {Document}
 */
export function toCombinedDocument(assembledContext, options = {}) {
  const { maxTokens = 4000, prioritize = true } = options;
  const maxChars = maxTokens * 4; // Rough approximation

  let { entities } = assembledContext;

  // Sort by relevance if prioritizing
  if (prioritize) {
    entities = [...entities].sort((a, b) =>
      (b._relevanceScore || 0) - (a._relevanceScore || 0)
    );
  }

  // Build content respecting size limit
  const parts = [];
  let currentLength = 0;

  for (const entity of entities) {
    const content = entity.content || '';
    if (currentLength + content.length > maxChars) {
      // Truncate last entity to fit
      const remaining = maxChars - currentLength;
      if (remaining > 100) {
        parts.push(content.slice(0, remaining) + '...');
      }
      break;
    }
    parts.push(content);
    currentLength += content.length;
  }

  return new Document({
    pageContent: parts.join('\n\n'),
    metadata: {
      entityCount: assembledContext.entities.length,
      includedCount: parts.length,
      truncated: parts.length < assembledContext.entities.length,
      targetType: assembledContext.summary?.targetType,
      timestamp: assembledContext.metadata?.timestamp
    }
  });
}

/**
 * Create documents grouped by entity type
 * @param {Object} assembledContext
 * @returns {Object<string, Document[]>}
 */
export function toDocumentsByType(assembledContext) {
  const { entities = [] } = assembledContext;
  const grouped = {};

  for (const entity of entities) {
    const type = entity.nodeType || 'unknown';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(entityToDocument(entity));
  }

  return grouped;
}

/**
 * Create documents grouped by context role
 * @param {Object} assembledContext
 * @returns {Object<string, Document[]>}
 */
export function toDocumentsByRole(assembledContext) {
  const { entities = [] } = assembledContext;
  const grouped = {
    source: [],
    hierarchy: [],
    tags: [],
    relationships: [],
    custom: []
  };

  for (const entity of entities) {
    const role = entity._contextRole || 'custom';

    if (role === 'source' || role === 'sourceTag') {
      grouped.source.push(entityToDocument(entity));
    } else if (role === 'ancestor' || role === 'universe') {
      grouped.hierarchy.push(entityToDocument(entity));
    } else if (role.includes('Tag')) {
      grouped.tags.push(entityToDocument(entity));
    } else if (role === 'sibling' || role === 'participant' || role === 'coParticipant') {
      grouped.relationships.push(entityToDocument(entity));
    } else {
      grouped.custom.push(entityToDocument(entity));
    }
  }

  return grouped;
}
