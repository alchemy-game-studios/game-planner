import React, { useState } from 'react';

const ENTITY_TYPES = ['PLACE', 'CHARACTER', 'ITEM', 'EVENT', 'FACTION'];

// Sample data - will be replaced with GraphQL data
const sampleEntities = [
  { id: '1', name: 'Ironforge', entityType: 'PLACE', description: 'Mountain stronghold city', placeType: 'City' },
  { id: '2', name: 'Elara Brightshield', entityType: 'CHARACTER', description: 'Brave knight from Ironforge', role: 'Warrior', species: 'Human' },
  { id: '3', name: 'Sword of Light', entityType: 'ITEM', description: 'Legendary blade', itemType: 'Weapon', rarity: 'Legendary' },
  { id: '4', name: 'Battle of the Pass', entityType: 'EVENT', description: 'Epic confrontation', eventType: 'Battle', timelineOrder: 1 },
  { id: '5', name: 'Silver Legion', entityType: 'FACTION', description: 'Order of knights', factionType: 'Military Order' },
  { id: '6', name: 'Shadowfen Marsh', entityType: 'PLACE', description: 'Dangerous wetlands', placeType: 'Wilderness' },
  { id: '7', name: 'Gareth the Wise', entityType: 'CHARACTER', description: 'Ancient wizard and advisor', role: 'Mage', species: 'Elf' },
  { id: '8', name: 'Crown of Stars', entityType: 'ITEM', description: 'Mystical headpiece', itemType: 'Artifact', rarity: 'Unique' },
];

const EntityPanel = ({ onEntitySelect, selectedEntityId }) => {
  const [activeTab, setActiveTab] = useState('PLACE');
  const [isCreating, setIsCreating] = useState(false);
  const [newEntity, setNewEntity] = useState({ name: '', description: '' });

  const filteredEntities = sampleEntities.filter(e => e.entityType === activeTab);

  const handleCreate = (e) => {
    e.preventDefault();
    // TODO: Implement GraphQL mutation
    console.log('Create entity:', { ...newEntity, entityType: activeTab });
    setNewEntity({ name: '', description: '' });
    setIsCreating(false);
  };

  return (
    <div className="entity-panel">
      {/* Entity Type Tabs */}
      <div className="entity-type-tabs">
        {ENTITY_TYPES.map(type => (
          <button
            key={type}
            className={`tab ${activeTab === type ? 'active' : ''}`}
            onClick={() => setActiveTab(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Create Button */}
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
            />
            <textarea
              placeholder="Description"
              value={newEntity.description}
              onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
              rows={3}
              required
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="submit" style={{ flex: 1 }}>Create</button>
              <button 
                type="button" 
                onClick={() => {
                  setIsCreating(false);
                  setNewEntity({ name: '', description: '' });
                }}
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
        {filteredEntities.length === 0 ? (
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
              <strong>{entity.name}</strong>
              <div className="entity-desc">{entity.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EntityPanel;
