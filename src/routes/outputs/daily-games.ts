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

export const registerRoute_outputs_daily_games = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path: "/outputs/daily-games",
    tags: ["Outputs"],
    summary: "Daily output counts per game",
    description: "Get daily usage per day per game.",
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
        "SELECT main.day, main.game, main.sent, totals.total_sent FROM (SELECT DATE(date / 1000, 'unixepoch') AS day, game, COUNT(*) AS sent FROM outputs GROUP BY day, game) main JOIN (SELECT DATE(date / 1000, 'unixepoch') AS day, COUNT(*) AS total_sent FROM outputs GROUP BY day) totals ON main.day = totals.day",
      )
        .all()
        .then((results) => ResponseSchema.parse(results.results));

      return c.json(results, 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });
};
