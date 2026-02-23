/**
 * stripeResolvers.js
 * Stripe subscription integration for CanonKiln revenue gating.
 *
 * Plans:
 *   FREE    - 1 project, 25 entities, 0 AI generations
 *   CREATOR - 5 projects, 500 entities, 100 AI gen/mo  ($12/mo)
 *   STUDIO  - Unlimited projects, unlimited entities, 1000 AI gen/mo ($49/mo)
 *
 * User subscription state is stored in Neo4j User nodes with Stripe integration.
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

/**
 * Get subscription data from Neo4j User node
 */
const getSubscriptionFromContext = async (context) => {
  // If no auth, return FREE tier
  if (!context.userId) {
    const config = PLAN_CONFIG.FREE;
    return {
      isActive: false,
      plan: 'FREE',
      ...config,
      periodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  // Load user from Neo4j
  const { getDriver } = await import('../neo4j-driver.js');
  const driver = getDriver();
  const session = driver.session();
  
  try {
    const result = await session.run(
      'MATCH (u:User {id: $userId}) RETURN u',
      { userId: context.userId }
    );

    if (result.records.length === 0) {
      throw new Error('User not found');
    }

    const user = result.records[0].get('u').properties;
    const tier = user.subscriptionTier || 'FREE';
    const status = user.subscriptionStatus || 'inactive';
    const config = PLAN_CONFIG[tier] || PLAN_CONFIG.FREE;

    return {
      isActive: status === 'active',
      plan: tier,
      ...config,
      periodEnd: user.subscriptionPeriodEnd || null,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd === true,
    };
  } finally {
    await session.close();
  }
};

const stripeResolvers = {
  Query: {
    subscriptionStatus: async (_, args, context) => {
      return getSubscriptionFromContext(context);
    },
  },

  Mutation: {
    createCheckoutSession: async (_, { plan }, context) => {
      // Require authentication
      if (!context.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

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

      // Load user to get/create Stripe customer
      const { getDriver } = await import('../neo4j-driver.js');
      const driver = getDriver();
      const session = driver.session();
      
      try {
        const result = await session.run(
          'MATCH (u:User {id: $userId}) RETURN u',
          { userId: context.userId }
        );

        if (result.records.length === 0) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' },
          });
        }

        const user = result.records[0].get('u').properties;
        let stripeCustomerId = user.stripeCustomerId;

        // Create Stripe customer if doesn't exist
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              userId: user.id,
              displayName: user.displayName,
            },
          });
          stripeCustomerId = customer.id;

          // Store customer ID in Neo4j
          await session.run(
            'MATCH (u:User {id: $userId}) SET u.stripeCustomerId = $stripeCustomerId, u.updatedAt = $updatedAt',
            {
              userId: user.id,
              stripeCustomerId,
              updatedAt: new Date().toISOString(),
            }
          );
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: stripeCustomerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: planConfig.stripePriceId,
              quantity: 1,
            },
          ],
          success_url: `${APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/pricing`,
          metadata: {
            plan,
            userId: user.id,
          },
        });

        return {
          url: checkoutSession.url,
          sessionId: checkoutSession.id,
        };
      } catch (err) {
        throw new GraphQLError(`Stripe checkout error: ${err.message}`, {
          extensions: { code: 'STRIPE_ERROR' },
        });
      } finally {
        await session.close();
      }
    },

    createPortalSession: async (_, args, context) => {
      // Require authentication
      if (!context.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const stripe = await getStripe();

      if (!stripe) {
        return {
          url: `${APP_URL}/billing-mock`,
        };
      }

      // Load user to get Stripe customer ID
      const { getDriver } = await import('../neo4j-driver.js');
      const driver = getDriver();
      const session = driver.session();
      
      try {
        const result = await session.run(
          'MATCH (u:User {id: $userId}) RETURN u',
          { userId: context.userId }
        );

        if (result.records.length === 0) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' },
          });
        }

        const user = result.records[0].get('u').properties;
        const customerId = user.stripeCustomerId;

        if (!customerId) {
          throw new GraphQLError('No billing account found. Please subscribe first.', {
            extensions: { code: 'NO_SUBSCRIPTION' },
          });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${APP_URL}/settings`,
        });

        return {
          url: portalSession.url,
        };
      } catch (err) {
        throw new GraphQLError(`Stripe portal error: ${err.message}`, {
          extensions: { code: 'STRIPE_ERROR' },
        });
      } finally {
        await session.close();
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
      'Your plan does not include AI generation. Upgrade to CREATOR or STUDIO.',
      { extensions: { code: 'NO_GENERATION_CREDITS' } }
    );
  }
  // In production: track monthly usage and decrement credits
  // For MVP: just check plan tier
  return status;
};
