import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DB_ID!,
    token: process.env.CLOUDFLARE_D1_HTTP_API_TOKEN!,
  },
  // Have to use this for npm run db:sync (which doesn't seem to work anyway. I am using migrattions with Wrangler instead)
  // tablesFilter: ["/^(?!.*_cf_KV).*$/"],
  casing: "snake_case",
  strict: true,
  verbose: true,
});
