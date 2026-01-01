import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EntitySearch } from '@/components/entity-search';
import { AddEntityDialog } from '@/components/add-entity-dialog';
import { LensDefinition } from '@/lib/lens-config';
import { getEntityImage, getPlaceholderImage } from '@/media/util';
import { X, Plus, Search } from 'lucide-react';

interface Entity {
  id: string;
  properties?: {
    id: string;
    name: string;
    description?: string;
    type?: string;
  };
  // Some entities have flat structure
  name?: string;
  description?: string;
  _nodeType?: string;
}

interface ConnectionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lens: LensDefinition;
  entities: Entity[];
  parentId: string;
  parentType: string;
  onAddEntity: (entity: any) => void;
  onRemoveEntity?: (entityId: string) => void;
}

// Strip HTML tags for plain text display
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function normalizeEntity(entity: Entity): { id: string; name: string; description: string; type: string } {
  const rawDescription = entity.properties?.description || entity.description || '';
  return {
    id: entity.id || entity.properties?.id || '',
    name: entity.properties?.name || entity.name || 'Unnamed',
    description: stripHtml(rawDescription),
    type: entity._nodeType || entity.properties?.type || ''
  };
}

export function ConnectionPreviewModal({
  isOpen,
  onClose,
  lens,
  entities,
  parentId,
  parentType,
  onAddEntity,
  onRemoveEntity
}: ConnectionPreviewModalProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);

  const filteredEntities = entities.filter(entity => {
    const { name, description } = normalizeEntity(entity);
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || description.toLowerCase().includes(term);
  });

  const handleEntityClick = (entity: Entity) => {
    const { id } = normalizeEntity(entity);
    const entityType = entity._nodeType || lens.singularLabel;
    navigate(`/edit/${entityType}/${id}`);
    onClose();
  };

  const handleAddExisting = (entity: any) => {
    onAddEntity(entity);
    setShowAddExisting(false);
  };

  const handleCreateNew = (entity: any) => {
    onAddEntity(entity);
    setShowCreateNew(false);
  };

  const existingIds = entities.map(e => normalizeEntity(e).id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{lens.label}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${lens.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddExisting(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCreateNew(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {showAddExisting && (
          <div className="mb-4 p-3 bg-card rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Add existing {lens.singularLabel}</span>
              <Button variant="ghost" size="sm" onClick={() => setShowAddExisting(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <EntitySearch
              entityType={lens.singularLabel as any}
              onSelect={handleAddExisting}
              excludeIds={existingIds}
              placeholder={`Search ${lens.label.toLowerCase()}...`}
            />
          </div>
        )}

        {showCreateNew && (
          <div className="mb-4">
            <AddEntityDialog
              entityType={lens.singularLabel}
              onEntityCreated={handleCreateNew}
              triggerButton={null}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredEntities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {entities.length === 0
                ? `No ${lens.label.toLowerCase()} yet`
                : 'No matches found'}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredEntities.map((entity) => {
                const { id, name, description } = normalizeEntity(entity);
                const placeholderUrl = getPlaceholderImage('hero');

                return (
                  <div
                    key={id}
                    className={`
                      group relative flex gap-3 p-3 rounded-lg cursor-pointer
                      transition-colors hover:bg-card border ${lens.color.border}
                      ${lens.color.bg}
                    `}
                    onClick={() => handleEntityClick(entity)}
                  >
                    <img
                      src={getEntityImage(id, 'hero')}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderUrl;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate ${lens.color.text}`}>
                        {name}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {description || 'No description'}
                      </p>
                    </div>
                    {onRemoveEntity && (
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveEntity(id);
                        }}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
