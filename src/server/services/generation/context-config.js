/**
 * Context Configuration
 *
 * Defines relevance matrices, limits, and configuration for context assembly.
 */

/**
 * Relevance matrix: How relevant is source type for generating target type.
 * Values 0-1, higher = more relevant.
 *
 * Usage: RELEVANCE_MATRIX[generationTarget][sourceEntityType]
 */
export const RELEVANCE_MATRIX = {
  // When generating a Character...
  character: {
    universe: 0.4,   // World context for consistency
    place: 0.9,      // Location is critical for character
    character: 0.7,  // Other characters for relationships
    item: 0.5,       // Items they might own
    event: 0.6,      // Events they're involved in
    narrative: 0.4,  // Story context
    tag: 0.8,        // Style/tone constraints
    product: 0.3     // Product context rarely needed
  },

  // When generating a Place...
  place: {
    universe: 0.5,   // World context
    place: 0.8,      // Sibling/nearby places
    character: 0.6,  // Notable inhabitants
    item: 0.4,       // Notable items
    event: 0.7,      // Events that occurred here
    narrative: 0.5,  // Story relevance
    tag: 0.8,        // Style constraints
    product: 0.3
  },

  // When generating an Item...
  item: {
    universe: 0.3,
    place: 0.5,      // Where it's found
    character: 0.7,  // Owner/creator
    item: 0.6,       // Related items
    event: 0.5,      // Events involving it
    narrative: 0.3,
    tag: 0.6,
    product: 0.3
  },

  // When generating an Event...
  event: {
    universe: 0.4,
    place: 0.9,      // Location is critical
    character: 0.9,  // Participants are critical
    item: 0.6,       // Items involved
    event: 0.8,      // Related/preceding events
    narrative: 0.9,  // Parent narrative is critical
    tag: 0.7,
    product: 0.3
  },

  // When generating a Narrative...
  narrative: {
    universe: 0.5,
    place: 0.7,      // Settings
    character: 0.8,  // Cast
    item: 0.4,
    event: 0.9,      // Events in the narrative
    narrative: 0.6,  // Related narratives
    tag: 0.8,
    product: 0.3
  },

  // When generating a Tag...
  tag: {
    universe: 0.6,
    place: 0.3,
    character: 0.3,
    item: 0.3,
    event: 0.3,
    narrative: 0.3,
    tag: 0.8,        // Other tags for consistency
    product: 0.2
  },

  // When generating a Product adaptation...
  adaptation: {
    universe: 0.5,
    place: 0.5,
    character: 0.8,  // Source entity context
    item: 0.8,
    event: 0.6,
    narrative: 0.5,
    tag: 0.6,
    product: 0.9     // Product context is critical
  },

  // When generating a Product section...
  section: {
    universe: 0.4,
    place: 0.7,
    character: 0.7,
    item: 0.5,
    event: 0.6,
    narrative: 0.6,
    tag: 0.5,
    product: 0.9     // Product context is critical
  }
};

/**
 * Maximum items per provider to prevent context overflow.
 */
export const PROVIDER_LIMITS = {
  source: 1,        // The source entity
  hierarchy: 5,     // Max ancestors in chain
  siblings: 10,     // Max sibling entities
  tags: 15,         // Max tags
  involvement: 8,   // Max event participants/events
  product: 5,       // Max product context items
  custom: 10        // Max user-selected entities
};

/**
 * Provider priorities (higher = earlier in context).
 */
export const PROVIDER_PRIORITIES = {
  source: 100,
  hierarchy: 90,
  tag: 80,
  sibling: 70,
  involvement: 60,
  product: 55,
  custom: 50
};

/**
 * Relationship priorities for traversal ordering.
 */
export const RELATIONSHIP_PRIORITIES = {
  CONTAINS: 1.0,    // Hierarchical structure is primary
  INVOLVES: 0.8,    // Event participation
  OCCURS_AT: 0.8,   // Event location
  TAGGED: 0.6,      // Style/categorization
  BASED_ON: 0.7,    // Product → Universe
  HAS_ATTRIBUTE: 0.5,
  HAS_MECHANIC: 0.5,
  ADAPTS: 0.7       // EntityAdaptation → Entity
};

/**
 * Entity types that indicate product-related generation.
 */
export const PRODUCT_ENTITY_TYPES = [
  'adaptation',
  'section',
  'product'
];

/**
 * Check if a target type requires product context.
 * @param {string} targetType
 * @returns {boolean}
 */
export function requiresProductContext(targetType) {
  return PRODUCT_ENTITY_TYPES.includes(targetType?.toLowerCase());
}

/**
 * Get relevance score for entity type when generating target type.
 * @param {string} targetType - What we're generating
 * @param {string} sourceType - Type of context entity
 * @returns {number} Relevance 0-1
 */
export function getRelevanceScore(targetType, sourceType) {
  const matrix = RELEVANCE_MATRIX[targetType?.toLowerCase()];
  if (!matrix) return 0.5;
  return matrix[sourceType?.toLowerCase()] ?? 0.5;
}

/**
 * Get limit for a provider.
 * @param {string} providerName
 * @returns {number}
 */
export function getProviderLimit(providerName) {
  return PROVIDER_LIMITS[providerName] ?? 10;
}

/**
 * Default configuration object.
 */
export const DEFAULT_CONFIG = {
  relevanceMatrix: RELEVANCE_MATRIX,
  providerLimits: PROVIDER_LIMITS,
  providerPriorities: PROVIDER_PRIORITIES,
  relationshipPriorities: RELATIONSHIP_PRIORITIES,
  enableCaching: true,
  cacheTTL: 60000, // 1 minute
  minRelevanceScore: 0.3,
  maxTotalContext: 50
};
