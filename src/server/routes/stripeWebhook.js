/**
 * stripeWebhook.js
 * Stripe webhook endpoint for handling subscription lifecycle events.
 * 
 * This endpoint receives events from Stripe and updates user subscription
 * state in Neo4j accordingly.
 * 
 * Events handled:
 *   - checkout.session.completed: Initial subscription creation
 *   - customer.subscription.created: Subscription activated
 *   - customer.subscription.updated: Plan changes, renewals
 *   - customer.subscription.deleted: Cancellations, expirations
 */

import express from 'express';

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Get Stripe client lazily
const getStripe = async () => {
  if (!STRIPE_SECRET_KEY) return null;
  try {
    const { default: Stripe } = await import('stripe');
    return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  } catch {
    return null;
  }
};

/**
 * Map Stripe subscription status to CanonKiln status
 */
const mapSubscriptionStatus = (stripeStatus) => {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled';
    case 'incomplete':
      return 'incomplete';
    default:
      return 'inactive';
  }
};

/**
 * Determine plan tier from Stripe price ID
 */
const getPlanFromPriceId = (priceId) => {
  const CREATOR_PRICE_ID = process.env.STRIPE_CREATOR_PRICE_ID;
  const STUDIO_PRICE_ID = process.env.STRIPE_STUDIO_PRICE_ID;

  if (priceId === CREATOR_PRICE_ID) return 'CREATOR';
  if (priceId === STUDIO_PRICE_ID) return 'STUDIO';
  
  // Default to CREATOR if we can't determine (safer than FREE)
  console.warn(`Unknown Stripe price ID: ${priceId}, defaulting to CREATOR`);
  return 'CREATOR';
};

/**
 * Update user subscription in Neo4j
 */
const updateUserSubscription = async (customerId, subscriptionData) => {
  const { getDriver } = await import('../neo4j-driver.js');
  const driver = getDriver();
  const session = driver.session();

  try {
    // Find user by Stripe customer ID
    const result = await session.run(
      `MATCH (u:User {stripeCustomerId: $customerId})
       SET u.subscriptionTier = $tier,
           u.subscriptionStatus = $status,
           u.subscriptionPeriodEnd = $periodEnd,
           u.cancelAtPeriodEnd = $cancelAtPeriodEnd,
           u.updatedAt = $updatedAt
       RETURN u`,
      {
        customerId,
        tier: subscriptionData.tier,
        status: subscriptionData.status,
        periodEnd: subscriptionData.periodEnd,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        updatedAt: new Date().toISOString(),
      }
    );

    if (result.records.length === 0) {
      console.error(`No user found for Stripe customer: ${customerId}`);
      return false;
    }

    const user = result.records[0].get('u').properties;
    console.log(`Updated subscription for user ${user.email}: ${subscriptionData.tier} (${subscriptionData.status})`);
    return true;
  } catch (err) {
    console.error('Error updating user subscription:', err);
    throw err;
  } finally {
    await session.close();
  }
};

/**
 * Handle checkout.session.completed
 * Initial subscription setup when customer completes payment
 */
const handleCheckoutCompleted = async (session) => {
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!subscriptionId) {
    console.log('Checkout session without subscription, skipping');
    return;
  }

  // Fetch full subscription details from Stripe
  const stripe = await getStripe();
  if (!stripe) {
    console.error('Stripe not configured, cannot fetch subscription details');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdate(subscription);
};

/**
 * Handle customer.subscription.* events
 * Updates or deletions to existing subscriptions
 */
const handleSubscriptionUpdate = async (subscription) => {
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0]?.price?.id;
  
  const subscriptionData = {
    tier: getPlanFromPriceId(priceId),
    status: mapSubscriptionStatus(subscription.status),
    periodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  await updateUserSubscription(customerId, subscriptionData);
};

/**
 * Handle customer.subscription.deleted
 * Downgrade user to FREE tier when subscription ends
 */
const handleSubscriptionDeleted = async (subscription) => {
  const customerId = subscription.customer;
  
  const subscriptionData = {
    tier: 'FREE',
    status: 'cancelled',
    periodEnd: new Date(subscription.ended_at * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  };

  await updateUserSubscription(customerId, subscriptionData);
};

/**
 * Stripe webhook endpoint
 * Must use raw body for signature verification
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = await getStripe();

  // If Stripe not configured, return 200 to acknowledge webhook
  if (!stripe) {
    console.warn('Stripe webhook received but Stripe is not configured');
    return res.json({ received: true });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured, cannot verify webhooks');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
