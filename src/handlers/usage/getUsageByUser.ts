import type { Context } from "hono";
import type { Bindings } from "../../types";
import handleAndLogD1Error from "../../utils/handleAndLogError";

export default async (c: Context<{ Bindings: Bindings }>) => {
  const user = c.req.param("user");

  try {
    const { results } = await c.env.DB.prepare(
      "SELECT users.username, total_stats_sent, last_stats_sent, SUM(outputs.game = 'Battlefield 2042') AS bf2042_sent, SUM(outputs.game = 'Battlefield V') AS bfv_sent, SUM(outputs.game = 'Battlefield 1') AS bf1_sent, SUM(outputs.game = 'Battlefield Hardline') AS bfh_sent, SUM(outputs.game = 'Battlefield 4') AS bf4_sent, SUM(outputs.game = 'Battlefield 3') AS bf3_sent, SUM(outputs.game = 'Battlefield Bad Company 2') AS bfbc2_sent, SUM(outputs.game = 'Battlefield 2') AS bf2_sent, COUNT(outputs.user_id) AS output_count FROM users LEFT JOIN outputs ON users.user_id = outputs.user_id WHERE users.user_id = ?",
    )
      .bind(user)
      .all();

    const foundUser = !!results[0].username;

    return c.json(foundUser ? results[0] : null, foundUser ? 200 : 404);
  } catch (error) {
    return handleAndLogD1Error(error);
  }
};
