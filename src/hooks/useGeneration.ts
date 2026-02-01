import { useState, useCallback } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

// GraphQL operations
const GET_GENERATION_CONTEXT = gql`
  query GetGenerationContext($input: GenerationContextInput!) {
    generationContext(input: $input) {
      sourceEntity {
        id
        name
        description
        type
        _nodeType
        tags {
          id
          name
          description
        }
      }
      parentChain {
        id
        name
        description
        type
        _nodeType
      }
      universe {
        id
        name
        description
        _nodeType
      }
      siblingEntities {
        id
        name
        description
        type
        _nodeType
      }
      childEntities {
        id
        name
        description
        type
        _nodeType
      }
      availableTags {
        id
        name
        description
        entityCount
      }
      suggestedContext {
        id
        name
        description
        type
        _nodeType
      }
      summary {
        entityCount
        tagCount
        hasInvolvements
      }
    }
  }
`;

const ESTIMATE_COST = gql`
  query EstimateGenerationCost(
    $targetType: String!
    $entityCount: Int
    $creativity: Float
    $contextCount: Int
    $tagCount: Int
    $isRegeneration: Boolean
    $isVariation: Boolean
  ) {
    estimateGenerationCost(
      targetType: $targetType
      entityCount: $entityCount
      creativity: $creativity
      contextCount: $contextCount
      tagCount: $tagCount
      isRegeneration: $isRegeneration
      isVariation: $isVariation
    ) {
      credits
      breakdown {
        label
        credits
        isBase
        isModifier
      }
      summary
    }
  }
`;

const USE_CREDITS = gql`
  mutation UseCredits($amount: Int!, $description: String!) {
    useCredits(amount: $amount, description: $description) {
      credits
    }
  }
`;

// Types
export interface ToneSettings {
  formality: number;
  mood: number;
}

export interface GenerationConstraints {
  tagIds: string[];
  tone: ToneSettings;
  creativity: number;
  additionalPrompt: string;
}

export interface GenerationRequest {
  sourceEntityId: string;
  targetType: string;
  constraints: GenerationConstraints;
  additionalContextIds: string[];
}

export interface GeneratedEntity {
  id: string;
  name: string;
  description: string;
  type?: string;
  [key: string]: any;
}

export type GenerationStatus =
  | 'idle'
  | 'preparing'
  | 'generating'
  | 'streaming'
  | 'complete'
  | 'error';

interface UseGenerationReturn {
  // State
  status: GenerationStatus;
  request: GenerationRequest | null;
  result: GeneratedEntity | null;
  error: string | null;
  context: any | null;
  costEstimate: { credits: number; breakdown: any[]; summary: string } | null;

  // Actions
  prepareGeneration: (params: {
    sourceEntityId: string;
    targetType: string;
  }) => Promise<void>;
  updateConstraints: (constraints: Partial<GenerationConstraints>) => void;
  updateContextIds: (ids: string[]) => void;
  execute: () => Promise<void>;
  accept: () => Promise<void>;
  discard: () => void;
  reset: () => void;
}

/**
 * Hook for managing generation state and flow.
 * Provides state management for the generation drawer and handles
 * context assembly, cost estimation, and (future) LLM execution.
 */
export function useGeneration(): UseGenerationReturn {
  // State
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [request, setRequest] = useState<GenerationRequest | null>(null);
  const [result, setResult] = useState<GeneratedEntity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<any | null>(null);
  const [costEstimate, setCostEstimate] = useState<any | null>(null);

  // GraphQL operations
  const [fetchContext] = useLazyQuery(GET_GENERATION_CONTEXT);
  const [fetchCost] = useLazyQuery(ESTIMATE_COST);
  const [useCredits] = useMutation(USE_CREDITS);

  // Default constraints
  const defaultConstraints: GenerationConstraints = {
    tagIds: [],
    tone: { formality: 0.5, mood: 0.5 },
    creativity: 0.5,
    additionalPrompt: '',
  };

  // Prepare generation by fetching context and cost
  const prepareGeneration = useCallback(
    async (params: { sourceEntityId: string; targetType: string }) => {
      setStatus('preparing');
      setError(null);

      try {
        // Initialize request
        const newRequest: GenerationRequest = {
          sourceEntityId: params.sourceEntityId,
          targetType: params.targetType,
          constraints: defaultConstraints,
          additionalContextIds: [],
        };
        setRequest(newRequest);

        // Fetch context
        const { data: contextData } = await fetchContext({
          variables: {
            input: {
              sourceEntityId: params.sourceEntityId,
              targetType: params.targetType,
              includeEntityIds: [],
            },
          },
        });

        if (contextData?.generationContext) {
          setContext(contextData.generationContext);
        }

        // Fetch initial cost estimate
        const { data: costData } = await fetchCost({
          variables: {
            targetType: params.targetType,
            entityCount: 1,
            creativity: defaultConstraints.creativity,
            contextCount: 0,
            tagCount: 0,
          },
        });

        if (costData?.estimateGenerationCost) {
          setCostEstimate(costData.estimateGenerationCost);
        }

        setStatus('idle');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to prepare generation');
        setStatus('error');
      }
    },
    [fetchContext, fetchCost]
  );

  // Update constraints and refresh cost estimate
  const updateConstraints = useCallback(
    async (updates: Partial<GenerationConstraints>) => {
      if (!request) return;

      const newConstraints = { ...request.constraints, ...updates };
      setRequest((prev) =>
        prev ? { ...prev, constraints: newConstraints } : null
      );

      // Refresh cost estimate
      try {
        const { data: costData } = await fetchCost({
          variables: {
            targetType: request.targetType,
            entityCount: 1,
            creativity: newConstraints.creativity,
            contextCount: request.additionalContextIds.length,
            tagCount: newConstraints.tagIds.length,
          },
        });

        if (costData?.estimateGenerationCost) {
          setCostEstimate(costData.estimateGenerationCost);
        }
      } catch (err) {
        console.error('Failed to update cost estimate:', err);
      }
    },
    [request, fetchCost]
  );

  // Update additional context entity IDs
  const updateContextIds = useCallback(
    async (ids: string[]) => {
      if (!request) return;

      setRequest((prev) =>
        prev ? { ...prev, additionalContextIds: ids } : null
      );

      // Refresh context and cost
      try {
        const [{ data: contextData }, { data: costData }] = await Promise.all([
          fetchContext({
            variables: {
              input: {
                sourceEntityId: request.sourceEntityId,
                targetType: request.targetType,
                includeEntityIds: ids,
              },
            },
          }),
          fetchCost({
            variables: {
              targetType: request.targetType,
              entityCount: 1,
              creativity: request.constraints.creativity,
              contextCount: ids.length,
              tagCount: request.constraints.tagIds.length,
            },
          }),
        ]);

        if (contextData?.generationContext) {
          setContext(contextData.generationContext);
        }
        if (costData?.estimateGenerationCost) {
          setCostEstimate(costData.estimateGenerationCost);
        }
      } catch (err) {
        console.error('Failed to update context:', err);
      }
    },
    [request, fetchContext, fetchCost]
  );

  // Execute generation (placeholder for agent layer)
  const execute = useCallback(async () => {
    if (!request || !costEstimate) return;

    setStatus('generating');
    setError(null);

    try {
      // Deduct credits
      await useCredits({
        variables: {
          amount: costEstimate.credits,
          description: `Generate ${request.targetType}`,
        },
      });

      // TODO: Connect to agent layer here
      // For now, simulate a delay and return placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Placeholder result
      const placeholderResult: GeneratedEntity = {
        id: `generated-${Date.now()}`,
        name: `New ${request.targetType}`,
        description: 'This is a placeholder. Agent layer not yet implemented.',
        type: request.targetType,
      };

      setResult(placeholderResult);
      setStatus('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    }
  }, [request, costEstimate, useCredits]);

  // Accept generated result (save to database)
  const accept = useCallback(async () => {
    if (!result) return;

    // TODO: Save result to database via GraphQL mutation
    console.log('Accepting result:', result);

    // Reset state
    setStatus('idle');
    setRequest(null);
    setResult(null);
    setContext(null);
    setCostEstimate(null);
  }, [result]);

  // Discard generated result
  const discard = useCallback(() => {
    setResult(null);
    setStatus('idle');
  }, []);

  // Full reset
  const reset = useCallback(() => {
    setStatus('idle');
    setRequest(null);
    setResult(null);
    setError(null);
    setContext(null);
    setCostEstimate(null);
  }, []);

  return {
    status,
    request,
    result,
    error,
    context,
    costEstimate,
    prepareGeneration,
    updateConstraints,
    updateContextIds,
    execute,
    accept,
    discard,
    reset,
  };
}
