/**
 * Image Prompt Builder
 *
 * Converts entity data + tags into effective image generation prompts.
 * Uses tag descriptions to build consistent visual style.
 */

// Entity type to visual subject mapping
const ENTITY_TYPE_PREFIXES = {
  character: 'Portrait of',
  place: 'Scenic view of',
  item: 'Detailed illustration of',
  event: 'Dynamic scene depicting',
  narrative: 'Cinematic scene of',
  universe: 'Panoramic view of',
};

// Default art style suffix
const DEFAULT_ART_STYLE = 'digital art, highly detailed, professional quality, 4k';

/**
 * Build an image generation prompt from entity and tags
 * @param {Object} entity - The generated entity
 * @param {string} entity.name - Entity name
 * @param {string} entity.description - Entity description
 * @param {string} entity._nodeType - Entity type (character, place, etc.)
 * @param {Array} tags - Tags applied to the entity (with descriptions)
 * @param {Object} options - Additional options
 * @param {string} options.universeStyle - Universe-level style context
 * @param {string} options.artStyle - Override art style
 * @returns {string} The image generation prompt
 */
export function buildImagePrompt(entity, tags = [], options = {}) {
  const {
    universeStyle = null,
    artStyle = DEFAULT_ART_STYLE,
  } = options;

  const parts = [];

  // 1. Subject/Entity prefix based on type
  const prefix = ENTITY_TYPE_PREFIXES[entity._nodeType] || 'Illustration of';
  parts.push(`${prefix} ${entity.name}`);

  // 2. Extract key visual elements from entity description
  const descriptionKeywords = extractEntityVisuals(entity.description, entity._nodeType);
  if (descriptionKeywords) {
    parts.push(descriptionKeywords);
  }

  // 3. Process tags by type
  const descriptorStyles = [];
  const moodStyles = [];

  for (const tag of tags) {
    if (!tag.description) continue;

    if (tag.type === 'feeling') {
      const mood = extractMoodKeywords(tag.description);
      if (mood) moodStyles.push(mood);
    } else {
      const visual = extractVisualKeywords(tag.description);
      if (visual) descriptorStyles.push(visual);
    }
  }

  // 4. Add visual style keywords from descriptor tags
  if (descriptorStyles.length > 0) {
    parts.push(descriptorStyles.join(', '));
  }

  // 5. Add mood/atmosphere keywords from feeling tags
  if (moodStyles.length > 0) {
    parts.push(`${moodStyles.join(', ')} atmosphere`);
  }

  // 6. Add universe style context
  if (universeStyle) {
    parts.push(universeStyle);
  }

  // 7. Add base art style
  parts.push(artStyle);

  return parts.filter(Boolean).join(', ');
}

/**
 * Extract visual keywords from tag description
 * Converts semantic descriptions to visual directives
 * @param {string} description - Tag description
 * @returns {string} Visual keywords
 */
function extractVisualKeywords(description) {
  if (!description) return '';

  // Remove common filler words and extract meaningful phrases
  const cleaned = description
    .toLowerCase()
    .replace(/\b(indicates?|represents?|suggests?|describes?|refers? to|means?|implies?|denotes?)\b/gi, '')
    .replace(/\b(the|a|an|is|are|was|were|be|been|being|have|has|had)\b/g, ' ')
    .trim();

  // Split on punctuation and extract key phrases
  const keywords = cleaned
    .split(/[,.\-;:()]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2 && s.length < 40)
    .slice(0, 3);

  return keywords.join(', ');
}

/**
 * Extract mood keywords from feeling tag description
 * @param {string} description - Feeling tag description
 * @returns {string} Mood keywords
 */
function extractMoodKeywords(description) {
  if (!description) return '';

  // Common mood/atmosphere words to look for
  const moodWords = description
    .toLowerCase()
    .match(/\b(dark|light|bright|dim|mysterious|cheerful|grim|hopeful|tense|calm|chaotic|serene|dramatic|subtle|bold|ominous|foreboding|peaceful|menacing|warm|cold|ethereal|haunting|majestic|humble|grand|intimate|vast|cozy|stark|lush|barren|vibrant|muted|somber|joyful|melancholic|eerie|tranquil|turbulent)\b/g);

  if (moodWords && moodWords.length > 0) {
    return [...new Set(moodWords)].slice(0, 3).join(', ');
  }

  // Fallback: first meaningful phrase
  const firstPhrase = description.split(/[,.\-;:]+/)[0].trim();
  return firstPhrase.length < 40 ? firstPhrase : '';
}

/**
 * Strip HTML tags from text
 * @param {string} html - Text that may contain HTML
 * @returns {string} Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract visual elements from entity description
 * @param {string} description - Entity description (may contain HTML)
 * @param {string} entityType - Entity type
 * @returns {string} Visual elements
 */
function extractEntityVisuals(description, entityType) {
  if (!description) return '';

  // Strip HTML first (descriptions may contain mention chips)
  const plainDescription = stripHtml(description);
  if (!plainDescription) return '';

  // Type-specific patterns for extracting visual information
  // Use word boundaries (\b) to avoid partial matches
  const patterns = {
    character: [
      /\b(?:appears?|looks?|wears?|wearing|dressed in|dons?|clad in|sporting)\s+([^.!?]+)/gi,
      /\b(?:tall|short|muscular|slender|aged|young|elderly|robed|armored)\b[^.!?]*/gi,
      /\b(?:she|he|they)\s+(?:has|have|is|are)\s+([^.!?]+)/gi,
      /\b(?:her|his|their)\s+(?:eyes?|hair|face|skin|appearance|features?|gaze|voice)\s+([^.!?]+)/gi,
    ],
    place: [
      /\b(?:features?|surrounded by|filled with|dominated by|covered in|lined with)\s+([^.!?]+)/gi,
      /\b(?:ancient|modern|crumbling|pristine|towering|sprawling)\b[^.!?]*/gi,
    ],
    item: [
      /\b(?:made of|crafted from|adorned with|shaped like|glowing|encrusted)\s+([^.!?]+)/gi,
      /\b(?:ornate|simple|intricate|rusted|polished|weathered)\b[^.!?]*/gi,
    ],
  };

  const typePatterns = patterns[entityType] || [];
  const matches = [];

  for (const pattern of typePatterns) {
    const found = plainDescription.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }

  if (matches.length > 0) {
    // Clean up and limit matches
    const cleaned = matches
      .map(m => m.replace(/^\s*(appears?|looks?|wears?|wearing|dressed in|dons?|clad in|sporting|she|he|they|has|have|is|are|features?|surrounded by|filled with|made of|crafted from|adorned with|shaped like|her|his|their|eyes?|hair|face|skin|appearance|features?|gaze|voice)\s*/gi, '').trim())
      .filter(m => m.length > 3 && m.length < 80)
      .slice(0, 3);

    return cleaned.join(', ');
  }

  // Fallback: extract first 1-2 sentences for visual context
  const sentences = plainDescription.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    // Take up to first 2 sentences, but limit total length
    let visualContext = sentences[0].trim();
    if (sentences.length > 1 && visualContext.length < 100) {
      visualContext += '. ' + sentences[1].trim();
    }
    // Truncate if too long
    if (visualContext.length > 200) {
      visualContext = visualContext.substring(0, 200) + '...';
    }
    return visualContext;
  }

  return '';
}

/**
 * Build a style context string from universe-level tags
 * @param {Array} universeTags - Tags applied to the universe
 * @returns {string} Universe style context
 */
export function buildUniverseStyleContext(universeTags) {
  if (!universeTags || universeTags.length === 0) return '';

  const styles = universeTags
    .map(tag => extractVisualKeywords(tag.description))
    .filter(s => s.length > 0);

  if (styles.length === 0) return '';

  return styles.slice(0, 3).join(', ');
}
