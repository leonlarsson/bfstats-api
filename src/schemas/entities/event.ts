import { events } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

// A row in the events table. Shape comes from the table, the refinements only add OpenAPI docs.
export const EventSchema = createSelectSchema(events, {
  event: (schema) => schema.event.openapi({ description: "The event type." }),
  date: (schema) =>
    schema.date.openapi({ description: "The date the event occurred.", example: "2024-03-22 10:27:30" }),
});
