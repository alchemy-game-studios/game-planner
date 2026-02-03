/**
 * Tag Resolver
 *
 * Resolves TAGGED relationships between entities and tags.
 */

import { BaseResolver } from './base-resolver.js';

export class TagResolver extends BaseResolver {
  get relationshipTypes() {
    return ['TAGGED'];
  }

  /**
   * Get tags for an entity
   * @param {string} entityId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async resolve(entityId, options = {}) {
    const cacheKey = this.getCacheKey(entityId, { type: 'entityTags' });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (e {id: $entityId})-[:TAGGED]->(t:Tag)
      RETURN {
        id: t.id,
        name: t.name,
        description: t.description,
        type: t.type,
        _nodeType: 'tag'
      } AS tag
      ORDER BY t.name
    `, { entityId });

    const tags = result.records.map(r => r.get('tag'));
    this.setInCache(cacheKey, tags);

    return tags;
  }

  /**
   * Get all tags in a universe with entity counts
   * @param {string} universeId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getUniverseTags(universeId, options = {}) {
    const cacheKey = this.getCacheKey(universeId, { type: 'universeTags' });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      // Get all entities in the universe
      MATCH (u:Universe {id: $universeId})-[:CONTAINS*0..]->(e)
      // Find tags used by these entities
      MATCH (e)-[:TAGGED]->(t:Tag)
      WITH t, count(DISTINCT e) AS entityCount
      RETURN {
        id: t.id,
        name: t.name,
        description: t.description,
        type: t.type,
        _nodeType: 'tag',
        _entityCount: entityCount
      } AS tag
      ORDER BY entityCount DESC, t.name
    `, { universeId });

    const tags = result.records.map(r => {
      const tag = r.get('tag');
      return {
        ...tag,
        _entityCount: this.toNumber(tag._entityCount)
      };
    });

    this.setInCache(cacheKey, tags);
    return tags;
  }

  /**
   * Get entities with a specific tag
   * @param {string} tagId
   * @param {Object} options
   * @param {number} options.limit - Max entities to return
   * @param {string} options.universeId - Filter to specific universe
   * @returns {Promise<Array>}
   */
  async getTaggedEntities(tagId, options = {}) {
    const { limit = 20, universeId } = options;
    const cacheKey = this.getCacheKey(tagId, { type: 'taggedEntities', limit, universeId });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const universeFilter = universeId
      ? `AND (u:Universe {id: $universeId})-[:CONTAINS*0..]->(e)`
      : '';

    const result = await this.runQuery(`
      MATCH (e)-[:TAGGED]->(t:Tag {id: $tagId})
      ${universeFilter ? `MATCH ${universeFilter.slice(4)}` : ''}
      RETURN {
        id: e.id,
        name: e.name,
        description: e.description,
        type: e.type,
        _nodeType: toLower(labels(e)[0])
      } AS entity
      ORDER BY entity.name
      LIMIT $limit
    `, { tagId, universeId, limit });

    const entities = result.records.map(r => r.get('entity'));
    this.setInCache(cacheKey, entities);

    return entities;
  }

  /**
   * Find entities with the same tags as the source
   * @param {string} entityId
   * @param {Object} options
   * @param {number} options.limit - Max entities to return
   * @returns {Promise<Array>}
   */
  async getSameTagEntities(entityId, options = {}) {
    const { limit = 10 } = options;
    const cacheKey = this.getCacheKey(entityId, { type: 'sameTag', limit });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (source {id: $entityId})-[:TAGGED]->(tag:Tag)<-[:TAGGED]-(related)
      WHERE related.id <> $entityId
      WITH related, count(DISTINCT tag) AS sharedTags
      RETURN {
        id: related.id,
        name: related.name,
        description: related.description,
        type: related.type,
        _nodeType: toLower(labels(related)[0]),
        _sharedTags: sharedTags
      } AS entity
      ORDER BY sharedTags DESC, entity.name
      LIMIT $limit
    `, { entityId, limit });

    const entities = result.records.map(r => {
      const entity = r.get('entity');
      return {
        ...entity,
        _sharedTags: this.toNumber(entity._sharedTags)
      };
    });

    this.setInCache(cacheKey, entities);
    return entities;
  }

  /**
   * Get a tag by ID
   * @param {string} tagId
   * @returns {Promise<Object|null>}
   */
  async getTagById(tagId) {
    const cacheKey = this.getCacheKey(tagId, { type: 'tagById' });

    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.runQuery(`
      MATCH (t:Tag {id: $tagId})
      RETURN {
        id: t.id,
        name: t.name,
        description: t.description,
        type: t.type,
        _nodeType: 'tag'
      } AS tag
    `, { tagId });

    if (result.records.length === 0) return null;

    const tag = result.records[0].get('tag');
    this.setInCache(cacheKey, tag);

    return tag;
  }

  getRelevance(sourceType, targetType, generationTarget) {
    // Tags are important for style consistency
    return 0.8;
  }
}
