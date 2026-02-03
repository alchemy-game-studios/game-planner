/**
 * Base Serializer
 *
 * Abstract base class for entity serializers.
 * Provides common utilities and interface for converting Neo4j entities
 * to various output formats (markdown, structured, document).
 */

export class BaseSerializer {
  /**
   * Entity types this serializer handles
   * @returns {string[]}
   */
  get supportedTypes() {
    throw new Error('Subclass must implement supportedTypes');
  }

  /**
   * Serialize an entity to the specified format
   * @param {Object} entity - Neo4j entity object
   * @param {Object} options - Serialization options
   * @param {string} options.format - Output format: 'markdown' | 'structured' | 'document'
   * @param {number} options.depth - Nesting depth for indentation
   * @param {boolean} options.includeRelations - Whether to include relationship info
   * @param {number} options.maxDescriptionLength - Max chars for description
   * @returns {Object} Serialized entity
   */
  serialize(entity, options = {}) {
    const { format = 'markdown', depth = 0 } = options;

    const base = {
      id: entity.id,
      nodeType: entity._nodeType || this.supportedTypes[0],
      metadata: this.buildMetadata(entity, options)
    };

    switch (format) {
      case 'markdown':
        return { ...base, content: this.toMarkdown(entity, depth, options) };
      case 'structured':
        return { ...base, content: this.toStructured(entity, options) };
      case 'document':
        return this.toDocument(entity, options);
      default:
        return { ...base, content: this.toMarkdown(entity, depth, options) };
    }
  }

  /**
   * Build metadata object for the entity
   * @param {Object} entity
   * @param {Object} options
   * @returns {Object}
   */
  buildMetadata(entity, options = {}) {
    return {
      nodeType: entity._nodeType || this.supportedTypes[0],
      name: entity.name,
      depth: options.depth || 0,
      relevanceScore: entity._relevanceScore || 1.0,
      tags: entity.tags?.map(t => t.name) || []
    };
  }

  /**
   * Convert entity to markdown format
   * @param {Object} entity
   * @param {number} depth
   * @param {Object} options
   * @returns {string}
   */
  toMarkdown(entity, depth = 0, options = {}) {
    throw new Error('Subclass must implement toMarkdown');
  }

  /**
   * Convert entity to structured JSON format
   * @param {Object} entity
   * @param {Object} options
   * @returns {Object}
   */
  toStructured(entity, options = {}) {
    throw new Error('Subclass must implement toStructured');
  }

  /**
   * Convert entity to LangChain Document format
   * @param {Object} entity
   * @param {Object} options
   * @returns {Object}
   */
  toDocument(entity, options = {}) {
    return {
      pageContent: this.toMarkdown(entity, 0, options),
      metadata: this.buildMetadata(entity, options)
    };
  }

  // ============================================
  // Utility methods for subclasses
  // ============================================

  /**
   * Indent text by depth level
   * @param {string} text
   * @param {number} depth
   * @returns {string}
   */
  indent(text, depth) {
    const prefix = '  '.repeat(depth);
    return text.split('\n').map(line => prefix + line).join('\n');
  }

  /**
   * Create a markdown heading at the appropriate level
   * @param {string} text
   * @param {number} level - 1-6
   * @returns {string}
   */
  heading(text, level = 2) {
    const hashes = '#'.repeat(Math.min(Math.max(level, 1), 6));
    return `${hashes} ${text}`;
  }

  /**
   * Truncate text to max length with ellipsis
   * @param {string} text
   * @param {number} maxLength
   * @returns {string}
   */
  truncate(text, maxLength = 200) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  /**
   * Format a list of items as markdown bullets
   * @param {string[]} items
   * @param {number} depth
   * @returns {string}
   */
  bulletList(items, depth = 0) {
    const prefix = '  '.repeat(depth);
    return items.map(item => `${prefix}- ${item}`).join('\n');
  }

  /**
   * Clean and normalize description text
   * @param {string} text
   * @returns {string}
   */
  cleanDescription(text) {
    if (!text) return '';
    // Remove excessive whitespace, normalize line breaks
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Format entity type for display (capitalize, handle underscores)
   * @param {string} type
   * @returns {string}
   */
  formatType(type) {
    if (!type) return '';
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Create a key-value pair for markdown
   * @param {string} key
   * @param {any} value
   * @returns {string}
   */
  kvPair(key, value) {
    if (value === undefined || value === null || value === '') return '';
    return `**${key}:** ${value}`;
  }
}
