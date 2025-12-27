import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
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
import { capitalizeFirst } from '../client-graphql/util';
import { getCreateMutation } from '../utils/graphql-utils';

interface AddEntityDialogProps {
  entityType: 'place' | 'character' | 'item' | 'tag' | 'event' | 'narrative';
  onEntityCreated: (entity: any) => void;
  triggerButton?: boolean;
}

const getDefaultDescription = (type: string, name: string) => {
  const descriptions = {
    place: `A new location called ${name}`,
    character: `A new character named ${name}`,
    item: `A new item called ${name}`,
    tag: `A tag for ${name}`,
    event: `A new event: ${name}`,
    narrative: `A new narrative: ${name}`
  };
  return descriptions[type] || `A new ${type} called ${name}`;
};

export const AddEntityDialog: React.FC<AddEntityDialogProps> = ({ 
  entityType, 
  onEntityCreated,
  triggerButton = true
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const mutation = getCreateMutation(entityType);
  const [createEntity] = useMutation(mutation);
  
  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    const id = uuidv4();
    const description = getDefaultDescription(entityType, name);
    
    console.log('Creating entity:', entityType, 'with data:', { id, name: name.trim(), description, type: entityType });
    
    try {
      const variables = {
        [entityType]: {
          id,
          name: name.trim(),
          description,
          type: entityType
        }
      };
      
      console.log('Mutation variables:', variables);
      const result = await createEntity({ variables });
      console.log('Mutation result:', result);
      
      if (result.data) {
        const newEntity = {
          id,
          properties: {
            id,
            name: name.trim(),
            description,
            type: entityType
          }
        };
        
        console.log('Calling onEntityCreated with:', newEntity);
        onEntityCreated(newEntity);
        setName('');
        setOpen(false);
      } else {
        console.error('No data in result:', result);
      }
    } catch (error) {
      console.error('Error creating entity:', error);
      alert(`Error creating ${entityType}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const trigger = triggerButton ? (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Add {capitalizeFirst(entityType)}
    </Button>
  ) : (
    <button className="inline-flex items-center text-sm text-gray-400 hover:text-white">
      <Plus className="h-4 w-4 mr-1" />
      Create new {entityType}
    </button>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New {capitalizeFirst(entityType)}</DialogTitle>
          <DialogDescription>
            Create a new {entityType} that will be associated with this entity.
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleCreate();
                }
              }}
              placeholder={`Enter ${entityType} name`}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!name.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};