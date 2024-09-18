import { Context } from "hono";
import { Bindings, D1EventPayload } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const body: D1EventPayload = await c.req.json();

  try {
    await c.env.DB.prepare("INSERT INTO events (event, date) VALUES (?1, ?2)").bind(body.event, new Date().getTime()).run();
    return new Response("POST /d1/events OK");
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
