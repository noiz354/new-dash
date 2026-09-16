import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { mutateStock } from '@/lib/services/inventory-service';

const MutateStockSchema = z.object({
  sku: z.string().min(3).max(50),
  type: z.enum(['ISSUE', 'RECEIVE', 'ADJUST', 'RESERVE', 'RELEASE']),
  qty: z.number().int().positive(),
  refNumber: z.string().max(50).nullish(),
  reason: z.string().max(300).nullish(),
});

/** POST /api/parts/movements — real stock mutation (issue, receive, adjust); honors Idempotency-Key. */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'inventory.mutate', method: 'POST', permission: 'inventory.mutate' }, req, async (ctx, requestId) => {
    const json = await req.json();
    const input = MutateStockSchema.parse(json);
    const updated = await mutateStock(
      getDb(),
      ctx!,
      input,
      { idempotencyKey: req.headers.get('idempotency-key'), requestId },
    );
    return {
      status: 200,
      data: updated,
    };
  });
}
