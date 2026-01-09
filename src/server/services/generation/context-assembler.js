/**
 * Context Assembler
 *
 * Orchestrates context gathering from providers and serialization.
 * Main entry point for the generation context system.
 */

import { createSerializerRegistry } from './serializers/index.js';
import { createResolverRegistry } from './resolvers/index.js';
import { createProviderRegistry } from './providers/index.js';
import { DEFAULT_CONFIG, getRelevanceScore } from './context-config.js';

/**
 * Context Assembler
 */
export class ContextAssembler {
  /**
   * @param {Object} driver - Neo4j driver instance
   * @param {Object} config - Configuration options
   */
  constructor(driver, config = {}) {
    this.driver = driver;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize registries
    this.serializers = createSerializerRegistry();
    this.resolvers = createResolverRegistry(driver, {
      enableCache: this.config.enableCaching,
      cacheTTL: this.config.cacheTTL
    });
    this.providers = createProviderRegistry(this.resolvers, this.serializers, config);
  }

  /**
   * Assemble context for generation
   * @param {Object} params - Generation parameters
   * @param {string} params.entityId - Source entity ID
   * @param {string} params.targetType - Type being generated
   * @param {string} params.universeId - Universe ID (optional, will be resolved)
   * @param {Object} params.selectedContext - User-selected context
   * @param {Object} params.product - Product context (for product-related generation)
   * @param {string} format - Output format ('markdown', 'structured', 'document')
   * @returns {Promise<AssembledContext>}
   */
  async assemble(params, format = 'markdown') {
    const { entityId, targetType, selectedContext = {} } = params;

    // Resolve universe if not provided
    let universeId = params.universeId;
    if (!universeId && entityId) {
      const hierarchyResolver = this.resolvers.get('hierarchy');
      const ancestors = await hierarchyResolver.resolve(entityId);
      const universe = ancestors.find(e => e._nodeType === 'universe');
      universeId = universe?.id;
    }

    // Prepare provider params
    const providerParams = {
      ...params,
      universeId,
      targetType: targetType?.toLowerCase()
    };

    // Gather from all relevant providers in parallel
    const providerResults = await this.providers.gatherAll(providerParams);

    // Merge and deduplicate entities
    const mergedContext = this.mergeAndDedupe(providerResults);

    // Score by relevance
    const scoredContext = this.scoreByRelevance(mergedContext, targetType);

    // Apply limits
    const limitedContext = this.applyLimits(scoredContext);

    // Serialize entities
    const serialized = this.serializeEntities(limitedContext, format);

    // Build output
    return this.buildOutput(serialized, providerResults, params, format);
  }

  /**
   * Backward-compatible method for existing GraphQL resolver
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async assembleEntityContext(params) {
    const result = await this.assemble(params, 'structured');

    // Helper to extract entity object from serialized result
    const toEntityObject = (e) => {
      if (!e) return null;
      const data = e.content || {};
      return {
        id: e.id || data.id,
        name: data.name || e.metadata?.name || 'Unknown',
        description: data.description || e.metadata?.description || '',
        type: data.type || e.metadata?.type || '',
        _nodeType: e.nodeType || data.nodeType || e._nodeType || 'entity'
      };
    };

    // Transform to legacy format for backward compatibility
    const sourceEntity = result.entities.find(e => e._contextRole === 'source');
    const parentChain = result.entities.filter(e =>
      e._contextRole === 'ancestor' || e._contextRole === 'universe'
    );
    const universe = result.entities.find(e => e._contextRole === 'universe');
    const tags = result.entities.filter(e =>
      e._nodeType === 'tag' || e.nodeType === 'tag' || e._contextRole?.includes('Tag')
    );
    // Get IDs of tags that are on the source entity (for auto-selection in UI)
    const sourceTags = result.entities.filter(e => e._contextRole === 'sourceTag');
    const sourceTagIds = sourceTags.map(t => t.id || t.content?.id).filter(Boolean);

    // Fetch siblings directly for the UI (they're opt-in for preview, but we need to show them)
    let siblingEntities = [];
    const siblingResolver = this.resolvers.get('sibling');
    if (siblingResolver && params.entityId) {
      const rawSiblings = await siblingResolver.resolve(params.entityId, { limit: 20 });
      siblingEntities = rawSiblings.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        type: s.type || '',
        _nodeType: s._nodeType || 'entity'
      }));
    }

    return {
      sourceEntity: toEntityObject(sourceEntity),
      parentChain: parentChain.map(toEntityObject),
      universe: toEntityObject(universe),
      siblingEntities,
      sourceTagIds,
      // Return tag objects with required fields from structured content
      availableTags: tags.map(e => {
        // For structured format, tag data is in e.content
        const data = e.content || e;
        return {
          id: e.id || data.id,
          name: data.name || e.metadata?.name,
          description: data.description || e.metadata?.description,
          type: data.type || e.metadata?.type,
          entityCount: data.entityCount || 0
        };
      }),
      additionalContext: result.entities
        .filter(e => e._contextRole === 'userSelected')
        .map(toEntityObject),
      suggestedContext: siblingEntities.slice(0, 10),
      summary: {
        entityCount: result.summary?.entityCount || result.entities?.length || 0,
        tagCount: tags.length
      }
    };
  }

  /**
   * Merge entities from all providers and deduplicate by ID
   * @param {Array} providerResults
   * @returns {Array}
   */
  mergeAndDedupe(providerResults) {
    const seen = new Set();
    const merged = [];

    // Process in priority order (already sorted by provider registry)
    for (const result of providerResults) {
      for (const entity of result.entities) {
        const id = entity.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          merged.push({
            ...entity,
            _provider: result.provider,
            _providerPriority: result.priority
          });
        }
      }
    }

    return merged;
  }

  /**
   * Score entities by relevance to target type
   * @param {Array} entities
   * @param {string} targetType
   * @returns {Array}
   */
  scoreByRelevance(entities, targetType) {
    const relevanceResolver = this.resolvers.get('relevance');

    return entities.map(entity => {
      let score = getRelevanceScore(targetType, entity._nodeType);

      // Boost user-selected entities
      if (entity._userSelected) {
        score = 1.0;
      }

      // Apply depth penalty
      if (entity._depth) {
        score *= Math.max(0.5, 1 - entity._depth * 0.1);
      }

      return {
        ...entity,
        _relevanceScore: score
      };
    }).sort((a, b) => {
      // Sort by relevance, then by provider priority
      if (b._relevanceScore !== a._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      return (b._providerPriority || 0) - (a._providerPriority || 0);
    });
  }

  /**
   * Apply limits to context size
   * @param {Array} entities
   * @returns {Array}
   */
  applyLimits(entities) {
    const { maxTotalContext, minRelevanceScore } = this.config;

    return entities
      .filter(e => e._relevanceScore >= minRelevanceScore)
      .slice(0, maxTotalContext);
  }

  /**
   * Serialize entities to the requested format
   * @param {Array} entities
   * @param {string} format
   * @returns {Array}
   */
  serializeEntities(entities, format) {
    return entities.map(entity => {
      const serializer = this.serializers.get(entity._nodeType);
      const serialized = serializer.serialize(entity, { format });

      return {
        ...serialized,
        _contextRole: entity._contextRole,
        _relevanceScore: entity._relevanceScore,
        _provider: entity._provider
      };
    });
  }

  /**
   * Build the final output structure
   * @param {Array} serialized
   * @param {Array} providerResults
   * @param {Object} params
   * @param {string} format
   * @returns {AssembledContext}
   */
  buildOutput(serialized, providerResults, params, format) {
    // Build combined content for markdown format
    let combinedContent = '';
    if (format === 'markdown') {
      const sections = this.groupBySection(serialized);
      combinedContent = this.formatSections(sections);
    }

    // Provider summaries
    const providerSummaries = providerResults.map(r => ({
      provider: r.provider,
      count: r.count,
      summary: r.summary
    }));

    return {
      entities: serialized,
      combinedContent,
      providers: providerSummaries,
      summary: {
        entityCount: serialized.length,
        providerCount: providerResults.length,
        targetType: params.targetType,
        format
      },
      metadata: {
        entityId: params.entityId,
        universeId: params.universeId,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Group serialized entities by section for formatting
   * @param {Array} serialized
   * @returns {Object}
   */
  groupBySection(serialized) {
    const sections = {
      source: [],
      hierarchy: [],
      tags: [],
      siblings: [],
      involvement: [],
      product: [],
      custom: []
    };

    for (const entity of serialized) {
      const role = entity._contextRole || 'custom';

      if (role === 'source' || role === 'sourceTag') {
        sections.source.push(entity);
      } else if (role === 'ancestor' || role === 'universe') {
        sections.hierarchy.push(entity);
      } else if (role.includes('Tag') || entity.nodeType === 'tag') {
        sections.tags.push(entity);
      } else if (role === 'sibling') {
        sections.siblings.push(entity);
      } else if (role === 'participant' || role === 'relatedEvent' || role === 'coParticipant') {
        sections.involvement.push(entity);
      } else if (role.includes('product') || role.includes('Adaptation')) {
        sections.product.push(entity);
      } else {
        sections.custom.push(entity);
      }
    }

    return sections;
  }

  /**
   * Get a human-readable relationship label
   * @param {string} role - The context role
   * @param {string} nodeType - The entity type
   * @returns {string}
   */
  getRelationshipLabel(role, nodeType) {
    const type = this.formatNodeType(nodeType);

    const roleLabels = {
      'source': `Source ${type}`,
      'sourceTag': 'Source Tag',
      'ancestor': `Parent ${type}`,
      'universe': 'Universe',
      'sibling': `Sibling ${type}`,
      'participant': `Participant ${type}`,
      'eventLocation': 'Event Location',
      'relatedEvent': 'Related Event',
      'coParticipant': `Co-Participant ${type}`,
      'universeTag': 'Universe Tag',
      'selectedTag': 'Selected Tag',
      'userSelected': `Additional ${type}`
    };

    return roleLabels[role] || type;
  }

  /**
   * Format node type for display
   * @param {string} nodeType
   * @returns {string}
   */
  formatNodeType(nodeType) {
    if (!nodeType) return 'Entity';
    return nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
  }

  /**
   * Format sections into combined markdown
   * @param {Object} sections
   * @returns {string}
   */
  formatSections(sections) {
    const lines = [];

    // Source entity section
    if (sections.source.length > 0) {
      lines.push('# Source Entity\n');
      for (const entity of sections.source) {
        const label = this.getRelationshipLabel(entity._contextRole, entity.nodeType);
        lines.push(`> **${label}**\n`);
        lines.push(entity.content);
        lines.push('');
      }
    }

    // Hierarchy section
    if (sections.hierarchy.length > 0) {
      lines.push('# World Hierarchy\n');
      for (const entity of sections.hierarchy) {
        const label = this.getRelationshipLabel(entity._contextRole, entity.nodeType);
        lines.push(`> **${label}**\n`);
        lines.push(entity.content);
        lines.push('');
      }
    }

    // Tags section
    if (sections.tags.length > 0) {
      lines.push('# Style & Tone Tags\n');
      for (const entity of sections.tags) {
        lines.push(entity.content);
        lines.push('');
      }
    }

    // Siblings section
    if (sections.siblings.length > 0) {
      lines.push('# Related Entities\n');
      for (const entity of sections.siblings) {
        const label = this.getRelationshipLabel(entity._contextRole, entity.nodeType);
        lines.push(`> **${label}**\n`);
        lines.push(entity.content);
        lines.push('');
      }
    }

    // Involvement section
    if (sections.involvement.length > 0) {
      lines.push('# Event Involvement\n');
      for (const entity of sections.involvement) {
        const label = this.getRelationshipLabel(entity._contextRole, entity.nodeType);
        lines.push(`> **${label}**\n`);
        lines.push(entity.content);
        lines.push('');
      }
    }

    // Product section
    if (sections.product.length > 0) {
      lines.push('# Product Context\n');
      for (const entity of sections.product) {
        lines.push(entity.content);
        lines.push('');
      }
    }

    // Custom/user-selected section
    if (sections.custom.length > 0) {
      lines.push('# Additional Context\n');
      for (const entity of sections.custom) {
        const label = this.getRelationshipLabel(entity._contextRole, entity.nodeType);
        lines.push(`> **${label}**\n`);
        lines.push(entity.content);
        lines.push('');
      }
    }

    return lines.join('\n').trim();
  }

  /**
   * Clear all resolver caches
   */
  clearCaches() {
    this.resolvers.clearAllCaches();
  }
}

/**
 * Create a context assembler instance
 * @param {Object} driver - Neo4j driver
 * @param {Object} config - Configuration
 * @returns {ContextAssembler}
 */
export function createContextAssembler(driver, config = {}) {
  return new ContextAssembler(driver, config);
}

/**
 * @typedef {Object} AssembledContext
 * @property {Array} entities - Serialized entities
 * @property {string} combinedContent - Combined markdown content
 * @property {Array} providers - Provider summaries
 * @property {Object} summary - Context summary
 * @property {Object} metadata - Generation metadata
 */
