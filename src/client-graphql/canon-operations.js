/**
 * canon-operations.js
 * All Apollo GraphQL operations for CanonKiln frontend.
 * Organized by feature: graph, entities, generation, projects, subscription.
 */

import { gql } from '@apollo/client';

// ─── Graph Visualization ─────────────────────────────────────────────────────

export const GET_CANON_GRAPH = gql`
  query GetCanonGraph($projectId: ID!) {
    canonGraph(projectId: $projectId) {
      projectId
      entityCount
      relationshipCount
      nodes {
        id
        name
        entityType
        description
        x
        y
      }
      edges {
        id
        source
        target
        label
      }
    }
  }
`;

// ─── Entity Queries ───────────────────────────────────────────────────────────

export const GET_ENTITIES = gql`
  query GetEntities($projectId: ID!, $entityType: EntityType) {
    entities(projectId: $projectId, entityType: $entityType) {
      ... on Place {
        id name description entityType projectId
        placeType climate population notableFeatures
        createdAt updatedAt
      }
      ... on Character {
        id name description entityType projectId
        role species age allegiances traits
        createdAt updatedAt
      }
      ... on Item {
        id name description entityType projectId
        itemType rarity origin powers
        createdAt updatedAt
      }
      ... on Event {
        id name description entityType projectId
        eventType timelineOrder era consequences
        createdAt updatedAt
      }
      ... on Faction {
        id name description entityType projectId
        factionType alignment goals
        createdAt updatedAt
      }
    }
  }
`;

export const GET_ENTITY_WITH_RELATIONSHIPS = gql`
  query GetEntityWithRelationships($id: ID!) {
    entity(id: $id) {
      ... on Place {
        id name description entityType projectId
        placeType climate population notableFeatures
        relationships {
          id fromId toId fromName toName fromType toType label
        }
      }
      ... on Character {
        id name description entityType projectId
        role species age allegiances traits
        relationships {
          id fromId toId fromName toName fromType toType label
        }
      }
      ... on Item {
        id name description entityType projectId
        itemType rarity origin powers
        relationships {
          id fromId toId fromName toName fromType toType label
        }
      }
      ... on Event {
        id name description entityType projectId
        eventType timelineOrder era consequences
        relationships {
          id fromId toId fromName toName fromType toType label
        }
      }
      ... on Faction {
        id name description entityType projectId
        factionType alignment goals
        relationships {
          id fromId toId fromName toName fromType toType label
        }
      }
    }
  }
`;

// ─── Entity Mutations ─────────────────────────────────────────────────────────

export const CREATE_PLACE = gql`
  mutation CreatePlace($input: CreatePlaceInput!) {
    createPlace(input: $input) {
      id name description entityType projectId placeType
    }
  }
`;

export const CREATE_CHARACTER = gql`
  mutation CreateCharacter($input: CreateCharacterInput!) {
    createCharacter(input: $input) {
      id name description entityType projectId role species
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id name description entityType projectId itemType rarity
    }
  }
`;

export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id name description entityType projectId eventType
    }
  }
`;

export const CREATE_FACTION = gql`
  mutation CreateFaction($input: CreateFactionInput!) {
    createFaction(input: $input) {
      id name description entityType projectId factionType
    }
  }
`;

export const DELETE_ENTITY = gql`
  mutation DeleteEntity($id: ID!) {
    deleteEntity(id: $id) {
      message
    }
  }
`;

// ─── Relationship Mutations ───────────────────────────────────────────────────

export const CREATE_RELATIONSHIP = gql`
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      id fromId toId fromName toName fromType toType label projectId
    }
  }
`;

export const DELETE_RELATIONSHIP = gql`
  mutation DeleteRelationship($id: ID!) {
    deleteRelationship(id: $id) {
      message
    }
  }
`;

// ─── AI Generation ─────────────────────────────────────────────────────────────

export const GET_GENERATION_CONTEXT = gql`
  query GetGenerationContext($projectId: ID!, $entityType: EntityType!, $focusEntityId: ID) {
    generationContext(projectId: $projectId, entityType: $entityType, focusEntityId: $focusEntityId) {
      projectId
      entityType
      existingEntities {
        id name entityType description
      }
      existingRelationships {
        fromName toName label
      }
      suggestions {
        type message
      }
      focusEntity {
        id name entityType description
      }
    }
  }
`;

export const GENERATE_ENTITY = gql`
  mutation GenerateEntity($input: GenerateEntityInput!) {
    generateEntity(input: $input) {
      generationId
      entityType
      name
      description
      attributes {
        key value
      }
      suggestedRelationships {
        targetId targetName label rationale
      }
      consistencyScore
      warnings
    }
  }
`;

export const REFINE_GENERATION = gql`
  mutation RefineGeneration($input: RefineGenerationInput!) {
    refineGeneration(input: $input) {
      generationId
      entityType
      name
      description
      attributes {
        key value
      }
      suggestedRelationships {
        targetId targetName label rationale
      }
      consistencyScore
      warnings
    }
  }
`;

export const ACCEPT_GENERATED_ENTITY = gql`
  mutation AcceptGeneratedEntity($input: AcceptGeneratedEntityInput!) {
    acceptGeneratedEntity(input: $input) {
      ... on Place { id name description entityType projectId }
      ... on Character { id name description entityType projectId }
      ... on Item { id name description entityType projectId }
      ... on Event { id name description entityType projectId }
      ... on Faction { id name description entityType projectId }
    }
  }
`;

// ─── Projects ─────────────────────────────────────────────────────────────────

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id name description genre entityCount relationshipCount createdAt
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id name description genre createdAt
    }
  }
`;

// ─── Subscription ─────────────────────────────────────────────────────────────

export const GET_SUBSCRIPTION_STATUS = gql`
  query GetSubscriptionStatus {
    subscriptionStatus {
      isActive
      plan
      projectLimit
      entityLimit
      generationCredits
      periodEnd
      cancelAtPeriodEnd
    }
  }
`;

export const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSession($plan: SubscriptionPlan!) {
    createCheckoutSession(plan: $plan) {
      url
      sessionId
    }
  }
`;
