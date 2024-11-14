import { events } from "@/db/schema";
import type { AppRouteHandler } from "@/types";
import { handleAndLogError } from "@/utils/handleAndLogError";
import { desc } from "drizzle-orm";
import type { CreateRoute, RecentRoute } from "./events.routes";

export const recent: AppRouteHandler<RecentRoute> = async (c) => {
  try {
    const results = await c.get("db").query.events.findMany({
      orderBy: [desc(events.date)],
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
    });
    return c.text("ok", 201);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
