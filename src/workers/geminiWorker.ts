import { Worker } from 'bullmq';
import { redisConnection } from '@src/config/redis';
import { sendMessageAndGetGeminiResponse } from '@src/services/chatroom.service';
import logger from 'jet-logger';

const geminiWorker = new Worker('geminiQueue', async job => {
  const { chatId, userId, userMessage, subscriptionExpiring } = job.data;

  try {
    await sendMessageAndGetGeminiResponse({
      chatId,
      userId,
      userMessage,
      subscriptionExpiring
    });
  } catch (err) {
    logger.err(err, true);
  }
}, {
  connection: redisConnection
});

export default geminiWorker;
