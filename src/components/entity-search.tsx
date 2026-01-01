import React, { useState, useRef, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Input } from './ui/input';
import { Button } from './ui/button';
import EntityCard from '../client-graphql/edit-entity/entity-card';
import { capitalizeFirst } from '../client-graphql/util';

interface EntitySearchProps {
  entityType: 'place' | 'character' | 'item' | 'tag' | 'event' | 'narrative';
  onSelect: (entity: any) => void;
  excludeIds?: string[];
  universeId?: string;
  placeholder?: string;
}

// Query for searching within a universe
const SEARCH_IN_UNIVERSE = gql`
  query SearchEntitiesInUniverse($query: String!, $type: String, $universeId: String) {
    searchEntities(query: $query, type: $type, universeId: $universeId) {
      id
      properties {
        id
        name
        description
        type
      }
    }
  }
`;

const SEARCH_QUERIES: Record<string, any> = {
  place: gql`
    query SearchPlaces {
      places {
        id
        properties {
          id
          name
          description
          type
        }
      }
    }
  `,
  character: gql`
    query SearchCharacters {
      characters {
        id
        properties {
          id
          name
          description
          type
        }
      }
    }
  `,
  item: gql`
    query SearchItems {
      items {
        id
        properties {
          id
          name
          description
          type
        }
      }
    }
  `,
  tag: gql`
    query SearchTags {
      tags {
        id
        properties {
          id
          name
          description
          type
        }
      }
    }
  `,
  event: gql`
    query SearchEvents {
      events {
        id
        properties {
          id
          name
          description
          type
          startDate
          endDate
        }
      }
    }
  `,
  narrative: gql`
    query SearchNarratives {
      narratives {
        id
        properties {
          id
          name
          description
          type
        }
      }
    }
  `
};

export const EntitySearch: React.FC<EntitySearchProps> = ({
  entityType,
  onSelect,
  excludeIds = [],
  universeId,
  placeholder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use universe-filtered search if universeId is provided
  const { data: universeData, loading: universeLoading } = useQuery(SEARCH_IN_UNIVERSE, {
    variables: {
      query: searchTerm || '',
      type: entityType,
      universeId
    },
    skip: !universeId || !searchTerm
  });

  // Fallback to fetching all entities of type (when no universe or no search term)
  const { data: allData, loading: allLoading } = useQuery(SEARCH_QUERIES[entityType], {
    skip: !!universeId && !!searchTerm
  });

  const loading = universeId && searchTerm ? universeLoading : allLoading;
  const data = universeId && searchTerm ? universeData : allData;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Extract entities from the appropriate query result
  const entities = universeId && searchTerm
    ? (data?.searchEntities || [])
    : (data?.[`${entityType}s`] || []);
  
  const filteredEntities = entities.filter((entity: any) => {
    const name = entity.properties?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const notExcluded = !excludeIds.includes(entity.id);
    return matchesSearch && notExcluded;
  });
  
  const handleSelect = (entity: any) => {
    onSelect(entity);
    setSearchTerm('');
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        type="text"
        placeholder={placeholder || `Search ${entityType}s...`}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full"
      />
      
      {isOpen && (searchTerm || filteredEntities.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-400">Loading...</div>
          ) : filteredEntities.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-400">
              No {entityType}s found
            </div>
          ) : (
            <div className="py-1">
              {filteredEntities.map((entity: any) => (
                <div
                  key={entity.id}
                  className="px-2 py-1 hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleSelect(entity)}
                >
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm text-gray-200">{entity.properties?.name}</span>
                    {entity.properties?.type && (
                      <span className="text-xs text-gray-500">({entity.properties.type})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};