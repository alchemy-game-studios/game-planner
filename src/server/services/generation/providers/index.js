/**
 * Provider Registry
 *
 * Central registry for context providers.
 */

import { BaseProvider } from './base-provider.js';
import { SourceProvider } from './source-provider.js';
import { HierarchyProvider } from './hierarchy-provider.js';
import { SiblingProvider } from './sibling-provider.js';
import { TagProvider } from './tag-provider.js';
import { InvolvementProvider } from './involvement-provider.js';
import { ProductProvider } from './product-provider.js';
import { CustomProvider } from './custom-provider.js';

/**
 * Provider Registry
 */
export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  /**
   * Register a provider
   * @param {BaseProvider} provider
   */
  register(provider) {
    this.providers.set(provider.name, provider);
  }

  /**
   * Get a provider by name
   * @param {string} name
   * @returns {BaseProvider|undefined}
   */
  get(name) {
    return this.providers.get(name);
  }

  /**
   * Get all registered providers
   * @returns {Map}
   */
  getAll() {
    return this.providers;
  }

  /**
   * Get providers sorted by priority (highest first)
   * @returns {BaseProvider[]}
   */
  getSorted() {
    return Array.from(this.providers.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get providers relevant for a target type, sorted by priority
   * @param {string} targetType
   * @returns {BaseProvider[]}
   */
  getRelevant(targetType) {
    return this.getSorted()
      .filter(provider => provider.isRelevant(targetType));
  }

  /**
   * Gather context from all relevant providers
   * @param {Object} params - Generation parameters
   * @returns {Promise<ProviderResult[]>}
   */
  async gatherAll(params) {
    const { targetType } = params;
    const relevantProviders = this.getRelevant(targetType);

    const results = await Promise.all(
      relevantProviders.map(provider => provider.gather(params))
    );

    return results.filter(r => r.count > 0);
  }
}

/**
 * Create and configure the default provider registry
 * @param {Object} resolvers - ResolverRegistry instance
 * @param {Object} serializers - SerializerRegistry instance
 * @param {Object} options - Provider options
 * @returns {ProviderRegistry}
 */
export function createProviderRegistry(resolvers, serializers, options = {}) {
  const registry = new ProviderRegistry();

  registry.register(new SourceProvider(resolvers, serializers, options));
  registry.register(new HierarchyProvider(resolvers, serializers, options));
  registry.register(new SiblingProvider(resolvers, serializers, options));
  registry.register(new TagProvider(resolvers, serializers, options));
  registry.register(new InvolvementProvider(resolvers, serializers, options));
  registry.register(new ProductProvider(resolvers, serializers, options));
  registry.register(new CustomProvider(resolvers, serializers, options));

  return registry;
}

// Export individual providers for direct use
export { BaseProvider } from './base-provider.js';
export { SourceProvider } from './source-provider.js';
export { HierarchyProvider } from './hierarchy-provider.js';
export { SiblingProvider } from './sibling-provider.js';
export { TagProvider } from './tag-provider.js';
export { InvolvementProvider } from './involvement-provider.js';
export { ProductProvider } from './product-provider.js';
export { CustomProvider } from './custom-provider.js';
