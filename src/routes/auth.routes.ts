import { Router } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { ChangePassword, ForgotPassword, SendOtp, SignIn, SignUp, VerifyOtp } from '@src/services/auth.service';
import { RouteError } from '@src/common/util/route-errors';
import { authenticateToken } from '@src/middleware/auth.middleware';

const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  const { name, mobileNo, password } = req.body;
  if(!name || !mobileNo || !password || mobileNo.length != 10 || password.length < 7 || password.length > 20) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Bad Request');
  }

  const result = await SignUp({ name, mobileNo, password });
  res.status(HttpStatusCodes.CREATED).json(result);
});
authRouter.post('/signin', async (req, res) => {
  const { mobileNo, password } = req.body;
  const result = await SignIn({ mobileNo, password });
  res.json(result);
});


authRouter.post('/send-otp', async (req, res) => {
  const { mobileNo } = req.body;
  const result = await SendOtp(mobileNo);
  res.json(result);
});
authRouter.post('/verify-otp', async (req, res) => {
  const { mobileNo, otp } = req.body;
  const result = await VerifyOtp({ mobileNo, otp });
  res.json(result);
});

authRouter.post('/forgot-password', async (req, res) => {
  const { mobileNo } = req.body;
  const result = await ForgotPassword({ mobileNo });
  res.json(result);
});


authRouter.post('/change-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  if(!req.userId) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
  if(!newPassword || newPassword.length < 7 || newPassword.length > 20) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Bad Request');
  }
  const result = await ChangePassword({ newPassword, userId: req.userId });
  res.json(result);
});


export default authRouter;
