import { AppEvent } from "@/utils/constants";
import { z } from "zod";

export const EventPayloadSchema = z.object({
  event: z.enum([...Object.values(AppEvent)] as [string, ...string[]]),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;
