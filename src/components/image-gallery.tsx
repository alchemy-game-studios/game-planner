import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageEditorDrawer } from './image-editor-drawer';

interface Image {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  rank: number;
}

interface ImageGalleryProps {
  images: Image[];
  entityId: string;
  entityType: string;
  onUpdate?: () => void;
  fallbackImage?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  entityId,
  entityType,
  onUpdate,
  fallbackImage
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);

  // Sort images by rank
  const sortedImages = [...images].sort((a, b) => a.rank - b.rank);

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

  // Reset rotation when images change
  useEffect(() => {
    setRotationOffset(0);
  }, [images.length]);

  const handleEditorClose = () => {
    setEditorOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  if (images.length === 0) {
    return (
      <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-[2/1]">
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt="Entity"
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No images
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditorOpen(true)}
          className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800"
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
          onClose={handleEditorClose}
        />
      </div>
    );
  }

  // Single image layout
  if (images.length === 1) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={primaryImage.url}
          alt={primaryImage.filename}
          className="w-full aspect-[2/1] object-cover"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditorOpen(true)}
          className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
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

  // Two images layout
  if (images.length === 2) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="flex gap-1 aspect-[2/1]">
          <div
            className="w-[61.8%] cursor-pointer"
            onClick={() => rotateToImage(0)}
          >
            <img
              src={primaryImage.url}
              alt={primaryImage.filename}
              className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
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
          className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800 z-10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
          onClose={handleEditorClose}
        />
      </div>
    );
  }

  // Three images layout
  if (images.length === 3) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="flex gap-1 aspect-[2/1]">
          <div
            className="w-[61.8%] cursor-pointer"
            onClick={() => rotateToImage(0)}
          >
            <img
              src={primaryImage.url}
              alt={primaryImage.filename}
              className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
            />
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
          className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800 z-10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <ImageEditorDrawer
          open={editorOpen}
          onOpenChange={setEditorOpen}
          images={images}
          entityId={entityId}
          entityType={entityType}
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
          className="w-[61.8%] cursor-pointer"
          onClick={() => rotateToImage(0)}
        >
          <img
            src={primaryImage.url}
            alt={primaryImage.filename}
            className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
          />
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
        className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800 z-10"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <ImageEditorDrawer
        open={editorOpen}
        onOpenChange={setEditorOpen}
        images={images}
        entityId={entityId}
        entityType={entityType}
        onClose={handleEditorClose}
      />
    </div>
  );
};
