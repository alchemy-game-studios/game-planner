/**
 * StatsPanel.jsx
 * Shows detailed statistics about the canon
 */

import React from 'react';

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

export default function StatsPanel({ graphData, onClose }) {
  if (!graphData) return null;

  const { nodes = [], edges = [] } = graphData;

  // Group nodes by type
  const byType = {};
  nodes.forEach(node => {
    const type = node.entityType || 'OTHER';
    byType[type] = (byType[type] || 0) + 1;
  });

  // Calculate relationship stats
  const relationshipTypes = {};
  edges.forEach(edge => {
    const label = edge.label || 'unlabeled';
    relationshipTypes[label] = (relationshipTypes[label] || 0) + 1;
  });

  // Find most connected entities
  const connectionCounts = {};
  edges.forEach(edge => {
    connectionCounts[edge.source] = (connectionCounts[edge.source] || 0) + 1;
    connectionCounts[edge.target] = (connectionCounts[edge.target] || 0) + 1;
  });

  const topConnected = Object.entries(connectionCounts)
    .map(([id, count]) => ({
      entity: nodes.find(n => n.id === id),
      count,
    }))
    .filter(item => item.entity)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top relationship types
  const topRelTypes = Object.entries(relationshipTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 600,
        maxHeight: '80vh',
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: 12,
        zIndex: 2000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a4a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e0e0e0', margin: 0 }}>
          📊 Canon Statistics
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6a6a8a',
            fontSize: 20,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
        {/* Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <StatCard
            label="Total Entities"
            value={nodes.length}
            icon="🔥"
            color="#6a3aff"
          />
          <StatCard
            label="Relationships"
            value={edges.length}
            icon="🔗"
            color="#e94560"
          />
          <StatCard
            label="Avg Connections"
            value={nodes.length > 0 ? (edges.length * 2 / nodes.length).toFixed(1) : 0}
            icon="📊"
            color="#4CAF50"
          />
        </div>

        {/* Entity breakdown */}
        <Section title="Entities by Type">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(byType).map(([type, count]) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#12122a',
                  borderRadius: 6,
                  border: '1px solid #2a2a4a',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{TYPE_ICONS[type] || '•'}</span>
                  <span style={{ fontSize: 14, color: '#a0a0b0' }}>{type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: TYPE_COLORS[type] }}>
                    {count}
                  </span>
                  <div
                    style={{
                      width: 60,
                      height: 4,
                      background: '#0a0a18',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(count / nodes.length) * 100}%`,
                        height: '100%',
                        background: TYPE_COLORS[type],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Most connected */}
        {topConnected.length > 0 && (
          <Section title="Most Connected Entities">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topConnected.map(({ entity, count }, idx) => (
                <div
                  key={entity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 10px',
                    background: idx === 0 ? '#2a2a4a22' : 'transparent',
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: '#4a4a6a', width: 20 }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 16 }}>
                    {TYPE_ICONS[entity.entityType] || '•'}
                  </span>
                  <span style={{ fontSize: 13, color: '#e0e0e0', flex: 1 }}>
                    {entity.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#6a6a8a' }}>
                    {count} connection{count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Relationship types */}
        {topRelTypes.length > 0 && (
          <Section title="Top Relationship Types">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topRelTypes.map(([label, count]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#12122a',
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#a0a0b0' }}>{label}</span>
                  <span style={{ fontSize: 12, color: '#6a6a8a' }}>{count}×</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        background: '#12122a',
        border: '1px solid #2a2a4a',
        borderRadius: 8,
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#6a6a8a' }}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#a0a0b0', marginBottom: 10 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
