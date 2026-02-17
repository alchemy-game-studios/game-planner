import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const TYPE_CONFIG = {
  PLACE: {
    icon: '🏔️',
    color: '#4CAF50',
    shape: 'diamond',
    label: 'Place',
  },
  CHARACTER: {
    icon: '⚔️',
    color: '#2196F3',
    shape: 'circle',
    label: 'Character',
  },
  ITEM: {
    icon: '✨',
    color: '#FF9800',
    shape: 'hexagon',
    label: 'Item',
  },
  EVENT: {
    icon: '⚡',
    color: '#9C27B0',
    shape: 'rect',
    label: 'Event',
  },
  FACTION: {
    icon: '🛡️',
    color: '#F44336',
    shape: 'shield',
    label: 'Faction',
  },
};

const EntityNode = memo(({ data, selected }) => {
  const config = TYPE_CONFIG[data.entityType] || { icon: '•', color: '#888', label: 'Unknown' };
  const color = config.color;

  return (
    <div
      className="entity-node"
      style={{
        '--node-color': color,
        borderColor: selected ? '#e94560' : `${color}66`,
        boxShadow: selected
          ? `0 0 0 2px #e94560, 0 4px 20px rgba(233,69,96,0.4)`
          : `0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px ${color}33`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="entity-handle"
        style={{ background: color, borderColor: color }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="entity-handle"
        style={{ background: color, borderColor: color }}
      />

      <div className="entity-node-header" style={{ backgroundColor: `${color}22`, borderBottomColor: `${color}44` }}>
        <span className="entity-node-icon">{config.icon}</span>
        <span className="entity-node-type" style={{ color: color }}>{config.label}</span>
      </div>

      <div className="entity-node-body">
        <div className="entity-node-name">{data.label}</div>
        {data.description && (
          <div className="entity-node-desc">{data.description}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="entity-handle"
        style={{ background: color, borderColor: color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="entity-handle"
        style={{ background: color, borderColor: color }}
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';

export default EntityNode;
export { TYPE_CONFIG };
