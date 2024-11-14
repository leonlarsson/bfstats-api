import { z } from "zod";

export const EventSchema = z.object({
  event: z.enum(["guildCreate", "guildDelete"]).openapi({ description: "The event type." }),
  date: z.string().openapi({ description: "The date the event occurred.", example: "2024-03-22 10:27:30" }),
});
