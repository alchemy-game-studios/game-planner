/**
 * Narrative Serializer
 *
 * Serializes Narrative entities with story structure context.
 */

import { BaseSerializer } from './base-serializer.js';

export class NarrativeSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['narrative'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Narrative heading
    lines.push(this.heading(`${entity.name}`, 3 + depth));

    // Type
    if (entity.type) {
      lines.push(this.kvPair('Type', this.formatType(entity.type)));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Events in this narrative
    if (entity._events?.length > 0) {
      lines.push('');
      lines.push('**Events:**');
      const events = entity._events
        .slice(0, 10)
        .map(e => {
          const dayStr = e.day !== undefined ? ` (Day ${e.day})` : '';
          return `${e.name}${dayStr}`;
        });
      lines.push(this.bulletList(events));
    }

    // Key characters
    if (entity._characters?.length > 0) {
      lines.push('');
      lines.push('**Key Characters:**');
      const chars = entity._characters
        .slice(0, 6)
        .map(c => c.name);
      lines.push(this.bulletList(chars));
    }

    // Key locations
    if (entity._locations?.length > 0) {
      lines.push('');
      lines.push('**Locations:**');
      const locs = entity._locations
        .slice(0, 5)
        .map(l => l.name);
      lines.push(this.bulletList(locs));
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
      nodeType: 'narrative',
      type: entity.type,
      description: entity.description,
      events: entity._events?.map(e => ({
        id: e.id,
        name: e.name,
        day: e.day
      })) || [],
      characters: entity._characters?.map(c => ({
        id: c.id,
        name: c.name
      })) || [],
      locations: entity._locations?.map(l => ({
        id: l.id,
        name: l.name
      })) || [],
      tags: entity.tags?.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type
      })) || []
    };
  }
}
