import { z } from "zod";

export const OutputSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  guild_name: z.string().nullable(),
  guild_id: z.string().nullable(),
  game: z.string(),
  segment: z.string(),
  language: z.string(),
  date: z.string(),
  message_url: z.string().nullable(),
  image_url: z.string().nullable(),
  identifier: z.string().nullable(),
});
