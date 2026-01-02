import React from 'react';
import { LensDefinition, LensIcon } from '@/lib/lens-config';
import {
  BookOpen,
  MapPin,
  Users,
  Package,
  Calendar,
  Swords,
  Home,
  User,
  Backpack,
  Scroll,
  LucideIcon
} from 'lucide-react';

// Map icon names to Lucide components
const ICON_MAP: Record<LensIcon, LucideIcon> = {
  'book-open': BookOpen,
  'map-pin': MapPin,
  'users': Users,
  'package': Package,
  'calendar': Calendar,
  'swords': Swords,
  'home': Home,
  'user': User,
  'backpack': Backpack,
  'scroll': Scroll,
};

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

  const IconComponent = ICON_MAP[lens.icon];

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
      {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </button>
  );
}
