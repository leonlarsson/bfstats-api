# bfstats-api

## Database migrations

Database schema changes are managed with **Wrangler D1 migrations**, not `drizzle-kit push`/`pull` (those are set up in [drizzle.config.ts](drizzle.config.ts) but don't work reliably against this D1 setup, see the comment there). Migration files live in [src/db/migrations](src/db/migrations) and are tracked via `migrations_dir` in [wrangler.jsonc](wrangler.jsonc).

To make a schema change (e.g. adding a column to `outputs`):

1. Create a new migration file:
   ```
   npm run db:migration:new -- <short_description>
   ```
   This creates a numbered file like `src/db/migrations/0006_short_description.sql`.

2. Write the SQL by hand, e.g.:
   ```sql
   ALTER TABLE outputs ADD COLUMN new_column TEXT;
   ```

3. Update [src/db/schema.ts](src/db/schema.ts) to match. Add the corresponding field to the relevant `sqliteTable` definition so Drizzle's types and queries match the real table.

4. Apply the migration:
   ```
   npm run db:migration:apply
   ```
   for the local dev database, or
   ```
   npm run db:migration:apply:remote
   ```
   to apply it to the production D1 database.

5. To let the API write the column, add it to `OutputPayloadSchema` in [src/schemas/payloads/output.ts](src/schemas/payloads/output.ts) using the same key name. Nothing catches it if you forget, the column just stays null on every insert.

6. To expose it on the public output endpoints, add it to `OUTPUT_SUMMARY_COLUMNS` in [src/schemas/entities/output.ts](src/schemas/entities/output.ts), which covers both the query and the response schema.

## Data redaction

User data redactions are done via `POST /users/{discordId}/redact`. Verify identity on Discord first.

Cloudflare retains D1 and DO data for PITR for 30 days.

The response reports what was removed, counted before the writes.

`outputs` and `users` rows are kept but `user_id` and `username` are anonymized. Guild and URL columns are cleared. The user's Durable Object, linked accounts and searches, is wiped. An `events` row records the redaction without the ID.

One token per redaction, so `SELECT ... WHERE user_id = '<token>'` finds that redaction's rows again, but no direct identifiers are left. Should the user start using the bot again, new data will be recorded fresh.
