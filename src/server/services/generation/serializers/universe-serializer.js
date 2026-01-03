/**
 * Universe Serializer
 *
 * Serializes Universe entities with world-level context.
 */

import { BaseSerializer } from './base-serializer.js';

export class UniverseSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['universe'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Universe heading
    lines.push(this.heading(`Universe: ${entity.name}`, 2 + depth));

    // Type/genre
    if (entity.type) {
      lines.push(this.kvPair('Genre', this.formatType(entity.type)));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Entity counts if available
    if (entity._entityCounts) {
      lines.push('');
      lines.push('**World Contents:**');
      const counts = [];
      if (entity._entityCounts.places) counts.push(`${entity._entityCounts.places} places`);
      if (entity._entityCounts.characters) counts.push(`${entity._entityCounts.characters} characters`);
      if (entity._entityCounts.items) counts.push(`${entity._entityCounts.items} items`);
      if (entity._entityCounts.events) counts.push(`${entity._entityCounts.events} events`);
      if (entity._entityCounts.narratives) counts.push(`${entity._entityCounts.narratives} narratives`);
      lines.push(counts.join(' | '));
    }

    // Tags
    if (entity.tags?.length > 0) {
      lines.push('');
      lines.push(this.kvPair('Style Tags', entity.tags.map(t => t.name).join(', ')));
    }

    return lines.join('\n');
  }

  toStructured(entity, options = {}) {
    return {
      id: entity.id,
      name: entity.name,
      nodeType: 'universe',
      type: entity.type,
      description: entity.description,
      entityCounts: entity._entityCounts || null,
      tags: entity.tags?.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type
      })) || []
    };
  }
}
