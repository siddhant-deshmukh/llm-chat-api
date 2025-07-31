import { createClient, RedisClientType } from 'redis';
import ENV from '@src/common/constants/ENV';


const REDIS_URL = ENV.RedisUrl;

let redisClient: RedisClientType;

async function connectRedis() {
  if (redisClient && redisClient.isReady) {
    console.log('Redis client already connected.');
    return redisClient;
  }

  redisClient = createClient({
    url: REDIS_URL,
  }) as RedisClientType; 

  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.on('connect', () => console.log('Redis client connected.'));
  redisClient.on('end', () => console.log('Redis client disconnected.'));
  redisClient.on('reconnecting', () => console.log('Redis client reconnecting...'));

  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis!');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
  return redisClient;
}

export { connectRedis, redisClient };

