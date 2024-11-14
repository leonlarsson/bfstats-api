import { desc, eq, like, or, sql } from "drizzle-orm";
import { outputs } from "../../db/schema";
import type { AppRouteHandler } from "../../types";
import { handleAndLogError } from "../../utils/handleAndLogError";
import type {
  CountsLast7DaysRoute,
  CountsRoute,
  CreateRoute,
  DailyGamesNoGapsRoute,
  DailyGamesRoute,
  DailyRoute,
  GetByIdentifierRoute,
  RecentRoute,
} from "./outputs.routes";

export const getByIdentifier: AppRouteHandler<GetByIdentifierRoute> = async (c) => {
  const { identifier } = c.req.valid("query");

  try {
    const output = await c.get("db").query.outputs.findFirst({
      columns: {
        game: true,
        segment: true,
        language: true,
        date: true,
        identifier: true,
      },
      where: or(eq(outputs.identifier, identifier), like(outputs.identifier, `%${identifier}%`)),
    });

    if (!output) {
      return c.json(null, 404);
    }

    return c.json(output, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const recent: AppRouteHandler<RecentRoute> = async (c) => {
  try {
    const results = await c.get("db").query.outputs.findMany({
      columns: {
        game: true,
        segment: true,
        language: true,
        date: true,
        identifier: true,
      },
      orderBy: desc(outputs.date),
      limit: 20,
    });
    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const daily: AppRouteHandler<DailyRoute> = async (c) => {
  try {
    const results = await c
      .get("db")
      .select({
        day: sql<string>`DATE(date)`.as("day"),
        sent: sql<number>`COUNT(*)`.as("sent"),
      })
      .from(outputs)
      .groupBy(sql<string>`DATE(date)`)
      .orderBy(sql`day`);

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const dailyGames: AppRouteHandler<DailyGamesRoute> = async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT main.day, main.game, main.sent, totals.totalSent FROM (SELECT strftime('%Y-%m-%d', date) AS day, game, COUNT(*) AS sent FROM outputs GROUP BY day, game) main JOIN (SELECT strftime('%Y-%m-%d', date) AS day, COUNT(*) AS totalSent FROM outputs GROUP BY day) totals ON main.day = totals.day",
    ).all();

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const dailyGamesNoGaps: AppRouteHandler<DailyGamesNoGapsRoute> = async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `
      WITH RECURSIVE date_range(day) AS (
        -- Dynamically select the start date from the earliest record in 'outputs'
        SELECT strftime('%Y-%m-%d', MIN(date)) FROM outputs
        UNION ALL
        -- Generate dates until today
        SELECT strftime('%Y-%m-%d', day, '+1 day') FROM date_range WHERE day < CURRENT_DATE
        ),
        games AS (
          -- Select distinct games from 'outputs'
          SELECT DISTINCT game FROM outputs
          ),
          combined AS (
            -- Generate all combinations of dates and games
            SELECT day, game FROM date_range CROSS JOIN games
            ),
            main AS (
              -- Get the count of 'sent' for each day and game
    SELECT strftime('%Y-%m-%d', date) AS day, game, COUNT(*) AS sent
    FROM outputs GROUP BY day, game
    ),
    totals AS (
      -- Get the total count of 'sent' for each day
      SELECT strftime('%Y-%m-%d', date) AS day, COUNT(*) AS totalSent
      FROM outputs GROUP BY day
      )
      -- Perform the left join to fill in missing dates and games
      SELECT combined.day, combined.game, IFNULL(main.sent, 0) AS sent, totals.totalSent
      FROM combined
      LEFT JOIN main ON combined.day = main.day AND combined.game = main.game
      LEFT JOIN totals ON combined.day = totals.day
      ORDER BY combined.day, combined.game;
      `,
    ).all();

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const counts: AppRouteHandler<CountsRoute> = async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT 'game' as category, game as item, COUNT(*) as sent FROM outputs GROUP BY game UNION ALL SELECT 'segment' as category, segment as item, COUNT(*) as sent FROM outputs GROUP BY segment UNION ALL SELECT 'language' as category, language as item, COUNT(*) as sent FROM outputs GROUP BY language ORDER BY category ASC, sent DESC",
    ).all();

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const countsLast7Days: AppRouteHandler<CountsLast7DaysRoute> = async (c) => {
  const whereClause = "WHERE date(strftime('%Y-%m-%d', datetime(date))) >= date('now', '-7 days')";

  try {
    const { results } = await c.env.DB.prepare(
      `
SELECT 'game' as category, game as item, COUNT(*) as sent 
FROM outputs 
${whereClause}
GROUP BY game

UNION ALL

SELECT 'segment' as category, segment as item, COUNT(*) as sent 
FROM outputs 
${whereClause}
GROUP BY segment

UNION ALL

SELECT 'language' as category, language as item, COUNT(*) as sent 
FROM outputs 
${whereClause}
GROUP BY language

ORDER BY category ASC, sent DESC;
`,
    ).all();

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { userId, username, guildName, guildId, game, segment, language, messageURL, imageURL, identifier } =
    c.req.valid("json");

  try {
    await c.get("db").insert(outputs).values({
      userId,
      username,
      guildName,
      guildId,
      game,
      segment,
      language,
      messageUrl: messageURL,
      imageUrl: imageURL,
      identifier,
    });

    return c.text("ok", 201);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
