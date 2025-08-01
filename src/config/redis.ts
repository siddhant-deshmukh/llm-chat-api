import logger from 'jet-logger';
import ENV from '@src/common/constants/ENV';
import { createClient, RedisClientType } from 'redis';

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

  redisClient.on('error', (err) => logger.err(err, true));
  redisClient.on('connect', () => console.log('Redis client connected.'));
  redisClient.on('end', () => console.log('Redis client disconnected.'));
  redisClient.on('reconnecting', () => console.log('Redis client reconnecting...'));

  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis!');
  } catch (err) {
    logger.err(err, true);
  }
  return redisClient;
}

const parsedUrl = new URL(ENV.RedisUrl);

const redisConnection = {
  host: parsedUrl.hostname,
  port: parseInt(parsedUrl.port, 10),
  password: parsedUrl.password || undefined,
  db: parsedUrl.pathname.slice(1) ? parseInt(parsedUrl.pathname.slice(1), 10) : 0,
}

export {
  connectRedis,
  redisClient,
  redisConnection
}

