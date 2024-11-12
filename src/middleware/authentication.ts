import type { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import type { Bindings } from "../types";

export const authentication = (c: Context<{ Bindings: Bindings }>, next: Next) =>
  bearerAuth({ token: c.env.API_KEY })(c, next);
