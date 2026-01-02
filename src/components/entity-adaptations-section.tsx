import { useState } from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ProductFocusModal } from '@/components/product/product-focus-modal';
import { ComponentFocusModal } from '@/components/product/component-focus-modal';

interface ProductInfo {
  id: string;
  name: string;
  type: string;
  gameType?: string;
}

interface Adaptation {
  id: string;
  cardName?: string;
  flavorText?: string;
  product: ProductInfo;
}

interface EntityAdaptationsSectionProps {
  adaptations: Adaptation[];
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

export function EntityAdaptationsSection({ adaptations, entityName }: EntityAdaptationsSectionProps) {
  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Component modal state
  const [selectedAdaptation, setSelectedAdaptation] = useState<Adaptation | null>(null);
  const [componentModalOpen, setComponentModalOpen] = useState(false);

  if (!adaptations || adaptations.length === 0) {
    return null;
  }

  const groupedAdaptations = groupByProduct(adaptations);

  const handleProductClick = (product: ProductInfo) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleAdaptationClick = (adaptation: Adaptation) => {
    setSelectedAdaptation(adaptation);
    setComponentModalOpen(true);
  };

  return (
    <>
      <div className="mb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-5 w-5 text-ck-rare" />
          <h3 className="text-lg font-heading text-ck-bone">In Products</h3>
          <span className="text-sm text-muted-foreground">({adaptations.length})</span>
        </div>

        <Separator className="mb-3 opacity-50" />

        {/* Product groups */}
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
                      {adaptation.cardName || entityName}
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
    </>
  );
}
