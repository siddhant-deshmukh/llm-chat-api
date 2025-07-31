import { redisClient } from '@src/config/redis'; 


const DEFAULT_TTL_SECONDS = 60 * 60 * 24; 


export async function setCache<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
  if (!redisClient || !redisClient.isReady) {
    console.warn('Redis client not ready. Cannot set cache for key:', key);
    return; 
  }
  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    console.log(`Cache set for key: ${key} with TTL: ${ttlSeconds}s`);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisClient || !redisClient.isReady) {
    console.warn('Redis client not ready. Cannot get cache for key:', key);
    return null; 
  }
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData === null) {
      console.log(`Cache miss for key: ${key}`);
      return null;
    }
    console.log(`Cache hit for key: ${key}`);
    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}


export async function deleteCache(key: string): Promise<void> {
  if (!redisClient || !redisClient.isReady) {
    console.warn('Redis client not ready. Cannot delete cache for key:', key);
    return;
  }
  try {
    await redisClient.del(key);
    console.log(`Cache deleted for key: ${key}`);
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
  }
}