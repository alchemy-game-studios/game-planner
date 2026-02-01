/**
 * Tag Serializer
 *
 * Serializes Tag entities with usage context and semantic meaning.
 */

import { BaseSerializer } from './base-serializer.js';

export class TagSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['tag'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Tag heading with type indicator
    const typeLabel = entity.type ? ` [${this.formatType(entity.type)}]` : '';
    lines.push(this.heading(`Tag: ${entity.name}${typeLabel}`, 3 + depth));

    // Description (semantic meaning)
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Example entities
    if (entity._exampleEntities?.length > 0) {
      lines.push('');
      lines.push('**Examples:**');
      const examples = entity._exampleEntities
        .slice(0, 5)
        .map(e => `${e.name} (${e._nodeType})`);
      lines.push(this.bulletList(examples));
    }

    return lines.join('\n');
  }

  toStructured(entity, options = {}) {
    return {
      id: entity.id,
      name: entity.name,
      nodeType: 'tag',
      type: entity.type,
      description: entity.description,
      entityCount: entity._entityCount || 0,
      exampleEntities: entity._exampleEntities?.map(e => ({
        id: e.id,
        name: e.name,
        nodeType: e._nodeType
      })) || []
    };
  }

  /**
   * Format tag for inline usage (e.g., in constraint lists)
   * @param {Object} tag
   * @returns {string}
   */
  toInline(tag) {
    if (tag.description) {
      return `**${tag.name}**: ${this.truncate(tag.description, 100)}`;
    }
    return `**${tag.name}**`;
  }
}
