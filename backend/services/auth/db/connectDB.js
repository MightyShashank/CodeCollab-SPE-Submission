import pg from 'pg';
import 'dotenv/config';

// The Pool class is the recommended way to manage connections.
// It will automatically open and close connections as needed.
const { Pool } = pg;

// Create a new pool instance using the DATABASE_URL from your environment variables.
// NeonDB requires an SSL connection, but you can disable the server certificate check
// for convenience in development or if you have a custom CA setup.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Optional: Add an event listener to check for successful connection
pool.on('connect', () => {
  console.log('Successfully connected to NeonDB PostgreSQL pool');
});

// Export the pool directly. You can use this to query the database
// from other parts of your application.
export default pool;
