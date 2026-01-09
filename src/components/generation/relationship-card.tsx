import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  RelationshipDefinition,
  getRelationshipTypesForEntity,
} from '@/lib/relationship-config';
import { Globe, MapPin, User, Package, Calendar } from 'lucide-react';

const ENTITY_ICONS: Record<string, React.ElementType> = {
  universe: Globe,
  place: MapPin,
  character: User,
  item: Package,
  event: Calendar,
};

const ENTITY_COLORS: Record<string, string> = {
  universe: 'text-purple-400',
  place: 'text-ck-teal',
  character: 'text-ck-rare',
  item: 'text-ck-gold',
  event: 'text-ck-ember',
};

interface RelationshipCardProps {
  relationship: RelationshipDefinition;
  onUpdate: (updated: RelationshipDefinition) => void;
  onRemove: () => void;
}

export function RelationshipCard({
  relationship,
  onUpdate,
  onRemove,
}: RelationshipCardProps) {
  const EntityIcon = ENTITY_ICONS[relationship.entityType] || User;
  const entityColor = ENTITY_COLORS[relationship.entityType] || 'text-muted-foreground';
  const relationshipTypes = getRelationshipTypesForEntity(relationship.entityType);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-purple-500/30 bg-purple-500/5">
      {/* Entity header */}
      <div className="flex items-center gap-2">
        <EntityIcon className={`h-4 w-4 ${entityColor}`} />
        <span className="font-medium text-sm flex-1 truncate">
          {relationship.entityName}
        </span>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Remove relationship"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Relationship type selector */}
      <div className="flex items-center gap-2">
        <Select
          value={relationship.relationshipType}
          onValueChange={(value) =>
            onUpdate({
              ...relationship,
              relationshipType: value,
              customLabel: value === 'custom' ? relationship.customLabel : undefined,
            })
          }
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder="Select relationship" />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-xs">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom label input - only shown when custom is selected */}
      {relationship.relationshipType === 'custom' && (
        <Input
          placeholder="Enter custom relationship..."
          value={relationship.customLabel || ''}
          onChange={(e) =>
            onUpdate({
              ...relationship,
              customLabel: e.target.value,
            })
          }
          className="h-8 text-xs"
        />
      )}
    </div>
  );
}
