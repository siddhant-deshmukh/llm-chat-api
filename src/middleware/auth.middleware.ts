
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@src/common/util/jwt';
import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Authentication token missing.')
  }
  try {
    const decoded = verifyToken(token); 
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    console.error('JWT verification failed:', error.message);
    throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Authentication token missing.')
  }
};