import { useState } from "react";
import CanonGraph from './components/CanonGraph';
import EntityPanel from './components/EntityPanel';
import EntityDetail from './components/EntityDetail';
import AIGenerationPanel from './components/AIGenerationPanel';
import './App.css';

// Default project ID — will be driven by project selector / auth in future sprint
const DEFAULT_PROJECT_ID = 'default';

const App = () => {
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [projectId] = useState(DEFAULT_PROJECT_ID);

  const handleAddToCanon = (generatedEntity: any) => {
    // Entity is already persisted by acceptGeneratedEntity mutation
    // Select it to show in detail panel
    if (generatedEntity) {
      setSelectedEntity(generatedEntity);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔥 CanonKiln</h1>
        <span className="app-subtitle">Graph-First Creative IP Management</span>

        <button
          className="header-ai-btn"
          onClick={() => setShowAIPanel(true)}
          title="Generate new canon entities with AI, constrained by your existing world"
        >
          ✦ Generate with AI
        </button>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <EntityPanel
            projectId={projectId}
            onEntitySelect={(entity: any) => setSelectedEntity(entity)}
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
    </div>
  );
};

export default App;
