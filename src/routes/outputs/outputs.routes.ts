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
      identifier: z.string().openapi({ description: "The full or partial identifier of the output.", example: "yim" }),
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
  description: "Get the 20 most recent outputs.",
  responses: {
    200: {
      description: "The 20 most recent outputs",
      content: {
        "application/json": {
          schema: OutputSchema.pick({
            game: true,
            segment: true,
            language: true,
            date: true,
            identifier: true,
          })
            .array()
            .openapi({
              description: "The 20 most recent outputs.",
              example: [
                {
                  game: "Battlefield 2042",
                  segment: "Overview",
                  language: "English",
                  date: "2024-11-14 19:04:40",
                  identifier: "LBEk8An7EFqwRavBf1",
                },
                {
                  game: "Battlefield 2042",
                  segment: "Hazard Zone",
                  language: "English",
                  date: "2024-11-14 18:59:04",
                  identifier: "CBy6RNaOjRd80v7ltA",
                },
              ],
            }),
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
              day: z.string().openapi({ description: "The day the usage was recorded.", example: "2024-03-22" }),
              sent: z.number().openapi({ description: "The number of outputs sent that day.", example: 5 }),
            })
            .array()
            .openapi({ description: "The usage data per day." }),
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
              day: z.string().openapi({ description: "The day the usage was recorded.", example: "2024-03-22" }),
              game: z.string().openapi({ description: "The game the usage is from.", example: "Battlefield 2042" }),
              sent: z
                .number()
                .openapi({ description: "The number of outputs sent that day for that game.", example: 42 }),
              totalSent: z.number().openapi({ description: "The total number of outputs sent that day.", example: 69 }),
            })
            .array()
            .openapi({ description: "The usage data per day per game." }),
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
              day: z.string().openapi({ description: "The day the usage was recorded.", example: "2024-03-22" }),
              game: z.string().openapi({ description: "The game the usage is from.", example: "Battlefield 2042" }),
              sent: z
                .number()
                .openapi({ description: "The number of outputs sent that day for that game.", example: 42 }),
              totalSent: z.number().openapi({ description: "The total number of outputs sent that day.", example: 69 }),
            })
            .array()
            .openapi({ description: "The usage data per day per game." }),
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
  summary: "Output counts",
  description: "Get basic usage data per game, segment, and language.",
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: z
            .object({
              category: z
                .enum(["game", "segment", "language"])
                .openapi({ description: "The category type of the data.", example: "language" }),
              item: z.string().openapi({ description: "The name of the category item.", example: "English" }),
              sent: z.number().openapi({ description: "The number of outputs sent.", example: 56 }),
            })
            .array()
            .openapi({ description: "The usage data per category and item." }),
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
  summary: "Output counts (7 days)",
  description: "Get basic usage data per game, segment, and language for the last 7 days.",
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: z
            .object({
              category: z
                .enum(["game", "segment", "language"])
                .openapi({ description: "The category type of the data.", example: "language" }),
              item: z.string().openapi({ description: "The name of the category item.", example: "English" }),
              sent: z.number().openapi({ description: "The number of outputs sent.", example: 56 }),
            })
            .array()
            .openapi({ description: "The usage data per category and item." }),
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
  summary: "Create output",
  description: "create an output.",
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
