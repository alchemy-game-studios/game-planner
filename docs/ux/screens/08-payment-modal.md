# Payment Modal

## Overview

The payment modal is an overlay component that handles payment processing for subscriptions and credit purchases using Stripe Elements. It provides a seamless in-app payment experience without redirecting to external pages.

## Component

- **Path:** `src/components/stripe/PaymentModal.tsx`
- **Related:** `src/components/stripe/PaymentForm.tsx`, `src/components/stripe/StripeProvider.tsx`
- **Type:** Overlay/Modal

## Visual Design

- Dark zinc background with border
- Centered dialog with max-width constraint
- Ember-colored submit button
- Green success animation

## Screen Layout

### Payment State

```
┌─────────────────────────────────────────────────────────┐
│ Subscribe to Creative                           [X]    │
│ $4.99/mo - 500 entities, 1000 monthly credits          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │           [Stripe Payment Element]             │   │
│  │                                                 │   │
│  │  Card number                                   │   │
│  │  ┌───────────────────────────────────────────┐ │   │
│  │  │ 4242 4242 4242 4242                       │ │   │
│  │  └───────────────────────────────────────────┘ │   │
│  │                                                 │   │
│  │  Expiration           CVC                      │   │
│  │  ┌───────────────┐   ┌───────────────┐        │   │
│  │  │ 12/25         │   │ 123           │        │   │
│  │  └───────────────┘   └───────────────┘        │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │               Subscribe                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────────────────────────┐
│ Subscribe to Creative                                   │
│ $4.99/mo - 500 entities, 1000 monthly credits          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                       ✓                                 │
│                                                         │
│              Upgrade successful!                        │
│                                                         │
│        (auto-closes after 2 seconds)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────────────────────┐
│ Purchase 500 Credits                            [X]    │
│ One-time payment of $19.99                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚠ Your card was declined.                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Stripe Payment Element with card details]            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │               Purchase                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Props

| Prop | Type | Description |
|------|------|-------------|
| open | boolean | Whether modal is visible |
| onOpenChange | (open: boolean) => void | Callback when open state changes |
| clientSecret | string \| null | Stripe client secret for payment |
| title | string | Modal title (e.g., "Subscribe to Creative") |
| description | string | Payment description (e.g., "$4.99/mo - 500 entities") |
| submitLabel | string | Button text (e.g., "Subscribe", "Purchase") |
| returnTab | 'credits' \| 'subscription' | Which tab to return to after payment |
| showSuccess | boolean | Whether to show success state |
| onSuccess | (returnTab, paymentIntentId) => Promise | Callback after successful payment |

---

## User Interactions

| Element | Action | Result |
|---------|--------|--------|
| Close button (X) | Click | Closes modal (disabled during success) |
| Overlay background | Click | Closes modal (disabled during success) |
| Card number field | Type | Stripe validates input |
| Expiration field | Type | Stripe validates input |
| CVC field | Type | Stripe validates input |
| Submit button | Click | Processes payment |

---

## States

### Loading State
- Shows "Loading payment form..." while waiting for client secret

### Ready State
- Stripe Payment Element is displayed
- Submit button is enabled

### Processing State
- Submit button shows spinner
- Button text changes to "Processing..."
- Button is disabled

### Error State
- Red error banner appears above payment form
- Alert icon with error message
- User can retry payment

### Success State
- Large green checkmark icon
- Success message displayed
- Modal cannot be closed manually
- Auto-closes after 2 seconds

---

## Payment Flow

```
[User clicks Upgrade/Purchase]
            │
            ▼
   Account Page creates payment intent
   (GraphQL mutation)
            │
            ▼
   ┌────────────────────┐
   │   Payment Modal    │
   │   (Loading...)     │
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │   Stripe Elements  │
   │   (Card Input)     │
   └────────────────────┘
            │
   [User enters card & submits]
            │
            ▼
   ┌────────────────────┐
   │   Processing...    │
   └────────────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
[3DS Required]  [No 3DS]
    │               │
    ▼               │
 Redirect to        │
 3DS verification   │
    │               │
    ▼               ▼
┌────────────────────┐
│   Payment Result   │
└────────────────────┘
    │
    ├──[Success]──→ Show success state
    │               │
    │               ▼
    │         [2 second delay]
    │               │
    │               ▼
    │         Close modal + refresh data
    │
    └──[Error]──→ Show error message
                  User can retry
```

---

## 3DS Handling

For cards requiring 3D Secure verification:

1. Stripe automatically redirects to bank verification page
2. User completes verification
3. User is redirected back to `/account?success={type}&tab={returnTab}`
4. Account page handles the success state

---

## Success Message Variants

| Payment Type | Success Message |
|--------------|-----------------|
| subscription | "Upgrade successful!" |
| credits | "Purchase successful!" |

---

## Integration with Account Page

The payment modal is controlled by the Account page:

```javascript
// Account page state
const [paymentModal, setPaymentModal] = useState({
  open: false,
  clientSecret: null,
  title: '',
  description: '',
  submitLabel: 'Pay',
  paymentType: 'credits',
  showSuccess: false,
});

// Opening modal for subscription
setPaymentModal({
  open: true,
  clientSecret: data.createSubscription.clientSecret,
  title: `Subscribe to ${tierName}`,
  description: `${price} - ${entities} entities, ${credits} monthly credits`,
  submitLabel: 'Subscribe',
  paymentType: 'subscription',
});

// Opening modal for credits
setPaymentModal({
  open: true,
  clientSecret: data.createCreditPaymentIntent.clientSecret,
  title: `Purchase ${amount} Credits`,
  description: `One-time payment of ${price}`,
  submitLabel: 'Purchase',
  paymentType: 'credits',
});
```

---

## Behavior Notes

- Modal cannot be closed while showing success state
- Error state is cleared when modal is closed
- Client secret must be provided for Stripe Elements to render
- Submit button is disabled until Stripe is ready
- Ember-colored submit button matches CanonKiln branding
- Payment form scrolls if content exceeds viewport height
