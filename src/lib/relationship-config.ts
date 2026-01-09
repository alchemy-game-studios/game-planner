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
 */
const STRUCTURAL_RELATIONSHIP_LABELS: Record<string, string> = {
  // Outgoing labels (from source entity's perspective)
  'LOCATED_IN': 'Located in',
  'LIVES_IN': 'Lives in',
  'HELD_BY': 'Held by',
  'PART_OF': 'Part of',
  'BORN_IN': 'Born in',
  'WORKS_AT': 'Works at',
  'KNOWS': 'Knows',
  'FRIEND_OF': 'Friend of',
  'ENEMY_OF': 'Enemy of',
  'FAMILY_OF': 'Family of',
  'WORKS_WITH': 'Works with',
  'OWNS': 'Owns',
  'SEEKS': 'Seeks',
  'CREATED': 'Created',
  'PARTICIPATED_IN': 'Participated in',
  'WITNESSED': 'Witnessed',
  'CAUSED': 'Caused',
  // Incoming (reverse) labels
  'LOCATED_IN_incoming': 'Contains',
  'LIVES_IN_incoming': 'Home to',
  'HELD_BY_incoming': 'Holds',
  'PART_OF_incoming': 'Contains',
};

/**
 * Get the display label for a relationship type.
 * For custom relationships, returns the custom label if provided.
 */
export function getRelationshipLabel(
  relationshipType: string,
  entityType: string,
  customLabel?: string
): string {
  if (relationshipType === 'custom' && customLabel) {
    return customLabel;
  }

  // Check structural relationships first (uppercase from Neo4j)
  const structuralLabel = STRUCTURAL_RELATIONSHIP_LABELS[relationshipType];
  if (structuralLabel) {
    return structuralLabel;
  }

  // Check entity-specific relationship types
  const types = getRelationshipTypesForEntity(entityType);
  const found = types.find(t => t.value === relationshipType);
  if (found) {
    return found.label;
  }

  // Convert snake_case/UPPER_CASE to Title Case as fallback
  return relationshipType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
