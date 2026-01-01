import React from 'react';
import { LensDefinition } from '@/lib/lens-config';

interface ConnectionSignalProps {
  lens: LensDefinition;
  count: number;
  onClick: () => void;
}

export function ConnectionSignal({ lens, count, onClick }: ConnectionSignalProps) {
  if (count === 0) return null;

  const label = count === 1
    ? `1 ${lens.singularLabel}`
    : `${count} ${lens.label.toLowerCase()}`;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-sm font-medium transition-all
        ${lens.color.bg} ${lens.color.text} ${lens.color.border}
        border hover:opacity-80 cursor-pointer
      `}
    >
      <span>{label}</span>
    </button>
  );
}
