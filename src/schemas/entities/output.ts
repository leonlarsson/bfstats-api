import { z } from "zod";

export const OutputSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  guild_name: z.string().nullable(),
  guild_id: z.string().nullable(),
  game: z.string().nullable(),
  segment: z.string().nullable(),
  language: z.string().nullable(),
  date: z.number(),
  message_url: z.string().nullable(),
  image_url: z.string().nullable(),
  identifier: z.string(),
});
