import type { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import {
  RETENTION_DIGEST_NOTE,
  RETENTION_DIGEST_SUNSET,
  generateRetentionDigest,
} from '@/lib/services/retention-service';

/**
 * GET /api/retention/digest
 * Generates proactive operational digest: imminent SLA breaches & upcoming PM schedules (Phase 3 C.5).
 *
 * @deprecated GAP-19/F25 (decision 2026-09-16): this endpoint is an orphan with
 * no trigger, scheduler, cron, or consumer — and will not be developed further.
 * It stays live (200, `wo.read` enforced) carrying `deprecated`, `sunset`, and
 * `note` metadata until removal after sunset 2026-12-15. Do NOT build new
 * consumers against it.
 */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'retention.digest', method: 'GET', permission: 'wo.read' }, req, async (ctx) => {
    const digest = await generateRetentionDigest(getDb(), ctx!.orgId);
    // Deprecated response envelope (F25): compute unchanged, flags surfaced.
    return {
      data: {
        ...digest,
        deprecated: true,
        sunset: RETENTION_DIGEST_SUNSET,
        note: RETENTION_DIGEST_NOTE,
      },
    };
  });
}
