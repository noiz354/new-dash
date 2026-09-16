import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { dismissFinding } from '@/lib/services/inspection-service';

const DismissFindingSchema = z.object({
  justification: z.string().min(10).max(1000),
});

/** POST /api/findings/[id]/dismiss — dismiss with written justification (min 10 chars) */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return withRoute({ op: 'finding.dismiss', method: 'POST', permission: 'finding.dismiss' }, req, async (ctx, requestId) => {
    const body = await req.json();
    const input = DismissFindingSchema.parse(body);

    const res = await dismissFinding(
      getDb(),
      ctx!,
      id,
      input,
      { requestId },
    );

    return {
      status: 200,
      data: res,
    };
  });
}
