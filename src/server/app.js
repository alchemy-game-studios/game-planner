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
import { createHandler } from "graphql-http/lib/use/express";
import graphqlSchemaBuilder from "./graphql/graphql-schema-builder.js";
import graphqlResolvers from "./graphql/graphql-resolvers.js";

const port = 3000;

const app = express();
const __dirname = import.meta.dirname;

// Networking & Session
app.use(session({
  secret: 'ceda78df-e787-49f5-8e0d-a0f6bba8e0f2',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(express.json());
app.use(express.urlencoded({extended: false }));
app.use(cookieParser());

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
const graphqlSchema = graphqlSchemaBuilder();

app.all(
  "/graphql",
  createHandler({
    schema: graphqlSchema,
    rootValue: graphqlResolvers
  })
)

// Rendering
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRouter);
app.use("/testApi", testApiRouter);

app.use(cors());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
