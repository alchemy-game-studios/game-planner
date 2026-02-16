import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const TYPE_COLORS = {
  PLACE: '#4CAF50',
  CHARACTER: '#2196F3',
  ITEM: '#FF9800',
  EVENT: '#9C27B0',
  FACTION: '#F44336',
};

const LEGEND_ITEMS = [
  { type: 'PLACE', label: 'Places', color: TYPE_COLORS.PLACE },
  { type: 'CHARACTER', label: 'Characters', color: TYPE_COLORS.CHARACTER },
  { type: 'ITEM', label: 'Items', color: TYPE_COLORS.ITEM },
  { type: 'EVENT', label: 'Events', color: TYPE_COLORS.EVENT },
  { type: 'FACTION', label: 'Factions', color: TYPE_COLORS.FACTION },
];

// Sample data - will be replaced with GraphQL data
const sampleEntities = [
  { id: '1', name: 'Ironforge', entityType: 'PLACE', description: 'Mountain stronghold city', x: 100, y: 100 },
  { id: '2', name: 'Elara Brightshield', entityType: 'CHARACTER', description: 'Brave knight from Ironforge', x: 300, y: 150 },
  { id: '3', name: 'Sword of Light', entityType: 'ITEM', description: 'Legendary blade', x: 500, y: 200 },
  { id: '4', name: 'Battle of the Pass', entityType: 'EVENT', description: 'Epic confrontation', x: 300, y: 350 },
  { id: '5', name: 'Silver Legion', entityType: 'FACTION', description: 'Order of knights', x: 100, y: 300 },
];

const sampleConnections = [
  { from: '2', to: '1', label: 'Lives in' },
  { from: '2', to: '3', label: 'Wields' },
  { from: '2', to: '5', label: 'Member of' },
  { from: '4', to: '1', label: 'Took place at' },
  { from: '2', to: '4', label: 'Participated in' },
];

const CanonGraph = ({ onNodeClick, selectedNodeId }) => {
  // Convert sample entities to React Flow nodes
  const initialNodes = useMemo(() => {
    return sampleEntities.map(entity => ({
      id: entity.id,
      type: 'default',
      data: { 
        label: entity.name,
        entity: entity,
      },
      position: { x: entity.x, y: entity.y },
      style: {
        background: TYPE_COLORS[entity.entityType] || '#999',
        color: '#fff',
        border: selectedNodeId === entity.id ? '3px solid #e94560' : 'none',
        borderRadius: '8px',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      },
    }));
  }, [selectedNodeId]);

  // Convert sample connections to React Flow edges
  const initialEdges = useMemo(() => {
    return sampleConnections.map((conn, i) => ({
      id: `e${i}`,
      source: conn.from,
      target: conn.to,
      label: conn.label,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#666', strokeWidth: 2 },
      labelStyle: { fill: '#a0a0b0', fontSize: 11 },
      labelBgStyle: { fill: '#1a1a2e', fillOpacity: 0.9 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#666',
        width: 20,
        height: 20,
      },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClickHandler = useCallback((event, node) => {
    if (onNodeClick && node.data.entity) {
      onNodeClick(node.data.entity);
    }
  }, [onNodeClick]);

  return (
    <div className="canon-graph">
      <div className="graph-legend">
        {LEGEND_ITEMS.map(item => (
          <div key={item.type} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        fitView
        attributionPosition="bottom-left"
        style={{
          background: '#0f0f1a',
        }}
      >
        <Background color="#2a2a4a" gap={16} />
        <Controls 
          style={{
            button: {
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              color: '#e0e0e0',
            }
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            const entityType = node.data?.entity?.entityType;
            return TYPE_COLORS[entityType] || '#999';
          }}
          maskColor="rgba(15, 15, 26, 0.7)"
          style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default CanonGraph;
