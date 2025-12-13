require('dotenv').config();
const { Pool } = require('pg');

// Create a pool using the Neon DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon requires SSL
});

// Export a helper to get a client
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { pool, getClient };
