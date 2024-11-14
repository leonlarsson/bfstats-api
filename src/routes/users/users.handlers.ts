import { outputs, users } from "@/db/schema";
import type { AppRouteHandler } from "@/types";
import { handleAndLogError } from "@/utils/handleAndLogError";
import { desc, eq, sql } from "drizzle-orm";
import type { CountRoute, CreateRoute, TopRoute, UsageByUserIdRoute } from "./users.routes";

export const count: AppRouteHandler<CountRoute> = async (c) => {
  try {
    const results = await c.get("db").$count(users);
    return c.json({ totalUsers: results }, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const top: AppRouteHandler<TopRoute> = async (c) => {
  try {
    const results = await c.get("db").query.users.findMany({
      columns: {
        totalStatsSent: true,
      },
      orderBy: desc(users.totalStatsSent),
      limit: 20,
    });

    return c.json(results, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const usageByUserId: AppRouteHandler<UsageByUserIdRoute> = async (c) => {
  const { id } = c.req.valid("param");

  try {
    const results = await c
      .get("db")
      .select({
        username: users.username,
        lastStatsSent: users.lastStatsSent,
        bf2042Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield 2042'), 0)`,
        bfvSent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield V'), 0)`,
        bf1Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield 1'), 0)`,
        bfhSent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield Hardline'), 0)`,
        bf4Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield 4'), 0)`,
        bf3Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield 3'), 0)`,
        bfbc2Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield Bad Company 2'), 0)`,
        bf2Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield 2'), 0)`,
        outputCount: sql<number>`COUNT(outputs.user_id)`,
      })
      .from(users)
      .leftJoin(outputs, eq(users.userId, outputs.userId))
      .where(eq(users.userId, id));

    const foundUser = !!results[0].username;

    if (!foundUser) {
      return c.json(null, 404);
    }

    return c.json(results[0], 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { userId, username, language } = c.req.valid("json");

  try {
    await c
      .get("db")
      .insert(users)
      .values({
        userId,
        username,
        lastLanguage: language,
      })
      .onConflictDoUpdate({
        target: users.userId,
        setWhere: eq(users.userId, userId),
        set: {
          username,
          lastStatsSent: sql`strftime('%Y-%m-%d %H:%M:%S', 'now')`,
          lastLanguage: language,
          totalStatsSent: sql`${users.totalStatsSent} + 1`,
        },
      });

    return c.text("ok", 201);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
