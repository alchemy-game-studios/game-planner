# Dashboard

## Overview

The dashboard is the main hub for authenticated users. It displays all universes (IP) and provides navigation to products and individual universe editing.

## Route

- **Path:** `/`
- **Access:** Protected (authenticated users only)
- **Component:** `src/pages/dashboard.tsx`

## Visual Design

- Dark theme with CanonKiln styling
- Large hero logo section at top
- Card-based layout for products and universes
- Fixed header with logo and user menu

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]                                    [User Menu ▼] │  ← Fixed header
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   [CanonKiln Logo]                      │  ← Hero section
│                      (large)                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ 📦 Products                                  →  │    │  ← Products link
│  │    X products - Games, books, and media...      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  IP Building                                            │
│  Create and manage your universes, characters...       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Universe Name                                   │    │
│  │ Description text...                             │    │
│  │ [type badge]                                    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Universe Name                                   │    │
│  │ Description text...                             │    │
│  │ [type badge]                                    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Logo (header) | Click | Navigates to Dashboard (current page) |
| User Menu | Click | Opens dropdown with account options |
| Products card | Click | Navigates to `/products` |
| Universe card | Click | Navigates to `/edit/universe/{id}` |

## Data Displayed

### Products Section
- Product count displayed in subtitle
- Purple-themed accent color (ck-rare)
- Arrow indicator for navigation

### Universes List
Each universe card shows:
- **Name** - Universe title
- **Description** - Brief description text
- **Type badge** - Optional type label (e.g., "Fantasy", "Sci-Fi")

## User Flow

```
Dashboard
    │
    ├──[Products Card]──→ Products List (/products)
    │
    ├──[Universe Card]──→ Entity Editor (/edit/universe/{id})
    │
    └──[User Menu]──→ Dropdown
                        ├──[Home]──→ Dashboard (current)
                        ├──[Billing]──→ Account (/account)
                        ├──[Credits]──→ Account (/account?tab=credits)
                        └──[Log out]──→ Landing Page (/)
```

## States

### Loading State
- Displays "Loading..." message
- Centered in viewport

### Error State
- Shows error message in red (destructive color)
- Displays error details in formatted JSON

### Empty State
- Products section shows "0 products"
- Universes section shows empty list (no special empty state UI)

### Data Loaded State
- Shows products count
- Lists all universes as clickable cards

## Behavior Notes

- Breadcrumbs are cleared when navigating to this page
- Hero logo section has padding to account for fixed header
- Cards have hover state with background color change
- Products card has arrow that animates on hover
