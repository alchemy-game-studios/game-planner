import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus } from 'lucide-react';

const GET_UNIVERSES = gql`
  query Universes {
    universes {
      id
      properties {
        id
        name
      }
    }
  }
`;

const ADD_PRODUCT = gql`
  mutation AddProduct($product: ProductInput!) {
    addProduct(product: $product) {
      message
    }
  }
`;

interface AddProductDialogProps {
  onProductCreated: (product: any) => void;
}

const MEDIA_TYPES = ['game', 'book', 'movie', 'comic', 'tv series', 'podcast', 'music'];
const GAME_TYPES = ['card', 'board', 'ttrpg', 'video', 'mobile', 'party', 'miniatures', 'dice'];

export const AddProductDialog: React.FC<AddProductDialogProps> = ({ onProductCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('game');
  const [customType, setCustomType] = useState('');
  const [gameType, setGameType] = useState('card');
  const [customGameType, setCustomGameType] = useState('');
  const [universeId, setUniverseId] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: universesData } = useQuery(GET_UNIVERSES);
  const [addProduct] = useMutation(ADD_PRODUCT);

  const effectiveType = type === 'other' ? customType : type;
  const effectiveGameType = gameType === 'other' ? customGameType : gameType;

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (type === 'other' && !customType.trim()) return;
    if (effectiveType === 'game' && gameType === 'other' && !customGameType.trim()) return;

    setLoading(true);
    const id = uuidv4();

    try {
      const variables = {
        product: {
          id,
          name: name.trim(),
          description: description.trim() || `A new ${effectiveType} based on your universe`,
          type: effectiveType,
          gameType: effectiveType === 'game' ? effectiveGameType : '',
          universeId: universeId || null
        }
      };

      const result = await addProduct({ variables });

      if (result.data) {
        const newProduct = {
          id,
          name: name.trim(),
          description: variables.product.description,
          type: effectiveType,
          gameType: effectiveType === 'game' ? effectiveGameType : '',
          universe: universeId ? universesData?.universes.find((u: any) => u.id === universeId)?.properties : null
        };

        onProductCreated(newProduct);
        resetForm();
        setOpen(false);
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('game');
    setCustomType('');
    setGameType('card');
    setCustomGameType('');
    setUniverseId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Create a game, book, or other media based on your universe IP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Eldoria: The Card Game"
              className="col-span-3"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the product"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Media Type
            </Label>
            <div className="col-span-3 space-y-2">
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
                <option value="other">Other...</option>
              </select>
              {type === 'other' && (
                <Input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Enter custom media type"
                />
              )}
            </div>
          </div>

          {effectiveType === 'game' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gameType" className="text-right">
                Game Type
              </Label>
              <div className="col-span-3 space-y-2">
                <select
                  id="gameType"
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {GAME_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'ttrpg' ? 'TTRPG' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                  <option value="other">Other...</option>
                </select>
                {gameType === 'other' && (
                  <Input
                    value={customGameType}
                    onChange={(e) => setCustomGameType(e.target.value)}
                    placeholder="Enter custom game type"
                  />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="universe" className="text-right">
              Universe
            </Label>
            <select
              id="universe"
              value={universeId}
              onChange={(e) => setUniverseId(e.target.value)}
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a universe...</option>
              {universesData?.universes.map((universe: any) => (
                <option key={universe.id} value={universe.id}>
                  {universe.properties.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !name.trim() ||
              loading ||
              (type === 'other' && !customType.trim()) ||
              (effectiveType === 'game' && gameType === 'other' && !customGameType.trim())
            }
          >
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
