import { Context } from "hono";
import { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT DATE(date/1000, 'unixepoch') AS day, COUNT() AS sent FROM outputs GROUP BY day").all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
