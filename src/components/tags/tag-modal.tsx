import { useState, useEffect, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tag, Heart, Sparkles, Cog, Trash2, Edit2, Save } from 'lucide-react';
import { TagForm, TagFormData } from './tag-form';
import { TaggedEntityList } from './tagged-entity-list';

// Mutations
const ADD_TAG = gql`
  mutation AddTag($tag: TagInput!) {
    addTag(tag: $tag) {
      message
    }
  }
`;

const EDIT_TAG = gql`
  mutation EditTag($tag: TagInput!) {
    editTag(tag: $tag) {
      message
    }
  }
`;

const REMOVE_TAG = gql`
  mutation RemoveTag($tag: TagInput!) {
    removeTag(tag: $tag) {
      message
    }
  }
`;

export interface TagData {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

interface TagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: TagData | null;
  mode: 'view' | 'edit' | 'create';
  onSave?: (tag: TagData) => void;
  onDelete?: (tagId: string) => void;
  onClose?: () => void;
}

// Tag type icons
const TAG_ICONS: Record<string, React.ElementType> = {
  descriptor: Tag,
  feeling: Heart,
  theme: Sparkles,
  mechanic: Cog,
  other: Tag,
  default: Tag,
};

// Tag type colors
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
  theme: {
    bg: 'bg-amber-900/50',
    text: 'text-amber-200',
    border: 'border-amber-700',
  },
  mechanic: {
    bg: 'bg-green-900/50',
    text: 'text-green-200',
    border: 'border-green-700',
  },
  other: {
    bg: 'bg-gray-700/50',
    text: 'text-gray-200',
    border: 'border-gray-600',
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

function getTagIcon(type?: string) {
  return TAG_ICONS[type || ''] || TAG_ICONS.default;
}

export function TagModal({
  open,
  onOpenChange,
  tag,
  mode: initialMode,
  onSave,
  onDelete,
  onClose,
}: TagModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState<TagFormData>({
    name: tag?.name || '',
    description: tag?.description || '',
    type: tag?.type || 'other',
  });
  const [isSaving, setIsSaving] = useState(false);

  const [addTag] = useMutation(ADD_TAG);
  const [editTag] = useMutation(EDIT_TAG);
  const [removeTag] = useMutation(REMOVE_TAG);

  // Reset form when tag changes
  useEffect(() => {
    setFormData({
      name: tag?.name || '',
      description: tag?.description || '',
      type: tag?.type || 'other',
    });
    setMode(initialMode);
  }, [tag, initialMode]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  const handleFormChange = (data: TagFormData) => {
    setFormData(data);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const tagId = tag?.id || uuidv4();
      const tagInput = {
        id: tagId,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        type: formData.type || 'other',
      };

      if (mode === 'create') {
        await addTag({ variables: { tag: tagInput } });
      } else {
        await editTag({ variables: { tag: tagInput } });
      }

      onSave?.({
        id: tagId,
        name: tagInput.name,
        description: tagInput.description,
        type: tagInput.type,
      });

      if (mode === 'create') {
        handleClose();
      } else {
        setMode('view');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tag?.id) return;

    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      await removeTag({ variables: { tag: { id: tag.id } } });
      onDelete?.(tag.id);
      handleClose();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleEntityClick = () => {
    handleClose();
  };

  const colors = getTagColors(formData.type || tag?.type);
  const IconComponent = getTagIcon(formData.type || tag?.type);
  const isEditing = mode === 'edit' || mode === 'create';
  const title = mode === 'create' ? 'Create Tag' : (formData.name || tag?.name || 'Tag');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Tag icon placeholder */}
            <div className={`w-16 h-16 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 ${colors.text}`} />
            </div>

            <div className="flex-1">
              <DialogTitle className="font-heading text-2xl">
                {isEditing ? (mode === 'create' ? 'Create Tag' : 'Edit Tag') : title}
              </DialogTitle>
              {!isEditing && tag?.type && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                  {tag.type}
                </span>
              )}
            </div>

            {mode === 'view' && tag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('edit')}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isEditing ? (
            <TagForm
              initialData={formData}
              onChange={handleFormChange}
              disabled={isSaving}
            />
          ) : (
            <>
              {/* Description */}
              {tag?.description ? (
                <p className="text-ck-bone mb-4">{tag.description}</p>
              ) : (
                <p className="text-ck-stone italic mb-4">No description</p>
              )}

              <Separator className="my-4" />

              {/* Tagged entities */}
              {tag?.id && (
                <TaggedEntityList
                  tagId={tag.id}
                  onEntityClick={handleEntityClick}
                />
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mode === 'edit' && tag && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (mode === 'create') {
                      handleClose();
                    } else {
                      setMode('view');
                      setFormData({
                        name: tag?.name || '',
                        description: tag?.description || '',
                        type: tag?.type || 'other',
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim()}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
            {mode === 'view' && (
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
