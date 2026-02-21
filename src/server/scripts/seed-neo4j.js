/**
 * seed-neo4j.js
 * Sets up Neo4j constraints and indexes for CanonKiln.
 * Also creates a default project and sample data.
 *
 * Run: node src/server/scripts/seed-neo4j.js
 */

import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

const session = driver.session();

async function setupConstraints() {
  console.log('Setting up Neo4j constraints and indexes…');

  const constraints = [
    // Unique IDs for all entity types
    `CREATE CONSTRAINT canon_entity_id IF NOT EXISTS FOR (e:CanonEntity) REQUIRE e.id IS UNIQUE`,
    `CREATE CONSTRAINT project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE`,

    // Indexes for common lookups
    `CREATE INDEX canon_entity_project IF NOT EXISTS FOR (e:CanonEntity) ON (e.projectId)`,
    `CREATE INDEX canon_entity_type IF NOT EXISTS FOR (e:CanonEntity) ON (e.entityType)`,
    `CREATE INDEX canon_entity_name IF NOT EXISTS FOR (e:CanonEntity) ON (e.name)`,
    `CREATE INDEX relationship_project IF NOT EXISTS FOR ()-[r:RELATES_TO]-() ON (r.projectId)`,
  ];

  for (const constraint of constraints) {
    try {
      await session.run(constraint);
      console.log(`  ✓ ${constraint.substring(0, 60)}…`);
    } catch (err) {
      // Constraint may already exist
      if (!err.message.includes('already exists') && !err.message.includes('An equivalent constraint')) {
        console.warn(`  ⚠ ${err.message}`);
      }
    }
  }
}

async function seedDefaultProject() {
  console.log('\nSeeding default project…');

  // Create default project if it doesn't exist
  const result = await session.run(
    `MERGE (p:Project {id: 'default'})
     ON CREATE SET p.name = 'My First World',
                   p.description = 'Default CanonKiln project',
                   p.genre = 'Fantasy',
                   p.createdAt = datetime().epochMillis,
                   p.updatedAt = datetime().epochMillis
     RETURN p`
  );
  console.log(`  ✓ Default project: ${result.records[0].get('p').properties.name}`);
}

async function seedSampleData() {
  console.log('\nSeeding sample world data…');

  // Check if sample data already exists
  const existing = await session.run(
    `MATCH (e:CanonEntity {projectId: 'default'}) RETURN count(e) AS cnt`
  );
  const count = existing.records[0].get('cnt').toNumber();

  if (count > 0) {
    console.log(`  ℹ Skipping sample data — ${count} entities already exist`);
    return;
  }

  const now = new Date().toISOString();

  const entities = [
    {
      id: 'place-ironforge',
      entityType: 'PLACE',
      label: 'Place',
      name: 'Ironforge',
      description: 'A dwarven city built into the heart of a volcanic mountain, famous for its legendary forges.',
      placeType: 'CITY',
      climate: 'Alpine/Volcanic',
      notableFeatures: ['The Great Forge', 'The Iron Throne', 'Deepstone Mines'],
      projectId: 'default',
      x: 100, y: 200,
    },
    {
      id: 'char-elara',
      entityType: 'CHARACTER',
      label: 'Character',
      name: 'Elara Brightshield',
      description: 'A paladin of legendary renown, champion of the Silver Legion and defender of the realm.',
      role: 'Paladin',
      species: 'Human',
      traits: ['Honorable', 'Fierce', 'Compassionate'],
      allegiances: ['Silver Legion', 'Kingdom of Westmark'],
      projectId: 'default',
      x: 350, y: 150,
    },
    {
      id: 'item-sword',
      entityType: 'ITEM',
      label: 'Item',
      name: 'Sword of Light',
      description: 'A blade forged from starfall iron, capable of banishing darkness and smiting undead.',
      itemType: 'WEAPON',
      rarity: 'LEGENDARY',
      powers: ['Banish Undead', 'Illuminate Darkness', 'Holy Smite'],
      projectId: 'default',
      x: 600, y: 100,
    },
    {
      id: 'event-battle',
      entityType: 'EVENT',
      label: 'Event',
      name: 'Battle of the Iron Pass',
      description: 'A decisive clash between the Silver Legion and the Darkfall Horde that determined the fate of the northern territories.',
      eventType: 'BATTLE',
      timelineOrder: 1,
      era: 'Third Age',
      consequences: ['Legion victory', 'Northern borders secured', 'Darkfall Horde scattered'],
      projectId: 'default',
      x: 350, y: 400,
    },
    {
      id: 'faction-silver-legion',
      entityType: 'FACTION',
      label: 'Faction',
      name: 'Silver Legion',
      description: 'An elite order of paladins sworn to protect the realm from darkness and chaos.',
      factionType: 'MILITARY_ORDER',
      alignment: 'Lawful Good',
      goals: ['Protect the realm', 'Eradicate undead', 'Uphold justice'],
      projectId: 'default',
      x: 150, y: 400,
    },
  ];

  for (const entity of entities) {
    const { label, ...props } = entity;
    props.createdAt = now;
    props.updatedAt = now;
    props.allegiances = props.allegiances || [];
    props.traits = props.traits || [];
    props.notableFeatures = props.notableFeatures || [];
    props.powers = props.powers || [];
    props.consequences = props.consequences || [];
    props.goals = props.goals || [];

    await session.run(
      `CREATE (e:${label}:CanonEntity $props) RETURN e.name AS name`,
      { props }
    );
    console.log(`  ✓ Created ${entity.entityType}: ${entity.name}`);
  }

  // Create sample relationships
  const relationships = [
    { from: 'char-elara', to: 'faction-silver-legion', label: 'Member of', id: 'rel-1' },
    { from: 'char-elara', to: 'item-sword', label: 'Wields', id: 'rel-2' },
    { from: 'char-elara', to: 'place-ironforge', label: 'Trained at', id: 'rel-3' },
    { from: 'event-battle', to: 'place-ironforge', label: 'Near', id: 'rel-4' },
    { from: 'faction-silver-legion', to: 'event-battle', label: 'Fought in', id: 'rel-5' },
    { from: 'char-elara', to: 'event-battle', label: 'Commanded at', id: 'rel-6' },
  ];

  for (const rel of relationships) {
    await session.run(
      `MATCH (from:CanonEntity {id: $fromId}), (to:CanonEntity {id: $toId})
       CREATE (from)-[:RELATES_TO {id: $id, label: $label, projectId: 'default', createdAt: $now}]->(to)`,
      { fromId: rel.from, toId: rel.to, id: rel.id, label: rel.label, now }
    );
    console.log(`  ✓ Relationship: ${rel.label}`);
  }
}

async function main() {
  try {
    await setupConstraints();
    await seedDefaultProject();
    await seedSampleData();
    console.log('\n✅ Neo4j setup complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
