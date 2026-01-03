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
  Box,
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
  'box': Box,
};

interface ConnectionSignalProps {
  lens: LensDefinition;
  count: number;
  onClick?: () => void;
}

export function ConnectionSignal({ lens, count, onClick }: ConnectionSignalProps) {
  if (count === 0) return null;

  const label = count === 1
    ? `1 ${lens.singularLabel}`
    : `${count} ${lens.label.toLowerCase()}`;

  const IconComponent = ICON_MAP[lens.icon];

  // Use div to avoid nested button issues when parent is also a button
  return (
    <div
      onClick={onClick}
      className={`
        inline-flex items-center gap-2.5 px-4 py-2 rounded-full
        text-base font-medium transition-all
        ${lens.color.bg} ${lens.color.text} ${lens.color.border}
        border hover:opacity-80 cursor-pointer
      `}
    >
      {IconComponent && <IconComponent className={`h-4 w-4 ${lens.color.text}`} />}
      <span className={`capitalize ${lens.color.text}`}>{label}</span>
    </div>
  );
}
