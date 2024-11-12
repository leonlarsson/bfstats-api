import { createRoute, z } from "@hono/zod-openapi";
import type { App } from "../..";
import { authentication } from "../../middleware/authentication";
import { D1OutputPayloadSchema } from "../../types";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

export const registerRoute_outputs_index = (app: App) => {
  const postRoute = createRoute({
    method: "post",
    path: "/outputs",
    tags: ["Outputs"],
    middleware: [authentication],
    summary: "Post output",
    description: "Post an output.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: D1OutputPayloadSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: z.literal("ok"),
          },
        },
      },
      500: standard500Response,
    },
  });

  app.openapi(postRoute, async (c) => {
    const { userId, username, guildName, guildId, game, segment, language, messageURL, imageURL, identifier } =
      c.req.valid("json");

    try {
      await c.env.DB.prepare(
        "INSERT INTO outputs (user_id, username, guild_name, guild_id, game, segment, language, date, message_url, image_url, identifier) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
      )
        .bind(
          userId,
          username,
          guildName,
          guildId,
          game,
          segment,
          language,
          new Date().getTime(),
          messageURL,
          imageURL,
          identifier,
        )
        .run();

      return c.text("ok", 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });
};
