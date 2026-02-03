import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntitySearch } from '@/components/entity-search';
import { RELATIONSHIP_TYPES, getRelationshipTypesForEntity } from '@/lib/relationship-config';

const CREATE_RELATIONSHIP = gql`
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      message
    }
  }
`;

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: string;
  universeId?: string;
  onAdded: () => void;
}

// Entity types that can be relationship targets
const TARGET_TYPES = ['place', 'character', 'item', 'event', 'narrative'];

export function AddRelationshipDialog({
  open,
  onOpenChange,
  entityId,
  entityType,
  universeId,
  onAdded,
}: AddRelationshipDialogProps) {
  const [step, setStep] = useState<'type' | 'entity'>('type');
  const [targetType, setTargetType] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<string>('');
  const [customLabel, setCustomLabel] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [createRelationship] = useMutation(CREATE_RELATIONSHIP);

  const relationshipOptions = targetType ? getRelationshipTypesForEntity(targetType) : [];

  const handleTargetTypeChange = (type: string) => {
    setTargetType(type);
    setRelationshipType('');
    setCustomLabel('');
  };

  const handleRelationshipTypeChange = (type: string) => {
    setRelationshipType(type);
    if (type !== 'custom') {
      setCustomLabel('');
    }
  };

  const handleNext = () => {
    if (targetType && relationshipType) {
      setStep('entity');
    }
  };

  const handleBack = () => {
    setStep('type');
    setSelectedEntity(null);
  };

  const handleEntitySelect = (entity: any) => {
    setSelectedEntity(entity);
  };

  const handleCreate = async () => {
    if (!selectedEntity) return;

    setIsCreating(true);
    try {
      await createRelationship({
        variables: {
          input: {
            sourceId: entityId,
            targetId: selectedEntity.id || selectedEntity.properties?.id,
            relationshipType: relationshipType.toUpperCase(),
            customLabel: relationshipType === 'custom' ? customLabel : undefined,
          },
        },
      });

      // Reset and close
      resetForm();
      onAdded();
    } catch (error) {
      console.error('Failed to create relationship:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setTargetType('');
    setRelationshipType('');
    setCustomLabel('');
    setSelectedEntity(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'Add Relationship' : 'Select Entity'}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          <div className="space-y-4 py-4">
            {/* Target entity type */}
            <div className="space-y-2">
              <Label>What type of entity?</Label>
              <Select value={targetType} onValueChange={handleTargetTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type..." />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Relationship type */}
            {targetType && (
              <div className="space-y-2">
                <Label>What's the relationship?</Label>
                <Select value={relationshipType} onValueChange={handleRelationshipTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship..." />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom label input */}
            {relationshipType === 'custom' && (
              <div className="space-y-2">
                <Label>Custom relationship label</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g., Mentor of, Rival to..."
                />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleNext}
                disabled={!targetType || !relationshipType || (relationshipType === 'custom' && !customLabel)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <EntitySearch
              universeId={universeId}
              entityType={targetType}
              excludeId={entityId}
              onSelect={handleEntitySelect}
              placeholder={`Search for ${targetType}...`}
            />

            {selectedEntity && (
              <div className="p-3 rounded-lg border border-purple-500/30 bg-card">
                <p className="font-medium">
                  {selectedEntity.properties?.name || selectedEntity.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {relationshipOptions.find(o => o.value === relationshipType)?.label || customLabel}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!selectedEntity || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Relationship'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
