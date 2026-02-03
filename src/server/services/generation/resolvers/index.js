/**
 * Resolver Registry
 *
 * Central registry for relationship resolvers.
 */

import { BaseResolver } from './base-resolver.js';
import { HierarchyResolver } from './hierarchy-resolver.js';
import { TagResolver } from './tag-resolver.js';
import { InvolvementResolver } from './involvement-resolver.js';
import { SiblingResolver } from './sibling-resolver.js';
import { RelevanceResolver } from './relevance-resolver.js';

/**
 * Resolver Registry
 */
export class ResolverRegistry {
  constructor() {
    this.resolvers = new Map();
  }

  /**
   * Register a resolver by name
   * @param {string} name
   * @param {BaseResolver} resolver
   */
  register(name, resolver) {
    this.resolvers.set(name, resolver);
  }

  /**
   * Get resolver by name
   * @param {string} name
   * @returns {BaseResolver|undefined}
   */
  get(name) {
    return this.resolvers.get(name);
  }

  /**
   * Get all registered resolvers
   * @returns {Map}
   */
  getAll() {
    return this.resolvers;
  }

  /**
   * Get resolvers that handle a specific relationship type
   * @param {string} relationshipType
   * @returns {BaseResolver[]}
   */
  getByRelationshipType(relationshipType) {
    return Array.from(this.resolvers.values()).filter(resolver =>
      resolver.relationshipTypes.includes(relationshipType)
    );
  }

  /**
   * Clear all resolver caches
   */
  clearAllCaches() {
    for (const resolver of this.resolvers.values()) {
      resolver.clearCache();
    }
  }
}

/**
 * Create and configure the default resolver registry
 * @param {Object} driver - Neo4j driver instance
 * @param {Object} options - Resolver options
 * @returns {ResolverRegistry}
 */
export function createResolverRegistry(driver, options = {}) {
  const registry = new ResolverRegistry();

  registry.register('hierarchy', new HierarchyResolver(driver, options));
  registry.register('tag', new TagResolver(driver, options));
  registry.register('involvement', new InvolvementResolver(driver, options));
  registry.register('sibling', new SiblingResolver(driver, options));
  registry.register('relevance', new RelevanceResolver(driver, options));

  return registry;
}

// Export individual resolvers for direct use
export { BaseResolver } from './base-resolver.js';
export { HierarchyResolver } from './hierarchy-resolver.js';
export { TagResolver } from './tag-resolver.js';
export { InvolvementResolver } from './involvement-resolver.js';
export { SiblingResolver } from './sibling-resolver.js';
export { RelevanceResolver } from './relevance-resolver.js';
