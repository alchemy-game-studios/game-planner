# Game Planner - Agent Design Guide

## Overview

Game Planner is a creative IP management tool that separates **IP Building** (universes, characters, places, stories) from **Product Building** (games, books, movies based on that IP). It uses a graph database (Neo4j) to model rich relationships between entities.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  Vite + TypeScript + Tailwind + shadcn/ui + Apollo Client   │
│                     Port 3001                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ GraphQL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                          │
│         Apollo Server + GraphQL + Node.js                    │
│                     Port 3000                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Bolt Protocol
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Neo4j Graph Database                      │
│                     Port 7687                                │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. IP Layer (Creative Foundation)
Entities that represent the creative universe:

| Entity | Description | Container For |
|--------|-------------|---------------|
| **Universe** | Top-level world (e.g., "Eldoria") | Places, Narratives |
| **Place** | Locations in the world | Characters |
| **Character** | People/creatures | Items |
| **Item** | Objects, artifacts | - |
| **Narrative** | Story arcs/campaigns | Events |
| **Event** | Things that happen | - |
| **Tag** | Labels (descriptor/feeling types) | - |

### 2. Product Layer (Commercial Outputs)
Entities for creating products from the IP:

| Entity | Description | Contains |
|--------|-------------|----------|
| **Product** | A game, book, movie, etc. | Attributes, Mechanics, Sections, Components |
| **AttributeDefinition** | User-defined stats (Power, Mana Cost) | - |
| **MechanicDefinition** | User-defined abilities (Flying, Haste) | - |
| **EntityAdaptation** | Maps IP entity to product with stats | - |
| **Section** | Chapters/scenes for passive media | - |

## Graph Relationships

```
Universe -[:CONTAINS]-> Place -[:CONTAINS]-> Character -[:CONTAINS]-> Item

Entity -[:TAGGED]-> Tag

Narrative -[:CONTAINS]-> Event
Event -[:OCCURS_AT]-> Place
Event -[:INVOLVES]-> Character|Item

Product -[:USES_IP]-> Universe
Product -[:CONTAINS]-> AttributeDefinition|MechanicDefinition|Section
EntityAdaptation -[:FOR_PRODUCT]-> Product
EntityAdaptation -[:ADAPTS]-> Character|Item|Place|Event

Entity -[:HAS_IMAGE]-> Image
```

## File Structure

```
src/
├── server/                      # Backend
│   ├── app.js                   # Express server setup
│   ├── graphql/
│   │   ├── schema.graphql       # GraphQL type definitions
│   │   └── graphql-resolvers.js # Neo4j query resolvers
│   └── storage/
│       └── s3-client.js         # MinIO/S3 image storage
│
├── pages/                       # Route pages
│   ├── home.tsx                 # Universe list + Products link
│   ├── edit-entity.tsx          # Generic entity editor
│   ├── products.tsx             # Products list
│   └── product.tsx              # Product detail with tabs
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── add-entity-dialog.tsx    # Create IP entities
│   ├── add-product-dialog.tsx   # Create products
│   ├── entity-search.tsx        # Search entities
│   ├── image-gallery.tsx        # Drag-sortable images
│   └── breadcrumbs.tsx          # Navigation trail
│
├── client-graphql/
│   └── edit-entity/
│       ├── edit-entity-component.jsx  # Main entity editor
│       ├── editable-node-list.tsx     # Add/remove child entities
│       ├── entity-card.tsx            # Entity display card
│       └── hover-editable-text.jsx    # Inline text editing
│
├── context/
│   └── breadcrumb-context.tsx   # Navigation state
│
├── utils/
│   └── graphql-utils.ts         # Mutation builders
│
├── router.tsx                   # React Router config
└── main.tsx                     # App entry point

scripts/
├── seed.js                      # Database seeding
└── wait-for-neo4j.js            # Health check

docker-compose.yml               # Neo4j + MinIO containers
```

## GraphQL Schema Patterns

### Entity Pattern
All IP entities follow this structure:
```graphql
type Entity {
  id: String!
  properties: EntityProperties!
  contents: [ContentItem!]!      # Direct children
  allContents: [DescendantContent!]!  # Recursive children
  tags: [EntityProperties!]!
  images: [Image!]!
  allImages: [EntityImage!]!     # Images from descendants too
}
```

### Query Pattern
```graphql
# Single entity
universe(obj: IdInput!): Entity
character(obj: IdInput!): Entity

# All entities
universes: [Entity!]!
characters: [Entity!]!
```

### Mutation Pattern
```graphql
# CRUD
addCharacter(character: CharacterInput!): Response
editCharacter(character: CharacterInput!): Response
removeCharacter(character: CharacterInput!): Response

# Relationships
relateContains(relation: RelatableInput!): Response
relateTagged(relation: TagRelationInput!): Response
```

## UI Patterns

### 1. Entity Editor (`edit-entity.tsx`)
Generic editor for any IP entity type. Shows:
- Hero image + avatar
- Editable name/description
- Tags (pills that can be added/removed)
- Child entity lists by type
- Image gallery with drag-to-reorder

### 2. Editable Node List
Pattern for managing relationships:
```tsx
<EditableNodeList
  initContents={entity.contents}
  parentId={entity.id}
  parentType="place"
  entityType="character"
  isTagRelation={false}  // true for tags
  onUpdate={refetch}
/>
```

### 3. Dialog Pattern
All dialogs use shadcn/ui Dialog:
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button onClick={handleSubmit}>Submit</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4. Product Tabs
Product pages use tabs for organization:
- **Overview**: Stats cards
- **Attributes**: User-defined stat types (games only)
- **Mechanics**: Keywords/abilities (games only)
- **Components**: Entity adaptations (all products)
- **Sections**: Chapters/scenes (passive media only)

## Resolver Patterns

### Get Single Entity
```javascript
async function getEntity(type, id) {
  const result = await runQuery(`
    MATCH (e:${type} {id: $id})
    OPTIONAL MATCH (e)-[:CONTAINS]->(child)
    OPTIONAL MATCH (e)-[:TAGGED]->(tag:Tag)
    RETURN {...}
  `, { id });

  entity.images = await getImagesForEntity(id);
  return entity;
}
```

### Create Entity
```javascript
async function createEntity(type, input) {
  const id = input.id || uuidv4();
  await runQuery(`CREATE (e:${type} {...})`, props);
  return { message: `${type} created successfully` };
}
```

### Update Relationships
Relationships are replaced, not appended:
```javascript
// Remove existing, then create new
await runQuery(`MATCH (p {id: $id})-[r:CONTAINS]->() DELETE r`, { id });
await runQuery(`
  MATCH (p {id: $id})
  UNWIND $childIds AS childId
  MATCH (c {id: childId})
  CREATE (p)-[:CONTAINS]->(c)
`, { id, childIds });
```

## Common Development Tasks

### Adding a New Entity Type
1. Add to `schema.graphql` (type, input, queries, mutations)
2. Add constraint in `scripts/seed.js`
3. Add resolver helpers in `graphql-resolvers.js`
4. Add CRUD mutations to resolver export
5. Update `add-entity-dialog.tsx` if needed
6. Add seed data

### Adding a New Product Field
1. Add to Product type in `schema.graphql`
2. Add to ProductInput
3. Update `createProduct`/`updateProduct` in resolvers
4. Update `getProduct` query to include field
5. Update `product.tsx` to display it
6. Update `add-product-dialog.tsx` form

### Adding a New Relationship
1. Add mutation to `schema.graphql`
2. Add input type if needed
3. Add resolver that clears old + creates new
4. Create UI component or update existing

## Styling

- **Framework**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix primitives)
- **Theme**: Dark mode (`bg-gray-900`, `text-white`)
- **Fonts**: Custom heading font via `font-heading` class

Common patterns:
```tsx
// Cards
className="p-6 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700"

// Buttons
<Button variant="outline" size="sm">

// Badges
<Badge variant="secondary">Label</Badge>
```

## State Management

- **Server State**: Apollo Client with `useQuery`/`useMutation`
- **UI State**: React useState/useContext
- **Navigation**: React Router v7
- **Breadcrumbs**: Custom context with push/pop/clear

## Key Decisions

1. **User-defined everything**: Attributes and mechanics are templates, not hardcoded
2. **Flexible types**: Dropdowns with "Other" option for custom values
3. **Universal terminology**: "Components" for all entity adaptations
4. **Graph-first**: Relationships are first-class, not foreign keys
5. **Images as nodes**: Images are graph nodes with ranked HAS_IMAGE relationships

## Commands

```bash
npm run setup          # Full setup (install, db, seed)
npm run dev            # Start both servers
npm run db:reset       # Wipe and reseed database
npm run db:seed        # Just reseed (keeps containers)
```

## Ports

| Service | Port |
|---------|------|
| Vite (frontend) | 3001 |
| Express (API) | 3000 |
| Neo4j Bolt | 7687 |
| Neo4j Browser | 7474 |
| MinIO | 9000 |
| MinIO Console | 9001 |
