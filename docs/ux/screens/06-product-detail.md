# Product Detail

## Overview

The product detail page shows comprehensive information about a single product, including its attributes, mechanics, components (adaptations), and sections. The available tabs vary based on product type.

## Route

- **Path:** `/product/:id`
- **Access:** Protected (authenticated users only)
- **Component:** `src/pages/product.tsx`

## Visual Design

- Tabbed interface for organizing different product aspects
- Gradient "generate" buttons with credit cost indicators
- Card-based layout for attributes, mechanics, and adaptations
- Badge-based value displays

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ Product Name                                   [Edit]   │
│ Description text...                                     │
│ [Card Game]    Based on: Universe Name                  │
├─────────────────────────────────────────────────────────┤
│  [Overview] [Attributes (3)] [Mechanics (5)]            │
│  [Components (12)] [Sections (8)]                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tab Content - see sections below]                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ← Back to Products                                     │
└─────────────────────────────────────────────────────────┘
```

## Tab Visibility by Product Type

| Tab | Games | Books/Movies/Comics | Other |
|-----|-------|---------------------|-------|
| Overview | Yes | Yes | Yes |
| Attributes | Yes | No | No |
| Mechanics | Yes | No | No |
| Components | Yes | Yes | Yes |
| Sections | No | Yes | No |

---

## Overview Tab

Shows summary statistics for the product.

### Layout (Games)

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    Attributes    │ │    Mechanics     │ │    Components    │
│        12        │ │        8         │ │        45        │
│ User-defined     │ │ Keywords &       │ │ IP entities      │
│ stats            │ │ abilities        │ │ mapped           │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Layout (Books/Movies/Comics)

```
┌──────────────────┐ ┌──────────────────┐
│    Components    │ │     Sections     │
│        45        │ │        12        │
│ IP entities      │ │ Chapters/scenes  │
│ mapped           │ │                  │
└──────────────────┘ └──────────────────┘
```

---

## Attributes Tab (Games Only)

Defines the stats/properties that game components can have.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Attribute Definitions        [✨ Attribute 🪙5] [+ Add] │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Power                              [number]      │   │
│  │ The attack strength of a character              │   │
│  │ Range: 1 - 10                                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Element                              [enum]      │   │
│  │ The elemental affinity                          │   │
│  │ Options: Fire, Water, Earth, Air                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Attribute Types

| Value Type | Display |
|------------|---------|
| number | Shows range (min - max) |
| enum | Shows available options |
| text | No additional info |
| boolean | No additional info |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Generate Attribute button | Click | AI generates attribute (costs 5 credits) |
| Add button | Click | Opens manual attribute creation form |

---

## Mechanics Tab (Games Only)

Defines the keywords/abilities that can be applied to components.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Mechanic Definitions         [✨ Mechanic 🪙10] [+ Add] │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Flying                  [movement] [has value]   │   │
│  │ This creature can attack flying targets         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Haste                           [keyword]        │   │
│  │ Can attack immediately when played              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Generate Mechanic button | Click | AI generates mechanic (costs 10 credits) |
| Add button | Click | Opens manual mechanic creation form |

---

## Components Tab (All Product Types)

Shows entity adaptations - how IP entities (characters, places, items) are represented in this product.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Components               [✨ Component 🪙30] [+ Add]    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │ Warrior of Light              [character]        │   │
│  │ from: Aethric the Brave                         │   │
│  │                                                 │   │
│  │ "In darkest hour, light prevails"               │   │
│  │                                                 │   │
│  │ [Power: 7] [Defense: 4] [Flying] [Haste: 2]     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Crystal Caverns                   [place]        │   │
│  │ from: The Shimmering Caves                      │   │
│  │                                                 │   │
│  │ [Defense: 8] [Healing]                          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Display

| Field | Description |
|-------|-------------|
| Card Name | Display name in the product (can differ from source) |
| Source Entity | Link to original IP entity |
| Source Type | character, place, item, event |
| Flavor Text | Italicized quote text |
| Attribute Values | Badges showing stat values |
| Mechanic Values | Badges showing keywords (purple) |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Generate Component button | Click | AI generates component (costs 30 credits) |
| Add button | Click | Opens manual component creation form |
| Source entity link | Click | Navigates to `/edit/{type}/{id}` |

---

## Sections Tab (Books, Movies, Comics)

Organizes the narrative structure of passive media products.

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Sections                    [✨ Section 🪙15] [+ Add]   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │  1  The Beginning                     [chapter]  │   │
│  │     Introduction to the world and characters    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  2  Rising Tension                  [chapter]    │   │
│  │     The conflict begins to emerge               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  3  The Confrontation               [climax]     │   │
│  │     Heroes face the main challenge              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Generate Section button | Click | AI generates section (costs 15 credits) |
| Add button | Click | Opens manual section creation form |

---

## Generation Credit Costs

| Entity Type | Credit Cost |
|-------------|-------------|
| Attribute | 5 credits |
| Mechanic | 10 credits |
| Section | 15 credits |
| Component/Adaptation | 30 credits |

## States

### Loading State
- Shows "Loading..." message

### Error State
- Shows error message

### Not Found State
- Shows "Product not found" message

### Empty States (per tab)
- "No attributes defined yet"
- "No mechanics defined yet"
- "No adaptations yet"
- "No sections defined yet"

## User Flow

```
Product Detail
      │
      ├──[Tab Navigation]──→ Switch between tabs
      │
      ├──[Generate Button]──→ AI generation (deducts credits)
      │
      ├──[Add Button]──→ Manual creation form
      │
      ├──[Source Entity Link]──→ Entity Editor (/edit/{type}/{id})
      │
      ├──[Universe Link]──→ Universe Editor (/edit/universe/{id})
      │
      ├──[Edit Button]──→ (Not fully implemented)
      │
      └──[Back to Products]──→ Products List (/products)
```

## Behavior Notes

- Breadcrumbs show: Products → Product Name
- Tabs show counts in parentheses
- Generate buttons have gradient styling and show credit costs
- Components can have a different display name (cardName) than their source entity
- Sections are sorted by order number
- Attribute/mechanic badges on components are color-coded
