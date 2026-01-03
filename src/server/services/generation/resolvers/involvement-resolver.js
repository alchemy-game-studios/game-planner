/**
 * Involvement Resolver
 *
 * Resolves INVOLVES and OCCURS_AT relationships for events.
 */

import { BaseResolver } from './base-resolver.js';

export class InvolvementResolver extends BaseResolver {
  get relationshipTypes() {
    return ['INVOLVES', 'OCCURS_AT'];
  }

  /**
   * Get involvement relationships for an entity
   * @param {string} entityId
   * @param {Object} options
   * @returns {Promise<Object>} { participants: [], events: [], locations: [] }
   */
  async resolve(entityId, options = {}) {
    const cacheKey = this.getCacheKey(entityId, { type: 'involvement' });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (e {id: $entityId})

      // If this is an event, get its participants and locations
      OPTIONAL MATCH (e:Event)-[:INVOLVES]->(participant)
      WITH e, collect(DISTINCT {
        id: participant.id,
        name: participant.name,
        description: participant.description,
        type: participant.type,
        _nodeType: toLower(labels(participant)[0])
      }) AS participants

      OPTIONAL MATCH (e:Event)-[:OCCURS_AT]->(location:Place)
      WITH e, participants, collect(DISTINCT {
        id: location.id,
        name: location.name,
        description: location.description,
        type: location.type,
        _nodeType: 'place'
      }) AS locations

      // If this entity is involved in events
      OPTIONAL MATCH (event:Event)-[:INVOLVES]->(e)
      WITH e, participants, locations, collect(DISTINCT {
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        day: event.day,
        _nodeType: 'event'
      }) AS events

      RETURN {
        participants: [p IN participants WHERE p.id IS NOT NULL],
        locations: [l IN locations WHERE l.id IS NOT NULL],
        events: [ev IN events WHERE ev.id IS NOT NULL]
      } AS result
    `, { entityId });

    const involvement = result.records[0]?.get('result') || {
      participants: [],
      locations: [],
      events: []
    };

    // Convert Neo4j integers in events
    involvement.events = involvement.events.map(e => ({
      ...e,
      day: this.toNumber(e.day)
    }));

    this.setInCache(cacheKey, involvement);
    return involvement;
  }

  /**
   * Get all participants in an event
   * @param {string} eventId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getEventParticipants(eventId, options = {}) {
    const result = await this.runQuery(`
      MATCH (e:Event {id: $eventId})-[:INVOLVES]->(participant)
      RETURN {
        id: participant.id,
        name: participant.name,
        description: participant.description,
        type: participant.type,
        _nodeType: toLower(labels(participant)[0])
      } AS participant
      ORDER BY participant.name
    `, { eventId });

    return result.records.map(r => r.get('participant'));
  }

  /**
   * Get all locations for an event
   * @param {string} eventId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getEventLocations(eventId, options = {}) {
    const result = await this.runQuery(`
      MATCH (e:Event {id: $eventId})-[:OCCURS_AT]->(location:Place)
      RETURN {
        id: location.id,
        name: location.name,
        description: location.description,
        type: location.type,
        _nodeType: 'place'
      } AS location
      ORDER BY location.name
    `, { eventId });

    return result.records.map(r => r.get('location'));
  }

  /**
   * Find co-participants (entities involved in same events)
   * @param {string} entityId
   * @param {Object} options
   * @param {number} options.limit - Max entities to return
   * @returns {Promise<Array>}
   */
  async getCoParticipants(entityId, options = {}) {
    const { limit = 10 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'coParticipants', limit });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (source {id: $entityId})<-[:INVOLVES]-(event:Event)-[:INVOLVES]->(coParticipant)
      WHERE coParticipant.id <> $entityId
      WITH coParticipant, count(DISTINCT event) AS sharedEvents
      RETURN {
        id: coParticipant.id,
        name: coParticipant.name,
        description: coParticipant.description,
        type: coParticipant.type,
        _nodeType: toLower(labels(coParticipant)[0]),
        _sharedEvents: sharedEvents
      } AS entity
      ORDER BY sharedEvents DESC, entity.name
      LIMIT $limit
    `, { entityId, limit });

    const entities = result.records.map(r => {
      const entity = r.get('entity');
      return {
        ...entity,
        _sharedEvents: this.toNumber(entity._sharedEvents)
      };
    });

    this.setInCache(cacheKey, entities);
    return entities;
  }

  getRelevance(sourceType, targetType, generationTarget) {
    // High relevance for events and characters
    if (generationTarget === 'event') return 0.9;
    if (generationTarget === 'character') return 0.7;
    if (generationTarget === 'narrative') return 0.8;
    return 0.5;
  }
}
