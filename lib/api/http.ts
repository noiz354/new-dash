/**
 * API route plumbing (audit §G/§13):
 * - one structured log line per request (requestId, op, status, duration,
 *   user/org — never secrets),
 * - uniform JSON envelope: {ok:true,data} | {ok:false,error:{code,message,...}},
 * - session + RBAC enforcement server-side (401/403),
 * - CSRF: Origin vs Host check on mutations (cookies are SameSite=Lax),
 * - ZodError → 400 VALIDATION_ERROR, DomainError → its status, else 500
 *   (stack never leaks to the client).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getDb } from '../../db/client';
import { log, newRequestId } from '../log';
import { getSessionContext, type AuthContext } from '../auth/context';
import { can, type Permission } from '../auth/rbac';
import { DomainError } from '../domain/errors';

export { DomainError };

export interface RouteMeta {
  op: string;
  method: string;
  /** Omit for public routes (login/mfa/health). */
  permission?: Permission;
  public?: boolean;
}

export interface RouteResult<T> {
  status?: number;
  data: T;
  /** Set/clear cookies on the envelope response (auth routes). */
  setCookie?: { name: string; value: string; options: Record<string, unknown> } | null;
  clearCookie?: string | null;
}

export type RouteHandler<T> = (ctx: AuthContext | null, requestId: string) => Promise<RouteResult<T>>;

function csrfFailure(req: NextRequest): boolean {
  if (req.method === 'GET' || req.method === 'HEAD') return false;
  const origin = req.headers.get('origin');
  if (!origin) return false; // non-browser clients; SameSite=Lax already blocks cross-site cookies
  const host = req.headers.get('host');
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export async function withRoute<T>(
  meta: RouteMeta,
  req: NextRequest,
  handler: RouteHandler<T>,
): Promise<NextResponse> {
  const requestId = newRequestId();
  const started = Date.now();
  const path = new URL(req.url).pathname;

  const finish = (status: number, body: unknown, extra: Record<string, unknown> = {}) => {
    log(status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info', 'api_request', {
      requestId, op: meta.op, method: meta.method, path, status,
      durationMs: Date.now() - started, ...extra,
    });
    return NextResponse.json(body, { status, headers: { 'x-request-id': requestId } });
  };

  try {
    if (csrfFailure(req)) {
      return finish(403, { ok: false, error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'Cross-origin mutation rejected', requestId } });
    }

    let ctx: AuthContext | null = null;
    try {
      ctx = await getSessionContext();
    } catch {
      ctx = null;
    }

    if (!meta.public) {
      if (!ctx) {
        return finish(401, { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required', requestId } });
      }
      if (meta.permission && !can(ctx.role, meta.permission)) {
        return finish(403, {
          ok: false,
          error: { code: 'FORBIDDEN', message: `Role '${ctx.role}' lacks permission '${meta.permission}'`, requestId },
        }, { userId: ctx.userId, orgId: ctx.orgId, errorCode: 'FORBIDDEN' });
      }
    }

    const result = await handler(ctx, requestId);
    const response = finish(result.status ?? 200, { ok: true, data: result.data }, ctx ? { userId: ctx.userId, orgId: ctx.orgId } : {});
    if (result.setCookie) {
      response.cookies.set(result.setCookie.name, result.setCookie.value, result.setCookie.options as never);
    }
    if (result.clearCookie) {
      response.cookies.set(result.clearCookie, '', { path: '/', maxAge: 0 });
    }
    return response;
  } catch (err) {
    if (err instanceof ZodError) {
      return finish(400, {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: err.issues, requestId },
      }, { errorCode: 'VALIDATION_ERROR' });
    }
    if (err instanceof DomainError) {
      return finish(err.status, {
        ok: false,
        error: { code: err.code, message: err.message, details: err.details, requestId },
      }, { errorCode: err.code });
    }
    log('error', 'api_unhandled', { requestId, op: meta.op, path, error: err instanceof Error ? err.stack : String(err) });
    return finish(500, { ok: false, error: { code: 'INTERNAL', message: 'Unexpected server error', requestId } }, { errorCode: 'INTERNAL' });
  }
}

/** Convenience: the request-scoped DB (fails fast with 503 when unavailable). */
export function requireDb() {
  return getDb();
}
