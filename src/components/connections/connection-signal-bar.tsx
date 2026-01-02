import React from 'react';
import { getLensesForType } from '@/lib/lens-config';
import { LensSection } from './lens-section';
import { Separator } from '@/components/ui/separator';
import { Network } from 'lucide-react';

interface ConnectionSignalBarProps {
  entity: any;
  entityType: string;
  entityId: string;
  universeId?: string;
  onRefetch: () => void;
}

export function ConnectionSignalBar({
  entity,
  entityType,
  entityId,
  universeId,
  onRefetch
}: ConnectionSignalBarProps) {
  const lenses = getLensesForType(entityType);

  if (lenses.length === 0) {
    return (
      <div className="text-muted-foreground text-sm text-center py-4">
        No connections available
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <Network className="h-5 w-5 text-ck-teal" />
        <h3 className="text-base font-semibold text-ck-bone">Connections</h3>
      </div>
      <Separator className="mb-2" />
      {lenses.map((lens, index) => (
        <React.Fragment key={lens.id}>
          <LensSection
            lens={lens}
            entity={entity}
            parentId={entityId}
            parentType={entityType}
            universeId={universeId}
            onRefetch={onRefetch}
          />
          {index < lenses.length - 1 && (
            <Separator className="my-1 opacity-50" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
