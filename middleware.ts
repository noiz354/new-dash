import { NextResponse, type NextRequest } from 'next/server';

/**
 * First-gate guard: cheap cookie-presence check → redirect to /login.
 * NOT the authorization boundary — real session verification (DB) happens in
 * the (ops)/(field) layouts and in every API route via withRoute(). This keeps
 * middleware dependency-free (no DB import) and edge-safe.
 * Cookie name must match lib/auth/session.ts COOKIE_NAME.
 */
const SESSION_COOKIE = 'apex_session';

const PUBLIC_PREFIXES = ['/login', '/api'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static assets
  ) {
    return NextResponse.next();
  }
  if (!req.cookies.has(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
