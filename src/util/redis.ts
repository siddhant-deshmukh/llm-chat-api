import logger from 'jet-logger';
import { redisClient } from '@src/config/redis'; 

const DEFAULT_TTL_SECONDS = 60 * 60 * 24; 


export async function setCache<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
  if (!redisClient || !redisClient.isReady) {
    logger.warn(`Redis client not ready. Cannot set cache for key: ${key}`, true);
    return; 
  }
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    logger.info(`Cache set for key: ${key} with TTL: ${ttlSeconds}s`);
  } catch (error) {
    logger.err(error, true);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient || !redisClient.isReady) {
    logger.warn(`Redis client not ready. Cannot get cache for key: ${key}`, true);
    return null; 
  }
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData === null) {
      logger.info(`Cache miss for key: ${key}`);
      return null;
    }
    logger.info(`Cache hit for key: ${key}`);
    return JSON.parse(cachedData) as T;
  } catch (error) {
    logger.err(error, true);
    return null;
  }
}


export async function deleteCache(key: string): Promise<void> {
  if (!redisClient || !redisClient.isReady) {
    logger.warn(`Redis client not ready. Cannot delete cache for key: ${key}`, true);
    return;
  }
  try {
    await redisClient.del(key);
    logger.info(`Cache deleted for key: ${key}`);
  } catch (error) {
    logger.err(error, true);
  }
}