import { UserLastOptionsSchema } from "@/do/user";
import { authentication } from "@/middleware/authentication";
import { cache } from "@/middleware/cache";
import { UserPayloadSchema } from "@/schemas/payloads/user";
import { standard200Or201Response, standard500Response } from "@/utils/openApiStandards";
import { createRoute, z } from "@hono/zod-openapi";

const tags = ["Users"];

export const count = createRoute({
  method: "get",
  path: "/users/count",
  tags,
  summary: "Amount of users",
  description: "Get the total amount of users in the database.",
  middleware: [cache("users-count", 60)],
  responses: {
    200: {
      description: "The amount of users",
      content: {
        "application/json": {
          schema: z.object({
            totalUsers: z.number().openapi({ description: "The total amount of users." }),
          }),
        },
      },
    },
    500: standard500Response,
  },
});

export const top = createRoute({
  method: "get",
  path: "/users/top",
  tags,
  summary: "Top 20 users",
  description: "Get the top 20 users by stats sent.",
  middleware: [cache("users-top", 60)],
  responses: {
    200: {
      description: "The top 20 users by stats sent",
      content: {
        "application/json": {
          schema: z
            .object({
              totalStatsSent: z.number().openapi({ description: "The total amount of stats sent by the user." }),
            })
            .array()
            .openapi({
              description: "The top 20 users by stats sent, descending.",
              example: [{ totalStatsSent: 256 }, { totalStatsSent: 128 }],
            }),
        },
      },
    },
    500: standard500Response,
  },
});

export const usageByUserId = createRoute({
  method: "get",
  path: "/users/{id}/usage",
  tags,
  summary: "Usage of a user",
  description: "Get the usage of a user by their Discord ID.",
  middleware: [authentication, cache("users-usage", 10)],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "The Discord ID of the user.", example: "99182302885588992" }),
    }),
  },
  responses: {
    200: {
      description: "The usage of a user",
      content: {
        "application/json": {
          schema: z
            .object({
              username: z.string().openapi({ description: "The user's username.", example: "mozzy" }),
              lastStatsSent: z
                .string()
                .openapi({ description: "The last time stats were sent.", example: "2024-11-13 20:33:15" }),
              bf2042Sent: z.number(),
              bfvSent: z.number(),
              bf1Sent: z.number(),
              bfhSent: z.number(),
              bf4Sent: z.number(),
              bf3Sent: z.number(),
              bfbc2Sent: z.number(),
              bf2Sent: z.number(),
              outputCount: z.number(),
            })
            .openapi({ description: "The usage stats of a user." }),
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: z.null(),
        },
      },
    },
    500: standard500Response,
  },
});

export const create = createRoute({
  method: "post",
  path: "/users",
  tags,
  summary: "Create user",
  description: "Create a user.",
  middleware: [authentication],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: standard200Or201Response,
    500: standard500Response,
  },
});

export const getLastOptions = createRoute({
  method: "get",
  path: "/users/{discordId}/last-options",
  tags,
  summary: "Get user's last options",
  description: "Get the last options of a user by their Discord ID.",
  middleware: [authentication],
  request: {
    params: z.object({
      discordId: z.string().openapi({ description: "The Discord ID of the user.", example: "99182302885588992" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UserLastOptionsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "The last options of a user",
      content: {
        "application/json": {
          schema: UserLastOptionsSchema,
        },
      },
    },
    500: standard500Response,
  },
});

export const updateLastOptions = createRoute({
  method: "post",
  path: "/users/{discordId}/last-options",
  tags,
  summary: "Update user's last options",
  description: "Update the last options of a user by their Discord ID.",
  middleware: [authentication],
  request: {
    params: z.object({
      discordId: z.string().openapi({ description: "The Discord ID of the user.", example: "99182302885588992" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UserLastOptionsSchema,
        },
      },
    },
  },
  responses: {
    200: standard200Or201Response,
    500: standard500Response,
  },
});

export const getRecentSearches = createRoute({
  method: "get",
  path: "/users/{discordId}/recent-searches",
  tags,
  summary: "Recent searches",
  description: "Get the user's recent searches by their Discord ID.",
  middleware: [authentication],
  request: {
    params: z.object({
      discordId: z.string().openapi({ description: "The Discord ID of the user.", example: "99182302885588992" }),
    }),
  },
  responses: {
    200: {
      description: "The recent searches",
      content: {
        "application/json": {
          schema: z.array(z.object({ game: z.string(), username: z.string(), platform: z.string() })),
        },
      },
    },
    500: standard500Response,
  },
});

export const getRecentUsernamesByGameAndPlatform = createRoute({
  method: "get",
  path: "/users/{discordId}/recent-usernames-by-game-and-platform",
  tags,
  summary: "Recent usernames by game and platform",
  description: "Get the user's recent usernames from the specified game and platform by their Discord ID.",
  middleware: [authentication],
  request: {
    params: z.object({
      discordId: z.string().openapi({ description: "The Discord ID of the user.", example: "99182302885588992" }),
    }),
    query: z.object({
      game: z.string().openapi({ description: "The game to filter by.", example: "bf2042" }),
      platform: z.string().openapi({ description: "The platform to filter by.", example: "pc" }),
    }),
  },
  responses: {
    200: {
      description: "The recent usernames from the specified game and platform",
      content: {
        "application/json": {
          schema: z.array(z.string()),
        },
      },
    },
    500: standard500Response,
  },
});

export const deleteRecentSearches = createRoute({
  method: "delete",
  path: "/users/{discordId}/recent-searches",
  tags,
  summary: "Delete recent searches",
  description: "Delete the user's recent searches by their Discord ID.",
  middleware: [authentication],
  request: {
    params: z.object({
      discordId: z.string().openapi({ description: "The Discord ID of the user.", example: "99182302885588992" }),
    }),
  },
  responses: {
    200: standard200Or201Response,
    500: standard500Response,
  },
});

export type CountRoute = typeof count;
export type TopRoute = typeof top;
export type UsageByUserIdRoute = typeof usageByUserId;
export type CreateRoute = typeof create;
export type GetLastOptionsRoute = typeof getLastOptions;
export type UpdateLastOptionsRoute = typeof updateLastOptions;
export type GetRecentSearchesRoute = typeof getRecentSearches;
export type GetRecentUsernamesByGameAndPlatformRoute = typeof getRecentUsernamesByGameAndPlatform;
export type DeleteRecentSearchesRoute = typeof deleteRecentSearches;
