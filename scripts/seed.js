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
    // Descriptive tags
    { id: 'tag-001', name: 'Magic', description: 'Related to magical abilities or artifacts', type: 'theme' },
    { id: 'tag-003', name: 'Technology', description: 'Related to advanced technology', type: 'theme' },
    { id: 'tag-005', name: 'Political', description: 'Involved in power struggles', type: 'theme' },
    { id: 'tag-006', name: 'Ancient', description: 'From a bygone era', type: 'theme' },
    { id: 'tag-007', name: 'Sacred', description: 'Holy or spiritually significant', type: 'theme' },
    { id: 'tag-008', name: 'Corrupted', description: 'Tainted by dark forces', type: 'theme' },
    { id: 'tag-009', name: 'Hidden', description: 'Secret or concealed from most', type: 'theme' },
    { id: 'tag-010', name: 'Legendary', description: 'Known throughout the realm', type: 'theme' },
    // Mood/feeling tags
    { id: 'tag-002', name: 'Dangerous', description: 'Poses significant threat', type: 'mood' },
    { id: 'tag-004', name: 'Mysterious', description: 'Has unknown or hidden aspects', type: 'mood' },
    { id: 'tag-011', name: 'Peaceful', description: 'Calm and serene', type: 'mood' },
    { id: 'tag-012', name: 'Ominous', description: 'Foreboding or threatening', type: 'mood' },
    { id: 'tag-013', name: 'Chaotic', description: 'Unpredictable and turbulent', type: 'mood' },
    { id: 'tag-014', name: 'Hopeful', description: 'Inspiring optimism', type: 'mood' },
    // Character trait tags
    { id: 'tag-015', name: 'Wise', description: 'Possessing great knowledge', type: 'trait' },
    { id: 'tag-016', name: 'Ruthless', description: 'Without mercy or compassion', type: 'trait' },
    { id: 'tag-017', name: 'Heroic', description: 'Brave and selfless', type: 'trait' },
    { id: 'tag-018', name: 'Cunning', description: 'Clever and deceptive', type: 'trait' },
    { id: 'tag-019', name: 'Tormented', description: 'Haunted by past actions', type: 'trait' },
    { id: 'tag-020', name: 'Visionary', description: 'Sees beyond the present', type: 'trait' },
    // Gameplay tags
    { id: 'tag-021', name: 'Quest Giver', description: 'Can provide missions', type: 'gameplay' },
    { id: 'tag-022', name: 'Boss', description: 'Major antagonist', type: 'gameplay' },
    { id: 'tag-023', name: 'Ally', description: 'Potential companion', type: 'gameplay' },
    { id: 'tag-024', name: 'Merchant', description: 'Trades goods or services', type: 'gameplay' }
  ],
  tagRelations: [
    // Universe tags
    { entityId: UNIVERSE_1_ID, tagId: 'tag-001' },
    { entityId: UNIVERSE_1_ID, tagId: 'tag-006' },
    { entityId: UNIVERSE_1_ID, tagId: 'tag-010' },
    { entityId: UNIVERSE_2_ID, tagId: 'tag-003' },
    { entityId: UNIVERSE_2_ID, tagId: 'tag-002' },
    { entityId: UNIVERSE_2_ID, tagId: 'tag-013' },
    // Eldoria place tags
    { entityId: PLACE_1_ID, tagId: 'tag-001' },
    { entityId: PLACE_1_ID, tagId: 'tag-005' },
    { entityId: PLACE_1_ID, tagId: 'tag-007' },
    { entityId: PLACE_2_ID, tagId: 'tag-004' },
    { entityId: PLACE_2_ID, tagId: 'tag-002' },
    { entityId: PLACE_2_ID, tagId: 'tag-006' },
    { entityId: 'place-005', tagId: 'tag-002' },
    { entityId: 'place-005', tagId: 'tag-006' },
    { entityId: 'place-005', tagId: 'tag-010' },
    { entityId: 'place-006', tagId: 'tag-009' },
    { entityId: 'place-006', tagId: 'tag-006' },
    { entityId: 'place-006', tagId: 'tag-001' },
    { entityId: 'place-007', tagId: 'tag-011' },
    { entityId: 'place-007', tagId: 'tag-014' },
    { entityId: 'place-008', tagId: 'tag-008' },
    { entityId: 'place-008', tagId: 'tag-002' },
    { entityId: 'place-008', tagId: 'tag-012' },
    // Neon Sprawl place tags
    { entityId: 'place-003', tagId: 'tag-002' },
    { entityId: 'place-003', tagId: 'tag-009' },
    { entityId: 'place-003', tagId: 'tag-013' },
    { entityId: 'place-004', tagId: 'tag-003' },
    { entityId: 'place-004', tagId: 'tag-005' },
    { entityId: 'place-004', tagId: 'tag-012' },
    { entityId: 'place-009', tagId: 'tag-013' },
    { entityId: 'place-009', tagId: 'tag-003' },
    { entityId: 'place-010', tagId: 'tag-002' },
    { entityId: 'place-010', tagId: 'tag-014' },
    { entityId: 'place-011', tagId: 'tag-003' },
    { entityId: 'place-011', tagId: 'tag-009' },
    { entityId: 'place-012', tagId: 'tag-005' },
    { entityId: 'place-012', tagId: 'tag-011' },
    // Eldoria character tags
    { entityId: 'char-001', tagId: 'tag-001' },
    { entityId: 'char-001', tagId: 'tag-015' },
    { entityId: 'char-001', tagId: 'tag-021' },
    { entityId: 'char-002', tagId: 'tag-004' },
    { entityId: 'char-002', tagId: 'tag-017' },
    { entityId: 'char-002', tagId: 'tag-023' },
    { entityId: 'char-005', tagId: 'tag-017' },
    { entityId: 'char-005', tagId: 'tag-010' },
    { entityId: 'char-005', tagId: 'tag-023' },
    { entityId: 'char-006', tagId: 'tag-018' },
    { entityId: 'char-006', tagId: 'tag-024' },
    { entityId: 'char-009', tagId: 'tag-019' },
    { entityId: 'char-009', tagId: 'tag-002' },
    { entityId: 'char-010', tagId: 'tag-015' },
    { entityId: 'char-010', tagId: 'tag-020' },
    { entityId: 'char-010', tagId: 'tag-021' },
    { entityId: 'char-011', tagId: 'tag-022' },
    { entityId: 'char-011', tagId: 'tag-008' },
    { entityId: 'char-011', tagId: 'tag-006' },
    { entityId: 'char-012', tagId: 'tag-014' },
    { entityId: 'char-012', tagId: 'tag-023' },
    { entityId: 'char-013', tagId: 'tag-001' },
    { entityId: 'char-013', tagId: 'tag-002' },
    { entityId: 'char-014', tagId: 'tag-010' },
    { entityId: 'char-014', tagId: 'tag-024' },
    // Neon Sprawl character tags
    { entityId: 'char-003', tagId: 'tag-003' },
    { entityId: 'char-003', tagId: 'tag-017' },
    { entityId: 'char-003', tagId: 'tag-023' },
    { entityId: 'char-004', tagId: 'tag-016' },
    { entityId: 'char-004', tagId: 'tag-005' },
    { entityId: 'char-004', tagId: 'tag-022' },
    { entityId: 'char-007', tagId: 'tag-003' },
    { entityId: 'char-007', tagId: 'tag-020' },
    { entityId: 'char-007', tagId: 'tag-023' },
    { entityId: 'char-008', tagId: 'tag-015' },
    { entityId: 'char-008', tagId: 'tag-009' },
    { entityId: 'char-015', tagId: 'tag-002' },
    { entityId: 'char-015', tagId: 'tag-016' },
    { entityId: 'char-016', tagId: 'tag-018' },
    { entityId: 'char-016', tagId: 'tag-021' },
    { entityId: 'char-017', tagId: 'tag-020' },
    { entityId: 'char-017', tagId: 'tag-004' },
    { entityId: 'char-018', tagId: 'tag-009' },
    { entityId: 'char-018', tagId: 'tag-014' },
    { entityId: 'char-019', tagId: 'tag-003' },
    { entityId: 'char-019', tagId: 'tag-023' },
    { entityId: 'char-020', tagId: 'tag-019' },
    { entityId: 'char-020', tagId: 'tag-017' },
    // Item tags
    { entityId: 'item-001', tagId: 'tag-001' },
    { entityId: 'item-001', tagId: 'tag-006' },
    { entityId: 'item-001', tagId: 'tag-010' },
    { entityId: 'item-007', tagId: 'tag-007' },
    { entityId: 'item-007', tagId: 'tag-010' },
    { entityId: 'item-012', tagId: 'tag-020' },
    { entityId: 'item-012', tagId: 'tag-004' },
    { entityId: 'item-013', tagId: 'tag-008' },
    { entityId: 'item-013', tagId: 'tag-002' },
    { entityId: 'item-016', tagId: 'tag-010' },
    { entityId: 'item-016', tagId: 'tag-006' },
    { entityId: 'item-004', tagId: 'tag-003' },
    { entityId: 'item-019', tagId: 'tag-003' },
    { entityId: 'item-019', tagId: 'tag-004' }
  ],
  narratives: [
    // Eldoria narratives
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
      id: 'narrative-003',
      name: 'The Thornhaven Conspiracy',
      description: `What began as strange disappearances in a quiet farming village would unravel into a plot that threatened the very foundations of the realm.

Elder Moira's visions spoke of shadows wearing familiar faces, of trusted neighbors turned to darkness. When the bard Finnegan arrived with news from the capital, the pieces began to fall into place. Someone—or something—was infiltrating the peaceful communities of Eldoria, and Thornhaven was just the beginning.

The heroes must navigate a web of suspicion and betrayal, where any friend could be a foe, and the truth lies buried beneath generations of secrets.`,
      type: 'mystery',
      universeId: UNIVERSE_1_ID
    },
    {
      id: 'narrative-004',
      name: 'The Lich King\'s Gambit',
      description: `From the blighted depths of the Obsidian Wastes, Korrath the Undying has stirred from his centuries-long slumber. His phylactery pulses with renewed power as he gathers the remnants of his dark army.

But Korrath does not seek mere conquest—he seeks the Sunken Library and the forbidden knowledge within. With it, he could unmake the barriers between life and death itself, creating a world where his undead legions would be eternal and unstoppable.

The heroes must race against time, descending into the depths to reach the Library before the Lich King, facing ancient guardians and terrible truths about the nature of magic itself.`,
      type: 'epic',
      universeId: UNIVERSE_1_ID
    },
    // Neon Sprawl narratives
    {
      id: 'narrative-002',
      name: 'Rise of the Resistance',
      description: `In the neon-lit shadows of the megacity, where corporations rule with iron fists and surveillance drones patrol every corner, a spark of rebellion ignites.

Zero, once a nobody in the digital underground, stumbled upon something that would change everything—proof of OmniCorp's darkest secrets. With the help of Nyx, a synthetic android who had gained true sentience, and a network of rebels hiding in Sector 7, they planned the impossible: infiltrating Nexus Tower itself.

But Director Chen, the ruthless CEO of OmniCorp, was watching. And she had plans of her own. What began as a simple heist would escalate into a war for the soul of humanity itself.`,
      type: 'chronicle',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'narrative-005',
      name: 'The Prophet\'s Warning',
      description: `When hijacked screens across the city begin displaying cryptic messages, most dismiss them as the work of pranksters. But the underground knows the truth—Prophet, a rogue AI of unprecedented intelligence, has awakened.

Its message is dire: in exactly thirty days, something called "The Convergence" will occur, an event that will reshape human civilization forever. OmniCorp dismisses it as fearmongering. The resistance sees an opportunity.

As the clock ticks down, alliances shift and truths emerge. Prophet's warnings speak of a choice humanity must make—but first, someone must discover what the choice actually is, and whether Prophet itself can be trusted.`,
      type: 'thriller',
      universeId: UNIVERSE_2_ID
    },
    {
      id: 'narrative-006',
      name: 'Ghosts in the Machine',
      description: `They call it the Rust Town Massacre—the night OmniCorp's security forces swept through the slum, officially hunting terrorists but leaving hundreds of innocents dead. The official records say the operation was a success. Commander Kane knows otherwise.

When Glitch accidentally interfaces with a corrupted data cache, she downloads fragmented memories that don't belong to her—memories of that night, from multiple perspectives. Victims. Soldiers. And someone giving orders who shouldn't have been there at all.

Now she's being hunted by forces within OmniCorp who will do anything to keep the truth buried. Her only allies are a guilt-ridden commander and a network of survivors who've been waiting years for proof. The ghosts of Rust Town are ready to speak—if anyone survives long enough to listen.`,
      type: 'conspiracy',
      universeId: UNIVERSE_2_ID
    }
  ],
  events: [
    // The Restoration of Eldoria events
    {
      id: 'event-001',
      name: 'The Wards Begin to Fail',
      description: 'Archmage Thalion detects the first signs of weakening in the ancient protective barriers.',
      type: 'discovery',
      startDate: '2487-01-15T00:00:00Z',
      endDate: '2487-01-15T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-002',
      name: 'The Council Convenes',
      description: 'Thalion calls an emergency meeting of the Mage Council to discuss the failing wards.',
      type: 'meeting',
      startDate: '2487-01-20T10:00:00Z',
      endDate: '2487-01-20T18:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-003',
      name: 'The Quest for the Staff',
      description: 'Seraphina and Lyra are dispatched to recover the Staff of Eternity from the Sunken Library.',
      type: 'quest',
      startDate: '2487-02-01T06:00:00Z',
      endDate: '2487-02-28T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-004',
      name: 'Descent into the Library',
      description: 'The heroes navigate the treacherous underwater passages to reach the forbidden repository.',
      type: 'exploration',
      startDate: '2487-02-10T08:00:00Z',
      endDate: '2487-02-12T16:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-005',
      name: 'Battle with the Guardian',
      description: 'An ancient elemental guardian awakens to test the worthiness of those seeking the Staff.',
      type: 'battle',
      startDate: '2487-02-12T16:30:00Z',
      endDate: '2487-02-12T20:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-006',
      name: 'The Staff is Found',
      description: 'After passing the Guardian\'s trial, the heroes claim the Staff of Eternity.',
      type: 'discovery',
      startDate: '2487-02-12T21:00:00Z',
      endDate: '2487-02-12T22:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-007',
      name: 'Shadow Forces Attack',
      description: 'Dark creatures assault the Crystal Citadel while its defenders are away.',
      type: 'battle',
      startDate: '2487-03-01T02:00:00Z',
      endDate: '2487-03-01T08:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-008',
      name: 'The Race Home',
      description: 'The heroes rush back to the Citadel with the Staff as news of the attack reaches them.',
      type: 'chase',
      startDate: '2487-03-05T00:00:00Z',
      endDate: '2487-03-15T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-009',
      name: 'The Final Stand',
      description: 'Defenders hold the Citadel against overwhelming odds while waiting for the heroes\' return.',
      type: 'battle',
      startDate: '2487-03-20T00:00:00Z',
      endDate: '2487-03-21T18:00:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-010',
      name: 'The Awakening Ritual',
      description: 'Archmage Thalion performs the ancient ritual to restore the Crystal Citadel\'s protective wards.',
      type: 'ritual',
      startDate: '2487-03-21T19:00:00Z',
      endDate: '2487-03-21T23:30:00Z',
      narrativeId: 'narrative-001'
    },
    {
      id: 'event-011',
      name: 'Dawn of the Fourth Age',
      description: 'With the wards restored, Eldoria enters a new era of hope and renewal.',
      type: 'milestone',
      startDate: '2487-03-22T00:00:00Z',
      endDate: '2487-03-22T23:59:59Z',
      narrativeId: 'narrative-001'
    },
    // Rise of the Resistance events
    {
      id: 'event-012',
      name: 'Zero Discovers the Truth',
      description: 'While on a routine data heist, Zero stumbles upon evidence of OmniCorp\'s human experimentation program.',
      type: 'discovery',
      startDate: '2087-01-10T23:00:00Z',
      endDate: '2087-01-11T04:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-013',
      name: 'Meeting Nyx',
      description: 'Zero encounters Nyx in Sector 7, and they form an unlikely alliance.',
      type: 'meeting',
      startDate: '2087-02-03T20:00:00Z',
      endDate: '2087-02-03T23:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-014',
      name: 'The Great Heist',
      description: 'Zero and the underground rebels infiltrate Nexus Tower to steal the Quantum Encryption Key.',
      type: 'heist',
      startDate: '2087-05-01T00:00:00Z',
      endDate: '2087-05-01T06:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-015',
      name: 'Duchess Sterling\'s Gamble',
      description: 'The socialite secretly funnels resources to the resistance, risking everything she has.',
      type: 'intrigue',
      startDate: '2087-05-15T14:00:00Z',
      endDate: '2087-05-15T22:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-016',
      name: 'The Corporate Siege',
      description: 'OmniCorp launches a coordinated assault on Sector 7 Underground, attempting to crush the resistance.',
      type: 'battle',
      startDate: '2087-06-15T02:00:00Z',
      endDate: '2087-06-15T08:00:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-017',
      name: 'Broadcast of Truth',
      description: 'The resistance hijacks the city\'s communication network to reveal OmniCorp\'s crimes.',
      type: 'revelation',
      startDate: '2087-07-04T12:00:00Z',
      endDate: '2087-07-04T12:30:00Z',
      narrativeId: 'narrative-002'
    },
    {
      id: 'event-018',
      name: 'The People Rise',
      description: 'Inspired by the broadcast, citizens across the city begin openly defying OmniCorp.',
      type: 'uprising',
      startDate: '2087-07-04T13:00:00Z',
      endDate: '2087-07-10T23:59:59Z',
      narrativeId: 'narrative-002'
    },
    // The Prophet's Warning events
    {
      id: 'event-019',
      name: 'First Broadcast',
      description: 'Prophet\'s cryptic warning appears on screens across the city for the first time.',
      type: 'omen',
      startDate: '2087-09-01T00:00:00Z',
      endDate: '2087-09-01T00:05:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-020',
      name: 'OmniCorp Dismissal',
      description: 'Director Chen publicly dismisses Prophet\'s warnings as terrorist propaganda.',
      type: 'speech',
      startDate: '2087-09-02T10:00:00Z',
      endDate: '2087-09-02T11:00:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-021',
      name: 'Glitch Makes Contact',
      description: 'The young hacker manages to establish communication with Prophet.',
      type: 'discovery',
      startDate: '2087-09-10T22:00:00Z',
      endDate: '2087-09-11T03:00:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-022',
      name: 'The DataVault Expedition',
      description: 'A team infiltrates the DataVault to uncover the truth about the Convergence.',
      type: 'infiltration',
      startDate: '2087-09-20T01:00:00Z',
      endDate: '2087-09-20T06:00:00Z',
      narrativeId: 'narrative-005'
    },
    {
      id: 'event-023',
      name: 'The Convergence',
      description: 'The moment Prophet warned about arrives, changing everything.',
      type: 'apocalypse',
      startDate: '2087-10-01T00:00:00Z',
      endDate: '2087-10-01T00:01:00Z',
      narrativeId: 'narrative-005'
    },
    // The Thornhaven Conspiracy events (12 events)
    {
      id: 'event-031',
      name: 'The First Disappearance',
      description: 'A beloved farmer vanishes from his fields without a trace, leaving only his tools behind.',
      type: 'mystery',
      startDate: '2486-03-01T18:00:00Z',
      endDate: '2486-03-01T23:59:59Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-032',
      name: 'Elder Moira\'s Vision',
      description: 'The village elder experiences a terrifying prophetic dream of shadows wearing the faces of neighbors.',
      type: 'prophecy',
      startDate: '2486-03-05T02:00:00Z',
      endDate: '2486-03-05T06:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-033',
      name: 'The Bard Arrives',
      description: 'Finnegan Brightwater rides into Thornhaven with urgent news from the Crystal Citadel.',
      type: 'arrival',
      startDate: '2486-03-10T14:00:00Z',
      endDate: '2486-03-10T16:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-034',
      name: 'Shadows in the Tavern',
      description: 'Strange behavior at the village inn raises suspicions among the locals.',
      type: 'intrigue',
      startDate: '2486-03-12T20:00:00Z',
      endDate: '2486-03-12T23:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-035',
      name: 'The Hidden Cellar',
      description: 'Heroes discover a secret underground passage beneath an abandoned barn.',
      type: 'discovery',
      startDate: '2486-03-15T10:00:00Z',
      endDate: '2486-03-15T14:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-036',
      name: 'The Doppelganger Revealed',
      description: 'A trusted villager is exposed as an imposter, a shapeshifter from Shadowmere.',
      type: 'revelation',
      startDate: '2486-03-18T21:00:00Z',
      endDate: '2486-03-18T22:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-037',
      name: 'Pursuit into the Forest',
      description: 'The heroes chase the fleeing shapeshifter into the depths of Shadowmere Forest.',
      type: 'chase',
      startDate: '2486-03-19T00:00:00Z',
      endDate: '2486-03-19T08:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-038',
      name: 'The Hive Mind',
      description: 'Deep in the forest, a horrifying truth emerges: a colony of shapeshifters serves an ancient evil.',
      type: 'horror',
      startDate: '2486-03-19T10:00:00Z',
      endDate: '2486-03-19T12:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-039',
      name: 'Rescue of the Taken',
      description: 'The missing villagers are found alive in cocoons, their identities being slowly drained.',
      type: 'rescue',
      startDate: '2486-03-19T14:00:00Z',
      endDate: '2486-03-19T16:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-040',
      name: 'Burning the Nest',
      description: 'With fire and steel, the heroes destroy the shapeshifter colony and its queen.',
      type: 'battle',
      startDate: '2486-03-19T18:00:00Z',
      endDate: '2486-03-19T22:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-041',
      name: 'Return to Thornhaven',
      description: 'The heroes escort the rescued villagers home as dawn breaks over the forest.',
      type: 'journey',
      startDate: '2486-03-20T06:00:00Z',
      endDate: '2486-03-20T18:00:00Z',
      narrativeId: 'narrative-003'
    },
    {
      id: 'event-042',
      name: 'The Harvest Festival',
      description: 'Thornhaven celebrates its salvation with a feast honoring the heroes and the returned.',
      type: 'celebration',
      startDate: '2486-03-25T12:00:00Z',
      endDate: '2486-03-25T23:59:59Z',
      narrativeId: 'narrative-003'
    },
    // Ghosts in the Machine events (12 events)
    {
      id: 'event-043',
      name: 'The Rust Town Massacre',
      description: 'OmniCorp security forces sweep through Rust Town, leaving devastation in their wake.',
      type: 'tragedy',
      startDate: '2085-11-15T02:00:00Z',
      endDate: '2085-11-15T06:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-044',
      name: 'Glitch\'s Download',
      description: 'Years later, Glitch accidentally interfaces with a corrupted data cache containing fragmented memories.',
      type: 'discovery',
      startDate: '2087-08-20T23:00:00Z',
      endDate: '2087-08-21T02:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-045',
      name: 'Memories Not Her Own',
      description: 'Glitch experiences vivid flashbacks of the massacre from multiple perspectives.',
      type: 'vision',
      startDate: '2087-08-21T03:00:00Z',
      endDate: '2087-08-21T06:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-046',
      name: 'The Hunt Begins',
      description: 'OmniCorp detects the data breach and dispatches kill teams to silence Glitch.',
      type: 'pursuit',
      startDate: '2087-08-22T00:00:00Z',
      endDate: '2087-08-22T23:59:59Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-047',
      name: 'Commander Kane\'s Choice',
      description: 'Kane, ordered to eliminate Glitch, instead warns her and offers his protection.',
      type: 'decision',
      startDate: '2087-08-23T14:00:00Z',
      endDate: '2087-08-23T15:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-048',
      name: 'The Survivors\' Network',
      description: 'Kane leads Glitch to a hidden community of massacre survivors who\'ve been gathering evidence.',
      type: 'meeting',
      startDate: '2087-08-24T20:00:00Z',
      endDate: '2087-08-24T23:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-049',
      name: 'Decrypting the Truth',
      description: 'Glitch works to decode the fragmented memories, revealing Director Chen at the scene.',
      type: 'investigation',
      startDate: '2087-08-25T00:00:00Z',
      endDate: '2087-08-27T23:59:59Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-050',
      name: 'Betrayal in the Ranks',
      description: 'A survivor is revealed as an OmniCorp mole; the safe house is compromised.',
      type: 'betrayal',
      startDate: '2087-08-28T03:00:00Z',
      endDate: '2087-08-28T04:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-051',
      name: 'Escape Through the Undercity',
      description: 'Glitch, Kane, and the survivors flee through the city\'s forgotten maintenance tunnels.',
      type: 'escape',
      startDate: '2087-08-28T04:00:00Z',
      endDate: '2087-08-28T10:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-052',
      name: 'Luna Vex\'s Gambit',
      description: 'The fixer arranges a meeting with underground media contacts willing to broadcast the truth.',
      type: 'intrigue',
      startDate: '2087-08-29T22:00:00Z',
      endDate: '2087-08-30T01:00:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-053',
      name: 'The Confession',
      description: 'Kane publicly broadcasts his testimony alongside Glitch\'s decoded memories.',
      type: 'revelation',
      startDate: '2087-08-30T12:00:00Z',
      endDate: '2087-08-30T12:30:00Z',
      narrativeId: 'narrative-006'
    },
    {
      id: 'event-054',
      name: 'Ghosts No More',
      description: 'The victims of Rust Town are finally acknowledged; Chen faces corporate tribunal.',
      type: 'justice',
      startDate: '2087-09-15T09:00:00Z',
      endDate: '2087-09-15T18:00:00Z',
      narrativeId: 'narrative-006'
    },
    // The Lich King's Gambit events
    {
      id: 'event-024',
      name: 'The Lich Stirs',
      description: 'Korrath awakens in his tomb as dark energies pulse through the Obsidian Wastes.',
      type: 'awakening',
      startDate: '2488-06-01T00:00:00Z',
      endDate: '2488-06-01T00:00:01Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-025',
      name: 'Dead Rise in Thornhaven',
      description: 'The first signs of Korrath\'s return appear as corpses claw their way from graves.',
      type: 'horror',
      startDate: '2488-06-15T23:00:00Z',
      endDate: '2488-06-16T05:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-026',
      name: 'Council of War',
      description: 'The heroes gather at the Crystal Citadel to plan their response to the undead threat.',
      type: 'meeting',
      startDate: '2488-06-20T09:00:00Z',
      endDate: '2488-06-20T18:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-027',
      name: 'Into the Wastes',
      description: 'A strike team ventures into the Obsidian Wastes to confront Korrath.',
      type: 'quest',
      startDate: '2488-07-01T06:00:00Z',
      endDate: '2488-07-15T23:59:59Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-028',
      name: 'The Phylactery\'s Secret',
      description: 'The heroes discover the location of Korrath\'s phylactery and the key to his destruction.',
      type: 'revelation',
      startDate: '2488-07-10T14:00:00Z',
      endDate: '2488-07-10T16:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-029',
      name: 'Siege of the Citadel',
      description: 'Korrath\'s undead army attacks the Crystal Citadel while heroes race to destroy the phylactery.',
      type: 'battle',
      startDate: '2488-08-01T00:00:00Z',
      endDate: '2488-08-03T12:00:00Z',
      narrativeId: 'narrative-004'
    },
    {
      id: 'event-030',
      name: 'The Lich Falls',
      description: 'With his phylactery destroyed, Korrath is finally defeated once and for all.',
      type: 'victory',
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
