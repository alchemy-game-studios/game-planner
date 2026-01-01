import { useMutation, gql } from '@apollo/client';
import { useCallback, useState } from 'react';
import { getInferenceRule, InferenceRule } from '@/lib/mention-inference';
import type { EntityMention } from '@/components/rich-text-editor';

// Additive mutations - add relationships without removing existing ones
const ADD_CONTAINS = gql`
  mutation AddContains($relation: RelatableInput!) {
    addContains(relation: $relation) {
      message
    }
  }
`;

const ADD_INVOLVES = gql`
  mutation AddInvolves($relation: EventParticipantsInput!) {
    addInvolves(relation: $relation) {
      message
    }
  }
`;

const ADD_OCCURS_AT = gql`
  mutation AddOccursAt($relation: EventLocationInput!) {
    addOccursAt(relation: $relation) {
      message
    }
  }
`;

export interface MentionToastData {
  id: string;
  entityName: string;
  relationDescription: string;
  onUndo: () => void;
}

interface UseMentionRelationshipOptions {
  currentEntityType: string;
  currentEntityId: string;
  onRelationshipCreated?: () => void;
  onToast?: (toast: MentionToastData) => void;
}

export function useMentionRelationship({
  currentEntityType,
  currentEntityId,
  onRelationshipCreated,
  onToast
}: UseMentionRelationshipOptions) {
  const [addContains] = useMutation(ADD_CONTAINS);
  const [addInvolves] = useMutation(ADD_INVOLVES);
  const [addOccursAt] = useMutation(ADD_OCCURS_AT);
  const [lastCreatedRelation, setLastCreatedRelation] = useState<{
    mention: EntityMention;
    rule: InferenceRule;
  } | null>(null);

  const createRelationship = useCallback(async (mention: EntityMention) => {
    const rule = getInferenceRule(currentEntityType, mention.type);

    if (!rule) {
      console.log(`No inference rule for ${currentEntityType} -> ${mention.type}`);
      return;
    }

    try {
      if (rule.mutation === 'addContains') {
        await addContains({
          variables: {
            relation: {
              id: currentEntityId,
              childIds: [mention.id]
            }
          }
        });
      } else if (rule.mutation === 'addInvolves') {
        const variables: any = {
          relation: {
            eventId: currentEntityId,
            characterIds: [],
            itemIds: []
          }
        };

        if (rule.targetField === 'characterIds') {
          variables.relation.characterIds = [mention.id];
        } else if (rule.targetField === 'itemIds') {
          variables.relation.itemIds = [mention.id];
        }

        await addInvolves({ variables });
      } else if (rule.mutation === 'addOccursAt') {
        await addOccursAt({
          variables: {
            relation: {
              eventId: currentEntityId,
              placeIds: [mention.id]
            }
          }
        });
      }

      setLastCreatedRelation({ mention, rule });

      if (onRelationshipCreated) {
        onRelationshipCreated();
      }

      if (onToast) {
        onToast({
          id: `${mention.id}-${Date.now()}`,
          entityName: mention.name,
          relationDescription: rule.description,
          onUndo: () => handleUndo(mention, rule)
        });
      }
    } catch (error) {
      console.error('Failed to create relationship:', error);
    }
  }, [
    currentEntityType,
    currentEntityId,
    addContains,
    addInvolves,
    addOccursAt,
    onRelationshipCreated,
    onToast
  ]);

  const handleUndo = useCallback(async (mention: EntityMention, rule: InferenceRule) => {
    // For now, undo is not implemented as it requires tracking
    // the exact relationship that was created
    // This could be enhanced to remove the specific relationship
    console.log('Undo not yet implemented for:', mention.name, rule.description);
  }, []);

  return {
    createRelationship,
    lastCreatedRelation
  };
}
