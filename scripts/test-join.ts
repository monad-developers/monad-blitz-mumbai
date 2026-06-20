import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function testJoin() {
  console.log("Connecting to database for F3 test...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // 1. Get the starting state of Techno-Optimism
    const startRes = await client.query("SELECT * FROM ideologies WHERE name = 'Techno-Optimism'");
    if (startRes.rows.length === 0) {
      throw new Error("Seeded ideology not found.");
    }
    const startingIdeology = startRes.rows[0];
    console.log(`Starting followers for ${startingIdeology.name}: ${startingIdeology.followers}`);

    // 2. Perform the join transaction
    console.log("Simulating Join transaction (User: user_test_sankalp)...");
    await client.query('BEGIN');

    const updateRes = await client.query(
      "UPDATE ideologies SET followers = followers + 1 WHERE id = $1 RETURNING *",
      [startingIdeology.id]
    );
    const updatedIdeology = updateRes.rows[0];

    const payload = { userId: "user_test_sankalp", joinedAt: new Date().toISOString() };
    const eventRes = await client.query(
      "INSERT INTO events (type, ideology_id, payload) VALUES ('join', $1, $2) RETURNING *",
      [startingIdeology.id, JSON.stringify(payload)]
    );
    const joinEvent = eventRes.rows[0];

    await client.query('COMMIT');
    console.log("Transaction committed successfully!");

    // 3. Output updated state
    console.log(`Updated followers for ${updatedIdeology.name}: ${updatedIdeology.followers}`);
    console.log("Join Event payload in DB:", JSON.stringify(joinEvent.payload));

    // Verify followers increased by exactly 1
    if (updatedIdeology.followers === startingIdeology.followers + 1) {
      console.log("\nVERIFICATION SUCCESS: Follower count increased by 1 and event was logged!");
    } else {
      console.error("\nVERIFICATION FAILURE: Follower count did not increase by 1.");
      process.exit(1);
    }

  } catch (error) {
    console.error("F3 join test failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

testJoin();
