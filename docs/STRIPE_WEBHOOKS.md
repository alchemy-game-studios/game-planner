# Stripe Webhooks Setup Guide

This guide explains how to set up and test Stripe webhook integration for CanonKiln subscription management.

## Overview

Stripe webhooks allow the backend to receive real-time notifications when subscription events occur (new subscriptions, cancellations, plan changes, etc.). This is critical for keeping the Neo4j user subscription state in sync with Stripe.

## Webhook Endpoint

- **URL:** `POST /api/stripe/webhook`
- **Content-Type:** `application/json` (raw body required for signature verification)
- **Authentication:** Stripe signature verification via `STRIPE_WEBHOOK_SECRET`

## Events Handled

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | User completes initial payment | Create/activate subscription in Neo4j |
| `customer.subscription.created` | Subscription created | Update user tier and status |
| `customer.subscription.updated` | Subscription changed (renewal, upgrade, downgrade) | Update subscription data |
| `customer.subscription.deleted` | Subscription cancelled/expired | Downgrade user to FREE tier |

## Setup Instructions

### 1. Local Development with Stripe CLI

The easiest way to test webhooks locally is using the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook signing secret like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Add this to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Testing Webhook Events

With the Stripe CLI running, you can trigger test events:

```bash
# Test checkout completion
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test subscription deletion
stripe trigger customer.subscription.deleted
```

### 3. Production Setup

For production, configure webhooks in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** and add to production environment:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_prod_xxxxxxxxxxxxx
   ```

## How It Works

### Subscription Lifecycle

1. **User initiates subscription:**
   - Frontend calls `createCheckoutSession` mutation
   - Backend creates Stripe checkout session with metadata (userId, plan)
   - User redirected to Stripe payment page

2. **User completes payment:**
   - Stripe sends `checkout.session.completed` webhook
   - Backend retrieves full subscription details
   - Updates Neo4j user node with subscription data

3. **Subscription events:**
   - Renewals → `customer.subscription.updated`
   - Plan changes → `customer.subscription.updated`
   - Cancellations → `customer.subscription.deleted`
   - Each event updates the Neo4j user node

### Neo4j User Fields Updated

The webhook handler updates these fields on the User node:

```cypher
{
  stripeCustomerId: String,      // Stripe customer ID
  subscriptionTier: String,      // FREE | CREATOR | STUDIO
  subscriptionStatus: String,    // active | past_due | cancelled | incomplete
  subscriptionPeriodEnd: String, // ISO timestamp
  cancelAtPeriodEnd: Boolean,    // true if user cancelled but still active
  updatedAt: String             // Last update timestamp
}
```

## Verification & Security

### Signature Verification

The webhook endpoint verifies that requests come from Stripe using the webhook signing secret:

```javascript
const event = stripe.webhooks.constructEvent(
  req.body,           // Raw body (not parsed JSON)
  sig,                // Stripe-Signature header
  STRIPE_WEBHOOK_SECRET
);
```

**Important:** The route must be registered BEFORE `express.json()` middleware to preserve the raw body.

### Error Handling

- **Invalid signature:** Returns `400 Bad Request`
- **Processing error:** Returns `500 Internal Server Error` (Stripe will retry)
- **Missing config:** Returns `500` for missing webhook secret
- **User not found:** Logs error but returns `200` (acknowledge receipt)

Stripe automatically retries failed webhooks with exponential backoff.

## Monitoring & Debugging

### Stripe Dashboard

View webhook delivery status in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

- Delivery history with request/response logs
- Retry attempts
- Error messages

### Local Logs

The webhook handler logs all events:

```
Updated subscription for user john@example.com: CREATOR (active)
Unhandled event type: invoice.payment_succeeded
```

### Testing Checklist

- [ ] Stripe CLI forwarding working
- [ ] `STRIPE_WEBHOOK_SECRET` set in `.env`
- [ ] Server running on port 3000
- [ ] Trigger `checkout.session.completed` → User upgraded in Neo4j
- [ ] Trigger `customer.subscription.deleted` → User downgraded to FREE
- [ ] Invalid signature rejected (modify webhook secret)
- [ ] Check Neo4j user node for updated fields

## Troubleshooting

### "Webhook signature verification failed"

- Ensure `STRIPE_WEBHOOK_SECRET` matches the Stripe CLI output
- Check that webhook route is BEFORE `express.json()` middleware
- Verify raw body is being passed (not parsed JSON)

### "No user found for Stripe customer"

- User may not have `stripeCustomerId` set yet
- Check that `createCheckoutSession` mutation created/linked Stripe customer
- Verify customer ID in Stripe dashboard matches Neo4j

### "Unhandled event type"

- Some Stripe events are intentionally not handled (e.g., `invoice.*`)
- Add handlers if needed, or ignore by returning `200`

## Future Enhancements

Potential improvements to the webhook system:

1. **Usage tracking:** Decrement AI generation credits on each generation
2. **Monthly reset:** Reset generation credits at the start of each billing period
3. **Dunning emails:** Notify users when subscriptions are past_due
4. **Webhook queue:** Process webhooks asynchronously via job queue
5. **Audit log:** Store webhook events in database for historical tracking
6. **Idempotency:** Ensure repeated webhook deliveries don't cause duplicate actions

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Best Practices](https://stripe.com/docs/webhooks/best-practices)
