import { z } from "zod";

export const OutputPayloadSchema = z.object({
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
});

export type OutputPayload = z.infer<typeof OutputPayloadSchema>;
