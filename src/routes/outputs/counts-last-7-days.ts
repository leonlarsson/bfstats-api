import { createRoute, z } from "@hono/zod-openapi";
import type { App } from "../..";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

const ResponseSchema = z
  .object({
    category: z.string(),
    item: z.string(),
    sent: z.number(),
  })
  .array();

const whereClause = "WHERE date(datetime(date / 1000, 'unixepoch')) >= date('now', '-7 days')";

export const registerRoute_outputs_counts_last_7_days = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path: "/outputs/counts-last-7-days",
    tags: ["Outputs"],
    summary: "Output counts (7d)",
    description: "Get basic usage data per game, segment, and language for the last 7 days.",
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
SELECT 'game' as category, game as item, COUNT(*) as sent 
FROM outputs 
${whereClause}
GROUP BY game

UNION ALL

SELECT 'segment' as category, segment as item, COUNT(*) as sent 
FROM outputs 
${whereClause}
GROUP BY segment

UNION ALL

SELECT 'language' as category, language as item, COUNT(*) as sent 
FROM outputs 
${whereClause}
GROUP BY language

ORDER BY category ASC, sent DESC;
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
