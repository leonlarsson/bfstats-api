import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text().primaryKey(),
  username: text().notNull(),
  lastStatsSent: integer(),
  lastLanguage: text(),
  totalStatsSent: integer(),
});

export const outputs = sqliteTable("outputs", {
  userId: text().notNull(),
  username: text().notNull(),
  guildName: text(),
  guildId: text(),
  game: text(),
  segment: text(),
  language: text(),
  date: integer(),
  messageUrl: text(),
  imageUrl: text(),
  identifier: text(),
});

export const events = sqliteTable("events", {
  event: text().notNull(),
  date: integer().notNull(),
});
