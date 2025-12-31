# Game Planner

Full-stack web application for game development planning built with React, GraphQL, and Neo4j.

## Note for AI Assistants

When searching for files in this codebase, **always ignore `node_modules/`**. Use glob patterns that exclude it or filter results appropriately.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui (New York style, Lucide icons)
- **Routing**: React Router
- **Data**: Apollo Client, GraphQL
- **Backend**: Express, Apollo Server
- **Database**: Neo4j 5 (graph database via Docker)
- **Storage**: MinIO (S3-compatible object storage for images)
- **Auth**: Passport.js (integrated but not fully implemented)
- **Testing**: Jest, React Testing Library

## Quick Start

```bash
# Full setup (install deps, start database, seed data)
npm run setup

# Start development servers
npm run dev
```

This starts:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000/graphql
- Neo4j Browser: http://localhost:7474
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose

## Project Structure

```
├── src/
│   ├── main.tsx               # Vite entry point with Apollo Client
│   ├── App.tsx                # Main React component
│   ├── router.tsx             # React Router configuration
│   ├── main.css               # Global styles (Tailwind)
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── pages/                 # Route pages
│   ├── lib/
│   │   └── utils.ts           # Utility functions (cn helper)
│   ├── client-graphql/        # GraphQL queries/mutations and components
│   │   └── edit-entity/       # Entity editing components
│   └── server/
│       ├── app.js             # Express server setup
│       ├── auth/              # Passport authentication
│       ├── graphql/           # Schema and resolvers
│       │   ├── schema.graphql # GraphQL type definitions
│       │   └── graphql-resolvers.js
│       ├── repository/        # Neo4j data access
│       ├── routes/            # Express routes
│       │   └── upload.js      # Image upload endpoint
│       └── storage/           # S3/MinIO client
│           └── s3-client.js   # S3 abstraction (works with MinIO or AWS)
├── scripts/
│   ├── seed.js                # Database seeding script
│   ├── wait-for-neo4j.js      # Health check script
│   └── migrate-images.js      # Migrate existing images to MinIO
├── docker-compose.yml         # Neo4j + MinIO container config
└── package.json               # npm scripts and dependencies
```

## npm Scripts

### Development
```bash
npm run dev           # Start both client and server concurrently
npm run dev:client    # Start Vite dev server only (port 3001)
npm run dev:server    # Start Express server only (port 3000)
```

### Database
```bash
npm run db:start           # Start Neo4j + MinIO containers
npm run db:stop            # Stop containers
npm run db:wait            # Wait for Neo4j to be ready
npm run db:seed            # Seed database with sample data
npm run db:migrate-images  # Migrate existing images to MinIO
npm run db:reset           # Stop, clear all data, restart, and reseed
```

### Build & Test
```bash
npm run build         # Build frontend with Vite
npm run test          # Run Jest tests
npm run lint          # Run ESLint
```

### Setup
```bash
npm run setup         # Full setup: install, start db, seed
npm start             # Alias for npm run dev
```

### Stripe
```bash
npm run stripe:listen # Forward Stripe webhooks to local server
```

## Architecture

```
┌─────────────────────────────────────┐
│     React Frontend (port 3001)      │
│  Vite + Apollo Client + Tailwind    │
└─────────────────┬───────────────────┘
                  │ /graphql (proxied)
┌─────────────────▼───────────────────┐
│    Express Backend (port 3000)      │
│      Apollo Server + GraphQL        │
└─────────────────┬───────────────────┘
                  │ bolt://localhost:7687
┌─────────────────▼───────────────────┐
│        Neo4j (port 7687)            │
│       Graph Database (Docker)       │
└─────────────────────────────────────┘
```

## Data Model

### Entity Types
- **Universe** - Top-level game world container
- **Place** - Locations within a universe
- **Character** - Characters that inhabit places
- **Item** - Items that belong to characters
- **Tag** - Labels that can be applied to any entity
- **Image** - Images associated with entities (stored in MinIO)

### Relationships
- `CONTAINS`: Universe → Place → Character → Item (hierarchy)
- `TAGGED`: Any entity → Tag
- `HAS_IMAGE`: Any entity → Image (with rank property)

### Entity Properties
- `id` (UUID)
- `name`
- `description`
- `type`

## Path Aliases

- `@/` → `./src` (configured in vite.config.ts and tsconfig.json)

## UI Components (shadcn/ui)

Components in `src/components/ui/` use:
- Radix UI primitives
- Tailwind CSS for styling
- `class-variance-authority` for variants
- `cn()` utility for class merging

Add new components:
```bash
npx shadcn@latest add <component>
```

## Routes

Defined in `src/router.tsx`:
- `/` - Main app
- `/edit/:type/:id` - Edit entity page

## GraphQL API

### Queries
```graphql
universe(obj: IdInput!): Entity
universes: [Entity!]!
place(obj: IdInput!): Entity
places: [Entity!]!
character(obj: IdInput!): Entity
characters: [Entity!]!
tag(obj: IdInput!): Entity
tags: [Entity!]!
searchEntities(query: String!, type: String): [Entity!]!
```

### Mutations
```graphql
addUniverse/editUniverse/removeUniverse
addPlace/editPlace/removePlace
addCharacter/editCharacter/removeCharacter
addTag/editTag/removeTag
relateContains(relation: RelatableInput!): Response
relateTagged(relation: TagRelationInput!): Response
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend server port |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j connection URI |
| `NEO4J_USER` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `password` | Neo4j password |
| `SESSION_SECRET` | - | Express session secret (generate a random string) |
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3000/auth/google/callback` | OAuth callback URL |
| `STRIPE_SECRET_KEY` | - | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | - | Stripe webhook signing secret (from CLI) |
| `STRIPE_PRICE_*` | - | Stripe price IDs for subscriptions/credits |
| `FRONTEND_URL` | `http://localhost:3001` | Frontend URL for OAuth redirects |
| `S3_ENDPOINT` | `http://localhost:9000` | S3/MinIO endpoint |
| `S3_BUCKET` | `game-planner-images` | S3 bucket name |
| `S3_ACCESS_KEY` | `minioadmin` | S3 access key |
| `S3_SECRET_KEY` | `minioadmin` | S3 secret key |
| `S3_REGION` | `us-east-1` | S3 region |

See `.env.example` for a complete template. For production with AWS S3, change the endpoint and credentials.

## Seed Data

The seed script (`scripts/seed.js`) creates sample data:
- 2 Universes (Eldoria fantasy, Neon Sprawl cyberpunk)
- 4 Places (2 per universe)
- 8 Characters (2 per place)
- 10 Items (distributed among characters)
- 6 Tags with relationships

## Configuration Files

- `vite.config.ts` - Vite bundler with React and Tailwind plugins
- `tailwind.config.mjs` - Tailwind theme customization
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript settings with path aliases
- `docker-compose.yml` - Neo4j container configuration
- `jest.config.js` - Test runner configuration

## Troubleshooting

### Neo4j won't start
```bash
# Check Docker is running
docker ps

# View Neo4j logs
docker compose logs neo4j

# Reset database completely
npm run db:reset
```

### Port already in use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :7687

# Kill process
kill -9 <PID>
```

### GraphQL errors
- Check Neo4j is running: `npm run db:wait`
- Check health endpoint: `curl http://localhost:3000/health`
- View Neo4j Browser: http://localhost:7474 (neo4j/password)

## Stacked PRs

We use stacked PRs for feature development. When creating a new feature branch:

1. Branch from the previous feature branch, not main
2. PRs should target the previous feature branch
3. Merge in order: base PR first, then dependent PRs

Example:
```
main
  └── mechanics-1 (PR #7 → main)
        └── account (PR → mechanics-1)
```

This allows incremental review while keeping related changes together.

## Stripe Webhook Setup

For local development with Stripe webhooks (subscriptions, payments):

### First-time setup

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   npm run stripe:listen
   ```

4. Copy the webhook signing secret displayed (starts with `whsec_...`) to your `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

### Ongoing development

- Run `npm run stripe:listen` in a separate terminal whenever testing Stripe flows
- The webhook secret **expires when the listener stops** - if you restart the listener, update `.env` with the new secret
- Keep the listener running during development to receive webhook events

### When to refresh the secret

- After restarting your machine
- After stopping and restarting the stripe listener
- If webhook events aren't being received

The secret in `.env` is specific to your local Stripe CLI session. Don't commit real secrets to version control.
