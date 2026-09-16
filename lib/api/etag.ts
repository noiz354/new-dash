/**
 * HTTP ETag & Conditional Request Caching Engine (Phase 4 D.3).
 * Computes deterministic ETags for API payloads and evaluates If-None-Match headers.
 */
import { createHash } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';

export function computeEtag(data: unknown): string {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = createHash('sha1').update(jsonStr).digest('hex').slice(0, 16);
  return `"${hash}"`;
}

export function checkEtagMatch(req: NextRequest, etag: string): boolean {
  const ifNoneMatch = req.headers.get('if-none-match');
  if (!ifNoneMatch) return false;

  // Handle weak or multiple ETags: e.g. W/"123", "123"
  const tags = ifNoneMatch.split(',').map((t) => t.trim().replace(/^W\//, ''));
  const cleanEtag = etag.replace(/^W\//, '');
  return tags.includes(cleanEtag) || tags.includes('*');
}

export function createEtagResponse(
  req: NextRequest,
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): NextResponse {
  const etag = computeEtag(data);

  if (checkEtagMatch(req, etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': 'private, no-cache, must-revalidate',
        ...extraHeaders,
      },
    });
  }

  return NextResponse.json(data, {
    status,
    headers: {
      ETag: etag,
      'Cache-Control': 'private, no-cache, must-revalidate',
      ...extraHeaders,
    },
  });
}
