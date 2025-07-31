import { pgTable, serial, text, timestamp, integer, unique, boolean } from 'drizzle-orm/pg-core';
import { sql, InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { users } from './user'
import { subscriptionCurrencyEnum, subscriptionTierEnum } from './enums';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer('amount').notNull(),
  subscribedFor: text('subscribed_for').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiringAt: timestamp('expiring_at', { withTimezone: true }),
  currency: subscriptionCurrencyEnum('currency').default('INR').notNull(),
  status: text('status').notNull(),
});



export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  stripeCustomerId: text('stripe_customer_id'),
});



export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;


export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;