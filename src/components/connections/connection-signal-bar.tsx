import React from 'react';
import { getLensesForType } from '@/lib/lens-config';
import { LensSection } from './lens-section';
import { Separator } from '@/components/ui/separator';

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
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Connections</h3>
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
