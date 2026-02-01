import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package2, ExternalLink, Gamepad2, BookOpen, Film, Layers } from 'lucide-react';
import { getEntityImage, getPlaceholderImage } from '@/media/util';

// Query to get product details
const GET_PRODUCT = gql`
  query GetProduct($obj: IdInput!) {
    product(obj: $obj) {
      id
      name
      description
      type
      gameType
      universe {
        id
        name
      }
      adaptations {
        id
        displayName
        flavorText
        role
        appearance
        sourceEntity {
          id
          name
        }
        sourceType
      }
      images {
        id
        url
      }
    }
  }
`;

interface ProductInfo {
  id: string;
  name: string;
  type: string;
  gameType?: string;
}

interface ProductFocusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductInfo | null;
}

// Product type icons
const TYPE_ICONS: Record<string, React.ElementType> = {
  game: Gamepad2,
  book: BookOpen,
  movie: Film,
  comic: BookOpen,
  default: Package2,
};

function getTypeIcon(type: string) {
  return TYPE_ICONS[type] || TYPE_ICONS.default;
}

function getProductTypeLabel(type: string, gameType?: string): string {
  if (type === 'game' && gameType) {
    const gameTypeLabels: Record<string, string> = {
      card: 'Card Game',
      board: 'Board Game',
      ttrpg: 'TTRPG',
      video: 'Video Game',
    };
    return gameTypeLabels[gameType] || gameType;
  }
  const typeLabels: Record<string, string> = {
    game: 'Game',
    book: 'Book',
    movie: 'Movie',
    comic: 'Comic',
  };
  return typeLabels[type] || type;
}

// Strip HTML for plain text
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export function ProductFocusModal({
  open,
  onOpenChange,
  product,
}: ProductFocusModalProps) {
  const navigate = useNavigate();
  const [fetchProduct, { data, loading }] = useLazyQuery(GET_PRODUCT);

  // Fetch product details when modal opens
  useEffect(() => {
    if (open && product?.id) {
      fetchProduct({ variables: { obj: { id: product.id } } });
    }
  }, [open, product?.id, fetchProduct]);

  const productData = data?.product;
  const IconComponent = getTypeIcon(product?.type || 'default');
  const placeholderUrl = getPlaceholderImage('hero');

  const handleViewFull = () => {
    if (product?.id) {
      navigate(`/edit/product/${product.id}`);
      onOpenChange(false);
    }
  };

  const handleEntityClick = (entityType: string, entityId: string) => {
    navigate(`/edit/${entityType}/${entityId}`);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Product icon/image */}
            <div className="w-16 h-16 rounded-lg bg-ck-forge/20 border border-ck-forge/30 flex items-center justify-center overflow-hidden">
              {productData?.images?.[0] ? (
                <img
                  src={productData.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <IconComponent className="w-8 h-8 text-ck-forge" />
              )}
            </div>

            <div className="flex-1">
              <DialogTitle className="font-heading text-2xl text-ck-bone">
                {product.name || 'Product'}
              </DialogTitle>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded text-xs font-medium bg-ck-forge/20 text-ck-forge border border-ck-forge/30">
                {getProductTypeLabel(product.type, product.gameType)}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFull}
              className="border-ck-forge/50 text-ck-forge hover:bg-ck-forge/10"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Full
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              {/* Description */}
              {productData?.description ? (
                <p className="text-ck-bone mb-4">{stripHtml(productData.description)}</p>
              ) : (
                <p className="text-ck-stone italic mb-4">No description</p>
              )}

              {/* Universe link */}
              {productData?.universe && (
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Based on: </span>
                  <button
                    onClick={() => handleEntityClick('universe', productData.universe.id)}
                    className="text-sm text-ck-rare hover:text-ck-gold transition-colors"
                  >
                    {productData.universe.name}
                  </button>
                </div>
              )}

              <Separator className="my-4" />

              {/* Adaptations/Components */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 text-ck-rare" />
                  <h4 className="text-sm font-medium text-ck-bone">
                    Components
                    {productData?.adaptations?.length > 0 && (
                      <span className="ml-1 text-muted-foreground">
                        ({productData.adaptations.length})
                      </span>
                    )}
                  </h4>
                </div>

                {productData?.adaptations?.length > 0 ? (
                  <div className="space-y-2">
                    {productData.adaptations.slice(0, 5).map((adaptation: any) => (
                      <div
                        key={adaptation.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-card/30 border-l-2 border-ck-rare/30"
                      >
                        <img
                          src={getEntityImage(adaptation.sourceEntity.id, 'avatar')}
                          alt={adaptation.displayName || adaptation.sourceEntity.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderUrl;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ck-bone truncate">
                            {adaptation.displayName || adaptation.sourceEntity.name}
                          </p>
                          {adaptation.flavorText && (
                            <p className="text-xs text-muted-foreground italic truncate">
                              "{adaptation.flavorText}"
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {adaptation.sourceType}
                        </span>
                      </div>
                    ))}
                    {productData.adaptations.length > 5 && (
                      <p className="text-sm text-muted-foreground w-full text-center py-2">
                        +{productData.adaptations.length - 5} more
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No components yet</p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
