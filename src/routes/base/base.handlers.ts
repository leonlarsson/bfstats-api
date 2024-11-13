import { BaseDataPayloadSchema } from "../../schemas/payloads/base";
import type { AppRouteHandler } from "../../types";
import { handleAndLogError } from "../../utils/handleAndLogError";
import type { GetDataRoute, UpdateDataRoute } from "./base.routes";

export const getData: AppRouteHandler<GetDataRoute> = async (c) => {
  try {
    const statsObject = await c
      .get("db")
      .query.jsonData.findFirst()
      .then((row) => {
        if (!row) {
          throw new Error("No data found. This is pretty bad.");
        }

        return JSON.parse(row.data);
      });

    return c.json(statsObject, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const updateData: AppRouteHandler<UpdateDataRoute> = async (c) => {
  const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = c.req.valid("json");

  try {
    // Get the stats from DB and edit it accordingly, before re-inserting
    const statsObject = await c
      .get("db")
      .query.jsonData.findFirst()
      .then((row) => {
        if (!row) {
          throw new Error("No data found. This is pretty bad.");
        }

        return JSON.parse(row.data);
      });

    // Verify the DB object matches the schema
    const dbZodReturn = BaseDataPayloadSchema.safeParse(statsObject);
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

    return c.text("ok", 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
