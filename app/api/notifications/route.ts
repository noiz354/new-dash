import type { NextRequest } from 'next/server';
import { and, asc, eq, notInArray, isNotNull } from 'drizzle-orm';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { workOrders } from '@/db/schema';
import { WO_TERMINAL } from '@/lib/domain/work-orders';

export interface NotificationItem {
  id: string;
  type: 'sla_breach_threat' | 'p1_critical' | 'stock_alert';
  severity: 'P1' | 'P2' | 'P3';
  title: string;
  subtitle: string;
  minutesRemaining: number | null;
  woNumber?: string;
  createdAt: string;
}

/**
 * GET /api/notifications
 * Computes live SLA-at-risk alerts dynamically from `sla_due_at` in the work orders table.
 */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'notifications.list', method: 'GET', permission: 'wo.read', etag: true }, req, async (ctx) => {
    const db = getDb();
    const now = new Date();

    const activeWos = await db
      .select({
        number: workOrders.number,
        title: workOrders.title,
        priority: workOrders.priority,
        status: workOrders.status,
        slaDueAt: workOrders.slaDueAt,
        location: workOrders.location,
        assignedTo: workOrders.assignedTo,
      })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.organizationId, ctx!.orgId),
          notInArray(workOrders.status, [...WO_TERMINAL]),
          isNotNull(workOrders.slaDueAt),
        ),
      )
      .orderBy(asc(workOrders.slaDueAt))
      .limit(20);

    const notifications: NotificationItem[] = [];

    for (const wo of activeWos) {
      if (!wo.slaDueAt) continue;
      const diffMs = wo.slaDueAt.getTime() - now.getTime();
      const minutesRemaining = Math.round(diffMs / (60 * 1000));

      // Alert if due within 4 hours or already overdue
      if (minutesRemaining <= 240) {
        notifications.push({
          id: `NOTIF-${wo.number}`,
          type: 'sla_breach_threat',
          severity: (wo.priority as 'P1' | 'P2' | 'P3') ?? 'P2',
          title: `${wo.number} · SLA At Risk (${minutesRemaining > 0 ? `${minutesRemaining}m remaining` : `${Math.abs(minutesRemaining)}m overdue`})`,
          subtitle: `${wo.title} · Location: ${wo.location} · Assigned: ${wo.assignedTo || 'Unassigned'}`,
          minutesRemaining,
          woNumber: wo.number,
          createdAt: now.toISOString(),
        });
      }
    }

    return {
      data: {
        totalAtRisk: notifications.length,
        notifications,
      },
    };
  });
}
