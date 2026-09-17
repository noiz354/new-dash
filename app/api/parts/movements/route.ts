import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { listMovements, mutateStock, verifyStepUpCode } from '@/lib/services/inventory-service';
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
  RECEIVE: 'IN',
  ISSUE: 'OUT',
  ADJUST: 'ADJ',
  RESERVE: 'ADJ',
  RELEASE: 'ADJ',
};

/**
 * GET /api/parts/movements — T4-15: recent stock movements read from the
 * part_movements ledger table (tenant-scoped, newest first). Contract
 * unchanged: the UI merges these rows the same way as the old audit-derived
 * feed (kind/delta/doc/ts/part/detail).
 */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'inventory.movements', method: 'GET', permission: 'inventory.read' }, req, async (ctx) => {
    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 50;
    const rows = await listMovements(getDb(), ctx!, { limit });
    const movements: MovementFeedItem[] = rows.map((r) => {
      const diff = r.afterOnHand - r.beforeOnHand;
      return {
        kind: ACTION_KIND[r.type] ?? 'ADJ',
        delta: `${diff >= 0 ? '+' : '−'}${Math.abs(diff)} ea`,
        doc: r.refNumber ?? r.sku,
        ts: r.createdAt,
        part: r.sku,
        detail: [r.reason, `by ${r.actorName}`].filter(Boolean).join(' · '),
      };
    });
    return { data: { movements } };
  });
}
