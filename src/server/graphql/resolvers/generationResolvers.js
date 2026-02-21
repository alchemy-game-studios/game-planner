/**
 * generationResolvers.js
 * AI-constrained generation for CanonKiln.
 *
 * The core differentiator: generation is constrained by the existing canon graph.
 * Before calling the LLM, we fetch the project's entity graph from Neo4j, build a
 * context object (existing entities, relationships, type distribution), and inject it
 * into the system prompt so the AI produces lore-consistent results.
 *
 * We use a simple in-memory generation cache keyed by generationId so users can
 * refine without re-running the full pipeline.
 *
 * Stack: LangChain (openai) OR a raw OpenAI SDK call — configured via env vars.
 * If OPENAI_API_KEY is not set, we return a mock response so dev works without LLM.
 */

import { runQuery } from '../neo4j-driver.js';
import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

// ── In-memory cache for pending generations ───────────────────────────────────
// In production this would be Redis; fine for an MVP.
const generationCache = new Map();

// ── OpenAI (optional) ─────────────────────────────────────────────────────────
const getOpenAIClient = async () => {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { default: OpenAI } = await import('openai');
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch {
    return null;
  }
};

// ─── Context Builder ─────────────────────────────────────────────────────────

/**
 * Fetch all entities + relationships for a project from Neo4j,
 * return a structured GenerationContext.
 */
const buildGenerationContext = async (projectId, entityType, focusEntityId) => {
  // All entities in project
  const entityRecords = await runQuery(
    `MATCH (e:CanonEntity {projectId: $projectId}) RETURN e ORDER BY e.entityType, e.name`,
    { projectId }
  );

  const existingEntities = entityRecords.map((r) => {
    const p = r.get('e').properties;
    return {
      id: p.id,
      name: p.name,
      entityType: p.entityType,
      description: p.description || '',
    };
  });

  // All relationships in project
  const relRecords = await runQuery(
    `MATCH (from:CanonEntity {projectId: $projectId})-[r:RELATES_TO]->(to:CanonEntity {projectId: $projectId})
     RETURN from.name AS fromName, to.name AS toName, r.label AS label`,
    { projectId }
  );

  const existingRelationships = relRecords.map((r) => ({
    fromName: r.get('fromName'),
    toName: r.get('toName'),
    label: r.get('label'),
  }));

  // Focus entity (optional)
  let focusEntity = null;
  if (focusEntityId) {
    const focRec = await runQuery(
      `MATCH (e:CanonEntity {id: $id}) RETURN e`,
      { id: focusEntityId }
    );
    if (focRec.length) {
      const p = focRec[0].get('e').properties;
      focusEntity = { id: p.id, name: p.name, entityType: p.entityType, description: p.description || '' };
    }
  }

  // Build constraint suggestions based on graph structure
  const suggestions = buildConstraintSuggestions(existingEntities, existingRelationships, entityType, focusEntity);

  return {
    projectId,
    entityType,
    existingEntities,
    existingRelationships,
    suggestions,
    focusEntity,
  };
};

const buildConstraintSuggestions = (entities, relationships, entityType, focusEntity) => {
  const suggestions = [];

  // Count entity types
  const typeCounts = {};
  entities.forEach((e) => {
    typeCounts[e.entityType] = (typeCounts[e.entityType] || 0) + 1;
  });

  if (entities.length === 0) {
    suggestions.push({
      type: 'EMPTY_CANON',
      message: 'No existing canon — you have full creative freedom. Establish the world\'s tone early.',
    });
  } else {
    suggestions.push({
      type: 'ENTITY_COUNT',
      message: `Project has ${entities.length} entities: ${Object.entries(typeCounts).map(([t, c]) => `${c} ${t.toLowerCase()}s`).join(', ')}.`,
    });
  }

  if (relationships.length > 0) {
    suggestions.push({
      type: 'RELATIONSHIP_DENSITY',
      message: `${relationships.length} relationships exist. New ${entityType.toLowerCase()} should connect logically to existing entities.`,
    });
  }

  if (focusEntity) {
    const connectedRels = relationships.filter(
      (r) => r.fromName === focusEntity.name || r.toName === focusEntity.name
    );
    suggestions.push({
      type: 'FOCUS_ENTITY',
      message: `Focusing on "${focusEntity.name}" (${focusEntity.entityType}) which has ${connectedRels.length} existing connections.`,
    });
  }

  // Suggest underrepresented types
  const ALL_TYPES = ['PLACE', 'CHARACTER', 'ITEM', 'EVENT', 'FACTION'];
  ALL_TYPES.forEach((t) => {
    if (t !== entityType && (typeCounts[t] || 0) === 0 && entities.length > 3) {
      suggestions.push({
        type: 'MISSING_TYPE',
        message: `No ${t.toLowerCase()}s exist yet — consider how this ${entityType.toLowerCase()} might relate to future ${t.toLowerCase()}s.`,
      });
    }
  });

  return suggestions;
};

// ─── Prompt Builder ───────────────────────────────────────────────────────────

const buildSystemPrompt = (context) => {
  const entityList = context.existingEntities
    .map((e) => `  - [${e.entityType}] ${e.name}: ${e.description.substring(0, 80)}`)
    .join('\n');

  const relList = context.existingRelationships
    .map((r) => `  - "${r.fromName}" → "${r.toName}" (${r.label})`)
    .join('\n');

  return `You are a creative writing assistant for CanonKiln, a game world planning tool.
Your task is to generate a new ${context.entityType} that is CONSISTENT with the existing canon.

## Existing World Canon
### Entities (${context.existingEntities.length} total):
${entityList || '  (none yet — you are creating the first entity)'}

### Relationships (${context.existingRelationships.length} total):
${relList || '  (none yet)'}

${context.focusEntity ? `## Focus Context\nThis entity should relate to: ${context.focusEntity.name} (${context.focusEntity.entityType})\n${context.focusEntity.description}\n` : ''}

## Constraints
- Do NOT contradict established lore
- Names should fit the world's established tone
- If existing entities suggest a genre/setting, match it
- Propose relationships to existing entities where logical

## Output Format (JSON only, no markdown)
{
  "name": "Entity Name",
  "description": "2-3 sentence description",
  "attributes": [
    {"key": "attributeName", "value": "attributeValue"}
  ],
  "suggestedRelationships": [
    {
      "targetId": "existing-entity-id",
      "targetName": "Entity Name",
      "label": "Relationship Label",
      "rationale": "Why this connection makes sense"
    }
  ],
  "consistencyScore": 0.95,
  "warnings": ["any lore contradictions or issues"]
}`;
};

const buildUserPrompt = (entityType, userPrompt, constrainedByEntities, style) => {
  let prompt = `Create a new ${entityType}: ${userPrompt}`;
  if (style) prompt += `\nStyle/tone: ${style}`;
  if (constrainedByEntities?.length) {
    prompt += `\nMust relate to entities with IDs: ${constrainedByEntities.join(', ')}`;
  }
  return prompt;
};

// ─── Mock generation (no API key) ────────────────────────────────────────────

const mockGenerate = (entityType, prompt, context) => {
  const mockNames = {
    PLACE: 'The Shattered Peaks',
    CHARACTER: 'Seraphine Voss',
    ITEM: 'The Ember Compass',
    EVENT: 'The Night of Falling Stars',
    FACTION: 'The Iron Accord',
  };

  const mockAttrs = {
    PLACE: [{ key: 'placeType', value: 'WILDERNESS' }, { key: 'climate', value: 'Alpine' }],
    CHARACTER: [{ key: 'role', value: 'Archivist' }, { key: 'species', value: 'Human' }],
    ITEM: [{ key: 'itemType', value: 'ARTIFACT' }, { key: 'rarity', value: 'LEGENDARY' }],
    EVENT: [{ key: 'eventType', value: 'CATASTROPHE' }, { key: 'era', value: 'Age of Ruin' }],
    FACTION: [{ key: 'factionType', value: 'GUILD' }, { key: 'alignment', value: 'Neutral' }],
  };

  const suggested = context.existingEntities.slice(0, 2).map((e) => ({
    targetId: e.id,
    targetName: e.name,
    label: 'Connected to',
    rationale: `Mock relationship to demonstrate graph connectivity`,
  }));

  return {
    name: mockNames[entityType] || 'Unknown Entity',
    description: `A ${entityType.toLowerCase()} generated from your prompt: "${prompt}". Configure OPENAI_API_KEY for real AI generation.`,
    attributes: mockAttrs[entityType] || [],
    suggestedRelationships: suggested,
    consistencyScore: 0.75,
    warnings: ['Running in mock mode — set OPENAI_API_KEY for real generation'],
  };
};

// ─── Core generation pipeline ─────────────────────────────────────────────────

const runGeneration = async (projectId, entityType, prompt, constrainedByEntityIds, style, context) => {
  const openai = await getOpenAIClient();

  if (!openai) {
    // Return mock data in dev without API key
    return mockGenerate(entityType, prompt, context);
  }

  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildUserPrompt(entityType, prompt, constrainedByEntityIds, style);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return {
      name: parsed.name || 'Unnamed',
      description: parsed.description || '',
      attributes: (parsed.attributes || []).map((a) => ({ key: a.key, value: String(a.value) })),
      suggestedRelationships: (parsed.suggestedRelationships || []).map((r) => ({
        targetId: r.targetId || '',
        targetName: r.targetName || '',
        label: r.label || 'Related to',
        rationale: r.rationale || '',
      })),
      consistencyScore: typeof parsed.consistencyScore === 'number' ? parsed.consistencyScore : 0.5,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      raw,
    };
  } catch (err) {
    throw new GraphQLError(`AI generation failed: ${err.message}`, {
      extensions: { code: 'GENERATION_ERROR' },
    });
  }
};

// ─── Resolvers ────────────────────────────────────────────────────────────────

const generationResolvers = {
  Query: {
    generationContext: async (_, { projectId, entityType, focusEntityId }) => {
      return buildGenerationContext(projectId, entityType, focusEntityId);
    },
  },

  Mutation: {
    generateEntity: async (_, { input }) => {
      const { projectId, entityType, prompt, constrainedByEntityIds, style } = input;

      // Build graph context — this is the "constrained by graph relationships" differentiator
      const context = await buildGenerationContext(projectId, entityType, null);

      // If specific entities are requested as constraints, fetch them
      if (constrainedByEntityIds?.length) {
        const constrained = context.existingEntities.filter((e) =>
          constrainedByEntityIds.includes(e.id)
        );
        context.focusEntity = constrained[0] || null;
      }

      const result = await runGeneration(projectId, entityType, prompt, constrainedByEntityIds, style, context);

      const generationId = uuidv4();
      const generated = {
        generationId,
        entityType,
        ...result,
        raw: result.raw || JSON.stringify(result),
      };

      // Cache for refinement / acceptance
      generationCache.set(generationId, { generated, context, projectId, entityType });

      return generated;
    },

    refineGeneration: async (_, { input }) => {
      const { generationId, feedback, projectId } = input;

      const cached = generationCache.get(generationId);
      if (!cached) {
        throw new GraphQLError('Generation not found or expired. Please generate again.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const { context, entityType } = cached;

      // Build a refinement prompt that includes the previous result
      const refinementPrompt = `Previous generation:
Name: ${cached.generated.name}
Description: ${cached.generated.description}

User feedback: ${feedback}

Please revise the entity based on this feedback while maintaining canon consistency.`;

      const result = await runGeneration(projectId, entityType, refinementPrompt, [], null, context);

      const newGenerationId = uuidv4();
      const refined = {
        generationId: newGenerationId,
        entityType,
        ...result,
        raw: result.raw || JSON.stringify(result),
      };

      generationCache.set(newGenerationId, { generated: refined, context, projectId, entityType });

      return refined;
    },

    acceptGeneratedEntity: async (_, { input }) => {
      const { generationId, projectId, overrides, createRelationships } = input;

      const cached = generationCache.get(generationId);
      if (!cached) {
        throw new GraphQLError('Generation not found or expired.');
      }

      const { generated, entityType } = cached;

      // Build the entity in Neo4j
      const { v4 } = await import('uuid');
      const id = v4();
      const now = new Date().toISOString();

      const name = overrides?.name || generated.name;
      const description = overrides?.description || generated.description;

      // Map attributes to entity-type-specific fields
      const attrMap = {};
      (generated.attributes || []).forEach((a) => {
        attrMap[a.key] = a.value;
      });

      const labelMap = {
        PLACE: 'Place',
        CHARACTER: 'Character',
        ITEM: 'Item',
        EVENT: 'Event',
        FACTION: 'Faction',
      };

      const label = labelMap[entityType];

      const props = {
        id,
        entityType,
        projectId,
        name,
        description,
        createdAt: now,
        updatedAt: now,
        notableFeatures: [],
        allegiances: [],
        traits: [],
        powers: [],
        consequences: [],
        goals: [],
        ...attrMap,
      };

      await runQuery(
        `CREATE (e:${label}:CanonEntity $props) RETURN e`,
        { props }
      );

      // Create any accepted relationships
      if (createRelationships?.length) {
        for (const rel of createRelationships) {
          const relId = uuidv4();
          await runQuery(
            `MATCH (from:CanonEntity {id: $fromId}), (to:CanonEntity {id: $toId})
             CREATE (from)-[:RELATES_TO {
               id: $relId,
               label: $label,
               projectId: $projectId,
               createdAt: $createdAt
             }]->(to)`,
            {
              fromId: id,
              toId: rel.toId,
              relId,
              label: rel.label,
              projectId,
              createdAt: now,
            }
          );
        }
      }

      // Clean up cache
      generationCache.delete(generationId);

      // Return the accepted entity (generic shape)
      return {
        id,
        name,
        description,
        entityType,
        projectId,
        createdAt: now,
        updatedAt: now,
        notableFeatures: [],
        allegiances: [],
        traits: [],
        powers: [],
        consequences: [],
        goals: [],
        relationships: [],
        ...attrMap,
      };
    },
  },
};

export default generationResolvers;
