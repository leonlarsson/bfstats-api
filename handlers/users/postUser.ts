import { Context } from "hono";
import { Bindings, D1UserPayload, D1UserPayloadSchema } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const body: D1UserPayload = await c.req.json().catch(() => ({}));

  // Verify the request body matches the schema
  const bodyZodReturn = D1UserPayloadSchema.safeParse(body);
  if (bodyZodReturn.success === false) return c.json({ message: "Request body did not match schema.", error: bodyZodReturn.error }, 400);
  const { userId, username, language } = body;

  try {
    // Insert a new user. If there is a conflict (user_id already exists), then update the existing row
    await c.env.DB.prepare("INSERT INTO users (user_id, username, last_stats_sent, last_language, total_stats_sent) VALUES (?1, ?2, ?3, ?4, 1) ON CONFLICT (user_id) DO UPDATE SET username = ?2, last_stats_sent = ?3, last_language = ?4, total_stats_sent = total_stats_sent + 1 WHERE user_id = ?1")
      .bind(userId, username, new Date().getTime(), language)
      .run();

    return c.text("POST /d1/users OK");
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
