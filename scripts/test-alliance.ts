import pg from 'pg';
import dotenv from 'dotenv';
import { recordAllianceOnChain } from '../src/lib/contracts.js';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function testAlliance() {
  console.log("Connecting to database for Alliance test...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // 1. Get Solarpunk (ID: 3) and Neo-Luddism (ID: 2)
    const resA = await client.query("SELECT * FROM ideologies WHERE name = 'Solarpunk'");
    const resB = await client.query("SELECT * FROM ideologies WHERE name = 'Neo-Luddism'");

    if (resA.rows.length === 0 || resB.rows.length === 0) {
      throw new Error("Seeded ideologies not found.");
    }

    const solarpunk = resA.rows[0];
    const neoluddite = resB.rows[0];

    console.log(`Ideology A: ${solarpunk.name} (ID: ${solarpunk.id})`);
    console.log(`Ideology B: ${neoluddite.name} (ID: ${neoluddite.id})`);

    await client.query('BEGIN');

    // 2. Insert event log for both
    const payload = {
      ideologyA: solarpunk.id,
      ideologyB: neoluddite.id,
      nameA: solarpunk.name,
      nameB: neoluddite.name,
      formedAt: new Date().toISOString()
    };

    await client.query(
      "INSERT INTO events (type, ideology_id, payload) VALUES ('alliance', $1, $2)",
      [solarpunk.id, JSON.stringify(payload)]
    );

    await client.query(
      "INSERT INTO events (type, ideology_id, payload) VALUES ('alliance', $1, $2)",
      [neoluddite.id, JSON.stringify(payload)]
    );

    console.log("Recorded alliance events in Neon DB.");

    // 3. Trigger on-chain call
    console.log("Triggering on-chain recordAlliance on Monad Testnet...");
    const onChain = await recordAllianceOnChain(solarpunk.id, neoluddite.id);

    await client.query('COMMIT');
    console.log("Transaction committed!");
    console.log(`\nSUCCESS: Alliance transaction verified!`);
    console.log(`Transaction Hash: ${onChain.hash}`);
    console.log(`Block Number: ${onChain.blockNumber}`);

  } catch (error) {
    console.error("Alliance test failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

testAlliance();
