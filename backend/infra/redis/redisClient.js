// filename: redis/redisClient.js

const Redis = require('redis');

// Get the Redis host and port from environment variables
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Create a Redis client configured for cluster mode.
// The client will connect to this initial node and then automatically
// discover all the other nodes in the cluster.
const redisClient = Redis.createCluster({
  rootNodes: [
    {
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    },
  ],
});

redisClient.on('error', (err) => console.error('Redis Cluster Error', err));

// Asynchronously connect to the cluster.
async function connectRedis() {
  // Check if the required environment variables are set
  if (!REDIS_HOST) {
    console.error('FATAL: REDIS_HOST environment variable is not set. Redis will not connect.');
    return;
  }
  
  try {
    await redisClient.connect();
    console.log('Connected to Redis Cluster');
  } catch (err) {
    console.error('Failed to connect to Redis Cluster:', err);
  }
}

connectRedis();

module.exports = redisClient;
