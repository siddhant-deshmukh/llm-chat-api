import { pgEnum } from 'drizzle-orm/pg-core';

export const subscriptionCurrencyEnum = pgEnum('subscription_currency', ['INR', 'USD', 'EUR']);
export const messageAuthorEnum = pgEnum('message_author', ['user', 'system']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['basic', 'pro']);