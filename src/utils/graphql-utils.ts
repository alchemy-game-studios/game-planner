import { gql } from '@apollo/client';

export const getCreateMutation = (entityType: string) => {
  const mutationName = `add${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;
  const inputType = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Input`;
  
  const mutation = gql`
    mutation Create${entityType.charAt(0).toUpperCase() + entityType.slice(1)}($${entityType}: ${inputType}!) {
      ${mutationName}(${entityType}: $${entityType}) {
        message
      }
    }
  `;
  
  console.log('Generated mutation for', entityType, ':', mutation);
  return mutation;
};

export const getRelateContainsMutation = () => {
  return gql`
    mutation RelateContains($relation: RelatableInput!) {
      relateContains(relation: $relation) {
        message
      }
    }
  `;
};

export const getRelateTaggedMutation = () => {
  return gql`
    mutation RelateTagged($relation: TagRelationInput!) {
      relateTagged(relation: $relation) {
        message
      }
    }
  `;
};

// Event-specific relationship mutations
export const getRelateOccursAtMutation = () => {
  return gql`
    mutation RelateOccursAt($relation: EventLocationInput!) {
      relateOccursAt(relation: $relation) {
        message
      }
    }
  `;
};

export const getRelateInvolvesMutation = () => {
  return gql`
    mutation RelateInvolves($relation: EventParticipantsInput!) {
      relateInvolves(relation: $relation) {
        message
      }
    }
  `;
};