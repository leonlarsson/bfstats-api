import { createRoute, z } from "@hono/zod-openapi";
import type { App } from "../..";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

const ResponseSchema = z
  .object({
    day: z.string(),
    game: z.string(),
    sent: z.number(),
    total_sent: z.number(),
  })
  .array();

export const registerRoute_outputs_daily_games_no_gaps = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path: "/outputs/daily-games-no-gaps",
    tags: ["Outputs"],
    summary: "Daily output counts per game (no gaps)",
    description: "Get daily usage per day per game without gaps.",
    responses: {
      200: {
        description: "The usage data",
        content: {
          "application/json": {
            schema: ResponseSchema,
          },
        },
      },
      500: standard500Response,
    },
  });

  app.openapi(getRoute, async (c) => {
    try {
      const results = await c.env.DB.prepare(
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
      )
        .all()
        .then((results) => ResponseSchema.parse(results.results));

      return c.json(results, 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });
};
