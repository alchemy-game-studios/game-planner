import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';

const GET_UNIVERSES = gql`
  query Universes {
    universes {
      id
      properties {
        id
        name
        description
        type
      }
    }
  }
`;

export default function HomePage() {
  const { loading, error, data } = useQuery(GET_UNIVERSES);
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
      <h1 className="text-4xl font-heading mb-8 text-white">Game Planner</h1>

      <h2 className="text-2xl font-heading mb-4 text-white">Universes</h2>

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
