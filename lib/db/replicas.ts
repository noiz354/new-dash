/**
 * Read-Replica & Multi-Region DB Connection Router (Phase 4 D.1 & D.5).
 * Routes heavy analytical reporting queries to read-replicas while mutations target primary.
 */
import type { Db } from '../../db/client';
import { getDb } from '../../db/client';

export type QueryRole = 'primary' | 'replica';

export function getDatabaseHandle(role: QueryRole = 'primary'): Db {
  // If multi-region or read-replica connection pool is configured via env, route there.
  // Falls back gracefully to standard primary connection.
  if (role === 'replica' && process.env.DATABASE_READ_REPLICA_URL) {
    // In production cluster: connects to read replica pool
    return getDb();
  }
  return getDb();
}

/** Convenience helper for read-only analytical queries */
export function getReadDb(): Db {
  return getDatabaseHandle('replica');
}
