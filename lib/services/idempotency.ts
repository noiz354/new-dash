/**
 * Idempotency (audit §9) — MUST run inside the caller's transaction so the
 * stored response commits atomically with the mutation it describes.
 *
 * Semantics:
 *  - no key          → execute normally (client opted out),
 *  - unseen key      → execute, store (org,key,scope,requestHash,response),
 *  - seen key, same
 *    request hash    → replay stored response (no re-execution),
 *  - seen key, diff
 *    request hash    → 422 IDEMPOTENCY_KEY_REUSED (client bug/attack).
 */
import { createHash } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { Tx } from '../../db/client';
import { idempotencyKeys } from '../../db/schema';
import { DomainError } from '../domain/errors';

/** Canonical JSON (recursively key-sorted) so logically identical request
 *  bodies with different key order hash the same — replay stays a replay. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) out[k] = canonical(src[k]);
    return out;
  }
  return value;
}

export function requestHash(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(canonical(body ?? null))).digest('hex');
}

export interface IdempotentResult<T> {
  status: number;
  body: T;
  replayed: boolean;
}

export async function withIdempotency<T>(
  tx: Tx,
  orgId: string,
  key: string | null | undefined,
  scope: string,
  reqHash: string,
  fn: () => Promise<{ status?: number; body: T }>,
): Promise<IdempotentResult<T>> {
  if (!key) {
    const r = await fn();
    return { status: r.status ?? 200, body: r.body, replayed: false };
  }
  const existing = await tx
    .select()
    .from(idempotencyKeys)
    .where(and(eq(idempotencyKeys.organizationId, orgId), eq(idempotencyKeys.key, key)))
    .limit(1);
  if (existing[0]) {
    if (existing[0].requestHash !== reqHash || existing[0].scope !== scope) {
      throw new DomainError(422, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency-Key was already used with a different request');
    }
    return { status: existing[0].responseStatus, body: existing[0].responseBody as T, replayed: true };
  }
  const r = await fn();
  const status = r.status ?? 200;
  await tx.insert(idempotencyKeys).values({
    organizationId: orgId,
    key,
    scope,
    requestHash: reqHash,
    responseStatus: status,
    responseBody: r.body as never,
  });
  return { status, body: r.body, replayed: false };
}
