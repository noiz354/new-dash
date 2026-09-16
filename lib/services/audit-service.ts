/**
 * Audit-trail service (Phase 1 slice 3) — reads the append-only audit_events
 * table, tenant-scoped. No mutations here by design: the ledger is written
 * only inside service transactions (auth, WO, SR) and never updated.
 */
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { auditEvents } from '../../db/schema';
import type { AuthContext } from '../auth/session';

export interface AuditRow {
  id: number;
  ts: string;
  actorName: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  before: unknown;
  after: unknown;
  requestId: string | null;
}

export interface AuditPage {
  rows: AuditRow[];
  /** Real per-entity-type counts for the scope sidebar. */
  counts: { entityType: string; total: number }[];
  total: number;
  /** True when more rows exist than the fetched window. */
  truncated: boolean;
}

export const AUDIT_PAGE_LIMIT = 500;

export async function listAuditEvents(
  db: Db,
  ctx: AuthContext,
  limit = AUDIT_PAGE_LIMIT,
): Promise<AuditPage> {
  const [rows, grouped, countRes] = await Promise.all([
    db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.organizationId, ctx.orgId))
      .orderBy(desc(auditEvents.ts), desc(auditEvents.id))
      .limit(limit + 1),
    db
      .select({
        entityType: sql<string>`coalesce(${auditEvents.entityType}, 'other')`,
        total: sql<number>`count(*)::int`,
      })
      .from(auditEvents)
      .where(eq(auditEvents.organizationId, ctx.orgId))
      .groupBy(sql`coalesce(${auditEvents.entityType}, 'other')`)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(auditEvents)
      .where(eq(auditEvents.organizationId, ctx.orgId)),
  ]);

  const truncated = rows.length > limit;
  return {
    rows: rows.slice(0, limit).map((r) => ({
      id: r.id,
      ts: r.ts.toISOString(),
      actorName: r.actorName,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      before: r.before,
      after: r.after,
      requestId: r.requestId,
    })),
    counts: grouped.map((g) => ({ entityType: g.entityType, total: g.total })),
    total: countRes[0]?.total ?? 0,
    truncated,
  };
}
