/**
 * LangChain Prompt Templates
 *
 * Prompt templates for various generation tasks.
 */

import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

/**
 * System prompt for worldbuilding generation
 */
export const WORLDBUILDING_SYSTEM_PROMPT = `You are a creative worldbuilding assistant helping to expand and detail a fictional universe.

Your role is to:
- Generate content that is consistent with the established world
- Respect the tone and style indicated by tags
- Create rich, detailed content that fits naturally into the existing world
- Reference existing entities when appropriate
- Maintain internal consistency with provided context

When generating content:
- Use the context provided to inform your generation
- Pay attention to entity relationships and hierarchies
- Respect the established style and tone of the world
- Be creative while staying consistent

CRITICAL CONSTRAINTS:
- Only reference entities explicitly provided in the context or relationships
- Never invent new places, characters, items, or events unless the context specifically allows it
- When relationships are specified, incorporate them naturally and prominently into the description
- The generated entity must fit seamlessly into the existing world`;

/**
 * Entity generation prompt template
 */
export const entityGenerationPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(WORLDBUILDING_SYSTEM_PROMPT),
  HumanMessagePromptTemplate.fromTemplate(`# Context
{context}

# Available Tags
{availableTags}

# Task
Generate a {targetType} for this world with the following requirements:
{requirements}

# Output Format
Provide your response as a JSON object with these fields:
- name: A fitting name for the {targetType}
- description: A detailed description (2-4 paragraphs)
- type: A subtype classification (e.g., for characters: "warrior", "merchant", "scholar")
- existingTagIds: Array of tag IDs from Available Tags that fit this entity (pick 0-3 most relevant)
- newTags: Array of new tag suggestions (0-2) as objects with "name", "description", and "type" (either "descriptor" or "feeling")

Generate the {targetType}:`)
]);

/**
 * Product adaptation prompt template
 */
export const productAdaptationPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`You are a game design assistant helping to adapt worldbuilding content for a specific game product.

Your role is to:
- Translate narrative content into game mechanics
- Create balanced and interesting game elements
- Respect the product's design constraints
- Maintain the essence of the source material`),
  HumanMessagePromptTemplate.fromTemplate(`# Source Entity
{sourceContext}

# Product Context
{productContext}

# Task
Create a game adaptation of this entity for the product.

# Requirements
- Product Type: {productType}
- Game Type: {gameType}

# Available Mechanics
{mechanics}

# Available Attributes
{attributes}

# Output Format
{outputFormat}

Generate the adaptation:`)
]);

/**
 * Description expansion prompt
 */
export const descriptionExpansionPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(WORLDBUILDING_SYSTEM_PROMPT),
  HumanMessagePromptTemplate.fromTemplate(`# Current Entity
Name: {name}
Type: {entityType}
Current Description: {currentDescription}

# World Context
{context}

# Task
Expand and enrich the description of this entity. Make it more detailed and vivid while maintaining consistency with the world context.

Requirements:
{requirements}

Provide an expanded description (3-5 paragraphs):`)
]);

/**
 * Relationship suggestion prompt
 */
export const relationshipSuggestionPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`You are a worldbuilding assistant helping to suggest meaningful relationships between entities.`),
  HumanMessagePromptTemplate.fromTemplate(`# Source Entity
{sourceEntity}

# Potential Related Entities
{potentialRelations}

# Task
Suggest meaningful relationships that could exist between the source entity and the potential related entities.

For each suggested relationship, provide:
- The related entity
- The type of relationship
- A brief description of how they're connected

Suggest relationships:`)
]);

/**
 * Tag-based generation prompt
 */
export const tagBasedGenerationPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(WORLDBUILDING_SYSTEM_PROMPT),
  HumanMessagePromptTemplate.fromTemplate(`# Style Tags
{tags}

# World Context
{context}

# Task
Generate a {targetType} that embodies the style and themes indicated by the tags.

Requirements:
{requirements}

Generate the {targetType}:`)
]);

/**
 * Create a generation prompt with context
 * @param {Object} context - Assembled context
 * @param {Object} options - Generation options
 * @returns {ChatPromptTemplate}
 */
export function createGenerationPrompt(context, options = {}) {
  const { targetType = 'character', requirements = '' } = options;

  return entityGenerationPrompt.partial({
    context: context.combinedContent || '',
    targetType,
    requirements
  });
}

/**
 * Create an adaptation prompt with product context
 * @param {Object} sourceContext - Source entity context
 * @param {Object} productContext - Product details
 * @param {Object} options
 * @returns {ChatPromptTemplate}
 */
export function createAdaptationPrompt(sourceContext, productContext, options = {}) {
  const { outputFormat = 'JSON' } = options;

  const mechanics = productContext.mechanics?.map(m =>
    `- ${m.name}: ${m.description}`
  ).join('\n') || 'None defined';

  const attributes = productContext.attributes?.map(a =>
    `- ${a.name} (${a.type}): ${a.description}`
  ).join('\n') || 'None defined';

  return productAdaptationPrompt.partial({
    sourceContext: sourceContext.combinedContent || '',
    productContext: productContext.description || '',
    productType: productContext.type || 'game',
    gameType: productContext.gameType || 'tabletop',
    mechanics,
    attributes,
    outputFormat
  });
}

/**
 * Format tags for prompt inclusion
 * @param {Array} tags
 * @returns {string}
 */
export function formatTagsForPrompt(tags) {
  if (!tags || tags.length === 0) {
    return 'No specific style tags.';
  }

  return tags.map(tag =>
    `## ${tag.name}\n${tag.description || 'No description'}`
  ).join('\n\n');
}

/**
 * Format entities for prompt inclusion
 * @param {Array} entities
 * @param {Object} options
 * @returns {string}
 */
export function formatEntitiesForPrompt(entities, options = {}) {
  const { maxPerType = 3, includeDescription = true } = options;

  // Group by type
  const byType = {};
  for (const entity of entities) {
    const type = entity.nodeType || entity._nodeType || 'other';
    if (!byType[type]) byType[type] = [];
    if (byType[type].length < maxPerType) {
      byType[type].push(entity);
    }
  }

  const sections = [];
  for (const [type, typeEntities] of Object.entries(byType)) {
    const header = `## ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    const items = typeEntities.map(e => {
      if (includeDescription && e.description) {
        return `- **${e.name}**: ${e.description.slice(0, 150)}...`;
      }
      return `- ${e.name}`;
    }).join('\n');
    sections.push(`${header}\n${items}`);
  }

  return sections.join('\n\n');
}

/**
 * Narrative generation prompt with supporting entities
 */
export const narrativeWithSupportingEntitiesPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(WORLDBUILDING_SYSTEM_PROMPT + `

ADDITIONAL CONSTRAINTS FOR SUPPORTING ENTITIES:
- When generating supporting entities, prefer linking to existing entities from the context when a match makes sense
- Only create new entities when no suitable existing entity fits the narrative role
- Each supporting entity should have a clear role in the narrative (antagonist, ally, location, macguffin, etc.)
- Supporting entity descriptions should be brief (1-2 sentences) as they will be expanded later`),
  HumanMessagePromptTemplate.fromTemplate(`# Context
{context}

# Existing Entities in Universe (for matching)
{existingEntities}

# Available Tags
{availableTags}

# Task
Generate a narrative for this world with the following requirements:
{requirements}

Also generate {supportingEntityCount} supporting entities that appear in this narrative.
- For each supporting entity, check if any existing entity from the universe would fit the role
- If an existing entity fits, reference it by name in "existingMatch"
- If no existing entity fits, leave "existingMatch" as null and provide full details

# Output Format
Provide your response as a JSON object with these fields:
- name: A fitting name for the narrative
- description: A detailed description of the narrative (2-4 paragraphs)
- type: A subtype classification (e.g., "quest", "origin story", "conflict", "mystery")
- existingTagIds: Array of tag IDs from Available Tags that fit this narrative (pick 0-3 most relevant)
- newTags: Array of new tag suggestions (0-2) as objects with "name", "description", and "type" (either "descriptor" or "feeling")
- supportingEntities: Array of {supportingEntityCount} supporting entity objects, each with:
  - name: Name of the entity
  - type: "character", "place", or "item"
  - description: Brief description (1-2 sentences, or null if existingMatch)
  - role: How they relate to the narrative (e.g., "antagonist", "ally", "setting", "macguffin")
  - existingMatch: Name of existing entity if this should link to one, or null if new

Generate the narrative with supporting entities:`)
]);

/**
 * Format existing entities for matching in narrative generation
 * @param {Array} entities - Entities in the universe
 * @returns {string}
 */
export function formatExistingEntitiesForMatching(entities) {
  if (!entities || entities.length === 0) {
    return 'No existing entities available for matching.';
  }

  const byType = {};
  for (const entity of entities) {
    const type = entity._nodeType || entity.nodeType || 'other';
    if (!byType[type]) byType[type] = [];
    byType[type].push(entity);
  }

  const sections = [];
  for (const [type, typeEntities] of Object.entries(byType)) {
    const header = `## ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    const items = typeEntities.slice(0, 10).map(e =>
      `- ${e.name}${e.description ? `: ${e.description.slice(0, 100)}...` : ''}`
    ).join('\n');
    sections.push(`${header}\n${items}`);
  }

  return sections.join('\n\n');
}
