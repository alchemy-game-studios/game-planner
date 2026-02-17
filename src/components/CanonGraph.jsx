import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import EntityNode, { TYPE_CONFIG } from './EntityNode';

// ---------- Sample data ----------
const sampleEntities = [
  { id: '1', name: 'Ironforge', entityType: 'PLACE', description: 'Mountain stronghold city', x: 120, y: 80 },
  { id: '2', name: 'Elara Brightshield', entityType: 'CHARACTER', description: 'Brave knight from Ironforge', x: 400, y: 60 },
  { id: '3', name: 'Sword of Light', entityType: 'ITEM', description: 'Legendary blade forged in starfire', x: 660, y: 120 },
  { id: '4', name: 'Battle of the Pass', entityType: 'EVENT', description: 'Epic confrontation at Dragonspine', x: 360, y: 300 },
  { id: '5', name: 'Silver Legion', entityType: 'FACTION', description: 'Order of elite knights', x: 100, y: 300 },
  { id: '6', name: 'Shadowfen Marsh', entityType: 'PLACE', description: 'Treacherous wetlands in the south', x: 650, y: 320 },
  { id: '7', name: 'Gareth the Wise', entityType: 'CHARACTER', description: 'Ancient elven mage and royal advisor', x: 160, y: 500 },
  { id: '8', name: 'Crown of Stars', entityType: 'ITEM', description: 'Mystical crown imbued with celestial power', x: 500, y: 500 },
  { id: '9', name: 'Order of Dusk', entityType: 'FACTION', description: 'Shadow cult bent on eternal night', x: 680, y: 500 },
];

const sampleConnections = [
  { id: 'e1', from: '2', to: '1', label: 'Lives in' },
  { id: 'e2', from: '2', to: '3', label: 'Wields' },
  { id: 'e3', from: '2', to: '5', label: 'Member of' },
  { id: 'e4', from: '4', to: '1', label: 'Took place at' },
  { id: 'e5', from: '2', to: '4', label: 'Participated in' },
  { id: 'e6', from: '7', to: '5', label: 'Advisor to' },
  { id: 'e7', from: '8', to: '9', label: 'Sought by' },
  { id: 'e8', from: '9', to: '6', label: 'Based in' },
  { id: 'e9', from: '4', to: '9', label: 'Triggered by' },
];

// ---------- Node types ----------
const nodeTypes = { entityNode: EntityNode };

// ---------- Edge style helper ----------
const makeEdge = (conn) => ({
  id: conn.id || `e-${conn.from}-${conn.to}`,
  source: conn.from,
  target: conn.to,
  label: conn.label,
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#4a4a7a', strokeWidth: 1.5 },
  labelStyle: { fill: '#9090b0', fontSize: 10, fontWeight: 400 },
  labelBgStyle: { fill: '#12122a', fillOpacity: 0.92 },
  labelBgPadding: [4, 6],
  labelBgBorderRadius: 4,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#4a4a7a',
    width: 16,
    height: 16,
  },
});

// ---------- Main graph inner component ----------
const CanonGraphInner = ({ onNodeClick, selectedNodeId }) => {
  const [visibleTypes, setVisibleTypes] = useState(
    Object.fromEntries(Object.keys(TYPE_CONFIG).map((t) => [t, true]))
  );
  const [connectMode, setConnectMode] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [entities, setEntities] = useState(sampleEntities);
  const [connections, setConnections] = useState(sampleConnections);
  const { fitView } = useReactFlow();
  const idCounter = useRef(100);

  // Build nodes from entities, filtered by visibility
  const initialNodes = useMemo(() =>
    entities
      .filter((e) => visibleTypes[e.entityType])
      .map((entity) => ({
        id: entity.id,
        type: 'entityNode',
        data: {
          label: entity.name,
          description: showLabels ? entity.description : '',
          entityType: entity.entityType,
          entity,
        },
        position: { x: entity.x, y: entity.y },
        selected: selectedNodeId === entity.id,
      })),
    [entities, visibleTypes, selectedNodeId, showLabels]
  );

  // Build edges
  const initialEdges = useMemo(() => {
    const visibleIds = new Set(
      entities.filter((e) => visibleTypes[e.entityType]).map((e) => e.id)
    );
    return connections
      .filter((c) => visibleIds.has(c.from) && visibleIds.has(c.to))
      .map(makeEdge);
  }, [connections, entities, visibleTypes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep nodes/edges in sync with filter changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);

  const onConnect = useCallback(
    (params) => {
      if (!connectMode) return;
      const newConn = {
        id: `e-${idCounter.current++}`,
        from: params.source,
        to: params.target,
        label: 'Related to',
      };
      setConnections((prev) => [...prev, newConn]);
    },
    [connectMode]
  );

  const onNodeClickHandler = useCallback(
    (event, node) => {
      if (onNodeClick && node.data.entity) {
        onNodeClick(node.data.entity);
      }
    },
    [onNodeClick]
  );

  const toggleType = (type) => {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const visibleCount = Object.values(visibleTypes).filter(Boolean).length;

  return (
    <div className="canon-graph">
      {/* ---- Filter Toolbar ---- */}
      <div className="graph-toolbar">
        <div className="graph-filter-label">Filter:</div>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const entityCount = entities.filter((e) => e.entityType === type).length;
          return (
            <button
              key={type}
              className={`filter-chip ${visibleTypes[type] ? 'active' : 'muted'}`}
              style={{ '--chip-color': cfg.color }}
              onClick={() => toggleType(type)}
              title={`${visibleTypes[type] ? 'Hide' : 'Show'} ${cfg.label}s`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}s</span>
              <span className="chip-count">{entityCount}</span>
            </button>
          );
        })}

        <div className="graph-toolbar-divider" />

        <button
          className={`toolbar-btn ${connectMode ? 'active' : ''}`}
          onClick={() => setConnectMode((v) => !v)}
          title="Connection mode: drag between nodes to create relationships"
        >
          {connectMode ? '🔗 Connecting…' : '🔗 Connect'}
        </button>

        <button
          className={`toolbar-btn ${showLabels ? 'active' : ''}`}
          onClick={() => setShowLabels((v) => !v)}
          title="Toggle entity descriptions"
        >
          💬 Labels
        </button>

        <button
          className={`toolbar-btn ${showMiniMap ? 'active' : ''}`}
          onClick={() => setShowMiniMap((v) => !v)}
          title="Toggle minimap"
        >
          🗺 Map
        </button>

        <button
          className="toolbar-btn"
          onClick={() => fitView({ padding: 0.1, duration: 400 })}
          title="Fit all visible nodes"
        >
          ⊡ Fit
        </button>
      </div>

      {/* ---- Connect mode banner ---- */}
      {connectMode && (
        <div className="connect-mode-banner">
          ✦ Connection mode active — drag from a node handle to another node to link them
          <button className="connect-exit-btn" onClick={() => setConnectMode(false)}>Exit</button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        snapToGrid={false}
        attributionPosition="bottom-left"
        connectionMode={connectMode ? 'loose' : 'strict'}
        deleteKeyCode="Delete"
        style={{ background: 'transparent' }}
      >
        <Background color="#1a1a3a" gap={24} size={1} style={{ background: '#0c0c1e' }} />
        <Controls
          style={{ bottom: 80, right: 12 }}
          showInteractive={false}
        />
        {showMiniMap && (
          <MiniMap
            nodeColor={(node) => {
              const cfg = TYPE_CONFIG[node.data?.entityType];
              return cfg ? cfg.color : '#888';
            }}
            maskColor="rgba(12,12,30,0.75)"
            style={{
              background: '#12122a',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
            }}
          />
        )}

        {/* Stats panel */}
        <Panel position="bottom-left" className="graph-stats-panel">
          <span>{nodes.length} nodes</span>
          <span>·</span>
          <span>{edges.length} edges</span>
          {visibleCount < Object.keys(TYPE_CONFIG).length && (
            <>
              <span>·</span>
              <span className="stats-filtered">
                {Object.keys(TYPE_CONFIG).length - visibleCount} types hidden
              </span>
            </>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrap in ReactFlowProvider (required for useReactFlow hook)
const CanonGraph = (props) => (
  <ReactFlowProvider>
    <CanonGraphInner {...props} />
  </ReactFlowProvider>
);

export default CanonGraph;
