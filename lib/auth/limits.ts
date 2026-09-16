/**
 * Rate limiting — in-memory sliding window (single instance).
 * [ASUMSI-OTOMATIS] Adequate for dev/CI and one-node prod; swap to Redis or
 * DB-backed counters before horizontal scaling (audit §6 brute-force).
 * MFA attempts are limited separately per challenge in the DB (max 5).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Test hook — clears all buckets. */
export function _resetLimits(): void {
  buckets.clear();
}
