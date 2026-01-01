// Inference rules for @ mentions
// Maps (currentEntityType, mentionedEntityType) to relationship mutation

export interface InferenceRule {
  mutation: 'relateContains' | 'relateTagged' | 'relateOccursAt' | 'relateInvolves';
  description: string;
  // How to construct the mutation variables
  variableKey: 'relation' | 'eventId' | 'placeId';
  // For relateInvolves/relateOccursAt, need to know which field
  targetField?: 'characterIds' | 'itemIds' | 'placeIds';
}

export const INFERENCE_RULES: Record<string, Record<string, InferenceRule>> = {
  // Events - use INVOLVES for characters/items, OCCURS_AT for places
  event: {
    character: {
      mutation: 'relateInvolves',
      description: 'Characters involved',
      variableKey: 'relation',
      targetField: 'characterIds'
    },
    item: {
      mutation: 'relateInvolves',
      description: 'Items involved',
      variableKey: 'relation',
      targetField: 'itemIds'
    },
    place: {
      mutation: 'relateOccursAt',
      description: 'Locations',
      variableKey: 'relation',
      targetField: 'placeIds'
    }
  },

  // Narratives - use CONTAINS for all child types
  narrative: {
    event: {
      mutation: 'relateContains',
      description: 'Scenes / events',
      variableKey: 'relation'
    },
    character: {
      mutation: 'relateContains',
      description: 'Key characters',
      variableKey: 'relation'
    },
    place: {
      mutation: 'relateContains',
      description: 'Key places',
      variableKey: 'relation'
    },
    item: {
      mutation: 'relateContains',
      description: 'Key items',
      variableKey: 'relation'
    }
  },

  // Places - use CONTAINS for characters, items, and nearby places
  place: {
    character: {
      mutation: 'relateContains',
      description: 'Characters here',
      variableKey: 'relation'
    },
    item: {
      mutation: 'relateContains',
      description: 'Items here',
      variableKey: 'relation'
    },
    place: {
      mutation: 'relateContains',
      description: 'Nearby places',
      variableKey: 'relation'
    }
  },

  // Characters - use CONTAINS for items, places
  character: {
    item: {
      mutation: 'relateContains',
      description: 'Items owned',
      variableKey: 'relation'
    },
    place: {
      mutation: 'relateContains',
      description: 'Associated places',
      variableKey: 'relation'
    },
    character: {
      mutation: 'relateContains',
      description: 'Connected characters',
      variableKey: 'relation'
    }
  },

  // Items - these are typically contained by characters/places, not the other way
  // But mentioning a character from an item could create "owned by" relationship
  item: {
    character: {
      mutation: 'relateContains',
      description: 'Owned by',
      variableKey: 'relation'
    },
    place: {
      mutation: 'relateContains',
      description: 'Found at',
      variableKey: 'relation'
    }
  },

  // Universes - contain everything
  universe: {
    narrative: {
      mutation: 'relateContains',
      description: 'Narratives',
      variableKey: 'relation'
    },
    place: {
      mutation: 'relateContains',
      description: 'Places',
      variableKey: 'relation'
    },
    character: {
      mutation: 'relateContains',
      description: 'Characters',
      variableKey: 'relation'
    },
    item: {
      mutation: 'relateContains',
      description: 'Items',
      variableKey: 'relation'
    },
    event: {
      mutation: 'relateContains',
      description: 'Events',
      variableKey: 'relation'
    }
  }
};

export function getInferenceRule(
  currentEntityType: string,
  mentionedEntityType: string
): InferenceRule | null {
  const rules = INFERENCE_RULES[currentEntityType.toLowerCase()];
  if (!rules) return null;

  return rules[mentionedEntityType.toLowerCase()] || null;
}

export function canCreateRelationship(
  currentEntityType: string,
  mentionedEntityType: string
): boolean {
  return getInferenceRule(currentEntityType, mentionedEntityType) !== null;
}
