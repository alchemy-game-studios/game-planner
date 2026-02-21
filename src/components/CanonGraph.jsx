import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  addEdge,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import EntityNode, { TYPE_CONFIG } from './EntityNode';
import { GET_CANON_GRAPH, CREATE_RELATIONSHIP } from '../client-graphql/canon-operations';

const nodeTypes = { entity: EntityNode };

// Auto-layout: arrange nodes by type in columns if no x/y stored
const autoLayout = (nodes) => {
  const typed = {};
  nodes.forEach((n) => {
    if (!typed[n.entityType]) typed[n.entityType] = [];
    typed[n.entityType].push(n);
  });

  const types = Object.keys(typed);
  return nodes.map((node) => {
    if (node.x != null && node.y != null) return node;
    const typeIdx = types.indexOf(node.entityType);
    const typeNodes = typed[node.entityType];
    const nodeIdx = typeNodes.indexOf(node);
    const radius = Math.max(80, typeNodes.length * 30);
    const angle = (nodeIdx / Math.max(typeNodes.length, 1)) * Math.PI;
    return {
      ...node,
      x: 150 + typeIdx * 280 + radius * Math.cos(angle) * 0.5,
      y: 250 + radius * Math.sin(angle),
    };
  });
};

// Force-directed layout: simple physics-based positioning
const forceLayout = (nodes) => {
  const positioned = nodes.map((node) => ({
    ...node,
    x: node.x ?? Math.random() * 800,
    y: node.y ?? Math.random() * 600,
  }));

  // Simple force simulation (3 iterations for initial positioning)
  for (let iter = 0; iter < 3; iter++) {
    positioned.forEach((node, i) => {
      let fx = 0, fy = 0;
      
      // Repulsion from other nodes
      positioned.forEach((other, j) => {
        if (i === j) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = 5000 / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      });

      // Center gravity
      fx += (400 - node.x) * 0.01;
      fy += (300 - node.y) * 0.01;

      node.x += fx * 0.1;
      node.y += fy * 0.1;
    });
  }

  return positioned;
};

// Radial layout: arrange by type in circular sectors
const radialLayout = (nodes) => {
  const typed = {};
  nodes.forEach((n) => {
    if (!typed[n.entityType]) typed[n.entityType] = [];
    typed[n.entityType].push(n);
  });

  const types = Object.keys(typed);
  const centerX = 400, centerY = 300;

  return nodes.map((node) => {
    const typeIdx = types.indexOf(node.entityType);
    const typeNodes = typed[node.entityType];
    const nodeIdx = typeNodes.indexOf(node);
    
    const sectorAngle = (2 * Math.PI) / types.length;
    const sectorStart = typeIdx * sectorAngle;
    const nodeAngle = sectorStart + (nodeIdx / Math.max(typeNodes.length, 1)) * sectorAngle * 0.8;
    
    const radius = 150 + typeIdx * 40;
    
    return {
      ...node,
      x: centerX + radius * Math.cos(nodeAngle),
      y: centerY + radius * Math.sin(nodeAngle),
    };
  });
};

const CanonGraphInner = ({ projectId = 'default', onNodeClick, selectedNodeId }) => {
  const [activeTypes, setActiveTypes] = useState(new Set(['PLACE', 'CHARACTER', 'ITEM', 'EVENT', 'FACTION']));
  const [showLabels, setShowLabels] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [connectMode, setConnectMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('auto'); // 'auto', 'force', 'radial'
  const [showStats, setShowStats] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_CANON_GRAPH, {
    variables: { projectId },
    pollInterval: 30000,
  });

  const [createRelationship] = useMutation(CREATE_RELATIONSHIP, {
    onCompleted: () => refetch(),
  });

  const graphData = data?.canonGraph;

  // Convert API nodes to React Flow nodes
  const initialNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    
    // Apply layout algorithm
    let layouted;
    if (layoutMode === 'force') {
      layouted = forceLayout(graphData.nodes);
    } else if (layoutMode === 'radial') {
      layouted = radialLayout(graphData.nodes);
    } else {
      layouted = autoLayout(graphData.nodes);
    }
    
    // Filter by active types
    let filtered = layouted.filter((n) => activeTypes.has(n.entityType));
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => 
        n.name.toLowerCase().includes(query) ||
        (n.description && n.description.toLowerCase().includes(query))
      );
    }
    
    return filtered.map((node) => ({
      id: node.id,
      type: 'entity',
      data: {
        label: node.name,
        entity: node,
        entityType: node.entityType,
        description: showLabels ? node.description : undefined,
      },
      position: { x: node.x, y: node.y },
      selected: selectedNodeId === node.id,
    }));
  }, [graphData, selectedNodeId, activeTypes, showLabels, searchQuery, layoutMode]);

  // Convert API edges
  const initialEdges = useMemo(() => {
    if (!graphData?.edges) return [];
    // Only show edges where both endpoints are visible
    const visibleIds = new Set(initialNodes.map((n) => n.id));
    return graphData.edges
      .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#444466', strokeWidth: 1.5 },
        labelStyle: { fill: '#8888aa', fontSize: 10 },
        labelBgStyle: { fill: '#0f0f1a', fillOpacity: 0.85 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#444466',
          width: 16,
          height: 16,
        },
      }));
  }, [graphData, initialNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => { setNodes(initialNodes); }, [initialNodes]);
  React.useEffect(() => { setEdges(initialEdges); }, [initialEdges]);

  const onConnect = useCallback(async (params) => {
    if (!connectMode) return;
    const label = prompt('Relationship label (e.g. "Lives in", "Wields"):');
    if (!label) return;

    const fromNode = graphData.nodes.find((n) => n.id === params.source);
    const toNode = graphData.nodes.find((n) => n.id === params.target);
    if (!fromNode || !toNode) return;

    setEdges((eds) => addEdge({ ...params, label, type: 'smoothstep' }, eds));
    await createRelationship({
      variables: {
        input: {
          projectId,
          fromId: params.source,
          toId: params.target,
          fromType: fromNode.entityType,
          toType: toNode.entityType,
          label,
        },
      },
    });
  }, [connectMode, graphData, projectId, createRelationship]);

  const onNodeClickHandler = useCallback((event, node) => {
    if (onNodeClick && node.data.entity) {
      onNodeClick(node.data.entity);
    }
  }, [onNodeClick]);

  const toggleType = (type) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) { next.delete(type); } else { next.add(type); }
      return next;
    });
  };

  if (loading && !data) {
    return (
      <div className="canon-graph" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6a6a8a', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8, animation: 'spin 1s linear infinite' }}>⟳</div>
          <div>Loading canon graph…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="canon-graph" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#e94560', textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>⚠ Graph unavailable</div>
          <div style={{ fontSize: 12, color: '#6a6a8a' }}>
            {error.message.includes('ECONNREFUSED') || error.message.includes('refused')
              ? 'Neo4j offline — start the database and refresh'
              : error.message}
          </div>
          <button onClick={() => refetch()} style={{ marginTop: 12, padding: '6px 16px', background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#a0a0b0', borderRadius: 4, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const entityCount = graphData?.entityCount || 0;
  const relCount = graphData?.relationshipCount || 0;

  return (
    <div className="canon-graph">
      {entityCount === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4a4a6a', gap: 8 }}>
          <div style={{ fontSize: 48 }}>🔥</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#6a6a8a' }}>Your canon is empty</div>
          <div style={{ fontSize: 14, color: '#4a4a6a' }}>Create your first entity in the panel →</div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{ background: '#0a0a18' }}
          connectionMode={connectMode ? 'loose' : 'strict'}
        >
          <Background color="#1a1a30" gap={20} size={1} />
          <Controls style={{ button: { background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#a0a0b0' } }} />
          {showMiniMap && (
            <MiniMap
              nodeColor={(node) => TYPE_CONFIG[node.data?.entityType]?.color || '#999'}
              maskColor="rgba(10, 10, 24, 0.7)"
              style={{ background: '#12122a', border: '1px solid #2a2a4a' }}
            />
          )}

          {/* Top toolbar */}
          <Panel position="top-center">
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'center' }}>
              {/* Search bar */}
              <div style={{ display: 'flex', gap: 6, background: '#12122a', border: '1px solid #2a2a4a', borderRadius: 8, padding: '4px 8px', alignItems: 'center' }}>
                <span style={{ color: '#6a6a8a', fontSize: 12 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#a0a0b0',
                    fontSize: 12,
                    outline: 'none',
                    width: 180,
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6a6a8a',
                      cursor: 'pointer',
                      padding: '0 4px',
                      fontSize: 10,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Type filters */}
              <div style={{ display: 'flex', gap: 6, background: '#12122a', border: '1px solid #2a2a4a', borderRadius: 8, padding: '6px 10px', alignItems: 'center' }}>
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    style={{
                      padding: '3px 10px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                      background: activeTypes.has(type) ? `${cfg.color}22` : 'transparent',
                      color: activeTypes.has(type) ? cfg.color : '#4a4a6a',
                      border: `1px solid ${activeTypes.has(type) ? cfg.color : '#2a2a4a'}`,
                    }}
                    title={`Toggle ${type}`}
                  >
                    {cfg.icon} {type}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {/* Bottom toolbar */}
          <Panel position="bottom-center">
            <div style={{ display: 'flex', gap: 6, background: '#12122a', border: '1px solid #2a2a4a', borderRadius: 8, padding: '6px 12px', alignItems: 'center', fontSize: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setShowStats(v => !v)} style={toolbarBtnStyle(showStats)} title="Show graph statistics">
                📊 Stats
              </button>
              <div style={{ width: 1, height: 14, background: '#2a2a4a' }} />
              
              {/* Layout selector */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setLayoutMode('auto')} style={toolbarBtnStyle(layoutMode === 'auto')} title="Type-clustered layout">
                  🎯 Auto
                </button>
                <button onClick={() => setLayoutMode('force')} style={toolbarBtnStyle(layoutMode === 'force')} title="Force-directed layout">
                  ⚡ Force
                </button>
                <button onClick={() => setLayoutMode('radial')} style={toolbarBtnStyle(layoutMode === 'radial')} title="Radial layout">
                  ☀️ Radial
                </button>
              </div>
              
              <div style={{ width: 1, height: 14, background: '#2a2a4a' }} />
              <button onClick={() => setShowLabels(v => !v)} style={toolbarBtnStyle(showLabels)}>
                {showLabels ? '📝 Labels' : '📝 Labels off'}
              </button>
              <button onClick={() => setShowMiniMap(v => !v)} style={toolbarBtnStyle(showMiniMap)}>
                🗺 Map
              </button>
              <button
                onClick={() => setConnectMode(v => !v)}
                style={toolbarBtnStyle(connectMode, connectMode ? '#e94560' : undefined)}
                title={connectMode ? 'Click: drag between nodes to create relationships' : 'Enable connect mode'}
              >
                {connectMode ? '🔗 Connecting…' : '🔗 Connect'}
              </button>
            </div>
          </Panel>
          
          {/* Stats Panel */}
          {showStats && (
            <Panel position="top-right">
              <div style={{ background: '#12122a', border: '1px solid #2a2a4a', borderRadius: 8, padding: '12px 16px', minWidth: 200, fontSize: 12 }}>
                <div style={{ color: '#a0a0b0', fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #2a2a4a', paddingBottom: 6 }}>
                  📊 Graph Statistics
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#6a6a8a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Entities:</span>
                    <span style={{ color: '#a0a0b0', fontWeight: 600 }}>{entityCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Relationships:</span>
                    <span style={{ color: '#a0a0b0', fontWeight: 600 }}>{relCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Visible:</span>
                    <span style={{ color: '#a0a0b0', fontWeight: 600 }}>{nodes.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Connections:</span>
                    <span style={{ color: '#a0a0b0', fontWeight: 600 }}>{edges.length}</span>
                  </div>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #2a2a4a' }}>
                    {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                      const count = graphData?.nodes?.filter(n => n.entityType === type).length || 0;
                      if (count === 0) return null;
                      return (
                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span>{cfg.icon} {cfg.label}:</span>
                          <span style={{ color: cfg.color, fontWeight: 600 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      )}
    </div>
  );
};

const toolbarBtnStyle = (active, activeColor = '#6a3aff') => ({
  padding: '3px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
  background: active ? `${activeColor}22` : 'transparent',
  color: active ? activeColor : '#6a6a8a',
  border: `1px solid ${active ? activeColor : '#2a2a4a'}`,
});

// Wrap in ReactFlowProvider for useReactFlow hook access
const CanonGraph = (props) => (
  <ReactFlowProvider>
    <CanonGraphInner {...props} />
  </ReactFlowProvider>
);

export default CanonGraph;
