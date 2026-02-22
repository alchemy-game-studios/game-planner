# CanonKiln Documentation

## Overview

CanonKiln is a graph-first creative IP management system built with:
- **Frontend:** React with TypeScript
- **Backend:** Express + Apollo GraphQL
- **Database:** Neo4j (graph database)
- **AI:** OpenAI GPT-4 for AI-constrained generation
- **Payments:** Stripe for subscription management
- **Auth:** JWT-based authentication

## Documentation

- **[Authentication API](./API_AUTH.md)** - User registration, login, and session management
- **[GraphQL Schema](../src/server/graphql/schema.graphql)** - Complete API schema
- **[Environment Variables](../.env.example)** - Configuration reference

## Quick Start

### Prerequisites

- Node.js 18+
- Neo4j 5.x running locally or remote instance
- (Optional) OpenAI API key for AI generation
- (Optional) Stripe account for payments

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# At minimum, set NEO4J_PASSWORD and JWT_SECRET

# Seed Neo4j database (creates constraints, indexes, sample data)
npm run seed

# Start development server (runs both client and server)
npm run dev

# Or run separately:
npm run dev:server  # Backend on port 3000
npm run dev:client  # Frontend (webpack-dev-server)
```

### First Time Setup

1. **Register a user:**
   - Visit http://localhost:3000
   - Create an account (or use GraphQL Playground)
   - Receive JWT token

2. **Create your first project:**
   - Use the project selector dropdown
   - Click "New Project"
   - Start adding entities to your canon

3. **Explore the graph:**
   - Add entities (Places, Characters, Items, Events, Factions)
   - Create relationships between entities
   - Use the graph visualization to explore connections

## Core Concepts

### Projects

Projects are the top-level container for your creative IP. Each project contains:
- **Entities:** The building blocks of your world (places, characters, etc.)
- **Relationships:** Connections between entities
- **Graph visualization:** Interactive view of your canon

Users can only see and modify their own projects.

### Entity Types

1. **Places** - Locations in your world (cities, dungeons, regions)
2. **Characters** - People, creatures, NPCs
3. **Items** - Weapons, artifacts, tools
4. **Events** - Historical moments, battles, treaties
5. **Factions** - Organizations, guilds, governments

### Relationships

Entities can be connected with labeled relationships:
- "Character **lives in** Place"
- "Character **wields** Item"
- "Faction **fought in** Event"

### AI-Constrained Generation

Generate new entities that are consistent with your existing canon:
1. Select entity type to generate
2. Choose existing entities to constrain generation
3. AI analyzes your canon and generates entity that fits
4. Review, refine, and accept into canon

## Architecture

### Frontend (src/)

```
src/
├── components/
│   ├── CanonGraph.jsx       # Graph visualization (ReactFlow)
│   ├── EntityPanel.jsx      # Entity list sidebar
│   ├── EntityDetail.jsx     # Entity detail view
│   └── AIGenerationPanel.jsx # AI generation UI
├── client-graphql/
│   └── canon-operations.js  # GraphQL queries/mutations
└── App.tsx                  # Main application
```

### Backend (src/server/)

```
src/server/
├── graphql/
│   ├── schema.graphql       # GraphQL schema definition
│   ├── graphql-resolvers.js # Combined resolvers
│   ├── neo4j-driver.js      # Neo4j connection
│   └── resolvers/
│       ├── authResolvers.js      # User auth
│       ├── entityResolvers.js    # Entity CRUD
│       ├── generationResolvers.js # AI generation
│       ├── projectResolvers.js   # Project management
│       └── stripeResolvers.js    # Payments
├── scripts/
│   └── seed-neo4j.js        # Database setup
└── app.js                   # Express + Apollo server
```

### Database (Neo4j)

```cypher
# Node types
(:User)           - User accounts
(:Project)        - Projects (owned by users)
(:CanonEntity)    - Base label for all entities
(:Place)          - Specific entity type
(:Character)      - Specific entity type
(:Item)           - Specific entity type
(:Event)          - Specific entity type
(:Faction)        - Specific entity type

# Relationships
()-[:RELATES_TO]->()  - Generic entity relationship (labeled)
```

## API Overview

### Authentication

See [API_AUTH.md](./API_AUTH.md) for complete authentication documentation.

```graphql
# Register
mutation {
  register(input: { email: "...", password: "..." }) {
    token
    user { id email }
  }
}

# Login
mutation {
  login(input: { email: "...", password: "..." }) {
    token
    user { id email }
  }
}
```

### Projects

```graphql
# List my projects
query {
  projects {
    id
    name
    entityCount
    relationshipCount
  }
}

# Create project
mutation {
  createProject(input: { name: "My World", genre: "Fantasy" }) {
    id
    name
  }
}
```

### Entities

```graphql
# List entities
query {
  entities(projectId: "...") {
    ... on Character {
      id
      name
      description
      role
    }
    ... on Place {
      id
      name
      description
      placeType
    }
  }
}

# Create entity
mutation {
  createCharacter(input: {
    projectId: "..."
    name: "Elara"
    description: "A legendary paladin"
    role: "Paladin"
  }) {
    id
    name
  }
}
```

### Graph Visualization

```graphql
# Get full graph for visualization
query {
  canonGraph(projectId: "...") {
    nodes {
      id
      name
      entityType
      x
      y
    }
    edges {
      id
      source
      target
      label
    }
    entityCount
    relationshipCount
  }
}
```

### AI Generation

```graphql
# Generate entity
mutation {
  generateEntity(input: {
    projectId: "..."
    entityType: CHARACTER
    prompt: "A rival to Elara"
    constrainedByEntityIds: ["character-elara"]
  }) {
    generationId
    name
    description
    suggestedRelationships {
      targetName
      label
      rationale
    }
  }
}

# Accept generated entity into canon
mutation {
  acceptGeneratedEntity(input: {
    generationId: "..."
    projectId: "..."
  }) {
    ... on Character {
      id
      name
    }
  }
}
```

## Development

### Scripts

```bash
npm run dev          # Start both client and server
npm run dev:server   # Start backend only
npm run dev:client   # Start webpack-dev-server
npm run build        # Build for production
npm run test         # Run tests
npm run seed         # Seed Neo4j database
```

### Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- EntityPanel

# Run with coverage
npm test -- --coverage
```

### Debugging

**Backend (Node.js):**
```bash
# Add to package.json scripts:
"debug:server": "node --inspect src/server/app.js"

# Then connect with Chrome DevTools or VS Code
```

**GraphQL Playground:**
- Visit http://localhost:3000/graphql
- Interactive query builder with schema docs
- Test mutations and queries

**Neo4j Browser:**
- Visit http://localhost:7474
- Explore graph structure
- Run Cypher queries

## Deployment

### Environment Variables (Production)

Required:
- `JWT_SECRET` - Strong random string for JWT signing
- `NEO4J_URI` - Neo4j database connection string
- `NEO4J_USER` - Neo4j username
- `NEO4J_PASSWORD` - Neo4j password

Optional:
- `OPENAI_API_KEY` - For AI generation (falls back to mock mode)
- `STRIPE_SECRET_KEY` - For payments (falls back to free tier)
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `APP_URL` - Your deployed app URL

### Build

```bash
npm run build
# Outputs to build/ directory
```

### Serve

```bash
# Production mode
NODE_ENV=production node src/server/app.js
```

## Subscription Plans

| Plan | Projects | Entities/Project | AI Credits/Month |
|------|----------|------------------|------------------|
| Free | 1 | 50 | 10 |
| Creator | 5 | 500 | 100 |
| Studio | Unlimited | Unlimited | 1000 |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
