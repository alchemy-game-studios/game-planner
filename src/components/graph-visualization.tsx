import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const GET_GRAPH_DATA = gql`
  query GetGraphData($entityId: String, $universeId: String, $depth: Int) {
    entityGraph(entityId: $entityId, universeId: $universeId, depth: $depth) {
      nodes {
        id
        label
        type
        description
        imageUrl
      }
      edges {
        id
        source
        target
        label
        relationshipType
      }
    }
  }
`;

// Color scheme based on entity type
const getNodeColor = (type: string): string => {
  const colors: Record<string, string> = {
    universe: '#f59e0b', // ck-gold
    place: '#06b6d4', // cyan
    character: '#8b5cf6', // purple
    item: '#eab308', // yellow
    event: '#ec4899', // pink
    narrative: '#6366f1', // indigo
    tag: '#10b981', // green
  };
  return colors[type] || '#6b7280'; // gray as default
};

// Convert graph data to React Flow format
const convertToFlowFormat = (
  graphData: any
): { nodes: Node[]; edges: Edge[] } => {
  if (!graphData) return { nodes: [], edges: [] };

  // Auto-layout using a simple force-directed approach
  const nodes: Node[] = graphData.nodes.map((node: any, index: number) => {
    const angle = (index / graphData.nodes.length) * 2 * Math.PI;
    const radius = Math.max(200, graphData.nodes.length * 30);
    
    return {
      id: node.id,
      type: 'default',
      position: {
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300,
      },
      data: {
        label: (
          <div className="flex flex-col items-center gap-1">
            {node.imageUrl && (
              <img
                src={node.imageUrl}
                alt={node.label}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            )}
            <div className="font-semibold text-sm text-center px-2">
              {node.label}
            </div>
            <div className="text-xs text-gray-500 uppercase">{node.type}</div>
          </div>
        ),
        type: node.type,
        description: node.description,
      },
      style: {
        background: getNodeColor(node.type),
        color: 'white',
        border: '2px solid white',
        borderRadius: '12px',
        padding: '10px',
        minWidth: '120px',
        fontSize: '12px',
      },
    };
  });

  const edges: Edge[] = graphData.edges.map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label.replace(/_/g, ' ').toLowerCase(),
    type: 'smoothstep',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    style: {
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    labelStyle: {
      fill: '#64748b',
      fontSize: 10,
      fontWeight: 500,
    },
  }));

  return { nodes, edges };
};

interface GraphVisualizationProps {
  entityId?: string;
  universeId?: string;
  depth?: number;
}

export function GraphVisualization({
  entityId,
  universeId,
  depth = 2,
}: GraphVisualizationProps) {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_GRAPH_DATA, {
    variables: { entityId, universeId, depth },
    fetchPolicy: 'network-only',
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (data?.entityGraph) {
      const { nodes: flowNodes, edges: flowEdges } = convertToFlowFormat(
        data.entityGraph
      );
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [data, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const type = node.data.type;
      navigate(`/edit/${type}/${node.id}`);
    },
    [navigate]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-destructive">
          Error loading graph: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => getNodeColor(node.data.type)}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
