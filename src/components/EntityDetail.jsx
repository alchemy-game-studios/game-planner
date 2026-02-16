import React from 'react';

const TYPE_COLORS = {
  PLACE: '#4CAF50',
  CHARACTER: '#2196F3',
  ITEM: '#FF9800',
  EVENT: '#9C27B0',
  FACTION: '#F44336',
};

export default function EntityDetail({ entity, onClose }) {
  if (!entity) return null;

  const type = entity.entityType || entity.__typename?.toUpperCase() || 'UNKNOWN';
  const color = TYPE_COLORS[type] || '#999';

  return (
    <div className="entity-detail">
      <div className="detail-header">
        <span className="detail-type-badge" style={{ backgroundColor: color }}>
          {type}
        </span>
        <h2>{entity.name}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <p className="detail-description">{entity.description}</p>

      {entity.tags && entity.tags.length > 0 && (
        <div className="detail-tags">
          {entity.tags.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="detail-meta">
        {entity.role && <div><strong>Role:</strong> {entity.role}</div>}
        {entity.species && <div><strong>Species:</strong> {entity.species}</div>}
        {entity.placeType && <div><strong>Type:</strong> {entity.placeType}</div>}
        {entity.itemType && <div><strong>Type:</strong> {entity.itemType}</div>}
        {entity.rarity && <div><strong>Rarity:</strong> {entity.rarity}</div>}
        {entity.eventType && <div><strong>Type:</strong> {entity.eventType}</div>}
        {entity.factionType && <div><strong>Type:</strong> {entity.factionType}</div>}
        {entity.timelineOrder != null && <div><strong>Timeline:</strong> #{entity.timelineOrder}</div>}
      </div>
    </div>
  );
}
