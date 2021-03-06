import { z } from "zod";

const games = ["Battlefield 2042", "Battlefield V", "Battlefield 1", "Battlefield Hardline", "Battlefield 4", "Battlefield 3", "Battlefield Bad Company 2", "Battlefield 2"] as const;
const languages = ["English", "French", "Italian", "German", "Spanish", "Russian", "Polish", "Brazilian Portuguese", "Turkish", "Swedish", "Norwegian", "Finnish", "Arabic"] as const;

export type ReceivedBody = z.infer<typeof ReceivedBodySchema>;
export const ReceivedBodySchema = z.object({
    totalGuilds: z.number().int(),
    totalChannels: z.number().int(),
    totalMembers: z.number().int(),
    incrementTotalStatsSent: z.boolean().optional(),
    game: z.enum(games).optional(),
    language: z.enum(languages).optional()
});

export type StatsObject = z.infer<typeof StatsObjectSchema>;
export const StatsObjectSchema = z.object({
    totalGuilds: z.number().int(),
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
            "Battlefield 2": z.number().int()
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
            Arabic: z.number().int()
        })
    }),
    lastUpdated: z.object({
        date: z.string(),
        timestampMilliseconds: z.number().int(),
        timestampSeconds: z.number().int()
    })
});