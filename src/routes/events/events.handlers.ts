import { desc } from "drizzle-orm";
import { events, outputs } from "../../db/schema";
import type { AppRouteHandler } from "../../types";
import { handleAndLogError } from "../../utils/handleAndLogError";
import type { CreateRoute, RecentRoute } from "./events.routes";

export const recent: AppRouteHandler<RecentRoute> = async (c) => {
  try {
    const results = await c.get("db").query.events.findMany({
      orderBy: [desc(outputs.date)],
      limit: 20,
    });
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
      date: new Date().getTime(),
    });
    return c.json({ message: "Event created" }, 201);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
