import { Context } from "hono";
import { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogD1Error";

type PartialOutput = { game: string; segment: string; language: string; date: string; identifier: string };

export default async (c: Context<{ Bindings: Bindings }>) => {
  const { id } = c.req.param();

  try {
    const result = await c.env.DB.prepare("SELECT game, segment, language, date, identifier FROM outputs WHERE identifier = ?1 OR identifier LIKE '%' || ?1 || '%' LIMIT 1").bind(id).first<PartialOutput>();
    return result ? c.json(result) : c.json({ error: "Found no matching identifier" }, 404);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
