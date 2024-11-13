import { z } from "zod";

export const UserPayloadSchema = z.object({
  userId: z.string(),
  username: z.string(),
  language: z.string(),
});

export type UserPayload = z.infer<typeof UserPayloadSchema>;
