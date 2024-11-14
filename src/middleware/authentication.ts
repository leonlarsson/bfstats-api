import type { CloudflareBindings } from "@/types";
import type { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";

export const authentication = (c: Context<{ Bindings: CloudflareBindings }>, next: Next) =>
  bearerAuth({ token: c.env.API_KEY })(c, next);
