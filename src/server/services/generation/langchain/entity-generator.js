/**
 * Entity Generator Service
 *
 * Uses LangChain + OpenAI to generate worldbuilding entities.
 */

import { ChatOpenAI } from '@langchain/openai';
import { entityGenerationPrompt, formatTagsForPrompt } from './prompts.js';

/**
 * Parse JSON from LLM response, handling markdown code blocks
 * @param {string} content - Raw LLM response
 * @returns {Object} Parsed JSON object
 */
function parseJsonResponse(content) {
  // Try to extract JSON from markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : content.trim();

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse JSON from response: ${content.slice(0, 200)}`);
  }
}

/**
 * Validate that the generated entity has required fields
 * @param {Object} entity - Parsed entity
 * @param {string} targetType - Expected entity type
 * @returns {Object} Validated entity with defaults
 */
function validateEntity(entity, targetType) {
  if (!entity.name || typeof entity.name !== 'string') {
    throw new Error('Generated entity missing required "name" field');
  }

  return {
    name: entity.name.trim(),
    description: entity.description?.trim() || '',
    type: entity.type?.trim() || targetType,
    existingTagIds: Array.isArray(entity.existingTagIds) ? entity.existingTagIds : [],
    newTags: Array.isArray(entity.newTags) ? entity.newTags.map(t => ({
      name: t.name?.trim() || '',
      description: t.description?.trim() || '',
      type: t.type === 'feeling' ? 'feeling' : 'descriptor',
    })).filter(t => t.name) : [],
  };
}

/**
 * Format available tags for prompt inclusion
 * @param {Array} tags - Available tags with id, name, description, type
 * @returns {string} Formatted tag list
 */
function formatAvailableTagsForPrompt(tags) {
  if (!tags || tags.length === 0) {
    return 'No existing tags available. You may suggest new ones.';
  }

  return tags.map(tag =>
    `- ID: "${tag.id}" | ${tag.name} (${tag.type || 'descriptor'}): ${tag.description || 'No description'}`
  ).join('\n');
}

/**
 * EntityGenerator - Generates worldbuilding entities using LLM
 */
export class EntityGenerator {
  /**
   * @param {Object} options
   * @param {string} options.model - OpenAI model name (default: 'gpt-4o')
   * @param {number} options.temperature - Generation temperature (default: 0.8)
   * @param {number} options.maxRetries - Max retries on parse failure (default: 1)
   */
  constructor(options = {}) {
    this.model = new ChatOpenAI({
      modelName: options.model || process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: options.temperature ?? 0.8,
      maxRetries: 2,
    });
    this.maxParseRetries = options.maxRetries ?? 1;
  }

  /**
   * Generate a single entity
   * @param {Object} params
   * @param {string} params.context - Assembled markdown context
   * @param {string} params.targetType - Entity type to generate
   * @param {Array} params.tags - Style tags to apply (user-selected)
   * @param {Array} params.availableTags - All available universe tags for selection
   * @param {string} params.prompt - Optional user prompt/requirements
   * @returns {Promise<Object>} Generated entity { name, description, type, existingTagIds, newTags }
   */
  async generateOne(params) {
    const { context, targetType, tags = [], availableTags = [], prompt = '' } = params;

    // Build requirements string
    const requirements = this.buildRequirements({ tags, prompt, targetType });

    // Format available tags for the prompt
    const availableTagsFormatted = formatAvailableTagsForPrompt(availableTags);

    // Format the prompt
    const formattedPrompt = await entityGenerationPrompt.formatMessages({
      context: context || 'No specific context provided.',
      targetType,
      requirements,
      availableTags: availableTagsFormatted,
    });

    console.log('=== OpenAI API Call ===');
    console.log('Model:', this.model.modelName);
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key prefix:', process.env.OPENAI_API_KEY?.slice(0, 10) + '...');

    // Call the LLM with retries for parse failures
    let lastError;
    for (let attempt = 0; attempt <= this.maxParseRetries; attempt++) {
      try {
        console.log('Invoking OpenAI API...');
        const startTime = Date.now();
        const response = await this.model.invoke(formattedPrompt);
        console.log('OpenAI response received in', Date.now() - startTime, 'ms');
        const content = response.content;

        // Parse and validate
        const parsed = parseJsonResponse(content);
        return validateEntity(parsed, targetType);
      } catch (error) {
        lastError = error;
        console.warn(`Generation attempt ${attempt + 1} failed:`, error.message);

        // Don't retry on API errors, only parse errors
        if (error.message?.includes('API') || error.message?.includes('rate limit')) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Generate multiple entities
   * @param {Object} params
   * @param {string} params.context - Assembled markdown context
   * @param {string} params.targetType - Entity type to generate
   * @param {number} params.quantity - Number of entities to generate
   * @param {Array} params.tags - Style tags to apply
   * @param {string} params.prompt - Optional user prompt/requirements
   * @returns {Promise<Array>} Array of generated entities
   */
  async generate(params) {
    const { quantity = 1, ...rest } = params;

    const entities = [];
    for (let i = 0; i < quantity; i++) {
      // Add uniqueness hint for multiple entities
      const entityParams = { ...rest };
      if (quantity > 1) {
        entityParams.prompt = `${rest.prompt || ''}\n\nThis is entity ${i + 1} of ${quantity}. Make each entity unique and distinct from the others.`.trim();
      }

      const entity = await this.generateOne(entityParams);
      entities.push(entity);
    }

    return entities;
  }

  /**
   * Build requirements string from tags and user prompt
   * @private
   */
  buildRequirements({ tags, prompt, targetType }) {
    const parts = [];

    // Add user prompt if provided
    if (prompt) {
      parts.push(`User request: ${prompt}`);
    }

    // Add tag requirements if any
    if (tags && tags.length > 0) {
      parts.push(`Style and tone:\n${formatTagsForPrompt(tags)}`);
    }

    // Add type-specific hints
    const typeHints = {
      character: 'Include personality traits, motivations, and notable characteristics.',
      place: 'Include atmosphere, notable features, and what makes this location significant.',
      item: 'Include origin, significance, and any special properties.',
      event: 'Include what happened, who was involved, and the consequences.',
      narrative: 'Include the story arc, key events, and themes.',
    };

    if (typeHints[targetType]) {
      parts.push(typeHints[targetType]);
    }

    return parts.length > 0 ? parts.join('\n\n') : 'Create a fitting entity for this world.';
  }
}

/**
 * Create a singleton instance with default options
 */
let defaultGenerator = null;

export function getEntityGenerator(options = {}) {
  if (!defaultGenerator || Object.keys(options).length > 0) {
    defaultGenerator = new EntityGenerator(options);
  }
  return defaultGenerator;
}
