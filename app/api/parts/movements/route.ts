import { NextRequest } from 'next/server';
import { z } from 'zod';
import { and, desc, eq, like } from 'drizzle-orm';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { auditEvents } from '@/db/schema';
import { mutateStock, verifyStepUpCode } from '@/lib/services/inventory-service';
import type { AuthContext } from '@/lib/auth/session';

const MutateStockSchema = z.object({
  sku: z.string().min(3).max(50),
  type: z.enum(['ISSUE', 'RECEIVE', 'ADJUST', 'RESERVE', 'RELEASE']),
  qty: z.number().int().positive(),
  refNumber: z.string().max(50).nullish(),
  reason: z.string().max(300).nullish(),
  stepUpCode: z.string().regex(/^\d{6}$/, 'Enter the 6-digit approver code from your authenticator app'),
});

/**
 * Step-up approval (GAP-3): every stock mutation must carry a fresh TOTP code
 * from the acting user's own authenticator, verified server-side. Replaces the
 * old client-side supervisor PIN ('2468').
 */
async function verifyStepUp(ctx: AuthContext, code: string): Promise<string> {
  return verifyStepUpCode(getDb(), ctx, code);
}

/** POST /api/parts/movements — real stock mutation (issue, receive, adjust); honors Idempotency-Key. Requires step-up TOTP. */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'inventory.mutate', method: 'POST', permission: 'inventory.mutate' }, req, async (ctx, requestId) => {
    const json = await req.json();
    const input = MutateStockSchema.parse(json);
    const stepUpAt = await verifyStepUp(ctx!, input.stepUpCode);
    const updated = await mutateStock(
      getDb(),
      ctx!,
      input,
      { idempotencyKey: req.headers.get('idempotency-key'), requestId, stepUpAt },
    );
    return {
      status: 200,
      data: updated,
    };
  });
}

export interface MovementFeedItem {
  kind: 'IN' | 'OUT' | 'ADJ';
  delta: string;
  doc: string;
  ts: string;
  part: string;
  detail: string;
}

const ACTION_KIND: Record<string, MovementFeedItem['kind']> = {
  PART_RECEIVE: 'IN',
  PART_ISSUE: 'OUT',
  PART_ADJUST: 'ADJ',
  PART_RESERVE: 'ADJ',
  PART_RELEASE: 'ADJ',
};

/** GET /api/parts/movements — recent stock movements derived from PART_* audit events (no separate ledger table). */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'inventory.movements', method: 'GET', permission: 'inventory.read' }, req, async (ctx) => {
    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
    const rows = await getDb()
      .select()
      .from(auditEvents)
      .where(and(eq(auditEvents.organizationId, ctx!.orgId), like(auditEvents.action, 'PART\\_%')))
      .orderBy(desc(auditEvents.ts), desc(auditEvents.id))
      .limit(limit);
    const movements: MovementFeedItem[] = rows.map((r) => {
      const before = (r.before ?? {}) as { onHand?: number };
      const after = (r.after ?? {}) as { onHand?: number; ref?: string | null; reason?: string | null };
      const diff = (after.onHand ?? 0) - (before.onHand ?? 0);
      return {
        kind: ACTION_KIND[r.action] ?? 'ADJ',
        delta: `${diff >= 0 ? '+' : '−'}${Math.abs(diff)} ea`,
        doc: after.ref ?? r.entityId ?? r.action,
        ts: r.ts instanceof Date ? r.ts.toISOString() : String(r.ts),
        part: r.entityId ?? '',
        detail: [after.reason, `by ${r.actorName}`].filter(Boolean).join(' · '),
      };
    });
    return { data: { movements } };
  });
}
