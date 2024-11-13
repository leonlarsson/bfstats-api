import { createRoute } from "@hono/zod-openapi";
import { authentication } from "../../middleware/authentication";
import { EventSchema } from "../../schemas/entities/event";
import { D1EventPayloadSchema } from "../../types";
import { standard500Response } from "../../utils/openApiStandards";

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
          schema: D1EventPayloadSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Event created",
    },
  },
});

export type RecentRoute = typeof recent;
export type CreateRoute = typeof create;
