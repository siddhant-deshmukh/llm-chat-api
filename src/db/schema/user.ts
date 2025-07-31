import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql, InferSelectModel, InferInsertModel } from 'drizzle-orm';


export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  mobileNo: text('mobile_no').unique().notNull(),
  verified: boolean('verified').default(false).notNull(),
  subscriptionExpiring: timestamp('subscription_expiring', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  otpNo: text('otp_no').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});


export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Otp = InferSelectModel<typeof otps>;
export type NewOtp = InferInsertModel<typeof otps>;