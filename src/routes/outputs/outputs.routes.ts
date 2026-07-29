import { authentication } from "@/middleware/authentication";
import { cache } from "@/middleware/cache";
import { withSearchParams } from "@/middleware/withSearchParams";
import { OutputSummarySchema } from "@/schemas/entities/output";
import { OutputPayloadSchema } from "@/schemas/payloads/output";
import { standard200Or201Response, standard500Response } from "@/utils/openApiStandards";
import { createRoute, z } from "@hono/zod-openapi";

const tags = ["Outputs"];

/** How far back a windowed /outputs/counts request is allowed to look, in days. */
const MAX_LOOKBACK_DAYS = 366;

/** Query params /outputs/counts reads. Everything else is stripped before caching. */
const COUNTS_ALLOWED_PARAMS = ["days", "offset"];

// Shared by /outputs/daily-games and /outputs/daily-games-no-gaps.
const DailyGamesSchema = z
  .object({
    day: z.string().openapi({ description: "The day the usage was recorded.", example: "2024-03-22" }),
    game: z.string().openapi({ description: "The game the usage is from.", example: "Battlefield 2042" }),
    sent: z.number().openapi({ description: "The number of outputs sent that day for that game.", example: 42 }),
    totalSent: z.number().openapi({ description: "The total number of outputs sent that day.", example: 69 }),
  })
  .array()
  .openapi({ description: "The usage data per day per game." });

// Shared by /outputs/counts and /outputs/counts-last-7-days.
const CountsSchema = z
  .object({
    category: z
      .enum(["game", "segment", "language"])
      .openapi({ description: "The category type of the data.", example: "language" }),
    item: z.string().openapi({ description: "The name of the category item.", example: "English" }),
    sent: z.number().openapi({ description: "The number of outputs sent.", example: 56 }),
  })
  .array()
  .openapi({ description: "The usage data per category and item." });

export const getByIdentifier = createRoute({
  method: "get",
  path: "/outputs/by-identifier",
  tags: ["Outputs"],
  summary: "Output by identifier",
  description: "Get an output by identifier.",
  middleware: [cache("output-by-identifier", 60)],
  request: {
    query: z.object({
      identifier: z
        .string()
        .min(3)
        .openapi({ description: "The full or partial identifier of the output.", example: "yim" }),
    }),
  },
  responses: {
    200: {
      description: "The output",
      content: {
        "application/json": {
          schema: OutputSummarySchema,
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

export const getByChainIdentifier = createRoute({
  method: "get",
  path: "/outputs/by-chain-identifier",
  tags: ["Outputs"],
  summary: "Output by chain identifier",
  description: "Get an output by chain identifier.",
  middleware: [cache("output-by-chain-identifier", 20)],
  request: {
    query: z.object({
      chain_identifier: z.string().length(21).openapi({
        description: "The full chain identifier of the output. Must be an exact match.",
        example: "IiNS5QYqEPsLp_0SUR-oB",
      }),
    }),
  },
  responses: {
    200: {
      description: "The outputs in the chain",
      content: {
        "application/json": {
          schema: OutputSummarySchema.array(),
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
  description: "Get the 40 most recent outputs.",
  middleware: [cache("outputs-recent", 1)],
  responses: {
    200: {
      description: "The 40 most recent outputs",
      content: {
        "application/json": {
          schema: OutputSummarySchema.array().openapi({
            description: "The 40 most recent outputs.",
            example: [
              {
                game: "Battlefield 2042",
                segment: "Overview",
                language: "English",
                date: "2024-11-14 19:04:40",
                identifier: "LBEk8An7EFqwRavBf1",
                format: "image_art",
                paginationPage: null,
                sortKey: null,
                chainIdentifier: null,
              },
              {
                game: "Battlefield 2042",
                segment: "Hazard Zone",
                language: "English",
                date: "2024-11-14 18:59:04",
                identifier: "CBy6RNaOjRd80v7ltA",
                format: "text",
                paginationPage: null,
                sortKey: null,
                chainIdentifier: null,
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
  middleware: [cache("outputs-daily", 20)],
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
  middleware: [cache("outputs-daily-games", 20)],
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: DailyGamesSchema,
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
  middleware: [cache("outputs-daily-games-no-gaps", 20)],
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: DailyGamesSchema,
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
  description:
    "Get basic usage data per game, segment, and language. Covers all time by default. Pass days and/or offset to narrow it to a window, e.g. days=7 for the last 7 days, or days=7&offset=7 for the 7 days before that.",
  middleware: [withSearchParams(COUNTS_ALLOWED_PARAMS), cache("outputs-counts", 20)],
  request: {
    query: z
      .object({
        days: z.coerce
          .number()
          .int()
          .min(1)
          .max(MAX_LOOKBACK_DAYS)
          .optional()
          .openapi({
            description: `The number of days the window covers. Max ${MAX_LOOKBACK_DAYS}. Omit both params for all time.`,
            example: 7,
          }),
        offset: z.coerce
          .number()
          .int()
          .min(0)
          .max(MAX_LOOKBACK_DAYS - 1)
          .optional()
          .openapi({
            description: "How many days back the window ends. 0 means the window ends today. Defaults to 7 days.",
            example: 7,
          }),
      })
      // Together they cannot reach further back than MAX_LOOKBACK_DAYS.
      .refine((q) => (q.days ?? 7) + (q.offset ?? 0) <= MAX_LOOKBACK_DAYS, {
        message: `days + offset cannot exceed ${MAX_LOOKBACK_DAYS}`,
        path: ["days"],
      }),
  },
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: CountsSchema,
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
  // Longer cache time because this is pretty much only used for the header stat on battlefieldstats.ciom and the top game is unlikely to change often
  middleware: [cache("outputs-counts-last-7-days", 60)],
  responses: {
    200: {
      description: "The usage data",
      content: {
        "application/json": {
          schema: CountsSchema,
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
  summary: "Create output",
  description: "create an output.",
  middleware: [authentication],
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
export type GetByChainIdentifierRoute = typeof getByChainIdentifier;
export type RecentRoute = typeof recent;
export type DailyRoute = typeof daily;
export type DailyGamesRoute = typeof dailyGames;
export type DailyGamesNoGapsRoute = typeof dailyGamesNoGaps;
export type CountsRoute = typeof counts;
export type CountsLast7DaysRoute = typeof countsLast7Days;
export type CreateRoute = typeof create;
