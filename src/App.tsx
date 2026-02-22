import { useState, useEffect } from "react";
import { useQuery } from '@apollo/client';
import CanonGraph from './components/CanonGraph';
import EntityPanel from './components/EntityPanel';
import EntityDetail from './components/EntityDetail';
import AIGenerationPanel from './components/AIGenerationPanel';
import StatsPanel from './components/StatsPanel';
import { GET_CANON_GRAPH } from './client-graphql/canon-operations';
import { exportCanonAsJSON, exportAsMarkdown } from './utils/export';
import './App.css';

// Default project ID — will be driven by auth in future sprint
const DEFAULT_PROJECT_ID = 'default';

// Mock project list — replace with GraphQL query when multi-project support is added
const MOCK_PROJECTS = [
  { id: 'default', name: 'My Canon' },
  { id: 'demo', name: 'Demo World' },
];

const App = () => {
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);

  // Fetch graph data for export/stats
  const { data: graphData } = useQuery(GET_CANON_GRAPH, {
    variables: { projectId },
    skip: !showExportMenu && !showStatsPanel, // Only fetch when needed
  });

  const handleAddToCanon = (generatedEntity: any) => {
    // Entity is already persisted by acceptGeneratedEntity mutation
    // Select it to show in detail panel
    if (generatedEntity) {
      setSelectedEntity(generatedEntity);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Cmd/Ctrl + G: Toggle AI Generation panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        setShowAIPanel(prev => !prev);
      }

      // Escape: Close panels/dropdowns
      if (e.key === 'Escape') {
        if (showStatsPanel) {
          setShowStatsPanel(false);
        } else if (showExportMenu) {
          setShowExportMenu(false);
        } else if (showProjectSelector) {
          setShowProjectSelector(false);
        } else if (showAIPanel) {
          setShowAIPanel(false);
        } else if (selectedEntity) {
          setSelectedEntity(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAIPanel, selectedEntity, showProjectSelector, showExportMenu, showStatsPanel]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (showProjectSelector && !target.closest('.project-selector-container')) {
        setShowProjectSelector(false);
      }
      
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    if (showProjectSelector || showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProjectSelector, showExportMenu]);

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1>🔥 CanonKiln</h1>
          <span className="app-subtitle">Graph-First Creative IP Management</span>
          
          {/* Project Selector */}
          <div className="project-selector-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                borderRadius: 6,
                color: '#a0a0b0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              📁 {MOCK_PROJECTS.find(p => p.id === projectId)?.name || projectId}
              <span style={{ fontSize: 10 }}>▼</span>
            </button>
            
            {showProjectSelector && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: 6,
                  padding: 4,
                  minWidth: 160,
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {MOCK_PROJECTS.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setProjectId(project.id);
                      setShowProjectSelector(false);
                      setSelectedEntity(null); // Clear selection when switching projects
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12,
                      background: projectId === project.id ? '#2a2a4a' : 'transparent',
                      border: 'none',
                      borderRadius: 4,
                      color: projectId === project.id ? '#fff' : '#a0a0b0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'block',
                    }}
                  >
                    {project.name}
                    {projectId === project.id && <span style={{ float: 'right' }}>✓</span>}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #2a2a4a', margin: '4px 0' }} />
                <button
                  onClick={() => {
                    alert('Project management coming soon!');
                    setShowProjectSelector(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    color: '#6a6a8a',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  + New Project
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            style={{
              display: 'none',
              padding: '6px 12px',
              fontSize: 14,
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: 6,
              color: '#a0a0b0',
              cursor: 'pointer',
            }}
            title="Toggle entity panel"
          >
            ☰
          </button>

          <button
            className="header-ai-btn"
            onClick={() => setShowAIPanel(true)}
            title="Generate new canon entities with AI, constrained by your existing world (Cmd/Ctrl+G)"
          >
            ✦ Generate with AI
          </button>

          {/* Stats Button */}
          <button
            onClick={() => setShowStatsPanel(true)}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: 6,
              color: '#a0a0b0',
              cursor: 'pointer',
            }}
            title="View canon statistics"
          >
            📊 Stats
          </button>

          {/* Export Menu */}
          <div className="export-menu-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                background: '#1a1a2e',
                border: '1px solid #2a2a4a',
                borderRadius: 6,
                color: '#a0a0b0',
                cursor: 'pointer',
              }}
              title="Export your canon"
            >
              💾 Export
            </button>
            
            {showExportMenu && graphData?.canonGraph && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: 6,
                  padding: 4,
                  minWidth: 180,
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <button
                  onClick={() => {
                    exportCanonAsJSON(graphData.canonGraph, MOCK_PROJECTS.find(p => p.id === projectId)?.name);
                    setShowExportMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  📄 Export as JSON
                </button>
                <button
                  onClick={() => {
                    exportAsMarkdown(graphData.canonGraph, MOCK_PROJECTS.find(p => p.id === projectId)?.name);
                    setShowExportMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 12,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    color: '#a0a0b0',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  📝 Export as Markdown
                </button>
              </div>
            )}
          </div>

          <div 
            className="keyboard-hint"
            style={{ 
              fontSize: 11, 
              color: '#6a6a8a', 
              padding: '4px 8px', 
              background: '#12122a',
              borderRadius: 4,
              border: '1px solid #2a2a4a'
            }}
            title="Keyboard shortcuts: Cmd/Ctrl+G = AI Generation, Esc = Close panels"
          >
            ⌘G
          </div>
        </div>
      </header>

      <div className="app-layout">
        {/* Mobile sidebar backdrop */}
        {mobileSidebarOpen && (
          <div
            className="mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 999,
              display: 'none',
            }}
          />
        )}

        <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          <EntityPanel
            projectId={projectId}
            onEntitySelect={(entity: any) => {
              setSelectedEntity(entity);
              setMobileSidebarOpen(false); // Close sidebar on mobile when entity selected
            }}
            selectedEntityId={selectedEntity?.id}
          />
        </aside>

        <main className="main-content">
          <CanonGraph
            projectId={projectId}
            onNodeClick={(node: any) => setSelectedEntity(node)}
            selectedNodeId={selectedEntity?.id}
          />

          {selectedEntity && (
            <EntityDetail
              entity={selectedEntity}
              projectId={projectId}
              onClose={() => setSelectedEntity(null)}
            />
          )}
        </main>
      </div>

      {showAIPanel && (
        <AIGenerationPanel
          projectId={projectId}
          onClose={() => setShowAIPanel(false)}
          onAddToCanon={(entity: any) => {
            handleAddToCanon(entity);
            setShowAIPanel(false);
          }}
        />
      )}

      {showStatsPanel && graphData?.canonGraph && (
        <>
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
            onClick={() => setShowStatsPanel(false)}
          />
          <StatsPanel
            graphData={graphData.canonGraph}
            onClose={() => setShowStatsPanel(false)}
          />
        </>
      )}
    </div>
  );
};

export default App;
