import type * as schema from "@/db/schema";
import type { UserDurableObject } from "@/do/user";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export interface CloudflareBindings {
  DB: D1Database;
  USER_DO: DurableObjectNamespace<UserDurableObject>;
  // BUCKET: R2Bucket;
  API_KEY: string;
}

declare module "hono" {
  export interface ContextVariableMap {
    db: DrizzleD1Database<typeof schema>;
  }
}

export type AppOpenAPI = OpenAPIHono<{ Bindings: CloudflareBindings }>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, { Bindings: CloudflareBindings }>;
