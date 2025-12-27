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
    <div>
      <div className="flex items-center justify-center mb-12 w-full bg-black">
        <img
          src="/images/logo.png"
          alt="CanonKiln"
          className="h-64 w-auto"
        />
      </div>
      <div className="px-8 max-w-4xl mx-auto">

      {/* Products Section */}
      <Link
        to="/products"
        className="block mb-8 p-6 rounded-lg border border-ck-rare/30 bg-ck-rare/10 hover:bg-ck-rare/20 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-ck-rare/20">
              <Package className="h-6 w-6 text-ck-rare" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Products</h2>
              <p className="text-muted-foreground text-sm">
                {data.products.length} {data.products.length === 1 ? 'product' : 'products'} - Games, books, and media based on your universes
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-ck-rare group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Universes Section */}
      <h2 className="text-2xl font-heading mb-4 text-foreground">IP Building</h2>
      <p className="text-muted-foreground mb-4 text-sm">Create and manage your universes, characters, places, and stories</p>

      <div className="grid gap-4">
        {data.universes.map((universe: any) => (
          <Link
            key={universe.id}
            to={`/edit/universe/${universe.id}`}
            className="block p-6 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2 text-foreground">{universe.properties.name}</h3>
            <p className="text-card-foreground">{universe.properties.description}</p>
            {universe.properties.type && (
              <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-muted text-foreground">
                {universe.properties.type}
              </span>
            )}
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
