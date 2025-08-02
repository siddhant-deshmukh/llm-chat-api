import { Worker } from 'bullmq';
import { redisConnection } from '@src/config/redis';
import { sendMessageAndGetGeminiResponse } from '@src/services/chatroom.service';

const geminiWorker = new Worker('geminiQueue', async job => {
  const { chatId, userId, userMessage, subscriptionExpiring } = job.data;

  try {
    await sendMessageAndGetGeminiResponse({
      chatId,
      userId,
      userMessage,
      subscriptionExpiring
    });

    console.log(`Processed Gemini message for chatId ${chatId}`);
  } catch (err) {
    console.error('Error processing Gemini job:', err);
  }
}, {
  connection: redisConnection
});

export default geminiWorker;
