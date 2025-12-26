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
    },
    {
      id: 'char-005',
      name: 'Seraphina the Bold',
      description: 'A legendary knight sworn to protect the Crystal Citadel, known for her unbreakable spirit.',
      type: 'knight',
      placeId: PLACE_1_ID
    },
    {
      id: 'char-006',
      name: 'Grimjaw the Merchant',
      description: 'A shrewd goblin trader who deals in rare artifacts and forbidden knowledge.',
      type: 'merchant',
      placeId: PLACE_2_ID
    },
    {
      id: 'char-007',
      name: 'Nyx',
      description: 'A synthetic android who gained sentience and now fights for AI rights in the underground.',
      type: 'android',
      placeId: 'place-003'
    },
    {
      id: 'char-008',
      name: 'Dr. Yuki Tanaka',
      description: 'A brilliant scientist secretly working to sabotage OmniCorp from within.',
      type: 'scientist',
      placeId: 'place-004'
    }
  ],
  items: [
    {
      id: 'item-001',
      name: 'Staff of Eternity',
      description: 'An ancient staff that channels raw magical energy from the ley lines.',
      type: 'weapon',
      characterId: 'char-001'
    },
    {
      id: 'item-002',
      name: 'Cloak of Shadows',
      description: 'A magical cloak that renders the wearer nearly invisible in darkness.',
      type: 'armor',
      characterId: 'char-002'
    },
    {
      id: 'item-003',
      name: 'Moonbow',
      description: 'A silver bow blessed by the moon goddess, arrows fly true even in complete darkness.',
      type: 'weapon',
      characterId: 'char-002'
    },
    {
      id: 'item-004',
      name: 'Neural Interface Deck',
      description: 'Custom-built hacking rig capable of breaching the most secure corporate networks.',
      type: 'tool',
      characterId: 'char-003'
    },
    {
      id: 'item-005',
      name: 'Quantum Encryption Key',
      description: 'A stolen OmniCorp master key that can unlock any digital door.',
      type: 'key',
      characterId: 'char-003'
    },
    {
      id: 'item-006',
      name: 'Executive Override Chip',
      description: 'A neural implant granting Director Chen absolute control over OmniCorp systems.',
      type: 'implant',
      characterId: 'char-004'
    },
    {
      id: 'item-007',
      name: 'Sunblade',
      description: 'A legendary sword that glows with holy light, bane of all dark creatures.',
      type: 'weapon',
      characterId: 'char-005'
    },
    {
      id: 'item-008',
      name: 'Shield of the Dawn',
      description: 'An indestructible shield forged from crystallized sunlight.',
      type: 'armor',
      characterId: 'char-005'
    },
    {
      id: 'item-009',
      name: 'Bag of Infinite Holdings',
      description: 'A magical satchel that can store far more than its size suggests.',
      type: 'container',
      characterId: 'char-006'
    },
    {
      id: 'item-010',
      name: 'Probability Disruptor',
      description: 'Experimental tech that allows Nyx to predict and alter combat outcomes.',
      type: 'implant',
      characterId: 'char-007'
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
    'CREATE CONSTRAINT item_id IF NOT EXISTS FOR (i:Item) REQUIRE i.id IS UNIQUE',
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

async function seedItems(session) {
  console.log('Seeding items...');
  for (const item of seedData.items) {
    await session.run(
      `CREATE (i:Item {id: $id, name: $name, description: $description, type: $type})
       WITH i
       MATCH (c:Character {id: $characterId})
       CREATE (c)-[:CONTAINS]->(i)`,
      item
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
    await seedItems(session);
    await seedTags(session);
    await seedTagRelations(session);

    console.log('Seeding complete!');
    console.log(`Created: ${seedData.universes.length} universes, ${seedData.places.length} places, ${seedData.characters.length} characters, ${seedData.items.length} items, ${seedData.tags.length} tags`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
