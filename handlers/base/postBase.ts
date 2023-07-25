import { Context } from "hono";
import { BaseReceivedBody, BaseReceivedBodySchema, BaseStatsObject, Bindings } from "../../types";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const body = (await c.req.json().catch(() => ({}))) as BaseReceivedBody;

  // Verify the request body matches the schema
  const bodyZodReturn = BaseReceivedBodySchema.safeParse(body);
  if (bodyZodReturn.success === false) return c.json({ message: "Request body did not match schema.", error: bodyZodReturn.error }, 400);

  // At least totalGuilds, totalChannels, totalMembers are guaranteed to be present and numbers
  const { totalGuilds, totalChannels, totalMembers, incrementTotalStatsSent, game, language } = body;

  // Get the KV STATS object and edit it accordingly, before .put()ing it back
  const statsObject: BaseStatsObject = await c.env.DATA_KV.get("STATS", { type: "json" });

  // Verify the KV object matches the schema
  const kvZodReturn = BaseReceivedBodySchema.safeParse(statsObject);
  if (kvZodReturn.success === false) return c.json({ message: "KV statsObject doesn't match schema. Not updating KV. Received this ZodError.", error: kvZodReturn.error }, 500);

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

  // .put() the edited object
  await c.env.DATA_KV.put("STATS", JSON.stringify(statsObject));

  return c.json({ message: "Data posted to KV.", data: statsObject });
};
