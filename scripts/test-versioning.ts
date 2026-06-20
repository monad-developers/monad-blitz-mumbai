import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function testVersioning() {
  console.log("Connecting to database for F6 test...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // 1. Get the current state of Solarpunk (ID: 3)
    const ideologyRes = await client.query("SELECT * FROM ideologies WHERE name = 'Solarpunk'");
    if (ideologyRes.rows.length === 0) {
      throw new Error("Solarpunk ideology not found.");
    }
    const solarpunk = ideologyRes.rows[0];
    console.log(`Current version of Solarpunk: ${solarpunk.doctrine_version}`);

    // 2. Perform database transaction to update version
    const newText = "Sustainable ecosystems integrated with advanced organic automation. Humanity must live as caretakers of the earth.";
    const reasonText = "To clarify that automation should align with natural balance.";
    
    // Parse ending number
    const match = solarpunk.doctrine_version.match(/\d+$/);
    let nextVersionStr = 'v2';
    if (match) {
      nextVersionStr = solarpunk.doctrine_version.substring(0, match.index) + (parseInt(match[0]) + 1);
    } else {
      nextVersionStr = solarpunk.doctrine_version + '.1';
    }

    console.log(`Updating Solarpunk doctrine to version: ${nextVersionStr}...`);

    await client.query('BEGIN');

    // Insert new version
    const insertRes = await client.query(
      `INSERT INTO doctrine_versions (ideology_id, version, text, reason) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [solarpunk.id, nextVersionStr, newText, reasonText]
    );
    const newDocVersion = insertRes.rows[0];

    // Update parent ideology
    await client.query(
      "UPDATE ideologies SET doctrine_version = $1 WHERE id = $2",
      [nextVersionStr, solarpunk.id]
    );

    // Log event
    const eventPayload = {
      oldVersion: solarpunk.doctrine_version,
      newVersion: nextVersionStr,
      reason: reasonText,
      changedAt: new Date().toISOString()
    };
    await client.query(
      "INSERT INTO events (type, ideology_id, payload) VALUES ('doctrine_change', $1, $2)",
      [solarpunk.id, JSON.stringify(eventPayload)]
    );

    await client.query('COMMIT');
    console.log("Transaction committed!");

    // 3. Verify state
    const verifyIdeology = (await client.query("SELECT * FROM ideologies WHERE id = $1", [solarpunk.id])).rows[0];
    const verifyVersions = await client.query(
      "SELECT * FROM doctrine_versions WHERE ideology_id = $1 ORDER BY created_at DESC", 
      [solarpunk.id]
    );
    const verifyEvents = await client.query(
      "SELECT * FROM events WHERE ideology_id = $1 AND type = 'doctrine_change' ORDER BY created_at DESC",
      [solarpunk.id]
    );

    console.log(`\nVerified updated doctrine version on ideology: ${verifyIdeology.doctrine_version}`);
    console.log(`Total versions in history: ${verifyVersions.rows.length}`);
    console.log(`Doctrine change events logged: ${verifyEvents.rows.length}`);

    if (verifyIdeology.doctrine_version === nextVersionStr && verifyVersions.rows[0].version === nextVersionStr) {
      console.log("\nVERIFICATION SUCCESS: F6 versioning transaction logic works perfectly!");
    } else {
      console.error("\nVERIFICATION FAILURE: Doctrine versioning check failed.");
      process.exit(1);
    }

  } catch (error) {
    console.error("F6 Versioning test failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

testVersioning();
