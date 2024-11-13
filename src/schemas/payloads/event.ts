import { z } from "zod";

export const EventPayloadSchema = z.object({
  event: z.enum(["guildCreate", "guildDelete"]),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;
