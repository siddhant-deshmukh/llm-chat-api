import { relations } from "drizzle-orm";

import { chatrooms, messages } from '../chat';
import { subscriptions, payments } from '../payment';
import { otps, users } from "../user";


export const usersRelations = relations(users, ({ many }) => ({
  otps: many(otps),
  chatrooms: many(chatrooms),
  payments: many(payments),
  subscriptions: many(subscriptions),
}));

export const otpsRelations = relations(otps, ({ one }) => ({
  user: one(users, {
    fields: [otps.userId],
    references: [users.id],
  }),
}));



export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));


export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));




export const chatroomsRelations = relations(chatrooms, ({ one, many }) => ({
  user: one(users, { 
    fields: [chatrooms.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chatroom: one(chatrooms, {
    fields: [messages.chatId],
    references: [chatrooms.id],
  }),
}));






