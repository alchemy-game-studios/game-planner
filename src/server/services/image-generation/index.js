/**
 * Image Generation Service
 *
 * Main entry point for generating images for entities.
 * Handles provider selection, prompt building, and storage.
 */
import { v4 as uuidv4 } from 'uuid';
import { getImageProvider, getAvailableProviders } from './providers/index.js';
import { buildImagePrompt, buildUniverseStyleContext } from './prompt-builder.js';
import { uploadImage, getImageUrl } from '../../storage/s3-client.js';

/**
 * Generate and store an image for an entity
 * @param {Object} params
 * @param {Object} params.entity - The entity to generate image for
 * @param {string} params.entity.id - Entity ID
 * @param {string} params.entity.name - Entity name
 * @param {string} params.entity.description - Entity description
 * @param {string} params.entity._nodeType - Entity type
 * @param {Array} params.tags - Tags applied to the entity
 * @param {Array} params.universeTags - Universe-level tags for style context
 * @param {Object} params.options - Generation options
 * @param {string} params.options.provider - Specific provider name (optional)
 * @param {string} params.options.size - Image size (default: 1024x1024)
 * @param {string} params.options.style - Style preset (default: vivid)
 * @returns {Promise<ImageGenerationResult>}
 */
export async function generateEntityImage({
  entity,
  tags = [],
  universeTags = [],
  options = {},
}) {
  const {
    provider: providerName = null,
    size = '1024x1024',
    style = 'vivid',
  } = options;

  // Get image provider
  const provider = getImageProvider(providerName);
  if (!provider || !provider.isAvailable()) {
    throw new Error('No image generation provider available. Check OPENAI_API_KEY.');
  }

  console.log(`[Image Generation] Provider: ${provider.name}`);
  console.log(`[Image Generation] Entity: ${entity.name} (${entity._nodeType})`);
  console.log(`[Image Generation] Tags: ${tags.map(t => t.name).join(', ')}`);

  // Build universe style context
  const universeStyle = buildUniverseStyleContext(universeTags);

  // Build the image prompt
  const prompt = buildImagePrompt(entity, tags, {
    universeStyle,
  });

  console.log(`[Image Generation] Prompt: ${prompt}`);

  // Generate the image
  const result = await provider.generate({
    prompt,
    size,
    style,
  });

  // Upload to S3/MinIO
  const imageId = uuidv4();
  const ext = result.mimeType === 'image/png' ? 'png' : 'jpg';
  const key = `entities/${entity.id}/${imageId}.${ext}`;

  console.log(`[Image Generation] Uploading to ${key}`);

  const uploadResult = await uploadImage(result.buffer, key, result.mimeType);

  console.log(`[Image Generation] Upload complete: ${uploadResult.url}`);

  return {
    imageId,
    key,
    url: uploadResult.url,
    prompt: result.prompt, // May be revised by provider
    mimeType: result.mimeType,
    size: result.buffer.length,
    metadata: result.metadata,
  };
}

/**
 * Check if image generation is available
 * @returns {boolean}
 */
export function isImageGenerationAvailable() {
  const provider = getImageProvider();
  return provider !== null && provider.isAvailable();
}

// Re-export utilities
export { getImageProvider, getAvailableProviders } from './providers/index.js';
export { buildImagePrompt, buildUniverseStyleContext } from './prompt-builder.js';

/**
 * @typedef {Object} ImageGenerationResult
 * @property {string} imageId - Generated image ID (UUID)
 * @property {string} key - S3 storage key
 * @property {string} url - Public URL to the image
 * @property {string} prompt - The prompt used (may be revised)
 * @property {string} mimeType - Image MIME type
 * @property {Object} metadata - Provider metadata
 */
