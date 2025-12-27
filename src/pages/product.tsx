import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';

const GET_PRODUCT = gql`
  query Product($obj: IdInput!) {
    product(obj: $obj) {
      id
      name
      description
      type
      gameType
      universe {
        id
        name
      }
      attributes {
        id
        name
        description
        valueType
        defaultValue
        options
        min
        max
      }
      mechanics {
        id
        name
        description
        category
        hasValue
        valueType
      }
      sections {
        id
        name
        description
        order
        sectionType
      }
      adaptations {
        id
        sourceEntity {
          id
          name
          description
        }
        sourceType
        cardName
        flavorText
        attributeValues
        mechanicValues
        artDirection
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
      video: 'Video Game',
      mobile: 'Mobile Game',
      party: 'Party Game',
      miniatures: 'Miniatures Game',
      dice: 'Dice Game'
    };
    return gameTypeLabels[gameType] || `${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game`;
  }
  const typeLabels: Record<string, string> = {
    game: 'Game',
    book: 'Book',
    movie: 'Movie',
    comic: 'Comic',
    'tv series': 'TV Series',
    podcast: 'Podcast',
    music: 'Music'
  };
  return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

// Get the label for entity adaptations - universal term for all product types
function getAdaptationLabel(plural = true): string {
  return plural ? 'Components' : 'Component';
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { clear, push } = useBreadcrumbs();
  const [activeTab, setActiveTab] = useState('overview');

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { obj: { id } },
    skip: !id
  });

  useEffect(() => {
    if (data?.product) {
      clear();
      push({
        id: 'products',
        name: 'Products',
        type: 'products',
        path: '/products'
      });
      push({
        id: data.product.id,
        name: data.product.name,
        type: 'product',
        path: `/product/${id}`
      });
    }
  }, [data, id, clear, push]);

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
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-muted-foreground">Product not found</h1>
      </div>
    );
  }

  const product = data.product;
  const isGame = product.type === 'game';
  const isPassiveMedia = ['book', 'movie', 'comic'].includes(product.type);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-heading text-foreground">{product.name}</h1>
            <p className="text-muted-foreground mt-2">{product.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline">{getProductTypeLabel(product.type, product.gameType)}</Badge>
              {product.universe && (
                <Link
                  to={`/edit/universe/${product.universe.id}`}
                  className="text-sm text-secondary hover:text-ck-gold"
                >
                  Based on: {product.universe.name}
                </Link>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isGame && <TabsTrigger value="attributes">Attributes ({product.attributes.length})</TabsTrigger>}
          {isGame && <TabsTrigger value="mechanics">Mechanics ({product.mechanics.length})</TabsTrigger>}
          <TabsTrigger value="adaptations">
            {getAdaptationLabel()} ({product.adaptations.length})
          </TabsTrigger>
          {isPassiveMedia && <TabsTrigger value="sections">Sections ({product.sections.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isGame && (
              <>
                <div className="p-6 rounded-lg border border-border bg-card/50">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Attributes</h3>
                  <p className="text-3xl font-bold text-secondary">{product.attributes.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">User-defined stats</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/50">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Mechanics</h3>
                  <p className="text-3xl font-bold text-secondary">{product.mechanics.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Keywords & abilities</p>
                </div>
              </>
            )}
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {getAdaptationLabel()}
              </h3>
              <p className="text-3xl font-bold text-secondary">{product.adaptations.length}</p>
              <p className="text-sm text-muted-foreground mt-1">IP entities mapped</p>
            </div>
            {isPassiveMedia && (
              <div className="p-6 rounded-lg border border-border bg-card/50">
                <h3 className="text-lg font-semibold text-foreground mb-2">Sections</h3>
                <p className="text-3xl font-bold text-secondary">{product.sections.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Chapters/scenes</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Attribute Definitions</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Attribute
            </Button>
          </div>
          <div className="grid gap-3">
            {product.attributes.map((attr: any) => (
              <div key={attr.id} className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{attr.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{attr.description}</p>
                  </div>
                  <Badge variant="secondary">{attr.valueType}</Badge>
                </div>
                {attr.valueType === 'number' && (attr.min !== null || attr.max !== null) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Range: {attr.min ?? 0} - {attr.max ?? '∞'}
                  </p>
                )}
                {attr.valueType === 'enum' && attr.options && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Options: {JSON.parse(attr.options).join(', ')}
                  </p>
                )}
              </div>
            ))}
            {product.attributes.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No attributes defined yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mechanics" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Mechanic Definitions</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Mechanic
            </Button>
          </div>
          <div className="grid gap-3">
            {product.mechanics.map((mech: any) => (
              <div key={mech.id} className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{mech.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{mech.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {mech.category && <Badge variant="secondary">{mech.category}</Badge>}
                    {mech.hasValue && <Badge variant="outline">has value</Badge>}
                  </div>
                </div>
              </div>
            ))}
            {product.mechanics.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No mechanics defined yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="adaptations" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {getAdaptationLabel()}
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add {getAdaptationLabel(false)}
            </Button>
          </div>
          <div className="grid gap-4">
            {product.adaptations.map((adapt: any) => {
              const attrValues = adapt.attributeValues ? JSON.parse(adapt.attributeValues) : {};
              const mechValues = adapt.mechanicValues ? JSON.parse(adapt.mechanicValues) : {};

              return (
                <div key={adapt.id} className="p-4 rounded-lg border border-border bg-card/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {adapt.cardName || adapt.sourceEntity.name}
                      </h3>
                      {adapt.cardName && (
                        <p className="text-sm text-muted-foreground">
                          from: <Link to={`/edit/${adapt.sourceType}/${adapt.sourceEntity.id}`} className="text-secondary hover:text-ck-gold">
                            {adapt.sourceEntity.name}
                          </Link>
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">{adapt.sourceType}</Badge>
                  </div>
                  {adapt.flavorText && (
                    <p className="text-sm italic text-card-foreground mb-3">"{adapt.flavorText}"</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(attrValues).map(([attrId, value]) => {
                      const attr = product.attributes.find((a: any) => a.id === attrId);
                      return attr ? (
                        <Badge key={attrId} variant="outline">
                          {attr.name}: {String(value)}
                        </Badge>
                      ) : null;
                    })}
                    {Object.entries(mechValues).map(([mechId, value]) => {
                      const mech = product.mechanics.find((m: any) => m.id === mechId);
                      return mech ? (
                        <Badge key={mechId} className="bg-ck-rare">
                          {mech.name}{value !== true ? `: ${value}` : ''}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
            {product.adaptations.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No adaptations yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Sections</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>
          <div className="grid gap-3">
            {[...product.sections]
              .sort((a: any, b: any) => a.order - b.order)
              .map((section: any) => (
                <div key={section.id} className="p-4 rounded-lg border border-border bg-card/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-secondary">{section.order}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{section.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </div>
                    </div>
                    {section.sectionType && <Badge variant="secondary">{section.sectionType}</Badge>}
                  </div>
                </div>
              ))}
            {product.sections.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No sections defined yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-8 border-t border-border">
        <Link to="/products" className="text-secondary hover:text-ck-gold">
          &larr; Back to Products
        </Link>
      </div>
    </div>
  );
}
