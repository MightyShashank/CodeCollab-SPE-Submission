// We typically store unverified users in the database (that is who couldnt verify themselves using the email we send) for 24 hours aka the time for which the verficationToken Exists
// once the verification token expires if the user hasnt verified himself (aka false) then delete him from DB

// for this above cleanup we use node-cron (simple and common for periodic backrgound tasks), it runs as a schedule background job/task

// We typically store unverified users in the database for 24 hours.
// Once the verification token expires, if the user hasn't verified themselves, we delete them.
// This cleanup script uses node-cron to run as a scheduled background job.

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cron from "node-cron";
import pool from '../db/connectDB.js'; // Import the PostgreSQL connection pool

// Schedule the task to run once every hour, at the top of the hour.
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly cleanup job for unverified users...');
  
  let client;
  try {
    client = await pool.connect();
    
    // SQL query to delete users who are not verified AND whose verification token has expired.
    const query = `
      DELETE FROM users
      WHERE is_verified = FALSE AND verification_token_expires_at < NOW();
    `;
    
    const result = await client.query(query);
    
    // result.rowCount contains the number of rows that were deleted.
    console.log(`Cleanup done. Deleted ${result.rowCount} unverified, expired users.`);

  } catch (err) {
    console.error('Error during cleanup job:', err);
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
    }
  }
});

console.log('Cleanup job scheduled. It will run every hour.');

// To run this script, you would execute: node cleanup.js


// run it as node cleanup.js

// above we use a job queue
// A job queue is a system that manages background tasks — operations that are not required to run immediately or in the user's request-response cycle.
/*
✅ Why Use a Job Queue?
For:
Sending emails (e.g., welcome/verification)
Image/video processing
Data scraping or syncing
Scheduling tasks (e.g., daily reports)
Retrying failed jobs
Throttling load on main server
*/

// job queues are a type of message queue
// job queues are built on top of message queues
// above we will be using BullMQ job queue over a redis message queue
