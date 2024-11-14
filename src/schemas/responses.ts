import { z } from "zod";

export const standard500ResponseSchema = z.object({
  message: z.string().openapi({ description: "The error message.", example: "Something went wrong." }),
  error: z.any().optional(),
});

export const standardCreatedResponseSchema = z.literal("ok");
