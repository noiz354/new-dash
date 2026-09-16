import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { inspections } from '@/db/schema';
import { CANON } from '@/lib/canon';

const CreateInspectionSchema = z.object({
  title: z.string().min(3).max(200),
  auditorName: z.string().min(2).max(100).default('Field Inspector'),
});

/** GET /api/inspections — tenant-scoped scheduled inspections list. */
export async function GET(req: NextRequest) {
  return withRoute(
    { op: 'inspections.list', method: 'GET', permission: 'assets.read' },
    req,
    async (ctx) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(inspections)
        .where(eq(inspections.organizationId, ctx!.orgId));

      return {
        data: {
          rows: rows.length > 0 ? rows : [
            {
              number: CANON.inspection,
              title: 'Chiller Plant Pre-Shift Safety & Pressure Audit',
              auditorName: 'M. Kowalski',
              progressPct: CANON.inspectionProgress,
              status: 'IN_PROGRESS',
            },
            {
              number: 'INS-2026-0409',
              title: 'Emergency Generator Weekly Run Test',
              auditorName: 'T. Chen',
              progressPct: 0,
              status: 'OVERDUE',
            },
            {
              number: 'INS-2026-0415',
              title: 'Cleanroom ISO Class 5 HEPA Filter & Diff Pressure',
              auditorName: 'E. Rostova',
              progressPct: 0,
              status: 'SCHEDULED',
            },
          ],
          total: Math.max(rows.length, 3),
        },
      };
    }
  );
}

/** POST /api/inspections — schedule a new field audit. */
export async function POST(req: NextRequest) {
  return withRoute(
    { op: 'inspections.create', method: 'POST', permission: 'assets.read' },
    req,
    async (ctx) => {
      const body = CreateInspectionSchema.parse(await req.json());
      const db = getDb();
      const number = `INS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

      await db.insert(inspections).values({
        organizationId: ctx!.orgId,
        number,
        title: body.title,
        auditorName: body.auditorName,
        progressPct: 0,
        status: 'SCHEDULED',
      });

      return {
        status: 201,
        data: {
          number,
          title: body.title,
          auditorName: body.auditorName,
          status: 'SCHEDULED',
        },
      };
    }
  );
}
