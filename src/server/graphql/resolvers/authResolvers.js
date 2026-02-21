/**
 * authResolvers.js
 * User authentication resolvers for CanonKiln
 * Handles registration, login, session management
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDriver } from '../neo4j-driver.js';

const JWT_SECRET = process.env.JWT_SECRET || 'canonkiln-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

/**
 * Helper: Create JWT token for user
 */
const createToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Helper: Get user from Neo4j by email
 */
const getUserByEmail = async (session, email) => {
  const result = await session.run(
    'MATCH (u:User {email: $email}) RETURN u',
    { email }
  );
  return result.records.length > 0 ? result.records[0].get('u').properties : null;
};

/**
 * Helper: Get user from Neo4j by ID
 */
const getUserById = async (session, userId) => {
  const result = await session.run(
    'MATCH (u:User {id: $userId}) RETURN u',
    { userId }
  );
  return result.records.length > 0 ? result.records[0].get('u').properties : null;
};

/**
 * Helper: Verify JWT token and extract user info
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export default {
  Query: {
    /**
     * Get current logged-in user
     */
    me: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const driver = getDriver();
      const session = driver.session();
      try {
        const user = await getUserById(session, context.userId);
        if (!user) {
          throw new Error('User not found');
        }
        // Don't return password hash
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } finally {
        await session.close();
      }
    },

    /**
     * Get user by ID (public profile)
     */
    user: async (_, { id }) => {
      const driver = getDriver();
      const session = driver.session();
      try {
        const user = await getUserById(session, id);
        if (!user) {
          return null;
        }
        // Return only public fields
        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        };
      } finally {
        await session.close();
      }
    },
  },

  Mutation: {
    /**
     * Register new user
     */
    register: async (_, { input }) => {
      const { email, password, displayName } = input;

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }

      const driver = getDriver();
      const session = driver.session();
      try {
        // Check if user already exists
        const existingUser = await getUserByEmail(session, email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user in Neo4j
        const userId = uuidv4();
        const now = new Date().toISOString();

        await session.run(
          `CREATE (u:User {
            id: $id,
            email: $email,
            passwordHash: $passwordHash,
            displayName: $displayName,
            createdAt: $createdAt,
            updatedAt: $updatedAt
          })
          RETURN u`,
          {
            id: userId,
            email: email.toLowerCase(),
            passwordHash,
            displayName: displayName || email.split('@')[0],
            createdAt: now,
            updatedAt: now,
          }
        );

        // Create JWT token
        const token = createToken(userId, email);

        return {
          token,
          user: {
            id: userId,
            email: email.toLowerCase(),
            displayName: displayName || email.split('@')[0],
            createdAt: now,
            updatedAt: now,
          },
        };
      } finally {
        await session.close();
      }
    },

    /**
     * Login existing user
     */
    login: async (_, { input }) => {
      const { email, password } = input;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const driver = getDriver();
      const session = driver.session();
      try {
        // Find user
        const user = await getUserByEmail(session, email.toLowerCase());
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        const now = new Date().toISOString();
        await session.run(
          'MATCH (u:User {id: $userId}) SET u.lastLogin = $lastLogin',
          { userId: user.id, lastLogin: now }
        );

        // Create JWT token
        const token = createToken(user.id, user.email);

        // Return user without password hash
        const { passwordHash, ...userWithoutPassword } = user;

        return {
          token,
          user: userWithoutPassword,
        };
      } finally {
        await session.close();
      }
    },

    /**
     * Update user profile
     */
    updateProfile: async (_, { input }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { displayName } = input;
      const driver = getDriver();
      const session = driver.session();
      try {
        const now = new Date().toISOString();
        const result = await session.run(
          `MATCH (u:User {id: $userId})
           SET u.displayName = $displayName,
               u.updatedAt = $updatedAt
           RETURN u`,
          {
            userId: context.userId,
            displayName,
            updatedAt: now,
          }
        );

        if (result.records.length === 0) {
          throw new Error('User not found');
        }

        const user = result.records[0].get('u').properties;
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } finally {
        await session.close();
      }
    },

    /**
     * Change password
     */
    changePassword: async (_, { input }, context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { currentPassword, newPassword } = input;

      if (!currentPassword || !newPassword) {
        throw new Error('Current and new password are required');
      }
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      const driver = getDriver();
      const session = driver.session();
      try {
        // Get current user
        const user = await getUserById(session, context.userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordValid) {
          throw new Error('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        const now = new Date().toISOString();
        await session.run(
          `MATCH (u:User {id: $userId})
           SET u.passwordHash = $passwordHash,
               u.updatedAt = $updatedAt`,
          {
            userId: context.userId,
            passwordHash: newPasswordHash,
            updatedAt: now,
          }
        );

        return { message: 'Password updated successfully' };
      } finally {
        await session.close();
      }
    },
  },
};

/**
 * Auth context middleware
 * Extracts JWT from Authorization header and adds userId to context
 */
export const createAuthContext = ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { userId: null };
  }

  const decoded = verifyToken(token);
  return {
    userId: decoded?.userId || null,
    userEmail: decoded?.email || null,
  };
};
