import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const geminiQueue = new Queue('geminiQueue', {
  connection: redisConnection,
});
