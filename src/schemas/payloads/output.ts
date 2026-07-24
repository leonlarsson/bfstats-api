import { z } from "zod";

const formats = ["image_art", "image_art_gif", "image_solid", "image_solid_gif", "text"] as const;

export const OutputPayloadSchema = z
  .object({
    userId: z.string(),
    username: z.string(),
    guildName: z.string().nullable(),
    guildId: z.string().nullable(),
    game: z.string(),
    segment: z.string(),
    language: z.string(),
    messageURL: z.string(),
    imageURL: z.string().nullable(),
    identifier: z.string(),
    isMyStats: z.boolean().optional().default(false),
    platform: z.string().nullable(),
    format: z.enum(formats),
    paginationPage: z.number().positive().nullable().optional(),
    sortKey: z.string().nullable().optional(),
  })
  .openapi({
    description: "The output data",
    example: {
      userId: "99182302885588992",
      username: "mozzy",
      guildName: "Battlefield",
      guildId: "140933721929940992",
      game: "Battlefield 2042",
      segment: "Overview",
      language: "English",
      messageURL: "https://discord.com/channels/140933721929940992/446371403445436426/1306696310577037463",
      imageURL:
        "https://cdn.discordapp.com/attachments/446371403445436426/1306696317019488327/MozzyFX_BF2042_Overview_Stats.png?ex=67379b47&is=673649c7&hm=64786543172fbac9401a9a35d0aa4cdb0d94079e26b3163cc15b156f364e6cbe&",
      identifier: "LBEk8An7EFqwRavBf1",
      isMyStats: false,
      platform: "origin",
      format: "image_art",
    },
  });

export type OutputPayload = z.infer<typeof OutputPayloadSchema>;
