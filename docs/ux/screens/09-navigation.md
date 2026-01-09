# Navigation Components

## Overview

The application uses two primary navigation components that appear consistently across pages: Breadcrumbs and User Menu. These provide contextual navigation and account access.

---

## Breadcrumbs

### Component

- **Path:** `src/components/breadcrumbs.tsx`
- **Context:** Uses `BreadcrumbContext` for state management

### Visual Design

- Fixed position at top of viewport
- Black background with subtle bottom border
- CanonKiln logo on left
- User menu on right

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Logo] │ [< Back]  >  universe: Eldoria  >  place: Crystal Caves  [👤] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Components

| Element | Description |
|---------|-------------|
| Logo | CanonKiln logo, clickable to go home |
| Back button | Navigate to previous breadcrumb item |
| Separator | Vertical line between logo and navigation |
| Breadcrumb trail | Type: Name pairs showing navigation path |
| User Menu | Account dropdown (see below) |

### Breadcrumb Item Format

```
[type]: [name]
```

Examples:
- `universe: Eldoria`
- `place: Crystal Caves`
- `character: Aethric the Brave`
- `product: Eldoria Card Game`

### Visibility

- **Hidden:** Home page (Landing or Dashboard)
- **Visible:** All other pages

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Logo | Click | Navigate to Dashboard, clear breadcrumbs |
| Back button | Click | Navigate to previous breadcrumb item |
| Breadcrumb item (not current) | Click | Navigate to that item's path |
| Breadcrumb item (current) | Click | No action (cursor: default) |

### Navigation Logic

```javascript
// Back button behavior
if (breadcrumbs.length > 1) {
  // Navigate to previous item in trail
  navigate(breadcrumbs[breadcrumbs.length - 2].path);
} else if (breadcrumbs.length === 1) {
  // Go home
  navigate('/');
} else {
  // Use browser history
  navigate(-1);
}
```

### Breadcrumb State Management

Breadcrumbs are managed via context:

| Method | Description |
|--------|-------------|
| push(item) | Add item to trail |
| clear() | Remove all items |
| navigateTo(index) | Truncate trail to index |

### Pages That Modify Breadcrumbs

| Page | Action |
|------|--------|
| Landing | Clear |
| Dashboard | Clear |
| Login | Clear |
| Products | Clear |
| Account | Clear, then push "Account" |
| Product Detail | Clear, push "Products", push product name |
| Entity Editor | Push entity (type: name) |

---

## User Menu

### Component

- **Path:** `src/components/user-menu.tsx`

### Visual Design

- Avatar button as trigger
- Dropdown menu with dark zinc styling
- Ember-colored avatar fallback

### States

#### Loading State
```
┌──────┐
│ ○○○○ │  (pulsing animation)
└──────┘
```

#### Unauthenticated State
```
┌──────────┐
│ Sign In  │  (ember-colored button)
└──────────┘
```

#### Authenticated State (Trigger)
```
┌──────┐
│ [👤] │  (avatar image or initial)
└──────┘
```

### Dropdown Menu Layout

```
┌─────────────────────────────────────┐
│ Display Name                        │
│ email@example.com                   │
├─────────────────────────────────────┤
│ 🏠 Home                             │
│ 💳 Billing              [creative]  │
│ 🪙 Credits                   [245]  │
├─────────────────────────────────────┤
│ 🚪 Log out                          │
└─────────────────────────────────────┘
```

### Menu Items

| Item | Icon | Description | Badge |
|------|------|-------------|-------|
| Header | - | Display name and email | - |
| Home | Home | Navigate to Dashboard | - |
| Billing | CreditCard | Navigate to Account (subscription tab) | Subscription tier |
| Credits | Coins | Navigate to Account (credits tab) | Credit balance |
| Log out | LogOut | Sign out and return to Landing | - |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Avatar button | Click | Open dropdown menu |
| Sign In button | Click | Initiate Google OAuth |
| Home | Click | Navigate to `/` |
| Billing | Click | Navigate to `/account?tab=subscription` |
| Credits | Click | Navigate to `/account?tab=credits` |
| Log out | Click | Sign out, navigate to Landing |

### Avatar Display Logic

```javascript
if (user.avatarUrl) {
  // Show user's Google profile image
  <img src={user.avatarUrl} />
} else {
  // Show first letter of display name
  <span>{user.displayName.charAt(0).toUpperCase()}</span>
}
```

---

## Integration

### Breadcrumbs + User Menu

Both components work together in the fixed header:

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] │ [Breadcrumb Navigation]              [UserMenu]│
└─────────────────────────────────────────────────────────┘
```

### Z-Index Hierarchy

| Component | Z-Index | Notes |
|-----------|---------|-------|
| Breadcrumbs container | 60 | Above most content |
| Entity Editor header | 50 | Below breadcrumbs |

### Responsive Behavior

- Breadcrumb trail may truncate on mobile (not explicitly implemented)
- User menu dropdown aligns to end (right side)

---

## User Flow Summary

```
[Any Page]
     │
     ├──[Click Logo]──→ Dashboard (/)
     │
     ├──[Click Back]──→ Previous breadcrumb or browser history
     │
     ├──[Click Breadcrumb]──→ Navigate to that entity
     │
     └──[Open User Menu]
              │
              ├──[Home]──→ Dashboard (/)
              ├──[Billing]──→ Account (/account?tab=subscription)
              ├──[Credits]──→ Account (/account?tab=credits)
              └──[Log out]──→ Landing Page (/)
```
