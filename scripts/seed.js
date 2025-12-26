import neo4j from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

// UUIDs that match existing images in public/entity-images/
const UNIVERSE_1_ID = '1e147ce9-cc44-45a9-ae7e-97ed2ebfc382';
const UNIVERSE_2_ID = '7198a74d-8939-4262-a69d-00192db9c9ff';
const PLACE_1_ID = '9919e21f-d9e9-4449-9068-329ba5d2b50b';
const PLACE_2_ID = 'db421343-1ce6-41e4-972c-b13b6dd06877';

const seedData = {
  universes: [
    {
      id: UNIVERSE_1_ID,
      name: 'Eldoria',
      description: 'A vast fantasy realm where magic flows through ancient ley lines and kingdoms rise and fall with the tides of power.',
      type: 'fantasy'
    },
    {
      id: UNIVERSE_2_ID,
      name: 'Neon Sprawl',
      description: 'A cyberpunk megacity in 2087 where corporations rule and hackers fight for freedom in the digital underground.',
      type: 'cyberpunk'
    }
  ],
  places: [
    {
      id: PLACE_1_ID,
      name: 'Crystal Citadel',
      description: 'The shimmering capital of Eldoria, built atop a massive crystal formation that amplifies magical energy.',
      type: 'city',
      universeId: UNIVERSE_1_ID
    },
    {
      id: PLACE_2_ID,
      name: 'Shadowmere Forest',
      description: 'An ancient woodland shrouded in perpetual twilight, home to mysterious creatures and forgotten ruins.',
      type: 'forest',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'place-003',
      name: 'Sector 7 Underground',
      description: 'The lawless underbelly of the megacity where black markets thrive and rebels plot against corporate overlords.',
      type: 'district',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'place-004',
      name: 'Nexus Tower',
      description: 'The gleaming corporate headquarters of OmniCorp, stretching 200 floors into the smog-choked sky.',
      type: 'building',
      universeId: UNIVERSE_2_ID
    }
  ],
  characters: [
    {
      id: 'char-001',
      name: 'Archmage Thalion',
      description: 'The wise and powerful leader of the Mage Council, guardian of ancient magical knowledge.',
      type: 'mage',
      placeId: PLACE_1_ID
    },
    {
      id: 'char-002',
      name: 'Lyra Nightwhisper',
      description: 'A rogue ranger who protects travelers from the dangers lurking in Shadowmere Forest.',
      type: 'ranger',
      placeId: PLACE_2_ID
    },
    {
      id: 'char-003',
      name: 'Zero',
      description: 'An elite hacker with a mysterious past, fighting to expose corporate corruption.',
      type: 'hacker',
      placeId: 'place-003'
    },
    {
      id: 'char-004',
      name: 'Director Chen',
      description: 'The ruthless CEO of OmniCorp who will stop at nothing to maintain control.',
      type: 'executive',
      placeId: 'place-004'
    }
  ],
  tags: [
    { id: 'tag-001', name: 'Magic', description: 'Related to magical abilities or artifacts', type: 'descriptor' },
    { id: 'tag-002', name: 'Dangerous', description: 'Poses significant threat', type: 'feeling' },
    { id: 'tag-003', name: 'Technology', description: 'Related to advanced technology', type: 'descriptor' },
    { id: 'tag-004', name: 'Mysterious', description: 'Has unknown or hidden aspects', type: 'feeling' },
    { id: 'tag-005', name: 'Political', description: 'Involved in power struggles', type: 'descriptor' },
    { id: 'tag-006', name: 'Ancient', description: 'From a bygone era', type: 'descriptor' }
  ],
  tagRelations: [
    { entityId: UNIVERSE_1_ID, tagId: 'tag-001' },
    { entityId: UNIVERSE_1_ID, tagId: 'tag-006' },
    { entityId: UNIVERSE_2_ID, tagId: 'tag-003' },
    { entityId: UNIVERSE_2_ID, tagId: 'tag-002' },
    { entityId: PLACE_1_ID, tagId: 'tag-001' },
    { entityId: PLACE_1_ID, tagId: 'tag-005' },
    { entityId: PLACE_2_ID, tagId: 'tag-004' },
    { entityId: PLACE_2_ID, tagId: 'tag-002' },
    { entityId: 'place-003', tagId: 'tag-002' },
    { entityId: 'place-004', tagId: 'tag-003' },
    { entityId: 'place-004', tagId: 'tag-005' },
    { entityId: 'char-001', tagId: 'tag-001' },
    { entityId: 'char-002', tagId: 'tag-004' },
    { entityId: 'char-003', tagId: 'tag-003' },
    { entityId: 'char-004', tagId: 'tag-005' }
  ]
};

async function clearDatabase(session) {
  console.log('Clearing existing data...');
  await session.run('MATCH (n) DETACH DELETE n');
}

async function createConstraints(session) {
  console.log('Creating constraints...');
  const constraints = [
    'CREATE CONSTRAINT universe_id IF NOT EXISTS FOR (u:Universe) REQUIRE u.id IS UNIQUE',
    'CREATE CONSTRAINT place_id IF NOT EXISTS FOR (p:Place) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT character_id IF NOT EXISTS FOR (c:Character) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:Tag) REQUIRE t.id IS UNIQUE'
  ];

  for (const constraint of constraints) {
    try {
      await session.run(constraint);
    } catch (e) {
      // Constraint may already exist
    }
  }
}

async function seedUniverses(session) {
  console.log('Seeding universes...');
  for (const universe of seedData.universes) {
    await session.run(
      'CREATE (u:Universe {id: $id, name: $name, description: $description, type: $type})',
      universe
    );
  }
}

async function seedPlaces(session) {
  console.log('Seeding places...');
  for (const place of seedData.places) {
    await session.run(
      `CREATE (p:Place {id: $id, name: $name, description: $description, type: $type})
       WITH p
       MATCH (u:Universe {id: $universeId})
       CREATE (u)-[:CONTAINS]->(p)`,
      place
    );
  }
}

async function seedCharacters(session) {
  console.log('Seeding characters...');
  for (const character of seedData.characters) {
    await session.run(
      `CREATE (c:Character {id: $id, name: $name, description: $description, type: $type})
       WITH c
       MATCH (p:Place {id: $placeId})
       CREATE (p)-[:CONTAINS]->(c)`,
      character
    );
  }
}

async function seedTags(session) {
  console.log('Seeding tags...');
  for (const tag of seedData.tags) {
    await session.run(
      'CREATE (t:Tag {id: $id, name: $name, description: $description, type: $type})',
      tag
    );
  }
}

async function seedTagRelations(session) {
  console.log('Seeding tag relations...');
  for (const relation of seedData.tagRelations) {
    await session.run(
      `MATCH (e {id: $entityId}), (t:Tag {id: $tagId})
       CREATE (e)-[:TAGGED]->(t)`,
      relation
    );
  }
}

async function seed() {
  const session = driver.session();

  try {
    console.log(`Connecting to Neo4j at ${NEO4J_URI}...`);

    await clearDatabase(session);
    await createConstraints(session);
    await seedUniverses(session);
    await seedPlaces(session);
    await seedCharacters(session);
    await seedTags(session);
    await seedTagRelations(session);

    console.log('Seeding complete!');
    console.log(`Created: ${seedData.universes.length} universes, ${seedData.places.length} places, ${seedData.characters.length} characters, ${seedData.tags.length} tags`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
