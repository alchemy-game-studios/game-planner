import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
    game: 'bg-purple-600',
    book: 'bg-blue-600',
    movie: 'bg-red-600',
    comic: 'bg-yellow-600'
  };
  return colors[type] || 'bg-gray-600';
}

export default function ProductsPage() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const { clear } = useBreadcrumbs();

  useEffect(() => {
    clear();
  }, [clear]);

  if (loading) {
    return (
      <div className="p-8 text-center text-white">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-red-500">Error: {error.message}</h1>
        <pre className="mt-4 text-left text-sm text-gray-400">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading text-white">Products</h1>
          <p className="text-gray-400 mt-1">Games, books, and media based on your universes</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <div className="grid gap-4">
        {data.products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No products yet</p>
            <p className="text-sm mt-2">Create a product to start building games, books, or other media from your universes.</p>
          </div>
        ) : (
          data.products.map((product: any) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="block p-6 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">{product.name}</h3>
                  <p className="text-gray-300">{product.description}</p>
                  {product.universe && (
                    <p className="text-sm text-gray-400 mt-2">
                      Based on: <span className="text-indigo-400">{product.universe.name}</span>
                    </p>
                  )}
                </div>
                <span className={`inline-block px-3 py-1 text-xs rounded-full text-white ${getProductTypeColor(product.type)}`}>
                  {getProductTypeLabel(product.type, product.gameType)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <Link to="/" className="text-indigo-400 hover:text-indigo-300">
          &larr; Back to IP Building
        </Link>
      </div>
    </div>
  );
}
