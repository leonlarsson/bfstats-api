import { standard500ResponseSchema } from "../schemas/responses";

export const standard500Response = {
  description: "Something went wrong",
  content: {
    "application/json": {
      schema: standard500ResponseSchema,
    },
  },
};
