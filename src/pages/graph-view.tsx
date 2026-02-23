import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GraphVisualization } from '@/components/graph-visualization';
import { UserMenu } from '@/components/user-menu';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function GraphViewPage() {
  const [searchParams] = useSearchParams();
  const entityId = searchParams.get('entityId') || undefined;
  const universeId = searchParams.get('universeId') || undefined;
  const depth = searchParams.get('depth') ? parseInt(searchParams.get('depth')!) : 2;

  const [currentDepth, setCurrentDepth] = useState(depth);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-black">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src="/images/logo.png" alt="CanonKiln" className="h-8 w-auto" />
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-xl font-heading text-ck-gold">Graph View</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Depth control */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Depth:</label>
            <select
              value={currentDepth}
              onChange={(e) => setCurrentDepth(parseInt(e.target.value))}
              className="px-3 py-1 rounded-md bg-card border border-border text-foreground text-sm"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Graph Container */}
      <div className="flex-1">
        <GraphVisualization
          entityId={entityId}
          universeId={universeId}
          depth={currentDepth}
        />
      </div>

      {/* Help text */}
      <div className="px-6 py-3 border-t border-border bg-card/50">
        <p className="text-sm text-muted-foreground text-center">
          Click on nodes to navigate to entities • Drag to pan • Scroll to zoom • Use controls on the right
        </p>
      </div>
    </div>
  );
}
