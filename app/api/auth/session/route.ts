import type { NextRequest } from 'next/server';
import { withRoute, DomainError } from '@/lib/api/http';

/** GET /api/auth/session — current tenant-scoped session user (401 if none). */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'auth.session', method: 'GET', public: true }, req, async (ctx) => {
    if (!ctx) throw new DomainError(401, 'UNAUTHENTICATED', 'No active session');
    return { data: { user: ctx } };
  });
}
