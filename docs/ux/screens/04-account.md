# Account Settings

## Overview

The account settings page is the central hub for managing user profile, subscription, credits, and billing history. It uses a tabbed interface to organize different account functions.

## Route

- **Path:** `/account`
- **Access:** Protected (redirects to Login if unauthenticated)
- **Component:** `src/pages/account.tsx`
- **Query Parameters:** `?tab=profile|subscription|credits|history`

## Visual Design

- Dark zinc background with card-based layout
- Tab navigation with icons
- Tier-colored badges for subscription status
- Animated feedback for successful updates

## Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│ Account Settings                                        │
├─────────────────────────────────────────────────────────┤
│  [👤 Profile] [💳 Subscription] [🪙 Credits] [📜 History] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Tab Content - see sections below]                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Profile Tab

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Profile                                                 │
│ Manage your account details                             │
├─────────────────────────────────────────────────────────┤
│  [Avatar]  Display Name                                 │
│            email@example.com                            │
│                                                         │
│  Display Name                                           │
│  ┌────────────────────────────┐  ┌────────┐             │
│  │ Current name...            │  │  Save  │             │
│  └────────────────────────────┘  └────────┘             │
│                                                         │
│  ─────────────────────────────────────────────          │
│  Member since January 1, 2024                           │
└─────────────────────────────────────────────────────────┘
```

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Display Name input | Type | Updates local state |
| Save button | Click | Saves display name via GraphQL mutation |

---

## Subscription Tab

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Current Plan                           [Creative Badge] │
│ 500 entities, 1000 monthly credits                      │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐                                         │
│  │    123     │     [Cancel Subscription]               │
│  │ / 500 ent  │                                         │
│  └────────────┘                                         │
└─────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│     Free     │ │   Creative   │ │    Studio    │
│      $0      │ │   $4.99/mo   │ │  $29.99/mo   │
│              │ │              │ │              │
│  50 entities │ │ 500 entities │ │  Unlimited   │
│  100 credits │ │ 1000 credits │ │ 5000 credits │
│              │ │              │ │              │
│  [Downgrade] │ │     [✓]      │ │  [Upgrade]   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Subscription Tiers

| Tier | Price | Entity Limit | Monthly Credits |
|------|-------|--------------|-----------------|
| Free | $0 | 50 | 100 |
| Creative | $4.99/mo | 500 | 1,000 |
| Studio | $29.99/mo | Unlimited | 5,000 |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Upgrade button | Click | Opens Payment Modal for subscription |
| Switch button | Click | Opens Payment Modal to change tier |
| Downgrade button | Click | Shows confirmation, cancels subscription |
| Cancel Subscription button | Click | Shows confirmation dialog, cancels at period end |

---

## Credits Tab

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Credit Balance                                          │
│ Credits are used for AI generation features             │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐    Resets on                            │
│  │   1,234    │    February 1, 2025                     │
│  │  credits   │                                         │
│  └────────────┘                                         │
└─────────────────────────────────────────────────────────┘

Purchase Credits

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 100 Credits  │ │ 500 Credits  │ │ 1000 Credits │
│    $10.00    │ │    $19.99    │ │    $34.99    │
│              │ │              │ │              │
│ [🪙 Purchase] │ │ [🪙 Purchase] │ │ [🪙 Purchase] │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Credit Packages

| Package | Credits | Price |
|---------|---------|-------|
| Basic | 100 | $10.00 |
| Popular | 500 | $19.99 |
| Best Value | 1,000 | $34.99 |

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Purchase button | Click | Opens Payment Modal for credit purchase |

---

## History Tab

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Billing History                                         │
│ Your past payments and invoices                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ Creative Monthly Subscription                   │    │
│  │ January 15, 2025              $4.99  [paid] [↗] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 500 Credits                                     │    │
│  │ January 10, 2025             $19.99  [paid] [↗] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│               [Load More]                               │
└─────────────────────────────────────────────────────────┘
```

### User Interactions

| Element | Action | Result |
|---------|--------|--------|
| External link icon | Click | Opens invoice in new tab (Stripe hosted) |
| Load More button | Click | Fetches more billing history entries |

---

## States

### Loading State
- Shows "Loading..." message while fetching user data

### Canceled Payment State
- Yellow warning banner: "Payment was canceled. No changes were made."

### Success Animation State
- Credit balance or subscription badge scales up and changes color
- Animation lasts 2 seconds after successful payment

### Empty History State
- Shows "No billing history yet" message

---

## Payment Flow

```
[Upgrade/Purchase Button]
           │
           ▼
   Create payment intent
   (GraphQL mutation)
           │
           ▼
   ┌───────────────────┐
   │   Payment Modal   │
   │  (Stripe Elements) │
   └───────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
 [Success]     [Cancel]
    │             │
    ▼             ▼
Show success   Close modal
animation      Show canceled banner
    │
    ▼
Refresh user data
```

## Behavior Notes

- Tab state is persisted in URL query parameter
- Breadcrumbs show "Account" when on this page
- Non-authenticated users are redirected to Login
- Cancel subscription shows confirmation dialog
- Subscription badge animates when tier changes
- Credit balance animates when credits are purchased
- History tab lazy-loads billing data only when active
