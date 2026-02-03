import { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Coins, Save, Loader2 } from 'lucide-react';

// Query to get products list for a universe (basic info only)
const GET_UNIVERSE_PRODUCTS = gql`
  query GetUniverse($obj: IdInput!) {
    universe(obj: $obj) {
      id
      products {
        id
        name
        type
        gameType
      }
    }
  }
`;

// Query to get full product details when selected
const GET_PRODUCT_DETAILS = gql`
  query GetProduct($obj: IdInput!) {
    product(obj: $obj) {
      id
      name
      type
      gameType
      attributes {
        id
        name
        valueType
        options
        min
        max
      }
      mechanics {
        id
        name
        category
        hasValue
        valueType
      }
    }
  }
`;

// Mutation to add entity adaptation
const ADD_ADAPTATION = gql`
  mutation AddEntityAdaptation($adaptation: EntityAdaptationInput!) {
    addEntityAdaptation(adaptation: $adaptation) {
      message
    }
  }
`;

interface ComponentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: string;
  entityName: string;
  universeId: string;
  onSave?: () => void;
}

const GENERATION_CREDITS = 5;

// Role options for passive media
const ROLE_OPTIONS = [
  { value: 'protagonist', label: 'Protagonist' },
  { value: 'antagonist', label: 'Antagonist' },
  { value: 'supporting', label: 'Supporting Character' },
  { value: 'minor', label: 'Minor Character' },
  { value: 'mentioned', label: 'Mentioned Only' },
  { value: 'cameo', label: 'Cameo' },
];

// Get display name field label based on product type
function getDisplayNameLabel(type: string, gameType?: string): string {
  if (type === 'game') {
    if (gameType === 'card') return 'Card Name';
    if (gameType === 'board') return 'Component Name';
    if (gameType === 'ttrpg') return 'Stat Block Name';
    return 'Component Name';
  }
  return 'Display Name';
}

// Get flavor text label based on product type
function getFlavorTextLabel(type: string): string {
  if (type === 'game') return 'Flavor Text';
  return 'Description';
}

// Get art direction label based on product type
function getArtDirectionLabel(type: string): string {
  if (type === 'game') return 'Art Direction';
  if (type === 'book' || type === 'comic') return 'Illustration Notes';
  return 'Visual Notes';
}

export function ComponentEditModal({
  open,
  onOpenChange,
  entityId,
  entityType,
  entityName,
  universeId,
  onSave,
}: ComponentEditModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Common fields
  const [displayName, setDisplayName] = useState('');
  const [flavorText, setFlavorText] = useState('');
  const [artDirection, setArtDirection] = useState('');

  // Game-specific fields
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
  const [mechanicValues, setMechanicValues] = useState<Record<string, any>>({});

  // Passive media fields
  const [role, setRole] = useState('');
  const [appearance, setAppearance] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const [fetchProducts, { data: productsData, loading: loadingProducts }] = useLazyQuery(GET_UNIVERSE_PRODUCTS);
  const [fetchProductDetails, { data: productDetailsData, loading: loadingDetails }] = useLazyQuery(GET_PRODUCT_DETAILS);
  const [addAdaptation] = useMutation(ADD_ADAPTATION);

  // Fetch products when modal opens
  useEffect(() => {
    if (open && universeId) {
      fetchProducts({ variables: { obj: { id: universeId } } });
    }
  }, [open, universeId, fetchProducts]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedProductId('');
      setDisplayName('');
      setFlavorText('');
      setArtDirection('');
      setAttributeValues({});
      setMechanicValues({});
      setRole('');
      setAppearance('');
    }
  }, [open]);

  // Set default display name when opening
  useEffect(() => {
    if (open && !displayName) {
      setDisplayName(entityName);
    }
  }, [open, entityName, displayName]);

  // Fetch product details when a product is selected
  useEffect(() => {
    if (selectedProductId) {
      fetchProductDetails({ variables: { obj: { id: selectedProductId } } });
      // Reset type-specific values when product changes
      setAttributeValues({});
      setMechanicValues({});
      setRole('');
      setAppearance('');
    }
  }, [selectedProductId, fetchProductDetails]);

  const products = productsData?.universe?.products || [];
  const selectedProduct = productDetailsData?.product;
  const isGame = selectedProduct?.type === 'game';
  const isPassiveMedia = selectedProduct && !isGame;

  const handleAttributeChange = (attrId: string, value: any) => {
    setAttributeValues(prev => ({ ...prev, [attrId]: value }));
  };

  const handleMechanicToggle = (mechId: string, checked: boolean) => {
    setMechanicValues(prev => {
      if (checked) {
        return { ...prev, [mechId]: true };
      } else {
        const { [mechId]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleMechanicValueChange = (mechId: string, value: any) => {
    setMechanicValues(prev => ({ ...prev, [mechId]: value }));
  };

  const handleGenerate = () => {
    // TODO: Implement AI generation
    console.log('Generate component stats');
  };

  const handleSave = async () => {
    if (!selectedProductId) return;

    setIsSaving(true);
    try {
      await addAdaptation({
        variables: {
          adaptation: {
            id: uuidv4(),
            productId: selectedProductId,
            entityId,
            entityType,
            // Common fields
            displayName: displayName || entityName,
            flavorText: flavorText || null,
            artDirection: artDirection || null,
            // Game-specific fields
            attributeValues: isGame && Object.keys(attributeValues).length > 0
              ? JSON.stringify(attributeValues)
              : null,
            mechanicValues: isGame && Object.keys(mechanicValues).length > 0
              ? JSON.stringify(mechanicValues)
              : null,
            // Passive media fields
            role: isPassiveMedia ? (role || null) : null,
            appearance: isPassiveMedia ? (appearance || null) : null,
          },
        },
      });

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving adaptation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-ck-bone">
            Add to Product
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a component for "{entityName}" in a product
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products in this universe yet.</p>
              <p className="text-sm mt-1">Create a product first from the universe page.</p>
            </div>
          ) : (
            <>
              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProductId && loadingDetails && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading product...</span>
                </div>
              )}

              {selectedProductId && !loadingDetails && selectedProduct && (
                <>
                  {/* Display Name - label varies by product type */}
                  <div className="space-y-2">
                    <Label>{getDisplayNameLabel(selectedProduct.type, selectedProduct.gameType)}</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={entityName}
                    />
                  </div>

                  {/* Flavor Text / Description */}
                  <div className="space-y-2">
                    <Label>{getFlavorTextLabel(selectedProduct.type)}</Label>
                    <Textarea
                      value={flavorText}
                      onChange={(e) => setFlavorText(e.target.value)}
                      placeholder={isGame ? "A memorable quote or description..." : "How this entity is described in this work..."}
                      rows={2}
                    />
                  </div>

                  {/* === PASSIVE MEDIA SPECIFIC FIELDS === */}
                  {isPassiveMedia && (
                    <>
                      <Separator />

                      {/* Role */}
                      <div className="space-y-2">
                        <Label className="text-ck-teal">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Appearance Notes */}
                      <div className="space-y-2">
                        <Label>Appearance Notes</Label>
                        <Textarea
                          value={appearance}
                          onChange={(e) => setAppearance(e.target.value)}
                          placeholder="How does this entity appear in this work? Key scenes, transformations, notable moments..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {/* === GAME SPECIFIC FIELDS === */}
                  {/* Attributes - only for games */}
                  {isGame && selectedProduct?.attributes?.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-ck-teal">Attributes</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedProduct.attributes.map((attr: any) => (
                            <div key={attr.id} className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{attr.name}</Label>
                              {attr.valueType === 'enum' && attr.options ? (
                                <Select
                                  value={attributeValues[attr.id] || ''}
                                  onValueChange={(v) => handleAttributeChange(attr.id, v)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {JSON.parse(attr.options).map((opt: string) => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : attr.valueType === 'number' ? (
                                <Input
                                  type="number"
                                  className="h-8"
                                  value={attributeValues[attr.id] || ''}
                                  onChange={(e) => handleAttributeChange(attr.id, parseInt(e.target.value) || 0)}
                                  min={attr.min}
                                  max={attr.max}
                                />
                              ) : (
                                <Input
                                  className="h-8"
                                  value={attributeValues[attr.id] || ''}
                                  onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mechanics - only for games */}
                  {isGame && selectedProduct?.mechanics?.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-ck-rare">Mechanics</Label>
                        <div className="space-y-2">
                          {selectedProduct.mechanics.map((mech: any) => (
                            <div key={mech.id} className="flex items-center gap-2">
                              <Checkbox
                                id={mech.id}
                                checked={!!mechanicValues[mech.id]}
                                onCheckedChange={(checked) => handleMechanicToggle(mech.id, !!checked)}
                              />
                              <label
                                htmlFor={mech.id}
                                className="text-sm flex-1 cursor-pointer"
                              >
                                {mech.name}
                              </label>
                              {mech.hasValue && mechanicValues[mech.id] && (
                                <Input
                                  type={mech.valueType === 'number' ? 'number' : 'text'}
                                  className="w-16 h-7 text-xs"
                                  value={typeof mechanicValues[mech.id] === 'boolean' ? '' : mechanicValues[mech.id]}
                                  onChange={(e) => handleMechanicValueChange(
                                    mech.id,
                                    mech.valueType === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                                  )}
                                  placeholder="Value"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Art Direction / Visual Notes */}
                  <Separator />
                  <div className="space-y-2">
                    <Label>{getArtDirectionLabel(selectedProduct.type)}</Label>
                    <Textarea
                      value={artDirection}
                      onChange={(e) => setArtDirection(e.target.value)}
                      placeholder={isGame ? "Visual notes for card art..." : "Visual style, mood, key visual elements..."}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={!selectedProductId || isSaving}
            className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-0 before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-r before:from-purple-500 before:to-pink-500 before:-z-10 before:content-[''] after:absolute after:inset-[1px] after:rounded-[5px] after:bg-zinc-900 after:-z-10 after:content-[''] text-purple-300 hover:text-purple-200 hover:from-purple-500/20 hover:to-pink-500/20"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate
            <span className="ml-1 flex items-center gap-0.5 text-[10px] opacity-60">
              <Coins className="h-2.5 w-2.5" />
              {GENERATION_CREDITS}
            </span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedProductId || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
