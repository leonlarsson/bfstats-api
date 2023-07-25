import { Context } from "hono";
import { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT main.day, main.game, main.sent, totals.total_sent FROM (SELECT DATE(date / 1000, 'unixepoch') AS day, game, COUNT(*) AS sent FROM outputs GROUP BY day, game) main JOIN (SELECT DATE(date / 1000, 'unixepoch') AS day, COUNT(*) AS total_sent FROM outputs GROUP BY day) totals ON main.day = totals.day"
    ).all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
