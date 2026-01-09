import { useQuery, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getEntityImage, getPlaceholderImage } from '@/media/util';

const TAGGED_ENTITIES = gql`
  query TaggedEntities($tagId: String!, $limit: Int, $offset: Int) {
    taggedEntities(tagId: $tagId, limit: $limit, offset: $offset) {
      entities {
        id
        _nodeType
        properties {
          id
          name
          description
          type
        }
      }
      total
      hasMore
    }
  }
`;

interface TaggedEntityListProps {
  tagId: string;
  onEntityClick?: (entityId: string, entityType: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  universe: 'bg-ck-ember',
  place: 'bg-ck-teal',
  character: 'bg-ck-rare',
  item: 'bg-ck-gold',
  event: 'bg-ck-ember',
  narrative: 'bg-ck-ember',
};

export function TaggedEntityList({ tagId, onEntityClick }: TaggedEntityListProps) {
  const navigate = useNavigate();
  const { data, loading, error, fetchMore } = useQuery(TAGGED_ENTITIES, {
    variables: { tagId, limit: 10, offset: 0 },
    skip: !tagId,
  });

  const handleEntityClick = (entityId: string, entityType: string) => {
    if (onEntityClick) {
      onEntityClick(entityId, entityType);
    } else {
      navigate(`/edit/${entityType}/${entityId}`);
    }
  };

  const handleLoadMore = () => {
    if (!data?.taggedEntities?.hasMore) return;

    fetchMore({
      variables: {
        offset: data.taggedEntities.entities.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          taggedEntities: {
            ...fetchMoreResult.taggedEntities,
            entities: [
              ...prev.taggedEntities.entities,
              ...fetchMoreResult.taggedEntities.entities,
            ],
          },
        };
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-ck-stone text-sm">Loading entities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-4">
        Error loading entities: {error.message}
      </div>
    );
  }

  const entities = data?.taggedEntities?.entities || [];
  const total = data?.taggedEntities?.total || 0;
  const hasMore = data?.taggedEntities?.hasMore || false;

  if (entities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-ck-stone text-sm">No entities have this tag yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-ck-stone mb-3">
        {total} {total === 1 ? 'entity' : 'entities'} with this tag
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {entities.map((entity: any) => {
          const entityType = entity._nodeType || 'unknown';
          const badgeColor = TYPE_COLORS[entityType] || 'bg-gray-600';
          const placeholderUrl = getPlaceholderImage('avatar');

          return (
            <button
              key={entity.id}
              onClick={() => handleEntityClick(entity.id, entityType)}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-ck-charcoal/50 hover:bg-ck-indigo/30 transition-colors text-left"
            >
              <img
                src={getEntityImage(entity.id, 'avatar')}
                alt={entity.properties.name}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0 bg-ck-forge"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="font-medium text-ck-bone truncate">
                  {entity.properties.name}
                </div>
                {entity.properties.description && (
                  <div className="text-xs text-ck-stone truncate">
                    {entity.properties.description.substring(0, 60)}
                    {entity.properties.description.length > 60 ? '...' : ''}
                  </div>
                )}
              </div>

              <Badge className={`${badgeColor} text-white text-xs`}>
                {entityType}
              </Badge>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            className="w-full"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
