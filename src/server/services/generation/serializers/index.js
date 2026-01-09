/**
 * Serializer Registry
 *
 * Central registry for entity serializers.
 * Provides factory method to get appropriate serializer for entity type.
 */

import { BaseSerializer } from './base-serializer.js';
import { UniverseSerializer } from './universe-serializer.js';
import { PlaceSerializer } from './place-serializer.js';
import { CharacterSerializer } from './character-serializer.js';
import { ItemSerializer } from './item-serializer.js';
import { EventSerializer } from './event-serializer.js';
import { NarrativeSerializer } from './narrative-serializer.js';
import { TagSerializer } from './tag-serializer.js';
import { ProductSerializer } from './product-serializer.js';

/**
 * Default serializer for unknown entity types
 */
class DefaultSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['default'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];
    const type = entity._nodeType || 'Entity';

    lines.push(this.heading(`${entity.name} (${this.formatType(type)})`, 3 + depth));

    if (entity.description) {
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    if (entity.type) {
      lines.push(this.kvPair('Type', this.formatType(entity.type)));
    }

    return lines.filter(Boolean).join('\n\n');
  }

  toStructured(entity, options = {}) {
    return {
      id: entity.id,
      name: entity.name,
      nodeType: entity._nodeType,
      type: entity.type,
      description: entity.description
    };
  }
}

/**
 * Serializer Registry
 */
export class SerializerRegistry {
  constructor() {
    this.serializers = new Map();
    this.defaultSerializer = new DefaultSerializer();
  }

  /**
   * Register a serializer for its supported types
   * @param {BaseSerializer} serializer
   */
  register(serializer) {
    for (const type of serializer.supportedTypes) {
      this.serializers.set(type.toLowerCase(), serializer);
    }
  }

  /**
   * Get serializer for entity type
   * @param {string} nodeType
   * @returns {BaseSerializer}
   */
  get(nodeType) {
    if (!nodeType) return this.defaultSerializer;
    return this.serializers.get(nodeType.toLowerCase()) || this.defaultSerializer;
  }

  /**
   * Serialize an entity using appropriate serializer
   * @param {Object} entity
   * @param {Object} options
   * @returns {Object}
   */
  serialize(entity, options = {}) {
    const serializer = this.get(entity._nodeType);
    return serializer.serialize(entity, options);
  }

  /**
   * Get all registered type names
   * @returns {string[]}
   */
  getRegisteredTypes() {
    return Array.from(this.serializers.keys());
  }
}

/**
 * Create and configure the default serializer registry
 * @returns {SerializerRegistry}
 */
export function createSerializerRegistry() {
  const registry = new SerializerRegistry();

  registry.register(new UniverseSerializer());
  registry.register(new PlaceSerializer());
  registry.register(new CharacterSerializer());
  registry.register(new ItemSerializer());
  registry.register(new EventSerializer());
  registry.register(new NarrativeSerializer());
  registry.register(new TagSerializer());
  registry.register(new ProductSerializer());

  return registry;
}

// Export individual serializers for direct use
export { BaseSerializer } from './base-serializer.js';
export { UniverseSerializer } from './universe-serializer.js';
export { PlaceSerializer } from './place-serializer.js';
export { CharacterSerializer } from './character-serializer.js';
export { ItemSerializer } from './item-serializer.js';
export { EventSerializer } from './event-serializer.js';
export { NarrativeSerializer } from './narrative-serializer.js';
export { TagSerializer } from './tag-serializer.js';
export { ProductSerializer } from './product-serializer.js';
