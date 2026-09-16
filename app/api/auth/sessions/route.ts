import type { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { auditEvents } from '@/db/schema';
import { listUserSessions, revokeAllUserSessions, COOKIE_NAME } from '@/lib/auth/session';

/** GET /api/auth/sessions — list active sessions for the current user */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'auth.sessions.list', method: 'GET' }, req, async (ctx) => {
    const sessionsList = await listUserSessions(getDb(), ctx!.userId, ctx!.orgId);
    return { data: sessionsList };
  });
}

/** POST /api/auth/sessions — revoke all sessions ("sign out all devices") */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'auth.sessions.revoke_all', method: 'POST' }, req, async (ctx) => {
    const db = getDb();
    const revokedCount = await revokeAllUserSessions(db, ctx!.userId, ctx!.orgId);

    await db.insert(auditEvents).values({
      organizationId: ctx!.orgId,
      actorUserId: ctx!.userId,
      actorName: ctx!.name,
      action: 'AUTH_SESSIONS_REVOKE_ALL',
      entityType: 'auth',
      entityId: ctx!.userId,
      after: { revokedCount },
    });

    return {
      data: { status: 'revoked_all', revokedCount },
      clearCookie: COOKIE_NAME,
    };
  });
}
