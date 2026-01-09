/**
 * Image Provider Registry
 *
 * Factory for getting image generation providers.
 * Supports multiple providers with automatic fallback.
 */
import { OpenAIImageProvider } from './openai-provider.js';

// Registry of available providers
const providers = {
  'openai-dalle': OpenAIImageProvider,
  // Future providers:
  // 'midjourney': MidjourneyProvider,
  // 'nanobanana': NanobanaProvider,
};

// Cached default provider
let defaultProvider = null;

/**
 * Get an image provider by name, or the first available provider
 * @param {string|null} name - Optional provider name
 * @returns {BaseImageProvider|null}
 */
export function getImageProvider(name = null) {
  // If name specified, get that provider
  if (name && providers[name]) {
    const instance = new providers[name]();
    if (instance.isAvailable()) {
      return instance;
    }
    console.warn(`[Image Provider] ${name} is not available`);
    return null;
  }

  // Otherwise, return first available provider (cached)
  if (!defaultProvider) {
    for (const [providerName, Provider] of Object.entries(providers)) {
      const instance = new Provider();
      if (instance.isAvailable()) {
        console.log(`[Image Provider] Using ${providerName} as default`);
        defaultProvider = instance;
        break;
      }
    }
  }

  return defaultProvider;
}

/**
 * Get list of all providers and their availability
 * @returns {Array<{name: string, available: boolean, sizes: string[]}>}
 */
export function getAvailableProviders() {
  return Object.entries(providers).map(([name, Provider]) => {
    const instance = new Provider();
    return {
      name,
      available: instance.isAvailable(),
      sizes: instance.supportedSizes,
      defaultSize: instance.defaultSize,
    };
  });
}

export { BaseImageProvider } from './base-image-provider.js';
export { OpenAIImageProvider } from './openai-provider.js';
