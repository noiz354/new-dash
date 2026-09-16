import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { can } from '@/lib/auth/rbac';
import { createFacility, listFacilities } from '@/lib/services/facility-service';

const CreateFacilitySchema = z.object({
  name: z.string().trim().min(2).max(160),
  // Raw GeoJSON geometry/feature JSON as text; server stores it verbatim.
  geojson: z.string().max(20_000).nullish(),
});

/** GET /api/facilities — live facility directory for the caller's tenant (GAP-20/F15). */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'facilities.list', method: 'GET', permission: 'facilities.read' }, req, async (ctx) => {
    const facilities = await listFacilities(getDb(), ctx!);
    return { data: { facilities, can: { manage: can(ctx!.role, 'facilities.manage') } } };
  });
}

/** POST /api/facilities — create a location (code derived server-side; geojson optional). */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'facilities.create', method: 'POST', permission: 'facilities.manage' }, req, async (ctx, requestId) => {
    const body = await req.json();
    const input = CreateFacilitySchema.parse(body);
    const key = req.headers.get('idempotency-key');
    const facility = await createFacility(getDb(), ctx!, input, { idempotencyKey: key, requestId });
    return { status: 201, data: facility };
  });
}
