/**
 * stripeResolvers.js
 * Stripe subscription integration for CanonKiln revenue gating.
 *
 * Plans:
 *   FREE    - 1 project, 25 entities, 0 AI generations
 *   CREATOR - 5 projects, 500 entities, 100 AI gen/mo  ($12/mo)
 *   STUDIO  - Unlimited projects, unlimited entities, 1000 AI gen/mo ($49/mo)
 *
 * In production: user sessions are tied to stripe customer IDs.
 * For MVP: we read subscription state from env/session and gate accordingly.
 */

import { GraphQLError } from 'graphql';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Plan configuration
const PLAN_CONFIG = {
  FREE: {
    projectLimit: 1,
    entityLimit: 25,
    generationCredits: 0,
  },
  CREATOR: {
    projectLimit: 5,
    entityLimit: 500,
    generationCredits: 100,
    stripePriceId: process.env.STRIPE_CREATOR_PRICE_ID || 'price_creator_placeholder',
  },
  STUDIO: {
    projectLimit: -1, // unlimited
    entityLimit: -1,
    generationCredits: 1000,
    stripePriceId: process.env.STRIPE_STUDIO_PRICE_ID || 'price_studio_placeholder',
  },
};

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

// In a real implementation, this reads from DB (user.stripeSubscriptionId)
// For MVP: returns FREE unless env vars indicate otherwise
const getSubscriptionFromContext = async (context) => {
  // TODO: replace with real DB lookup when auth is added
  // const user = context.user;
  // const subscription = await db.subscriptions.findOne({ userId: user.id });
  
  // Mock: check env for dev override
  const planOverride = process.env.DEV_PLAN_OVERRIDE || 'FREE';
  const config = PLAN_CONFIG[planOverride] || PLAN_CONFIG.FREE;

  return {
    isActive: planOverride !== 'FREE',
    plan: planOverride,
    ...config,
    periodEnd: null,
    cancelAtPeriodEnd: false,
  };
};

const stripeResolvers = {
  Query: {
    subscriptionStatus: async (_, args, context) => {
      return getSubscriptionFromContext(context);
    },
  },

  Mutation: {
    createCheckoutSession: async (_, { plan }, context) => {
      const stripe = await getStripe();

      if (!stripe) {
        // Dev mode without Stripe key — return mock
        return {
          url: `${APP_URL}/checkout-mock?plan=${plan}`,
          sessionId: `mock_session_${plan}_${Date.now()}`,
        };
      }

      const planConfig = PLAN_CONFIG[plan];
      if (!planConfig?.stripePriceId) {
        throw new GraphQLError(`Invalid plan: ${plan}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: planConfig.stripePriceId,
              quantity: 1,
            },
          ],
          success_url: `${APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/pricing`,
          // In production: include customer ID if user already has a Stripe customer
          // customer: context.user?.stripeCustomerId,
          metadata: {
            plan,
            // userId: context.user?.id,
          },
        });

        return {
          url: session.url,
          sessionId: session.id,
        };
      } catch (err) {
        throw new GraphQLError(`Stripe checkout error: ${err.message}`, {
          extensions: { code: 'STRIPE_ERROR' },
        });
      }
    },

    createPortalSession: async (_, args, context) => {
      const stripe = await getStripe();

      if (!stripe) {
        return {
          url: `${APP_URL}/billing-mock`,
        };
      }

      // In production: get customer ID from user record
      // const customerId = context.user?.stripeCustomerId;
      const customerId = process.env.DEV_STRIPE_CUSTOMER_ID;

      if (!customerId) {
        throw new GraphQLError('No billing account found. Please subscribe first.', {
          extensions: { code: 'NO_SUBSCRIPTION' },
        });
      }

      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${APP_URL}/settings`,
        });

        return { url: session.url };
      } catch (err) {
        throw new GraphQLError(`Stripe portal error: ${err.message}`, {
          extensions: { code: 'STRIPE_ERROR' },
        });
      }
    },
  },
};

export default stripeResolvers;

// ─── Middleware: Revenue Gate ─────────────────────────────────────────────────
// Use this in resolvers to enforce plan limits before performing operations.

export const requirePlan = (minimumPlan) => async (context) => {
  const status = await getSubscriptionFromContext(context);
  const planOrder = { FREE: 0, CREATOR: 1, STUDIO: 2 };

  if (planOrder[status.plan] < planOrder[minimumPlan]) {
    throw new GraphQLError(
      `This feature requires the ${minimumPlan} plan. Upgrade at /pricing.`,
      { extensions: { code: 'PLAN_REQUIRED', requiredPlan: minimumPlan } }
    );
  }

  return status;
};

export const checkEntityLimit = async (context, projectId, runQuery) => {
  const status = await getSubscriptionFromContext(context);
  if (status.entityLimit === -1) return; // unlimited

  const records = await runQuery(
    `MATCH (e:CanonEntity {projectId: $projectId}) RETURN count(e) AS total`,
    { projectId }
  );
  const total = records[0]?.get('total')?.toNumber() || 0;

  if (total >= status.entityLimit) {
    throw new GraphQLError(
      `Entity limit reached (${status.entityLimit} on ${status.plan} plan). Upgrade to add more.`,
      { extensions: { code: 'ENTITY_LIMIT_REACHED' } }
    );
  }
};

export const checkGenerationCredits = async (context) => {
  const status = await getSubscriptionFromContext(context);
  if (status.generationCredits === 0) {
    throw new GraphQLError(
      'AI generation requires the CREATOR plan or higher. Upgrade at /pricing.',
      { extensions: { code: 'GENERATION_LOCKED', requiredPlan: 'CREATOR' } }
    );
  }
};
