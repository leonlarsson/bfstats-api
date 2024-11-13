import { index, integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const outputs = sqliteTable(
  "outputs",
  {
    userId: text().notNull(),
    username: text().notNull(),
    guildName: text(),
    guildId: text(),
    game: text().notNull(),
    segment: text().notNull(),
    language: text().notNull(),
    date: text().default("sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`").notNull(),
    messageUrl: text(),
    imageUrl: text(),
    identifier: text(),
  },
  (table) => {
    return {
      idxOutputsGameDate: index("idx_outputs_game_date").on(table.game, table.date),
      idxOutputsDate: index("idx_outputs_date").on(table.date),
      idxOutputsIdentifier: index("idx_outputs_identifier").on(table.identifier),
    };
  },
);

export const users = sqliteTable("users", {
  userId: text().primaryKey().notNull(),
  username: text().notNull(),
  lastStatsSent: text().default("sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`").notNull(),
  lastLanguage: text().notNull(),
  totalStatsSent: integer().default(1).notNull(),
});

export const events = sqliteTable("events", {
  event: text().notNull(),
  date: text().default("sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`").notNull(),
});

export const jsonData = sqliteTable("json_data", {
  data: numeric().notNull(),
});
