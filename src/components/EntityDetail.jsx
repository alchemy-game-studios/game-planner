import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ENTITY_WITH_RELATIONSHIPS,
  GET_CANON_GRAPH,
  CREATE_RELATIONSHIP,
  DELETE_RELATIONSHIP,
  GET_ENTITIES,
} from '../client-graphql/canon-operations';

const TYPE_COLORS = {
  PLACE: '#4CAF50',
  CHARACTER: '#2196F3',
  ITEM: '#FF9800',
  EVENT: '#9C27B0',
  FACTION: '#F44336',
};

const TYPE_ICONS = {
  PLACE: '🏔️',
  CHARACTER: '⚔️',
  ITEM: '✨',
  EVENT: '⚡',
  FACTION: '🛡️',
};

const DEFAULT_PROJECT_ID = 'default';

export default function EntityDetail({ entity, projectId = DEFAULT_PROJECT_ID, onClose }) {
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [relTarget, setRelTarget] = useState('');
  const [relLabel, setRelLabel] = useState('');

  // Fetch full entity with live relationships
  const { data, loading, refetch } = useQuery(GET_ENTITY_WITH_RELATIONSHIPS, {
    variables: { id: entity?.id },
    skip: !entity?.id,
  });

  // Fetch all entities for relationship target selector
  const { data: allEntitiesData } = useQuery(GET_ENTITIES, {
    variables: { projectId },
    skip: !showAddRelationship,
  });

  const [createRelationship, { loading: creatingRel }] = useMutation(CREATE_RELATIONSHIP, {
    onCompleted: () => {
      setShowAddRelationship(false);
      setRelTarget('');
      setRelLabel('');
      refetch();
    },
    refetchQueries: [{ query: GET_CANON_GRAPH, variables: { projectId } }],
  });

  const [deleteRelationship] = useMutation(DELETE_RELATIONSHIP, {
    onCompleted: () => refetch(),
    refetchQueries: [{ query: GET_CANON_GRAPH, variables: { projectId } }],
  });

  if (!entity) return null;

  const liveEntity = data?.entity || entity;
  const type = liveEntity.entityType || 'UNKNOWN';
  const color = TYPE_COLORS[type] || '#999';
  const icon = TYPE_ICONS[type] || '•';
  const relationships = liveEntity.relationships || [];

  const outbound = relationships.filter((r) => r.fromId === liveEntity.id);
  const inbound = relationships.filter((r) => r.toId === liveEntity.id);

  // All entities except this one, for relationship target
  const allEntities = (allEntitiesData?.entities || []).filter((e) => e.id !== liveEntity.id);

  const handleAddRelationship = async (e) => {
    e.preventDefault();
    if (!relTarget || !relLabel.trim()) return;

    const target = allEntities.find((e) => e.id === relTarget);
    if (!target) return;

    await createRelationship({
      variables: {
        input: {
          projectId,
          fromId: liveEntity.id,
          toId: target.id,
          fromType: liveEntity.entityType,
          toType: target.entityType,
          label: relLabel.trim(),
        },
      },
    });
  };

  return (
    <div className="entity-detail">
      <div className="detail-header">
        <span
          className="detail-type-badge"
          style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
        >
          {icon} {type}
        </span>
        <h2>{liveEntity.name}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <p className="detail-description">{liveEntity.description}</p>

      {/* Type-specific fields */}
      <div className="detail-meta">
        {liveEntity.role && <div><strong>Role:</strong> {liveEntity.role}</div>}
        {liveEntity.species && <div><strong>Species:</strong> {liveEntity.species}</div>}
        {liveEntity.age && <div><strong>Age:</strong> {liveEntity.age}</div>}
        {liveEntity.placeType && <div><strong>Type:</strong> {liveEntity.placeType}</div>}
        {liveEntity.climate && <div><strong>Climate:</strong> {liveEntity.climate}</div>}
        {liveEntity.population && <div><strong>Population:</strong> {liveEntity.population}</div>}
        {liveEntity.itemType && <div><strong>Type:</strong> {liveEntity.itemType}</div>}
        {liveEntity.rarity && <div><strong>Rarity:</strong> {liveEntity.rarity}</div>}
        {liveEntity.origin && <div><strong>Origin:</strong> {liveEntity.origin}</div>}
        {liveEntity.eventType && <div><strong>Type:</strong> {liveEntity.eventType}</div>}
        {liveEntity.era && <div><strong>Era:</strong> {liveEntity.era}</div>}
        {liveEntity.timelineOrder != null && <div><strong>Timeline:</strong> #{liveEntity.timelineOrder}</div>}
        {liveEntity.factionType && <div><strong>Type:</strong> {liveEntity.factionType}</div>}
        {liveEntity.alignment && <div><strong>Alignment:</strong> {liveEntity.alignment}</div>}
      </div>

      {/* Array fields */}
      {liveEntity.traits?.length > 0 && (
        <div className="detail-tags">
          {liveEntity.traits.map((t, i) => <span key={i} className="tag">{t}</span>)}
        </div>
      )}
      {liveEntity.goals?.length > 0 && (
        <div className="detail-tags">
          {liveEntity.goals.map((g, i) => <span key={i} className="tag">{g}</span>)}
        </div>
      )}
      {liveEntity.powers?.length > 0 && (
        <div className="detail-tags">
          {liveEntity.powers.map((p, i) => <span key={i} className="tag">{p}</span>)}
        </div>
      )}

      {/* Relationships */}
      <div className="detail-connections">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h4 style={{ margin: 0 }}>
            Relationships {loading ? '…' : `(${relationships.length})`}
          </h4>
          <button
            onClick={() => setShowAddRelationship(!showAddRelationship)}
            style={{
              background: 'transparent', border: '1px solid #2a2a4a',
              color: '#a0a0b0', borderRadius: 4, padding: '2px 8px',
              cursor: 'pointer', fontSize: 12,
            }}
          >
            {showAddRelationship ? '✕ Cancel' : '+ Add'}
          </button>
        </div>

        {/* Add relationship form */}
        {showAddRelationship && (
          <form onSubmit={handleAddRelationship} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <select
              value={relTarget}
              onChange={(e) => setRelTarget(e.target.value)}
              required
              style={{
                background: '#1a1a2e', border: '1px solid #2a2a4a',
                color: '#e0e0e0', borderRadius: 4, padding: '6px',
              }}
            >
              <option value="">Select target entity…</option>
              {allEntities.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.entityType}] {e.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Relationship label (e.g. 'Lives in', 'Wields')"
              value={relLabel}
              onChange={(e) => setRelLabel(e.target.value)}
              required
              style={{
                background: '#1a1a2e', border: '1px solid #2a2a4a',
                color: '#e0e0e0', borderRadius: 4, padding: '6px',
              }}
            />
            <button type="submit" disabled={creatingRel}>
              {creatingRel ? 'Adding…' : 'Add Relationship'}
            </button>
          </form>
        )}

        {/* Relationship list */}
        <div className="detail-connection-list">
          {outbound.map((r) => (
            <div key={r.id} className="detail-connection-item">
              <span className="detail-connection-label">{r.label}</span>
              <span style={{ color: '#4a4a6a' }}>→</span>
              <span className="detail-connection-target">
                {TYPE_ICONS[r.toType]} {r.toName}
              </span>
              <button
                onClick={() => deleteRelationship({ variables: { id: r.id } })}
                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11, marginLeft: 'auto' }}
                title="Remove relationship"
              >
                ✕
              </button>
            </div>
          ))}
          {inbound.map((r) => (
            <div key={r.id} className="detail-connection-item">
              <span style={{ color: '#4a4a6a' }}>←</span>
              <span className="detail-connection-target">
                {TYPE_ICONS[r.fromType]} {r.fromName}
              </span>
              <span className="detail-connection-label">{r.label}</span>
            </div>
          ))}
          {relationships.length === 0 && !loading && (
            <div style={{ color: '#4a4a6a', fontSize: 12 }}>
              No relationships yet. Add one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
