import indexRouter from "./routes/index.js";
import testApiRouter from "./routes/testApi.js";
import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from "path";
import passport from "passport";
import { GraphQLLocalStrategy } from "graphql-passport";
import BasicGraphQLPassportCb from "./auth/basic-graphql-passport.js";
import graphqlSchemaBuilder from "./graphql/graphql-schema-builder.js";
import graphqlResolvers, { setDriver } from "./graphql/graphql-resolvers.js";
import { ApolloServer } from "apollo-server-express";
import neo4j from "neo4j-driver";

const port = process.env.PORT || 3000;

// Neo4j configuration
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

// Initialize Neo4j driver
const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

// Inject driver into resolvers
setDriver(driver);

const app = express();
const __dirname = import.meta.dirname;

// Networking & Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'ceda78df-e787-49f5-8e0d-a0f6bba8e0f2',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: '*',
};
app.use(cors(corsOptions));

//-- Network Security Optimizations
app.disable('x-powered-by');

// Authentication
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GraphQLLocalStrategy(BasicGraphQLPassportCb)
);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
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
