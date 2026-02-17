import React from 'react';

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

// All connections from sample data (shared reference)
const ALL_CONNECTIONS = [
  { from: '2', to: '1', label: 'Lives in' },
  { from: '2', to: '3', label: 'Wields' },
  { from: '2', to: '5', label: 'Member of' },
  { from: '4', to: '1', label: 'Took place at' },
  { from: '2', to: '4', label: 'Participated in' },
  { from: '7', to: '5', label: 'Advisor to' },
  { from: '8', to: '9', label: 'Sought by' },
  { from: '9', to: '6', label: 'Based in' },
  { from: '4', to: '9', label: 'Triggered by' },
];

const ALL_ENTITIES = [
  { id: '1', name: 'Ironforge', entityType: 'PLACE' },
  { id: '2', name: 'Elara Brightshield', entityType: 'CHARACTER' },
  { id: '3', name: 'Sword of Light', entityType: 'ITEM' },
  { id: '4', name: 'Battle of the Pass', entityType: 'EVENT' },
  { id: '5', name: 'Silver Legion', entityType: 'FACTION' },
  { id: '6', name: 'Shadowfen Marsh', entityType: 'PLACE' },
  { id: '7', name: 'Gareth the Wise', entityType: 'CHARACTER' },
  { id: '8', name: 'Crown of Stars', entityType: 'ITEM' },
  { id: '9', name: 'Order of Dusk', entityType: 'FACTION' },
];

function getConnections(entityId) {
  const out = [];
  const inbound = [];

  ALL_CONNECTIONS.forEach((c) => {
    const from = ALL_ENTITIES.find((e) => e.id === c.from);
    const to = ALL_ENTITIES.find((e) => e.id === c.to);
    if (c.from === entityId && to) {
      out.push({ label: c.label, entity: to, dir: 'out' });
    }
    if (c.to === entityId && from) {
      inbound.push({ label: c.label, entity: from, dir: 'in' });
    }
  });

  return { out, inbound };
}

export default function EntityDetail({ entity, onClose }) {
  if (!entity) return null;

  const type = entity.entityType || entity.__typename?.toUpperCase() || 'UNKNOWN';
  const color = TYPE_COLORS[type] || '#999';
  const icon = TYPE_ICONS[type] || '•';
  const { out, inbound } = getConnections(entity.id);
  const hasConnections = out.length > 0 || inbound.length > 0;

  return (
    <div className="entity-detail">
      <div className="detail-header">
        <span className="detail-type-badge" style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}>
          {icon} {type}
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

      {hasConnections && (
        <div className="detail-connections">
          <h4>Relationships ({out.length + inbound.length})</h4>
          <div className="detail-connection-list">
            {out.map((c, i) => (
              <div key={`out-${i}`} className="detail-connection-item">
                <span className="detail-connection-label">{c.label}</span>
                <span style={{ color: '#4a4a6a' }}>→</span>
                <span className="detail-connection-target">
                  {TYPE_ICONS[c.entity.entityType]} {c.entity.name}
                </span>
              </div>
            ))}
            {inbound.map((c, i) => (
              <div key={`in-${i}`} className="detail-connection-item">
                <span style={{ color: '#4a4a6a' }}>←</span>
                <span className="detail-connection-target">
                  {TYPE_ICONS[c.entity.entityType]} {c.entity.name}
                </span>
                <span className="detail-connection-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
