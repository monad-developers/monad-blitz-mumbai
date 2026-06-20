import pg from 'pg';
import dotenv from 'dotenv';
import { recordSchismOnChain } from '../src/lib/contracts.js'; // Using ES Module import with JS extension

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function testSchism() {
  console.log("Connecting to database for Schism test...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // 1. Get the parent (Techno-Optimism, ID: 1) and new (Solarpunk, ID: 3) ideologies
    const parentRes = await client.query("SELECT * FROM ideologies WHERE name = 'Techno-Optimism'");
    const newRes = await client.query("SELECT * FROM ideologies WHERE name = 'Solarpunk'");

    if (parentRes.rows.length === 0 || newRes.rows.length === 0) {
      throw new Error("Seed ideologies not found.");
    }

    const parent = parentRes.rows[0];
    const newIdeology = newRes.rows[0];
    const justificationText = "Divergent visions on solar integration versus planetary expansion.";

    console.log(`Parent Ideology: ${parent.name} (ID: ${parent.id})`);
    console.log(`New Ideology: ${newIdeology.name} (ID: ${newIdeology.id})`);
    console.log(`Justification: "${justificationText}"`);

    await client.query('BEGIN');

    // 2. Insert into schisms table
    const schismInsert = await client.query(
      `INSERT INTO schisms (parent_ideology_id, new_ideology_id, justification) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [parent.id, newIdeology.id, justificationText]
    );
    const schismRecord = schismInsert.rows[0];
    console.log("Recorded schism in Neon DB. ID:", schismRecord.id);

    // 3. Log event
    const eventPayload = {
      parentName: parent.name,
      newName: newIdeology.name,
      justification: justificationText,
      schismId: schismRecord.id,
      occurredAt: new Date().toISOString()
    };
    await client.query(
      "INSERT INTO events (type, ideology_id, payload) VALUES ('schism', $1, $2)",
      [parent.id, JSON.stringify(eventPayload)]
    );
    console.log("Recorded schism event log in Neon DB.");

    // 4. Trigger on-chain call using viem
    console.log("Triggering on-chain recordSchism on Monad Testnet...");
    const onChain = await recordSchismOnChain(parent.id, newIdeology.id, justificationText);

    await client.query('COMMIT');
    console.log("Transaction committed!");
    console.log(`\nSUCCESS: Schism transaction verified!`);
    console.log(`Transaction Hash: ${onChain.hash}`);
    console.log(`Block Number: ${onChain.blockNumber}`);

  } catch (error) {
    console.error("Schism test failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

testSchism();
