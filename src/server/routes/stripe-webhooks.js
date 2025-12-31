import express from 'express';
import Stripe from 'stripe';
import { SUBSCRIPTION_TIERS, getCreditPackage } from '../config/tiers.js';

const router = express.Router();

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

let neo4jDriver = null;

export function setWebhookDriver(driver) {
  neo4jDriver = driver;
}

// Helper to run Neo4j queries
async function runQuery(cypher, params = {}) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

// Record a credit transaction
async function recordCreditTransaction(userId, type, amount, description) {
  const { v4: uuidv4 } = await import('uuid');
  const transaction = {
    id: uuidv4(),
    type,
    amount,
    description,
    createdAt: new Date().toISOString()
  };

  await runQuery(`
    MATCH (u:User {id: $userId})
    CREATE (t:CreditTransaction $transaction)
    CREATE (u)-[:HAS_TRANSACTION]->(t)
  `, { userId, transaction });

  return transaction;
}

// Handle Stripe webhooks
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    console.error('Stripe not configured');
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in checkout session metadata');
          break;
        }

        if (session.mode === 'subscription') {
          // Subscription checkout completed
          const tier = session.metadata?.tier;
          const subscriptionId = session.subscription;

          if (tier && SUBSCRIPTION_TIERS[tier]) {
            const tierLimits = SUBSCRIPTION_TIERS[tier].limits;

            await runQuery(`
              MATCH (u:User {id: $userId})
              SET u.subscriptionTier = $tier,
                  u.subscriptionStatus = 'active',
                  u.stripeSubscriptionId = $subscriptionId,
                  u.credits = u.credits + $monthlyCredits
            `, {
              userId,
              tier,
              subscriptionId,
              monthlyCredits: tierLimits.monthlyCredits
            });

            await recordCreditTransaction(
              userId,
              'monthly_allocation',
              tierLimits.monthlyCredits,
              `${SUBSCRIPTION_TIERS[tier].name} tier monthly credits`
            );

            console.log(`User ${userId} subscribed to ${tier} tier`);
          }
        } else if (session.mode === 'payment') {
          // Credit purchase completed
          const packageId = session.metadata?.packageId;
          const creditAmount = parseInt(session.metadata?.creditAmount, 10);

          if (packageId && creditAmount) {
            await runQuery(`
              MATCH (u:User {id: $userId})
              SET u.credits = u.credits + $creditAmount
            `, { userId, creditAmount });

            await recordCreditTransaction(
              userId,
              'purchase',
              creditAmount,
              `Purchased ${creditAmount} credits`
            );

            console.log(`User ${userId} purchased ${creditAmount} credits`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const result = await runQuery(`
          MATCH (u:User {stripeCustomerId: $customerId})
          RETURN u
        `, { customerId });

        if (result.records.length === 0) {
          console.error('User not found for customer:', customerId);
          break;
        }

        const userId = result.records[0].get('u').properties.id;
        const status = subscription.cancel_at_period_end ? 'canceled' : 'active';

        await runQuery(`
          MATCH (u:User {id: $userId})
          SET u.subscriptionStatus = $status
        `, { userId, status });

        console.log(`Subscription updated for user ${userId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const result = await runQuery(`
          MATCH (u:User {stripeCustomerId: $customerId})
          RETURN u
        `, { customerId });

        if (result.records.length === 0) {
          console.error('User not found for customer:', customerId);
          break;
        }

        const userId = result.records[0].get('u').properties.id;
        const freeTier = SUBSCRIPTION_TIERS.free;

        await runQuery(`
          MATCH (u:User {id: $userId})
          SET u.subscriptionTier = 'free',
              u.subscriptionStatus = 'active',
              u.stripeSubscriptionId = null
        `, { userId });

        console.log(`User ${userId} downgraded to free tier`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user by Stripe customer ID
        const result = await runQuery(`
          MATCH (u:User {stripeCustomerId: $customerId})
          RETURN u
        `, { customerId });

        if (result.records.length > 0) {
          const userId = result.records[0].get('u').properties.id;

          await runQuery(`
            MATCH (u:User {id: $userId})
            SET u.subscriptionStatus = 'past_due'
          `, { userId });

          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }

      // Stripe Elements: Handle PaymentIntent success for credit purchases
      // Note: Subscriptions are handled synchronously via confirmSubscription mutation
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;

        // Handle credit purchases (have packageId in metadata)
        const packageId = paymentIntent.metadata?.packageId;
        const creditAmount = parseInt(paymentIntent.metadata?.creditAmount, 10);

        if (userId && packageId && creditAmount) {
          await runQuery(`
            MATCH (u:User {id: $userId})
            SET u.credits = u.credits + $creditAmount
          `, { userId, creditAmount });

          await recordCreditTransaction(
            userId,
            'purchase',
            creditAmount,
            `Purchased ${creditAmount} credits`
          );

          console.log(`[Elements] User ${userId} purchased ${creditAmount} credits`);
        }
        break;
      }

      // Stripe Elements: Handle invoice paid for subscription payments
      case 'invoice.paid': {
        const invoice = event.data.object;

        // Only handle subscription invoices (has subscription field)
        if (!invoice.subscription) break;

        const subscriptionId = invoice.subscription;

        // Get subscription to check metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;
        const tier = subscription.metadata?.tier;

        if (userId && tier && SUBSCRIPTION_TIERS[tier]) {
          const tierLimits = SUBSCRIPTION_TIERS[tier].limits;

          // Update user subscription status
          await runQuery(`
            MATCH (u:User {id: $userId})
            SET u.subscriptionTier = $tier,
                u.subscriptionStatus = 'active',
                u.stripeSubscriptionId = $subscriptionId
          `, { userId, tier, subscriptionId });

          // For initial subscription, add monthly credits
          // (For renewals, credits are handled by the lazy reset in getUserWithLimits)
          if (invoice.billing_reason === 'subscription_create') {
            await runQuery(`
              MATCH (u:User {id: $userId})
              SET u.credits = u.credits + $monthlyCredits,
                  u.creditsResetAt = $resetAt
            `, {
              userId,
              monthlyCredits: tierLimits.monthlyCredits,
              resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

            await recordCreditTransaction(
              userId,
              'monthly_allocation',
              tierLimits.monthlyCredits,
              `${SUBSCRIPTION_TIERS[tier].name} tier monthly credits`
            );
          }

          console.log(`[Elements] Invoice paid for user ${userId}, tier: ${tier}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
