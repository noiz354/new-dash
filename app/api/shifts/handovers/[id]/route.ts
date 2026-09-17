import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { decideHandover } from '@/lib/services/handover-service';

const DecideSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().max(500).nullish(),
});

/** POST /api/shifts/handovers/[id] — terminal decision: accept | reject
 *  (reject requires reason >=3 chars → 400 REASON_REQUIRED; deciding a
 *  terminal row again → 409 HANDOVER_TERMINAL). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRoute({ op: 'handover.decide', method: 'POST', permission: 'shifts.manage' }, req, async (ctx, requestId) => {
    const { id } = await params;
    // SDD T1-3: malformed (non-uuid) ids are rejected with an honest 400 by the
    // service (UUID_RE guard) before any DB lookup — no more 500 INTERNAL.
    const body = await req.json();
    const input = DecideSchema.parse(body);
    const idem = req.headers.get('idempotency-key');
    const row = await decideHandover(getDb(), ctx!, id, { action: input.action, reason: input.reason ?? null }, { idempotencyKey: idem, requestId });
    return { data: row };
  });
}
