import { z } from "zod";

export const BaseDataSchema = z.object({
  totalGuilds: z.number().int(),
  totalUserInstalls: z.number().int(),
  totalChannels: z.number().int(),
  totalMembers: z.number().int(),
  totalStatsSent: z.object({
    total: z.number().int(),
    games: z.object({
      "Battlefield 2042": z.number().int(),
      "Battlefield V": z.number().int(),
      "Battlefield 1": z.number().int(),
      "Battlefield Hardline": z.number().int(),
      "Battlefield 4": z.number().int(),
      "Battlefield 3": z.number().int(),
      "Battlefield Bad Company 2": z.number().int(),
      "Battlefield 2": z.number().int(),
    }),
    languages: z.object({
      English: z.number().int(),
      French: z.number().int(),
      Italian: z.number().int(),
      German: z.number().int(),
      Spanish: z.number().int(),
      Russian: z.number().int(),
      Polish: z.number().int(),
      "Brazilian Portuguese": z.number().int(),
      Turkish: z.number().int(),
      Swedish: z.number().int(),
      Norwegian: z.number().int(),
      Finnish: z.number().int(),
      Arabic: z.number().int(),
    }),
  }),
  lastUpdated: z.object({
    date: z.string(),
    timestampMilliseconds: z.number().int(),
    timestampSeconds: z.number().int(),
  }),
});
