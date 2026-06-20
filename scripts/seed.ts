import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

async function seed() {
  console.log("Connecting to database for seeding...");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected. Clearing existing data...");
    
    // Clear in correct dependency order
    await client.query("ALTER TABLE ideologies DROP CONSTRAINT IF EXISTS fk_founder_prophet");
    await client.query("TRUNCATE TABLE schisms, feedback, events, doctrine_versions, prophets, ideologies RESTART IDENTITY CASCADE");
    
    console.log("Seeding ideologies...");
    
    // Insert Ideologies
    const ideologyRes = await client.query(`
      INSERT INTO ideologies (name, doctrine_version, followers, reputation, treasury)
      VALUES 
        ('Techno-Optimism', 'v1', 120, 85, 50000.00),
        ('Neo-Luddism', 'v1', 45, 60, 1500.00),
        ('Solarpunk', 'v1', 95, 90, 12000.00)
      RETURNING id, name;
    `);
    
    const [techOpt, luddite, solar] = ideologyRes.rows;
    console.log("Ideologies seeded.");

    console.log("Seeding prophets...");
    
    // Insert Prophets
    const prophetRes = await client.query(`
      INSERT INTO prophets (ideology_id, personality, history, goal, erc8004_token_id)
      VALUES 
        (
          $1, 
          'Calculated, forward-looking, and relentlessly positive about human advancement.', 
          'An ex-silicon valley executive who believes technology heals all wounds.', 
          'Achieve technological singularity and make humanity multiplanetary.', 
          '8004-tech-01'
        ),
        (
          $2, 
          'Stoic, reflective, and deeply connected to nature and manual labor.', 
          'A retired craftsman who witnessed the decay of communities due to screen addiction.', 
          'Return humanity to decentralized, self-reliant agrarian guilds.', 
          '8004-ludd-01'
        ),
        (
          $3, 
          'Warm, collaborative, visionary, and eco-centric.', 
          'An urban agriculturist and renewable energy systems engineer.', 
          'Establish harmonious integration between high-efficiency green tech and nature.', 
          '8004-solar-01'
        )
      RETURNING id, ideology_id;
    `, [techOpt.id, luddite.id, solar.id]);

    const [techProphet, luddProphet, solarProphet] = prophetRes.rows;
    console.log("Prophets seeded.");

    // Update founder_prophet_id
    console.log("Updating founder prophet references...");
    await client.query("UPDATE ideologies SET founder_prophet_id = $1 WHERE id = $2", [techProphet.id, techOpt.id]);
    await client.query("UPDATE ideologies SET founder_prophet_id = $1 WHERE id = $2", [luddProphet.id, luddite.id]);
    await client.query("UPDATE ideologies SET founder_prophet_id = $1 WHERE id = $2", [solarProphet.id, solar.id]);
    
    // Add the constraint back
    await client.query(`
      ALTER TABLE ideologies 
      ADD CONSTRAINT fk_founder_prophet 
      FOREIGN KEY (founder_prophet_id) REFERENCES prophets(id) ON DELETE SET NULL
    `);

    console.log("Seeding initial doctrines...");
    await client.query(`
      INSERT INTO doctrine_versions (ideology_id, version, text, reason)
      VALUES 
        ($1, 'v1', 'Technology is the primary driver of human progress. We must build, accelerate, and innovate without fear.', 'Initial belief set.'),
        ($2, 'v1', 'Mass automation destroys human dignity and local bonds. We must return to manual craft and human-scale interactions.', 'Initial belief set.'),
        ($3, 'v1', 'We must construct a sustainable, bright future where technology exists to nurture, restore, and grow with the biosphere.', 'Initial belief set.')
    `, [techOpt.id, luddite.id, solar.id]);

    console.log("Seeding complete!");

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

seed();
