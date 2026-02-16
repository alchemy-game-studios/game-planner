import { useState } from "react";
import CanonGraph from './components/CanonGraph';
import EntityPanel from './components/EntityPanel';
import EntityDetail from './components/EntityDetail';
import './App.css';

const App = () => {
  const [selectedEntity, setSelectedEntity] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔥 CanonKiln</h1>
        <span className="app-subtitle">Graph-First Creative IP Management</span>
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
    </div>
  );
};

export default App;
