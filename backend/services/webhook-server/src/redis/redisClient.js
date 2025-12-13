const Redis = require('redis');

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Use single client for single Redis instance
const redisClient = Redis.createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  password: REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis'));

async function connectRedis() {
  if (!REDIS_HOST) {
    console.error('FATAL: REDIS_HOST environment variable is not set.');
    return;
  }
  
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err.message);
    process.exit(1);
  }
}

connectRedis();

module.exports = redisClient;