/**
 * AIGenerationPanel.jsx
 * AI-constrained entity generation, wired to real GraphQL backend.
 *
 * Flow:
 *   1. Fetch generation context (existing entities, constraints, suggestions)
 *   2. User picks entity type, writes a prompt, selects constraint entities
 *   3. Calls generateEntity mutation → server builds context from Neo4j + calls AI
 *   4. User reviews result, can refine or accept
 *   5. acceptGeneratedEntity saves to Neo4j and creates relationships
 */

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_GENERATION_CONTEXT,
  GET_CANON_GRAPH,
  GET_ENTITIES,
  GENERATE_ENTITY,
  REFINE_GENERATION,
  ACCEPT_GENERATED_ENTITY,
} from '../client-graphql/canon-operations';

const ENTITY_TYPES = ['PLACE', 'CHARACTER', 'ITEM', 'EVENT', 'FACTION'];

const TYPE_ICONS = {
  PLACE: '🏔️',
  CHARACTER: '⚔️',
  ITEM: '✨',
  EVENT: '⚡',
  FACTION: '🛡️',
};

const TYPE_COLORS = {
  PLACE: '#4CAF50',
  CHARACTER: '#2196F3',
  ITEM: '#FF9800',
  EVENT: '#9C27B0',
  FACTION: '#F44336',
};

const DEFAULT_PROJECT_ID = 'default';

export default function AIGenerationPanel({ projectId = DEFAULT_PROJECT_ID, onClose, onAddToCanon }) {
  const [targetType, setTargetType] = useState('CHARACTER');
  const [selectedConstraints, setSelectedConstraints] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [refineFeedback, setRefineFeedback] = useState('');
  const [currentGenId, setCurrentGenId] = useState(null);
  const [result, setResult] = useState(null);
  const [acceptedRelationships, setAcceptedRelationships] = useState([]);
  const [error, setError] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);

  // Fetch generation context — shows what exists in the canon
  const { data: contextData, loading: contextLoading } = useQuery(GET_GENERATION_CONTEXT, {
    variables: { projectId, entityType: targetType },
  });

  const context = contextData?.generationContext;

  // Generate mutation
  const [generateEntity, { loading: isGenerating }] = useMutation(GENERATE_ENTITY, {
    onCompleted: (data) => {
      setResult(data.generateEntity);
      setCurrentGenId(data.generateEntity.generationId);
      setAcceptedRelationships(
        data.generateEntity.suggestedRelationships.map((r) => r.targetId)
      );
      setError(null);
    },
    onError: (err) => setError(err.message),
  });

  // Refine mutation
  const [refineGeneration, { loading: isRefining }] = useMutation(REFINE_GENERATION, {
    onCompleted: (data) => {
      setResult(data.refineGeneration);
      setCurrentGenId(data.refineGeneration.generationId);
      setRefineFeedback('');
      setError(null);
    },
    onError: (err) => setError(err.message),
  });

  // Accept mutation
  const [acceptGeneration, { loading: isAccepting }] = useMutation(ACCEPT_GENERATED_ENTITY, {
    onCompleted: (data) => {
      setIsAccepted(true);
      if (onAddToCanon) onAddToCanon(data.acceptGeneratedEntity);
    },
    onError: (err) => setError(err.message),
    refetchQueries: [
      { query: GET_CANON_GRAPH, variables: { projectId } },
      { query: GET_ENTITIES, variables: { projectId, entityType: targetType } },
    ],
  });

  const toggleConstraint = useCallback((entity) => {
    setSelectedConstraints((prev) => {
      const isSelected = prev.some((e) => e.id === entity.id);
      if (isSelected) return prev.filter((e) => e.id !== entity.id);
      return [...prev, entity];
    });
    setResult(null);
    setCurrentGenId(null);
    setIsAccepted(false);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setResult(null);
    setCurrentGenId(null);
    setIsAccepted(false);
    setError(null);
    await generateEntity({
      variables: {
        input: {
          projectId,
          entityType: targetType,
          prompt: prompt.trim(),
          constrainedByEntityIds: selectedConstraints.map((e) => e.id),
        },
      },
    });
  };

  const handleRefine = async () => {
    if (!refineFeedback.trim() || !currentGenId) return;
    await refineGeneration({
      variables: {
        input: {
          generationId: currentGenId,
          feedback: refineFeedback.trim(),
          projectId,
        },
      },
    });
  };

  const handleAccept = async () => {
    if (!currentGenId) return;

    // Build create-relationship inputs for accepted suggestions
    const createRelationships = (result.suggestedRelationships || [])
      .filter((r) => acceptedRelationships.includes(r.targetId) && r.targetId)
      .map((r) => ({
        projectId,
        fromId: '__NEW__', // server fills in after entity creation
        toId: r.targetId,
        fromType: targetType,
        toType: 'UNKNOWN',
        label: r.label,
      }));

    await acceptGeneration({
      variables: {
        input: {
          generationId: currentGenId,
          projectId,
          createRelationships: createRelationships.length > 0 ? createRelationships : undefined,
        },
      },
    });
  };

  const toggleAcceptedRelationship = (targetId) => {
    setAcceptedRelationships((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]
    );
  };

  const consistencyColor = (score) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.5) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="ai-generation-panel" style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>✦ AI Generation</div>
          <div style={{ fontSize: 12, color: '#6a6a8a' }}>Constrained by your canon graph</div>
        </div>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
      </div>

      {/* Context Suggestions */}
      {context?.suggestions?.length > 0 && (
        <div style={contextBoxStyle}>
          {context.suggestions.slice(0, 2).map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: '#a0a0b0', marginBottom: 4 }}>
              <span style={{ color: '#6a6aaa', marginRight: 4 }}>◆</span>
              {s.message}
            </div>
          ))}
        </div>
      )}

      {/* Entity Type Selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {ENTITY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => {
              setTargetType(type);
              setResult(null);
              setCurrentGenId(null);
              setIsAccepted(false);
              setSelectedConstraints([]);
            }}
            style={{
              flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: 600,
              background: targetType === type ? TYPE_COLORS[type] : '#1a1a2e',
              color: targetType === type ? '#fff' : '#6a6a8a',
              border: `1px solid ${targetType === type ? TYPE_COLORS[type] : '#2a2a4a'}`,
              borderRadius: 4, cursor: 'pointer',
            }}
            title={type}
          >
            {TYPE_ICONS[type]}
          </button>
        ))}
      </div>

      {/* Constraint Selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#6a6a8a', marginBottom: 6 }}>
          Constrain to ({selectedConstraints.length} selected):
        </div>
        <div style={{ maxHeight: 100, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {contextLoading ? (
            <div style={{ fontSize: 12, color: '#4a4a6a' }}>Loading canon…</div>
          ) : context?.existingEntities?.length === 0 ? (
            <div style={{ fontSize: 12, color: '#4a4a6a' }}>No entities yet — generate freely!</div>
          ) : (
            (context?.existingEntities || []).map((e) => {
              const selected = selectedConstraints.some((c) => c.id === e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => toggleConstraint(e)}
                  style={{
                    padding: '3px 8px', fontSize: 11, borderRadius: 12,
                    background: selected ? TYPE_COLORS[e.entityType] : 'transparent',
                    color: selected ? '#fff' : '#a0a0b0',
                    border: `1px solid ${selected ? TYPE_COLORS[e.entityType] : '#2a2a4a'}`,
                    cursor: 'pointer',
                  }}
                >
                  {TYPE_ICONS[e.entityType]} {e.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Prompt */}
      <div style={{ marginBottom: 12 }}>
        <textarea
          placeholder={`Describe the ${targetType.toLowerCase()} you want to create…`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          style={textareaStyle}
          disabled={isGenerating || isAccepted}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: '#e94560', fontSize: 12, marginBottom: 8, padding: '6px', background: '#2a1a1a', borderRadius: 4 }}>
          ⚠ {error}
        </div>
      )}

      {/* Generate Button */}
      {!result && !isAccepted && (
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          style={{
            ...primaryBtnStyle,
            opacity: isGenerating || !prompt.trim() ? 0.6 : 1,
          }}
        >
          {isGenerating ? '⟳ Generating (constrained by canon)…' : '✦ Generate'}
        </button>
      )}

      {/* Result */}
      {result && !isAccepted && (
        <div style={resultBoxStyle}>
          {/* Consistency Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#6a6a8a' }}>Consistency Score</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: consistencyColor(result.consistencyScore) }}>
              {Math.round(result.consistencyScore * 100)}%
            </span>
          </div>

          {/* Name & Description */}
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{result.name}</div>
          <div style={{ fontSize: 13, color: '#c0c0d0', marginBottom: 10, lineHeight: 1.5 }}>
            {result.description}
          </div>

          {/* Attributes */}
          {result.attributes?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {result.attributes.map((a) => (
                <div key={a.key} style={{ fontSize: 12, color: '#a0a0b0' }}>
                  <strong style={{ color: '#c0c0d0' }}>{a.key}:</strong> {a.value}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {result.warnings?.map((w, i) => (
            <div key={i} style={{ fontSize: 11, color: '#FF9800', marginBottom: 4 }}>⚠ {w}</div>
          ))}

          {/* Suggested Relationships */}
          {result.suggestedRelationships?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#6a6a8a', marginBottom: 6 }}>Suggested Relationships:</div>
              {result.suggestedRelationships.map((r) => (
                <label key={r.targetId} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={acceptedRelationships.includes(r.targetId)}
                    onChange={() => toggleAcceptedRelationship(r.targetId)}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontSize: 12 }}>
                      <strong>{r.label}</strong> → {r.targetName}
                    </div>
                    <div style={{ fontSize: 11, color: '#6a6a8a' }}>{r.rationale}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Refine */}
          <div style={{ marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Feedback to refine (e.g. 'Make them darker, add more mystery')"
              value={refineFeedback}
              onChange={(e) => setRefineFeedback(e.target.value)}
              disabled={isRefining}
              style={{ ...textareaStyle, padding: '6px', height: 'auto' }}
            />
            <button
              onClick={handleRefine}
              disabled={isRefining || !refineFeedback.trim()}
              style={{ ...secondaryBtnStyle, marginTop: 4, opacity: isRefining || !refineFeedback.trim() ? 0.6 : 1 }}
            >
              {isRefining ? '⟳ Refining…' : '↩ Refine'}
            </button>
          </div>

          {/* Accept */}
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            style={{ ...primaryBtnStyle, background: '#4CAF50', opacity: isAccepting ? 0.6 : 1 }}
          >
            {isAccepting ? 'Adding to Canon…' : '✓ Accept & Add to Canon'}
          </button>
        </div>
      )}

      {/* Accepted confirmation */}
      {isAccepted && (
        <div style={{
          textAlign: 'center', padding: 24, color: '#4CAF50',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{result?.name} added to canon!</div>
          <div style={{ fontSize: 12, color: '#6a6a8a', marginTop: 4 }}>Visible in the graph</div>
          <button onClick={() => { setResult(null); setIsAccepted(false); setPrompt(''); setCurrentGenId(null); }} style={{ ...secondaryBtnStyle, marginTop: 12 }}>
            Generate Another
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const panelStyle = {
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 380, background: '#12121f',
  border: '1px solid #2a2a4a',
  boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
  overflowY: 'auto', padding: 20,
  zIndex: 100, display: 'flex', flexDirection: 'column',
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'flex-start', marginBottom: 16,
};

const closeBtnStyle = {
  background: 'none', border: 'none', color: '#6a6a8a',
  cursor: 'pointer', fontSize: 18, padding: 0,
};

const contextBoxStyle = {
  background: '#1a1a2e', border: '1px solid #2a2a4a',
  borderRadius: 6, padding: '8px 12px', marginBottom: 14,
};

const textareaStyle = {
  width: '100%', background: '#1a1a2e',
  border: '1px solid #2a2a4a', borderRadius: 6,
  color: '#e0e0e0', padding: '8px 12px',
  fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
};

const primaryBtnStyle = {
  width: '100%', padding: '10px', background: '#6a3aff',
  color: '#fff', border: 'none', borderRadius: 6,
  cursor: 'pointer', fontWeight: 600, fontSize: 14,
};

const secondaryBtnStyle = {
  width: '100%', padding: '8px', background: 'transparent',
  color: '#a0a0b0', border: '1px solid #2a2a4a', borderRadius: 6,
  cursor: 'pointer', fontSize: 13,
};

const resultBoxStyle = {
  background: '#1a1a2e', border: '1px solid #2a2a4a',
  borderRadius: 8, padding: 16, marginTop: 12,
};
