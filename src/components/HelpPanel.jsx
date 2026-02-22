/**
 * HelpPanel.jsx
 * Quick help and keyboard shortcuts reference
 */

import React from 'react';

export default function HelpPanel({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1999,
        }}
        onClick={onClose}
      />

      {/* Panel */}
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
            ❓ Help & Shortcuts
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
          <Section title="⌨️ Keyboard Shortcuts">
            <Shortcut keys={['Cmd/Ctrl', 'G']} description="Open AI Generation panel" />
            <Shortcut keys={['Esc']} description="Close panels and dropdowns" />
          </Section>

          <Section title="🎯 Quick Tips">
            <Tip
              icon="🔗"
              title="Connect Mode"
              description="Click the 'Connect' button in the graph, then drag from one entity to another to create relationships."
            />
            <Tip
              icon="🔍"
              title="Search Entities"
              description="Use the search box in the entity panel to quickly find entities by name or description."
            />
            <Tip
              icon="✦"
              title="AI Constraints"
              description="When generating new entities, select existing entities as constraints to keep your world consistent."
            />
            <Tip
              icon="📊"
              title="Track Growth"
              description="Use the Stats panel to see which entities are most connected and understand your canon's structure."
            />
            <Tip
              icon="💾"
              title="Backup Your Work"
              description="Export your canon as JSON regularly to keep backups, or use Markdown export for documentation."
            />
          </Section>

          <Section title="🧩 Entity Types">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <EntityType icon="🏔️" name="Places" color="#4CAF50" />
              <EntityType icon="⚔️" name="Characters" color="#2196F3" />
              <EntityType icon="✨" name="Items" color="#FF9800" />
              <EntityType icon="⚡" name="Events" color="#9C27B0" />
              <EntityType icon="🛡️" name="Factions" color="#F44336" />
            </div>
          </Section>

          <Section title="🔗 Relationships">
            <p style={{ fontSize: 13, color: '#a0a0b0', lineHeight: 1.6, margin: 0 }}>
              Relationships are the connections between entities. Examples:
            </p>
            <ul style={{ fontSize: 13, color: '#6a6a8a', margin: '8px 0 0', paddingLeft: 20 }}>
              <li>Character → "Lives in" → Place</li>
              <li>Item → "Forged by" → Character</li>
              <li>Event → "Caused by" → Faction</li>
              <li>Character → "Member of" → Faction</li>
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#a0a0b0', marginBottom: 12 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Shortcut({ keys, description }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#12122a',
        borderRadius: 6,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 13, color: '#a0a0b0' }}>{description}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {keys.map((key, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span style={{ color: '#4a4a6a', fontSize: 12 }}>+</span>}
            <kbd
              style={{
                padding: '2px 8px',
                fontSize: 11,
                background: '#0a0a18',
                border: '1px solid #2a2a4a',
                borderRadius: 4,
                color: '#6a6a8a',
                fontFamily: 'monospace',
              }}
            >
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Tip({ icon, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 12px',
        background: '#12122a',
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#6a6a8a', lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

function EntityType({ icon, name, color }) {
  return (
    <div
      style={{
        padding: '10px',
        background: '#12122a',
        border: `1px solid ${color}33`,
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600 }}>{name}</div>
    </div>
  );
}
