/**
 * Item Serializer
 *
 * Serializes Item entities with ownership and origin context.
 */

import { BaseSerializer } from './base-serializer.js';

export class ItemSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['item'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Item heading
    lines.push(this.heading(`${entity.name}`, 3 + depth));

    // Type
    if (entity.type) {
      lines.push(this.kvPair('Type', this.formatType(entity.type)));
    }

    // Owner
    if (entity._owner) {
      lines.push(this.kvPair('Owner', entity._owner.name));
    }

    // Origin/location
    if (entity._origin) {
      lines.push(this.kvPair('Origin', entity._origin.name));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Events involving this item
    if (entity._events?.length > 0) {
      lines.push('');
      lines.push('**Appears in Events:**');
      const events = entity._events
        .slice(0, 3)
        .map(e => e.name);
      lines.push(this.bulletList(events));
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
      nodeType: 'item',
      type: entity.type,
      description: entity.description,
      owner: entity._owner ? {
        id: entity._owner.id,
        name: entity._owner.name
      } : null,
      origin: entity._origin ? {
        id: entity._origin.id,
        name: entity._origin.name
      } : null,
      events: entity._events?.map(e => ({
        id: e.id,
        name: e.name
      })) || [],
      tags: entity.tags?.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type
      })) || []
    };
  }
}
