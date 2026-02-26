/**
 * usageResolvers.js
 * Track and enforce AI generation usage limits per user per billing period.
 * 
 * Each generation is recorded as a UsageRecord node in Neo4j.
 * Monthly limits are enforced based on subscription tier.
 */

import { runQuery } from '../neo4j-driver.js';
import { GraphQLError } from 'graphql';

/**
 * Get start of current billing period (first day of current month)
 */
const getCurrentPeriodStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

/**
 * Get end of current billing period (first day of next month)
 */
const getCurrentPeriodEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
};

/**
 * Get user's monthly generation limit based on subscription tier
 */
const getGenerationLimit = (subscriptionTier) => {
  const limits = {
    FREE: 0,
    CREATOR: 100,
    STUDIO: 1000,
  };
  return limits[subscriptionTier] || 0;
};

/**
 * Get user's subscription tier from Neo4j
 */
const getUserSubscriptionTier = async (userId) => {
  if (!userId) {
    return 'FREE';
  }

  const records = await runQuery(
    'MATCH (u:User {id: $userId}) RETURN u.subscriptionTier AS tier',
    { userId }
  );

  if (records.length === 0) {
    return 'FREE';
  }

  return records[0].get('tier') || 'FREE';
};

/**
 * Count user's generations in current billing period
 */
const getUserGenerationCount = async (userId, periodStart) => {
  if (!userId) {
    return 0;
  }

  const records = await runQuery(
    `MATCH (u:User {id: $userId})-[:GENERATED]->(r:UsageRecord)
     WHERE r.createdAt >= $periodStart
     RETURN count(r) AS count`,
    { userId, periodStart }
  );

  if (records.length === 0) {
    return 0;
  }

  return records[0].get('count').toNumber();
};

/**
 * Check if user has remaining generation credits
 * Throws GraphQLError if limit exceeded
 */
export const checkGenerationCredits = async (context) => {
  if (!context.userId) {
    throw new GraphQLError('Authentication required to use AI generation', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const tier = await getUserSubscriptionTier(context.userId);
  const limit = getGenerationLimit(tier);

  if (limit === 0) {
    throw new GraphQLError(
      'Your plan does not include AI generation. Upgrade to CREATOR or STUDIO to use this feature.',
      {
        extensions: {
          code: 'NO_GENERATION_CREDITS',
          requiredPlan: 'CREATOR',
          currentPlan: tier,
        },
      }
    );
  }

  const periodStart = getCurrentPeriodStart();
  const used = await getUserGenerationCount(context.userId, periodStart);

  if (used >= limit) {
    throw new GraphQLError(
      `Monthly generation limit reached (${limit} on ${tier} plan). Upgrade to increase your limit or wait for next billing cycle.`,
      {
        extensions: {
          code: 'GENERATION_LIMIT_REACHED',
          limit,
          used,
          tier,
          periodStart,
          nextReset: getCurrentPeriodEnd(),
        },
      }
    );
  }

  return {
    tier,
    limit,
    used,
    remaining: limit - used,
  };
};

/**
 * Record a generation in Neo4j
 */
export const recordGeneration = async (userId, projectId, entityType, generationId) => {
  if (!userId) {
    return; // Skip recording for unauthenticated users (shouldn't happen)
  }

  const now = new Date().toISOString();

  await runQuery(
    `MATCH (u:User {id: $userId})
     CREATE (r:UsageRecord {
       id: $generationId,
       userId: $userId,
       projectId: $projectId,
       entityType: $entityType,
       type: 'AI_GENERATION',
       createdAt: $createdAt,
       periodStart: $periodStart
     })
     CREATE (u)-[:GENERATED]->(r)
     RETURN r`,
    {
      userId,
      projectId,
      entityType,
      generationId,
      createdAt: now,
      periodStart: getCurrentPeriodStart(),
    }
  );
};

const usageResolvers = {
  Query: {
    /**
     * Get current user's usage stats for the current billing period
     */
    usageStats: async (_, args, context) => {
      if (!context.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const tier = await getUserSubscriptionTier(context.userId);
      const limit = getGenerationLimit(tier);
      const periodStart = getCurrentPeriodStart();
      const periodEnd = getCurrentPeriodEnd();
      const used = await getUserGenerationCount(context.userId, periodStart);

      return {
        tier,
        limit,
        used,
        remaining: Math.max(0, limit - used),
        periodStart,
        periodEnd,
      };
    },

    /**
     * Get user's generation history
     */
    generationHistory: async (_, { limit = 50, offset = 0 }, context) => {
      if (!context.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const records = await runQuery(
        `MATCH (u:User {id: $userId})-[:GENERATED]->(r:UsageRecord)
         RETURN r
         ORDER BY r.createdAt DESC
         SKIP $offset
         LIMIT $limit`,
        { userId: context.userId, offset, limit }
      );

      return records.map((r) => {
        const props = r.get('r').properties;
        return {
          id: props.id,
          projectId: props.projectId,
          entityType: props.entityType,
          createdAt: props.createdAt,
        };
      });
    },
  },
};

export default usageResolvers;
