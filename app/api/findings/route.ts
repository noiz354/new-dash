import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { CANON } from '@/lib/canon';

const CreateFindingSchema = z.object({
  title: z.string().min(3),
  assetCode: z.string().min(3),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  zone: z.string().optional(),
  description: z.string().optional(),
});

const SEEDED_FINDINGS = [
  {
    id: CANON.finding,
    title: 'Severe R-134a Refrigerant Shaft Seal Leak (18.4 ppm breach)',
    assetCode: CANON.assetSeal,
    severity: 'CRITICAL',
    zone: 'Basement Mech Room B-204',
    status: 'PENDING_TRIAGE',
  },
  {
    id: 'FND-2026-0185',
    title: 'Emergency Starter Battery Bank Float Voltage Low (21.4 VDC)',
    assetCode: 'AST-GEN-01',
    severity: 'HIGH',
    zone: 'Sub-Basement Vault #02',
    status: 'CONVERTED',
  },
  {
    id: 'FND-2026-0182',
    title: 'Static Differential Pressure Across Stage 2 Filter Bank High',
    assetCode: 'AST-ENV-108',
    severity: 'MEDIUM',
    zone: 'Clean Lab Annex 4',
    status: 'PENDING_TRIAGE',
  },
];

/** GET /api/findings — list inspection findings. */
export async function GET(req: NextRequest) {
  return withRoute(
    { op: 'findings.list', method: 'GET', permission: 'assets.read' },
    req,
    async () => {
      return {
        data: {
          rows: SEEDED_FINDINGS,
          total: SEEDED_FINDINGS.length,
        },
      };
    }
  );
}

/** POST /api/findings — capture a new inspection finding. */
export async function POST(req: NextRequest) {
  return withRoute(
    { op: 'findings.create', method: 'POST', permission: 'assets.read' },
    req,
    async (ctx) => {
      const body = CreateFindingSchema.parse(await req.json());
      const findingId = `FND-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

      return {
        status: 201,
        data: {
          id: findingId,
          ...body,
          status: 'PENDING_TRIAGE',
          capturedAt: new Date().toISOString(),
          tenantId: ctx!.orgId,
        },
      };
    }
  );
}
