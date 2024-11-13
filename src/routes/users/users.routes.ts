import { createRoute, z } from "@hono/zod-openapi";
import { authentication } from "../../middleware/authentication";
import { UserPayloadSchema } from "../../schemas/payloads/user";
import { standard200Or201Response, standard500Response } from "../../utils/openApiStandards";

const tags = ["Users"];

export const count = createRoute({
  method: "get",
  path: "/users/count",
  tags,
  responses: {
    200: {
      description: "TODO",
      content: {
        "application/json": {
          schema: z.object({
            totalUsers: z.number(),
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
  responses: {
    200: {
      description: "TODO",
      content: {
        "application/json": {
          schema: z
            .object({
              totalStatsSent: z.number(),
            })
            .array(),
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
  middleware: [authentication],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "TODO",
      content: {
        "application/json": {
          schema: z.object({
            username: z.string(),
            lastStatsSent: z.string(),
            bf2042Sent: z.number(),
            bfvSent: z.number(),
            bf1Sent: z.number(),
            bfhSent: z.number(),
            bf4Sent: z.number(),
            bf3Sent: z.number(),
            bfbc2Sent: z.number(),
            bf2Sent: z.number(),
            outputCount: z.number(),
          }),
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
