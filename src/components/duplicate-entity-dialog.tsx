import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Loader2 } from "lucide-react";

const DUPLICATE_ENTITY = gql`
  mutation DuplicateEntity($input: DuplicateEntityInput!) {
    duplicateEntity(input: $input) {
      entity {
        id
        properties {
          id
          name
          description
          type
        }
      }
      message
    }
  }
`;

interface DuplicateEntityDialogProps {
  entityId: string;
  entityName: string;
  entityType: string;
  trigger?: React.ReactNode;
}

export function DuplicateEntityDialog({
  entityId,
  entityName,
  entityType,
  trigger
}: DuplicateEntityDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(`Copy of ${entityName}`);
  const [copyTags, setCopyTags] = useState(true);
  const [copyRelationships, setCopyRelationships] = useState(false);

  const [duplicateEntity, { loading, error }] = useMutation(DUPLICATE_ENTITY, {
    onCompleted: (data) => {
      setOpen(false);
      // Navigate to the new entity
      const newId = data.duplicateEntity.entity.id;
      navigate(`/${entityType}/${newId}`);
    }
  });

  const handleDuplicate = async () => {
    await duplicateEntity({
      variables: {
        input: {
          sourceEntityId: entityId,
          newName: newName.trim() || undefined,
          copyTags,
          copyRelationships
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Duplicate Entity</DialogTitle>
          <DialogDescription>
            Create a copy of "{entityName}" with the same properties.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="newName">New Name</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Copy of ${entityName}`}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copyTags"
              checked={copyTags}
              onCheckedChange={(checked) => setCopyTags(checked as boolean)}
            />
            <Label htmlFor="copyTags" className="text-sm font-normal">
              Copy tags
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="copyRelationships"
              checked={copyRelationships}
              onCheckedChange={(checked) => setCopyRelationships(checked as boolean)}
            />
            <Label htmlFor="copyRelationships" className="text-sm font-normal">
              Copy relationships (knows, owns, etc.)
            </Label>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error.message || 'Failed to duplicate entity'}
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
