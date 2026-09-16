import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { withRoute, DomainError } from '@/lib/api/http';
import { getDb } from '@/db/client';

/** GET /api/health — liveness + database reachability (real check). */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'health', method: 'GET', public: true }, req, async () => {
    try {
      await getDb().execute(sql`select 1`);
      return { data: { ok: true, db: true } };
    } catch (err) {
      throw new DomainError(503, 'DB_UNAVAILABLE', 'Database is not reachable', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
