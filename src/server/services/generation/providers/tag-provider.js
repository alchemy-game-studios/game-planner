/**
 * Tag Provider
 *
 * Provides tag context including universe tags and selected tags.
 * Tags provide style/tone constraints for generation.
 */

import { BaseProvider } from './base-provider.js';
import { PROVIDER_LIMITS } from '../context-config.js';

export class TagProvider extends BaseProvider {
  get name() {
    return 'tag';
  }

  /**
   * Always relevant - tags provide style constraints
   */
  isRelevant() {
    return true;
  }

  /**
   * Gather tags from universe and user selection
   * @param {Object} params
   * @returns {Promise<ProviderResult>}
   */
  async gather(params) {
    const { entityId, universeId, selectedContext = {} } = params;
    const { tags: selectedTagIds = [] } = selectedContext;

    const tagResolver = this.resolvers.get('tag');
    if (!tagResolver) {
      return this.createResult([]);
    }

    const entities = [];
    const seenIds = new Set();

    // Get universe-level tags for global constraints
    if (universeId) {
      const universeTags = await tagResolver.getUniverseTags(universeId, {
        limit: Math.floor(PROVIDER_LIMITS.tags / 2)
      });

      universeTags.forEach(tag => {
        if (!seenIds.has(tag.id)) {
          seenIds.add(tag.id);
          tag._contextRole = 'universeTag';
          tag._depth = 2;
          entities.push(tag);
        }
      });
    }

    // Get explicitly selected tags with full details
    if (selectedTagIds.length > 0) {
      for (const tagId of selectedTagIds) {
        if (seenIds.has(tagId)) continue;

        // Fetch full tag details
        const tag = await tagResolver.getTagById(tagId);
        if (tag) {
          tag._contextRole = 'selectedTag';
          tag._depth = 0;
          seenIds.add(tagId);
          entities.push(tag);
        }
      }
    }

    // Respect limit
    const limited = entities.slice(0, PROVIDER_LIMITS.tags);

    return this.createResult(limited, {
      summary: limited.length > 0
        ? `Tags: ${limited.length} (universe: ${entities.filter(t => t._contextRole === 'universeTag').length}, selected: ${selectedTagIds.length})`
        : 'No tag context'
    });
  }
}
