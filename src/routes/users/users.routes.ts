import { createRoute, z } from "@hono/zod-openapi";
import { authentication } from "../../middleware/authentication";
import { UserPayloadSchema } from "../../schemas/payloads/user";
import { standard200Or201Response, standard500Response } from "../../utils/openApiStandards";

const tags = ["Users"];

export const count = createRoute({
  method: "get",
  path: "/users/count",
  tags,
  summary: "Amount of users",
  description: "Get the total amount of users in the database.",
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
  middleware: [authentication],
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

export type CountRoute = typeof count;
export type TopRoute = typeof top;
export type UsageByUserIdRoute = typeof usageByUserId;
export type CreateRoute = typeof create;
