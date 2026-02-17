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

const CanonGraphInner = ({ projectId = 'default', onNodeClick, selectedNodeId }) => {
  const [activeTypes, setActiveTypes] = useState(new Set(['PLACE', 'CHARACTER', 'ITEM', 'EVENT', 'FACTION']));
  const [showLabels, setShowLabels] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [connectMode, setConnectMode] = useState(false);

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
    const layouted = autoLayout(graphData.nodes);
    return layouted
      .filter((n) => activeTypes.has(n.entityType))
      .map((node) => ({
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
  }, [graphData, selectedNodeId, activeTypes, showLabels]);

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
          </Panel>

          {/* Bottom toolbar */}
          <Panel position="bottom-center">
            <div style={{ display: 'flex', gap: 6, background: '#12122a', border: '1px solid #2a2a4a', borderRadius: 8, padding: '6px 12px', alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: '#6a6a8a' }}>{entityCount} entities · {relCount} relationships</span>
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
