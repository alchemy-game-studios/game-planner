# Usage Tracking System

This document explains how CanonKiln tracks and enforces AI generation usage limits.

## Overview

Each subscription tier includes a monthly limit for AI generations:

- **FREE:** 0 generations/month (must upgrade to use AI)
- **CREATOR:** 100 generations/month
- **STUDIO:** 1000 generations/month

The usage tracking system:

1. Records every AI generation in Neo4j as a `UsageRecord` node
2. Counts usage per billing period (monthly calendar reset)
3. Enforces limits before allowing new generations
4. Provides APIs to query current usage

## Neo4j Schema

### UsageRecord Node

```cypher
CREATE (r:UsageRecord {
  id: String,              // UUID of the generation
  userId: String,          // User who generated
  projectId: String,       // Project context
  entityType: String,      // PLACE, CHARACTER, etc.
  type: String,            // Always 'AI_GENERATION'
  createdAt: String,       // ISO timestamp
  periodStart: String      // First day of month (for indexing)
})
```

### Relationship

```cypher
(User)-[:GENERATED]->(UsageRecord)
```

This allows efficient queries like:

```cypher
// Count user's generations this month
MATCH (u:User {id: $userId})-[:GENERATED]->(r:UsageRecord)
WHERE r.createdAt >= $periodStart
RETURN count(r) AS used
```

## GraphQL API

### Queries

#### `usageStats`

Get current user's usage for the current billing period.

**Request:**
```graphql
query {
  usageStats {
    tier          # FREE | CREATOR | STUDIO
    limit         # Monthly limit
    used          # Generations used this month
    remaining     # Generations remaining
    periodStart   # Start of billing period (ISO timestamp)
    periodEnd     # End of billing period (next month)
  }
}
```

**Example Response:**
```json
{
  "data": {
    "usageStats": {
      "tier": "CREATOR",
      "limit": 100,
      "used": 23,
      "remaining": 77,
      "periodStart": "2026-02-01T00:00:00.000Z",
      "periodEnd": "2026-03-01T00:00:00.000Z"
    }
  }
}
```

#### `generationHistory`

Get list of past generations.

**Request:**
```graphql
query {
  generationHistory(limit: 20, offset: 0) {
    id
    projectId
    entityType
    createdAt
  }
}
```

### Mutations

Generation mutations automatically check and record usage:

- `generateEntity` - Creates new AI-generated entity
- `refineGeneration` - Refines existing generation (also counts as usage)

Both mutations will throw errors if:

1. User is not authenticated
2. User's plan doesn't include AI generation (FREE tier)
3. User has reached monthly limit

## Implementation Details

### Billing Period

Usage resets on the **first day of each calendar month** (not based on subscription start date).

```javascript
// Start of current month
const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)

// Start of next month
const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
```

**Rationale:** Simpler than per-user billing cycles. Stripe subscription billing happens separately and doesn't need to align perfectly with usage resets.

### Enforcement Flow

```javascript
// In generateEntity mutation:
1. checkGenerationCredits(context)
   ├── Get user's subscription tier from Neo4j
   ├── Get monthly limit for that tier
   ├── Count usage this period
   └── Throw error if limit reached

2. runGeneration(...)
   └── Call OpenAI API

3. recordGeneration(userId, projectId, entityType, generationId)
   └── Create UsageRecord node in Neo4j
```

### Error Responses

#### No Authentication

```json
{
  "errors": [{
    "message": "Authentication required to use AI generation",
    "extensions": {
      "code": "UNAUTHENTICATED"
    }
  }]
}
```

#### Free Tier

```json
{
  "errors": [{
    "message": "Your plan does not include AI generation. Upgrade to CREATOR or STUDIO to use this feature.",
    "extensions": {
      "code": "NO_GENERATION_CREDITS",
      "requiredPlan": "CREATOR",
      "currentPlan": "FREE"
    }
  }]
}
```

#### Limit Reached

```json
{
  "errors": [{
    "message": "Monthly generation limit reached (100 on CREATOR plan). Upgrade to increase your limit or wait for next billing cycle.",
    "extensions": {
      "code": "GENERATION_LIMIT_REACHED",
      "limit": 100,
      "used": 100,
      "tier": "CREATOR",
      "periodStart": "2026-02-01T00:00:00.000Z",
      "nextReset": "2026-03-01T00:00:00.000Z"
    }
  }]
}
```

## Frontend Integration

### Display Usage Stats

```jsx
import { useQuery } from '@apollo/client';
import { USAGE_STATS } from './queries';

function UsageIndicator() {
  const { data } = useQuery(USAGE_STATS);
  
  if (!data) return null;
  
  const { used, limit, remaining, tier } = data.usageStats;
  const percentage = (used / limit) * 100;
  
  return (
    <div>
      <div>AI Generations: {used} / {limit}</div>
      <ProgressBar value={percentage} />
      {remaining < 10 && (
        <Warning>
          Only {remaining} generations remaining this month.
          <Link to="/pricing">Upgrade to {tier === 'CREATOR' ? 'STUDIO' : 'CREATOR'}</Link>
        </Warning>
      )}
    </div>
  );
}
```

### Handle Limit Errors

```jsx
const [generateEntity, { loading, error }] = useMutation(GENERATE_ENTITY);

const handleGenerate = async () => {
  try {
    await generateEntity({ variables: { input: {...} } });
  } catch (err) {
    if (err.graphQLErrors[0]?.extensions?.code === 'GENERATION_LIMIT_REACHED') {
      // Show upgrade modal
      showUpgradeModal({
        message: 'You've used all your AI generations this month',
        currentPlan: err.graphQLErrors[0].extensions.tier,
        nextReset: err.graphQLErrors[0].extensions.nextReset,
      });
    }
  }
};
```

## Testing

### Manual Testing

1. **Create test user:**
   ```graphql
   mutation {
     register(input: {
       email: "test@example.com"
       password: "password123"
       displayName: "Test User"
     }) {
       token
       user { id }
     }
   }
   ```

2. **Check initial usage (should be 0):**
   ```graphql
   query {
     usageStats {
       tier
       used
       remaining
     }
   }
   ```

3. **Generate entity:**
   ```graphql
   mutation {
     generateEntity(input: {
       projectId: "..."
       entityType: PLACE
       prompt: "A mysterious forest"
     }) {
       generationId
       name
     }
   }
   ```

4. **Verify usage incremented:**
   ```graphql
   query {
     usageStats {
       used  # Should be 1
     }
   }
   ```

### Limit Testing

To test limit enforcement without waiting for 100+ generations:

```javascript
// Temporarily modify limit in usageResolvers.js
const getGenerationLimit = (subscriptionTier) => {
  const limits = {
    FREE: 0,
    CREATOR: 3,  // Changed from 100 for testing
    STUDIO: 10,  // Changed from 1000 for testing
  };
  return limits[subscriptionTier] || 0;
};
```

Then generate 3 entities and verify the 4th fails.

### Automated Tests

See `src/server/graphql/resolvers/__tests__/usageResolvers.test.js` (TODO).

## Future Enhancements

### 1. Usage Analytics

Track additional metrics:

- Average generations per user
- Peak usage times
- Most common entity types generated
- Generation acceptance rate (how many are actually saved)

### 2. Rollover Credits

Allow unused generations to roll over (up to a cap):

```javascript
const used = await getUserGenerationCount(userId, periodStart);
const rollover = await getRolloverCredits(userId);
const effectiveLimit = limit + rollover;
```

### 3. Burst Credits

Temporary credit boosts for special events or promotions:

```cypher
(User)-[:HAS_BOOST {
  credits: 50,
  expiresAt: "2026-03-01T00:00:00Z"
}]->(BoostEvent)
```

### 4. Team Plans

Shared generation pools for organizations:

```cypher
(User)-[:MEMBER_OF]->(Organization)
(Organization)-[:GENERATED]->(UsageRecord)
```

### 5. Per-Project Limits

Allow users to set per-project budgets to avoid one project consuming all credits.

### 6. Usage Notifications

Email/in-app notifications when:

- 80% of monthly limit used
- 90% of monthly limit used
- Limit reached
- New billing period started

## Maintenance

### Clean Up Old Records

Usage records older than 12 months can be archived or deleted:

```cypher
// Archive records older than 12 months
MATCH (r:UsageRecord)
WHERE datetime(r.createdAt) < datetime() - duration({months: 12})
SET r:ArchivedUsageRecord
REMOVE r:UsageRecord
```

### Monitor Database Growth

Each generation adds one UsageRecord node. At scale:

- 10,000 users × 100 generations/month = 1M records/month
- ~12M records/year

Neo4j can handle this, but consider archiving or aggregating old data.

### Audit Usage Data

Periodically verify:

1. No orphaned UsageRecords (disconnected from users)
2. No future-dated createdAt timestamps
3. Usage counts match between cache and database

## Resources

- [Neo4j Date/Time Functions](https://neo4j.com/docs/cypher-manual/current/functions/temporal/)
- [GraphQL Error Handling](https://www.apollographql.com/docs/apollo-server/data/errors/)
- [Stripe Metered Billing](https://stripe.com/docs/billing/subscriptions/metered-billing) (alternative approach)
