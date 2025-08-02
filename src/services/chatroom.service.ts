import { Part } from '@google/generative-ai';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { sendGeminiMessage } from '@src/util/gemini';
import { RouteError } from '@src/util/route-errors';
import { db } from '@src/db';
import { chatrooms, messages } from '@src/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { deleteCache, getCache, setCache } from '@src/util/redis';
import { geminiQueue } from '@src/config/geminiQueue';

const CHATROOM_LIST_TTL_SECONDS = 300; // 5 minutes

interface CreateChatroomInput {
  userId: number;
  title: string;
}

export async function createChatroom(data: CreateChatroomInput) {
  const [newChatroom] = await db.insert(chatrooms).values({
    userId: data.userId,
    title: data.title,
  }).returning();

  const cacheKey = `user:${data.userId}:chatrooms`;
  await deleteCache(cacheKey);

  if (!newChatroom) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create chatroom.');
  }
  return newChatroom;
}

export async function listChatrooms(userId: number) {
  const cacheKey = `user:${userId}:chatrooms`;

  const cachedChatrooms = await getCache<typeof chatrooms.$inferSelect[]>(cacheKey);
  if (cachedChatrooms) {
    return cachedChatrooms;
  }

  const userChatrooms = await db.query.chatrooms.findMany({
    where: eq(chatrooms.userId, userId),
    orderBy: [desc(chatrooms.lastUpdated)],
  });

  await setCache(cacheKey, userChatrooms, CHATROOM_LIST_TTL_SECONDS);

  return userChatrooms;
}

export async function getChatroomDetails(chatId: number, userId: number) {
  const chatroom = await db.query.chatrooms.findFirst({
    where: and(eq(chatrooms.id, chatId), eq(chatrooms.userId, userId)),
    with: {
      messages: {
        orderBy: [messages.createdAt],
      },
    },
  });

  if (!chatroom) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Chatroom not found or you do not have access.');
  }
  return chatroom;
}

interface SendMessageInput {
  chatId: number;
  userId: number;
  userMessage: string;
  subscriptionExpiring?: Date | null;
}

export async function sendMessageAndGetGeminiResponse(data: SendMessageInput) {

  const chatroom = await db.query.chatrooms.findFirst({
    where: and(eq(chatrooms.id, data.chatId), eq(chatrooms.userId, data.userId)),
    with: {
      messages: {
        orderBy: [messages.createdAt],
      },
    },
  });

  if (!chatroom) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Chatroom not found or you do not have access.');
  }

  const chatHistory = formatMessagesForGemini(chatroom.messages);

  const [userMsg] = await db.insert(messages).values({
    chatId: data.chatId,
    text: data.userMessage,
    author: 'user',
  }).returning();

  if (!userMsg) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to send user message.');
  }

  const geminiResponseText = await sendGeminiMessage(chatHistory, data.userMessage);

  const [geminiMsg] = await db.insert(messages).values({
    chatId: data.chatId,
    text: geminiResponseText,
    author: 'system',
  }).returning();
  if (!geminiMsg) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to save Gemini response.');
  }

  await db.update(chatrooms)
    .set({ lastUpdated: new Date() })
    .where(eq(chatrooms.id, data.chatId));

  return { userMessage: userMsg, geminiResponse: geminiMsg, message: 'Message sent and response received.' };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: Part[];
}

function formatMessagesForGemini(chatMessages: typeof messages.$inferSelect[]): GeminiContent[] {
  return chatMessages.map(msg => {

    const role = msg.author === 'user' ? 'user' : 'model';
    return {
      role: role,
      parts: [{ text: msg.text }],
    };
  });
}

export async function rateLimit(userId: number, subscriptionExpiring?: Date | null) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `rate_limit:${userId}:${today}`;

    const limit = (!subscriptionExpiring || new Date(subscriptionExpiring) < new Date()) ? 5 : 50;

    const current = (await getCache(key)) as number | null;

    console.log('current, limit', current, limit);
    
    if (!current) {
      // Set expiry for the key (24 hours + buffer for timezone handling)
      await setCache(key, 1); // 25 hours
    } else if (current < limit) {
      await setCache(key, current + 1);
    } else {
      return false;
    }

    return true;
  } catch (err) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong');
  }
}

export async function  getLastMessage(chatId: number) {
  const lastMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: (msg, { desc }) => [desc(msg.createdAt)],
    limit: 2,
  });

  if (lastMessages.length === 0) {
    return null;
  }

  const [latest, previous] = lastMessages;

  if (latest.author === 'system') {
    return latest
  }
}