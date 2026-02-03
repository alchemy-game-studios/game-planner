import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ImageGallery } from '@/components/image-gallery';
import { RichTextEditor } from '@/components/rich-text-editor';
import { HoverEditableText } from '@/client-graphql/edit-entity/hover-editable-text';
import { getEntityImage, getPlaceholderImage } from '@/media/util';
import { ProductSidebar } from '@/components/product/product-sidebar';

function useDebounce(value: string, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

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
        displayName
        flavorText
        attributeValues
        mechanicValues
        artDirection
        role
        appearance
      }
      images {
        id
        filename
        url
        mimeType
        size
        rank
      }
    }
  }
`;

const EDIT_PRODUCT = gql`
  mutation EditProduct($product: ProductInput!) {
    editProduct(product: $product) {
      message
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

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { push: pushBreadcrumb } = useBreadcrumbs();

  const hasHydrated = useRef(false);
  const initialProduct = useRef<any>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const debouncedName = useDebounce(name);
  const debouncedDescription = useDebounce(description);

  const { loading, error, data, refetch } = useQuery(GET_PRODUCT, {
    variables: { obj: { id } },
    skip: !id,
    fetchPolicy: 'network-only'
  });

  const [editProduct] = useMutation(EDIT_PRODUCT);

  const product = data?.product;

  // Initialize local state from fetched data
  useEffect(() => {
    if (product && !hasHydrated.current) {
      setName(product.name || '');
      setDescription(product.description || '');
      initialProduct.current = product;
      hasHydrated.current = true;

      // Push to breadcrumb trail
      if (product.universe) {
        pushBreadcrumb({
          id: product.universe.id,
          name: product.universe.name,
          type: 'universe',
          path: `/edit/universe/${product.universe.id}`
        });
      }
      pushBreadcrumb({
        id: product.id,
        name: product.name,
        type: 'product',
        path: `/edit/product/${id}`
      });
    }
  }, [product, id, pushBreadcrumb]);

  // Save changes when debounced values change
  useEffect(() => {
    if (!hasHydrated.current || !product) return;

    const hasNameChanged = debouncedName !== initialProduct.current?.name;
    const hasDescChanged = debouncedDescription !== initialProduct.current?.description;

    if (hasNameChanged || hasDescChanged) {
      editProduct({
        variables: {
          product: {
            id: product.id,
            name: debouncedName,
            description: debouncedDescription
          }
        }
      }).then(() => {
        initialProduct.current = {
          ...initialProduct.current,
          name: debouncedName,
          description: debouncedDescription
        };
      });
    }
  }, [debouncedName, debouncedDescription, product, editProduct]);

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

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

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-muted-foreground">Product not found</h1>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const backgroundImageUrl = hasImages
    ? getEntityImage(id!, 'hero')
    : getPlaceholderImage('hero');
  const avatarImageUrl = hasImages
    ? getEntityImage(id!, 'avatar')
    : getPlaceholderImage('avatar');

  return (
    <>
      {/* Background watermark */}
      <div
        className="fixed scale-150 inset-0 pointer-events-none -z-10 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      <div className="relative z-10">
        {/* Fixed Header */}
        <div className="fixed top-10 left-0 w-full bg-background z-50">
          <div className="flex">
            <Avatar className="size-15 ml-9 mb-3.5 mt-6.5">
              <AvatarImage src={avatarImageUrl} />
              <AvatarFallback>{product.name?.charAt(0) || 'P'}</AvatarFallback>
            </Avatar>

            <div className="w-full">
              <HoverEditableText
                value={name}
                onChange={setName}
                className="font-heading text-color-secondary !md:text-5xl !text-5xl"
              />
              {product.universe && (
                <Link
                  to={`/edit/universe/${product.universe.id}`}
                  className="text-sm text-muted-foreground hover:text-secondary ml-4"
                >
                  Based on: {product.universe.name}
                </Link>
              )}
            </div>

            <Badge className="bg-ck-forge text-foreground font-heading text-2xl size-14 pl-20 pr-20 pt-3 pb-3 justify-center text-center m-auto mb-7.5 mr-8">
              {getProductTypeLabel(product.type, product.gameType)}
            </Badge>
          </div>
          <Separator />
        </div>

        {/* Main Content */}
        <div className="flex mt-30 gap-6 h-[calc(100vh-10rem)]">
          {/* Left Column - Images & Description */}
          <div className="flex-1 pr-4 overflow-y-auto">
            <div className="rounded mt-5 relative w-full">
              <ImageGallery
                images={product.images || []}
                allImages={[]}
                entityId={id!}
                entityType="product"
                entityName={product.name}
                onUpdate={handleRefetch}
                fallbackImage={backgroundImageUrl}
              />
            </div>

            {/* Description - Rich Text Editor */}
            <div className="mt-6">
              <RichTextEditor
                key={product.universe?.id || 'no-universe'}
                value={description}
                onChange={setDescription}
                entityType="product"
                entityId={id!}
                universeId={product.universe?.id}
                placeholder="Describe your product..."
                readOnly={false}
              />
            </div>
          </div>

          {/* Right Sidebar - Product Sections */}
          <div className="w-80 flex-shrink-0 mt-5 overflow-y-auto">
            <ProductSidebar
              product={product}
              onRefetch={handleRefetch}
            />
          </div>
        </div>
      </div>
    </>
  );
}
