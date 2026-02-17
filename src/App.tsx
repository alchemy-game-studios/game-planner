import { useState } from "react";
import CanonGraph from './components/CanonGraph';
import EntityPanel from './components/EntityPanel';
import EntityDetail from './components/EntityDetail';
import AIGenerationPanel from './components/AIGenerationPanel';
import './App.css';

const App = () => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const handleAddToCanon = (generatedEntity) => {
    // TODO: wire to GraphQL mutation — for now just close and show confirmation
    console.log('Adding to canon:', generatedEntity);
    // Could setSelectedEntity(generatedEntity) to show the new entity in detail
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
            onEntitySelect={(entity) => setSelectedEntity(entity)}
            selectedEntityId={selectedEntity?.id}
          />
        </aside>

        <main className="main-content">
          <CanonGraph
            onNodeClick={(node) => setSelectedEntity(node)}
            selectedNodeId={selectedEntity?.id}
          />

          {selectedEntity && (
            <EntityDetail
              entity={selectedEntity}
              onClose={() => setSelectedEntity(null)}
            />
          )}
        </main>
      </div>

      {showAIPanel && (
        <AIGenerationPanel
          onClose={() => setShowAIPanel(false)}
          onAddToCanon={(entity) => {
            handleAddToCanon(entity);
            setShowAIPanel(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
