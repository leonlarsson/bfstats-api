import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { z } from "zod";
import type * as schema from "./db/schema";

export interface CloudflareBindings {
  DB: D1Database;
  BUCKET: R2Bucket;
  API_KEY: string;
  RESEND_API_KEY: string;
  EMAIL: string;
}

declare module "hono" {
  export interface ContextVariableMap {
    db: DrizzleD1Database<typeof schema>;
  }
}

export type AppOpenAPI = OpenAPIHono<{ Bindings: CloudflareBindings }>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, { Bindings: CloudflareBindings }>;

const games = [
  "Battlefield 2042",
  "Battlefield V",
  "Battlefield 1",
  "Battlefield Hardline",
  "Battlefield 4",
  "Battlefield 3",
  "Battlefield Bad Company 2",
  "Battlefield 2",
] as const;
const languages = [
  "English",
  "French",
  "Italian",
  "German",
  "Spanish",
  "Russian",
  "Polish",
  "Brazilian Portuguese",
  "Turkish",
  "Swedish",
  "Norwegian",
  "Finnish",
  "Arabic",
] as const;

export type BaseReceivedBody = z.infer<typeof BaseReceivedBodySchema>;
export const BaseReceivedBodySchema = z.object({
  totalGuilds: z.number().int(),
  totalChannels: z.number().int(),
  totalMembers: z.number().int(),
  incrementTotalStatsSent: z.boolean().optional(),
  game: z.enum(games).optional(),
  language: z.enum(languages).optional(),
});

export type BaseStatsObject = z.infer<typeof BaseStatsObjectSchema>;
export const BaseStatsObjectSchema = z.object({
  totalGuilds: z.number().int(),
  totalChannels: z.number().int(),
  totalMembers: z.number().int(),
  totalStatsSent: z.object({
    total: z.number().int(),
    games: z.object({
      "Battlefield 2042": z.number().int(),
      "Battlefield V": z.number().int(),
      "Battlefield 1": z.number().int(),
      "Battlefield Hardline": z.number().int(),
      "Battlefield 4": z.number().int(),
      "Battlefield 3": z.number().int(),
      "Battlefield Bad Company 2": z.number().int(),
      "Battlefield 2": z.number().int(),
    }),
    languages: z.object({
      English: z.number().int(),
      French: z.number().int(),
      Italian: z.number().int(),
      German: z.number().int(),
      Spanish: z.number().int(),
      Russian: z.number().int(),
      Polish: z.number().int(),
      "Brazilian Portuguese": z.number().int(),
      Turkish: z.number().int(),
      Swedish: z.number().int(),
      Norwegian: z.number().int(),
      Finnish: z.number().int(),
      Arabic: z.number().int(),
    }),
  }),
  lastUpdated: z.object({
    date: z.string(),
    timestampMilliseconds: z.number().int(),
    timestampSeconds: z.number().int(),
  }),
});

export type D1UserPayload = z.infer<typeof D1UserPayloadSchema>;
export const D1UserPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
  language: z.string(),
});

export type D1OutputPayload = z.infer<typeof D1OutputPayloadSchema>;
export const D1OutputPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
  guildName: z.string().nullable(),
  guildId: z.string().nullable(),
  game: z.string(),
  segment: z.string(),
  language: z.string(),
  messageURL: z.string(),
  imageURL: z.string().nullable(),
  identifier: z.string(),
});

export type D1EventPayload = z.infer<typeof D1EventPayloadSchema>;
export const D1EventPayloadSchema = z.object({
  event: z.enum(["guildCreate", "guildDelete"]),
});
