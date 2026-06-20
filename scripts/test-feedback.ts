import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function testFeedback() {
  console.log("Connecting to database for F4 test...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // 1. Get the Solarpunk ideology
    const startRes = await client.query("SELECT * FROM ideologies WHERE name = 'Solarpunk'");
    if (startRes.rows.length === 0) {
      throw new Error("Seeded Solarpunk ideology not found.");
    }
    const solarpunk = startRes.rows[0];
    console.log(`Found ideology: ${solarpunk.name} (ID: ${solarpunk.id})`);

    // 2. Insert feedback
    const feedbackText = "We need to ensure green tech benefits everyone, not just high-income districts.";
    console.log(`Inserting feedback: "${feedbackText}"`);
    
    const insertRes = await client.query(
      `INSERT INTO feedback (ideology_id, user_id, text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [solarpunk.id, "user_test_sankalp", feedbackText]
    );

    const insertedFeedback = insertRes.rows[0];
    console.log("Feedback inserted successfully!");
    console.log("Returned row:", JSON.stringify(insertedFeedback));

    // 3. Verify in database
    const verifyRes = await client.query(
      "SELECT * FROM feedback WHERE id = $1",
      [insertedFeedback.id]
    );
    
    if (verifyRes.rows.length === 1 && verifyRes.rows[0].text === feedbackText) {
      console.log("\nVERIFICATION SUCCESS: Feedback recorded and verified in the database!");
    } else {
      console.error("\nVERIFICATION FAILURE: Feedback was not recorded correctly.");
      process.exit(1);
    }

  } catch (error) {
    console.error("F4 feedback test failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

testFeedback();
