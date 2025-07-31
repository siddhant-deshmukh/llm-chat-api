import { Router } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/util/route-errors';
import { authenticateToken } from '@src/middleware/auth.middleware';
import { db } from '@src/db';
import { eq } from 'drizzle-orm';
import { users } from '@src/db/schema';

const userRouter = Router();

userRouter.get('/me', authenticateToken, async (req, res) => {
  if(!req.userId) throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Forbidden');

  const user = await db.query.users.findFirst({ 
    where: eq(users.id, req.userId),
  })
  res.json({
    ...user,
    password: undefined,
  })
});


export default userRouter;
