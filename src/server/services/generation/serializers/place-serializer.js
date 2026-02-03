/**
 * Place Serializer
 *
 * Serializes Place entities with location context.
 */

import { BaseSerializer } from './base-serializer.js';

export class PlaceSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['place'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Place heading
    lines.push(this.heading(`${entity.name}`, 3 + depth));

    // Type
    if (entity.type) {
      lines.push(this.kvPair('Type', this.formatType(entity.type)));
    }

    // Parent location
    if (entity._parentPlace) {
      lines.push(this.kvPair('Located in', entity._parentPlace.name));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Notable inhabitants
    if (entity._inhabitants?.length > 0) {
      lines.push('');
      lines.push('**Notable Inhabitants:**');
      const inhabitants = entity._inhabitants
        .slice(0, 5)
        .map(c => c.name);
      lines.push(this.bulletList(inhabitants));
    }

    // Sub-locations
    if (entity._subLocations?.length > 0) {
      lines.push('');
      lines.push('**Sub-locations:**');
      const locations = entity._subLocations
        .slice(0, 5)
        .map(p => p.name);
      lines.push(this.bulletList(locations));
    }

    // Events that occurred here
    if (entity._events?.length > 0) {
      lines.push('');
      lines.push('**Notable Events:**');
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
      nodeType: 'place',
      type: entity.type,
      description: entity.description,
      parentPlace: entity._parentPlace ? {
        id: entity._parentPlace.id,
        name: entity._parentPlace.name
      } : null,
      inhabitants: entity._inhabitants?.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      })) || [],
      subLocations: entity._subLocations?.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type
      })) || [],
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
