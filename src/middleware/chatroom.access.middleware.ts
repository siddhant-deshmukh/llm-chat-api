import { Request, Response, NextFunction } from 'express';
import { db } from '@src/db'; // Your Drizzle DB instance
import { chatrooms } from '@src/db/schema'; // Your chatrooms schema
import { eq, and } from 'drizzle-orm';
import { RouteError } from '@src/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';


export async function authorizeChatroomAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    console.warn('Unauthorized access attempt: userId not found on request object.');
    return next(new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Authentication required.'));
  }
  const chatId = parseInt(req.params.id, 10);
  
  if (isNaN(chatId)) {
    return next(new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid chatroom ID provided.'));
  }

  const chatroom = await db.query.chatrooms.findFirst({
    where: and(
      eq(chatrooms.id, chatId),
      eq(chatrooms.userId, req.userId)
    ),
    columns: {
      id: true 
    }
  });

  if (!chatroom) {
    console.warn(`Access denied: Chatroom ${chatId} not found or does not belong to user ${req.userId}.`);
    return next(new RouteError(HttpStatusCodes.FORBIDDEN, 'You do not have permission to access this chatroom.'));
  }
  next();
}