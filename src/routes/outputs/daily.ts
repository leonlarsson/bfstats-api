import { createRoute, z } from "@hono/zod-openapi";
import type { App } from "../..";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

const ResponseSchema = z
  .object({
    day: z.string(),
    sent: z.number(),
  })
  .array();

export const registerRoute_outputs_daily = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path: "/outputs/daily",
    tags: ["Outputs"],
    summary: "Daily output counts",
    description: "Get daily usage per day.",
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
        "SELECT DATE(date/1000, 'unixepoch') AS day, COUNT() AS sent FROM outputs GROUP BY day",
      )
        .all()
        .then((results) => ResponseSchema.parse(results.results));

      return c.json(results, 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });
};
