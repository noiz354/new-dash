import type { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { generateRetentionDigest } from '@/lib/services/retention-service';

/**
 * GET /api/retention/digest
 * Generates proactive operational digest: imminent SLA breaches & upcoming PM schedules (Phase 3 C.5).
 */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'retention.digest', method: 'GET', permission: 'wo.read' }, req, async (ctx) => {
    const digest = await generateRetentionDigest(getDb(), ctx!.orgId);
    return { data: digest };
  });
}
