import { GAMES, LANGUAGES } from "@/utils/constants";
import { z } from "zod";

// Builds an object of integer counters, one per key, keeping the key names as literals.
const counterRecord = <T extends readonly [string, ...string[]]>(keys: T) =>
  z.object(Object.fromEntries(keys.map((key) => [key, z.number().int()])) as { [K in T[number]]: z.ZodNumber });

export const BaseDataSchema = z.object({
  totalGuilds: z.number().int(),
  totalUserInstalls: z.number().int(),
  totalChannels: z.number().int(),
  totalMembers: z.number().int(),
  totalStatsSent: z.object({
    total: z.number().int(),
    games: counterRecord(GAMES),
    languages: counterRecord(LANGUAGES),
  }),
  lastUpdated: z.object({
    date: z.string(),
    timestampMilliseconds: z.number().int(),
    timestampSeconds: z.number().int(),
  }),
});
