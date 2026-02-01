import { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { UserMenu } from '@/components/user-menu';
import { Plus, Sparkles } from 'lucide-react';
import { getEntityImage, getPlaceholderImage } from '@/media/util';

// Strip HTML tags and decode entities for plain text preview
function stripHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

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
      images {
        id
        filename
      }
    }
  }
`;

export default function DashboardPage() {
  const { loading, error, data } = useQuery(GET_HOME_DATA);
  const { clear } = useBreadcrumbs();

  // Clear breadcrumbs when navigating to home
  useEffect(() => {
    clear();
  }, [clear]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-8 pt-24 text-center text-foreground">
          <h1 className="text-2xl">Loading...</h1>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 pt-24 text-center">
          <h1 className="text-2xl text-destructive">Error: {error.message}</h1>
          <pre className="mt-4 text-left text-sm text-muted-foreground">{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    }

    const placeholderUrl = getPlaceholderImage('hero');

    return (
      <>
        {/* Hero logo section */}
        <div className="flex items-center justify-center mb-8 w-full bg-black pt-20">
          <img
            src="/images/logo.png"
            alt="CanonKiln"
            className="h-56 w-auto"
          />
        </div>

        <div className="px-8 max-w-6xl mx-auto pb-16">
          {/* Hero Create Button */}
          <div className="flex justify-center mb-12">
            <button className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-ck-ember via-ck-gold to-ck-ember bg-[length:200%_100%] animate-shimmer text-ck-charcoal font-heading text-xl hover:scale-105 transition-transform shadow-lg shadow-ck-gold/30">
              <Plus className="h-7 w-7" />
              Create New Universe
              <Sparkles className="h-5 w-5 opacity-70" />
            </button>
          </div>

          {/* Section Label */}
          <div className="mb-6">
            <p className="text-sm uppercase tracking-widest text-ck-stone">Your Universes</p>
          </div>

          {/* Universe Grid */}
          {data.universes.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-ck-gold/10 mb-6">
                <Sparkles className="h-12 w-12 text-ck-gold" />
              </div>
              <h2 className="text-2xl font-heading text-foreground mb-3">No universes yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first universe to start building characters, places, and epic stories.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-ck-ember to-ck-gold text-ck-charcoal font-semibold hover:opacity-90 transition-opacity">
                <Sparkles className="h-5 w-5" />
                Create Your First Universe
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.universes.map((universe: any) => {
                const hasImages = universe.images && universe.images.length > 0;
                const imageUrl = hasImages
                  ? getEntityImage(universe.id, 'hero')
                  : placeholderUrl;

                return (
                  <Link
                    key={universe.id}
                    to={`/edit/universe/${universe.id}`}
                    className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-ck-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-ck-gold/10"
                  >
                    {/* Universe Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={universe.properties.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholderUrl;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ck-charcoal via-transparent to-transparent" />
                    </div>

                    {/* Universe Info */}
                    <div className="p-5">
                      <h3 className="text-xl font-heading text-ck-gold mb-3 group-hover:text-ck-ember transition-colors">
                        {universe.properties.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {stripHtml(universe.properties.description) || 'A universe waiting to be explored...'}
                      </p>
                      {universe.properties.type && (
                        <span className="inline-block mt-4 px-3 py-1 text-xs rounded-full bg-ck-gold/10 text-ck-gold border border-ck-gold/20">
                          {universe.properties.type}
                        </span>
                      )}
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 group-hover:ring-ck-gold/30 transition-all pointer-events-none" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div>
      {/* Fixed header with logo and user menu - always visible */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black border-b border-border">
        <Link to="/">
          <img
            src="/images/logo.png"
            alt="CanonKiln"
            className="h-8 w-auto"
          />
        </Link>
        <UserMenu />
      </header>

      {renderContent()}
    </div>
  );
}
