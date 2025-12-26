import React, { useState, useRef, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { GripVertical, Trash2, Upload, Loader2 } from 'lucide-react';

interface Image {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  rank: number;
}

interface ImageEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Image[];
  entityId: string;
  entityType: string;
  entityName: string;
  onClose: () => void;
}

const REORDER_IMAGES = gql`
  mutation ReorderImages($entityId: String!, $imageIds: [String!]!) {
    reorderImages(entityId: $entityId, imageIds: $imageIds) {
      id
      filename
      url
      rank
    }
  }
`;

const REMOVE_IMAGE = gql`
  mutation RemoveImage($imageId: String!) {
    removeImage(imageId: $imageId) {
      message
    }
  }
`;

interface SortableImageProps {
  image: Image;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, onDelete, isDeleting }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg mb-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <img
        src={image.url}
        alt={image.filename}
        className="w-16 h-16 object-cover rounded"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 truncate">{image.filename}</p>
        <p className="text-xs text-gray-500">Rank: {image.rank}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(image.id)}
        disabled={isDeleting}
        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export const ImageEditorDrawer: React.FC<ImageEditorDrawerProps> = ({
  open,
  onOpenChange,
  images: initialImages,
  entityId,
  entityType,
  entityName,
  onClose,
}) => {
  const [images, setImages] = useState<Image[]>(() =>
    [...initialImages].sort((a, b) => a.rank - b.rank)
  );
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reorderImages] = useMutation(REORDER_IMAGES);
  const [removeImage] = useMutation(REMOVE_IMAGE);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local images when props change
  React.useEffect(() => {
    setImages([...initialImages].sort((a, b) => a.rank - b.rank));
  }, [initialImages]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newOrder = arrayMove(images, oldIndex, newIndex);
      setImages(newOrder);

      // Save new order to server
      try {
        await reorderImages({
          variables: {
            entityId,
            imageIds: newOrder.map((img) => img.id),
          },
        });
      } catch (error) {
        console.error('Error reordering images:', error);
        // Revert on error
        setImages([...initialImages].sort((a, b) => a.rank - b.rank));
      }
    }
  }, [images, entityId, reorderImages, initialImages]);

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setDeletingId(imageId);
    try {
      await removeImage({ variables: { imageId } });
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`/api/upload/${entityType}/${entityId}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const newImage = await response.json();
        setImages((prev) => [...prev, newImage]);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onClose();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-gray-900">
        <SheetHeader>
          <SheetTitle className="text-white">{entityName} Images</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </>
              )}
            </Button>
          </div>

          {/* Drag and drop list */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              Drag to reorder. First image is primary.
            </p>

            {images.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No images yet. Upload some!
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((img) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {images.map((image) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      onDelete={handleDelete}
                      isDeleting={deletingId === image.id}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
