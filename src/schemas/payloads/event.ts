import { appEventValues } from "@/utils/constants";
import { z } from "zod";

export const EventPayloadSchema = z.object({
  event: z.enum(appEventValues),
});

export type EventPayload = z.infer<typeof EventPayloadSchema>;
