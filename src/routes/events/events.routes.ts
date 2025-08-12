import { authentication } from "@/middleware/authentication";
import { cache } from "@/middleware/cache";
import { EventSchema } from "@/schemas/entities/event";
import { EventPayloadSchema } from "@/schemas/payloads/event";
import { AppEvent } from "@/utils/constants";
import { standard200Or201Response, standard500Response } from "@/utils/openApiStandards";
import { createRoute, z } from "@hono/zod-openapi";

const tags = ["Events"];

export const recent = createRoute({
  method: "get",
  path: "/events/recent",
  tags,
  summary: "Recent events",
  description: "Get the 40 most recent events.",
  middleware: [cache("events-recent", 1)],
  responses: {
    200: {
      description: "The 40 most recent events",
      content: {
        "application/json": {
          schema: EventSchema.array().openapi({
            description: "The 40 most recent events.",
            example: [
              {
                event: AppEvent.AppUserInstall,
                date: "2025-08-12 18:56:02",
              },
              {
                event: AppEvent.AppGuildInstall,
                date: "2024-11-14 16:23:55",
              },
              {
                event: AppEvent.AppGuildUninstall,
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

export const dailyEventsNoGaps = createRoute({
  method: "get",
  path: "/events/daily-no-gaps",
  tags,
  summary: "Daily events (no gaps)",
  description: "Get daily event counts without gaps.",
  middleware: [cache("events-daily-no-gaps", 20)],
  responses: {
    200: {
      description: "Daily event counts without gaps",
      content: {
        "application/json": {
          schema: z
            .object({
              day: z.string().openapi({ description: "The day the event was recorded.", example: "2025-08-12" }),
              event: z
                .enum(Object.values(AppEvent) as [string, ...string[]])
                .openapi({ description: "The event name.", example: AppEvent.AppUserInstall }),
              count: z
                .number()
                .openapi({ description: "The number of events for that day for this event.", example: 38 }),
              dailyTotal: z.number().openapi({ description: "The total number of events that day.", example: 47 }),
            })
            .array()
            .openapi({ description: "The usage data per day per game." }),
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
export type DailyEventsNoGapsRoute = typeof dailyEventsNoGaps;
export type CreateRoute = typeof create;
