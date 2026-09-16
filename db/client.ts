/**
 * Database client (Phase 1, slice #1).
 *
 * Dev/CI driver: PGlite — real PostgreSQL 18 compiled to WASM, persisted to a
 * local data dir (default `.data/pg`, gitignored). Single-process lock: run
 * scripts (db:setup/db:reset/tests) with the dev server STOPPED.
 *
 * Production: swap this module to node-pg/postgres.js via DATABASE_URL —
 * the pg-core schema and all services stay unchanged. [ASUMSI-OTOMATIS]
 *
 * IMPORTANT: getDb() must never be called at module scope (Next builds pages
 * without a database; connections happen per request only).
 */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';

export type Db = PgliteDatabase<typeof schema>;
/** Transaction handle type (for helpers like withIdempotency). */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export const DEFAULT_DATA_DIR = '.data/pg';

declare global {
  // eslint-disable-next-line no-var -- globalThis singleton survives HMR re-imports
  var __apexDb: Db | undefined;
  var __apexPglite: PGlite | undefined;
}

function prepare(dataDir: string): PGlite {
  const abs = resolve(dataDir);
  mkdirSync(abs, { recursive: true });
  return new PGlite(abs);
}

export function getDb(): Db {
  if (!globalThis.__apexDb) {
    globalThis.__apexPglite = prepare(process.env.PGDATA_DIR || DEFAULT_DATA_DIR);
    globalThis.__apexDb = drizzle(globalThis.__apexPglite, { schema });
  }
  return globalThis.__apexDb;
}

/** Fresh handle for scripts/tests (caller owns close()). */
export function createDb(dataDir: string): { db: Db; close: () => Promise<void> } {
  const client = prepare(dataDir);
  const db = drizzle(client, { schema });
  return { db, close: () => client.close() };
}
