import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { X, Plus, Tag as TagIcon, Heart, Sparkles, Cog } from 'lucide-react';
import { EntitySearch } from '@/components/entity-search';
import { AddEntityDialog } from '@/components/add-entity-dialog';
import { getRelateTaggedMutation } from '@/utils/graphql-utils';
import { TagModal, TagData } from '@/components/tags/tag-modal';

interface TagItem {
  id: string;
  name: string;
  type?: string;
}

interface TagPillsProps {
  tags: TagItem[];
  parentId: string;
  parentType: string;
  onUpdate?: () => void;
}

// Tag type icons
const TAG_ICONS: Record<string, React.ElementType> = {
  descriptor: TagIcon,
  feeling: Heart,
  theme: Sparkles,
  mechanic: Cog,
  other: TagIcon,
  default: TagIcon,
};

function getTagIcon(type?: string): React.ElementType {
  return TAG_ICONS[type || ''] || TAG_ICONS.default;
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  descriptor: {
    bg: 'bg-blue-900/50',
    text: 'text-blue-200',
    border: 'border-blue-700',
  },
  feeling: {
    bg: 'bg-purple-900/50',
    text: 'text-purple-200',
    border: 'border-purple-700',
  },
  default: {
    bg: 'bg-gray-700/50',
    text: 'text-gray-200',
    border: 'border-gray-600',
  },
};

function getTagColors(type?: string) {
  return TAG_COLORS[type || ''] || TAG_COLORS.default;
}

// Normalize tags from various formats to flat structure
function normalizeTags(tags: any[]): TagItem[] {
  return tags.map(tag => ({
    id: tag.id || tag.properties?.id,
    name: tag.name || tag.properties?.name,
    type: tag.type || tag.properties?.type,
  }));
}

export function TagPills({ tags, parentId, parentType, onUpdate }: TagPillsProps) {
  const [localTags, setLocalTags] = useState<TagItem[]>(normalizeTags(tags));
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  // Sync with prop changes (e.g., navigating between entities)
  useEffect(() => {
    setLocalTags(normalizeTags(tags));
  }, [tags]);

  const handleTagClick = (tag: TagItem) => {
    setSelectedTag(tag);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleCreateTag = () => {
    setSelectedTag(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleTagSaved = async (savedTag: TagData) => {
    if (modalMode === 'create') {
      // If creating, add it to the entity's tags
      try {
        const currentIds = localTags.map(t => t.id);
        const newIds = [...currentIds, savedTag.id];

        await updateRelation({
          variables: {
            relation: {
              id: parentId,
              tagIds: newIds,
            },
          },
        });

        setLocalTags([...localTags, {
          id: savedTag.id,
          name: savedTag.name,
          type: savedTag.type
        }]);
        onUpdate?.();
      } catch (error) {
        console.error('Error adding new tag:', error);
      }
    } else {
      // If editing, update the tag in local state
      setLocalTags(prev => prev.map(t =>
        t.id === savedTag.id ? { ...t, name: savedTag.name, type: savedTag.type } : t
      ));
    }
  };

  const handleTagDeleted = (tagId: string) => {
    // Remove from local tags
    setLocalTags(prev => prev.filter(t => t.id !== tagId));
    onUpdate?.();
  };

  const mutation = getRelateTaggedMutation();
  const [updateRelation] = useMutation(mutation);

  const handleAddTag = async (entity: any) => {
    try {
      // Entity can come with properties wrapper from EntitySearch or flat from AddEntityDialog
      const tagId = entity.id || entity.properties?.id;
      const tagName = entity.name || entity.properties?.name;
      const tagType = entity.type || entity.properties?.type;

      const currentIds = localTags.map(t => t.id);
      const newIds = [...currentIds, tagId];

      await updateRelation({
        variables: {
          relation: {
            id: parentId,
            tagIds: newIds,
          },
        },
      });

      setLocalTags([...localTags, { id: tagId, name: tagName, type: tagType }]);
      setIsAdding(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const newIds = localTags.filter(t => t.id !== tagId).map(t => t.id);

      await updateRelation({
        variables: {
          relation: {
            id: parentId,
            tagIds: newIds,
          },
        },
      });

      setLocalTags(localTags.filter(t => t.id !== tagId));
      onUpdate?.();
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const existingIds = localTags.map(t => t.id);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        {localTags.map((tag) => {
          const colors = getTagColors(tag.type);
          const IconComponent = getTagIcon(tag.type);
          return (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border} group cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => handleTagClick(tag)}
            >
              <IconComponent className="h-3 w-3" />
              {tag.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tag.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-white"
                aria-label={`Remove ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Tag
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-300">Add a tag</h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <EntitySearch
            entityType="tag"
            onSelect={handleAddTag}
            excludeIds={existingIds}
            placeholder="Search tags..."
          />

          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Or create a new tag</p>
            <button
              onClick={() => {
                setIsAdding(false);
                handleCreateTag();
              }}
              className="w-full py-2 px-3 bg-ck-indigo/30 hover:bg-ck-indigo/50 rounded text-sm text-ck-bone transition-colors"
            >
              <Plus className="h-4 w-4 inline-block mr-1" />
              Create New Tag
            </button>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      <TagModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tag={selectedTag}
        mode={modalMode}
        onSave={handleTagSaved}
        onDelete={handleTagDeleted}
      />
    </div>
  );
}
