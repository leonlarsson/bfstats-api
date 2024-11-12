import { z } from "zod";

export const UserSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  last_stats_sent: z.number(),
  last_language: z.string().nullable(),
  total_stats_sent: z.number(),
});
