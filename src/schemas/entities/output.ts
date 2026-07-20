import { z } from "zod";

export const OutputSchema = z.object({
  user_id: z.string().openapi({ description: "The user's Discord ID.", example: "99182302885588992" }),
  username: z.string().openapi({ description: "The user's Discord username.", example: "mozzy" }),
  guild_name: z.string().nullable(),
  guild_id: z.string().nullable(),
  game: z.string().openapi({ description: "The game the output is from.", example: "Battlefield 2042" }),
  segment: z.string().openapi({ description: "The segment the output is from.", example: "Weapons" }),
  language: z.string().openapi({ description: "The language of the output.", example: "English" }),
  date: z.string().openapi({ description: "The date the output was created.", example: "2024-03-22 10:27:30" }),
  message_url: z.string().nullable(),
  image_url: z.string().nullable(),
  identifier: z
    .string()
    .nullable()
    .openapi({ description: "The full identifier of the output.", example: "YImDLDbrfXO1KgTULW" }),
  is_my_stats: z
    .boolean()
    .openapi({ description: "Whether the output was generated via a /game mystats command.", example: true }),
  platform: z
    .string()
    .nullable()
    .openapi({ description: "The platform the stats were requested on.", example: "origin" }),
  format: z.string().openapi({ description: "The format of the output.", example: "image_art" }),
  pagination_page: z
    .number()
    .positive()
    .nullable()
    .optional()
    .openapi({ description: "The page that was requested. For array-based stats." }),
});
