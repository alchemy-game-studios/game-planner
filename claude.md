# Game Planner

Full-stack web application for game development planning built with React, GraphQL, and Neo4j.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui (New York style, Lucide icons)
- **Routing**: React Router
- **Data**: Apollo Client, GraphQL
- **Backend**: Express, Apollo Server
- **Database**: Neo4j (graph database)
- **Auth**: Passport.js (integrated but not fully implemented)
- **Testing**: Jest, React Testing Library

## Project Structure

```
src/
├── main.tsx               # Vite entry point with Apollo Client
├── App.tsx                # Main React component
├── router.tsx             # React Router configuration
├── main.css               # Global styles (Tailwind)
├── components/
│   └── ui/                # shadcn/ui components (button, dialog, drawer, etc.)
├── pages/                 # Route pages
├── lib/
│   └── utils.ts           # Utility functions (cn helper)
├── client-graphql/        # GraphQL queries/mutations and components
│   └── edit-entity/       # Entity editing components
├── apollo/                # Apollo Client provider
└── server/
    ├── app.js             # Express server setup
    ├── auth/              # Passport authentication
    ├── graphql/           # Schema and resolvers
    └── routes/            # Express routes
```

## Path Aliases

- `@/` → `./src` (configured in vite.config.ts and tsconfig.json)

## Development Commands

```bash
# Install dependencies
npm install

# Start Vite dev server (frontend on port 3001)
npx vite

# Start Express server (backend on port 3000)
gulp server-start

# Run both concurrently
gulp start

# Build for production
npx vite build

# Run tests
npm test

# Lint
gulp lint
```

## Architecture

- Frontend runs on port 3001 (Vite dev server)
- Backend runs on port 3000 (Express)
- Vite proxies `/graphql` requests to backend
- GraphQL endpoint: `POST /graphql`
- Neo4j connection: `bolt://localhost:7687`

## UI Components (shadcn/ui)

Components in `src/components/ui/` use:
- Radix UI primitives
- Tailwind CSS for styling
- `class-variance-authority` for variants
- `cn()` utility for class merging

Add new components: `npx shadcn@latest add <component>`

## Routes

Defined in `src/router.tsx`:
- `/` - Main app (renders Breeds component)
- `/edit/:type/:id` - Edit entity page

## GraphQL Schema

Key types in `src/server/graphql/schema.graphql`:
- `Query.places` - Fetches Place nodes from Neo4j
- `Query.hello` - Returns greeting message
- `Mutation.submitText` - Example mutation

## Code Patterns

### Adding UI Components
```bash
npx shadcn@latest add button
```

### GraphQL Queries (Frontend)
Components use Apollo hooks (`useQuery`, `useMutation`) in `src/client-graphql/`.

### Adding New Features
1. Define types in `schema.graphql`
2. Add resolver in `graphql-resolvers.js`
3. Create React component with Apollo hooks
4. Add route in `router.tsx` if needed

## Configuration Files

- `vite.config.ts` - Vite bundler with React and Tailwind plugins
- `tailwind.config.mjs` - Tailwind theme customization
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript settings with path aliases
- `gulpfile.js` - Build and development tasks
- `jest.config.js` - Test runner configuration

## Notes

- Database credentials are hardcoded (neo4j/password) - consider using environment variables
- ES Modules enabled (`"type": "module"` in package.json)
- Custom fonts: Inter (sans), Playfair Display (heading)
