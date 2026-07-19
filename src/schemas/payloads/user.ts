import { z } from "zod";

export const UserPayloadSchema = z
  .object({
    userId: z.string(),
    username: z.string(),
    language: z.string(),
  })
  .openapi({
    description: "The user to create",
    example: {
      userId: "99182302885588992",
      username: "mozzy",
      language: "English",
    },
  });

export type UserPayload = z.infer<typeof UserPayloadSchema>;

export const UserSearchPayloadSchema = z
  .object({
    game: z.string(),
    username: z.string(),
    platform: z.string(),
  })
  .openapi({
    description: "The search to record",
    example: {
      game: "bf6",
      username: "MozzyFX",
      platform: "origin",
    },
  });

export type UserSearchPayload = z.infer<typeof UserSearchPayloadSchema>;
