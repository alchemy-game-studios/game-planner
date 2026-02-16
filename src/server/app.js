import indexRouter from "./routes/index.js";
import testApiRouter from "./routes/testApi.js";
import express from "express";
import session from "express-session";
import cors  from "cors";
import cookieParser from 'cookie-parser';
import path from "path";
import passport from "passport";
import { GraphQLLocalStrategy } from "graphql-passport";
import BasicGraphQLPassportCb from "./auth/basic-graphql-passport.js";
import graphqlSchemaBuilder from "./graphql/graphql-schema-builder.js";
import graphqlResolvers from "./graphql/graphql-resolvers.js";
import { ApolloServer } from "apollo-server-express"; // Import Apollo Server



const port = process.env.PORT || 3000;

const app = express();
const __dirname = import.meta.dirname;

// Networking & Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'ceda78df-e787-49f5-8e0d-a0f6bba8e0f2',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(express.json());
app.use(express.urlencoded({extended: false }));
app.use(cookieParser());

const corsOptions = {
  origin: '*', // The origin of your client
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // Allowed HTTP methods
  allowedHeaders: '*', // Allow all headers
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
// Database




// GraphQL
const startApolloServer = async () => {
  const graphqlSchema = graphqlSchemaBuilder();  // Your schema
  
  const server = new ApolloServer({
    typeDefs: graphqlSchema, // Use schema
    resolvers: graphqlResolvers, // Your resolvers
    context: ({ req }) => ({
      user: req.user, // Add user info or other context data if needed
    }),
  });

  await server.start(); // Start the Apollo server
  server.applyMiddleware({ app, path: '/graphql' }); // Apply middleware
};

// Start Apollo Server
startApolloServer();

// Rendering
app.use(express.static(path.join(__dirname, 'static')));



app.use("/", indexRouter);
app.use("/testApi", testApiRouter);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
