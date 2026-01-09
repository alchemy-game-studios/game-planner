/**
 * Event Serializer
 *
 * Serializes Event entities with timeline and participant context.
 */

import { BaseSerializer } from './base-serializer.js';

export class EventSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['event'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Event heading
    lines.push(this.heading(`${entity.name}`, 3 + depth));

    // Type
    if (entity.type) {
      lines.push(this.kvPair('Type', this.formatType(entity.type)));
    }

    // Timeline info
    if (entity.day !== undefined && entity.day !== null) {
      lines.push(this.kvPair('Day', entity.day));
    }
    if (entity.startDate || entity.endDate) {
      const dateRange = [entity.startDate, entity.endDate].filter(Boolean).join(' - ');
      lines.push(this.kvPair('Date', dateRange));
    }

    // Location(s)
    if (entity._locations?.length > 0) {
      const locations = entity._locations.map(l => l.name).join(', ');
      lines.push(this.kvPair('Location', locations));
    }

    // Parent narrative
    if (entity._narrative) {
      lines.push(this.kvPair('Part of', entity._narrative.name));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Participants
    if (entity._participants?.length > 0) {
      lines.push('');
      lines.push('**Participants:**');
      const participants = entity._participants
        .slice(0, 8)
        .map(p => `${p.name} (${p._nodeType || 'character'})`);
      lines.push(this.bulletList(participants));
    }

    // Related events
    if (entity._relatedEvents?.length > 0) {
      lines.push('');
      lines.push('**Related Events:**');
      const events = entity._relatedEvents
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
      nodeType: 'event',
      type: entity.type,
      description: entity.description,
      day: entity.day,
      startDate: entity.startDate,
      endDate: entity.endDate,
      narrative: entity._narrative ? {
        id: entity._narrative.id,
        name: entity._narrative.name
      } : null,
      locations: entity._locations?.map(l => ({
        id: l.id,
        name: l.name
      })) || [],
      participants: entity._participants?.map(p => ({
        id: p.id,
        name: p.name,
        nodeType: p._nodeType
      })) || [],
      relatedEvents: entity._relatedEvents?.map(e => ({
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
