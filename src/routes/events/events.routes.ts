import { createRoute } from "@hono/zod-openapi";
import { authentication } from "../../middleware/authentication";
import { EventSchema } from "../../schemas/entities/event";
import { EventPayloadSchema } from "../../schemas/payloads/event";
import { standard200Or201Response, standard500Response } from "../../utils/openApiStandards";

const tags = ["Events"];

export const recent = createRoute({
  method: "get",
  path: "/events/recent",
  tags,
  responses: {
    200: {
      description: "The most recent events",
      content: {
        "application/json": {
          schema: EventSchema.array(),
        },
      },
    },
    500: standard500Response,
  },
});

export const create = createRoute({
  method: "post",
  path: "/events",
  tags,
  middleware: [authentication],
  request: {
    body: {
      content: {
        "application/json": {
          schema: EventPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: standard200Or201Response,
    500: standard500Response,
  },
});

export type RecentRoute = typeof recent;
export type CreateRoute = typeof create;
