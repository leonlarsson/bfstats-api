import { z } from "zod";

export const standard500ResponseSchema = z.object({
  message: z.string(),
  error: z.any().optional(),
});

export const standardCreatedResponseSchema = z.literal("ok");
