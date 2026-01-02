// Lens configuration for progressive navigation
// Each entity type has specific lenses for viewing connected content

export interface LensDefinition {
  id: string;
  label: string;
  singularLabel: string;
  entityTypes: string[];
  dataKey: string; // Key in entity data to filter from
  filter?: (entity: any) => boolean;
  isSingleEntity?: boolean; // True if dataKey returns a single entity instead of array
  color: {
    bg: string;
    text: string;
    border: string;
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
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
    },
    {
      id: 'places',
      label: 'Places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' }
    },
    {
      id: 'characters',
      label: 'Characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'character',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' }
    },
    {
      id: 'items',
      label: 'Items',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'item',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30' }
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
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' }
    },
    {
      id: 'items',
      label: 'Items here',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'item',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30' }
    },
    {
      id: 'places',
      label: 'Nearby places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' }
    },
    {
      id: 'events',
      label: 'Events',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'events',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
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
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30' }
    },
    {
      id: 'places',
      label: 'Associated places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' }
    },
    {
      id: 'characters',
      label: 'Connected characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'character',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' }
    },
    {
      id: 'events',
      label: 'Events',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'events',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
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
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' }
    },
    {
      id: 'places',
      label: 'Found at',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'allContents',
      filter: (e) => e._nodeType === 'place',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' }
    },
    {
      id: 'events',
      label: 'Appears in',
      singularLabel: 'event',
      entityTypes: ['event'],
      dataKey: 'events',
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
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
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
    },
    {
      id: 'characters',
      label: 'Key characters',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'character',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' }
    },
    {
      id: 'places',
      label: 'Key places',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'locations',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' }
    },
    {
      id: 'items',
      label: 'Key items',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'item',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30' }
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
      color: { bg: 'bg-ck-ember/20', text: 'text-ck-ember', border: 'border-ck-ember/30' }
    },
    {
      id: 'characters',
      label: 'Characters involved',
      singularLabel: 'character',
      entityTypes: ['character'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'character',
      color: { bg: 'bg-ck-rare/20', text: 'text-ck-rare', border: 'border-ck-rare/30' }
    },
    {
      id: 'items',
      label: 'Items involved',
      singularLabel: 'item',
      entityTypes: ['item'],
      dataKey: 'participants',
      filter: (e) => e._nodeType === 'item',
      color: { bg: 'bg-ck-gold/20', text: 'text-ck-gold', border: 'border-ck-gold/30' }
    },
    {
      id: 'places',
      label: 'Locations',
      singularLabel: 'place',
      entityTypes: ['place'],
      dataKey: 'locations',
      color: { bg: 'bg-ck-teal/20', text: 'text-ck-teal', border: 'border-ck-teal/30' }
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
