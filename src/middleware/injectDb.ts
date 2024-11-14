import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

export const injectDb = createMiddleware((c, next) => {
  const db = drizzle(c.env.DB, { schema, casing: "snake_case" });
  c.set("db", db);
  return next();
});
