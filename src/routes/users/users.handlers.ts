import { events, outputs, users } from "@/db/schema";
import type { UserLinks } from "@/do/user";
import type { AppRouteHandler } from "@/types";
import { AppEvent } from "@/utils/constants";
import { getUserDOStub } from "@/utils/getUserDOStub";
import { handleAndLogError } from "@/utils/handleAndLogError";
import { desc, eq, sql } from "drizzle-orm";
import type {
  AddSearchRoute,
  CountRoute,
  CreateRoute,
  DeleteLinkRoute,
  GetLinksRoute,
  GetRecentUsernamesByGameAndPlatformRoute,
  PutLinkRoute,
  TopRoute,
  UsageByUserIdRoute,
} from "./users.routes";

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
    const stub = getUserDOStub(c.env, id);

    const [[usageResults], linkResults] = await Promise.all([
      c
        .get("db")
        .select({
          username: users.username,
          lastStatsSent: users.lastStatsSent,
          bf6Sent: sql<number>`COALESCE(SUM(outputs.game = 'Battlefield 6'), 0)`,
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
        .where(eq(users.userId, id)),
      stub.getLinks(),
    ]);

    if (!usageResults) {
      return c.json(null, 404);
    }

    return c.json({ usage: usageResults, userLinks: linkResults }, 200);
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

export const addSearch: AppRouteHandler<AddSearchRoute> = async (c) => {
  const { discordId } = c.req.valid("param");
  const { game, username, platform } = c.req.valid("json");

  try {
    const stub = getUserDOStub(c.env, discordId);
    await stub.addSearch(game, username, platform);
    return c.body(null, 201);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const getLinks: AppRouteHandler<GetLinksRoute> = async (c) => {
  const { discordId } = c.req.valid("param");

  try {
    const stub = getUserDOStub(c.env, discordId);
    const links = await stub.getLinks();
    return c.json(links as UserLinks, 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const putLink: AppRouteHandler<PutLinkRoute> = async (c) => {
  const { discordId, game } = c.req.valid("param");
  const unsafeLink = c.req.valid("json");

  try {
    const stub = getUserDOStub(c.env, discordId);
    await stub.setLink(game, unsafeLink);
    await c.get("db").insert(events).values({ event: AppEvent.BfAccountLink });
    return c.text("ok", 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const deleteLink: AppRouteHandler<DeleteLinkRoute> = async (c) => {
  const { discordId, game } = c.req.valid("param");

  try {
    const stub = getUserDOStub(c.env, discordId);
    await stub.deleteLink(game);
    await c.get("db").insert(events).values({ event: AppEvent.BfAccountUnlink });
    return c.text("ok", 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};

export const getRecentUsernamesByGameAndPlatform: AppRouteHandler<GetRecentUsernamesByGameAndPlatformRoute> = async (
  c,
) => {
  const { discordId } = c.req.valid("param");
  const { game, platform } = c.req.valid("query");

  try {
    const stub = getUserDOStub(c.env, discordId);
    const recentUsernames = await stub.getRecentUsernamesByGameAndPlatform(game, platform);
    return c.json(recentUsernames as string[], 200);
  } catch (error: any) {
    return handleAndLogError(c, error);
  }
};
