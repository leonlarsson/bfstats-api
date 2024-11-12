import { createRoute, z } from "@hono/zod-openapi";
import type { App } from "../..";
import { OutputSchema } from "../../schemas/entities/output";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

const ResponseSchema = OutputSchema.pick({
  game: true,
  segment: true,
  language: true,
  date: true,
  identifier: true,
}).nullable();

export const registerRoute_outputs_id = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path: "/outputs/{id}",
    tags: ["Outputs"],
    summary: "Output by identifier",
    description: "Get an output by identifier.",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: "The output",
        content: {
          "application/json": {
            schema: ResponseSchema,
          },
        },
      },
      404: {
        description: "Output not found",
        content: {
          "application/json": {
            schema: z.null(),
          },
        },
      },
      500: standard500Response,
    },
  });

  app.openapi(getRoute, async (c) => {
    const { id } = c.req.valid("param");

    try {
      const results = await c.env.DB.prepare(
        "SELECT game, segment, language, date, identifier FROM outputs WHERE identifier = ?1 OR identifier LIKE '%' || ?1 || '%' LIMIT 1",
      )
        .bind(id)
        .first()
        .then((results) => ResponseSchema.parse(results ?? null));

      if (!results) {
        return c.json(null, 404);
      }

      return c.json(results, 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });
};
