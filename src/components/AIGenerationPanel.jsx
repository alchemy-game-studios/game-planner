import React, { useState, useCallback } from 'react';
import { TYPE_CONFIG } from './EntityNode';

// All entities in the canon (in real app, comes from GraphQL)
const CANON_ENTITIES = [
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

// Simulate AI generation based on constraints
function generateContent(targetType, prompt, constraintEntities) {
  const constraints = constraintEntities.map((e) => e.name);

  const templates = {
    CHARACTER: {
      names: ['Darak the Unyielding', 'Sera Nightwhisper', 'Brom Ashcloak', 'Lyra Stoneheart', 'Vex the Wanderer'],
      roles: ['Rogue', 'Paladin', 'Ranger', 'Sorcerer', 'Warlord'],
      species: ['Human', 'Half-Elf', 'Dwarf', 'Tiefling', 'Gnome'],
      traits: ['Honorable', 'Cunning', 'Reckless', 'Enigmatic', 'Loyal'],
    },
    PLACE: {
      names: ["Dusk Spire", "The Ember Reaches", "Coldwater Basin", "Thornhaven", "Ashen Wastes"],
      types: ['Ruin', 'City', 'Fortress', 'Forest', 'Cavern'],
      traits: ['Ancient', 'Cursed', 'Fortified', 'Abandoned', 'Sacred'],
    },
    ITEM: {
      names: ['Void Compass', 'Ashen Gauntlets', 'Dawnbreaker Tome', 'Rune of Binding', 'Shattered Mirror'],
      types: ['Weapon', 'Artifact', 'Relic', 'Tome', 'Amulet'],
      rarities: ['Rare', 'Epic', 'Legendary', 'Unique', 'Cursed'],
      traits: ['Glowing', 'Sentient', 'Indestructible', 'Ancient', 'Volatile'],
    },
    EVENT: {
      names: ["The Dusk Accord", "Siege of Coldwater", "The Sundering", "Night of Embers", "The Great Purge"],
      types: ['Battle', 'Treaty', 'Disaster', 'Assassination', 'Discovery'],
      traits: ['Decisive', 'Catastrophic', 'Mysterious', 'Celebrated', 'Forgotten'],
    },
    FACTION: {
      names: ['Circle of Cinders', 'Ironveil Conclave', 'The Pale March', 'Dusk Covenant', 'Emberwatch'],
      types: ['Cult', 'Guild', 'Military Order', 'Council', 'Brotherhood'],
      traits: ['Secretive', 'Militant', 'Mercantile', 'Religious', 'Anarchic'],
    },
  };

  const t = templates[targetType] || templates.CHARACTER;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const name = pick(t.names);
  const entityTrait = pick(t.traits);
  const entityType = pick(t.types || ['Unknown']);

  // Build description referencing constraint entities
  let description = '';
  if (targetType === 'CHARACTER') {
    const role = pick(t.roles);
    const species = pick(t.species);
    const location = constraints.find((n) => CANON_ENTITIES.find((e) => e.name === n && e.entityType === 'PLACE'));
    const faction = constraints.find((n) => CANON_ENTITIES.find((e) => e.name === n && e.entityType === 'FACTION'));
    description = `A ${entityTrait.toLowerCase()} ${species} ${role.toLowerCase()}`;
    if (location) description += ` hailing from ${location}`;
    if (faction) description += ` and loyal to ${faction}`;
    description += `. ${prompt ? prompt.charAt(0).toUpperCase() + prompt.slice(1) + '.' : 'Their motivations are known only to a few.'}`;
  } else if (targetType === 'PLACE') {
    description = `A ${entityTrait.toLowerCase()} ${entityType.toLowerCase()} with deep ties to the canon`;
    if (constraints.length > 0) description += `, connected to ${constraints.join(', ')}`;
    description += `. ${prompt || 'Much of its history remains untold.'}`;
  } else {
    description = `${entityTrait} ${entityType} that figures into the stories of ${constraints.length > 0 ? constraints.join(' and ') : 'the world'}. ${prompt || ''}`;
  }

  // Generate relationships to constraint entities
  const relationshipVerbs = {
    CHARACTER: ['Ally of', 'Rival to', 'Loyal to', 'Hunted by', 'Apprentice to'],
    PLACE: ['Located near', 'Controlled by', 'Sacred to', 'Ruined by', 'Defended by'],
    ITEM: ['Wielded by', 'Sought by', 'Created for', 'Stolen from', 'Forged at'],
    EVENT: ['Sparked by', 'Ended at', 'Caused by', 'Witnessed at', 'Named for'],
    FACTION: ['Opposed by', 'Allied with', 'Founded at', 'Funded by', 'Hunted by'],
  };

  const verbs = relationshipVerbs[targetType] || ['Related to'];
  const relationships = constraintEntities.slice(0, 3).map((e, i) => ({
    label: verbs[i % verbs.length],
    target: e,
  }));

  const traits = [entityTrait, entityType, ...(pick(t.roles || t.rarities || []) ? [pick(t.roles || t.rarities || t.types || [])] : [])].filter(Boolean);

  return { name, entityType: targetType, description, relationships, traits };
}

// ─────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────
export default function AIGenerationPanel({ onClose, onAddToCanon }) {
  const [targetType, setTargetType] = useState('CHARACTER');
  const [selectedConstraints, setSelectedConstraints] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [addedToCanon, setAddedToCanon] = useState(false);

  const toggleConstraint = useCallback((entity) => {
    setSelectedConstraints((prev) => {
      const isSelected = prev.some((e) => e.id === entity.id);
      if (isSelected) return prev.filter((e) => e.id !== entity.id);
      return [...prev, entity];
    });
    setResult(null);
    setAddedToCanon(false);
  }, []);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setResult(null);
    setAddedToCanon(false);

    // Simulate AI latency
    setTimeout(() => {
      const generated = generateContent(targetType, prompt, selectedConstraints);
      setResult(generated);
      setIsGenerating(false);
    }, 1200 + Math.random() * 600);
  }, [targetType, prompt, selectedConstraints]);

  const handleRegenerate = useCallback(() => {
    setIsGenerating(true);
    setResult(null);
    setTimeout(() => {
      const generated = generateContent(targetType, prompt, selectedConstraints);
      setResult(generated);
      setIsGenerating(false);
    }, 900 + Math.random() * 500);
  }, [targetType, prompt, selectedConstraints]);

  const handleAddToCanon = useCallback(() => {
    if (!result) return;
    onAddToCanon?.(result);
    setAddedToCanon(true);
  }, [result, onAddToCanon]);

  const canGenerate = !isGenerating;

  return (
    <div className="ai-gen-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ai-gen-panel" role="dialog" aria-label="AI Generation Panel">
        {/* Header */}
        <div className="ai-gen-header">
          <span style={{ fontSize: '1.3rem' }}>✦</span>
          <h2>Generate with Canon Constraints</h2>
          <span className="ai-gen-badge">AI-Powered</span>
          <button className="close-btn" onClick={onClose} style={{ marginLeft: '8px' }}>✕</button>
        </div>

        <div className="ai-gen-body">
          {/* Step 1: Choose entity type to generate */}
          <div>
            <div className="ai-gen-section-label">
              1. What to generate
            </div>
            <div className="ai-generate-type-row">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <button
                  key={type}
                  className={`gen-type-btn ${targetType === type ? 'selected' : ''}`}
                  style={{ '--chip-color': cfg.color }}
                  onClick={() => { setTargetType(type); setResult(null); setAddedToCanon(false); }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Pin canon entities as constraints */}
          <div>
            <div className="ai-gen-section-label">
              2. Constrain by existing canon
              <span className="hint">· pin entities the AI must respect</span>
            </div>
            <div className="constraint-entity-grid">
              {CANON_ENTITIES.map((entity) => {
                const cfg = TYPE_CONFIG[entity.entityType] || {};
                const isSelected = selectedConstraints.some((e) => e.id === entity.id);
                return (
                  <button
                    key={entity.id}
                    className={`constraint-entity-chip ${isSelected ? 'selected' : ''}`}
                    style={{ '--chip-color': cfg.color }}
                    onClick={() => toggleConstraint(entity)}
                  >
                    <span className="chip-icon">{cfg.icon}</span>
                    <span>{entity.name}</span>
                    {isSelected && <span className="chip-check">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedConstraints.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#7070a0', marginTop: '6px' }}>
                AI will generate a {TYPE_CONFIG[targetType]?.label} that fits with:{' '}
                <strong style={{ color: '#9090b0' }}>{selectedConstraints.map((e) => e.name).join(', ')}</strong>
              </div>
            )}
          </div>

          {/* Step 3: Optional creative direction */}
          <div>
            <div className="ai-gen-section-label">
              3. Creative direction
              <span className="hint">· optional — guide the AI's imagination</span>
            </div>
            <textarea
              className="ai-prompt-textarea"
              placeholder={
                targetType === 'CHARACTER'
                  ? 'e.g. "A veteran warrior haunted by a past betrayal, searching for redemption..."'
                  : targetType === 'PLACE'
                  ? 'e.g. "A crumbling fortress that holds the key to an ancient secret..."'
                  : targetType === 'ITEM'
                  ? 'e.g. "A weapon that grows stronger the more its wielder suffers..."'
                  : targetType === 'EVENT'
                  ? 'e.g. "A catastrophic moment that changed the balance of power..."'
                  : 'e.g. "A shadowy organization with noble origins that took a dark turn..."'
              }
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value); setResult(null); setAddedToCanon(false); }}
              rows={3}
            />
          </div>

          {/* Generate button */}
          <button
            className={`ai-generate-btn ${isGenerating ? 'loading' : ''}`}
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {isGenerating ? (
              <>
                <span className="spinner-ring" />
                Generating with canon context…
              </>
            ) : (
              <>✦ Generate {TYPE_CONFIG[targetType]?.label}</>
            )}
          </button>

          {/* Result */}
          {result && !isGenerating && (
            <div className="ai-result-box">
              <div className="ai-result-header">
                <span style={{ fontSize: '1.1rem' }}>{TYPE_CONFIG[result.entityType]?.icon}</span>
                <div className="ai-result-entity-name">{result.name}</div>
                <span
                  className="ai-result-type-badge"
                  style={{
                    backgroundColor: `${TYPE_CONFIG[result.entityType]?.color}22`,
                    color: TYPE_CONFIG[result.entityType]?.color,
                    border: `1px solid ${TYPE_CONFIG[result.entityType]?.color}44`,
                  }}
                >
                  {TYPE_CONFIG[result.entityType]?.label}
                </span>
              </div>

              <div className="ai-result-body">
                <p className="ai-result-description">{result.description}</p>

                {result.traits.length > 0 && (
                  <div className="ai-result-traits">
                    {result.traits.map((trait, i) => (
                      <span key={i} className="ai-result-trait">{trait}</span>
                    ))}
                  </div>
                )}

                {result.relationships.length > 0 && (
                  <div className="ai-result-connections">
                    <div style={{ fontSize: '0.72rem', color: '#6060a0', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
                      Proposed Relationships
                    </div>
                    {result.relationships.map((rel, i) => (
                      <div key={i} className="ai-result-connection">
                        <span className="ai-result-connection-label">{rel.label}</span>
                        <span className="ai-result-connection-arrow">→</span>
                        <span>
                          {TYPE_CONFIG[rel.target.entityType]?.icon} {rel.target.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="ai-result-actions">
                {addedToCanon ? (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', color: '#4CAF50', padding: '8px', fontWeight: 600 }}>
                    ✓ Added to canon!
                  </div>
                ) : (
                  <button className="ai-result-action-btn primary" onClick={handleAddToCanon}>
                    + Add to Canon
                  </button>
                )}
                <button className="ai-result-action-btn secondary" onClick={handleRegenerate}>
                  ↻ Regenerate
                </button>
                <button
                  className="ai-result-action-btn secondary"
                  onClick={() => {
                    const text = `${result.name}\n${result.entityType}\n\n${result.description}\n\nRelationships:\n${result.relationships.map((r) => `${r.label} → ${r.target.name}`).join('\n')}`;
                    navigator.clipboard.writeText(text).catch(() => {});
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
