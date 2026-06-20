import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}

// Neon database connection pooling
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
