import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql, InferSelectModel, InferInsertModel } from 'drizzle-orm';

import { users } from './user'
import { messageAuthorEnum } from './enums';

export const chatrooms = pgTable('chatrooms', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), 
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').references(() => chatrooms.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  author: messageAuthorEnum('author').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Chatroom = InferSelectModel<typeof chatrooms>;
export type NewChatroom = InferInsertModel<typeof chatrooms>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;