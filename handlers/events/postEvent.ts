import type { Context } from "hono";
import { type Bindings, type D1EventPayload, D1EventPayloadSchema } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const body: D1EventPayload = await c.req.json().catch(() => ({}));

  // Verify the request body matches the schema
  const bodyZodReturn = D1EventPayloadSchema.safeParse(body);
  if (bodyZodReturn.success === false)
    return c.json({ message: "Request body did not match schema.", error: bodyZodReturn.error }, 400);

  try {
    await c.env.DB.prepare("INSERT INTO events (event, date) VALUES (?1, ?2)")
      .bind(body.event, new Date().getTime())
      .run();
    return new Response("POST /d1/events OK");
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
