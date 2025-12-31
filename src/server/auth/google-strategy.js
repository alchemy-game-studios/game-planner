import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import { SUBSCRIPTION_TIERS } from '../config/tiers.js';

let neo4jDriver = null;

export function setAuthDriver(driver) {
  neo4jDriver = driver;
}

// Find or create user from Google profile
async function findOrCreateUser(profile) {
  const session = neo4jDriver.session();

  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const displayName = profile.displayName || email?.split('@')[0] || 'User';
    const avatarUrl = profile.photos?.[0]?.value || null;

    if (!email) {
      throw new Error('Email is required from Google profile');
    }

    // Try to find existing user by googleId
    const existingResult = await session.run(
      'MATCH (u:User {googleId: $googleId}) RETURN u',
      { googleId }
    );

    if (existingResult.records.length > 0) {
      // Update last login and return existing user
      const updateResult = await session.run(
        `MATCH (u:User {googleId: $googleId})
         SET u.lastLoginAt = $lastLoginAt,
             u.avatarUrl = $avatarUrl
         RETURN u`,
        { googleId, lastLoginAt: new Date().toISOString(), avatarUrl }
      );
      return updateResult.records[0].get('u').properties;
    }

    // Check if user exists with same email (maybe from seed data)
    const emailResult = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email }
    );

    if (emailResult.records.length > 0) {
      // Link Google account to existing user
      const updateResult = await session.run(
        `MATCH (u:User {email: $email})
         SET u.googleId = $googleId,
             u.lastLoginAt = $lastLoginAt,
             u.avatarUrl = $avatarUrl
         RETURN u`,
        { email, googleId, lastLoginAt: new Date().toISOString(), avatarUrl }
      );
      return updateResult.records[0].get('u').properties;
    }

    // Create new user with free tier
    const now = new Date().toISOString();
    const creditsResetAt = new Date();
    creditsResetAt.setMonth(creditsResetAt.getMonth() + 1);

    const freeTier = SUBSCRIPTION_TIERS.free;

    const createResult = await session.run(
      `CREATE (u:User {
        id: $id,
        email: $email,
        googleId: $googleId,
        displayName: $displayName,
        avatarUrl: $avatarUrl,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        credits: $credits,
        creditsResetAt: $creditsResetAt,
        entityCount: 0,
        createdAt: $createdAt,
        lastLoginAt: $lastLoginAt
      })
      RETURN u`,
      {
        id: uuidv4(),
        email,
        googleId,
        displayName,
        avatarUrl,
        credits: freeTier.limits.monthlyCredits,
        creditsResetAt: creditsResetAt.toISOString(),
        createdAt: now,
        lastLoginAt: now
      }
    );

    return createResult.records[0].get('u').properties;
  } finally {
    await session.close();
  }
}

// Get user by ID for session deserialization
export async function getUserById(userId) {
  const session = neo4jDriver.session();

  try {
    const result = await session.run(
      'MATCH (u:User {id: $userId}) RETURN u',
      { userId }
    );

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
}

export function configureGoogleAuth() {
  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser(profile);
          done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );

  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (userId, done) => {
    try {
      const user = await getUserById(userId);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
