import type { Context } from "hono";
import type { CloudflareBindings } from "../types";

export const handleAndLogError = (c: Context<{ Bindings: CloudflareBindings }>, error: Error) => {
  console.error({ message: error.message });
  return c.json({ message: error.message }, 500);
};
