/**
 * Cost Calculator Service
 *
 * Estimates generation credits based on entity type, complexity,
 * and constraint settings. Provides cost breakdown for UI display.
 */

// Base costs per entity type (in credits)
export const BASE_COSTS = {
  character: 5,    // Most complex: personality, backstory, appearance
  place: 3,        // Moderate: description, atmosphere, features
  item: 2,         // Simpler: properties, description
  event: 3,        // Moderate: description, consequences
  narrative: 4,    // Complex: plot structure, themes
  tag: 1,          // Simple: name and description
  outline: 1,      // Per 3 entities in subgraph mode
};

// Cost modifiers
export const MODIFIERS = {
  highCreativity: 1.2,      // creativity > 0.8 (more tokens/retries)
  lowCreativity: 0.9,       // creativity < 0.3 (more constrained)
  extendedContext: 1.3,     // > 5 additional context entities
  manyTags: 1.1,            // > 3 tag constraints
  fieldRegeneration: 0.3,   // Single field redo (fraction of base)
  variation: 0.7,           // Alternative version of existing
};

// Minimum and maximum costs
export const LIMITS = {
  minCost: 1,
  maxCostPerEntity: 10,
  maxTotalCost: 100,
};

/**
 * Estimate the cost for a generation request
 * @param {Object} params - Generation parameters
 * @param {string} params.targetType - Type of entity to generate
 * @param {number} params.entityCount - Number of entities to generate (default: 1)
 * @param {number} params.creativity - Creativity level 0-1 (default: 0.5)
 * @param {number} params.contextCount - Number of additional context entities (default: 0)
 * @param {number} params.tagCount - Number of tag constraints (default: 0)
 * @param {boolean} params.isRegeneration - Whether this is a field regeneration
 * @param {boolean} params.isVariation - Whether this is generating a variation
 * @returns {number} Estimated cost in credits
 */
export function estimateCost({
  targetType,
  entityCount = 1,
  creativity = 0.5,
  contextCount = 0,
  tagCount = 0,
  isRegeneration = false,
  isVariation = false
}) {
  // Get base cost for entity type
  const baseCost = BASE_COSTS[targetType?.toLowerCase()] || BASE_COSTS.character;

  let cost = baseCost * entityCount;

  // Apply modifiers
  if (isRegeneration) {
    cost *= MODIFIERS.fieldRegeneration;
  } else if (isVariation) {
    cost *= MODIFIERS.variation;
  } else {
    // Full generation modifiers
    if (creativity > 0.8) {
      cost *= MODIFIERS.highCreativity;
    } else if (creativity < 0.3) {
      cost *= MODIFIERS.lowCreativity;
    }

    if (contextCount > 5) {
      cost *= MODIFIERS.extendedContext;
    }

    if (tagCount > 3) {
      cost *= MODIFIERS.manyTags;
    }
  }

  // Apply limits
  cost = Math.max(LIMITS.minCost, Math.ceil(cost));
  cost = Math.min(cost, LIMITS.maxTotalCost);

  return cost;
}

/**
 * Get a detailed cost breakdown for UI display
 * @param {Object} params - Same as estimateCost
 * @returns {Object} Cost breakdown with items and total
 */
export function getBreakdown(params) {
  const {
    targetType,
    entityCount = 1,
    creativity = 0.5,
    contextCount = 0,
    tagCount = 0,
    isRegeneration = false,
    isVariation = false
  } = params;

  const breakdown = [];
  const baseCost = BASE_COSTS[targetType?.toLowerCase()] || BASE_COSTS.character;

  // Base cost item
  const entityLabel = entityCount > 1
    ? `${entityCount} ${targetType}s`
    : `1 ${targetType}`;

  breakdown.push({
    label: `Base cost (${entityLabel})`,
    credits: baseCost * entityCount,
    isBase: true
  });

  // Mode modifier
  if (isRegeneration) {
    breakdown.push({
      label: 'Field regeneration discount',
      credits: -Math.floor(baseCost * entityCount * (1 - MODIFIERS.fieldRegeneration)),
      isModifier: true
    });
  } else if (isVariation) {
    breakdown.push({
      label: 'Variation discount',
      credits: -Math.floor(baseCost * entityCount * (1 - MODIFIERS.variation)),
      isModifier: true
    });
  } else {
    // Creativity modifier
    if (creativity > 0.8) {
      breakdown.push({
        label: 'High creativity',
        credits: Math.ceil(baseCost * entityCount * (MODIFIERS.highCreativity - 1)),
        isModifier: true
      });
    } else if (creativity < 0.3) {
      breakdown.push({
        label: 'Low creativity discount',
        credits: -Math.floor(baseCost * entityCount * (1 - MODIFIERS.lowCreativity)),
        isModifier: true
      });
    }

    // Context modifier
    if (contextCount > 5) {
      breakdown.push({
        label: `Extended context (${contextCount} entities)`,
        credits: Math.ceil(baseCost * entityCount * (MODIFIERS.extendedContext - 1)),
        isModifier: true
      });
    }

    // Tag modifier
    if (tagCount > 3) {
      breakdown.push({
        label: `Many constraints (${tagCount} tags)`,
        credits: Math.ceil(baseCost * entityCount * (MODIFIERS.manyTags - 1)),
        isModifier: true
      });
    }
  }

  // Calculate total
  const total = Math.max(
    LIMITS.minCost,
    Math.min(
      breakdown.reduce((sum, item) => sum + item.credits, 0),
      LIMITS.maxTotalCost
    )
  );

  return {
    items: breakdown,
    total,
    // Summary for quick display
    summary: `${total} credit${total !== 1 ? 's' : ''}`
  };
}

/**
 * Estimate cost for subgraph expansion (multiple entity types)
 * @param {Array<Object>} scope - Array of { entityType, count }
 * @param {Object} options - Additional options
 * @returns {Object} Cost breakdown with outline and detail phases
 */
export function estimateSubgraphCost(scope, options = {}) {
  const { creativity = 0.5, contextCount = 0, tagCount = 0 } = options;

  const breakdown = [];
  let outlineCost = 0;
  let detailCost = 0;

  // Outline phase: 1 credit per 3 entities
  const totalEntities = scope.reduce((sum, item) => sum + item.count, 0);
  outlineCost = Math.max(1, Math.ceil(totalEntities / 3));

  breakdown.push({
    label: `Outline preview (${totalEntities} entities)`,
    credits: outlineCost,
    phase: 'outline'
  });

  // Detail phase: cost per entity type
  for (const { entityType, count } of scope) {
    const entityCost = estimateCost({
      targetType: entityType,
      entityCount: count,
      creativity,
      contextCount,
      tagCount
    });

    breakdown.push({
      label: `${count} ${entityType}${count > 1 ? 's' : ''} (details)`,
      credits: entityCost,
      phase: 'detail'
    });

    detailCost += entityCost;
  }

  return {
    items: breakdown,
    outlineCost,
    detailCost,
    totalCost: outlineCost + detailCost,
    // Phase summaries
    phases: {
      outline: {
        cost: outlineCost,
        description: 'Generate titles and summaries for review'
      },
      detail: {
        cost: detailCost,
        description: 'Generate full content for approved entities'
      }
    },
    summary: `${outlineCost + detailCost} credits total (${outlineCost} outline + ${detailCost} details)`
  };
}

/**
 * Check if user has sufficient credits
 * @param {number} userCredits - User's current credit balance
 * @param {number} requiredCredits - Credits needed for operation
 * @returns {Object} Validation result
 */
export function validateCredits(userCredits, requiredCredits) {
  const hasEnough = userCredits >= requiredCredits;

  return {
    valid: hasEnough,
    userCredits,
    requiredCredits,
    shortfall: hasEnough ? 0 : requiredCredits - userCredits,
    message: hasEnough
      ? `${requiredCredits} credits will be deducted`
      : `Insufficient credits. Need ${requiredCredits - userCredits} more credits.`
  };
}

/**
 * Get cost information for UI display
 * @param {string} targetType - Entity type
 * @returns {Object} Cost info for UI
 */
export function getCostInfo(targetType) {
  const baseCost = BASE_COSTS[targetType?.toLowerCase()] || BASE_COSTS.character;

  return {
    baseCost,
    minCost: LIMITS.minCost,
    maxCost: Math.min(baseCost * MODIFIERS.highCreativity * MODIFIERS.extendedContext, LIMITS.maxCostPerEntity),
    modifiers: {
      highCreativity: `+${Math.round((MODIFIERS.highCreativity - 1) * 100)}%`,
      lowCreativity: `-${Math.round((1 - MODIFIERS.lowCreativity) * 100)}%`,
      extendedContext: `+${Math.round((MODIFIERS.extendedContext - 1) * 100)}%`,
      regeneration: `-${Math.round((1 - MODIFIERS.fieldRegeneration) * 100)}%`,
      variation: `-${Math.round((1 - MODIFIERS.variation) * 100)}%`
    }
  };
}
