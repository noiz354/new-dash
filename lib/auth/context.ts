/**
 * Next-runtime session context: reads the session cookie and resolves the
 * tenant-scoped AuthContext from the DB. Used by layouts/pages/route handlers.
 * Returns null when unauthenticated OR when the database is unavailable
 * (fail closed → login redirect; the login API will surface the DB error).
 */
import { cookies } from 'next/headers';
import { getDb } from '../../db/client';
import { log } from '../log';
import { COOKIE_NAME, verifySession, type AuthContext } from './session';

export async function getSessionContext(): Promise<AuthContext | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySession(getDb(), token);
  } catch (err) {
    log('error', 'session_context_failed', { error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export { type AuthContext };
