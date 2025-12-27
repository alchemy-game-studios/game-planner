import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { ArrowRight, Package } from 'lucide-react';

const GET_HOME_DATA = gql`
  query HomeData {
    universes {
      id
      properties {
        id
        name
        description
        type
      }
    }
    products {
      id
      name
      type
      gameType
    }
  }
`;

export default function HomePage() {
  const { loading, error, data } = useQuery(GET_HOME_DATA);
  const { clear } = useBreadcrumbs();

  // Clear breadcrumbs when navigating to home
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
        <h1 className="text-4xl font-heading text-white">Game Planner</h1>
      </div>

      {/* Products Section */}
      <Link
        to="/products"
        className="block mb-8 p-6 rounded-lg border border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/30 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-600/20">
              <Package className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Products</h2>
              <p className="text-gray-400 text-sm">
                {data.products.length} {data.products.length === 1 ? 'product' : 'products'} - Games, books, and media based on your universes
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Universes Section */}
      <h2 className="text-2xl font-heading mb-4 text-white">IP Building</h2>
      <p className="text-gray-400 mb-4 text-sm">Create and manage your universes, characters, places, and stories</p>

      <div className="grid gap-4">
        {data.universes.map((universe: any) => (
          <Link
            key={universe.id}
            to={`/edit/universe/${universe.id}`}
            className="block p-6 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2 text-white">{universe.properties.name}</h3>
            <p className="text-gray-300">{universe.properties.description}</p>
            {universe.properties.type && (
              <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-gray-600 text-white">
                {universe.properties.type}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
