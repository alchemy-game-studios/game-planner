/**
 * Relationship type definitions for entity generation.
 * These define the relationship types available when defining
 * relationships to existing world entities during generation.
 */

export interface RelationshipTypeOption {
  value: string;
  label: string;
}

export interface RelationshipDefinition {
  entityId: string;
  entityName: string;
  entityType: string; // place, character, item, event
  relationshipType: string; // born_in, lives_in, custom, etc.
  customLabel?: string; // Only if relationshipType === 'custom'
}

/**
 * Relationship types organized by target entity type.
 * When generating a character and relating to a place,
 * use RELATIONSHIP_TYPES.place to get available options.
 */
export const RELATIONSHIP_TYPES: Record<string, RelationshipTypeOption[]> = {
  place: [
    { value: 'born_in', label: 'Born in' },
    { value: 'lives_in', label: 'Lives in' },
    { value: 'works_at', label: 'Works at' },
    { value: 'visited', label: 'Has visited' },
    { value: 'custom', label: 'Custom...' },
  ],
  character: [
    { value: 'knows', label: 'Knows' },
    { value: 'friend_of', label: 'Friend of' },
    { value: 'enemy_of', label: 'Enemy of' },
    { value: 'family_of', label: 'Family of' },
    { value: 'works_with', label: 'Works with' },
    { value: 'custom', label: 'Custom...' },
  ],
  item: [
    { value: 'owns', label: 'Owns' },
    { value: 'seeks', label: 'Seeks' },
    { value: 'created', label: 'Created' },
    { value: 'custom', label: 'Custom...' },
  ],
  event: [
    { value: 'participated_in', label: 'Participated in' },
    { value: 'witnessed', label: 'Witnessed' },
    { value: 'caused', label: 'Caused' },
    { value: 'custom', label: 'Custom...' },
  ],
};

/**
 * Get relationship types available for a target entity type.
 * Returns generic options if type not found.
 */
export function getRelationshipTypesForEntity(entityType: string): RelationshipTypeOption[] {
  const normalized = entityType.toLowerCase();
  return RELATIONSHIP_TYPES[normalized] || [{ value: 'custom', label: 'Custom...' }];
}

/**
 * Structural relationship labels used for entity hierarchy.
 * These are the semantic replacements for CONTAINS.
 *
 * Each relationship has two labels:
 * - outgoing: label when YOU have this relationship TO another entity
 * - incoming: label when another entity has this relationship TO YOU
 */
const RELATIONSHIP_LABELS: Record<string, { outgoing: string; incoming: string }> = {
  // Structural/containment relationships
  'LOCATED_IN': { outgoing: 'Located in', incoming: 'Setting' },
  'LIVES_IN': { outgoing: 'Lives in', incoming: 'Inhabitant' },
  'HELD_BY': { outgoing: 'Held by', incoming: 'Possesses' },
  'PART_OF': { outgoing: 'Part of', incoming: 'Includes' },

  // Character-place relationships
  'BORN_IN': { outgoing: 'Born in', incoming: 'Birthplace of' },
  'WORKS_AT': { outgoing: 'Works at', incoming: 'Employer of' },

  // Character-character relationships
  'KNOWS': { outgoing: 'Knows', incoming: 'Known by' },
  'FRIEND_OF': { outgoing: 'Friend of', incoming: 'Friend of' },
  'ENEMY_OF': { outgoing: 'Enemy of', incoming: 'Enemy of' },
  'FAMILY_OF': { outgoing: 'Family of', incoming: 'Family of' },
  'WORKS_WITH': { outgoing: 'Works with', incoming: 'Works with' },

  // Character-item relationships
  'OWNS': { outgoing: 'Owns', incoming: 'Owned by' },
  'SEEKS': { outgoing: 'Seeks', incoming: 'Sought by' },
  'CREATED': { outgoing: 'Created', incoming: 'Created by' },

  // Event relationships
  'PARTICIPATED_IN': { outgoing: 'Participated in', incoming: 'Participant' },
  'WITNESSED': { outgoing: 'Witnessed', incoming: 'Witnessed by' },
  'CAUSED': { outgoing: 'Caused', incoming: 'Caused by' },
};

/**
 * Get the display label for a relationship type.
 * For custom relationships, returns the custom label if provided.
 *
 * @param relationshipType - The relationship type (e.g., 'LOCATED_IN', 'KNOWS')
 * @param entityType - The target entity type (for fallback lookup)
 * @param customLabel - Optional custom label for 'custom' relationship types
 * @param direction - 'outgoing' or 'incoming' to get the correct perspective
 */
export function getRelationshipLabel(
  relationshipType: string,
  entityType: string,
  customLabel?: string,
  direction: 'outgoing' | 'incoming' = 'outgoing'
): string {
  if (relationshipType === 'custom' && customLabel) {
    return customLabel;
  }

  // Check if we have direction-aware labels for this relationship type
  const labels = RELATIONSHIP_LABELS[relationshipType.toUpperCase()];
  if (labels) {
    return labels[direction];
  }

  // Check entity-specific relationship types (lowercase values)
  const types = getRelationshipTypesForEntity(entityType);
  const found = types.find(t => t.value === relationshipType.toLowerCase());
  if (found) {
    return found.label;
  }

  // Convert snake_case/UPPER_CASE to Title Case as fallback
  return relationshipType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
