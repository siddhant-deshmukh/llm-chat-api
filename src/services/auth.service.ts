import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { db } from '@src/db';
import { users, otps } from '@src/db/schema';
import { generateToken } from '@src/util/jwt';
import { RouteError } from '@src/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { checkLatestOtp, generateRandomOtp } from '@src/util/otp';

interface SignUpInput {
  name: string;
  mobileNo: string;
  password: string;
}

export async function SignUp(data: SignUpInput) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.mobileNo, data.mobileNo),
  });

  if (existingUser) {
    throw new RouteError(HttpStatusCodes.CONFLICT, 'User with this mobile number already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [newUser] = await db.insert(users).values({
    name: data.name,
    mobileNo: data.mobileNo,
    password: hashedPassword,
    verified: false,
  }).returning({
    id: users.id,
    name: users.name,
    mobileNo: users.mobileNo,
    verified: users.verified
  });

  if (!newUser) {
    throw new RouteError(500, 'Failed to create user.');
  }

  const otpResult = await SendOtp(newUser.mobileNo);

  return {
    userId: newUser.id,
    name: newUser.name,
    mobileNo: newUser.mobileNo,
    verified: newUser.verified,
    message: 'User registered successfully. OTP sent for verification.',
    otp: otpResult.otp
  };
}

interface SignInInput {
  mobileNo: string;
  password: string;
}

export async function SignIn(data: SignInInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.mobileNo, data.mobileNo),
  });

  if (!user) {
    throw new RouteError(401, 'Invalid credentials.');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new RouteError(401, 'Invalid credentials.');
  }

  if (!user.verified) {
    throw new RouteError(403, 'Account not verified. Please verify your account first.');
  }

  const token = generateToken({
    userId: user.id,
    mobileNo: user.mobileNo,
    verified: user.verified,
    subscriptionExpiring: user.subscriptionExpiring
  });

  return {
    userId: user.id,
    name: user.name,
    mobileNo: user.mobileNo,
    verified: user.verified,
    token,
    message: 'Signed in successfully.',
  };
}

export async function SendOtp(mobileNo: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.mobileNo, mobileNo),
  });

  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'User not found.');
  }

  const otpNo = generateRandomOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(otps).values({
    userId: user.id,
    otpNo: otpNo,
    expiresAt: expiresAt,
  });

  return { message: `OTP sent to ${mobileNo}.`, otp: otpNo };
}

interface VerifyOtpInput {
  mobileNo: string;
  otp: string;
}

export async function VerifyOtp(data: VerifyOtpInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.mobileNo, data.mobileNo),
  });

  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'User not found.');
  }

  await checkLatestOtp(user.id, data.otp);
 
  await db.update(users)
    .set({ verified: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));
 
  const token = generateToken({
    userId: user.id,
    mobileNo: user.mobileNo,
    verified: true,
    subscriptionExpiring: user.subscriptionExpiring
  });

  return {
    userId: user.id,
    mobileNo: user.mobileNo,
    verified: true,
    token,
    message: 'OTP verified successfully. Account is now active.',
  };
}

interface ForgotPasswordInput {
  mobileNo: string;
}

export async function ForgotPassword(data: ForgotPasswordInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.mobileNo, data.mobileNo),
  });

  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'User not found.');
  }

  const otpResult = await SendOtp(data.mobileNo);

  return {
    message: 'OTP sent to your registered mobile number for password reset.',
    otp: otpResult.otp
  };
}

interface ChangePasswordInput {
  userId: number;
  newPassword: string;
}

export async function ChangePassword(data: ChangePasswordInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });

  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'User not found.');
  } 
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await db.update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { message: 'Password changed successfully.' };
}