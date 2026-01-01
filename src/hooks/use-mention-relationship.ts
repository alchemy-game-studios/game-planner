import { useMutation, gql } from '@apollo/client';
import { useCallback, useState } from 'react';
import { getInferenceRule, InferenceRule } from '@/lib/mention-inference';
import type { EntityMention } from '@/components/rich-text-editor';

const RELATE_CONTAINS = gql`
  mutation RelateContains($relation: RelatableInput!) {
    relateContains(relation: $relation) {
      message
    }
  }
`;

const RELATE_INVOLVES = gql`
  mutation RelateInvolves($relation: EventParticipantsInput!) {
    relateInvolves(relation: $relation) {
      message
    }
  }
`;

const RELATE_OCCURS_AT = gql`
  mutation RelateOccursAt($relation: EventLocationInput!) {
    relateOccursAt(relation: $relation) {
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
  const [relateContains] = useMutation(RELATE_CONTAINS);
  const [relateInvolves] = useMutation(RELATE_INVOLVES);
  const [relateOccursAt] = useMutation(RELATE_OCCURS_AT);
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
      if (rule.mutation === 'relateContains') {
        await relateContains({
          variables: {
            relation: {
              id: currentEntityId,
              childIds: [mention.id]
            }
          }
        });
      } else if (rule.mutation === 'relateInvolves') {
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

        await relateInvolves({ variables });
      } else if (rule.mutation === 'relateOccursAt') {
        await relateOccursAt({
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
    relateContains,
    relateInvolves,
    relateOccursAt,
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
