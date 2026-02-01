/**
 * Base Image Provider
 *
 * Abstract base class for image generation providers.
 * Implementations: OpenAI DALL-E, Midjourney, Nanobanana, etc.
 */
export class BaseImageProvider {
  /**
   * Provider name identifier
   * @returns {string}
   */
  get name() {
    throw new Error('Subclass must implement name getter');
  }

  /**
   * Supported image sizes
   * @returns {string[]}
   */
  get supportedSizes() {
    throw new Error('Subclass must implement supportedSizes getter');
  }

  /**
   * Default image size
   * @returns {string}
   */
  get defaultSize() {
    return '1024x1024';
  }

  /**
   * Check if the provider is available (API key configured, etc.)
   * @returns {boolean}
   */
  isAvailable() {
    throw new Error('Subclass must implement isAvailable()');
  }

  /**
   * Generate an image from a prompt
   * @param {Object} params
   * @param {string} params.prompt - The image generation prompt
   * @param {string} params.size - Image size (e.g., '1024x1024')
   * @param {string} params.style - Style preset (vivid, natural)
   * @returns {Promise<ImageResult>}
   */
  async generate(params) {
    throw new Error('Subclass must implement generate()');
  }
}

/**
 * @typedef {Object} ImageResult
 * @property {Buffer} buffer - Image data as buffer
 * @property {string} mimeType - MIME type (image/png, image/jpeg)
 * @property {string} prompt - The prompt used (may be revised by provider)
 * @property {Object} metadata - Provider-specific metadata
 */
