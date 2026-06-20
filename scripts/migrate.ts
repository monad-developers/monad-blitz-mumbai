import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function migrate() {
  console.log("Connecting to database...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for serverless postgres connections
    }
  });

  try {
    await client.connect();
    console.log("Successfully connected to Neon PostgreSQL database.");

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    console.log(`Reading schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log("Executing schema SQL queries...");
    await client.query(schemaSql);
    console.log("Schema pushed successfully!");

    console.log("Verifying tables in database...");
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\nFound tables in 'public' schema:");
    res.rows.forEach(row => {
      console.log(` - ${row.table_name}`);
    });

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

migrate();
