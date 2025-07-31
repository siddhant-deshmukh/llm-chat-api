import { db } from "@src/db";
import { otps } from "@src/db/schema";
import { and, desc, eq, gt } from "drizzle-orm";
import { RouteError } from "./route-errors";
import HttpStatusCodes from "../constants/HttpStatusCodes";

export const generateRandomOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit number
};

export async function checkLatestOtp(userId: number, otpNo: string) {
  const now = new Date();
  const latestOtp = await db.query.otps.findFirst({
    where: and(eq(otps.userId, userId), eq(otps.otpNo, otpNo), gt(otps.expiresAt, now)),
    orderBy: [desc(otps.createdAt)]
  });

  if (!latestOtp) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'OTP not found or expired.');
  }
  return latestOtp;
}