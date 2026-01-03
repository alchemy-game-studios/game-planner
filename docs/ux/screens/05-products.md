# Products List

## Overview

The products list page displays all products (games, books, movies, etc.) created from the user's universes. Users can browse existing products and create new ones.

## Route

- **Path:** `/products`
- **Access:** Protected (authenticated users only)
- **Component:** `src/pages/products.tsx`

## Visual Design

- Card-based list layout
- Color-coded type badges (purple for games, teal for books, etc.)
- Consistent dark theme styling

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ Products                           [+ New Product]      │
│ Games, books, and media based on your universes        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Product Name                      [Card Game]    │   │
│  │ Description text...                              │   │
│  │ Based on: Universe Name                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Product Name                           [Book]    │   │
│  │ Description text...                              │   │
│  │ Based on: Universe Name                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  ← Back to IP Building                                  │
└─────────────────────────────────────────────────────────┘
```

## Product Type Badges

| Type | Sub-Type | Label | Color |
|------|----------|-------|-------|
| game | card | Card Game | Purple (ck-rare) |
| game | board | Board Game | Purple (ck-rare) |
| game | ttrpg | TTRPG | Purple (ck-rare) |
| game | video | Video Game | Purple (ck-rare) |
| book | - | Book | Teal (ck-teal) |
| movie | - | Movie | Red (ck-danger) |
| comic | - | Comic | Gold (ck-gold) |

## User Interactions

| Element | Action | Result |
|---------|--------|--------|
| New Product button | Click | Opens Add Product dialog |
| Product card | Click | Navigates to `/product/{id}` |
| Back to IP Building | Click | Navigates to Dashboard (`/`) |

---

## Add Product Dialog

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Create New Product                              [X]     │
│ Create a game, book, or other media based on your      │
│ universe IP.                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│        Name  ┌─────────────────────────────────┐        │
│              │ e.g., Eldoria: The Card Game    │        │
│              └─────────────────────────────────┘        │
│                                                         │
│ Description  ┌─────────────────────────────────┐        │
│              │ Brief description...            │        │
│              └─────────────────────────────────┘        │
│                                                         │
│  Media Type  ┌─────────────────────────────────┐        │
│              │ Game                          ▼ │        │
│              └─────────────────────────────────┘        │
│                                                         │
│   Game Type  ┌─────────────────────────────────┐        │
│   (if game)  │ Card                          ▼ │        │
│              └─────────────────────────────────┘        │
│                                                         │
│    Universe  ┌─────────────────────────────────┐        │
│              │ Select a universe...          ▼ │        │
│              └─────────────────────────────────┘        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                        [Cancel]    [Create Product]     │
└─────────────────────────────────────────────────────────┘
```

### Form Fields

| Field | Required | Options |
|-------|----------|---------|
| Name | Yes | Text input |
| Description | No | Text input (auto-generates if empty) |
| Media Type | Yes | game, book, movie, comic, tv series, podcast, music, other |
| Game Type | Yes (if game) | card, board, ttrpg, video, mobile, party, miniatures, dice, other |
| Universe | No | Dropdown of user's universes |

### Custom Type Support
- Selecting "Other" for Media Type shows a custom text input
- Selecting "Other" for Game Type shows a custom text input

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Cancel button | Click | Closes dialog without creating |
| Create Product button | Click | Creates product, closes dialog, navigates to product page |
| Media Type dropdown | Change to "game" | Shows Game Type dropdown |
| Media Type dropdown | Change to other | Hides Game Type dropdown |

---

## States

### Loading State
- Shows "Loading..." message

### Error State
- Shows error message in red
- Displays error details

### Empty State
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  No products yet                        │
│                                                         │
│  Create a product to start building games, books,       │
│  or other media from your universes.                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Loaded State
- Shows list of product cards
- Each card is clickable

## User Flow

```
Products List
      │
      ├──[New Product]──→ Add Product Dialog
      │                         │
      │                    [Create]
      │                         │
      │                         ▼
      │                   Product Detail (/product/{id})
      │
      ├──[Product Card]──→ Product Detail (/product/{id})
      │
      └──[Back to IP]──→ Dashboard (/)
```

## Behavior Notes

- Breadcrumbs are cleared when navigating to this page
- After creating a product, user is automatically navigated to the new product's detail page
- Product list is refetched after creating a new product
- Universe association is optional - products can exist without a source universe
