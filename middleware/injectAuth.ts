import { Context, Next } from "hono";
import { Bindings } from "../types";

export default async (c: Context<{ Bindings: Bindings }>, next: Next) => {
  const authorized = c.env.API_KEY && c.req.header("API-KEY") === c.env.API_KEY;
  c.set("authorized", authorized);
  await next();
};
