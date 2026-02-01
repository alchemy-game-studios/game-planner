import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

const SEARCH_ENTITIES = gql`
  query SearchEntities($query: String!, $universeId: String) {
    searchEntities(query: $query, universeId: $universeId) {
      id
      properties {
        id
        name
        description
        type
      }
      _nodeType
    }
  }
`;

const GET_SUGGESTED_ENTITIES = gql`
  query GetEntitiesInUniverse($universeId: String!, $excludeId: String) {
    entitiesInUniverse(universeId: $universeId, excludeId: $excludeId) {
      id
      properties {
        id
        name
        description
        type
      }
      _nodeType
    }
  }
`;

interface Entity {
  id: string;
  name: string;
  description?: string;
  type?: string;
  _nodeType: string;
}

interface ContextEntitySelectorProps {
  universeId: string;
  excludeIds: string[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection?: number;
  suggestedEntities?: Entity[];
  className?: string;
}

/**
 * Searchable entity picker for selecting additional context entities.
 */
export function ContextEntitySelector({
  universeId,
  excludeIds,
  selected,
  onSelectionChange,
  maxSelection = 10,
  suggestedEntities = [],
  className,
}: ContextEntitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search entities
  const [search, { data: searchData, loading: searchLoading }] =
    useLazyQuery(SEARCH_ENTITIES);

  // Get suggested entities if none provided
  const [fetchSuggested, { data: suggestedData, loading: suggestedLoading }] =
    useLazyQuery(GET_SUGGESTED_ENTITIES);

  // Fetch suggested entities on mount
  useEffect(() => {
    if (suggestedEntities.length === 0 && universeId) {
      fetchSuggested({
        variables: {
          universeId,
          excludeId: excludeIds[0] || '',
        },
      });
    }
  }, [universeId, excludeIds, suggestedEntities.length, fetchSuggested]);

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      search({
        variables: {
          query: debouncedQuery,
          universeId,
        },
      });
    }
  }, [debouncedQuery, universeId, search]);

  // Normalize entity data from different sources
  const normalizeEntity = (e: any): Entity => ({
    id: e.id || e.properties?.id,
    name: e.properties?.name || e.name,
    description: e.properties?.description || e.description,
    type: e.properties?.type || e.type,
    _nodeType: e._nodeType || 'unknown',
  });

  // Get display entities (search results or suggestions)
  const displayEntities: Entity[] = debouncedQuery.length >= 2
    ? (searchData?.searchEntities || []).map(normalizeEntity)
    : suggestedEntities.length > 0
      ? suggestedEntities
      : (suggestedData?.entitiesInUniverse || []).map(normalizeEntity);

  // Filter out excluded and already selected entities
  const filteredEntities = displayEntities.filter(
    (e) => !excludeIds.includes(e.id)
  );

  const toggleEntity = (entityId: string) => {
    if (selected.includes(entityId)) {
      onSelectionChange(selected.filter((id) => id !== entityId));
    } else if (selected.length < maxSelection) {
      onSelectionChange([...selected, entityId]);
    }
  };

  const removeEntity = (entityId: string) => {
    onSelectionChange(selected.filter((id) => id !== entityId));
  };

  const isLoading = searchLoading || suggestedLoading;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entities to add context..."
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected entities */}
      {selected.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-ck-stone">
            Selected ({selected.length}/{maxSelection})
          </span>
          <div className="flex flex-wrap gap-1">
            {selected.map((id) => {
              const entity = displayEntities.find((e) => e.id === id);
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {entity?.name || id}
                  <button
                    onClick={() => removeEntity(id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Entity list */}
      <ScrollArea className="h-[200px] rounded-md border p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {debouncedQuery.length >= 2
              ? 'No matching entities found'
              : 'Type to search or browse suggestions'}
          </div>
        ) : (
          <div className="space-y-1">
            {!debouncedQuery && (
              <span className="text-xs text-ck-stone block mb-2">
                Suggested entities
              </span>
            )}
            {filteredEntities.map((entity) => (
              <EntityRow
                key={entity.id}
                entity={entity}
                checked={selected.includes(entity.id)}
                disabled={
                  !selected.includes(entity.id) && selected.length >= maxSelection
                }
                onToggle={() => toggleEntity(entity.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Selection limit hint */}
      {selected.length >= maxSelection && (
        <p className="text-xs text-amber-400">
          Maximum {maxSelection} entities selected
        </p>
      )}
    </div>
  );
}

interface EntityRowProps {
  entity: Entity;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function EntityRow({ entity, checked, disabled, onToggle }: EntityRowProps) {
  const nodeTypeLabel = entity._nodeType
    ? entity._nodeType.charAt(0).toUpperCase() + entity._nodeType.slice(1)
    : 'Entity';

  return (
    <label
      className={cn(
        'flex items-center gap-2 p-2 rounded-md cursor-pointer',
        'hover:bg-zinc-800 transition-colors',
        checked && 'bg-purple-500/10',
        disabled && !checked && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] shrink-0">
            {nodeTypeLabel}
          </Badge>
          <span className="text-sm text-ck-bone truncate">{entity.name}</span>
        </div>
        {entity.description && (
          <p className="text-xs text-ck-stone truncate mt-0.5">
            {entity.description}
          </p>
        )}
      </div>
    </label>
  );
}
