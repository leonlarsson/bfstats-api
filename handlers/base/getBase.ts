import { Context } from "hono";
import { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

export default async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const data = await c.env.DB.prepare("SELECT * FROM json_data").first<string>("data");
    return c.json(JSON.parse(data));
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
