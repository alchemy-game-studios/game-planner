/**
 * Involvement Provider
 *
 * Provides event involvement context (INVOLVES, OCCURS_AT).
 * Important for characters, events, and narratives.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';

export class InvolvementProvider extends BaseProvider {
  get name() {
    return 'involvement';
  }

  /**
   * Relevant for events, characters, and narratives
   */
  isRelevant(targetType) {
    const relevantTypes = ['event', 'character', 'narrative'];
    return relevantTypes.includes(targetType?.toLowerCase());
  }

  /**
   * Gather involvement relationships
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { entityId, sourceEntity } = params;

    if (!entityId) {
      return this.createResult([]);
    }

    const involvementResolver = this.resolvers.get('involvement');
    if (!involvementResolver) {
      return this.createResult([]);
    }

    const entities = [];
    const involvement = await involvementResolver.resolve(entityId);

    // If source is an event, get participants and locations
    const sourceType = sourceEntity?._nodeType?.toLowerCase();

    if (sourceType === 'event') {
      // Add participants
      involvement.participants.slice(0, PROVIDER_LIMITS.involvement).forEach(p => {
        p._contextRole = 'participant';
        p._depth = 1;
        entities.push(p);
      });

      // Add locations
      involvement.locations.slice(0, 2).forEach(l => {
        l._contextRole = 'eventLocation';
        l._depth = 1;
        entities.push(l);
      });
    } else {
      // For characters/items, show events they're involved in
      involvement.events.slice(0, PROVIDER_LIMITS.involvement).forEach(e => {
        e._contextRole = 'relatedEvent';
        e._depth = 1;
        entities.push(e);
      });

      // Get co-participants for character context
      const coParticipants = await involvementResolver.getCoParticipants(entityId, {
        limit: Math.floor(PROVIDER_LIMITS.involvement / 2) | 0
      });

      coParticipants.forEach(cp => {
        cp._contextRole = 'coParticipant';
        cp._depth = 2;
        entities.push(cp);
      });
    }

    return this.createResult(entities, {
      summary: entities.length > 0
        ? `Involvement: ${entities.length} related entities (${involvement.events.length} events, ${involvement.participants.length} participants)`
        : 'No involvement context'
    });
  }
}
