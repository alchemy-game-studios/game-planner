// Lens configuration for progressive navigation
// Each entity type has specific lenses for viewing connected content

// Icon names from Lucide - resolved at render time
export type LensIcon =
  | 'book-open'
  | 'map-pin'
  | 'users'
  | 'package'
  | 'calendar'
  | 'swords'
  | 'home'
  | 'user'
  | 'backpack'
  | 'scroll'
  | 'box';

export interface LensDefinition {
  id: string;
  label: string;
  singularLabel: string;
  entityTypes: string[];
  dataKey: string; // Key in entity data to filter from
  filter?: (entity: any) => boolean;
  isSingleEntity?: boolean; // True if dataKey returns a single entity instead of array
  icon: LensIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    ring: string;
  };
}

export const LENS_CONFIG: Record<string, LensDefinition[]> = {
  universe: [
    {
      id: 'narratives',
      label: 'Narratives',
      singularLabel: 'narrative',
      entityTypes: ['narrative'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'narrative',
      icon: 'book-open',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30', ring: 'ring-ck-ember' }
    },
    {
      id: 'places',
      label: 'Places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      icon: 'map-pin',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30', ring: 'ring-ck-teal' }
    },
    {
      id: 'characters',
      label: 'Characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'character',
      icon: 'users',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30', ring: 'ring-ck-rare' }
    },
    {
      id: 'items',
      label: 'Items',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'item',
      icon: 'package',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30', ring: 'ring-ck-gold' }
    }
  ],

  place: [
    {
      id: 'characters',
      label: 'Characters here',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'character',
      icon: 'users',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30', ring: 'ring-ck-rare' }
    },
    {
      id: 'items',
      label: 'Items here',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'item',
      icon: 'package',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30', ring: 'ring-ck-gold' }
    },
    {
      id: 'places',
      label: 'Nearby places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      icon: 'map-pin',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30', ring: 'ring-ck-teal' }
    },
    {
      id: 'events',
      label: 'Events',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'events',
      icon: 'calendar',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30', ring: 'ring-ck-ember' }
    }
  ],

  character: [
    {
      id: 'items',
      label: 'Items owned',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'item',
      icon: 'backpack',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30', ring: 'ring-ck-gold' }
    },
    {
      id: 'places',
      label: 'Associated places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      icon: 'map-pin',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30', ring: 'ring-ck-teal' }
    },
    {
      id: 'characters',
      label: 'Connected characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'character',
      icon: 'users',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30', ring: 'ring-ck-rare' }
    },
    {
      id: 'events',
      label: 'Events',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'events',
      icon: 'calendar',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30', ring: 'ring-ck-ember' }
    }
  ],

  item: [
    {
      id: 'characters',
      label: 'Owned by',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'character',
      icon: 'user',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30', ring: 'ring-ck-rare' }
    },
    {
      id: 'places',
      label: 'Found at',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      icon: 'map-pin',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30', ring: 'ring-ck-teal' }
    },
    {
      id: 'events',
      label: 'Appears in',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'events',
      icon: 'calendar',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30', ring: 'ring-ck-ember' }
    }
  ],

  narrative: [
    {
      id: 'events',
      label: 'Events',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'event',
      icon: 'calendar',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30', ring: 'ring-ck-ember' }
    },
    {
      id: 'characters',
      label: 'Key characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'character',
      icon: 'users',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30', ring: 'ring-ck-rare' }
    },
    {
      id: 'places',
      label: 'Key places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'locations',
      icon: 'map-pin',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30', ring: 'ring-ck-teal' }
    },
    {
      id: 'items',
      label: 'Key items',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'item',
      icon: 'package',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30', ring: 'ring-ck-gold' }
    }
  ],

  event: [
    {
      id: 'narrative',
      label: 'Part of Narrative',
      singularLabel: 'narrative',
      entityTypes: ['narrative'],
      dataKey: 'parentNarrative',
      isSingleEntity: true,
      icon: 'book-open',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30', ring: 'ring-ck-ember' }
    },
    {
      id: 'characters',
      label: 'Characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'character',
      icon: 'swords',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30', ring: 'ring-ck-rare' }
    },
    {
      id: 'items',
      label: 'Items',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'item',
      icon: 'package',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30', ring: 'ring-ck-gold' }
    },
    {
      id: 'places',
      label: 'Locations',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'locations',
      icon: 'map-pin',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30', ring: 'ring-ck-teal' }
    }
  ]
};

export function getLensesForType(entityType: string): LensDefinition[] {
  return LENS_CONFIG[entityType.toLowerCase()] || [];
}

export function getLensData(entity: any, lens: LensDefinition): any[] {
  const rawData = entity[lens.dataKey];

  // Handle single entity relationships (wrap in array)
  if (lens.isSingleEntity) {
    return rawData ? [rawData] : [];
  }

  const data = rawData || [];

  if (lens.filter) {
    return data.filter(lens.filter);
  }

  return data;
}
