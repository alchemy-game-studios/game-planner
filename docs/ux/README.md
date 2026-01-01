# CanonKiln UX Documentation

This directory contains comprehensive documentation of all user experience flows and screens in the CanonKiln application.

## Application Overview

CanonKiln is a platform for transforming creative IP (intellectual property) into games, books, and other media. Users build universes with interconnected characters, places, and stories, then adapt that IP into products like card games, board games, and books.

---

## Screen Documentation

| Screen | Route | Description |
|--------|-------|-------------|
| [Landing Page](./screens/01-landing.md) | `/` | Public marketing page for unauthenticated users |
| [Dashboard](./screens/02-dashboard.md) | `/` | Main hub for authenticated users |
| [Login](./screens/03-login.md) | `/login` | Google OAuth authentication |
| [Account Settings](./screens/04-account.md) | `/account` | Profile, subscription, credits, billing history |
| [Products List](./screens/05-products.md) | `/products` | Browse and create products |
| [Product Detail](./screens/06-product-detail.md) | `/product/:id` | View/edit product attributes, mechanics, components |
| [Entity Editor](./screens/07-entity-editor.md) | `/edit/:type/:id` | Universal editor for IP entities |
| [Payment Modal](./screens/08-payment-modal.md) | (overlay) | Stripe payment processing |
| [Navigation](./screens/09-navigation.md) | (components) | Breadcrumbs and user menu |

---

## Information Architecture

### Entity Hierarchy

```
Universe
├── Narrative (stories)
│   └── Event (timeline moments)
│       ├── Location (places referenced)
│       └── Participants (characters, items)
├── Place (locations)
│   └── Character (inhabitants)
│       └── Item (possessions)
└── Tag (labels for any entity)
```

### Product Structure

```
Product
├── Attributes (stats/properties for games)
├── Mechanics (keywords/abilities for games)
├── Components/Adaptations (IP → product mapping)
└── Sections (chapters for books/movies)
```

---

## User Flows

### Authentication Flow

```
┌──────────┐     ┌─────────────┐     ┌───────────────┐
│ Landing  │────▶│ Google OAuth │────▶│   Dashboard   │
└──────────┘     └─────────────┘     └───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Login     │  (on failure)
                  │  (w/error)  │
                  └─────────────┘
```

### IP Building Flow

```
┌───────────┐     ┌──────────┐     ┌───────────┐     ┌──────────┐
│ Dashboard │────▶│ Universe │────▶│   Place   │────▶│ Character│
└───────────┘     └──────────┘     └───────────┘     └──────────┘
                        │                                   │
                        ▼                                   ▼
                  ┌───────────┐                       ┌──────────┐
                  │ Narrative │                       │   Item   │
                  └───────────┘                       └──────────┘
                        │
                        ▼
                  ┌───────────┐
                  │   Event   │
                  └───────────┘
```

### Product Creation Flow

```
┌───────────┐     ┌──────────────┐     ┌────────────────┐
│ Dashboard │────▶│ Products List│────▶│ Add Product    │
└───────────┘     └──────────────┘     │ Dialog         │
                                       └────────────────┘
                                              │
                                              ▼
                                       ┌────────────────┐
                                       │ Product Detail │
                                       └────────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                  ┌────────────┐       ┌────────────┐       ┌────────────┐
                  │ Attributes │       │ Mechanics  │       │ Components │
                  └────────────┘       └────────────┘       └────────────┘
```

### Account & Billing Flow

```
┌───────────┐     ┌───────────────┐     ┌───────────────┐
│ User Menu │────▶│ Account Page  │────▶│ Subscription  │
└───────────┘     └───────────────┘     │ Tab           │
                         │              └───────────────┘
                         │                     │
                         │                     ▼
                         │              ┌───────────────┐
                         │              │ Payment Modal │
                         │              └───────────────┘
                         │
                         ├──────────────────────────────────┐
                         ▼                                  ▼
                  ┌───────────────┐                  ┌───────────────┐
                  │ Credits Tab   │                  │ History Tab   │
                  └───────────────┘                  └───────────────┘
```

---

## Visual Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| ck-ember | - | Primary CTA, brand accent |
| ck-indigo | - | Background gradients |
| ck-charcoal | - | Background gradients |
| ck-rare | - | Games, purple accent |
| ck-teal | - | Books, locations |
| ck-gold | - | Items, secondary links |
| ck-danger | - | Movies, errors |
| ck-forge | - | Entity type badges |

### Typography

- **Headings:** Font-heading (custom)
- **Body:** Default sans-serif
- **Narratives:** Serif, italic styling

### Component Library

Built with shadcn/ui:
- Button, Card, Badge, Dialog
- Tabs, Input, Textarea, Label
- DropdownMenu, Avatar, Separator

---

## Responsive Considerations

- All pages use max-width constraints (typically `max-w-4xl` or `max-w-6xl`)
- Grid layouts collapse to single column on mobile
- Fixed headers remain visible on all viewports
- Dialogs are modal and centered

---

## State Management

### Authentication

- Managed via `AuthContext`
- User data includes: id, email, displayName, avatarUrl, subscriptionTier, credits

### Navigation

- Breadcrumbs managed via `BreadcrumbContext`
- Trail of { id, name, type, path } items
- Cleared on main pages, appended on entity navigation

### Data

- Apollo Client for GraphQL
- Local state for form inputs
- Debounced auto-save for entity editing

---

## File Structure

```
docs/ux/
├── README.md                 # This file (master document)
└── screens/
    ├── 01-landing.md         # Landing page
    ├── 02-dashboard.md       # Dashboard
    ├── 03-login.md           # Login
    ├── 04-account.md         # Account settings
    ├── 05-products.md        # Products list
    ├── 06-product-detail.md  # Product detail
    ├── 07-entity-editor.md   # Entity editor
    ├── 08-payment-modal.md   # Payment modal
    └── 09-navigation.md      # Navigation components
```

---

## Access Control Summary

| Route Pattern | Public | Authenticated |
|---------------|--------|---------------|
| `/` (landing) | Yes | Redirects to dashboard |
| `/` (dashboard) | Redirects to landing | Yes |
| `/login` | Yes | Redirects to dashboard |
| `/account` | Redirects to login | Yes |
| `/products` | Redirects to login | Yes |
| `/product/:id` | Redirects to login | Yes |
| `/edit/:type/:id` | Redirects to login | Yes |
