import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import EntityCard from "@/client-graphql/edit-entity/entity-card.tsx"
import EditDrawer from "@/client-graphql/edit-entity/edit-drawer.tsx"
import { EntitySearch } from "@/components/entity-search"
import { AddEntityDialog } from "@/components/add-entity-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import { getEntityImage } from "@/media/util"
import { X, Plus } from "lucide-react"
import { getRelateContainsMutation, getRelateTaggedMutation } from '@/utils/graphql-utils';

interface EditableNodeListProps {
  initContents: any[];
  parentId: string;
  parentType: string;
  entityType: 'place' | 'character' | 'tag';
  isTagRelation?: boolean;
  onUpdate?: () => void;
}

export function EditableNodeList({ 
  initContents, 
  parentId,
  parentType, 
  entityType,
  isTagRelation = false,
  onUpdate
}: EditableNodeListProps) {
  const [contents, setContents] = useState(initContents);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [drawerKey, setDrawerKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const mutation = isTagRelation ? getRelateTaggedMutation() : getRelateContainsMutation();
  const [updateRelation] = useMutation(mutation);

  useEffect(() => {
    setContents(initContents);
  }, [initContents]);

  const handleOpen = (content: any) => {
    setSelectedContent(content);
    setEditMode(false);
    setDrawerOpen(true);
  };

  const handleEditMode = () => {
    setSelectedContent(null);
    setEditMode(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditMode(false);
    setDrawerKey(prev => prev + 1);
  };

  const handleClick = (id: string, type: string) => {
    navigate(`/edit/${type}/${id}`);
  };

  const handleAddEntity = async (entity: any) => {
    console.log('handleAddEntity called with:', entity);
    console.log('Current contents:', contents);
    console.log('Parent ID:', parentId);
    console.log('Is tag relation:', isTagRelation);
    
    try {
      const currentIds = contents.map(c => c.id || c.properties?.id);
      const newIds = [...currentIds, entity.id];
      
      console.log('Current IDs:', currentIds);
      console.log('New IDs after adding:', newIds);
      
      const variables = isTagRelation ? {
        relation: {
          id: parentId,
          tagIds: newIds
        }
      } : {
        relation: {
          id: parentId,
          childIds: newIds
        }
      };

      console.log('Relation mutation variables:', variables);
      const result = await updateRelation({ variables });
      console.log('Relation mutation result:', result);
      
      // Update local state
      setContents([...contents, entity]);
      console.log('Updated local contents');
      
      // Close the drawer
      setDrawerOpen(false);
      
      if (onUpdate) {
        console.log('Calling onUpdate');
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding entity:', error);
      alert(`Error adding ${entityType}: ${error.message}`);
    }
  };

  const handleRemoveEntity = async (entityId: string) => {
    try {
      const newIds = contents
        .filter(c => (c.id || c.properties?.id) !== entityId)
        .map(c => c.id || c.properties?.id);
      
      const variables = isTagRelation ? {
        relation: {
          id: parentId,
          tagIds: newIds
        }
      } : {
        relation: {
          id: parentId,
          childIds: newIds
        }
      };

      await updateRelation({ variables });
      
      // Update local state
      setContents(contents.filter(c => (c.id || c.properties?.id) !== entityId));
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing entity:', error);
    }
  };

  const existingIds = contents.map(c => c.id || c.properties?.id);
  
  // For tags, the structure is simpler (no properties wrapper)
  const normalizedContents = isTagRelation ? 
    contents.map(c => c.properties ? c : { properties: c }) :
    contents;

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">
          {entityType.charAt(0).toUpperCase() + entityType.slice(1)}s
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditMode}
          className="text-gray-400 hover:text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      <ol className="-mr-3 space-y-1">
        {normalizedContents.map((content) => {
          const contentId = content.properties?.id || content.id;
          const contentData = content.properties || content;
          
          return (
            <li key={contentId} className="relative group">
              <div 
                className="cursor-pointer"
                onClick={() => handleOpen(content)}
              >
                <EntityCard
                  name={contentData.name}
                  avatarUrl={getEntityImage(contentId, "avatar")}
                  fallbackText="CN"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEntity(contentId);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded p-1 hover:bg-gray-700"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ol>

      {(selectedContent || editMode) && (
        <EditDrawer
          key={drawerKey}
          label={editMode ? `Add ${entityType}s` : `${parentType} -> ${selectedContent?.properties?.name || selectedContent?.name}`}
          open={drawerOpen}
          setOpen={setDrawerOpen}
          onForceClose={closeDrawer}
        >
          {editMode ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Search existing {entityType}s</h3>
                <EntitySearch
                  entityType={entityType}
                  onSelect={handleAddEntity}
                  excludeIds={existingIds}
                  placeholder={`Search ${entityType}s to add...`}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Or create a new one</h3>
                <AddEntityDialog
                  entityType={entityType}
                  onEntityCreated={handleAddEntity}
                  triggerButton={false}
                />
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {selectedContent?.properties?.contents?.map((child: any) => (
                <EntityCard
                  key={child.properties.id}
                  name={child.properties.name}
                  avatarUrl={getEntityImage(child.properties.id, "avatar")}
                  fallbackText="CN"
                  onClick={() => {
                    handleClick(child.properties.id, child._nodeType);
                    setDrawerOpen(false);
                  }}
                />
              ))}
            </ul>
          )}
        </EditDrawer>
      )}
    </>
  );
}