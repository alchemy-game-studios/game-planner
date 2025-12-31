import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { AddProductDialog } from '@/components/add-product-dialog';

const GET_PRODUCTS = gql`
  query Products {
    products {
      id
      name
      description
      type
      gameType
      universe {
        id
        name
      }
    }
  }
`;

function getProductTypeLabel(type: string, gameType?: string): string {
  if (type === 'game' && gameType) {
    const gameTypeLabels: Record<string, string> = {
      card: 'Card Game',
      board: 'Board Game',
      ttrpg: 'TTRPG',
      video: 'Video Game'
    };
    return gameTypeLabels[gameType] || `${gameType} Game`;
  }
  const typeLabels: Record<string, string> = {
    game: 'Game',
    book: 'Book',
    movie: 'Movie',
    comic: 'Comic'
  };
  return typeLabels[type] || type;
}

function getProductTypeColor(type: string): string {
  const colors: Record<string, string> = {
    game: 'bg-ck-rare',
    book: 'bg-ck-teal',
    movie: 'bg-ck-danger',
    comic: 'bg-ck-gold text-ck-obsidian'
  };
  return colors[type] || 'bg-muted';
}

export default function ProductsPage() {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const { clear } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    clear();
  }, [clear]);

  const handleProductCreated = (product: any) => {
    refetch();
    navigate(`/product/${product.id}`);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-foreground">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-destructive">Error: {error.message}</h1>
        <pre className="mt-4 text-left text-sm text-muted-foreground">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Games, books, and media based on your universes</p>
        </div>
        <AddProductDialog onProductCreated={handleProductCreated} />
      </div>

      <div className="grid gap-4">
        {data.products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No products yet</p>
            <p className="text-sm mt-2">Create a product to start building games, books, or other media from your universes.</p>
          </div>
        ) : (
          data.products.map((product: any) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="block p-6 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{product.name}</h3>
                  <p className="text-card-foreground">{product.description}</p>
                  {product.universe && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on: <span className="text-secondary">{product.universe.name}</span>
                    </p>
                  )}
                </div>
                <span className={`inline-block px-3 py-1 text-xs rounded-full text-foreground ${getProductTypeColor(product.type)}`}>
                  {getProductTypeLabel(product.type, product.gameType)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <Link to="/" className="text-secondary hover:text-ck-gold">
          &larr; Back to IP Building
        </Link>
      </div>
    </div>
  );
}
