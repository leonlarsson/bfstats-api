import { createRoute } from "@hono/zod-openapi";
import type { App } from "../..";
import { OutputSchema } from "../../schemas/entities/output";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

const OutputSchemaSubset = OutputSchema.pick({
  game: true,
  segment: true,
  language: true,
  date: true,
  identifier: true,
});

export const registerRoute_outputs_last = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path: "/outputs/last",
    tags: ["Outputs"],
    summary: "Recent outputs",
    description: "Get the last 20 outputs.",
    responses: {
      200: {
        description: "The last 20 outputs",
        content: {
          "application/json": {
            schema: OutputSchemaSubset.array(),
          },
        },
      },
      500: standard500Response,
    },
  });

  app.openapi(getRoute, async (c) => {
    try {
      const results = await c.env.DB.prepare(
        "SELECT game, segment, language, date, identifier FROM outputs ORDER BY date DESC LIMIT 20",
      )
        .all()
        .then((results) => OutputSchemaSubset.array().parse(results.results));

      return c.json(results, 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });
};
