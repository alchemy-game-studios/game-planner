import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_ENTITIES,
  GET_CANON_GRAPH,
  CREATE_PLACE,
  CREATE_CHARACTER,
  CREATE_ITEM,
  CREATE_EVENT,
  CREATE_FACTION,
  DELETE_ENTITY,
} from '../client-graphql/canon-operations';

const ENTITY_TYPES = ['PLACE', 'CHARACTER', 'ITEM', 'EVENT', 'FACTION'];

// Default project ID — in full auth flow this comes from context/URL
const DEFAULT_PROJECT_ID = 'default';

// Map entity type → create mutation
const CREATE_MUTATIONS = {
  PLACE: CREATE_PLACE,
  CHARACTER: CREATE_CHARACTER,
  ITEM: CREATE_ITEM,
  EVENT: CREATE_EVENT,
  FACTION: CREATE_FACTION,
};

// Map entity type → mutation variable key
const MUTATION_KEY = {
  PLACE: 'createPlace',
  CHARACTER: 'createCharacter',
  ITEM: 'createItem',
  EVENT: 'createEvent',
  FACTION: 'createFaction',
};

const TYPE_ICONS = {
  PLACE: '🏔️',
  CHARACTER: '⚔️',
  ITEM: '✨',
  EVENT: '⚡',
  FACTION: '🛡️',
};

const EntityPanel = ({ projectId = DEFAULT_PROJECT_ID, onEntitySelect, selectedEntityId }) => {
  const [activeTab, setActiveTab] = useState('PLACE');
  const [isCreating, setIsCreating] = useState(false);
  const [newEntity, setNewEntity] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch entities for current tab
  const { loading, data, refetch } = useQuery(GET_ENTITIES, {
    variables: { projectId, entityType: activeTab },
  });

  // Current create mutation
  const [createEntity, { loading: creating }] = useMutation(
    CREATE_MUTATIONS[activeTab],
    {
      onCompleted: () => {
        setNewEntity({ name: '', description: '' });
        setIsCreating(false);
        setError(null);
        // Refetch both entity list and graph
        refetch();
      },
      onError: (err) => {
        setError(err.message);
      },
      refetchQueries: [
        { query: GET_ENTITIES, variables: { projectId, entityType: activeTab } },
        { query: GET_CANON_GRAPH, variables: { projectId } },
      ],
    }
  );

  const [deleteEntity] = useMutation(DELETE_ENTITY, {
    refetchQueries: [
      { query: GET_ENTITIES, variables: { projectId, entityType: activeTab } },
      { query: GET_CANON_GRAPH, variables: { projectId } },
    ],
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEntity.name.trim() || !newEntity.description.trim()) return;

    try {
      await createEntity({
        variables: {
          input: {
            projectId,
            name: newEntity.name.trim(),
            description: newEntity.description.trim(),
          },
        },
      });
    } catch (err) {
      // handled in onError
    }
  };

  const handleTabChange = (type) => {
    setActiveTab(type);
    setIsCreating(false);
    setNewEntity({ name: '', description: '' });
    setError(null);
  };

  const handleDelete = async (entityId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this entity? This cannot be undone.')) return;
    await deleteEntity({ variables: { id: entityId } });
  };

  // Flatten the union type response
  const entities = data?.entities || [];
  const filteredEntities = entities
    .filter((e) => e.entityType === activeTab)
    .filter((e) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.name?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="entity-panel">
      {/* Entity Type Tabs */}
      <div className="entity-type-tabs">
        {ENTITY_TYPES.map(type => (
          <button
            key={type}
            className={`tab ${activeTab === type ? 'active' : ''}`}
            onClick={() => handleTabChange(type)}
            title={type}
          >
            {TYPE_ICONS[type]}
          </button>
        ))}
      </div>

      {/* Tab label */}
      <div style={{ fontSize: 11, color: '#a0a0b0', textAlign: 'center', padding: '2px 0 8px' }}>
        {activeTab}s
      </div>

      {/* Search Input */}
      <div style={{ padding: '0 12px 8px' }}>
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 12,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Create Button / Form */}
      <div className="entity-panel-actions">
        {!isCreating ? (
          <button
            className="create-btn"
            onClick={() => setIsCreating(true)}
          >
            + Create {activeTab.toLowerCase()}
          </button>
        ) : (
          <form className="create-entity-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Name"
              value={newEntity.name}
              onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
              required
              autoFocus
              disabled={creating}
            />
            <textarea
              placeholder="Description"
              value={newEntity.description}
              onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
              rows={3}
              required
              disabled={creating}
            />
            {error && (
              <div style={{ color: '#e94560', fontSize: 12, padding: '4px 0' }}>
                {error.includes('limit') ? `⚠ ${error}` : `Error: ${error}`}
              </div>
            )}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="submit" disabled={creating} style={{ flex: 1 }}>
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewEntity({ name: '', description: '' });
                  setError(null);
                }}
                disabled={creating}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Entity List */}
      <div className="entity-list">
        {loading ? (
          <div className="empty-hint">Loading…</div>
        ) : filteredEntities.length === 0 ? (
          <div className="empty-hint">
            No {activeTab.toLowerCase()}s yet. Create one to get started!
          </div>
        ) : (
          filteredEntities.map(entity => (
            <div
              key={entity.id}
              className={`entity-item ${selectedEntityId === entity.id ? 'selected' : ''}`}
              onClick={() => onEntitySelect(entity)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong>{entity.name}</strong>
                <button
                  onClick={(e) => handleDelete(entity.id, e)}
                  style={{
                    background: 'none', border: 'none', color: '#555',
                    cursor: 'pointer', fontSize: 12, padding: '0 2px',
                    lineHeight: 1, flexShrink: 0,
                  }}
                  title="Delete entity"
                >
                  ✕
                </button>
              </div>
              <div className="entity-desc">{entity.description}</div>
            </div>
          ))
        )}
      </div>

      {/* Entity count */}
      {filteredEntities.length > 0 && (
        <div style={{ fontSize: 11, color: '#4a4a6a', textAlign: 'center', padding: '8px 0' }}>
          {filteredEntities.length} {activeTab.toLowerCase()}{filteredEntities.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default EntityPanel;
