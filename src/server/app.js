import 'dotenv/config';
import indexRouter from "./routes/index.js";
import testApiRouter from "./routes/testApi.js";
import uploadRouter, { setUploadDriver } from "./routes/upload.js";
import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from "path";
import passport from "passport";
import graphqlSchemaBuilder from "./graphql/graphql-schema-builder.js";
import graphqlResolvers, { setDriver } from "./graphql/graphql-resolvers.js";
import { ApolloServer } from "apollo-server-express";
import neo4j from "neo4j-driver";
import { configureGoogleAuth, setAuthDriver } from "./auth/google-strategy.js";
import stripeWebhooks, { setWebhookDriver } from "./routes/stripe-webhooks.js";

const port = process.env.PORT || 3000;

// Neo4j configuration
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// Initialize Neo4j driver
const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

// Inject driver into resolvers and auth
setDriver(driver);
setUploadDriver(driver);
setAuthDriver(driver);
setWebhookDriver(driver);

const app = express();
const __dirname = import.meta.dirname;

// Frontend URL for CORS and redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Networking & Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'ceda78df-e787-49f5-8e0d-a0f6bba8e0f2',
  resave: false,
  saveUninitialized: false, // Don't create session until user logs in
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Stripe webhook MUST be before express.json() to receive raw body
app.use("/webhooks/stripe", stripeWebhooks);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
  origin: FRONTEND_URL,
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies to be sent
};
app.use(cors(corsOptions));

//-- Network Security Optimizations
app.disable('x-powered-by');

// Authentication
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth
configureGoogleAuth();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbSession = driver.session();
    await dbSession.run('RETURN 1');
    await dbSession.close();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// ===================
// Authentication Routes
// ===================

// Get current user
app.get('/auth/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// Initiate Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(`${FRONTEND_URL}/`);
  }
);

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
});

// GraphQL
const startApolloServer = async () => {
  const graphqlSchema = graphqlSchemaBuilder();

  const server = new ApolloServer({
    typeDefs: graphqlSchema,
    resolvers: graphqlResolvers,
    context: ({ req }) => ({
      user: req.user,
    }),
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  console.log(`GraphQL endpoint ready at /graphql`);
};

// Start Apollo Server
startApolloServer();

// Rendering
app.use(express.static(path.join(__dirname, 'static')));

app.use("/", indexRouter);
app.use("/testApi", testApiRouter);
app.use("/api/upload", uploadRouter);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await driver.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await driver.close();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Neo4j connected to ${NEO4J_URI}`);
});
