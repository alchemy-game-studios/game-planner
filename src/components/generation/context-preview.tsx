import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, MapPin, Users, Tag, Eye, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface GenerationEntity {
  id: string;
  name: string;
  description?: string;
  type?: string;
  _nodeType: string;
}

interface TagInfo {
  id: string;
  name: string;
  description?: string;
}

interface ContextSummary {
  entityCount: number;
  tagCount: number;
  hasInvolvements: boolean;
}

interface ContextPreviewProps {
  sourceEntity: GenerationEntity & { tags?: TagInfo[] };
  parentChain: GenerationEntity[];
  universe?: GenerationEntity | null;
  siblingEntities: GenerationEntity[];
  selectedContext: GenerationEntity[];
  activeTags: TagInfo[];
  summary: ContextSummary;
  className?: string;
}

/**
 * Preview of what context will be sent to the AI for generation.
 * Helps users understand what the AI "sees" when generating.
 */
export function ContextPreview({
  sourceEntity,
  parentChain,
  universe,
  siblingEntities,
  selectedContext,
  activeTags,
  summary,
  className,
}: ContextPreviewProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-medium">Context Preview</span>
        <span className="text-xs text-ck-stone">
          (What the AI will see)
        </span>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          <Layers className="h-3 w-3 mr-1" />
          {summary.entityCount} entities
        </Badge>
        <Badge variant="outline" className="text-xs">
          <Tag className="h-3 w-3 mr-1" />
          {summary.tagCount} tags
        </Badge>
        {summary.hasInvolvements && (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Has relationships
          </Badge>
        )}
      </div>

      <Separator />

      {/* Hierarchy breadcrumb */}
      {parentChain.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-ck-stone uppercase tracking-wide">
            Location in World
          </span>
          <div className="flex items-center gap-1 text-sm flex-wrap">
            {parentChain.map((entity, idx) => (
              <span key={entity.id} className="flex items-center gap-1">
                {idx > 0 && (
                  <span className="text-ck-stone mx-1">›</span>
                )}
                <span
                  className={cn(
                    entity.id === sourceEntity.id
                      ? 'text-purple-400 font-medium'
                      : 'text-ck-bone'
                  )}
                >
                  {entity.name}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source entity */}
      <EntityCard
        entity={sourceEntity}
        label="Source Entity"
        highlight
        showDescription
      />

      {/* Source entity tags */}
      {sourceEntity.tags && sourceEntity.tags.length > 0 && (
        <div className="pl-4 border-l-2 border-purple-500/30">
          <span className="text-xs text-ck-stone">Source Tags:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {sourceEntity.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sibling entities (collapsible) */}
      {siblingEntities.length > 0 && (
        <CollapsibleSection
          title={`Siblings (${siblingEntities.length})`}
          icon={<MapPin className="h-3 w-3" />}
          defaultOpen={siblingEntities.length <= 3}
        >
          <div className="space-y-1">
            {siblingEntities.slice(0, 5).map((entity) => (
              <EntityCard key={entity.id} entity={entity} compact />
            ))}
            {siblingEntities.length > 5 && (
              <span className="text-xs text-ck-stone">
                +{siblingEntities.length - 5} more
              </span>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Selected additional context */}
      {selectedContext.length > 0 && (
        <CollapsibleSection
          title={`Additional Context (${selectedContext.length})`}
          icon={<Users className="h-3 w-3" />}
          defaultOpen
        >
          <div className="space-y-1">
            {selectedContext.map((entity) => (
              <EntityCard key={entity.id} entity={entity} compact />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Active tags */}
      {activeTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-ck-stone uppercase tracking-wide">
            Style Constraints
          </span>
          <div className="flex flex-wrap gap-1">
            {activeTags.map((tag) => (
              <Badge
                key={tag.id}
                className="bg-purple-600/20 text-purple-300 text-xs"
              >
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface EntityCardProps {
  entity: GenerationEntity;
  label?: string;
  highlight?: boolean;
  compact?: boolean;
  showDescription?: boolean;
}

function EntityCard({
  entity,
  label,
  highlight,
  compact,
  showDescription,
}: EntityCardProps) {
  const nodeTypeLabel = entity._nodeType
    ? entity._nodeType.charAt(0).toUpperCase() + entity._nodeType.slice(1)
    : 'Entity';

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm py-0.5">
        <Badge variant="outline" className="text-[10px] px-1.5">
          {nodeTypeLabel}
        </Badge>
        <span className="text-ck-bone">{entity.name}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-2 rounded-md',
        highlight
          ? 'bg-purple-500/10 border border-purple-500/30'
          : 'bg-zinc-900/50'
      )}
    >
      {label && (
        <span className="text-xs text-ck-stone uppercase tracking-wide">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2 mt-1">
        <Badge variant="outline" className="text-xs">
          {nodeTypeLabel}
        </Badge>
        <span
          className={cn(
            'font-medium',
            highlight ? 'text-purple-300' : 'text-ck-bone'
          )}
        >
          {entity.name}
        </span>
      </div>
      {showDescription && entity.description && (
        <p className="text-xs text-ck-stone mt-1 line-clamp-2">
          {entity.description}
        </p>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-ck-stone hover:text-ck-bone transition-colors w-full">
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            open && 'transform rotate-180'
          )}
        />
        {icon}
        <span>{title}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 pl-5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
