import { useState } from 'react';
import { Layers, ChevronRight, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ProductFocusModal } from '@/components/product/product-focus-modal';
import { ComponentFocusModal } from '@/components/product/component-focus-modal';
import { ComponentEditModal } from '@/components/product/component-edit-modal';

interface ProductInfo {
  id: string;
  name: string;
  type: string;
  gameType?: string;
}

interface Adaptation {
  id: string;
  displayName?: string;
  flavorText?: string;
  role?: string;
  appearance?: string;
  product: ProductInfo;
}

interface EntityAdaptationsSectionProps {
  adaptations: Adaptation[];
  entityId: string;
  entityType: string;
  entityName: string;
  universeId?: string;
  onRefetch?: () => void;
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

// Group adaptations by product
function groupByProduct(adaptations: Adaptation[]): Map<string, { product: ProductInfo; items: Adaptation[] }> {
  const groups = new Map<string, { product: ProductInfo; items: Adaptation[] }>();

  for (const adaptation of adaptations) {
    const productId = adaptation.product.id;
    if (!groups.has(productId)) {
      groups.set(productId, { product: adaptation.product, items: [] });
    }
    groups.get(productId)!.items.push(adaptation);
  }

  return groups;
}

export function EntityAdaptationsSection({
  adaptations,
  entityId,
  entityType,
  entityName,
  universeId,
  onRefetch,
}: EntityAdaptationsSectionProps) {
  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Component modal state
  const [selectedAdaptation, setSelectedAdaptation] = useState<Adaptation | null>(null);
  const [componentModalOpen, setComponentModalOpen] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);

  const hasAdaptations = adaptations && adaptations.length > 0;
  const groupedAdaptations = hasAdaptations ? groupByProduct(adaptations) : new Map();

  const handleProductClick = (product: ProductInfo) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleAdaptationClick = (adaptation: Adaptation) => {
    setSelectedAdaptation(adaptation);
    setComponentModalOpen(true);
  };

  const handleAddClick = () => {
    setEditModalOpen(true);
  };

  const handleSave = () => {
    onRefetch?.();
  };

  // Don't render if no universeId (can't add to products)
  if (!universeId && !hasAdaptations) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-ck-rare" />
            <h3 className="text-base font-semibold text-ck-bone">In Products</h3>
            {hasAdaptations && (
              <span className="text-sm text-muted-foreground">({adaptations.length})</span>
            )}
          </div>
          {universeId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddClick}
              className="h-7 px-2 text-ck-rare hover:text-ck-gold hover:bg-ck-rare/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator className="mb-3 opacity-50" />

        {/* Product groups or empty state */}
        {!hasAdaptations ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Not in any products yet.
          </p>
        ) : (
          <div className="space-y-4">
            {Array.from(groupedAdaptations.entries()).map(([productId, { product, items }]) => (
              <div key={productId}>
                {/* Product header - opens product modal */}
                <button
                  onClick={() => handleProductClick(product)}
                  className="flex items-center gap-2 mb-2 p-2 rounded bg-ck-forge/10 hover:bg-ck-forge/20 transition-colors group w-full text-left"
                >
                  <span className="text-sm font-medium text-ck-forge group-hover:text-ck-gold">
                    {product.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getProductTypeLabel(product.type, product.gameType)}
                  </span>
                  <ChevronRight className="h-3 w-3 ml-auto text-ck-forge opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>

                {/* Adaptations for this product - opens component modal */}
                <div className="space-y-1">
                  {items.map((adaptation) => (
                    <button
                      key={adaptation.id}
                      onClick={() => handleAdaptationClick(adaptation)}
                      className="block w-full text-left p-2 pl-4 rounded bg-card/30 hover:bg-card/50 transition-colors border-l-2 border-ck-rare/30 hover:border-ck-rare"
                    >
                      <p className="text-sm font-medium text-ck-bone">
                        {adaptation.displayName || entityName}
                      </p>
                      {adaptation.flavorText && (
                        <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">
                          "{adaptation.flavorText}"
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Focus Modal - for product headers */}
      <ProductFocusModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={selectedProduct}
      />

      {/* Component Focus Modal - for individual adaptations */}
      <ComponentFocusModal
        open={componentModalOpen}
        onOpenChange={setComponentModalOpen}
        adaptation={selectedAdaptation}
        entityName={entityName}
      />

      {/* Component Edit Modal - for creating new adaptations */}
      {universeId && (
        <ComponentEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          universeId={universeId}
          onSave={handleSave}
        />
      )}
    </>
  );
}
