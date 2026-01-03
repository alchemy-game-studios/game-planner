# Entity Editor

## Overview

The entity editor is a universal editing interface for all IP entity types: Universe, Place, Character, Item, Event, and Narrative. It provides a consistent editing experience while adapting to entity-specific features.

## Route

- **Path:** `/edit/:type/:id`
- **Access:** Protected (authenticated users only)
- **Component:** `src/pages/edit-entity.tsx` → `src/client-graphql/edit-entity/edit-entity-component.jsx`

## Supported Entity Types

| Type | Description |
|------|-------------|
| Universe | Top-level game world container |
| Place | Locations within a universe |
| Character | Characters that inhabit places |
| Item | Items that belong to characters |
| Event | Timeline events in a narrative |
| Narrative | Story containers with events |

## Visual Design

- Faded background image from entity's hero image
- Fixed header with avatar and entity name
- Split layout: main content (left) + related entities sidebar (right)
- Auto-saving with debounced updates

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Avatar] Entity Name                    [Universe Badge]│  ← Fixed header
│ ─────────────────────────────────────────────────────── │
├──────────────────────────────────────────┬──────────────┤
│                                          │              │
│  ┌────────────────────────────────────┐  │  Narratives  │
│  │     Image Gallery                  │  │  ├ Story 1   │
│  │     (hero image, thumbnails)       │  │  └ Story 2   │
│  │                                    │  │              │
│  └────────────────────────────────────┘  │  Places      │
│                                          │  ├ Place 1   │
│  [Tag 1] [Tag 2] [+ Add Tag]             │  └ Place 2   │
│                                          │              │
│  Part of: Narrative Name (events only)   │  Characters  │
│  [Day 3] (events only)                   │  ├ Char 1    │
│                                          │  └ Char 2    │
│  Locations: [Place 1] [Place 2]          │              │
│  (events only)                           │  Items       │
│                                          │  ├ Item 1    │
│  Participants: [Char 1] [Item 1]         │  └ Item 2    │
│  (events only)                           │              │
│                                          │              │
│  Description text here...                │              │
│  (editable on hover)                     │              │
│                                          │              │
└──────────────────────────────────────────┴──────────────┘
```

---

## Header Section

### Components

| Element | Description |
|---------|-------------|
| Avatar | Entity's avatar image (or placeholder) |
| Name | Hover-to-edit entity name |
| Type Badge | Entity type label (Universe, Place, etc.) |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Entity name | Hover → Click | Enables inline editing |
| Entity name | Type + blur/tab | Auto-saves changes |

---

## Image Gallery

Located in the main content area, allows managing entity images.

### Features

- Displays hero image prominently
- Shows thumbnail grid of all images
- Shows inherited images from related entities (allImages)
- Upload new images
- Set hero/avatar image selection
- Delete images

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Upload button | Click | Opens file picker |
| Image thumbnail | Click | Selects as hero/avatar |
| Delete button | Click | Removes image from entity |

---

## Tag Pills

Displays and manages tags associated with the entity.

### Layout

```
[Fantasy ×] [Magic ×] [Dark ×] [+ Add Tag]
```

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Tag pill (×) | Click | Removes tag from entity |
| Add Tag button | Click | Opens tag selector/creator |

---

## Event-Specific Elements

These elements only appear when editing Event entities.

### Parent Narrative Link

```
Part of: The Great War
```

- Clickable link to parent narrative

### Day Badge

```
[Day 3]
```

- Shows timeline position of the event

### Locations

```
Locations
[Crystal Caverns] [The Dark Forest]
```

- Color-coded pills (teal)
- Clickable links to place entities

### Participants

```
Participants
[Aethric] (Character) [Sword of Light] (Item)
```

- Color-coded pills (purple for characters, gold for items)
- Clickable links to character/item entities

---

## Narrative-Specific Elements

These elements only appear when editing Narrative entities.

### Story-Styled Description

- Serif font, italic styling
- Larger text with leading
- Left border accent

### Aggregated Locations

Shows all places referenced across the narrative's events.

```
Places in this Story
[Location 1] [Location 2] [Location 3]
```

### Aggregated Participants

Shows all characters and items participating in events.

```
Characters & Items
[Character 1] (Character) [Item 1] (Item)
```

---

## Description Section

### Edit Mode

- Multiline textarea
- Hover-to-edit activation
- Debounced auto-save (500ms delay)

### View Mode

- Regular entities: Standard text display
- Narratives: Styled story text with serif font and italic styling

---

## Related Entities Sidebar

Right-side panel showing hierarchical relationships.

### Layout

```
Narratives (5)
├─ [Collapse/Expand]
├─ Story Name 1
├─ Story Name 2
└─ Show all...

Places (3)
├─ Location 1
└─ Location 2

Characters (8)
├─ Character 1
├─ Character 2
├─ Character 3
└─ Show all...

Items (4)
└─ Item 1
```

### Entity Type Sections

Each section shows up to 5 items by default, with expansion.

| Section | Shown For | Description |
|---------|-----------|-------------|
| Narratives | Universe | Stories in this universe |
| Events | Narrative | Timeline events in this story |
| Places | Universe, Narrative | Locations in this world/story |
| Characters | Universe, Place, Narrative | Characters in this context |
| Items | Universe, Place, Character, Narrative | Items in this context |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Entity name | Click | Navigates to that entity's edit page |
| Add button | Click | Opens dialog to create new child entity |
| Show all | Click | Expands to show all items |

### Empty State

```
No related entities
```

---

## Auto-Save Behavior

The entity editor uses debounced auto-saving:

1. User types in name or description
2. 500ms debounce timer starts
3. After debounce, entity state updates
4. Change detection triggers GraphQL mutation
5. Data is saved to backend

```
User Types → [500ms delay] → State Update → Change Detection → Save
```

---

## States

### Loading State
- Initial fetch while loading entity data

### Not Found State
- Entity with given ID doesn't exist

### Edit Mode
- Hover-editable text fields active
- Full editing capabilities

### View Mode
- Read-only display
- Styled differently for narratives

---

## User Flow

```
Entity Editor
      │
      ├──[Edit Name]──→ Debounced auto-save
      │
      ├──[Edit Description]──→ Debounced auto-save
      │
      ├──[Upload Image]──→ Image Gallery update
      │
      ├──[Add/Remove Tag]──→ Tag relationship update
      │
      ├──[Click Related Entity]──→ Navigate to /edit/{type}/{id}
      │
      ├──[Add Child Entity]──→ Create new entity + relationship
      │
      ├──[Click Location/Participant]──→ Navigate to related entity
      │
      └──[Click Parent Narrative]──→ Navigate to /edit/narrative/{id}
```

---

## Breadcrumb Behavior

- Entity is pushed to breadcrumb trail on load
- Creates navigable path through entity hierarchy
- Cleared when returning to main pages (Dashboard, Products)

## Behavior Notes

- Background image fades based on entity's hero image
- Avatar uses entity's avatar image or placeholder
- All edits auto-save via GraphQL mutations
- Debounced saves prevent excessive API calls
- Related entities show `allContents` (descendants at all depths)
- Images include inherited images from related entities
