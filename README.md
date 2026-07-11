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
