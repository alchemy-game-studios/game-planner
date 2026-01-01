import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { LensDefinition, getLensData } from '@/lib/lens-config';
import { ConnectionSignal } from './connection-signal';
import { ConnectionPreviewModal } from './connection-preview-modal';
import { EntitySearch } from '@/components/entity-search';
import { AddEntityDialog } from '@/components/add-entity-dialog';
import { getEntityImage, getPlaceholderImage } from '@/media/util';
import { ChevronDown, ChevronUp, Plus, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RELATE_CONTAINS = gql`
  mutation RelateContains($relation: RelatableInput!) {
    relateContains(relation: $relation) {
      message
    }
  }
`;

interface Entity {
  id: string;
  properties?: {
    id: string;
    name: string;
    description?: string;
    type?: string;
  };
  name?: string;
  description?: string;
  _nodeType?: string;
}

interface LensSectionProps {
  lens: LensDefinition;
  entity: any;
  parentId: string;
  parentType: string;
  maxPreview?: number;
  onRefetch: () => void;
}

function normalizeEntity(entity: Entity): { id: string; name: string; description: string } {
  return {
    id: entity.id || entity.properties?.id || '',
    name: entity.properties?.name || entity.name || 'Unnamed',
    description: entity.properties?.description || entity.description || ''
  };
}

export function LensSection({
  lens,
  entity,
  parentId,
  parentType,
  maxPreview = 5,
  onRefetch
}: LensSectionProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddSearch, setShowAddSearch] = useState(false);

  const [relateContains] = useMutation(RELATE_CONTAINS);

  const entities = getLensData(entity, lens);
  const count = entities.length;
  const previewEntities = entities.slice(0, maxPreview);
  const hasMore = count > maxPreview;

  const handleAddEntity = async (newEntity: any) => {
    const entityId = newEntity.id || newEntity.properties?.id;

    try {
      await relateContains({
        variables: {
          relation: {
            id: parentId,
            childIds: [entityId]
          }
        }
      });
      onRefetch();
      setShowAddSearch(false);
    } catch (error) {
      console.error('Failed to add entity:', error);
    }
  };

  const handleEntityClick = (e: Entity) => {
    const { id } = normalizeEntity(e);
    const entityType = e._nodeType || lens.singularLabel;
    navigate(`/edit/${entityType}/${id}`);
  };

  // If no entities, show add button only
  if (count === 0) {
    return (
      <div className="py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{lens.label}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowModal(true)}
              title={`View all ${lens.label.toLowerCase()}`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowAddSearch(!showAddSearch)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {showAddSearch && (
          <div className="mt-2 flex gap-2">
            <div className="flex-1">
              <EntitySearch
                entityType={lens.singularLabel as any}
                onSelect={handleAddEntity}
                excludeIds={[parentId]}
                placeholder={`Add ${lens.singularLabel}...`}
              />
            </div>
            <AddEntityDialog
              entityType={lens.singularLabel}
              onEntityCreated={handleAddEntity}
            />
          </div>
        )}
        {/* Full modal */}
        <ConnectionPreviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          lens={lens}
          entities={entities}
          parentId={parentId}
          parentType={parentType}
          onAddEntity={handleAddEntity}
        />
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Signal row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <ConnectionSignal lens={lens} count={count} onClick={() => {}} />
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowModal(true)}
            title={`View all ${lens.label.toLowerCase()}`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowAddSearch(!showAddSearch)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Add search */}
      {showAddSearch && (
        <div className="mt-2 flex gap-2">
          <div className="flex-1">
            <EntitySearch
              entityType={lens.singularLabel as any}
              onSelect={handleAddEntity}
              excludeIds={entities.map((e: Entity) => normalizeEntity(e).id).concat(parentId)}
              placeholder={`Add ${lens.singularLabel}...`}
            />
          </div>
          <AddEntityDialog
            entityType={lens.singularLabel}
            onEntityCreated={handleAddEntity}
          />
        </div>
      )}

      {/* Expanded preview list */}
      {isExpanded && (
        <div className="mt-2 space-y-1">
          {previewEntities.map((e: Entity) => {
            const { id, name } = normalizeEntity(e);
            const placeholderUrl = getPlaceholderImage('hero');

            return (
              <div
                key={id}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
                  transition-colors hover:bg-card/50
                `}
                onClick={() => handleEntityClick(e)}
              >
                <img
                  src={getEntityImage(id, 'hero')}
                  alt={name}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderUrl;
                  }}
                />
                <span className={`text-sm truncate ${lens.color.text}`}>
                  {name}
                </span>
              </div>
            );
          })}
          {hasMore && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-1"
            >
              View all {count} {lens.label.toLowerCase()}...
            </button>
          )}
        </div>
      )}

      {/* Full modal */}
      <ConnectionPreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        lens={lens}
        entities={entities}
        parentId={parentId}
        parentType={parentType}
        onAddEntity={handleAddEntity}
      />
    </div>
  );
}
