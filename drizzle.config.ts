import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit config — used OFFLINE to generate SQL migrations from
 * db/schema.ts (`npm run db:generate`). Applying migrations happens in
 * db/setup.ts via drizzle-orm/pglite/migrator (no credentials needed here).
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  strict: true,
  verbose: true,
});
