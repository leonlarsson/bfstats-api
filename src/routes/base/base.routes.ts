import { createRoute } from "@hono/zod-openapi";
import { authentication } from "../../middleware/authentication";
import { BaseDataSchema } from "../../schemas/entities/base";
import { BaseDataPayloadSchema } from "../../schemas/payloads/base";
import { standard200Or201Response, standard500Response } from "../../utils/openApiStandards";

const tags = ["Base"];

export const getData = createRoute({
  method: "get",
  path: "/base",
  tags,
  summary: "Get base",
  description: "Get the base usage stats.",
  responses: {
    200: {
      description: "The base usage stats",
      content: {
        "application/json": {
          schema: BaseDataSchema,
        },
      },
    },
    500: standard500Response,
  },
});

export const updateData = createRoute({
  method: "post",
  path: "/base",
  tags,
  middleware: [authentication],
  summary: "Post base",
  description: "Post the base usage stats",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BaseDataPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: standard200Or201Response,
    500: standard500Response,
  },
});

export type GetDataRoute = typeof getData;
export type UpdateDataRoute = typeof updateData;
