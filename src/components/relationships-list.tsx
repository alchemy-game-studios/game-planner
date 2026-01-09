import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  MapPin,
  User,
  Package,
  Calendar,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Link2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRelationshipLabel } from '@/lib/relationship-config';
import { GenerationDrawer } from '@/components/generation/generation-drawer';
import { AddRelationshipDialog } from '@/components/add-relationship-dialog';

const ENTITY_ICONS: Record<string, React.ElementType> = {
  universe: Globe,
  place: MapPin,
  character: User,
  item: Package,
  event: Calendar,
  narrative: BookOpen,
};

const ENTITY_COLORS: Record<string, string> = {
  universe: 'text-purple-400',
  place: 'text-ck-teal',
  character: 'text-ck-rare',
  item: 'text-ck-gold',
  event: 'text-ck-ember',
  narrative: 'text-ck-ember',
};

interface EntityRelationship {
  id: string;
  relationshipType: string;
  customLabel?: string;
  direction: 'outgoing' | 'incoming';
  targetEntity: {
    id: string;
    name: string;
    description?: string;
    type?: string;
  };
  targetType: string;
}

interface RelationshipsListProps {
  relationships: EntityRelationship[];
  entityId: string;
  entityType: string;
  entityName?: string;
  universeId?: string;
  onRefetch: () => void;
}

export function RelationshipsList({
  relationships,
  entityId,
  entityType,
  entityName,
  universeId,
  onRefetch,
}: RelationshipsListProps) {
  const [showGenerationDrawer, setShowGenerationDrawer] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Group by direction
  const outgoing = relationships?.filter(r => r.direction === 'outgoing') || [];
  const incoming = relationships?.filter(r => r.direction === 'incoming') || [];
  const count = (relationships?.length || 0);

  return (
    <div className="space-y-3">
      {/* Header with action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Relationships
          </h3>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {universeId && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setShowGenerationDrawer(true)}
              title="Generate related entity"
            >
              <Sparkles className="h-3.5 w-3.5 text-ck-gold" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setShowAddDialog(true)}
            title="Add relationship"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Relationship items */}
      {count === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No relationships yet. Use + to link entities.
        </p>
      ) : (
        <div className="space-y-2">
          {outgoing.map((rel) => (
            <RelationshipItem
              key={`out-${rel.targetEntity.id}-${rel.relationshipType}`}
              relationship={rel}
            />
          ))}
          {incoming.map((rel) => (
            <RelationshipItem
              key={`in-${rel.targetEntity.id}-${rel.relationshipType}`}
              relationship={rel}
            />
          ))}
        </div>
      )}

      {/* Generation Drawer */}
      <GenerationDrawer
        open={showGenerationDrawer}
        onOpenChange={setShowGenerationDrawer}
        sourceEntity={{
          id: entityId,
          name: entityName || 'Entity',
          _nodeType: entityType,
        }}
        universeId={universeId || ''}
        onGenerated={() => {
          setShowGenerationDrawer(false);
          onRefetch();
        }}
      />

      {/* Add Relationship Dialog */}
      <AddRelationshipDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        entityId={entityId}
        entityType={entityType}
        universeId={universeId}
        onAdded={() => {
          setShowAddDialog(false);
          onRefetch();
        }}
      />
    </div>
  );
}

function RelationshipItem({
  relationship,
}: {
  relationship: EntityRelationship;
}) {
  const EntityIcon = ENTITY_ICONS[relationship.targetType] || User;
  const entityColor = ENTITY_COLORS[relationship.targetType] || 'text-muted-foreground';

  const isOutgoing = relationship.direction === 'outgoing';

  // Format the relationship label with correct direction
  const label = relationship.customLabel ||
    getRelationshipLabel(
      relationship.relationshipType,
      relationship.targetType,
      undefined,
      isOutgoing ? 'outgoing' : 'incoming'
    );

  return (
    <Link
      to={`/edit/${relationship.targetType}/${relationship.targetEntity.id}`}
      className="block p-2 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-purple-500/30 transition-colors group"
    >
      {/* Row 1: Direction + relationship label + entity type */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {isOutgoing ? (
          <ArrowRight className="h-3 w-3 text-purple-400 shrink-0" />
        ) : (
          <ArrowLeft className="h-3 w-3 text-blue-400 shrink-0" />
        )}
        <span>{label}</span>
        <span className="text-muted-foreground/60 capitalize">• {relationship.targetType}</span>
      </div>

      {/* Row 2: Entity icon + name */}
      <div className="flex items-center gap-2 pl-4">
        <EntityIcon className={`h-4 w-4 ${entityColor} shrink-0`} />
        <span className="text-sm group-hover:text-purple-300 transition-colors">
          {relationship.targetEntity.name}
        </span>
      </div>
    </Link>
  );
}
