/**
 * Migration script to convert CONTAINS relationships to semantic relationships.
 *
 * CONTAINS relationships are being deprecated in favor of semantic relationships:
 * - Universe -> Place becomes Place -[:LOCATED_IN]-> Universe
 * - Place -> Character becomes Character -[:LIVES_IN]-> Place
 * - Character -> Item becomes Item -[:HELD_BY]-> Character
 * - Universe -> Narrative becomes Narrative -[:PART_OF]-> Universe
 * - Narrative -> Event becomes Event -[:PART_OF]-> Narrative
 *
 * Note: Product structural relationships (Product -> AttributeDefinition, etc.)
 * are intentionally left as CONTAINS since they're product components.
 *
 * Usage: node --import graphql-import-node/register.js scripts/migrate-contains.js
 */

import neo4j from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

/**
 * Get the appropriate semantic relationship type based on source and target labels.
 * Returns null if this CONTAINS relationship should not be migrated.
 */
function getSemanticRelationship(sourceLabels, targetLabels) {
  const source = sourceLabels[0];
  const target = targetLabels[0];

  // Universe -> Place: Place LOCATED_IN Universe
  if (source === 'Universe' && target === 'Place') {
    return 'LOCATED_IN';
  }

  // Place -> Character: Character LIVES_IN Place
  if (source === 'Place' && target === 'Character') {
    return 'LIVES_IN';
  }

  // Character -> Item: Item HELD_BY Character
  if (source === 'Character' && target === 'Item') {
    return 'HELD_BY';
  }

  // Universe -> Narrative: Narrative PART_OF Universe
  if (source === 'Universe' && target === 'Narrative') {
    return 'PART_OF';
  }

  // Narrative -> Event: Event PART_OF Narrative
  if (source === 'Narrative' && target === 'Event') {
    return 'PART_OF';
  }

  // Product relationships - keep as CONTAINS (don't migrate)
  if (source === 'Product') {
    return null;
  }

  console.warn(`Unknown CONTAINS relationship: ${source} -> ${target}`);
  return null;
}

async function migrate() {
  const session = driver.session();

  try {
    console.log('Starting CONTAINS to semantic relationships migration...\n');

    // Find all CONTAINS relationships
    const result = await session.run(`
      MATCH (source)-[r:CONTAINS]->(target)
      RETURN
        id(r) as relId,
        source.id as sourceId,
        target.id as targetId,
        labels(source) as sourceLabels,
        labels(target) as targetLabels,
        source.name as sourceName,
        target.name as targetName
    `);

    const relationships = result.records.map(record => ({
      relId: record.get('relId'),
      sourceId: record.get('sourceId'),
      targetId: record.get('targetId'),
      sourceLabels: record.get('sourceLabels'),
      targetLabels: record.get('targetLabels'),
      sourceName: record.get('sourceName'),
      targetName: record.get('targetName'),
    }));

    console.log(`Found ${relationships.length} CONTAINS relationships to process\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const rel of relationships) {
      const semanticType = getSemanticRelationship(rel.sourceLabels, rel.targetLabels);

      if (!semanticType) {
        console.log(`Skipping: ${rel.sourceLabels[0]} "${rel.sourceName}" -> ${rel.targetLabels[0]} "${rel.targetName}" (product or unknown)`);
        skipped++;
        continue;
      }

      try {
        // Create new semantic relationship (reversed direction: target -> source)
        await session.run(`
          MATCH (source {id: $sourceId}), (target {id: $targetId})
          MERGE (target)-[:${semanticType}]->(source)
        `, {
          sourceId: rel.sourceId,
          targetId: rel.targetId,
        });

        // Delete old CONTAINS relationship
        await session.run(`
          MATCH (source {id: $sourceId})-[r:CONTAINS]->(target {id: $targetId})
          DELETE r
        `, {
          sourceId: rel.sourceId,
          targetId: rel.targetId,
        });

        console.log(`Migrated: ${rel.targetLabels[0]} "${rel.targetName}" -[:${semanticType}]-> ${rel.sourceLabels[0]} "${rel.sourceName}"`);
        migrated++;
      } catch (err) {
        console.error(`Error migrating ${rel.sourceLabels[0]} -> ${rel.targetLabels[0]}: ${err.message}`);
        errors++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped:  ${skipped}`);
    console.log(`Errors:   ${errors}`);
    console.log(`Total:    ${relationships.length}`);

    // Verify remaining CONTAINS relationships
    const remaining = await session.run(`
      MATCH ()-[r:CONTAINS]->()
      RETURN count(r) as count
    `);
    const remainingCount = remaining.records[0].get('count').toNumber();
    console.log(`\nRemaining CONTAINS relationships: ${remainingCount}`);

    if (remainingCount > 0) {
      const remainingDetails = await session.run(`
        MATCH (source)-[r:CONTAINS]->(target)
        RETURN labels(source)[0] as sourceType, labels(target)[0] as targetType, count(r) as count
        ORDER BY count DESC
      `);
      console.log('\nRemaining by type:');
      for (const record of remainingDetails.records) {
        console.log(`  ${record.get('sourceType')} -> ${record.get('targetType')}: ${record.get('count')}`);
      }
    }

  } finally {
    await session.close();
    await driver.close();
  }
}

// Run the migration
migrate()
  .then(() => {
    console.log('\nMigration complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
