# CanonKiln (game-planner)

A full-stack web application for world-building and game development planning, powered by a graph database.

## Tech Stack

- **Frontend**: React 18, TypeScript
- **API**: GraphQL (Apollo Client + Apollo Server)
- **Backend**: Express.js
- **Database**: Neo4j 5 (graph database)
- **Auth**: Passport.js

## Prerequisites

- Node.js 18+
- Docker and Docker Compose

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/alchemy-game-studios/game-planner.git
cd game-planner
npm install

# 2. Set up environment
cp .env.example .env

# 3. Start Neo4j database
docker compose up -d

# 4. Wait for Neo4j to be ready (check http://localhost:7474)

# 5. Start the dev server
npm start
```

The app runs at http://localhost:3000 with the GraphQL playground at http://localhost:3000/graphql.

## Environment Variables

See `.env.example` for all configuration options.

## Database

Neo4j runs via Docker Compose:

```bash
docker compose up -d     # Start
docker compose down      # Stop
```

Neo4j Browser: http://localhost:7474 (neo4j/password)

## CI

GitHub Actions runs lint, tests, and build on every push/PR to main.

## License

See [LICENSE](LICENSE).
