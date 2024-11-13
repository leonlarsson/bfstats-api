import { z } from "zod";

const games = [
  "Battlefield 2042",
  "Battlefield V",
  "Battlefield 1",
  "Battlefield Hardline",
  "Battlefield 4",
  "Battlefield 3",
  "Battlefield Bad Company 2",
  "Battlefield 2",
] as const;
const languages = [
  "English",
  "French",
  "Italian",
  "German",
  "Spanish",
  "Russian",
  "Polish",
  "Brazilian Portuguese",
  "Turkish",
  "Swedish",
  "Norwegian",
  "Finnish",
  "Arabic",
] as const;

export const BaseDataPayloadSchema = z.object({
  totalGuilds: z.number().int(),
  totalChannels: z.number().int(),
  totalMembers: z.number().int(),
  incrementTotalStatsSent: z.boolean().optional(),
  game: z.enum(games).optional(),
  language: z.enum(languages).optional(),
});

export type BaseDataPayload = z.infer<typeof BaseDataPayloadSchema>;
