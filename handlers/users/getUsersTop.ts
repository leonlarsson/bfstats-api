import type { Context } from "hono";
import type { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT total_stats_sent FROM users ORDER BY total_stats_sent DESC LIMIT 20",
    ).all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
