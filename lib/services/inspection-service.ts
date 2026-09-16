/**
 * Field Inspections & Defect Findings service (Phase 1 Slice 6).
 * Manages scheduled inspection checklists and one-time transactional
 * conversion of critical defect findings into dispatched Work Orders.
 */
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { Db, Tx } from '../../db/client';
import { auditEvents, findings, inspections, workOrderEvents, workOrders } from '../../db/schema';
import type { AuthContext } from '../auth/session';
import { DomainError, notFound } from '../domain/errors';
import { SLA_WINDOW_MS, slaLabel } from '../domain/work-orders';
import type { WoRow } from './wo-service';
import { requestHash, withIdempotency } from './idempotency';
import { nextNumber } from './sequence';

export interface InspectionRow {
  number: string;
  title: string;
  auditorName: string;
  progressPct: number;
  status: string;
  createdAt: string;
}

export interface FindingRow {
  number: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR';
  status: 'OPEN' | 'CONVERTED' | 'DISMISSED';
  inspectionNumber: string | null;
  assetCode: string | null;
  convertedWoNumber: string | null;
  createdAt: string;
}

export async function listInspections(db: Db, ctx: AuthContext): Promise<InspectionRow[]> {
  const rows = await db
    .select()
    .from(inspections)
    .where(eq(inspections.organizationId, ctx.orgId))
    .orderBy(desc(inspections.createdAt));

  return rows.map((r) => ({
    number: r.number,
    title: r.title,
    auditorName: r.auditorName,
    progressPct: r.progressPct,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getInspection(db: Db, ctx: AuthContext, number: string): Promise<InspectionRow> {
  const rows = await db
    .select()
    .from(inspections)
    .where(and(eq(inspections.organizationId, ctx.orgId), eq(inspections.number, number)))
    .limit(1);

  if (!rows[0]) throw notFound('INSPECTION', number);
  const r = rows[0];
  return {
    number: r.number,
    title: r.title,
    auditorName: r.auditorName,
    progressPct: r.progressPct,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export interface CreateInspectionInput {
  title: string;
  auditorName?: string;
  year?: number;
}

export async function createInspection(
  db: Db,
  ctx: AuthContext,
  input: CreateInspectionInput,
): Promise<InspectionRow> {
  const year = input.year ?? new Date().getFullYear();
  return db.transaction(async (tx) => {
    const number = await nextNumber(tx, ctx.orgId, 'INS', year);
    const [ins] = await tx
      .insert(inspections)
      .values({
        organizationId: ctx.orgId,
        number,
        title: input.title.slice(0, 200),
        auditorName: input.auditorName ?? ctx.name,
        progressPct: 0,
        status: 'SCHEDULED',
      })
      .returning();

    await tx.insert(auditEvents).values({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: 'INSPECTION_CREATE',
      entityType: 'inspection',
      entityId: number,
      after: { title: ins.title, auditorName: ins.auditorName },
    });

    return {
      number: ins.number,
      title: ins.title,
      auditorName: ins.auditorName,
      progressPct: ins.progressPct,
      status: ins.status,
      createdAt: ins.createdAt.toISOString(),
    };
  });
}

export async function updateInspectionProgress(
  db: Db,
  ctx: AuthContext,
  number: string,
  progressPct: number,
  status?: string,
): Promise<InspectionRow> {
  const validatedProgress = Math.max(0, Math.min(100, Math.round(progressPct)));
  const nextStatus = status ?? (validatedProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS');

  const [updated] = await db
    .update(inspections)
    .set({
      progressPct: validatedProgress,
      status: nextStatus,
    })
    .where(and(eq(inspections.organizationId, ctx.orgId), eq(inspections.number, number)))
    .returning();

  if (!updated) throw notFound('INSPECTION', number);

  return {
    number: updated.number,
    title: updated.title,
    auditorName: updated.auditorName,
    progressPct: updated.progressPct,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function listFindings(
  db: Db,
  ctx: AuthContext,
  filter?: { inspectionNumber?: string; status?: string },
): Promise<FindingRow[]> {
  const conditions = [eq(findings.organizationId, ctx.orgId)];
  if (filter?.inspectionNumber) {
    conditions.push(eq(findings.inspectionNumber, filter.inspectionNumber));
  }
  if (filter?.status) {
    conditions.push(eq(findings.status, filter.status));
  }

  const rows = await db
    .select()
    .from(findings)
    .where(and(...conditions))
    .orderBy(desc(findings.createdAt));

  return rows.map((r) => ({
    number: r.number,
    title: r.title,
    severity: r.severity as FindingRow['severity'],
    status: r.status as FindingRow['status'],
    inspectionNumber: r.inspectionNumber,
    assetCode: r.assetCode,
    convertedWoNumber: r.convertedWoNumber,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getFinding(db: Db, ctx: AuthContext, number: string): Promise<FindingRow> {
  const rows = await db
    .select()
    .from(findings)
    .where(and(eq(findings.organizationId, ctx.orgId), eq(findings.number, number)))
    .limit(1);

  if (!rows[0]) throw notFound('FINDING', number);
  const r = rows[0];
  return {
    number: r.number,
    title: r.title,
    severity: r.severity as FindingRow['severity'],
    status: r.status as FindingRow['status'],
    inspectionNumber: r.inspectionNumber,
    assetCode: r.assetCode,
    convertedWoNumber: r.convertedWoNumber,
    createdAt: r.createdAt.toISOString(),
  };
}

export interface CreateFindingInput {
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR';
  inspectionNumber?: string | null;
  assetCode?: string | null;
}

export async function createFinding(
  db: Db,
  ctx: AuthContext,
  input: CreateFindingInput,
): Promise<FindingRow> {
  const year = new Date().getFullYear();
  return db.transaction(async (tx) => {
    const number = await nextNumber(tx, ctx.orgId, 'FND', year);
    const [fnd] = await tx
      .insert(findings)
      .values({
        organizationId: ctx.orgId,
        number,
        title: input.title.slice(0, 200),
        severity: input.severity,
        status: 'OPEN',
        inspectionNumber: input.inspectionNumber ?? null,
        assetCode: input.assetCode ?? null,
      })
      .returning();

    await tx.insert(auditEvents).values({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: 'FINDING_CREATE',
      entityType: 'finding',
      entityId: number,
      after: {
        title: fnd.title,
        severity: fnd.severity,
        assetCode: fnd.assetCode,
        inspectionNumber: fnd.inspectionNumber,
      },
    });

    return {
      number: fnd.number,
      title: fnd.title,
      severity: fnd.severity as FindingRow['severity'],
      status: fnd.status as FindingRow['status'],
      inspectionNumber: fnd.inspectionNumber,
      assetCode: fnd.assetCode,
      convertedWoNumber: fnd.convertedWoNumber,
      createdAt: fnd.createdAt.toISOString(),
    };
  });
}

export interface ConvertFindingInput {
  woTitle?: string;
  woPriority?: 'P1' | 'P2' | 'P3';
  location?: string;
  reason?: string;
}

export async function convertFindingToWo(
  db: Db,
  ctx: AuthContext,
  findingNumber: string,
  input: ConvertFindingInput = {},
  opts: { idempotencyKey?: string | null; requestId?: string } = {},
): Promise<{ finding: FindingRow; wo: WoRow }> {
  const exec = async (tx: Tx): Promise<{ finding: FindingRow; wo: WoRow }> => {
    const fndRows = await tx
      .select()
      .from(findings)
      .where(and(eq(findings.organizationId, ctx.orgId), eq(findings.number, findingNumber)))
      .limit(1);

    if (!fndRows[0]) throw notFound('FINDING', findingNumber);
    const fnd = fndRows[0];

    if (fnd.status === 'CONVERTED' || fnd.convertedWoNumber) {
      throw new DomainError(409, 'ALREADY_CONVERTED',
          `Finding ${findingNumber} has already been converted to ${fnd.convertedWoNumber}`);
    }

    const now = new Date();
    const year = now.getFullYear();
    const woNumber = await nextNumber(tx, ctx.orgId, 'WO', year);
    const priority = input.woPriority ?? (fnd.severity === 'CRITICAL' ? 'P1' : 'P2');
    const dueAt = new Date(now.getTime() + SLA_WINDOW_MS[priority]);

    const [wo] = await tx
      .insert(workOrders)
      .values({
        organizationId: ctx.orgId,
        number: woNumber,
        title: (input.woTitle?.trim() || `Corrective Action: ${fnd.title}`).slice(0, 200),
        assetCode: fnd.assetCode,
        location: input.location || fnd.assetCode || 'Facility Plant',
        priority,
        status: 'OPEN',
        slaDueAt: dueAt,
        assignedTo: null,
      })
      .returning();

    await tx.insert(workOrderEvents).values({
      organizationId: ctx.orgId,
      workOrderNumber: woNumber,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: 'CREATE',
      fromStatus: null,
      toStatus: 'OPEN',
      reason: `Auto-converted from inspection finding ${fnd.number}`,
      requestId: opts.requestId ?? null,
    });

    const [updatedFnd] = await tx
      .update(findings)
      .set({
        status: 'CONVERTED',
        convertedWoNumber: woNumber,
      })
      .where(and(eq(findings.organizationId, ctx.orgId), eq(findings.number, findingNumber)))
      .returning();

    await tx.insert(auditEvents).values({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: 'FINDING_CONVERT_WO',
      entityType: 'finding',
      entityId: findingNumber,
      before: { status: fnd.status },
      after: {
        status: 'CONVERTED',
        convertedWoNumber: woNumber,
        reason: input.reason ?? null,
      },
    });

    return {
      finding: {
        number: updatedFnd.number,
        title: updatedFnd.title,
        severity: updatedFnd.severity as FindingRow['severity'],
        status: updatedFnd.status as FindingRow['status'],
        inspectionNumber: updatedFnd.inspectionNumber,
        assetCode: updatedFnd.assetCode,
        convertedWoNumber: updatedFnd.convertedWoNumber,
        createdAt: updatedFnd.createdAt.toISOString(),
      },
      wo: {
        number: wo.number,
        title: wo.title,
        location: wo.location,
        assetCode: wo.assetCode,
        priority: wo.priority as WoRow['priority'],
        status: 'OPEN',
        statusLabel: 'OPEN',
        slaLabel: slaLabel(wo.slaDueAt, now),
        slaDueAt: wo.slaDueAt ? wo.slaDueAt.toISOString() : null,
        tech: null,
        holdReason: null,
        isTerminal: false,
        updatedAt: wo.updatedAt.toISOString(),
      },
    };
  };

  if (!opts.idempotencyKey) {
    return db.transaction(exec);
  }

  const hash = requestHash(input);
  return db.transaction(async (tx) => {
    const res = await withIdempotency(tx, ctx.orgId, opts.idempotencyKey, 'inspection.convert', hash, async () => {
      const body = await exec(tx);
      return { status: 201, body };
    });
    return res.body;
  });
}
