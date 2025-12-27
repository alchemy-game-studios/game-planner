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

// Image IDs
const IMG_UNIVERSE_1_HERO = 'img-u1-hero';
const IMG_UNIVERSE_1_AVATAR = 'img-u1-avatar';
const IMG_UNIVERSE_2_HERO = 'img-u2-hero';
const IMG_UNIVERSE_2_AVATAR = 'img-u2-avatar';
const IMG_PLACE_1_HERO = 'img-p1-hero';
const IMG_PLACE_1_AVATAR = 'img-p1-avatar';
const IMG_PLACE_2_HERO = 'img-p2-hero';
const IMG_PLACE_2_AVATAR = 'img-p2-avatar';

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
  ],
  narratives: [
    {
      id: 'narrative-001',
      name: 'The Restoration of Eldoria',
      description: `In the waning years of the Third Age, the ancient wards that had protected Eldoria for millennia began to fail. The Crystal Citadel, once a beacon of hope and magical power, grew dim as the ley lines beneath it weakened.

Archmage Thalion, keeper of the old ways, knew that only the Awakening Ritual—a ceremony not performed in over five hundred years—could restore the protective barriers. But the ritual required more than just magical prowess; it demanded the Staff of Eternity, an artifact thought lost to the Shadow War.

As dark forces sensed the realm's vulnerability, heroes rose to meet the challenge. What followed would become known as the greatest tale of sacrifice and triumph in Eldorian history.`,
      type: 'saga',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'narrative-002',
      name: 'Rise of the Resistance',
      description: `In the neon-lit shadows of the megacity, where corporations rule with iron fists and surveillance drones patrol every corner, a spark of rebellion ignites.

Zero, once a nobody in the digital underground, stumbled upon something that would change everything—proof of OmniCorp's darkest secrets. With the help of Nyx, a synthetic android who had gained true sentience, and a network of rebels hiding in Sector 7, they planned the impossible: infiltrating Nexus Tower itself.

But Director Chen, the ruthless CEO of OmniCorp, was watching. And she had plans of her own. What began as a simple heist would escalate into a war for the soul of humanity itself.`,
      type: 'chronicle',
      universeId: UNIVERSE_2_ID
    }
  ],
  events: [
    {
      id: 'event-001',
      name: 'The Awakening Ritual',
      description: 'Archmage Thalion performs the ancient ritual to restore the Crystal Citadel\'s protective wards after centuries of dormancy.',
      type: 'ritual',
      startDate: '2487-03-21T19:00:00Z',
      endDate: '2487-03-21T23:30:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-002',
      name: 'The Shadow War Begins',
      description: 'Dark forces from beyond the veil launch their first assault, marking the beginning of a great conflict that would reshape Eldoria.',
      type: 'battle',
      startDate: '2450-01-01T00:00:00Z',
      endDate: '2450-03-15T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-003',
      name: 'The Great Heist',
      description: 'Zero and the underground rebels infiltrate Nexus Tower to steal the Quantum Encryption Key.',
      type: 'quest',
      startDate: '2087-05-01T00:00:00Z',
      endDate: '2087-05-01T06:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-004',
      name: 'The Corporate Siege',
      description: 'OmniCorp launches a coordinated assault on Sector 7 Underground, attempting to crush the resistance once and for all.',
      type: 'battle',
      startDate: '2087-06-15T02:00:00Z',
      endDate: '2087-06-15T08:00:00Z',
      narrativeId: 'narrative-002'
    }
  ],
  eventRelations: [
    // The Awakening Ritual - takes place in Crystal Citadel, involves Thalion and his staff
    { eventId: 'event-001', placeIds: [PLACE_1_ID], characterIds: ['char-001'], itemIds: ['item-001'] },
    // The Shadow War Begins - takes place in Shadowmere Forest, involves Lyra and Seraphina
    { eventId: 'event-002', placeIds: [PLACE_2_ID], characterIds: ['char-002', 'char-005'], itemIds: ['item-002', 'item-007'] },
    // The Great Heist - takes place in Nexus Tower, involves Zero
    { eventId: 'event-003', placeIds: ['place-004'], characterIds: ['char-003'], itemIds: ['item-004', 'item-005'] },
    // The Corporate Siege - takes place in Sector 7, involves Zero and Nyx
    { eventId: 'event-004', placeIds: ['place-003'], characterIds: ['char-003', 'char-007'], itemIds: ['item-004', 'item-010'] }
  ],
  // Images stored in public/entity-images/ - use 'local:' prefix for local files
  images: [
    // Universe 1 - Eldoria
    { id: IMG_UNIVERSE_1_HERO, entityId: UNIVERSE_1_ID, filename: 'hero.jpg', key: `local:${UNIVERSE_1_ID}/hero.jpg`, mimeType: 'image/jpeg', size: 100000, rank: 0 },
    { id: IMG_UNIVERSE_1_AVATAR, entityId: UNIVERSE_1_ID, filename: 'avatar.jpg', key: `local:${UNIVERSE_1_ID}/avatar.jpg`, mimeType: 'image/jpeg', size: 50000, rank: 1 },
    // Universe 2 - Neon Sprawl
    { id: IMG_UNIVERSE_2_HERO, entityId: UNIVERSE_2_ID, filename: 'hero.jpg', key: `local:${UNIVERSE_2_ID}/hero.jpg`, mimeType: 'image/jpeg', size: 100000, rank: 0 },
    { id: IMG_UNIVERSE_2_AVATAR, entityId: UNIVERSE_2_ID, filename: 'avatar.jpg', key: `local:${UNIVERSE_2_ID}/avatar.jpg`, mimeType: 'image/jpeg', size: 50000, rank: 1 },
    // Place 1 - Crystal Citadel
    { id: IMG_PLACE_1_HERO, entityId: PLACE_1_ID, filename: 'hero.jpg', key: `local:${PLACE_1_ID}/hero.jpg`, mimeType: 'image/jpeg', size: 100000, rank: 0 },
    { id: IMG_PLACE_1_AVATAR, entityId: PLACE_1_ID, filename: 'avatar.jpg', key: `local:${PLACE_1_ID}/avatar.jpg`, mimeType: 'image/jpeg', size: 50000, rank: 1 },
    // Place 2 - Shadowmere Forest
    { id: IMG_PLACE_2_HERO, entityId: PLACE_2_ID, filename: 'hero.jpg', key: `local:${PLACE_2_ID}/hero.jpg`, mimeType: 'image/jpeg', size: 100000, rank: 0 },
    { id: IMG_PLACE_2_AVATAR, entityId: PLACE_2_ID, filename: 'avatar.jpg', key: `local:${PLACE_2_ID}/avatar.jpg`, mimeType: 'image/jpeg', size: 50000, rank: 1 }
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
    'CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:Tag) REQUIRE t.id IS UNIQUE',
    'CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT narrative_id IF NOT EXISTS FOR (n:Narrative) REQUIRE n.id IS UNIQUE',
    'CREATE CONSTRAINT image_id IF NOT EXISTS FOR (i:Image) REQUIRE i.id IS UNIQUE'
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

async function seedNarratives(session) {
  console.log('Seeding narratives...');
  for (const narrative of seedData.narratives) {
    await session.run(
      `CREATE (n:Narrative {id: $id, name: $name, description: $description, type: $type})
       WITH n
       MATCH (u:Universe {id: $universeId})
       CREATE (u)-[:CONTAINS]->(n)`,
      narrative
    );
  }
}

async function seedEvents(session) {
  console.log('Seeding events...');
  for (const event of seedData.events) {
    await session.run(
      `CREATE (e:Event {id: $id, name: $name, description: $description, type: $type, startDate: $startDate, endDate: $endDate})
       WITH e
       MATCH (n:Narrative {id: $narrativeId})
       CREATE (n)-[:CONTAINS]->(e)`,
      event
    );
  }
}

async function seedEventRelations(session) {
  console.log('Seeding event relations...');
  for (const relation of seedData.eventRelations) {
    // Create OCCURS_AT relationships (Event -> Place)
    for (const placeId of relation.placeIds || []) {
      await session.run(
        `MATCH (e:Event {id: $eventId}), (p:Place {id: $placeId})
         CREATE (e)-[:OCCURS_AT]->(p)`,
        { eventId: relation.eventId, placeId }
      );
    }
    // Create INVOLVES relationships for characters
    for (const characterId of relation.characterIds || []) {
      await session.run(
        `MATCH (e:Event {id: $eventId}), (c:Character {id: $characterId})
         CREATE (e)-[:INVOLVES]->(c)`,
        { eventId: relation.eventId, characterId }
      );
    }
    // Create INVOLVES relationships for items
    for (const itemId of relation.itemIds || []) {
      await session.run(
        `MATCH (e:Event {id: $eventId}), (i:Item {id: $itemId})
         CREATE (e)-[:INVOLVES]->(i)`,
        { eventId: relation.eventId, itemId }
      );
    }
  }
}

async function seedImages(session) {
  console.log('Seeding images...');
  for (const image of seedData.images) {
    await session.run(
      `CREATE (i:Image {id: $id, filename: $filename, key: $key, mimeType: $mimeType, size: $size})
       WITH i
       MATCH (e {id: $entityId})
       CREATE (e)-[:HAS_IMAGE {rank: $rank}]->(i)`,
      image
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
    await seedNarratives(session);
    await seedEvents(session);
    await seedEventRelations(session);
    await seedImages(session);

    console.log('Seeding complete!');
    console.log(`Created: ${seedData.universes.length} universes, ${seedData.places.length} places, ${seedData.characters.length} characters, ${seedData.items.length} items, ${seedData.tags.length} tags, ${seedData.narratives.length} narratives, ${seedData.events.length} events, ${seedData.images.length} images`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
