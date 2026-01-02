import { Link } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  if (!adaptations || adaptations.length === 0) {
    return null;
  }

  const groupedAdaptations = groupByProduct(adaptations);

  return (
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
            {/* Product header */}
            <Link
              to={`/edit/product/${productId}`}
              className="flex items-center gap-2 mb-2 p-2 rounded bg-ck-forge/10 hover:bg-ck-forge/20 transition-colors group"
            >
              <span className="text-sm font-medium text-ck-forge group-hover:text-ck-gold">
                {product.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {getProductTypeLabel(product.type, product.gameType)}
              </span>
              <ChevronRight className="h-3 w-3 ml-auto text-ck-forge opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Adaptations for this product */}
            <div className="space-y-1">
              {items.map((adaptation) => (
                <Link
                  key={adaptation.id}
                  to={`/edit/product/${productId}`}
                  className="block p-2 pl-4 rounded bg-card/30 hover:bg-card/50 transition-colors border-l-2 border-ck-rare/30 hover:border-ck-rare"
                >
                  <p className="text-sm font-medium text-ck-bone">
                    {adaptation.cardName || entityName}
                  </p>
                  {adaptation.flavorText && (
                    <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">
                      "{adaptation.flavorText}"
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
