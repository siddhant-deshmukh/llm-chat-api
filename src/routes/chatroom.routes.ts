import { Router } from 'express';
import {
  createChatroom,
  listChatrooms,
  getChatroomDetails,
  sendMessageAndGetGeminiResponse,
} from '../services/chatroom.service';
import { authenticateToken } from '@src/middleware/auth.middleware';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/util/route-errors';
import { authorizeChatroomAccess } from '@src/middleware/chatroom.access.middleware';

const chatroomRouter = Router();


chatroomRouter.use(authenticateToken); 



chatroomRouter.post('/', async (req, res) => {
  const { title } = req.body;
  const userId = req.userId; 

  if (!userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Authentication required.');
  }
  if (!title) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Chatroom title is required.');
  }

  const newChatroom = await createChatroom({ userId, title });
  res.status(HttpStatusCodes.CREATED).json(newChatroom);
});


chatroomRouter.get('/', async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Authentication required.');
  }

  const chatrooms = await listChatrooms(userId);
  res.status(HttpStatusCodes.OK).json(chatrooms);
});


chatroomRouter.get('/:id', authorizeChatroomAccess, async (req, res) => {
  const chatId = parseInt(req.params.id, 10);
  const userId = req.userId;

  if (isNaN(chatId)) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid chatroom ID.');
  }
  if (!userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Authentication required.');
  }

  const chatroom = await getChatroomDetails(chatId, userId);
  res.status(HttpStatusCodes.OK).json(chatroom);
});


chatroomRouter.post('/:id/message', authorizeChatroomAccess, async (req, res) => {
  const chatId = parseInt(req.params.id, 10);
  const { message: userMessage } = req.body; 
  const userId = req.userId;

  if (isNaN(chatId)) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid chatroom ID.');
  }
  if (!userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Authentication required.');
  }
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Message text is required.');
  }

  const result = await sendMessageAndGetGeminiResponse({
    chatId,
    userId,
    userMessage,
    subscriptionExpiring: req.subscriptionExpiring
  });
  res.status(HttpStatusCodes.CREATED).json(result);
});

export default chatroomRouter;