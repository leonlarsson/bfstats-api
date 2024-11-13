import { createRoute, z } from "@hono/zod-openapi";
import { authentication } from "../../middleware/authentication";
import { OutputSchema } from "../../schemas/entities/output";
import { OutputPayloadSchema } from "../../schemas/payloads/output";
import { standard200Or201Response, standard500Response } from "../../utils/openApiStandards";

const tags = ["Outputs"];

export const getByIdentifier = createRoute({
  method: "get",
  path: "/outputs/by-identifier",
  tags: ["Outputs"],
  summary: "Output by identifier",
  description: "Get an output by identifier.",
  request: {
    query: z.object({
      identifier: z.string(),
    }),
  },
  responses: {
    200: {
      description: "The output",
      content: {
        "application/json": {
          schema: OutputSchema.pick({
            game: true,
            segment: true,
            language: true,
            date: true,
            identifier: true,
          }),
        },
      },
    },
    404: {
      description: "Output not found",
      content: {
        "application/json": {
          schema: z.null(),
        },
      },
    },
    500: standard500Response,
  },
});

export const recent = createRoute({
  method: "get",
  path: "/outputs/recent",
  tags: ["Outputs"],
  summary: "Recent outputs",
  description: "Get the last 20 outputs.",
  responses: {
    200: {
      description: "The last 20 outputs",
      content: {
        "application/json": {
          schema: OutputSchema.pick({
            game: true,
            segment: true,
            language: true,
            date: true,
            identifier: true,
          }).array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const daily = createRoute({
  method: "get",
  path: "/outputs/daily",
  tags: ["Outputs"],
  summary: "Daily output counts",
  description: "Get daily usage per day.",
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: z
            .object({
              day: z.string(),
              sent: z.number(),
            })
            .array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const dailyGames = createRoute({
  method: "get",
  path: "/outputs/daily-games",
  tags: ["Outputs"],
  summary: "Daily output counts per game",
  description: "Get daily usage per day per game.",
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: z
            .object({
              day: z.string(),
              game: z.string(),
              sent: z.number(),
              total_sent: z.number(),
            })
            .array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const dailyGamesNoGaps = createRoute({
  method: "get",
  path: "/outputs/daily-games-no-gaps",
  tags: ["Outputs"],
  summary: "Daily output counts per game (no gaps)",
  description: "Get daily usage per day per game without gaps.",
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: z
            .object({
              day: z.string(),
              game: z.string(),
              sent: z.number(),
              total_sent: z.number(),
            })
            .array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const counts = createRoute({
  method: "get",
  path: "/outputs/counts",
  tags,
  responses: {
    200: {
      description: "Get basic usage data per game, segment, and language.",
      content: {
        "application/json": {
          schema: z
            .object({
              category: z.string(),
              item: z.string(),
              sent: z.number(),
            })
            .array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const countsLast7Days = createRoute({
  method: "get",
  path: "/outputs/counts-last-7-days",
  tags,
  responses: {
    200: {
      description: "Get basic usage data per game, segment, and language for the last 7 days.",
      content: {
        "application/json": {
          schema: z
            .object({
              category: z.string(),
              item: z.string(),
              sent: z.number(),
            })
            .array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const create = createRoute({
  method: "post",
  path: "/outputs",
  tags: ["Outputs"],
  middleware: [authentication],
  summary: "Post output",
  description: "Post an output.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: OutputPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: standard200Or201Response,
    500: standard500Response,
  },
});

export type GetByIdentifierRoute = typeof getByIdentifier;
export type RecentRoute = typeof recent;
export type DailyRoute = typeof daily;
export type DailyGamesRoute = typeof dailyGames;
export type DailyGamesNoGapsRoute = typeof dailyGamesNoGaps;
export type CountsRoute = typeof counts;
export type CountsLast7DaysRoute = typeof countsLast7Days;
export type CreateRoute = typeof create;
