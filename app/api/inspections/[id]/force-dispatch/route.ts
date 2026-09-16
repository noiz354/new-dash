import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { inspections } from '@/db/schema';

/** POST /api/inspections/[id]/force-dispatch — escalates and dispatches an overdue inspection. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withRoute(
    { op: 'inspections.force_dispatch', method: 'POST', permission: 'assets.read' },
    req,
    async (ctx) => {
      const db = getDb();
      await db
        .update(inspections)
        .set({ status: 'IN_PROGRESS', progressPct: 0 })
        .where(
          and(eq(inspections.organizationId, ctx!.orgId), eq(inspections.number, id))
        );

      return {
        data: {
          number: id,
          status: 'IN_PROGRESS',
          dispatchedAt: new Date().toISOString(),
        },
      };
    }
  );
}
