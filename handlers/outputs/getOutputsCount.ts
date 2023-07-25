import { Context } from "hono";
import { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT 'game' as category, game as item, COUNT(*) as sent FROM outputs GROUP BY game UNION ALL SELECT 'segment' as category, segment as item, COUNT(*) as sent FROM outputs GROUP BY segment UNION ALL SELECT 'language' as category, language as item, COUNT(*) as sent FROM outputs GROUP BY language ORDER BY category ASC, sent DESC"
    ).all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
