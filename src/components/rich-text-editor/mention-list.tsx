import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useQuery, gql } from '@apollo/client';
import { EntityMention } from './rich-text-editor';

const SEARCH_ALL_ENTITIES = gql`
  query SearchAllEntities {
    places {
      id
      properties { id, name, type }
    }
    characters {
      id
      properties { id, name, type }
    }
    items {
      id
      properties { id, name, type }
    }
    events {
      id
      properties { id, name, type }
    }
    narratives {
      id
      properties { id, name, type }
    }
  }
`;

interface Entity {
  id: string;
  properties: {
    id: string;
    name: string;
    type?: string;
  };
  _entityType: string;
}

interface MentionListProps {
  query: string;
  command: (item: { id: string; label: string; type: string }) => void;
  currentEntityType: string;
  currentEntityId: string;
  onMentionSelect?: (mention: EntityMention) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  place: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' },
  character: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' },
  item: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30' },
  event: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' },
  narrative: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
};

export const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data, loading } = useQuery(SEARCH_ALL_ENTITIES);

  const getAllEntities = useCallback((): Entity[] => {
    if (!data) return [];

    const entities: Entity[] = [];

    const addEntities = (items: any[], type: string) => {
      if (!items) return;
      items.forEach(item => {
        entities.push({
          ...item,
          _entityType: type
        });
      });
    };

    addEntities(data.places, 'place');
    addEntities(data.characters, 'character');
    addEntities(data.items, 'item');
    addEntities(data.events, 'event');
    addEntities(data.narratives, 'narrative');

    return entities;
  }, [data]);

  const filteredEntities = useCallback(() => {
    const all = getAllEntities();
    const searchQuery = props.query?.toLowerCase() || '';

    return all
      .filter(entity => {
        // Don't show current entity
        if (entity.id === props.currentEntityId) return false;

        const name = entity.properties?.name?.toLowerCase() || '';
        return name.includes(searchQuery);
      })
      .slice(0, 10); // Limit to 10 results
  }, [getAllEntities, props.query, props.currentEntityId]);

  const items = filteredEntities();

  const selectItem = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      props.command({
        id: item.id,
        label: item.properties.name,
        type: item._entityType
      });

      if (props.onMentionSelect) {
        props.onMentionSelect({
          id: item.id,
          name: item.properties.name,
          type: item._entityType
        });
      }
    }
  }, [items, props]);

  const upHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  }, [items.length, selectedIndex]);

  const downHandler = useCallback(() => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  }, [items.length, selectedIndex]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.query]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown' || event.key === 'Tab') {
        event.preventDefault();
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    }
  }), [upHandler, downHandler, enterHandler]);

  if (loading) {
    return (
      <div className="bg-ck-charcoal border border-ck-indigo rounded-lg shadow-lg p-2">
        <div className="text-ck-stone text-sm px-2 py-1">Loading...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-ck-charcoal border border-ck-indigo rounded-lg shadow-lg p-2">
        <div className="text-ck-stone text-sm px-2 py-1">No entities found</div>
      </div>
    );
  }

  return (
    <div className="bg-ck-charcoal border border-ck-indigo rounded-lg shadow-lg p-1 max-h-64 overflow-y-auto">
      {items.map((item, index) => {
        const colors = TYPE_COLORS[item._entityType] || TYPE_COLORS.place;
        const isSelected = index === selectedIndex;

        return (
          <button
            key={item.id}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
              isSelected ? 'bg-ck-indigo' : 'hover:bg-ck-indigo/50'
            }`}
            onClick={() => selectItem(index)}
          >
            <span className={`text-sm ${colors.text}`}>
              {item.properties.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}>
              {item._entityType}
            </span>
          </button>
        );
      })}
    </div>
  );
});

MentionList.displayName = 'MentionList';
