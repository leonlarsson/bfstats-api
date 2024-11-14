import { authentication } from "@/middleware/authentication";
import { cache } from "@/middleware/cache";
import { EventSchema } from "@/schemas/entities/event";
import { EventPayloadSchema } from "@/schemas/payloads/event";
import { standard200Or201Response, standard500Response } from "@/utils/openApiStandards";
import { createRoute } from "@hono/zod-openapi";

const tags = ["Events"];

export const recent = createRoute({
  method: "get",
  path: "/events/recent",
  tags,
  summary: "Recent events",
  description: "Get the 20 most recent events.",
  middleware: [cache("events-recent", 1)],
  responses: {
    200: {
      description: "The 20 most recent events",
      content: {
        "application/json": {
          schema: EventSchema.array().openapi({
            description: "The 20 most recent events.",
            example: [
              {
                event: "guildCreate",
                date: "2024-11-14 18:56:02",
              },
              {
                event: "guildDelete",
                date: "2024-11-14 16:23:55",
              },
              {
                event: "guildCreate",
                date: "2024-11-14 16:18:25",
              },
            ],
          }),
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
  summary: "Create event",
  description: "Create an event.",
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
