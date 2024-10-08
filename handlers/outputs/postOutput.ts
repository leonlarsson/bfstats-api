import type { Context } from "hono";
import { type Bindings, type D1OutputPayload, D1OutputPayloadSchema } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const body: D1OutputPayload = await c.req.json().catch(() => ({}));

  // Verify the request body matches the schema
  const bodyZodReturn = D1OutputPayloadSchema.safeParse(body);
  if (bodyZodReturn.success === false)
    return c.json({ message: "Request body did not match schema.", error: bodyZodReturn.error }, 400);
  const { userId, username, guildName, guildId, game, segment, language, messageURL, imageURL, identifier } = body;

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

    return c.text("POST /d1/outputs OK");
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
