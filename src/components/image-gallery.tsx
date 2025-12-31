import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageEditorDrawer } from './image-editor-drawer';
import { getPlaceholderImage } from '@/media/util';

interface Image {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  rank: number;
  // Optional entity info for descendant images
  entityId?: string;
  entityName?: string;
  entityType?: string;
}

interface ImageGalleryProps {
  images: Image[];           // Direct images for editing
  allImages?: Image[];       // All images including descendants for display
  entityId: string;
  entityType: string;
  entityName: string;
  onUpdate?: () => void;
  fallbackImage?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  allImages,
  entityId,
  entityType,
  entityName,
  onUpdate,
  fallbackImage
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);

  // Use allImages for display if available, otherwise use direct images
  const displayImages = allImages && allImages.length > 0 ? allImages : images;

  // Sort images by rank
  const sortedImages = [...displayImages].sort((a, b) => a.rank - b.rank);

  // Get rotated array based on offset
  const getRotatedImages = () => {
    if (sortedImages.length === 0) return [];
    const offset = rotationOffset % sortedImages.length;
    return [...sortedImages.slice(offset), ...sortedImages.slice(0, offset)];
  };

  const rotatedImages = getRotatedImages();

  // Golden ratio split from rotated array
  const primaryImage = rotatedImages[0];
  const secondaryImages = rotatedImages.slice(1, 3);
  const tertiaryImage = rotatedImages[3];

  const rotateNext = () => {
    setRotationOffset((prev) => (prev + 1) % sortedImages.length);
  };

  const rotatePrev = () => {
    setRotationOffset((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  // Click on any image to make it primary
  const rotateToImage = (index: number) => {
    // index is relative to rotatedImages, convert to absolute offset
    const newOffset = (rotationOffset + index) % sortedImages.length;
    setRotationOffset(newOffset);
  };

  // Auto-rotate when there are multiple images
  useEffect(() => {
    if (sortedImages.length <= 1) return;
    const timer = setInterval(rotateNext, 5000);
    return () => clearInterval(timer);
  }, [sortedImages.length]);

  // Reset rotation when display images change
  useEffect(() => {
    setRotationOffset(0);
  }, [displayImages.length]);

  const handleEditorClose = () => {
    setEditorOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  if (displayImages.length === 0) {
    const placeholderSrc = getPlaceholderImage('hero');
    return (
      <div className="relative rounded-lg overflow-hidden bg-card aspect-[2/1]">
        <img
          src={fallbackImage || placeholderSrc}
          alt={entityType}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If fallback fails, use placeholder
            (e.target as HTMLImageElement).src = placeholderSrc;
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditorOpen(true)}
          className="absolute top-2 right-2 bg-background/80 hover:bg-card"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Add Images
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          onClose={handleEditorClose}
        />
      </div>
    );
  }

  // Single image layout
  if (displayImages.length === 1) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={primaryImage.url}
          alt={primaryImage.filename}
          className="w-full aspect-[2/1] object-cover"
        />
        <EntityLabel image={primaryImage} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditorOpen(true)}
          className="absolute top-2 right-2 bg-background/80 hover:bg-card"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          onClose={handleEditorClose}
        />
      </div>
    );
  }

  // Navigation arrows component
  const NavigationArrows = () => (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); rotatePrev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all shadow-lg border border-white/20"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); rotateNext(); }}
        className="absolute right-12 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all shadow-lg border border-white/20"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>
    </>
  );

  // Image counter indicator
  const ImageCounter = () => (
    <div className="absolute bottom-2 left-2 bg-black/70 rounded-full px-3 py-1 text-sm text-white border border-white/20">
      {(rotationOffset % sortedImages.length) + 1} / {sortedImages.length}
    </div>
  );

  // Entity label for descendant images
  const EntityLabel = ({ image }: { image: Image }) => {
    // Only show label if image is from a different entity
    if (!image.entityId || image.entityId === entityId) return null;

    return (
      <div className="absolute top-2 left-2 bg-background/80 rounded px-2 py-1 text-xs text-foreground border border-border z-10">
        <span className="text-muted-foreground capitalize">{image.entityType}: </span>
        <span className="font-medium">{image.entityName}</span>
      </div>
    );
  };

  // Two images layout
  if (displayImages.length === 2) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="flex gap-1 aspect-[2/1]">
          <div
            className="w-[61.8%] cursor-pointer relative"
            onClick={() => rotateToImage(0)}
          >
            <img
              src={primaryImage.url}
              alt={primaryImage.filename}
              className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
            <EntityLabel image={primaryImage} />
          </div>
          <div
            className="w-[38.2%] cursor-pointer"
            onClick={() => rotateToImage(1)}
          >
            <img
              src={secondaryImages[0]?.url}
              alt={secondaryImages[0]?.filename}
              className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
          </div>
        </div>
        <NavigationArrows />
        <ImageCounter />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditorOpen(true)}
          className="absolute top-2 right-2 bg-background/80 hover:bg-card z-10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          onClose={handleEditorClose}
        />
      </div>
    );
  }

  // Three images layout
  if (displayImages.length === 3) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="flex gap-1 aspect-[2/1]">
          <div
            className="w-[61.8%] cursor-pointer relative"
            onClick={() => rotateToImage(0)}
          >
            <img
              src={primaryImage.url}
              alt={primaryImage.filename}
              className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
            <EntityLabel image={primaryImage} />
          </div>
          <div className="w-[38.2%] flex flex-col gap-1">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => rotateToImage(1)}
            >
              <img
                src={secondaryImages[0]?.url}
                alt={secondaryImages[0]?.filename}
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
              />
            </div>
            <div
              className="flex-1 cursor-pointer"
              onClick={() => rotateToImage(2)}
            >
              <img
                src={secondaryImages[1]?.url}
                alt={secondaryImages[1]?.filename}
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
        <NavigationArrows />
        <ImageCounter />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditorOpen(true)}
          className="absolute top-2 right-2 bg-background/80 hover:bg-card z-10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          onClose={handleEditorClose}
        />
      </div>
    );
  }

  // Four+ images layout with golden ratio
  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className="flex gap-1 aspect-[2/1]">
        {/* Primary image - 61.8% (golden ratio) */}
        <div
          className="w-[61.8%] cursor-pointer relative"
          onClick={() => rotateToImage(0)}
        >
          <img
            src={primaryImage.url}
            alt={primaryImage.filename}
            className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
          />
          <EntityLabel image={primaryImage} />
        </div>

        {/* Secondary images - 38.2% total */}
        <div className="w-[38.2%] flex flex-col gap-1">
          {/* First secondary */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => rotateToImage(1)}
          >
            <img
              src={secondaryImages[0]?.url}
              alt={secondaryImages[0]?.filename}
              className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
          </div>

          {/* Second secondary */}
          <div className="flex-1 flex gap-1">
            <div
              className="flex-1 cursor-pointer"
              onClick={() => rotateToImage(2)}
            >
              <img
                src={secondaryImages[1]?.url}
                alt={secondaryImages[1]?.filename}
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
              />
            </div>
            {/* Third image (if exists) with +N indicator */}
            {tertiaryImage && (
              <div
                className="flex-1 cursor-pointer relative"
                onClick={() => rotateToImage(3)}
              >
                <img
                  src={tertiaryImage.url}
                  alt={tertiaryImage.filename}
                  className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
                />
                {rotatedImages.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{rotatedImages.length - 4}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <NavigationArrows />
      <ImageCounter />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditorOpen(true)}
        className="absolute top-2 right-2 bg-background/80 hover:bg-card z-10"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <ImageEditorDrawer
        open={editorOpen}
        onOpenChange={setEditorOpen}
        images={images}
        entityId={entityId}
        entityType={entityType}
        entityName={entityName}
        onClose={handleEditorClose}
      />
    </div>
  );
};
