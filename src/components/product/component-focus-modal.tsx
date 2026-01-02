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
import { Layers, ExternalLink, Sparkles, BarChart3, Quote } from 'lucide-react';
import { getEntityImage, getPlaceholderImage } from '@/media/util';

// Query to get adaptation details with product definitions
const GET_ADAPTATION_DETAILS = gql`
  query GetProduct($obj: IdInput!) {
    product(obj: $obj) {
      id
      name
      type
      gameType
      attributes {
        id
        name
        description
        valueType
        options
      }
      mechanics {
        id
        name
        description
        category
        hasValue
        valueType
      }
      adaptations {
        id
        cardName
        flavorText
        attributeValues
        mechanicValues
        artDirection
        sourceEntity {
          id
          name
        }
        sourceType
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

interface AdaptationInfo {
  id: string;
  cardName?: string;
  flavorText?: string;
  product: ProductInfo;
}

interface ComponentFocusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adaptation: AdaptationInfo | null;
  entityName: string;
}

function getProductTypeLabel(type: string, gameType?: string): string {
  if (type === 'game' && gameType) {
    const gameTypeLabels: Record<string, string> = {
      card: 'Card',
      board: 'Board Game',
      ttrpg: 'TTRPG',
      video: 'Video Game',
    };
    return gameTypeLabels[gameType] || gameType;
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Parse JSON safely
function parseJson(json: string | null | undefined): Record<string, any> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function ComponentFocusModal({
  open,
  onOpenChange,
  adaptation,
  entityName,
}: ComponentFocusModalProps) {
  const navigate = useNavigate();
  const [fetchProduct, { data, loading }] = useLazyQuery(GET_ADAPTATION_DETAILS);

  // Fetch product details when modal opens
  useEffect(() => {
    if (open && adaptation?.product?.id) {
      fetchProduct({ variables: { obj: { id: adaptation.product.id } } });
    }
  }, [open, adaptation?.product?.id, fetchProduct]);

  const productData = data?.product;
  const placeholderUrl = getPlaceholderImage('avatar');

  // Find the full adaptation data from the product query
  const fullAdaptation = productData?.adaptations?.find(
    (a: any) => a.id === adaptation?.id
  );

  const attributeValues = parseJson(fullAdaptation?.attributeValues);
  const mechanicValues = parseJson(fullAdaptation?.mechanicValues);

  const handleViewProduct = () => {
    if (adaptation?.product?.id) {
      navigate(`/edit/product/${adaptation.product.id}`);
      onOpenChange(false);
    }
  };

  const handleViewEntity = () => {
    if (fullAdaptation?.sourceEntity?.id && fullAdaptation?.sourceType) {
      navigate(`/edit/${fullAdaptation.sourceType}/${fullAdaptation.sourceEntity.id}`);
      onOpenChange(false);
    }
  };

  if (!adaptation) return null;

  const displayName = adaptation.cardName || entityName;
  const isGame = adaptation.product.type === 'game';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Entity avatar */}
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-ck-rare/30 flex-shrink-0">
              {fullAdaptation?.sourceEntity?.id ? (
                <img
                  src={getEntityImage(fullAdaptation.sourceEntity.id, 'avatar')}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderUrl;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-ck-rare/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-ck-rare" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="font-heading text-xl text-ck-bone truncate">
                {displayName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">in</span>
                <button
                  onClick={handleViewProduct}
                  className="text-xs text-ck-forge hover:text-ck-gold transition-colors truncate"
                >
                  {adaptation.product.name}
                </button>
                <span className="text-xs px-1.5 py-0.5 rounded bg-ck-forge/20 text-ck-forge">
                  {getProductTypeLabel(adaptation.product.type, adaptation.product.gameType)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              {/* Flavor Text */}
              {(adaptation.flavorText || fullAdaptation?.flavorText) && (
                <div className="mb-4 p-3 rounded-lg bg-card/50 border border-ck-stone/20">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-ck-stone mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-ck-bone italic">
                      "{adaptation.flavorText || fullAdaptation?.flavorText}"
                    </p>
                  </div>
                </div>
              )}

              {/* Attributes - only for games */}
              {isGame && productData?.attributes?.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-ck-teal" />
                    <h4 className="text-sm font-medium text-ck-bone">Attributes</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {productData.attributes.map((attr: any) => {
                      const value = attributeValues[attr.id];
                      if (value === undefined) return null;
                      return (
                        <div
                          key={attr.id}
                          className="flex items-center justify-between p-2 rounded bg-ck-teal/10 border border-ck-teal/20"
                        >
                          <span className="text-xs text-ck-bone">{attr.name}</span>
                          <span className="text-sm font-medium text-ck-teal">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Mechanics - only for games */}
              {isGame && productData?.mechanics?.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-ck-rare" />
                    <h4 className="text-sm font-medium text-ck-bone">Mechanics</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {productData.mechanics.map((mech: any) => {
                      const value = mechanicValues[mech.id];
                      if (!value) return null;
                      return (
                        <span
                          key={mech.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-ck-rare/20 text-ck-rare border border-ck-rare/30"
                          title={mech.description}
                        >
                          {mech.name}
                          {mech.hasValue && typeof value !== 'boolean' && (
                            <span className="font-medium ml-1">{value}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Art Direction */}
              {fullAdaptation?.artDirection && (
                <>
                  <Separator className="my-3 opacity-50" />
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Art Direction</h4>
                    <p className="text-sm text-ck-stone">
                      {fullAdaptation.artDirection}
                    </p>
                  </div>
                </>
              )}

              {/* Source Entity Link */}
              {fullAdaptation?.sourceEntity && (
                <>
                  <Separator className="my-3 opacity-50" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Based on {fullAdaptation.sourceType}:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewEntity}
                      className="text-ck-rare hover:text-ck-gold"
                    >
                      {fullAdaptation.sourceEntity.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
