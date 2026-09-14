/**
 * Sessions — opaque 256-bit random token in an httpOnly cookie; the DB stores
 * only sha256(token) so a database leak does not hand out live sessions.
 * 7-day absolute expiry, throttled last_seen touch (audit §6).
 */
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { organizations, sessions, users } from '../../db/schema';
import type { Role } from './rbac';

export const COOKIE_NAME = 'apex_session'; // keep in sync with middleware.ts
export const SESSION_TTL_DAYS = 7;

export interface AuthContext {
  userId: string;
  orgId: string;
  orgName: string;
  role: Role;
  name: string;
  initials: string;
  title: string;
  email: string;
}

export function sessionCookieOptions(): {
  httpOnly: true; sameSite: 'lax'; secure: boolean; path: '/'; maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function createSession(
  db: Db,
  userId: string,
  organizationId: string,
  userAgent?: string | null,
): Promise<string> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    idHash: hashToken(token),
    userId,
    organizationId,
    expiresAt,
    userAgent: userAgent ?? null,
  });
  return token;
}

export async function verifySession(db: Db, token: string | undefined | null): Promise<AuthContext | null> {
  if (!token) return null;
  const rows = await db
    .select({
      session: sessions,
      user: { id: users.id, name: users.name, initials: users.initials, title: users.title, email: users.email, role: users.role, isActive: users.isActive },
      org: { id: organizations.id, name: organizations.name },
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(organizations, eq(organizations.id, sessions.organizationId))
    .where(and(eq(sessions.idHash, hashToken(token)), sql`${sessions.expiresAt} > now()`))
    .limit(1);
  const row = rows[0];
  if (!row || !row.user.isActive) return null;
  // Throttled presence touch (max once per minute per session).
  const lastSeen = row.session.lastSeenAt.getTime();
  if (Date.now() - lastSeen > 60_000) {
    await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.idHash, row.session.idHash));
  }
  return {
    userId: row.user.id,
    orgId: row.org.id,
    orgName: row.org.name,
    role: row.user.role as Role,
    name: row.user.name,
    initials: row.user.initials,
    title: row.user.title,
    email: row.user.email,
  };
}

export async function revokeSession(db: Db, token: string | undefined | null): Promise<void> {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.idHash, hashToken(token)));
}
