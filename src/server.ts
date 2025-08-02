import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import logger from 'jet-logger';
import express, { Request, Response, NextFunction } from 'express';

import '@src/workers/geminiWorker';
import ENV from '@src/common/constants/ENV';
import { connectRedis } from '@src/config/redis';
import { NodeEnvs } from '@src/common/constants';
import authRouter from '@src/routes/auth.routes';
import userRouter from '@src/routes/user.routes';
import { RouteError } from '@src/util/route-errors';
import chatroomRouter from '@src/routes/chatroom.routes';
import subscribeRouter from '@src/routes/subscription.routes';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { webHookController } from './services/subscription.service';

const app = express();


app.post('/webhook/stripe', express.raw({ type: 'application/json' }), webHookController);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: [
    'https://web.postman.co', 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'stripe-signature',
    'x-requested-with'
  ],
  credentials: true
}));


if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

if (ENV.NodeEnv === NodeEnvs.Production) {
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

app.get('/', (_, res)=> {
  res.status(HttpStatusCodes.ACCEPTED).json({ msg: "Working!" });
});
app.get('/success', (_, res)=> {
  res.status(HttpStatusCodes.ACCEPTED).json({ msg: "Payment done!" });
});

app.use('/', subscribeRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/chatroom', chatroomRouter);

app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});

connectRedis().catch(err => {
  console.error("Failed to start Redis connection:", err);
});


export default app;
