/**
 * Character Serializer
 *
 * Serializes Character entities with relationship context.
 */

import { BaseSerializer } from './base-serializer.js';

export class CharacterSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['character'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Character heading
    lines.push(this.heading(`${entity.name}`, 3 + depth));

    // Type/role
    if (entity.type) {
      lines.push(this.kvPair('Role', this.formatType(entity.type)));
    }

    // Location
    if (entity._location) {
      lines.push(this.kvPair('Location', entity._location.name));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Items/possessions
    if (entity._items?.length > 0) {
      lines.push('');
      lines.push('**Possessions:**');
      const items = entity._items
        .slice(0, 5)
        .map(i => i.name);
      lines.push(this.bulletList(items));
    }

    // Events involved in
    if (entity._events?.length > 0) {
      lines.push('');
      lines.push('**Key Events:**');
      const events = entity._events
        .slice(0, 3)
        .map(e => e.name);
      lines.push(this.bulletList(events));
    }

    // Relationships
    if (entity._relationships?.length > 0) {
      lines.push('');
      lines.push('**Relationships:**');
      const rels = entity._relationships
        .slice(0, 5)
        .map(r => `${r.name} (${r.relationshipType || 'associated'})`);
      lines.push(this.bulletList(rels));
    }

    // Tags
    if (entity.tags?.length > 0) {
      lines.push('');
      lines.push(this.kvPair('Tags', entity.tags.map(t => t.name).join(', ')));
    }

    return lines.join('\n');
  }

  toStructured(entity, options = {}) {
    return {
      id: entity.id,
      name: entity.name,
      nodeType: 'character',
      type: entity.type,
      description: entity.description,
      location: entity._location ? {
        id: entity._location.id,
        name: entity._location.name
      } : null,
      items: entity._items?.map(i => ({
        id: i.id,
        name: i.name,
        type: i.type
      })) || [],
      events: entity._events?.map(e => ({
        id: e.id,
        name: e.name
      })) || [],
      relationships: entity._relationships?.map(r => ({
        id: r.id,
        name: r.name,
        relationshipType: r.relationshipType
      })) || [],
      tags: entity.tags?.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type
      })) || []
    };
  }
}
