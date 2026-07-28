import { events } from "@/db/schema";
import type { AppRouteHandler } from "@/types";
import { exposedAppEvents } from "@/utils/constants";
import { handleAndLogError } from "@/utils/handleAndLogError";
import { desc, inArray } from "drizzle-orm";
import type { CreateRoute, DailyEventsNoGapsRoute, RecentRoute } from "./events.routes";

export const recent: AppRouteHandler<RecentRoute> = async (c) => {
  try {
    const results = await c.get("db").query.events.findMany({
      where: inArray(events.event, exposedAppEvents),
      orderBy: [desc(events.date)],
      limit: 40,
    });
    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const dailyEventsNoGaps: AppRouteHandler<DailyEventsNoGapsRoute> = async (c) => {
  const placeholders = exposedAppEvents.map(() => "?").join(",");

  try {
    const { results } = await c.env.DB.prepare(
      `
      WITH RECURSIVE date_range(day) AS (
        -- Manually set the start date to Jan 1, 2023
        SELECT '2023-01-01' AS day
        UNION ALL
        SELECT strftime('%Y-%m-%d', day, '+1 day') FROM date_range WHERE day < CURRENT_DATE
      ),
      event_types AS (
        -- Select distinct events from 'events'
        SELECT DISTINCT event FROM events WHERE event IN (${placeholders})
      ),
      combined AS (
        SELECT day, event FROM date_range CROSS JOIN event_types
      ),
      main AS (
        -- Get the count of each event for each day
        SELECT strftime('%Y-%m-%d', date) AS day, event, COUNT(*) AS count
        FROM events WHERE event IN (${placeholders}) GROUP BY day, event
      ),
      totals AS (
        -- Get the total count of all events for each day
        SELECT strftime('%Y-%m-%d', date) AS day, COUNT(*) AS dailyTotal
        FROM events WHERE event IN (${placeholders}) GROUP BY day
      )
      SELECT combined.day, combined.event, IFNULL(main.count, 0) AS count, IFNULL(totals.dailyTotal, 0) AS dailyTotal
      FROM combined
      LEFT JOIN main ON combined.day = main.day AND combined.event = main.event
      LEFT JOIN totals ON combined.day = totals.day
      ORDER BY combined.day, combined.event;
      `,
    )
      .bind(...exposedAppEvents, ...exposedAppEvents, ...exposedAppEvents)
      .all();

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { event } = c.req.valid("json");

  try {
    await c.get("db").insert(events).values({
      event,
    });
    return c.text("ok", 201);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
