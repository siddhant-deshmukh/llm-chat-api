import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';


import ENV from '@src/common/constants/ENV';
import { NodeEnvs } from '@src/common/constants';
import authRouter from '@src/routes/auth.routes';
import { RouteError } from '@src/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import userRouter from './routes/user.routes';
import chatroomRouter from './routes/chatroom.routes';
import { connectRedis } from './config/redis';

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
