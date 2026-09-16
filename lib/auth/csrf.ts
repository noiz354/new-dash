/**
 * Session Anti-CSRF Token Provider (Phase 1 A.13).
 * Double-submit cookie & header verification bound to user session ID.
 */
import { createHmac, timingSafeEqual } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'apexops-csrf-secret-dev-key-salt-99';

export function createCsrfToken(sessionId: string): string {
  const timestamp = Date.now().toString(36);
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(`${sessionId}:${timestamp}`);
  const signature = hmac.digest('hex').slice(0, 32);
  return `${timestamp}.${signature}`;
}

export function verifyCsrfToken(token: string, sessionId: string, maxAgeMs = 24 * 3600 * 1000): boolean {
  if (!token || !sessionId) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 36);
  if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
    return false; // Token expired
  }

  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(`${sessionId}:${timestampStr}`);
  const expectedSignature = hmac.digest('hex').slice(0, 32);

  try {
    return timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'));
  } catch {
    return false;
  }
}
