/**
 * Export utilities for CanonKiln
 * Handles exporting canon data as JSON/CSV
 */

/**
 * Export graph data as JSON file
 */
export const exportCanonAsJSON = (graphData, projectName = 'canon') => {
  const data = {
    exportedAt: new Date().toISOString(),
    projectName,
    entityCount: graphData.entityCount,
    relationshipCount: graphData.relationshipCount,
    nodes: graphData.nodes,
    edges: graphData.edges,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export entities as CSV
 */
export const exportEntitiesAsCSV = (entities) => {
  if (!entities || entities.length === 0) {
    alert('No entities to export');
    return;
  }

  // CSV header
  const headers = ['Type', 'Name', 'Description', 'ID'];
  const rows = entities.map(e => [
    e.entityType || '',
    e.name || '',
    (e.description || '').replace(/"/g, '""'), // Escape quotes
    e.id || ''
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `entities-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export as markdown documentation
 */
export const exportAsMarkdown = (graphData, projectName = 'My Canon') => {
  const { nodes = [], edges = [] } = graphData;
  
  // Group by type
  const byType = {};
  nodes.forEach(node => {
    const type = node.entityType || 'OTHER';
    if (!byType[type]) byType[type] = [];
    byType[type].push(node);
  });

  let md = `# ${projectName}\n\n`;
  md += `> Exported ${new Date().toLocaleString()}\n\n`;
  md += `**Stats:** ${nodes.length} entities, ${edges.length} relationships\n\n`;
  md += `---\n\n`;

  // Document each type
  Object.entries(byType).forEach(([type, entities]) => {
    md += `## ${type}S\n\n`;
    entities.forEach(entity => {
      md += `### ${entity.name}\n\n`;
      md += `${entity.description || '_No description_'}\n\n`;
      
      // Find relationships
      const rels = edges.filter(e => e.source === entity.id || e.target === entity.id);
      if (rels.length > 0) {
        md += `**Connections:**\n`;
        rels.forEach(rel => {
          const isOutbound = rel.source === entity.id;
          const other = nodes.find(n => n.id === (isOutbound ? rel.target : rel.source));
          if (other) {
            md += `- ${rel.label || 'relates to'} **${other.name}**\n`;
          }
        });
        md += `\n`;
      }
    });
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
