import { GAMES, LANGUAGES } from "@/utils/constants";
import { z } from "zod";

export const BaseDataPayloadSchema = z.object({
  totalGuilds: z.number().int(),
  totalUserInstalls: z.number().int(),
  totalChannels: z.number().int(),
  totalMembers: z.number().int(),
  incrementTotalStatsSent: z.boolean().optional(),
  game: z.enum(GAMES).optional(),
  language: z.enum(LANGUAGES).optional(),
});

export type BaseDataPayload = z.infer<typeof BaseDataPayloadSchema>;
