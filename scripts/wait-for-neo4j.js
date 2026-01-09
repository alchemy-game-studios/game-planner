import neo4j from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

async function waitForNeo4j() {
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

  console.log(`Waiting for Neo4j at ${NEO4J_URI}...`);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const session = driver.session();
      await session.run('RETURN 1');
      await session.close();
      await driver.close();
      console.log('Neo4j is ready!');
      process.exit(0);
    } catch (error) {
      console.log(`Attempt ${i + 1}/${MAX_RETRIES}: Neo4j not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  console.error('Neo4j failed to start within the timeout period');
  await driver.close();
  process.exit(1);
}

waitForNeo4j();
