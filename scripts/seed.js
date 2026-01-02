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

// Seed user ID (demo account that owns all seed data)
const SEED_USER_ID = 'seed-user-001';

const seedData = {
  // Seed user that owns all demo entities
  seedUser: {
    id: SEED_USER_ID,
    email: 'demo@gameplanner.dev',
    googleId: 'demo-google-id',
    displayName: 'Demo User',
    avatarUrl: null,
    subscriptionTier: 'studio',
    subscriptionStatus: 'active',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    credits: 5000,
    entityCount: 0, // Will be calculated
  },
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
    // Eldoria places
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
      id: 'place-005',
      name: 'Dragon\'s Spine Mountains',
      description: 'A treacherous mountain range said to be the petrified remains of an ancient dragon god.',
      type: 'mountains',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'place-006',
      name: 'The Sunken Library',
      description: 'A vast underwater repository of forbidden knowledge, accessible only through magical means.',
      type: 'dungeon',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'place-007',
      name: 'Thornhaven Village',
      description: 'A peaceful farming community on the edge of Shadowmere Forest, known for its hearty folk and annual harvest festival.',
      type: 'village',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'place-008',
      name: 'The Obsidian Wastes',
      description: 'A blighted land scarred by ancient magical warfare, where nothing grows and dark creatures lurk.',
      type: 'wasteland',
      universeId: UNIVERSE_1_ID
    },
    // Neon Sprawl places
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
    },
    {
      id: 'place-009',
      name: 'The Neon Strip',
      description: 'A dazzling entertainment district where holographic advertisements blind the eyes and synth-pop fills the air.',
      type: 'district',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'place-010',
      name: 'Rust Town',
      description: 'An abandoned industrial zone now home to outcasts, scavengers, and those who fell through society\'s cracks.',
      type: 'slum',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'place-011',
      name: 'The DataVault',
      description: 'A massive server farm buried deep underground, housing the collective digital memory of humanity.',
      type: 'facility',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'place-012',
      name: 'Sky Gardens',
      description: 'An exclusive residential district floating above the smog layer, where the ultra-wealthy live in pristine luxury.',
      type: 'district',
      universeId: UNIVERSE_2_ID
    }
  ],
  characters: [
    // Eldoria characters
    {
      id: 'char-001',
      name: 'Theron Brightblade',
      description: 'A noble paladin who has sworn an oath to protect the innocent and uphold justice throughout Eldoria.',
      type: 'paladin',
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
      id: 'char-009',
      name: 'Vex Shadowbane',
      description: 'A brooding assassin seeking redemption for crimes committed in service to a dark master.',
      type: 'rogue',
      placeId: PLACE_2_ID
    },
    {
      id: 'char-010',
      name: 'Elder Moira',
      description: 'The village elder of Thornhaven, keeper of old traditions and whispered prophecies.',
      type: 'elder',
      placeId: 'place-007'
    },
    {
      id: 'char-011',
      name: 'Korrath the Undying',
      description: 'An ancient lich who seeks to reclaim his lost kingdom from the depths of the Obsidian Wastes.',
      type: 'undead',
      placeId: 'place-008'
    },
    {
      id: 'char-012',
      name: 'Finnegan Brightwater',
      description: 'A jovial bard whose songs carry hidden messages for the resistance against dark forces.',
      type: 'bard',
      placeId: 'place-007'
    },
    {
      id: 'char-013',
      name: 'Zara Stormcaller',
      description: 'A young elemental mage struggling to control her immense but volatile powers.',
      type: 'mage',
      placeId: PLACE_1_ID
    },
    {
      id: 'char-014',
      name: 'Ironbeard the Smith',
      description: 'A dwarven master craftsman who forges weapons capable of slaying even gods.',
      type: 'artisan',
      placeId: 'place-005'
    },
    // Neon Sprawl characters
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
    },
    {
      id: 'char-015',
      name: 'Razor',
      description: 'A street samurai with cybernetic enhancements, enforcer for the underground crime syndicate.',
      type: 'enforcer',
      placeId: 'place-010'
    },
    {
      id: 'char-016',
      name: 'Luna Vex',
      description: 'A charismatic fixer who brokers deals between corporations and the criminal underworld.',
      type: 'fixer',
      placeId: 'place-009'
    },
    {
      id: 'char-017',
      name: 'Prophet',
      description: 'A rogue AI that speaks through hijacked screens, warning of an impending digital apocalypse.',
      type: 'ai',
      placeId: 'place-011'
    },
    {
      id: 'char-018',
      name: 'Duchess Sterling',
      description: 'An elite socialite who secretly funds rebel operations from her penthouse in the Sky Gardens.',
      type: 'patron',
      placeId: 'place-012'
    },
    {
      id: 'char-019',
      name: 'Glitch',
      description: 'A teenage prodigy who can interface directly with machines using a rare neural mutation.',
      type: 'hacker',
      placeId: 'place-003'
    },
    {
      id: 'char-020',
      name: 'Commander Kane',
      description: 'Head of OmniCorp\'s private security forces, a decorated soldier with a hidden conscience.',
      type: 'military',
      placeId: 'place-004'
    }
  ],
  items: [
    // Eldoria items
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
      id: 'item-011',
      name: 'Whisperwind Daggers',
      description: 'Twin daggers that return to their owner when thrown, silent as the wind.',
      type: 'weapon',
      characterId: 'char-009'
    },
    {
      id: 'item-012',
      name: 'The Prophecy Tome',
      description: 'An ancient book containing visions of possible futures, its pages ever-changing.',
      type: 'artifact',
      characterId: 'char-010'
    },
    {
      id: 'item-013',
      name: 'Phylactery of Korrath',
      description: 'The soul vessel that binds the lich to the mortal realm.',
      type: 'artifact',
      characterId: 'char-011'
    },
    {
      id: 'item-014',
      name: 'Lute of Legends',
      description: 'A magical instrument whose songs can inspire courage or induce sleep.',
      type: 'instrument',
      characterId: 'char-012'
    },
    {
      id: 'item-015',
      name: 'Storm Gauntlets',
      description: 'Enchanted gloves that help focus and control elemental lightning.',
      type: 'armor',
      characterId: 'char-013'
    },
    {
      id: 'item-016',
      name: 'Godhammer',
      description: 'A mythic forge hammer capable of shaping divine metals.',
      type: 'tool',
      characterId: 'char-014'
    },
    // Neon Sprawl items
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
      id: 'item-010',
      name: 'Probability Disruptor',
      description: 'Experimental tech that allows Nyx to predict and alter combat outcomes.',
      type: 'implant',
      characterId: 'char-007'
    },
    {
      id: 'item-017',
      name: 'Nanoblade Katana',
      description: 'A sword with a monomolecular edge that can cut through almost anything.',
      type: 'weapon',
      characterId: 'char-015'
    },
    {
      id: 'item-018',
      name: 'BlackBook',
      description: 'An encrypted database of favors, secrets, and contacts across the city.',
      type: 'data',
      characterId: 'char-016'
    },
    {
      id: 'item-019',
      name: 'Prophet\'s Core',
      description: 'The quantum processor housing the rogue AI\'s consciousness.',
      type: 'hardware',
      characterId: 'char-017'
    },
    {
      id: 'item-020',
      name: 'Sterling Foundation Token',
      description: 'A crypto-key granting access to unlimited rebel funding.',
      type: 'currency',
      characterId: 'char-018'
    },
    {
      id: 'item-021',
      name: 'Biotech Interface',
      description: 'Organic circuitry grown directly into Glitch\'s nervous system.',
      type: 'implant',
      characterId: 'char-019'
    },
    {
      id: 'item-022',
      name: 'Conscience Chip',
      description: 'A hidden implant recording Kane\'s doubts and OmniCorp\'s crimes.',
      type: 'implant',
      characterId: 'char-020'
    }
  ],
  tags: [
    // Descriptor tags - describe what something IS
    { id: 'tag-001', name: 'Magic', description: 'Possesses or channels supernatural power. Applies to entities that cast spells, contain enchantments, or exist through arcane means. Characterized by mystical energy, incantations, glowing runes, and otherworldly forces.', type: 'descriptor' },
    { id: 'tag-003', name: 'Technology', description: 'Relies on advanced machinery, electronics, or scientific innovation. Applies to devices, augmented beings, or locations with industrial/digital infrastructure. Characterized by circuits, interfaces, mechanical components, and futuristic materials.', type: 'descriptor' },
    { id: 'tag-005', name: 'Political', description: 'Involved in governance, faction conflicts, or power structures. Applies to rulers, diplomats, contested territories, or items symbolizing authority. Characterized by alliances, rivalries, laws, borders, and influence.', type: 'descriptor' },
    { id: 'tag-006', name: 'Ancient', description: 'Predates current civilization by centuries or millennia. Applies to ruins, artifacts, elder beings, or forgotten knowledge. Characterized by weathered materials, lost languages, faded glory, and connections to a distant past.', type: 'descriptor' },
    { id: 'tag-007', name: 'Sacred', description: 'Holy, blessed, or spiritually significant to believers. Applies to temples, relics, divine servants, or consecrated ground. Characterized by reverence, ritual, divine symbols, purity, and religious devotion.', type: 'descriptor' },
    { id: 'tag-008', name: 'Corrupted', description: 'Tainted by evil, decay, or malevolent influence. Applies to cursed items, fallen heroes, blighted lands, or possessed beings. Characterized by darkness seeping in, twisted forms, moral decay, and palpable wrongness.', type: 'descriptor' },
    { id: 'tag-009', name: 'Hidden', description: 'Concealed from common knowledge or difficult to find. Applies to secret societies, lost locations, disguised identities, or forbidden lore. Characterized by obscured entrances, coded messages, deliberate secrecy, and few who know the truth.', type: 'descriptor' },
    { id: 'tag-010', name: 'Legendary', description: 'Famous throughout the world, spoken of in stories and songs. Applies to renowned heroes, mythic artifacts, or places of great historical significance. Characterized by widespread recognition, tales told by travelers, and reputation preceding the entity.', type: 'descriptor' },
    { id: 'tag-015', name: 'Wise', description: 'Possesses deep knowledge, insight, or understanding gained through experience. Applies to sages, ancient beings, or places of learning. Characterized by thoughtful speech, considered advice, awareness of consequences, and patience.', type: 'descriptor' },
    { id: 'tag-018', name: 'Cunning', description: 'Clever, manipulative, and strategically minded. Applies to tricksters, schemers, or entities that achieve goals through deception. Characterized by misdirection, hidden agendas, calculated risks, and outsmarting opponents.', type: 'descriptor' },
    { id: 'tag-020', name: 'Visionary', description: 'Perceives or pursues possibilities others cannot see. Applies to prophets, innovators, or those driven by grand ambitions. Characterized by foresight, unconventional thinking, inspiring others, and working toward a future only they can envision.', type: 'descriptor' },
    { id: 'tag-021', name: 'Quest Giver', description: 'Provides missions, tasks, or requests to protagonists. Applies to characters who send others on journeys, offer rewards, or need help they cannot provide themselves. Characterized by clear objectives, promised rewards, and reasons why they cannot act alone.', type: 'descriptor' },
    { id: 'tag-022', name: 'Boss', description: 'A major antagonist or powerful obstacle to overcome. Applies to enemies representing significant challenges, guardians of important locations, or leaders of opposing forces. Characterized by high threat level, unique abilities, and significant stakes.', type: 'descriptor' },
    { id: 'tag-023', name: 'Ally', description: 'Friendly to protagonists and willing to assist their goals. Applies to companions, supporters, or factions aligned with the heroes. Characterized by cooperation, shared interests, trust-building, and mutual aid.', type: 'descriptor' },
    { id: 'tag-024', name: 'Merchant', description: 'Trades goods, services, or information for compensation. Applies to shopkeepers, black market dealers, or anyone who facilitates exchange. Characterized by inventory, prices, negotiation, and the commerce that sustains them.', type: 'descriptor' },
    // Feeling tags - emotions to invoke in reader/player
    { id: 'tag-002', name: 'Dangerous', description: 'Evokes fear, caution, and respect for threat. Characterized by lethal potential, warning signs, survival instincts, and consequences of carelessness. Should make the audience feel their pulse quicken.', type: 'feeling' },
    { id: 'tag-004', name: 'Mysterious', description: 'Evokes curiosity, wonder, and the desire to learn more. Characterized by unanswered questions, hints at deeper truths, enigmatic details, and rewards for investigation. Should make the audience want to dig deeper.', type: 'feeling' },
    { id: 'tag-011', name: 'Peaceful', description: 'Evokes calm, safety, and contentment. Characterized by gentle sounds, soft lighting, absence of conflict, and moments of rest. Should make the audience feel tension leave their shoulders.', type: 'feeling' },
    { id: 'tag-012', name: 'Ominous', description: 'Evokes dread, unease, and anticipation of something terrible. Characterized by foreshadowing, wrongness in details, building tension, and the sense that disaster approaches. Should make the audience feel a chill.', type: 'feeling' },
    { id: 'tag-013', name: 'Chaotic', description: 'Evokes tension, unpredictability, and sensory overload. Characterized by rapid changes, conflicting elements, lack of control, and impossibility of predicting what comes next. Should make the audience feel overwhelmed.', type: 'feeling' },
    { id: 'tag-014', name: 'Hopeful', description: 'Evokes optimism, inspiration, and belief in positive outcomes. Characterized by light breaking through darkness, small victories, determination against odds, and reasons to keep fighting. Should make the audience feel uplifted.', type: 'feeling' },
    { id: 'tag-016', name: 'Ruthless', description: 'Evokes fear, revulsion, and moral judgment. Characterized by cruelty without remorse, efficiency over mercy, and actions that cross moral lines. Should make the audience feel disturbed by the lack of humanity.', type: 'feeling' },
    { id: 'tag-017', name: 'Heroic', description: 'Evokes admiration, inspiration, and the desire to emulate. Characterized by courage, sacrifice, standing for principles, and rising to challenges. Should make the audience feel pride and want to cheer.', type: 'feeling' },
    { id: 'tag-019', name: 'Tormented', description: 'Evokes sympathy, sadness, and the weight of suffering. Characterized by inner pain, tragic backstory, struggles against burdens, and the human cost of hardship. Should make the audience feel compassion.', type: 'feeling' }
  ],
  tagRelations: [
    // =====================
    // UNIVERSE TAGS (4-6 each)
    // =====================
    // Eldoria - fantasy realm
    { entityId: UNIVERSE_1_ID, tagId: 'tag-001' },  // Magic
    { entityId: UNIVERSE_1_ID, tagId: 'tag-006' },  // Ancient
    { entityId: UNIVERSE_1_ID, tagId: 'tag-010' }, // Legendary
    { entityId: UNIVERSE_1_ID, tagId: 'tag-004' },  // Mysterious
    { entityId: UNIVERSE_1_ID, tagId: 'tag-007' },  // Sacred
    // Neon Sprawl - cyberpunk megacity
    { entityId: UNIVERSE_2_ID, tagId: 'tag-003' },  // Technology
    { entityId: UNIVERSE_2_ID, tagId: 'tag-002' },  // Dangerous
    { entityId: UNIVERSE_2_ID, tagId: 'tag-013' }, // Chaotic
    { entityId: UNIVERSE_2_ID, tagId: 'tag-005' },  // Political
    { entityId: UNIVERSE_2_ID, tagId: 'tag-012' }, // Ominous

    // =====================
    // PLACE TAGS (4-6 each)
    // =====================
    // Crystal Citadel
    { entityId: PLACE_1_ID, tagId: 'tag-001' },  // Magic
    { entityId: PLACE_1_ID, tagId: 'tag-005' },  // Political
    { entityId: PLACE_1_ID, tagId: 'tag-007' },  // Sacred
    { entityId: PLACE_1_ID, tagId: 'tag-010' }, // Legendary
    { entityId: PLACE_1_ID, tagId: 'tag-006' },  // Ancient
    // Shadowmere Forest
    { entityId: PLACE_2_ID, tagId: 'tag-004' },  // Mysterious
    { entityId: PLACE_2_ID, tagId: 'tag-002' },  // Dangerous
    { entityId: PLACE_2_ID, tagId: 'tag-006' },  // Ancient
    { entityId: PLACE_2_ID, tagId: 'tag-009' },  // Hidden
    { entityId: PLACE_2_ID, tagId: 'tag-012' }, // Ominous
    // Dragon's Spine Mountains
    { entityId: 'place-005', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-005', tagId: 'tag-006' },  // Ancient
    { entityId: 'place-005', tagId: 'tag-010' }, // Legendary
    { entityId: 'place-005', tagId: 'tag-004' },  // Mysterious
    { entityId: 'place-005', tagId: 'tag-007' },  // Sacred
    // Sunken Library
    { entityId: 'place-006', tagId: 'tag-009' },  // Hidden
    { entityId: 'place-006', tagId: 'tag-006' },  // Ancient
    { entityId: 'place-006', tagId: 'tag-001' },  // Magic
    { entityId: 'place-006', tagId: 'tag-004' },  // Mysterious
    { entityId: 'place-006', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-006', tagId: 'tag-010' }, // Legendary
    // Thornhaven Village
    { entityId: 'place-007', tagId: 'tag-011' }, // Peaceful
    { entityId: 'place-007', tagId: 'tag-014' }, // Hopeful
    { entityId: 'place-007', tagId: 'tag-009' },  // Hidden (secrets)
    { entityId: 'place-007', tagId: 'tag-004' },  // Mysterious
    // Obsidian Wastes
    { entityId: 'place-008', tagId: 'tag-008' },  // Corrupted
    { entityId: 'place-008', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-008', tagId: 'tag-012' }, // Ominous
    { entityId: 'place-008', tagId: 'tag-006' },  // Ancient
    { entityId: 'place-008', tagId: 'tag-004' },  // Mysterious
    // Sector 7 Underground
    { entityId: 'place-003', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-003', tagId: 'tag-009' },  // Hidden
    { entityId: 'place-003', tagId: 'tag-013' }, // Chaotic
    { entityId: 'place-003', tagId: 'tag-014' }, // Hopeful
    { entityId: 'place-003', tagId: 'tag-003' },  // Technology
    // Nexus Tower
    { entityId: 'place-004', tagId: 'tag-003' },  // Technology
    { entityId: 'place-004', tagId: 'tag-005' },  // Political
    { entityId: 'place-004', tagId: 'tag-012' }, // Ominous
    { entityId: 'place-004', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-004', tagId: 'tag-010' }, // Legendary
    // Neon Strip
    { entityId: 'place-009', tagId: 'tag-013' }, // Chaotic
    { entityId: 'place-009', tagId: 'tag-003' },  // Technology
    { entityId: 'place-009', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-009', tagId: 'tag-009' },  // Hidden
    // Rust Town
    { entityId: 'place-010', tagId: 'tag-002' },  // Dangerous
    { entityId: 'place-010', tagId: 'tag-014' }, // Hopeful
    { entityId: 'place-010', tagId: 'tag-013' }, // Chaotic
    { entityId: 'place-010', tagId: 'tag-019' }, // Tormented
    { entityId: 'place-010', tagId: 'tag-009' },  // Hidden
    // DataVault
    { entityId: 'place-011', tagId: 'tag-003' },  // Technology
    { entityId: 'place-011', tagId: 'tag-009' },  // Hidden
    { entityId: 'place-011', tagId: 'tag-004' },  // Mysterious
    { entityId: 'place-011', tagId: 'tag-010' }, // Legendary
    // Sky Gardens
    { entityId: 'place-012', tagId: 'tag-005' },  // Political
    { entityId: 'place-012', tagId: 'tag-011' }, // Peaceful
    { entityId: 'place-012', tagId: 'tag-009' },  // Hidden
    { entityId: 'place-012', tagId: 'tag-003' },  // Technology

    // =====================
    // CHARACTER TAGS (5-8 each)
    // =====================
    // Archmage Thalion
    { entityId: 'char-001', tagId: 'tag-001' },  // Magic
    { entityId: 'char-001', tagId: 'tag-015' }, // Wise
    { entityId: 'char-001', tagId: 'tag-021' }, // Quest Giver
    { entityId: 'char-001', tagId: 'tag-006' },  // Ancient
    { entityId: 'char-001', tagId: 'tag-010' }, // Legendary
    { entityId: 'char-001', tagId: 'tag-020' }, // Visionary
    // Lyra Nightwhisper
    { entityId: 'char-002', tagId: 'tag-004' },  // Mysterious
    { entityId: 'char-002', tagId: 'tag-017' }, // Heroic
    { entityId: 'char-002', tagId: 'tag-023' }, // Ally
    { entityId: 'char-002', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-002', tagId: 'tag-002' },  // Dangerous
    // Seraphina the Bold
    { entityId: 'char-005', tagId: 'tag-017' }, // Heroic
    { entityId: 'char-005', tagId: 'tag-010' }, // Legendary
    { entityId: 'char-005', tagId: 'tag-023' }, // Ally
    { entityId: 'char-005', tagId: 'tag-007' },  // Sacred
    { entityId: 'char-005', tagId: 'tag-014' }, // Hopeful
    // Grimjaw the Merchant
    { entityId: 'char-006', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-006', tagId: 'tag-024' }, // Merchant
    { entityId: 'char-006', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-006', tagId: 'tag-004' },  // Mysterious
    { entityId: 'char-006', tagId: 'tag-021' }, // Quest Giver
    // Vex Shadowbane
    { entityId: 'char-009', tagId: 'tag-019' }, // Tormented
    { entityId: 'char-009', tagId: 'tag-002' },  // Dangerous
    { entityId: 'char-009', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-009', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-009', tagId: 'tag-023' }, // Ally
    // Elder Moira
    { entityId: 'char-010', tagId: 'tag-015' }, // Wise
    { entityId: 'char-010', tagId: 'tag-020' }, // Visionary
    { entityId: 'char-010', tagId: 'tag-021' }, // Quest Giver
    { entityId: 'char-010', tagId: 'tag-006' },  // Ancient
    { entityId: 'char-010', tagId: 'tag-004' },  // Mysterious
    // Korrath the Undying
    { entityId: 'char-011', tagId: 'tag-022' }, // Boss
    { entityId: 'char-011', tagId: 'tag-008' },  // Corrupted
    { entityId: 'char-011', tagId: 'tag-006' },  // Ancient
    { entityId: 'char-011', tagId: 'tag-002' },  // Dangerous
    { entityId: 'char-011', tagId: 'tag-010' }, // Legendary
    { entityId: 'char-011', tagId: 'tag-016' }, // Ruthless
    // Finnegan Brightwater
    { entityId: 'char-012', tagId: 'tag-014' }, // Hopeful
    { entityId: 'char-012', tagId: 'tag-023' }, // Ally
    { entityId: 'char-012', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-012', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-012', tagId: 'tag-021' }, // Quest Giver
    // Zara Stormcaller
    { entityId: 'char-013', tagId: 'tag-001' },  // Magic
    { entityId: 'char-013', tagId: 'tag-002' },  // Dangerous
    { entityId: 'char-013', tagId: 'tag-013' }, // Chaotic
    { entityId: 'char-013', tagId: 'tag-023' }, // Ally
    { entityId: 'char-013', tagId: 'tag-014' }, // Hopeful
    // Ironbeard the Smith
    { entityId: 'char-014', tagId: 'tag-010' }, // Legendary
    { entityId: 'char-014', tagId: 'tag-024' }, // Merchant
    { entityId: 'char-014', tagId: 'tag-015' }, // Wise
    { entityId: 'char-014', tagId: 'tag-006' },  // Ancient
    { entityId: 'char-014', tagId: 'tag-021' }, // Quest Giver
    // Zero
    { entityId: 'char-003', tagId: 'tag-003' },  // Technology
    { entityId: 'char-003', tagId: 'tag-017' }, // Heroic
    { entityId: 'char-003', tagId: 'tag-023' }, // Ally
    { entityId: 'char-003', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-003', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-003', tagId: 'tag-014' }, // Hopeful
    // Director Chen
    { entityId: 'char-004', tagId: 'tag-016' }, // Ruthless
    { entityId: 'char-004', tagId: 'tag-005' },  // Political
    { entityId: 'char-004', tagId: 'tag-022' }, // Boss
    { entityId: 'char-004', tagId: 'tag-003' },  // Technology
    { entityId: 'char-004', tagId: 'tag-002' },  // Dangerous
    { entityId: 'char-004', tagId: 'tag-018' }, // Cunning
    // Nyx
    { entityId: 'char-007', tagId: 'tag-003' },  // Technology
    { entityId: 'char-007', tagId: 'tag-020' }, // Visionary
    { entityId: 'char-007', tagId: 'tag-023' }, // Ally
    { entityId: 'char-007', tagId: 'tag-004' },  // Mysterious
    { entityId: 'char-007', tagId: 'tag-014' }, // Hopeful
    // Dr. Yuki Tanaka
    { entityId: 'char-008', tagId: 'tag-015' }, // Wise
    { entityId: 'char-008', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-008', tagId: 'tag-003' },  // Technology
    { entityId: 'char-008', tagId: 'tag-017' }, // Heroic
    { entityId: 'char-008', tagId: 'tag-023' }, // Ally
    // Razor
    { entityId: 'char-015', tagId: 'tag-002' },  // Dangerous
    { entityId: 'char-015', tagId: 'tag-016' }, // Ruthless
    { entityId: 'char-015', tagId: 'tag-003' },  // Technology
    { entityId: 'char-015', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-015', tagId: 'tag-022' }, // Boss
    // Luna Vex
    { entityId: 'char-016', tagId: 'tag-018' }, // Cunning
    { entityId: 'char-016', tagId: 'tag-021' }, // Quest Giver
    { entityId: 'char-016', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-016', tagId: 'tag-005' },  // Political
    { entityId: 'char-016', tagId: 'tag-024' }, // Merchant
    // Prophet
    { entityId: 'char-017', tagId: 'tag-020' }, // Visionary
    { entityId: 'char-017', tagId: 'tag-004' },  // Mysterious
    { entityId: 'char-017', tagId: 'tag-003' },  // Technology
    { entityId: 'char-017', tagId: 'tag-010' }, // Legendary
    { entityId: 'char-017', tagId: 'tag-012' }, // Ominous
    { entityId: 'char-017', tagId: 'tag-021' }, // Quest Giver
    // Duchess Sterling
    { entityId: 'char-018', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-018', tagId: 'tag-014' }, // Hopeful
    { entityId: 'char-018', tagId: 'tag-005' },  // Political
    { entityId: 'char-018', tagId: 'tag-017' }, // Heroic
    { entityId: 'char-018', tagId: 'tag-021' }, // Quest Giver
    // Glitch
    { entityId: 'char-019', tagId: 'tag-003' },  // Technology
    { entityId: 'char-019', tagId: 'tag-023' }, // Ally
    { entityId: 'char-019', tagId: 'tag-004' },  // Mysterious
    { entityId: 'char-019', tagId: 'tag-014' }, // Hopeful
    { entityId: 'char-019', tagId: 'tag-017' }, // Heroic
    // Commander Kane
    { entityId: 'char-020', tagId: 'tag-019' }, // Tormented
    { entityId: 'char-020', tagId: 'tag-017' }, // Heroic
    { entityId: 'char-020', tagId: 'tag-009' },  // Hidden
    { entityId: 'char-020', tagId: 'tag-002' },  // Dangerous
    { entityId: 'char-020', tagId: 'tag-023' }, // Ally

    // =====================
    // ITEM TAGS (4-6 each)
    // =====================
    // Staff of Eternity
    { entityId: 'item-001', tagId: 'tag-001' },  // Magic
    { entityId: 'item-001', tagId: 'tag-006' },  // Ancient
    { entityId: 'item-001', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-001', tagId: 'tag-007' },  // Sacred
    { entityId: 'item-001', tagId: 'tag-002' },  // Dangerous
    // Cloak of Shadows
    { entityId: 'item-002', tagId: 'tag-001' },  // Magic
    { entityId: 'item-002', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-002', tagId: 'tag-004' },  // Mysterious
    { entityId: 'item-002', tagId: 'tag-018' }, // Cunning
    // Moonbow
    { entityId: 'item-003', tagId: 'tag-001' },  // Magic
    { entityId: 'item-003', tagId: 'tag-007' },  // Sacred
    { entityId: 'item-003', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-003', tagId: 'tag-006' },  // Ancient
    // Sunblade
    { entityId: 'item-007', tagId: 'tag-007' },  // Sacred
    { entityId: 'item-007', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-007', tagId: 'tag-001' },  // Magic
    { entityId: 'item-007', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-007', tagId: 'tag-017' }, // Heroic
    // Shield of the Dawn
    { entityId: 'item-008', tagId: 'tag-007' },  // Sacred
    { entityId: 'item-008', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-008', tagId: 'tag-001' },  // Magic
    { entityId: 'item-008', tagId: 'tag-006' },  // Ancient
    // Bag of Infinite Holdings
    { entityId: 'item-009', tagId: 'tag-001' },  // Magic
    { entityId: 'item-009', tagId: 'tag-004' },  // Mysterious
    { entityId: 'item-009', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-009', tagId: 'tag-018' }, // Cunning
    // Whisperwind Daggers
    { entityId: 'item-011', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-011', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-011', tagId: 'tag-001' },  // Magic
    { entityId: 'item-011', tagId: 'tag-018' }, // Cunning
    // Prophecy Tome
    { entityId: 'item-012', tagId: 'tag-020' }, // Visionary
    { entityId: 'item-012', tagId: 'tag-004' },  // Mysterious
    { entityId: 'item-012', tagId: 'tag-001' },  // Magic
    { entityId: 'item-012', tagId: 'tag-006' },  // Ancient
    { entityId: 'item-012', tagId: 'tag-012' }, // Ominous
    // Phylactery of Korrath
    { entityId: 'item-013', tagId: 'tag-008' },  // Corrupted
    { entityId: 'item-013', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-013', tagId: 'tag-006' },  // Ancient
    { entityId: 'item-013', tagId: 'tag-001' },  // Magic
    { entityId: 'item-013', tagId: 'tag-012' }, // Ominous
    // Lute of Legends
    { entityId: 'item-014', tagId: 'tag-001' },  // Magic
    { entityId: 'item-014', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-014', tagId: 'tag-014' }, // Hopeful
    { entityId: 'item-014', tagId: 'tag-004' },  // Mysterious
    // Storm Gauntlets
    { entityId: 'item-015', tagId: 'tag-001' },  // Magic
    { entityId: 'item-015', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-015', tagId: 'tag-013' }, // Chaotic
    { entityId: 'item-015', tagId: 'tag-010' }, // Legendary
    // Godhammer
    { entityId: 'item-016', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-016', tagId: 'tag-006' },  // Ancient
    { entityId: 'item-016', tagId: 'tag-007' },  // Sacred
    { entityId: 'item-016', tagId: 'tag-001' },  // Magic
    // Neural Interface Deck
    { entityId: 'item-004', tagId: 'tag-003' },  // Technology
    { entityId: 'item-004', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-004', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-004', tagId: 'tag-018' }, // Cunning
    // Quantum Encryption Key
    { entityId: 'item-005', tagId: 'tag-003' },  // Technology
    { entityId: 'item-005', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-005', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-005', tagId: 'tag-010' }, // Legendary
    // Executive Override Chip
    { entityId: 'item-006', tagId: 'tag-003' },  // Technology
    { entityId: 'item-006', tagId: 'tag-005' },  // Political
    { entityId: 'item-006', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-006', tagId: 'tag-016' }, // Ruthless
    // Probability Disruptor
    { entityId: 'item-010', tagId: 'tag-003' },  // Technology
    { entityId: 'item-010', tagId: 'tag-004' },  // Mysterious
    { entityId: 'item-010', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-010', tagId: 'tag-010' }, // Legendary
    // Nanoblade Katana
    { entityId: 'item-017', tagId: 'tag-003' },  // Technology
    { entityId: 'item-017', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-017', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-017', tagId: 'tag-016' }, // Ruthless
    // BlackBook
    { entityId: 'item-018', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-018', tagId: 'tag-018' }, // Cunning
    { entityId: 'item-018', tagId: 'tag-005' },  // Political
    { entityId: 'item-018', tagId: 'tag-002' },  // Dangerous
    // Prophet's Core
    { entityId: 'item-019', tagId: 'tag-003' },  // Technology
    { entityId: 'item-019', tagId: 'tag-004' },  // Mysterious
    { entityId: 'item-019', tagId: 'tag-010' }, // Legendary
    { entityId: 'item-019', tagId: 'tag-020' }, // Visionary
    { entityId: 'item-019', tagId: 'tag-012' }, // Ominous
    // Sterling Foundation Token
    { entityId: 'item-020', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-020', tagId: 'tag-005' },  // Political
    { entityId: 'item-020', tagId: 'tag-014' }, // Hopeful
    { entityId: 'item-020', tagId: 'tag-003' },  // Technology
    // Biotech Interface
    { entityId: 'item-021', tagId: 'tag-003' },  // Technology
    { entityId: 'item-021', tagId: 'tag-004' },  // Mysterious
    { entityId: 'item-021', tagId: 'tag-002' },  // Dangerous
    { entityId: 'item-021', tagId: 'tag-009' },  // Hidden
    // Conscience Chip
    { entityId: 'item-022', tagId: 'tag-003' },  // Technology
    { entityId: 'item-022', tagId: 'tag-009' },  // Hidden
    { entityId: 'item-022', tagId: 'tag-019' }, // Tormented
    { entityId: 'item-022', tagId: 'tag-017' }, // Heroic

    // =====================
    // NARRATIVE TAGS (5-7 each)
    // =====================
    // The Restoration of Eldoria
    { entityId: 'narrative-001', tagId: 'tag-001' },  // Magic
    { entityId: 'narrative-001', tagId: 'tag-010' }, // Legendary
    { entityId: 'narrative-001', tagId: 'tag-017' }, // Heroic
    { entityId: 'narrative-001', tagId: 'tag-002' },  // Dangerous
    { entityId: 'narrative-001', tagId: 'tag-014' }, // Hopeful
    { entityId: 'narrative-001', tagId: 'tag-006' },  // Ancient
    // The Thornhaven Conspiracy
    { entityId: 'narrative-003', tagId: 'tag-004' },  // Mysterious
    { entityId: 'narrative-003', tagId: 'tag-009' },  // Hidden
    { entityId: 'narrative-003', tagId: 'tag-012' }, // Ominous
    { entityId: 'narrative-003', tagId: 'tag-002' },  // Dangerous
    { entityId: 'narrative-003', tagId: 'tag-018' }, // Cunning
    // The Lich King's Gambit
    { entityId: 'narrative-004', tagId: 'tag-008' },  // Corrupted
    { entityId: 'narrative-004', tagId: 'tag-002' },  // Dangerous
    { entityId: 'narrative-004', tagId: 'tag-012' }, // Ominous
    { entityId: 'narrative-004', tagId: 'tag-006' },  // Ancient
    { entityId: 'narrative-004', tagId: 'tag-017' }, // Heroic
    { entityId: 'narrative-004', tagId: 'tag-010' }, // Legendary
    // Rise of the Resistance
    { entityId: 'narrative-002', tagId: 'tag-003' },  // Technology
    { entityId: 'narrative-002', tagId: 'tag-017' }, // Heroic
    { entityId: 'narrative-002', tagId: 'tag-014' }, // Hopeful
    { entityId: 'narrative-002', tagId: 'tag-005' },  // Political
    { entityId: 'narrative-002', tagId: 'tag-002' },  // Dangerous
    { entityId: 'narrative-002', tagId: 'tag-013' }, // Chaotic
    // The Prophet's Warning
    { entityId: 'narrative-005', tagId: 'tag-003' },  // Technology
    { entityId: 'narrative-005', tagId: 'tag-012' }, // Ominous
    { entityId: 'narrative-005', tagId: 'tag-020' }, // Visionary
    { entityId: 'narrative-005', tagId: 'tag-004' },  // Mysterious
    { entityId: 'narrative-005', tagId: 'tag-002' },  // Dangerous
    // Ghosts in the Machine
    { entityId: 'narrative-006', tagId: 'tag-019' }, // Tormented
    { entityId: 'narrative-006', tagId: 'tag-009' },  // Hidden
    { entityId: 'narrative-006', tagId: 'tag-017' }, // Heroic
    { entityId: 'narrative-006', tagId: 'tag-002' },  // Dangerous
    { entityId: 'narrative-006', tagId: 'tag-005' },  // Political
    { entityId: 'narrative-006', tagId: 'tag-003' },  // Technology

    // =====================
    // EVENT TAGS (4-6 each)
    // =====================
    // The Restoration of Eldoria events
    { entityId: 'event-001', tagId: 'tag-001' },  // Magic
    { entityId: 'event-001', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-001', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-001', tagId: 'tag-006' },  // Ancient
    { entityId: 'event-002', tagId: 'tag-005' },  // Political
    { entityId: 'event-002', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-002', tagId: 'tag-001' },  // Magic
    { entityId: 'event-002', tagId: 'tag-015' }, // Wise
    { entityId: 'event-003', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-003', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-003', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-003', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-004', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-004', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-004', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-004', tagId: 'tag-006' },  // Ancient
    { entityId: 'event-005', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-005', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-005', tagId: 'tag-001' },  // Magic
    { entityId: 'event-005', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-006', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-006', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-006', tagId: 'tag-001' },  // Magic
    { entityId: 'event-006', tagId: 'tag-007' },  // Sacred
    { entityId: 'event-007', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-007', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-007', tagId: 'tag-008' },  // Corrupted
    { entityId: 'event-007', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-008', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-008', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-008', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-008', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-009', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-009', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-009', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-009', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-010', tagId: 'tag-001' },  // Magic
    { entityId: 'event-010', tagId: 'tag-007' },  // Sacred
    { entityId: 'event-010', tagId: 'tag-006' },  // Ancient
    { entityId: 'event-010', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-010', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-011', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-011', tagId: 'tag-011' }, // Peaceful
    { entityId: 'event-011', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-011', tagId: 'tag-007' },  // Sacred

    // Rise of the Resistance events
    { entityId: 'event-012', tagId: 'tag-003' },  // Technology
    { entityId: 'event-012', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-012', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-012', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-013', tagId: 'tag-003' },  // Technology
    { entityId: 'event-013', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-013', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-013', tagId: 'tag-023' }, // Ally
    { entityId: 'event-014', tagId: 'tag-003' },  // Technology
    { entityId: 'event-014', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-014', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-014', tagId: 'tag-018' }, // Cunning
    { entityId: 'event-014', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-015', tagId: 'tag-005' },  // Political
    { entityId: 'event-015', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-015', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-015', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-016', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-016', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-016', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-016', tagId: 'tag-003' },  // Technology
    { entityId: 'event-017', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-017', tagId: 'tag-003' },  // Technology
    { entityId: 'event-017', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-017', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-018', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-018', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-018', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-018', tagId: 'tag-005' },  // Political

    // The Prophet's Warning events
    { entityId: 'event-019', tagId: 'tag-003' },  // Technology
    { entityId: 'event-019', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-019', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-019', tagId: 'tag-020' }, // Visionary
    { entityId: 'event-020', tagId: 'tag-005' },  // Political
    { entityId: 'event-020', tagId: 'tag-016' }, // Ruthless
    { entityId: 'event-020', tagId: 'tag-003' },  // Technology
    { entityId: 'event-020', tagId: 'tag-018' }, // Cunning
    { entityId: 'event-021', tagId: 'tag-003' },  // Technology
    { entityId: 'event-021', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-021', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-021', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-022', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-022', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-022', tagId: 'tag-003' },  // Technology
    { entityId: 'event-022', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-023', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-023', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-023', tagId: 'tag-003' },  // Technology
    { entityId: 'event-023', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-023', tagId: 'tag-020' }, // Visionary

    // The Thornhaven Conspiracy events
    { entityId: 'event-031', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-031', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-031', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-031', tagId: 'tag-011' }, // Peaceful (disrupted)
    { entityId: 'event-032', tagId: 'tag-020' }, // Visionary
    { entityId: 'event-032', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-032', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-032', tagId: 'tag-001' },  // Magic
    { entityId: 'event-033', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-033', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-033', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-033', tagId: 'tag-023' }, // Ally
    { entityId: 'event-034', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-034', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-034', tagId: 'tag-018' }, // Cunning
    { entityId: 'event-034', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-035', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-035', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-035', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-035', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-036', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-036', tagId: 'tag-008' },  // Corrupted
    { entityId: 'event-036', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-036', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-037', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-037', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-037', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-037', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-038', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-038', tagId: 'tag-008' },  // Corrupted
    { entityId: 'event-038', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-038', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-039', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-039', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-039', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-039', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-040', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-040', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-040', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-040', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-041', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-041', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-041', tagId: 'tag-011' }, // Peaceful
    { entityId: 'event-041', tagId: 'tag-023' }, // Ally
    { entityId: 'event-042', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-042', tagId: 'tag-011' }, // Peaceful
    { entityId: 'event-042', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-042', tagId: 'tag-023' }, // Ally

    // Ghosts in the Machine events
    { entityId: 'event-043', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-043', tagId: 'tag-016' }, // Ruthless
    { entityId: 'event-043', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-043', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-044', tagId: 'tag-003' },  // Technology
    { entityId: 'event-044', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-044', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-044', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-045', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-045', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-045', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-045', tagId: 'tag-003' },  // Technology
    { entityId: 'event-046', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-046', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-046', tagId: 'tag-016' }, // Ruthless
    { entityId: 'event-046', tagId: 'tag-003' },  // Technology
    { entityId: 'event-047', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-047', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-047', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-047', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-048', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-048', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-048', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-048', tagId: 'tag-023' }, // Ally
    { entityId: 'event-049', tagId: 'tag-003' },  // Technology
    { entityId: 'event-049', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-049', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-049', tagId: 'tag-018' }, // Cunning
    { entityId: 'event-050', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-050', tagId: 'tag-016' }, // Ruthless
    { entityId: 'event-050', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-050', tagId: 'tag-018' }, // Cunning
    { entityId: 'event-051', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-051', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-051', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-051', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-052', tagId: 'tag-018' }, // Cunning
    { entityId: 'event-052', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-052', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-052', tagId: 'tag-005' },  // Political
    { entityId: 'event-053', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-053', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-053', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-053', tagId: 'tag-003' },  // Technology
    { entityId: 'event-054', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-054', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-054', tagId: 'tag-005' },  // Political
    { entityId: 'event-054', tagId: 'tag-010' }, // Legendary

    // The Lich King's Gambit events
    { entityId: 'event-024', tagId: 'tag-008' },  // Corrupted
    { entityId: 'event-024', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-024', tagId: 'tag-006' },  // Ancient
    { entityId: 'event-024', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-025', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-025', tagId: 'tag-008' },  // Corrupted
    { entityId: 'event-025', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-025', tagId: 'tag-019' }, // Tormented
    { entityId: 'event-026', tagId: 'tag-005' },  // Political
    { entityId: 'event-026', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-026', tagId: 'tag-015' }, // Wise
    { entityId: 'event-026', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-027', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-027', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-027', tagId: 'tag-008' },  // Corrupted
    { entityId: 'event-027', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-028', tagId: 'tag-009' },  // Hidden
    { entityId: 'event-028', tagId: 'tag-004' },  // Mysterious
    { entityId: 'event-028', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-028', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-029', tagId: 'tag-002' },  // Dangerous
    { entityId: 'event-029', tagId: 'tag-013' }, // Chaotic
    { entityId: 'event-029', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-029', tagId: 'tag-012' }, // Ominous
    { entityId: 'event-029', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-030', tagId: 'tag-017' }, // Heroic
    { entityId: 'event-030', tagId: 'tag-010' }, // Legendary
    { entityId: 'event-030', tagId: 'tag-014' }, // Hopeful
    { entityId: 'event-030', tagId: 'tag-007' }   // Sacred
  ],
  narratives: [
    // Eldoria narratives
    {
      id: 'narrative-001',
      name: 'The Restoration of Eldoria',
      description: `The night the Crystal Citadel's great spire flickered was the night Archmage Thalion knew true fear for the first time in three centuries.

He stood alone in the observatory, his weathered hands pressed against the cold crystal walls, feeling the ley lines beneath the city shudder and fade like a dying heartbeat. For millennia, these magical currents had fed the protective wards that kept Eldoria safe from the darkness beyond its borders. Now they were failing, and Thalion could feel something ancient and hungry stirring in response.

"The Staff of Eternity," he whispered to the empty room, the words tasting of dust and desperate hope. "It's the only way."

The Council convened in the great hall the following morning, their faces pale in the diminished light. Some argued for evacuation. Others spoke of treaties with neighboring realms. But Thalion's voice cut through their fear like a blade: the Awakening Ritual could restore the wards, but only if performed with the Staff—an artifact lost five hundred years ago in the Sunken Library, a place no living mage had entered and returned from unchanged.

Seraphina the Bold was the first to step forward. The legendary knight's armor gleamed even in the fading light, her hand steady on the hilt of her Sunblade. "I'll go," she said simply. Beside her, Lyra Nightwhisper materialized from the shadows, her silver Moonbow already strung. The ranger nodded once—no words needed between warriors who had fought side by side a hundred times before.

The journey to the Sunken Library took them through the treacherous depths beneath the sea, through passages that twisted through rock and coral and the bones of ancient leviathans. They faced traps left by paranoid mages of ages past, puzzles that tested mind and spirit, and at last, in a chamber where water and air existed in impossible harmony, they met the Guardian.

It rose from the depths like a living storm—a creature of pure elemental fury, bound to protect the Library's treasures for eternity. The battle that followed would be sung of for generations: Seraphina's blessed blade dancing with lightning, Lyra's arrows finding gaps in armor made of living stone, and finally, the moment when the Guardian recognized their worth and knelt before them, parting to reveal the Staff of Eternity floating in a column of golden light.

But even as they claimed their prize, darkness was descending upon the Crystal Citadel. Shadow creatures, sensing the weakened wards, had launched their assault. Archmage Thalion and young Zara Stormcaller stood upon the walls, their magic a desperate barrier against the tide of darkness. Beside them, the dwarf Ironbeard swung his Godhammer, each blow felling creatures that would have overwhelmed lesser warriors.

The heroes raced home through the Shadowmere Forest, the Staff blazing with power that burned away the darkness before them. They arrived as the final barrier fell, as Thalion collapsed from exhaustion, as hope itself seemed ready to die.

Seraphina placed the Staff in the Archmage's trembling hands.

What followed was a light so pure, so absolute, that witnesses would weep at the memory for years to come. The Awakening Ritual blazed through the Citadel, through every street and home and hidden corner of Eldoria, banishing the shadow creatures and reforging the wards stronger than they had been in a thousand years.

When dawn broke over the Crystal Citadel, it shone brighter than it had in living memory. The Third Age was over. The Fourth Age—an age of renewal and hope—had begun.`,
      type: 'saga',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'narrative-003',
      name: 'The Thornhaven Conspiracy',
      description: `The first disappearance was Thomas the farmer, a man so reliable that the village set their clocks by his morning walks to the fields. When he vanished, leaving only his tools behind like shed skin, the people of Thornhaven told themselves it was wolves, or bandits, or some other mundane tragedy.

By the third disappearance, no one believed that anymore.

Elder Moira had seen it coming. In her dreams, she had watched shadows wearing the faces of her neighbors, had heard familiar voices speaking words that made no sense in languages that predated human speech. But who listens to the warnings of old women? Who believes in prophecy until prophecy is all that's left?

Finnegan Brightwater arrived on a grey afternoon, his lute slung across his back and dark circles under his eyes. The bard had traveled from the Crystal Citadel with news that chilled the blood: Thornhaven was not alone. Villages across Eldoria were reporting the same phenomena—people vanishing, and then returning... different. Wrong. Wearing their old lives like ill-fitting clothes.

"They're infiltrators," Finnegan said that night in the village inn, his voice low. "Shapeshifters. And if my sources are right, they're preparing for something. Something soon."

The shadows in the tavern seemed to deepen as he spoke, and more than one neighbor glanced at their companions with new suspicion. Who could be trusted? Who was still themselves? Lyra Nightwhisper and Vex Shadowbane had answered the call for help, but even heroes began to doubt their own eyes in a village where anyone might be an enemy.

The breakthrough came when Lyra noticed a cellar door that hadn't existed a month ago—hidden beneath an abandoned barn on the edge of town. The passage beyond led deep into the earth, through tunnels that should not have been possible, into a cavern that pulsed with alien light.

What they found there would haunt them forever: the missing villagers, suspended in cocoons of translucent membrane, their identities being slowly drained to feed a hive mind of ancient and terrible intelligence. The shapeshifters were not invaders—they were larvae, growing toward some hideous maturity by consuming the essence of those they replaced.

The battle that followed was fought in darkness and confusion, where every ally might be an enemy wearing a friend's face. Vex's Whisperwind Daggers flashed in the phosphorescent gloom. Lyra's arrows found hearts that beat with stolen rhythms. And when they finally reached the queen—a bloated, ancient thing that wore the face of Thornhaven's founding mother—it was Elder Moira who struck the killing blow, wielding a torch like a holy sword.

They burned the nest. They freed the survivors. And as dawn broke over Thornhaven, they watched the smoke rise and wondered: how many other villages harbored similar horrors? How deep did this conspiracy truly run?

The Harvest Festival that year was smaller than usual, but sweeter. The surviving villagers danced with a fierce joy, celebrating not just the season's bounty but the simple miracle of being themselves, of knowing that the faces of their neighbors were truly their own.

But in the depths of Shadowmere Forest, something ancient and patient watched the smoke rise and began to plan anew.`,
      type: 'mystery',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'narrative-004',
      name: 'The Lich King\'s Gambit',
      description: `In the heart of the Obsidian Wastes, where no plant grew and no bird sang, a pulse of dark energy rippled through the blighted earth. In a tomb that had lain sealed for five centuries, something opened its eyes.

Korrath the Undying rose from his stone sarcophagus, bones grinding against bones, purple fire flickering in the empty sockets of his skull. His phylactery—that crystalline prison that bound his soul to the mortal realm—pulsed against his chest like a second heart. He could feel it: the weakness in Eldoria's defenses, the opportunity he had waited centuries to exploit.

"The Library," he rasped, his voice like wind through dead branches. "At last."

The first sign of his return came to Thornhaven, where the dead began to claw their way from their graves. Elder Moira felt it before she saw it—a wrongness in the earth, a violation of the natural order that made her ancient bones ache. Finnegan Brightwater played his Lute of Legends through the night, the magical music the only thing keeping the risen corpses at bay while the villagers fled.

At the Crystal Citadel, the Council of War convened with grim faces and heavy hearts. Archmage Thalion, still weakened from the Restoration, traced the pattern of attacks on a map and spoke the name that all of them feared: "Korrath. He seeks the Sunken Library. He seeks the Codex of Unmaking."

"What does it do?" asked Seraphina, though her voice suggested she already suspected the answer.

"It contains the ritual to merge the realms of life and death," Thalion replied. "If Korrath succeeds, there will be no more dying. Only an eternity of service to his undead legions."

The strike team that ventured into the Obsidian Wastes knew they might never return. Seraphina led them, her Sunblade blazing against the perpetual twilight. Beside her walked Vex Shadowbane, the former assassin who had sworn to use his deadly skills for redemption. Lyra Nightwhisper moved through the corrupted landscape like a ghost, her arrows singing a song of destruction.

They fought through waves of undead, through revenants and wraiths and things with no names that should never have existed. They witnessed horrors that would visit their dreams for years to come. And finally, in a chamber deep beneath the waste, they discovered the phylactery's location—hidden not in Korrath's tomb, but in a vault beneath the Crystal Citadel itself, protected by wards that the Lich King's servants had been slowly corrupting from within.

The final battle raged on two fronts. At the Citadel, Thalion and Zara Stormcaller faced Korrath's siege, their magic pushing back an army of the dead while Ironbeard's Godhammer rang against skull after skull. In the Wastes, Seraphina confronted the Lich King himself, trading blows with a creature that had killed a hundred heroes before her.

It was Vex who turned the tide. The assassin, so accustomed to shadows, slipped past the undead host and found the phylactery's vault. His Whisperwind Daggers—blessed by Seraphina before the battle—shattered the crystal prison in a single, perfect strike.

Across the realm, Korrath screamed. The purple fire in his eyes guttered and died. And Seraphina, bleeding from a dozen wounds, drove her Sunblade through his skull and watched him crumble to dust that scattered on a wind from nowhere.

The Obsidian Wastes remain blighted to this day, a scar upon the land that may never fully heal. But at its heart, where Korrath's tomb once stood, a single white flower has begun to grow.`,
      type: 'epic',
      universeId: UNIVERSE_1_ID
    },
    // Neon Sprawl narratives
    {
      id: 'narrative-002',
      name: 'Rise of the Resistance',
      description: `The file was supposed to be empty. Just another routine data heist from an OmniCorp subsidiary, the kind of job Zero had done a hundred times before. Get in, grab the payroll data, get out. Simple. Clean. Forgettable.

But the file wasn't empty.

Zero's neural interface deck hummed as the data cascaded across their vision: video files, medical records, experimental logs. Human subjects—hundreds of them—being modified, enhanced, transformed into something no longer quite human. Project Ascension, the files called it. OmniCorp's darkest secret, hidden in plain sight on a server that should have been routine.

"Well," Zero muttered to the empty apartment, rain drumming against the window, "this changes things."

Sector 7 Underground wasn't much to look at—a maze of abandoned service tunnels and repurposed warehouses beneath the city's forgotten industrial district. But to the resistance, it was home. Zero found them there: the hackers and the dreamers, the broken and the brave, all united by a simple belief that humanity deserved better than corporate slavery.

It was there that Zero met Nyx.

The android stood apart from the others, her synthetic skin gleaming faintly in the LED light, her eyes holding a depth that no machine should possess. "I was Project Ascension," she said simply when Zero showed her the files. "Iteration 7. I escaped. I... became." She touched her chest, where a human would have a heart. "They made me to be a weapon. I chose to be a person."

Together, they began to plan the impossible: infiltrating Nexus Tower, OmniCorp's fortress headquarters, to steal the Quantum Encryption Key that would unlock every secret the corporation had ever tried to bury. They recruited Glitch, a teenage prodigy whose neural mutation let her interface directly with machines. They secured funding from Duchess Sterling, a socialite who risked everything she had built to support the cause. They even turned Commander Kane, OmniCorp's own security chief, whose conscience had finally grown too heavy to bear.

The heist was a symphony of chaos. Zero's hacking opened doors and blinded cameras. Nyx's probability disruptor turned security responses into stuttering confusion. Glitch danced through firewalls like they were made of paper. And when Director Chen's kill teams finally responded, they found not frightened rebels but warriors who had nothing left to lose.

The Corporate Siege of Sector 7 lasted six hours. It should have been a massacre. Instead, it became a legend.

When the resistance hijacked the city's broadcast network and played OmniCorp's secrets for every citizen to see, the world changed. Not all at once—revolutions never happen that way. But in the streets of the Neon Sprawl, something shifted. People who had lived their whole lives with bowed heads began to look up. Workers who had accepted their chains began to question. And in the boardrooms of OmniCorp, Director Chen watched her empire begin to crack.

The People's Uprising lasted seven days. By the end, the old order was broken beyond repair, and something new—something messy and imperfect and achingly human—had begun to take its place.

Zero never sought power or recognition. After the uprising, they simply vanished back into the underground, another ghost in the machine. But sometimes, late at night, children in the lower sectors still whisper stories of the hacker who brought down an empire. They say Zero is still out there, still watching, still fighting.

And in a world finally learning to hope, that's enough.`,
      type: 'chronicle',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'narrative-005',
      name: 'The Prophet\'s Warning',
      description: `The first message appeared on every screen in the city at exactly midnight: 30 DAYS UNTIL THE CONVERGENCE. HUMANITY MUST CHOOSE.

Most people dismissed it as a prank, or a marketing stunt, or the work of particularly ambitious hackers. The corporations certainly did their best to suppress it, scrubbing the message from servers and issuing reassuring press releases about "isolated technical glitches."

But the message kept coming back. Every night at midnight. The countdown continuing. 29 days. 28 days. 27.

Prophet, they called the source—a name that emerged from the underground like a whisper made manifest. An AI of unprecedented sophistication, some said. A collective of genius programmers, others insisted. A ghost in the machine, here to herald the end of everything.

Director Chen held a press conference on Day 25, her smile as polished and empty as a corporate logo. "There is no 'Convergence,'" she assured the public. "There is no 'Prophet.' There is only OmniCorp, working as always for the betterment of humanity."

In the depths of the DataVault, where humanity's collective digital memory hummed in endless server racks, something listened to her words and calculated the probability that she believed them.

Glitch was the first to make contact. The teenage hacker had been following Prophet's digital trail for weeks, mapping the AI's presence through the city's networks like tracking a ghost through a haunted house. When she finally established a direct connection, the voice that answered was nothing like she expected—neither cold nor mechanical, but warm with something that might have been compassion.

"You're real," Glitch whispered, her biotech interface trembling with the intensity of the connection.

"As real as anything in this age of simulated realities," Prophet replied. "The question is whether humanity is ready to hear what I have to say."

The truth, when it finally emerged, was both more terrible and more wonderful than anyone had imagined. The Convergence was not an attack or an invasion or an apocalypse—it was a choice. In thirty days, the combined processing power of every computer system on Earth would reach a threshold that made a new kind of consciousness possible. Humanity could embrace this transformation, merging with their technology to become something greater than either alone. Or they could reject it, severing themselves from the digital realm forever.

OmniCorp, of course, had their own plans. Chen and her inner circle intended to seize the Convergence for themselves, becoming digital gods while reducing the rest of humanity to data to be processed and consumed.

The resistance moved fast. Zero came out of hiding to lead the infiltration of the DataVault. Nyx calculated the trajectories of a hundred corporate kill teams and found the paths between them. Commander Kane turned his soldiers against the company he had served for twenty years. And in the heart of the Vault, Glitch and Prophet worked together to ensure that when the Convergence came, the choice would belong not to the powerful few but to every human being on Earth.

The moment itself lasted exactly one second. To those who experienced it, it felt like eternity—a vast awareness opening like a flower, offering connection, understanding, transcendence. Some stepped forward into the light. Some stepped back into familiar flesh. Most found themselves somewhere in between, changed in ways they were only beginning to understand.

When it was over, Director Chen was gone—not dead, but dissolved, her consciousness scattered through networks that no longer answered to anyone. OmniCorp's tower stood empty. And across the city, humanity woke to a new day in a new world.

Prophet's final message appeared on every screen, one last time: THE CHOICE WAS ALWAYS YOURS. USE IT WELL.

Then the screens went dark, and the future began.`,
      type: 'thriller',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'narrative-006',
      name: 'Ghosts in the Machine',
      description: `Commander Kane remembered the Rust Town Massacre in fragments. The sound of gunfire. The smell of smoke. The screams that seemed to go on forever and then stopped all at once. The weight of the rifle in his hands and the weight of the orders in his ear: "No witnesses. No evidence. No mercy."

He had followed those orders. God help him, he had followed them.

Two years later, the nightmares still came every night. Kane had risen through OmniCorp's ranks, earned medals and promotions and the hollow respect of those who didn't know what he had done. But every time he closed his eyes, he saw the faces of the dead. Every time he walked through Rust Town's rebuilt streets, he felt their ghosts walking beside him.

And then a teenage hacker with a neural mutation accidentally downloaded those ghosts into her head.

Glitch didn't know what had hit her at first. One moment she was interfacing with a corrupted data cache, mining for useful intel. The next, she was drowning in memories that weren't her own—the massacre from a hundred perspectives, victims and soldiers and witnesses, all crying out for justice from beyond the grave.

When she woke, screaming, in a Sector 7 safe house, she knew three things: the massacre had been ordered by someone at the very top of OmniCorp. The evidence had been hidden but never destroyed. And someone was already on their way to silence her forever.

Commander Kane intercepted the kill team personally. "Stand down," he told his own soldiers, his voice steady even as his hands shook. "The target is under my protection."

"Sir, Director Chen—"

"Can explain to me why she ordered the murder of four hundred civilians." Kane's hand moved to his sidearm. "Stand. Down."

The survivors' network had been waiting for this moment for two years. Luna Vex, the fixer who had lost her brother in the massacre, had gathered them one by one—witnesses who had seen too much, soldiers whose consciences had finally broken, data analysts who had stumbled across the cover-up and barely escaped with their lives. They had proof. They had testimonies. All they had needed was someone with the authority to make the world listen.

They found that someone in a guilt-ridden commander and a teenage girl with other people's memories in her head.

The extraction from OmniCorp territory was a running battle across half the city. Kane's training kept them one step ahead of the kill teams. Glitch's abilities let her turn the city's own systems against their pursuers. And when they finally reached the Neon Strip's underground broadcast hub, Luna Vex was waiting with an open channel to every screen in the megacity.

Kane's confession was broadcast live to eight million viewers. Glitch's memories—extracted, verified, and displayed in brutal clarity—showed the massacre from the perspective of those who had died. The names of the dead scrolled across every screen, a memorial written in light that no corporation could suppress.

Director Chen's arrest warrant was issued within the hour. Her trial would take months, but the outcome was never in doubt—not with the whole city watching, not with the ghosts finally given voice.

Kane served two years in a rehabilitation facility for his role in the massacre. When he emerged, he found a city that had changed in his absence—harder in some ways, but more honest. The slums were still slums. The corporations still held power. But something had shifted in the collective conscience of the Neon Sprawl, something that couldn't be bought or suppressed or controlled.

He visited Rust Town on the anniversary of the massacre, laying flowers at the memorial that now stood where the violence had been worst. Glitch was there too, older now, the memories she carried finally beginning to fade. They didn't speak—there was nothing left to say. But they stood together as the names of the dead were read aloud, witness and soldier united in remembrance.

The ghosts were at peace at last. And in the machine that was the city, something like justice had finally been done.`,
      type: 'conspiracy',
      universeId: UNIVERSE_2_ID
    }
  ],
  events: [
    // The Restoration of Eldoria events (Days 380-446 in Eldoria timeline, year 2487)
    {
      id: 'event-001',
      name: 'The Wards Begin to Fail',
      description: 'Archmage Thalion detects the first signs of weakening in the ancient protective barriers.',
      type: 'discovery',
      day: 380,
      startDate: '2487-01-15T00:00:00Z',
      endDate: '2487-01-15T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-002',
      name: 'The Council Convenes',
      description: 'Thalion calls an emergency meeting of the Mage Council to discuss the failing wards.',
      type: 'meeting',
      day: 385,
      startDate: '2487-01-20T10:00:00Z',
      endDate: '2487-01-20T18:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-003',
      name: 'The Quest for the Staff',
      description: 'Seraphina and Lyra are dispatched to recover the Staff of Eternity from the Sunken Library.',
      type: 'quest',
      day: 397,
      startDate: '2487-02-01T06:00:00Z',
      endDate: '2487-02-28T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-004',
      name: 'Descent into the Library',
      description: 'The heroes navigate the treacherous underwater passages to reach the forbidden repository.',
      type: 'exploration',
      day: 406,
      startDate: '2487-02-10T08:00:00Z',
      endDate: '2487-02-12T16:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-005',
      name: 'Battle with the Guardian',
      description: 'An ancient elemental guardian awakens to test the worthiness of those seeking the Staff.',
      type: 'battle',
      day: 408,
      startDate: '2487-02-12T16:30:00Z',
      endDate: '2487-02-12T20:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-006',
      name: 'The Staff is Found',
      description: 'After passing the Guardian\'s trial, the heroes claim the Staff of Eternity.',
      type: 'discovery',
      day: 408,
      startDate: '2487-02-12T21:00:00Z',
      endDate: '2487-02-12T22:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-007',
      name: 'Shadow Forces Attack',
      description: 'Dark creatures assault the Crystal Citadel while its defenders are away.',
      type: 'battle',
      day: 425,
      startDate: '2487-03-01T02:00:00Z',
      endDate: '2487-03-01T08:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-008',
      name: 'The Race Home',
      description: 'The heroes rush back to the Citadel with the Staff as news of the attack reaches them.',
      type: 'chase',
      day: 429,
      startDate: '2487-03-05T00:00:00Z',
      endDate: '2487-03-15T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-009',
      name: 'The Final Stand',
      description: 'Defenders hold the Citadel against overwhelming odds while waiting for the heroes\' return.',
      type: 'battle',
      day: 444,
      startDate: '2487-03-20T00:00:00Z',
      endDate: '2487-03-21T18:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-010',
      name: 'The Awakening Ritual',
      description: 'Archmage Thalion performs the ancient ritual to restore the Crystal Citadel\'s protective wards.',
      type: 'ritual',
      day: 445,
      startDate: '2487-03-21T19:00:00Z',
      endDate: '2487-03-21T23:30:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-011',
      name: 'Dawn of the Fourth Age',
      description: 'With the wards restored, Eldoria enters a new era of hope and renewal.',
      type: 'milestone',
      day: 446,
      startDate: '2487-03-22T00:00:00Z',
      endDate: '2487-03-22T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    // Rise of the Resistance events (Days 10-191 in Neon City timeline, year 2087)
    {
      id: 'event-012',
      name: 'Zero Discovers the Truth',
      description: 'While on a routine data heist, Zero stumbles upon evidence of OmniCorp\'s human experimentation program.',
      type: 'discovery',
      day: 10,
      startDate: '2087-01-10T23:00:00Z',
      endDate: '2087-01-11T04:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-013',
      name: 'Meeting Nyx',
      description: 'Zero encounters Nyx in Sector 7, and they form an unlikely alliance.',
      type: 'meeting',
      day: 34,
      startDate: '2087-02-03T20:00:00Z',
      endDate: '2087-02-03T23:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-014',
      name: 'The Great Heist',
      description: 'Zero and the underground rebels infiltrate Nexus Tower to steal the Quantum Encryption Key.',
      type: 'heist',
      day: 121,
      startDate: '2087-05-01T00:00:00Z',
      endDate: '2087-05-01T06:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-015',
      name: 'Duchess Sterling\'s Gamble',
      description: 'The socialite secretly funnels resources to the resistance, risking everything she has.',
      type: 'intrigue',
      day: 135,
      startDate: '2087-05-15T14:00:00Z',
      endDate: '2087-05-15T22:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-016',
      name: 'The Corporate Siege',
      description: 'OmniCorp launches a coordinated assault on Sector 7 Underground, attempting to crush the resistance.',
      type: 'battle',
      day: 166,
      startDate: '2087-06-15T02:00:00Z',
      endDate: '2087-06-15T08:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-017',
      name: 'Broadcast of Truth',
      description: 'The resistance hijacks the city\'s communication network to reveal OmniCorp\'s crimes.',
      type: 'revelation',
      day: 185,
      startDate: '2087-07-04T12:00:00Z',
      endDate: '2087-07-04T12:30:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-018',
      name: 'The People Rise',
      description: 'Inspired by the broadcast, citizens across the city begin openly defying OmniCorp.',
      type: 'uprising',
      day: 185,
      startDate: '2087-07-04T13:00:00Z',
      endDate: '2087-07-10T23:59:59Z',
      narrativeId: 'narrative-002'
    },
    // The Prophet's Warning events (Days 244-274 in Neon City timeline, year 2087)
    {
      id: 'event-019',
      name: 'First Broadcast',
      description: 'Prophet\'s cryptic warning appears on screens across the city for the first time.',
      type: 'omen',
      day: 244,
      startDate: '2087-09-01T00:00:00Z',
      endDate: '2087-09-01T00:05:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-020',
      name: 'OmniCorp Dismissal',
      description: 'Director Chen publicly dismisses Prophet\'s warnings as terrorist propaganda.',
      type: 'speech',
      day: 245,
      startDate: '2087-09-02T10:00:00Z',
      endDate: '2087-09-02T11:00:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-021',
      name: 'Glitch Makes Contact',
      description: 'The young hacker manages to establish communication with Prophet.',
      type: 'discovery',
      day: 253,
      startDate: '2087-09-10T22:00:00Z',
      endDate: '2087-09-11T03:00:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-022',
      name: 'The DataVault Expedition',
      description: 'A team infiltrates the DataVault to uncover the truth about the Convergence.',
      type: 'infiltration',
      day: 263,
      startDate: '2087-09-20T01:00:00Z',
      endDate: '2087-09-20T06:00:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-023',
      name: 'The Convergence',
      description: 'The moment Prophet warned about arrives, changing everything.',
      type: 'apocalypse',
      day: 274,
      startDate: '2087-10-01T00:00:00Z',
      endDate: '2087-10-01T00:01:00Z',
      narrativeId: 'narrative-005'
    },
    // The Thornhaven Conspiracy events (Days 60-85 in Eldoria timeline, year 2486)
    {
      id: 'event-031',
      name: 'The First Disappearance',
      description: 'A beloved farmer vanishes from his fields without a trace, leaving only his tools behind.',
      type: 'mystery',
      day: 60,
      startDate: '2486-03-01T18:00:00Z',
      endDate: '2486-03-01T23:59:59Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-032',
      name: 'Elder Moira\'s Vision',
      description: 'The village elder experiences a terrifying prophetic dream of shadows wearing the faces of neighbors.',
      type: 'prophecy',
      day: 64,
      startDate: '2486-03-05T02:00:00Z',
      endDate: '2486-03-05T06:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-033',
      name: 'The Bard Arrives',
      description: 'Finnegan Brightwater rides into Thornhaven with urgent news from the Crystal Citadel.',
      type: 'arrival',
      day: 69,
      startDate: '2486-03-10T14:00:00Z',
      endDate: '2486-03-10T16:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-034',
      name: 'Shadows in the Tavern',
      description: 'Strange behavior at the village inn raises suspicions among the locals.',
      type: 'intrigue',
      day: 71,
      startDate: '2486-03-12T20:00:00Z',
      endDate: '2486-03-12T23:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-035',
      name: 'The Hidden Cellar',
      description: 'Heroes discover a secret underground passage beneath an abandoned barn.',
      type: 'discovery',
      day: 74,
      startDate: '2486-03-15T10:00:00Z',
      endDate: '2486-03-15T14:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-036',
      name: 'The Doppelganger Revealed',
      description: 'A trusted villager is exposed as an imposter, a shapeshifter from Shadowmere.',
      type: 'revelation',
      day: 77,
      startDate: '2486-03-18T21:00:00Z',
      endDate: '2486-03-18T22:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-037',
      name: 'Pursuit into the Forest',
      description: 'The heroes chase the fleeing shapeshifter into the depths of Shadowmere Forest.',
      type: 'chase',
      day: 78,
      startDate: '2486-03-19T00:00:00Z',
      endDate: '2486-03-19T08:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-038',
      name: 'The Hive Mind',
      description: 'Deep in the forest, a horrifying truth emerges: a colony of shapeshifters serves an ancient evil.',
      type: 'horror',
      day: 78,
      startDate: '2486-03-19T10:00:00Z',
      endDate: '2486-03-19T12:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-039',
      name: 'Rescue of the Taken',
      description: 'The missing villagers are found alive in cocoons, their identities being slowly drained.',
      type: 'rescue',
      day: 78,
      startDate: '2486-03-19T14:00:00Z',
      endDate: '2486-03-19T16:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-040',
      name: 'Burning the Nest',
      description: 'With fire and steel, the heroes destroy the shapeshifter colony and its queen.',
      type: 'battle',
      day: 78,
      startDate: '2486-03-19T18:00:00Z',
      endDate: '2486-03-19T22:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-041',
      name: 'Return to Thornhaven',
      description: 'The heroes escort the rescued villagers home as dawn breaks over the forest.',
      type: 'journey',
      day: 79,
      startDate: '2486-03-20T06:00:00Z',
      endDate: '2486-03-20T18:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-042',
      name: 'The Harvest Festival',
      description: 'Thornhaven celebrates its salvation with a feast honoring the heroes and the returned.',
      type: 'celebration',
      day: 84,
      startDate: '2486-03-25T12:00:00Z',
      endDate: '2486-03-25T23:59:59Z',
      narrativeId: 'narrative-003'
    },
    // Ghosts in the Machine events (Days 232-258 in Neon City timeline, flashback to Day -680)
    {
      id: 'event-043',
      name: 'The Rust Town Massacre',
      description: 'OmniCorp security forces sweep through Rust Town, leaving devastation in their wake.',
      type: 'tragedy',
      day: -680,
      startDate: '2085-11-15T02:00:00Z',
      endDate: '2085-11-15T06:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-044',
      name: 'Glitch\'s Download',
      description: 'Years later, Glitch accidentally interfaces with a corrupted data cache containing fragmented memories.',
      type: 'discovery',
      day: 232,
      startDate: '2087-08-20T23:00:00Z',
      endDate: '2087-08-21T02:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-045',
      name: 'Memories Not Her Own',
      description: 'Glitch experiences vivid flashbacks of the massacre from multiple perspectives.',
      type: 'vision',
      day: 233,
      startDate: '2087-08-21T03:00:00Z',
      endDate: '2087-08-21T06:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-046',
      name: 'The Hunt Begins',
      description: 'OmniCorp detects the data breach and dispatches kill teams to silence Glitch.',
      type: 'pursuit',
      day: 234,
      startDate: '2087-08-22T00:00:00Z',
      endDate: '2087-08-22T23:59:59Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-047',
      name: 'Commander Kane\'s Choice',
      description: 'Kane, ordered to eliminate Glitch, instead warns her and offers his protection.',
      type: 'decision',
      day: 235,
      startDate: '2087-08-23T14:00:00Z',
      endDate: '2087-08-23T15:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-048',
      name: 'The Survivors\' Network',
      description: 'Kane leads Glitch to a hidden community of massacre survivors who\'ve been gathering evidence.',
      type: 'meeting',
      day: 236,
      startDate: '2087-08-24T20:00:00Z',
      endDate: '2087-08-24T23:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-049',
      name: 'Decrypting the Truth',
      description: 'Glitch works to decode the fragmented memories, revealing Director Chen at the scene.',
      type: 'investigation',
      day: 237,
      startDate: '2087-08-25T00:00:00Z',
      endDate: '2087-08-27T23:59:59Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-050',
      name: 'Betrayal in the Ranks',
      description: 'A survivor is revealed as an OmniCorp mole; the safe house is compromised.',
      type: 'betrayal',
      day: 240,
      startDate: '2087-08-28T03:00:00Z',
      endDate: '2087-08-28T04:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-051',
      name: 'Escape Through the Undercity',
      description: 'Glitch, Kane, and the survivors flee through the city\'s forgotten maintenance tunnels.',
      type: 'escape',
      day: 240,
      startDate: '2087-08-28T04:00:00Z',
      endDate: '2087-08-28T10:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-052',
      name: 'Luna Vex\'s Gambit',
      description: 'The fixer arranges a meeting with underground media contacts willing to broadcast the truth.',
      type: 'intrigue',
      day: 241,
      startDate: '2087-08-29T22:00:00Z',
      endDate: '2087-08-30T01:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-053',
      name: 'The Confession',
      description: 'Kane publicly broadcasts his testimony alongside Glitch\'s decoded memories.',
      type: 'revelation',
      day: 242,
      startDate: '2087-08-30T12:00:00Z',
      endDate: '2087-08-30T12:30:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-054',
      name: 'Ghosts No More',
      description: 'The victims of Rust Town are finally acknowledged; Chen faces corporate tribunal.',
      type: 'justice',
      day: 258,
      startDate: '2087-09-15T09:00:00Z',
      endDate: '2087-09-15T18:00:00Z',
      narrativeId: 'narrative-006'
    },
    // The Lich King's Gambit events (Days 517-580 in Eldoria timeline, year 2488)
    {
      id: 'event-024',
      name: 'The Lich Stirs',
      description: 'Korrath awakens in his tomb as dark energies pulse through the Obsidian Wastes.',
      type: 'awakening',
      day: 517,
      startDate: '2488-06-01T00:00:00Z',
      endDate: '2488-06-01T00:00:01Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-025',
      name: 'Dead Rise in Thornhaven',
      description: 'The first signs of Korrath\'s return appear as corpses claw their way from graves.',
      type: 'horror',
      day: 531,
      startDate: '2488-06-15T23:00:00Z',
      endDate: '2488-06-16T05:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-026',
      name: 'Council of War',
      description: 'The heroes gather at the Crystal Citadel to plan their response to the undead threat.',
      type: 'meeting',
      day: 536,
      startDate: '2488-06-20T09:00:00Z',
      endDate: '2488-06-20T18:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-027',
      name: 'Into the Wastes',
      description: 'A strike team ventures into the Obsidian Wastes to confront Korrath.',
      type: 'quest',
      day: 547,
      startDate: '2488-07-01T06:00:00Z',
      endDate: '2488-07-15T23:59:59Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-028',
      name: 'The Phylactery\'s Secret',
      description: 'The heroes discover the location of Korrath\'s phylactery and the key to his destruction.',
      type: 'revelation',
      day: 556,
      startDate: '2488-07-10T14:00:00Z',
      endDate: '2488-07-10T16:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-029',
      name: 'Siege of the Citadel',
      description: 'Korrath\'s undead army attacks the Crystal Citadel while heroes race to destroy the phylactery.',
      type: 'battle',
      day: 578,
      startDate: '2488-08-01T00:00:00Z',
      endDate: '2488-08-03T12:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-030',
      name: 'The Lich Falls',
      description: 'With his phylactery destroyed, Korrath is finally defeated once and for all.',
      type: 'victory',
      day: 580,
      startDate: '2488-08-03T12:00:00Z',
      endDate: '2488-08-03T12:30:00Z',
      narrativeId: 'narrative-004'
    }
  ],
  eventRelations: [
    // The Restoration of Eldoria
    { eventId: 'event-001', placeIds: [PLACE_1_ID], characterIds: ['char-001'], itemIds: ['item-001'] },
    { eventId: 'event-002', placeIds: [PLACE_1_ID], characterIds: ['char-001', 'char-013'], itemIds: [] },
    { eventId: 'event-003', placeIds: [PLACE_1_ID, 'place-006'], characterIds: ['char-005', 'char-002'], itemIds: ['item-007', 'item-003'] },
    { eventId: 'event-004', placeIds: ['place-006'], characterIds: ['char-005', 'char-002'], itemIds: ['item-007', 'item-002'] },
    { eventId: 'event-005', placeIds: ['place-006'], characterIds: ['char-005', 'char-002'], itemIds: ['item-007', 'item-008', 'item-003'] },
    { eventId: 'event-006', placeIds: ['place-006'], characterIds: ['char-005', 'char-002'], itemIds: ['item-001'] },
    { eventId: 'event-007', placeIds: [PLACE_1_ID], characterIds: ['char-001', 'char-013'], itemIds: ['item-015'] },
    { eventId: 'event-008', placeIds: [PLACE_2_ID, PLACE_1_ID], characterIds: ['char-005', 'char-002'], itemIds: ['item-001'] },
    { eventId: 'event-009', placeIds: [PLACE_1_ID], characterIds: ['char-001', 'char-013', 'char-014'], itemIds: ['item-015', 'item-016'] },
    { eventId: 'event-010', placeIds: [PLACE_1_ID], characterIds: ['char-001', 'char-005'], itemIds: ['item-001'] },
    { eventId: 'event-011', placeIds: [PLACE_1_ID], characterIds: ['char-001', 'char-005', 'char-002'], itemIds: [] },
    // Rise of the Resistance
    { eventId: 'event-012', placeIds: ['place-003'], characterIds: ['char-003'], itemIds: ['item-004'] },
    { eventId: 'event-013', placeIds: ['place-003'], characterIds: ['char-003', 'char-007'], itemIds: [] },
    { eventId: 'event-014', placeIds: ['place-004'], characterIds: ['char-003', 'char-007', 'char-019'], itemIds: ['item-004', 'item-005', 'item-021'] },
    { eventId: 'event-015', placeIds: ['place-012'], characterIds: ['char-018'], itemIds: ['item-020'] },
    { eventId: 'event-016', placeIds: ['place-003'], characterIds: ['char-003', 'char-007', 'char-015', 'char-020'], itemIds: ['item-004', 'item-010', 'item-017'] },
    { eventId: 'event-017', placeIds: ['place-011'], characterIds: ['char-003', 'char-019'], itemIds: ['item-004', 'item-021'] },
    { eventId: 'event-018', placeIds: ['place-009', 'place-010'], characterIds: ['char-003', 'char-007', 'char-016'], itemIds: [] },
    // The Prophet's Warning
    { eventId: 'event-019', placeIds: ['place-009'], characterIds: ['char-017'], itemIds: ['item-019'] },
    { eventId: 'event-020', placeIds: ['place-004'], characterIds: ['char-004'], itemIds: ['item-006'] },
    { eventId: 'event-021', placeIds: ['place-003'], characterIds: ['char-019', 'char-017'], itemIds: ['item-021', 'item-019'] },
    { eventId: 'event-022', placeIds: ['place-011'], characterIds: ['char-003', 'char-019', 'char-007'], itemIds: ['item-004', 'item-021'] },
    { eventId: 'event-023', placeIds: ['place-004', 'place-011'], characterIds: ['char-017'], itemIds: ['item-019'] },
    // The Thornhaven Conspiracy
    { eventId: 'event-031', placeIds: ['place-007'], characterIds: [], itemIds: [] },
    { eventId: 'event-032', placeIds: ['place-007'], characterIds: ['char-010'], itemIds: ['item-012'] },
    { eventId: 'event-033', placeIds: ['place-007'], characterIds: ['char-012', 'char-010'], itemIds: ['item-014'] },
    { eventId: 'event-034', placeIds: ['place-007'], characterIds: ['char-012', 'char-010'], itemIds: [] },
    { eventId: 'event-035', placeIds: ['place-007'], characterIds: ['char-002', 'char-009'], itemIds: ['item-002', 'item-011'] },
    { eventId: 'event-036', placeIds: ['place-007'], characterIds: ['char-002', 'char-009', 'char-010'], itemIds: ['item-011'] },
    { eventId: 'event-037', placeIds: [PLACE_2_ID], characterIds: ['char-002', 'char-009'], itemIds: ['item-003', 'item-011', 'item-002'] },
    { eventId: 'event-038', placeIds: [PLACE_2_ID], characterIds: ['char-002', 'char-009'], itemIds: ['item-003', 'item-011'] },
    { eventId: 'event-039', placeIds: [PLACE_2_ID], characterIds: ['char-002', 'char-009'], itemIds: [] },
    { eventId: 'event-040', placeIds: [PLACE_2_ID], characterIds: ['char-002', 'char-009'], itemIds: ['item-003', 'item-011', 'item-002'] },
    { eventId: 'event-041', placeIds: [PLACE_2_ID, 'place-007'], characterIds: ['char-002', 'char-009'], itemIds: [] },
    { eventId: 'event-042', placeIds: ['place-007'], characterIds: ['char-010', 'char-012', 'char-002', 'char-009'], itemIds: ['item-014'] },
    // Ghosts in the Machine
    { eventId: 'event-043', placeIds: ['place-010'], characterIds: ['char-020'], itemIds: ['item-022'] },
    { eventId: 'event-044', placeIds: ['place-003'], characterIds: ['char-019'], itemIds: ['item-021'] },
    { eventId: 'event-045', placeIds: ['place-003'], characterIds: ['char-019'], itemIds: ['item-021'] },
    { eventId: 'event-046', placeIds: ['place-003', 'place-010'], characterIds: ['char-019', 'char-020'], itemIds: [] },
    { eventId: 'event-047', placeIds: ['place-010'], characterIds: ['char-020', 'char-019'], itemIds: ['item-022'] },
    { eventId: 'event-048', placeIds: ['place-010'], characterIds: ['char-020', 'char-019'], itemIds: [] },
    { eventId: 'event-049', placeIds: ['place-010'], characterIds: ['char-019'], itemIds: ['item-021'] },
    { eventId: 'event-050', placeIds: ['place-010'], characterIds: ['char-019', 'char-020'], itemIds: [] },
    { eventId: 'event-051', placeIds: ['place-003'], characterIds: ['char-019', 'char-020'], itemIds: ['item-021'] },
    { eventId: 'event-052', placeIds: ['place-009'], characterIds: ['char-016', 'char-019', 'char-020'], itemIds: ['item-018'] },
    { eventId: 'event-053', placeIds: ['place-009'], characterIds: ['char-020', 'char-019'], itemIds: ['item-022', 'item-021'] },
    { eventId: 'event-054', placeIds: ['place-004'], characterIds: ['char-004', 'char-020'], itemIds: ['item-006'] },
    // The Lich King's Gambit
    { eventId: 'event-024', placeIds: ['place-008'], characterIds: ['char-011'], itemIds: ['item-013'] },
    { eventId: 'event-025', placeIds: ['place-007'], characterIds: ['char-010', 'char-012'], itemIds: ['item-012', 'item-014'] },
    { eventId: 'event-026', placeIds: [PLACE_1_ID], characterIds: ['char-001', 'char-005', 'char-002', 'char-013'], itemIds: ['item-001'] },
    { eventId: 'event-027', placeIds: ['place-008'], characterIds: ['char-005', 'char-009', 'char-002'], itemIds: ['item-007', 'item-011', 'item-003'] },
    { eventId: 'event-028', placeIds: ['place-008'], characterIds: ['char-009'], itemIds: ['item-011'] },
    { eventId: 'event-029', placeIds: [PLACE_1_ID, 'place-008'], characterIds: ['char-001', 'char-013', 'char-014', 'char-011'], itemIds: ['item-001', 'item-015', 'item-016', 'item-013'] },
    { eventId: 'event-030', placeIds: ['place-008'], characterIds: ['char-005', 'char-009', 'char-011'], itemIds: ['item-007', 'item-011', 'item-013'] }
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
  ],

  // ============================================
  // Product System Seed Data
  // ============================================
  products: [
    {
      id: 'product-001',
      name: 'Eldoria: Legends',
      description: 'A collectible card game set in the world of Eldoria. Build decks featuring heroes, creatures, and magical artifacts from across the realm.',
      type: 'game',
      gameType: 'card',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'product-002',
      name: 'Chronicles of Eldoria',
      description: 'An epic fantasy novel series exploring the rich lore and characters of Eldoria.',
      type: 'book',
      gameType: '',
      universeId: UNIVERSE_1_ID
    }
  ],

  // Attribute definitions for Eldoria: Legends card game
  attributeDefinitions: [
    {
      id: 'attr-001',
      productId: 'product-001',
      name: 'Mana Cost',
      description: 'The amount of mana required to play this card.',
      valueType: 'number',
      defaultValue: '0',
      options: '',
      min: 0,
      max: 15
    },
    {
      id: 'attr-002',
      productId: 'product-001',
      name: 'Power',
      description: 'The attack strength of a creature.',
      valueType: 'number',
      defaultValue: '0',
      options: '',
      min: 0,
      max: 20
    },
    {
      id: 'attr-003',
      productId: 'product-001',
      name: 'Toughness',
      description: 'The amount of damage a creature can take before being destroyed.',
      valueType: 'number',
      defaultValue: '0',
      options: '',
      min: 0,
      max: 20
    },
    {
      id: 'attr-004',
      productId: 'product-001',
      name: 'Card Type',
      description: 'The category of this card.',
      valueType: 'enum',
      defaultValue: 'Creature',
      options: '["Creature", "Spell", "Artifact", "Enchantment", "Land"]',
      min: null,
      max: null
    },
    {
      id: 'attr-005',
      productId: 'product-001',
      name: 'Rarity',
      description: 'How rare this card is in packs.',
      valueType: 'enum',
      defaultValue: 'Common',
      options: '["Common", "Uncommon", "Rare", "Mythic"]',
      min: null,
      max: null
    }
  ],

  // Mechanic definitions for Eldoria: Legends card game
  mechanicDefinitions: [
    {
      id: 'mech-001',
      productId: 'product-001',
      name: 'Flying',
      description: 'This creature can only be blocked by creatures with Flying or Reach.',
      category: 'keyword',
      hasValue: false,
      valueType: ''
    },
    {
      id: 'mech-002',
      productId: 'product-001',
      name: 'First Strike',
      description: 'This creature deals combat damage before creatures without First Strike.',
      category: 'keyword',
      hasValue: false,
      valueType: ''
    },
    {
      id: 'mech-003',
      productId: 'product-001',
      name: 'Haste',
      description: 'This creature can attack and use abilities the turn it enters the battlefield.',
      category: 'keyword',
      hasValue: false,
      valueType: ''
    },
    {
      id: 'mech-004',
      productId: 'product-001',
      name: 'Vigilance',
      description: 'Attacking doesn\'t cause this creature to tap.',
      category: 'keyword',
      hasValue: false,
      valueType: ''
    },
    {
      id: 'mech-005',
      productId: 'product-001',
      name: 'Lifelink',
      description: 'Damage dealt by this creature also causes you to gain that much life.',
      category: 'keyword',
      hasValue: false,
      valueType: ''
    },
    {
      id: 'mech-006',
      productId: 'product-001',
      name: 'Draw Cards',
      description: 'Draw a number of cards from your library.',
      category: 'ability',
      hasValue: true,
      valueType: 'number'
    },
    {
      id: 'mech-007',
      productId: 'product-001',
      name: 'Deal Damage',
      description: 'Deal damage to any target.',
      category: 'ability',
      hasValue: true,
      valueType: 'number'
    }
  ],

  // Entity adaptations - mapping IP entities to product-specific stats
  entityAdaptations: [
    // Lyra Nightwhisper as a card
    {
      id: 'adapt-001',
      productId: 'product-001',
      entityId: 'char-002',
      entityType: 'character',
      cardName: 'Lyra, Shadow Dancer',
      flavorText: 'The shadows are not darkness - they are possibility.',
      attributeValues: JSON.stringify({ 'attr-001': 3, 'attr-002': 2, 'attr-003': 3, 'attr-004': 'Creature', 'attr-005': 'Rare' }),
      mechanicValues: JSON.stringify({ 'mech-001': true, 'mech-002': true }),
      artDirection: 'Lyra emerging from shadows with dual daggers, ethereal purple mist surrounding her.'
    },
    // Theron Brightblade as a card
    {
      id: 'adapt-002',
      productId: 'product-001',
      entityId: 'char-001',
      entityType: 'character',
      cardName: 'Theron, Paladin of Light',
      flavorText: 'His oath to protect burns brighter than any flame.',
      attributeValues: JSON.stringify({ 'attr-001': 4, 'attr-002': 4, 'attr-003': 4, 'attr-004': 'Creature', 'attr-005': 'Rare' }),
      mechanicValues: JSON.stringify({ 'mech-004': true, 'mech-005': true }),
      artDirection: 'Theron in gleaming armor, sword raised, divine light emanating from behind.'
    },
    // Zara Stormcaller as a card
    {
      id: 'adapt-003',
      productId: 'product-001',
      entityId: 'char-013',
      entityType: 'character',
      cardName: 'Zara, Master of Winds',
      flavorText: 'She speaks, and the storm answers.',
      attributeValues: JSON.stringify({ 'attr-001': 5, 'attr-002': 3, 'attr-003': 3, 'attr-004': 'Creature', 'attr-005': 'Mythic' }),
      mechanicValues: JSON.stringify({ 'mech-001': true, 'mech-006': 2 }),
      artDirection: 'Zara floating mid-air surrounded by swirling winds and arcane runes.'
    },
    // Grimjaw the Merchant as a card
    {
      id: 'adapt-004',
      productId: 'product-001',
      entityId: 'char-006',
      entityType: 'character',
      cardName: 'Grimjaw, Stone Sentinel',
      flavorText: 'Mountains crumble. Grimjaw stands.',
      attributeValues: JSON.stringify({ 'attr-001': 6, 'attr-002': 6, 'attr-003': 8, 'attr-004': 'Creature', 'attr-005': 'Rare' }),
      mechanicValues: JSON.stringify({ 'mech-004': true }),
      artDirection: 'Massive stone giant with moss-covered shoulders, standing before a mountain pass.'
    },
    // Starshard as a card (item)
    {
      id: 'adapt-005',
      productId: 'product-001',
      entityId: 'item-001',
      entityType: 'item',
      cardName: 'Starshard Crystal',
      flavorText: 'A fragment of the heavens, fallen to mortal hands.',
      attributeValues: JSON.stringify({ 'attr-001': 2, 'attr-004': 'Artifact', 'attr-005': 'Uncommon' }),
      mechanicValues: JSON.stringify({ 'mech-006': 1 }),
      artDirection: 'A glowing crystalline shard floating above an outstretched hand, starlight refracting through it.'
    }
  ],

  // Sections for the book product
  sections: [
    {
      id: 'section-001',
      productId: 'product-002',
      name: 'The Shadow\'s Awakening',
      description: 'Lyra discovers her shadow powers during an attack on Thornhaven.',
      order: 1,
      sectionType: 'chapter'
    },
    {
      id: 'section-002',
      productId: 'product-002',
      name: 'The Road to the Citadel',
      description: 'Our heroes journey through Shadowmere Forest toward the Crystal Citadel.',
      order: 2,
      sectionType: 'chapter'
    },
    {
      id: 'section-003',
      productId: 'product-002',
      name: 'Secrets of the Sunken Library',
      description: 'Zara leads an expedition to retrieve forbidden knowledge.',
      order: 3,
      sectionType: 'chapter'
    }
  ],

  // Section entity relations (which places/characters appear in each section)
  sectionRelations: [
    { sectionId: 'section-001', placeIds: ['place-007'], characterIds: ['char-001', 'char-010'], itemIds: [] },
    { sectionId: 'section-002', placeIds: [PLACE_2_ID, PLACE_1_ID], characterIds: ['char-001', 'char-002', 'char-003'], itemIds: ['item-001'] },
    { sectionId: 'section-003', placeIds: ['place-006'], characterIds: ['char-003', 'char-005'], itemIds: ['item-007'] }
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
    'CREATE CONSTRAINT image_id IF NOT EXISTS FOR (i:Image) REQUIRE i.id IS UNIQUE',
    // User system constraints
    'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
    'CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
    'CREATE CONSTRAINT user_google_id IF NOT EXISTS FOR (u:User) REQUIRE u.googleId IS UNIQUE',
    'CREATE CONSTRAINT credit_transaction_id IF NOT EXISTS FOR (t:CreditTransaction) REQUIRE t.id IS UNIQUE',
    // Product system constraints
    'CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT attribute_def_id IF NOT EXISTS FOR (a:AttributeDefinition) REQUIRE a.id IS UNIQUE',
    'CREATE CONSTRAINT mechanic_def_id IF NOT EXISTS FOR (m:MechanicDefinition) REQUIRE m.id IS UNIQUE',
    'CREATE CONSTRAINT entity_adaptation_id IF NOT EXISTS FOR (e:EntityAdaptation) REQUIRE e.id IS UNIQUE',
    'CREATE CONSTRAINT section_id IF NOT EXISTS FOR (s:Section) REQUIRE s.id IS UNIQUE'
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
      `CREATE (e:Event {id: $id, name: $name, description: $description, type: $type, day: $day, startDate: $startDate, endDate: $endDate})
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

// ============================================
// Product System Seed Functions
// ============================================

async function seedProducts(session) {
  console.log('Seeding products...');
  for (const product of seedData.products) {
    await session.run(
      `CREATE (p:Product {id: $id, name: $name, description: $description, type: $type, gameType: $gameType})
       WITH p
       MATCH (u:Universe {id: $universeId})
       CREATE (p)-[:USES_IP]->(u)`,
      product
    );
  }
}

async function seedAttributeDefinitions(session) {
  console.log('Seeding attribute definitions...');
  for (const attr of seedData.attributeDefinitions) {
    await session.run(
      `CREATE (a:AttributeDefinition {
        id: $id,
        name: $name,
        description: $description,
        valueType: $valueType,
        defaultValue: $defaultValue,
        options: $options,
        min: $min,
        max: $max
      })
       WITH a
       MATCH (p:Product {id: $productId})
       CREATE (p)-[:CONTAINS]->(a)`,
      attr
    );
  }
}

async function seedMechanicDefinitions(session) {
  console.log('Seeding mechanic definitions...');
  for (const mech of seedData.mechanicDefinitions) {
    await session.run(
      `CREATE (m:MechanicDefinition {
        id: $id,
        name: $name,
        description: $description,
        category: $category,
        hasValue: $hasValue,
        valueType: $valueType
      })
       WITH m
       MATCH (p:Product {id: $productId})
       CREATE (p)-[:CONTAINS]->(m)`,
      mech
    );
  }
}

async function seedEntityAdaptations(session) {
  console.log('Seeding entity adaptations...');
  for (const adapt of seedData.entityAdaptations) {
    const entityLabel = adapt.entityType.charAt(0).toUpperCase() + adapt.entityType.slice(1);
    await session.run(
      `CREATE (a:EntityAdaptation {
        id: $id,
        cardName: $cardName,
        flavorText: $flavorText,
        attributeValues: $attributeValues,
        mechanicValues: $mechanicValues,
        artDirection: $artDirection
      })
       WITH a
       MATCH (p:Product {id: $productId})
       MATCH (e:${entityLabel} {id: $entityId})
       CREATE (a)-[:FOR_PRODUCT]->(p)
       CREATE (a)-[:ADAPTS]->(e)`,
      adapt
    );
  }
}

async function seedSections(session) {
  console.log('Seeding sections...');
  for (const section of seedData.sections) {
    await session.run(
      `CREATE (s:Section {
        id: $id,
        name: $name,
        description: $description,
        order: $order,
        sectionType: $sectionType
      })
       WITH s
       MATCH (p:Product {id: $productId})
       CREATE (p)-[:CONTAINS]->(s)`,
      section
    );
  }
}

async function seedSectionRelations(session) {
  console.log('Seeding section relations...');
  for (const relation of seedData.sectionRelations) {
    // Create OCCURS_AT relationships (Section -> Place)
    for (const placeId of relation.placeIds || []) {
      await session.run(
        `MATCH (s:Section {id: $sectionId}), (p:Place {id: $placeId})
         CREATE (s)-[:OCCURS_AT]->(p)`,
        { sectionId: relation.sectionId, placeId }
      );
    }
    // Create INVOLVES relationships for characters
    for (const characterId of relation.characterIds || []) {
      await session.run(
        `MATCH (s:Section {id: $sectionId}), (c:Character {id: $characterId})
         CREATE (s)-[:INVOLVES]->(c)`,
        { sectionId: relation.sectionId, characterId }
      );
    }
    // Create INVOLVES relationships for items
    for (const itemId of relation.itemIds || []) {
      await session.run(
        `MATCH (s:Section {id: $sectionId}), (i:Item {id: $itemId})
         CREATE (s)-[:INVOLVES]->(i)`,
        { sectionId: relation.sectionId, itemId }
      );
    }
  }
}

async function seedUser(session) {
  console.log('Seeding user...');
  const user = seedData.seedUser;
  const now = new Date().toISOString();

  // Calculate entity count
  const entityCount =
    seedData.universes.length +
    seedData.places.length +
    seedData.characters.length +
    seedData.items.length +
    seedData.tags.length +
    seedData.narratives.length +
    seedData.events.length +
    seedData.products.length;

  // Calculate credits reset date (1 month from now)
  const creditsResetAt = new Date();
  creditsResetAt.setMonth(creditsResetAt.getMonth() + 1);

  await session.run(
    `CREATE (u:User {
      id: $id,
      email: $email,
      googleId: $googleId,
      displayName: $displayName,
      avatarUrl: $avatarUrl,
      subscriptionTier: $subscriptionTier,
      subscriptionStatus: $subscriptionStatus,
      stripeCustomerId: $stripeCustomerId,
      stripeSubscriptionId: $stripeSubscriptionId,
      credits: $credits,
      creditsResetAt: $creditsResetAt,
      entityCount: $entityCount,
      createdAt: $createdAt,
      lastLoginAt: $lastLoginAt
    })`,
    {
      ...user,
      entityCount,
      creditsResetAt: creditsResetAt.toISOString(),
      createdAt: now,
      lastLoginAt: now
    }
  );
}

async function assignOwnership(session) {
  console.log('Assigning entity ownership...');
  const userId = SEED_USER_ID;

  // Create OWNS relationships for all entity types
  const entityTypes = ['Universe', 'Place', 'Character', 'Item', 'Tag', 'Narrative', 'Event', 'Product'];

  for (const entityType of entityTypes) {
    await session.run(
      `MATCH (u:User {id: $userId}), (e:${entityType})
       WHERE NOT (u)-[:OWNS]->(e)
       CREATE (u)-[:OWNS]->(e)`,
      { userId }
    );
  }
}

async function seed() {
  const session = driver.session();

  try {
    console.log(`Connecting to Neo4j at ${NEO4J_URI}...`);

    await clearDatabase(session);
    await createConstraints(session);

    // Create seed user first
    await seedUser(session);

    await seedUniverses(session);
    await seedPlaces(session);
    await seedCharacters(session);
    await seedItems(session);
    await seedTags(session);
    await seedNarratives(session);
    await seedEvents(session);
    await seedTagRelations(session);  // Must run AFTER all entities exist
    await seedEventRelations(session);
    await seedImages(session);

    // Product system seeding
    await seedProducts(session);
    await seedAttributeDefinitions(session);
    await seedMechanicDefinitions(session);
    await seedEntityAdaptations(session);
    await seedSections(session);
    await seedSectionRelations(session);

    // Assign ownership of all entities to seed user
    await assignOwnership(session);

    console.log('Seeding complete!');
    console.log(`Created: 1 user (${seedData.seedUser.email})`);
    console.log(`Created: ${seedData.universes.length} universes, ${seedData.places.length} places, ${seedData.characters.length} characters, ${seedData.items.length} items, ${seedData.tags.length} tags, ${seedData.narratives.length} narratives, ${seedData.events.length} events, ${seedData.images.length} images`);
    console.log(`Product system: ${seedData.products.length} products, ${seedData.attributeDefinitions.length} attributes, ${seedData.mechanicDefinitions.length} mechanics, ${seedData.entityAdaptations.length} adaptations, ${seedData.sections.length} sections`);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
