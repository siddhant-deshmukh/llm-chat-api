import ENV from '@src/common/constants/ENV';
import jwt from 'jsonwebtoken';

const JWT_SECRET = ENV.JwtSecret;
const JWT_EXPIRES_IN = '2h';

interface JwtPayload {
  userId: number;
  mobileNo: string;
  verified: boolean;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};