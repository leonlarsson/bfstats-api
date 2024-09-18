import type { Context, Next } from "hono";
import type { Bindings } from "../types";

export default async (c: Context<{ Bindings: Bindings }>, next: Next) => {
  const authorized = c.get("authorized");
  if (!authorized) return c.text("Unauthorized", 401);
  await next();
};
