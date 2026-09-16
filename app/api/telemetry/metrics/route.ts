import type { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getRedMetrics } from '@/lib/telemetry/metrics';

/**
 * GET /api/telemetry/metrics
 * Exposes real Rate, Errors, and Duration (RED) APM metrics (Phase 2 B.3).
 */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'telemetry.metrics', method: 'GET', permission: 'audit.read' }, req, async () => {
    const metrics = getRedMetrics();
    return { data: metrics };
  });
}
