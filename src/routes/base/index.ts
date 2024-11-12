import { createRoute, z } from "@hono/zod-openapi";
import type { App } from "../..";
import { authentication } from "../../middleware/authentication";
import { BaseReceivedBodySchema, BaseStatsObjectSchema } from "../../types";
import { handleAndLogError } from "../../utils/handleAndLogError";
import { standard500Response } from "../../utils/openApiStandards";

const path = "/base";
const tags = ["Base"];

export const registerRoute_base_index = (app: App) => {
  const getRoute = createRoute({
    method: "get",
    path,
    tags,
    summary: "Get base",
    description: "Get the base usage stats.",
    responses: {
      200: {
        description: "The base usage stats",
        content: {
          "application/json": {
            schema: BaseStatsObjectSchema,
          },
        },
      },
      500: standard500Response,
    },
  });

  const postRoute = createRoute({
    method: "post",
    path,
    tags,
    middleware: [authentication],
    summary: "Post base",
    description: "Post the base usage stats",
    request: {
      body: {
        content: {
          "application/json": {
            schema: BaseReceivedBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "The base usage stats",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
              data: BaseStatsObjectSchema,
            }),
          },
        },
      },
      500: standard500Response,
    },
  });

  app.openapi(getRoute, async (c) => {
    try {
      const data = await c.env.DB.prepare("SELECT * FROM json_data").first<string>("data");
      const json = JSON.parse(data ?? "");
      const parsed = BaseStatsObjectSchema.parse(json);
      return c.json(parsed, 200);
    } catch (error: any) {
      return handleAndLogError(c, error);
    }
  });

  app.openapi(postRoute, async (c) => {
    const body = c.req.valid("json");

    // At least totalGuilds, totalChannels, totalMembers are guaranteed to be present and numbers
    const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = body;

    // Get the stats from DB and edit it accordingly, before re-inserting
    const statsObject = await c.env.DB.prepare("SELECT * FROM json_data")
      .first<string>("data")
      .then((data) => JSON.parse(data ?? ""));

    // Verify the DB object matches the schema
    const dbZodReturn = BaseReceivedBodySchema.safeParse(statsObject);
    if (dbZodReturn.success === false) {
      return c.json(
        {
          message: "DB stats object doesn't match schema. Not updating DB. Received this ZodError.",
          error: dbZodReturn.error,
        },
        500,
      );
    }

    // Update totalGuilds, totalChannels, totalMembers
    statsObject.totalGuilds = totalGuilds;
    statsObject.totalChannels = totalChannels;
    statsObject.totalMembers = totalMembers;

    if (incrementTotalStatsSent === true) {
      // Increment total and specific game and language. Only increment game/language if defined
      statsObject.totalStatsSent.total++;
      if (game) statsObject.totalStatsSent.games[game]++;
      if (language) statsObject.totalStatsSent.languages[language]++;
    }

    // Add lastUpdated to the object
    const date = new Date();
    statsObject.lastUpdated = {
      date: date.toUTCString(),
      timestampMilliseconds: date.valueOf(),
      timestampSeconds: Math.floor(date.valueOf() / 1000),
    };

    // Insert the updated object back into the DB
    await c.env.DB.prepare("UPDATE json_data SET data = ? WHERE ROWID = 1").bind(JSON.stringify(statsObject)).run();

    return c.json({ message: "Data posted to DB.", data: statsObject }, 200);
  });
};
