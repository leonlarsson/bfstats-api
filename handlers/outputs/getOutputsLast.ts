import { Context } from "hono";
import { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT game, segment, language, date FROM outputs ORDER BY date DESC LIMIT 20").all();
    return c.json(results);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
