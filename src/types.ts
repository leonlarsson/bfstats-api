import type * as schema from "@/db/schema";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { DrizzleD1Database } from "drizzle-orm/d1";

declare module "hono" {
  export interface ContextVariableMap {
    db: DrizzleD1Database<typeof schema>;
  }
}

export type AppOpenAPI = OpenAPIHono<{ Bindings: CloudflareBindings }>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, { Bindings: CloudflareBindings }>;
