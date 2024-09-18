import { Context } from "hono";
import { BaseReceivedBody, BaseReceivedBodySchema, BaseStatsObject, Bindings } from "../../types";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const body = (await c.req.json().catch(() => ({}))) as BaseReceivedBody;

  // Verify the request body matches the schema
  const bodyZodReturn = BaseReceivedBodySchema.safeParse(body);
  if (bodyZodReturn.success === false) return c.json({ message: "Request body did not match schema.", error: bodyZodReturn.error }, 400);

  // At least totalGuilds, totalChannels, totalMembers are guaranteed to be present and numbers
  const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = body;

  // Get the stats from DB and edit it accordingly, before re-inserting
  const statsObject: BaseStatsObject = await c.env.DB.prepare("SELECT * FROM json_data")
    .first<string>("data")
    .then(data => JSON.parse(data));

  // Verify the DB object matches the schema
  const dbZodReturn = BaseReceivedBodySchema.safeParse(statsObject);
  if (dbZodReturn.success === false) return c.json({ message: "DB stats object doesn't match schema. Not updating DB. Received this ZodError.", error: dbZodReturn.error }, 500);

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
  statsObject.lastUpdated = { date: date.toUTCString(), timestampMilliseconds: date.valueOf(), timestampSeconds: Math.floor(date.valueOf() / 1000) };

  // Insert the updated object back into the DB
  await c.env.DB.prepare("UPDATE json_data SET data = ? WHERE ROWID = 1").bind(JSON.stringify(statsObject)).run();

  return c.json({ message: "Data posted to DB.", data: statsObject });
};
