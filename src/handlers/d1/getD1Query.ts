import type { Context } from "hono";
import type { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogError";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const query = c.req.header("D1-Query");
  if (!query) return c.text("Header 'D1-Query' is required.", 400);

  try {
    const { results } = await c.env.DB.prepare(query).all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
