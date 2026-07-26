import { outputs } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";

// A row in the outputs table. Shape and nullability come from the table, the refinements only add OpenAPI docs.
export const OutputSchema = createSelectSchema(outputs, {
  userId: (schema) => schema.userId.openapi({ description: "The user's Discord ID.", example: "99182302885588992" }),
  username: (schema) => schema.username.openapi({ description: "The user's Discord username.", example: "mozzy" }),
  game: (schema) => schema.game.openapi({ description: "The game the output is from.", example: "Battlefield 2042" }),
  segment: (schema) => schema.segment.openapi({ description: "The segment the output is from.", example: "Weapons" }),
  language: (schema) => schema.language.openapi({ description: "The language of the output.", example: "English" }),
  date: (schema) =>
    schema.date.openapi({ description: "The date the output was created.", example: "2024-03-22 10:27:30" }),
  identifier: (schema) =>
    schema.identifier.openapi({ description: "The full identifier of the output.", example: "YImDLDbrfXO1KgTULW" }),
  isMyStats: (schema) =>
    schema.isMyStats.openapi({
      description: "Whether the output was generated via a /game mystats command.",
      example: true,
    }),
  platform: (schema) =>
    schema.platform.openapi({ description: "The platform the stats were requested on.", example: "origin" }),
  format: (schema) => schema.format.openapi({ description: "The format of the output.", example: "image_art" }),
  paginationPage: (schema) =>
    schema.paginationPage.positive().openapi({ description: "The page that was requested. For array-based stats." }),
  sortKey: (schema) =>
    schema.sortKey.openapi({ description: "The sort key used. For array-based stats.", example: "kills" }),
  chainIdentifier: (schema) =>
    schema.chainIdentifier.openapi({
      description:
        "The identifier for the command pagination chain. Groups outputs across pagination and sort key changes.",
      example: "IiNS5QYqEPsLp_0SUR-oB",
    }),
});

// Any subset of the outputs columns. Checked against the table so a typo fails here.
type OutputColumnMask = Partial<Record<keyof typeof outputs.$inferSelect, true>>;

// The columns every public output endpoint returns. Used as the query selection and the response schema, so they match.
export const OUTPUT_SUMMARY_COLUMNS = {
  game: true,
  segment: true,
  language: true,
  date: true,
  identifier: true,
  format: true,
  paginationPage: true,
  sortKey: true,
  chainIdentifier: true,
} as const satisfies OutputColumnMask;

export const OutputSummarySchema = OutputSchema.pick(OUTPUT_SUMMARY_COLUMNS);
