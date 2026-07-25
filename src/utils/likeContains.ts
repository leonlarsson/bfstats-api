import { type Column, sql } from "drizzle-orm";

/**
 * Builds a "contains" LIKE condition against user input.
 *
 * Drizzle's `like()` binds the value safely, but the bound value *is* the pattern, so any % or _
 * the caller sends is still interpreted as a wildcard. This escapes them so they match literally.
 */
export const likeContains = (column: Column, value: string) => {
  return sql`${column} LIKE ${`%${value.replace(/[\\%_]/g, "\\$&")}%`} ESCAPE '\\'`;
};
