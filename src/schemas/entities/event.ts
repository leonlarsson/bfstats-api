import { z } from "zod";

export const EventSchema = z.object({
  event: z.string(),
  date: z.string(),
});
