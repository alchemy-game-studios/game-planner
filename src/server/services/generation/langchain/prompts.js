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
