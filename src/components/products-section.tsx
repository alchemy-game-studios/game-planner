import { Link } from 'react-router-dom';
import { Package2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AddProductDialog } from '@/components/add-product-dialog';
import { getEntityImage, getPlaceholderImage } from '@/media/util';

interface Product {
  id: string;
  name: string;
  type: string;
  gameType?: string;
}

interface ProductsSectionProps {
  products: Product[];
  universeId: string;
  onRefetch: () => void;
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
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ProductsSection({ products, universeId, onRefetch }: ProductsSectionProps) {
  const placeholderUrl = getPlaceholderImage('avatar');

  const handleProductCreated = () => {
    onRefetch();
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-ck-forge" />
          <h3 className="text-base font-semibold text-ck-bone">Products</h3>
          <span className="text-sm text-muted-foreground">({products?.length || 0})</span>
        </div>
        <AddProductDialog
          universeId={universeId}
          onProductCreated={handleProductCreated}
        />
      </div>

      <Separator className="mb-3 opacity-50" />

      {/* Product List */}
      {!products || products.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No products yet. Create one to start building games, books, and more.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/edit/product/${product.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-card/50 transition-colors group"
            >
              <img
                src={getEntityImage(product.id, 'avatar')}
                alt={product.name}
                className="w-10 h-10 rounded object-cover ring-1 ring-ck-forge/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ck-bone truncate group-hover:text-ck-forge transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getProductTypeLabel(product.type, product.gameType)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
