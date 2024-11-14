import { standard500ResponseSchema, standardCreatedResponseSchema } from "@/schemas/responses";

export const standard500Response = {
  description: "Something went wrong",
  content: {
    "application/json": {
      schema: standard500ResponseSchema,
    },
  },
};

export const standard200Or201Response = {
  description: "Success",
  content: {
    "application/json": {
      schema: standardCreatedResponseSchema,
    },
  },
};
