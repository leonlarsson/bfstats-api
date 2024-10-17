import type { Context } from "hono";
import type { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    // Does the same as getOutputsDailyGames, but fills in missing dates. Credit go to ChatGPT
    const { results } = await c.env.DB.prepare(
      `
WITH RECURSIVE date_range(day) AS (
  -- Dynamically select the start date from the earliest record in 'outputs'
  SELECT DATE(MIN(date) / 1000, 'unixepoch') FROM outputs
  UNION ALL
  -- Generate dates until today
  SELECT DATE(day, '+1 day')
  FROM date_range
  WHERE day < CURRENT_DATE
),
games AS (
  SELECT DISTINCT game FROM outputs
),
combined AS (
  -- Generate all combinations of dates and games
  SELECT day, game
  FROM date_range
  CROSS JOIN games
),
main AS (
  SELECT DATE(date / 1000, 'unixepoch') AS day, game, COUNT(*) AS sent
  FROM outputs
  GROUP BY day, game
),
totals AS (
  SELECT DATE(date / 1000, 'unixepoch') AS day, COUNT(*) AS total_sent
  FROM outputs
  GROUP BY day
)
-- Perform the left join to fill in missing dates
SELECT combined.day, combined.game, IFNULL(main.sent, 0) AS sent, totals.total_sent
FROM combined
LEFT JOIN main ON combined.day = main.day AND combined.game = main.game
LEFT JOIN totals ON combined.day = totals.day
ORDER BY combined.day, combined.game;
      `,
    ).all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
