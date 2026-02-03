/**
 * OpenAI DALL-E Image Provider
 *
 * Generates images using OpenAI's DALL-E 3 model.
 */
import OpenAI from 'openai';
import { BaseImageProvider } from './base-image-provider.js';

export class OpenAIImageProvider extends BaseImageProvider {
  constructor(options = {}) {
    super();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = options.model || 'dall-e-3';
  }

  get name() {
    return 'openai-dalle';
  }

  get supportedSizes() {
    return ['1024x1024', '1792x1024', '1024x1792'];
  }

  isAvailable() {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Generate an image using DALL-E 3
   * @param {Object} params
   * @param {string} params.prompt - The image generation prompt
   * @param {string} params.size - Image size
   * @param {string} params.style - Style preset (vivid, natural)
   * @returns {Promise<ImageResult>}
   */
  async generate({ prompt, size = '1024x1024', style = 'vivid' }) {
    console.log(`[OpenAI Image] Generating ${size} image with style: ${style}`);
    console.log(`[OpenAI Image] Prompt: ${prompt.slice(0, 200)}...`);

    const startTime = Date.now();

    const response = await this.client.images.generate({
      model: this.model,
      prompt,
      n: 1,
      size,
      style,
      response_format: 'b64_json',
    });

    console.log(`[OpenAI Image] Generated in ${Date.now() - startTime}ms`);

    const imageData = response.data[0];
    const buffer = Buffer.from(imageData.b64_json, 'base64');

    return {
      buffer,
      mimeType: 'image/png',
      prompt: imageData.revised_prompt || prompt,
      metadata: {
        provider: this.name,
        model: this.model,
        size,
        style,
        revisedPrompt: imageData.revised_prompt,
      },
    };
  }
}
