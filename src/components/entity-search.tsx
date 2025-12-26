import React, { useState, useRef, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Input } from './ui/input';
import { Button } from './ui/button';
import EntityCard from '../client-graphql/edit-entity/entity-card';
import { capitalizeFirst } from '../client-graphql/util';

interface EntitySearchProps {
  entityType: 'place' | 'character' | 'tag';
  onSelect: (entity: any) => void;
  excludeIds?: string[];
  placeholder?: string;
}

const SEARCH_QUERIES = {
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
  `
};

export const EntitySearch: React.FC<EntitySearchProps> = ({ 
  entityType, 
  onSelect, 
  excludeIds = [],
  placeholder 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data, loading } = useQuery(SEARCH_QUERIES[entityType]);
  
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
  
  const entities = data?.[`${entityType}s`] || [];
  
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
                  <EntityCard
                    entity={entity.properties}
                    entityType={entityType}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};