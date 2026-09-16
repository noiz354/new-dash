import type { NextRequest } from 'next/server';
import { and, eq, ilike, or } from 'drizzle-orm';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { assets, parts, serviceRequests, workOrders } from '@/db/schema';

export interface SearchResultItem {
  id: string;
  type: 'work_order' | 'service_request' | 'asset' | 'part';
  title: string;
  subtitle: string;
  badge?: string;
  href: string;
}

/**
 * GET /api/search?q={query}
 * Fast tenant-scoped search across Work Orders, Service Requests, Assets, and Inventory Parts.
 */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'search.query', method: 'GET', permission: 'audit.read' }, req, async (ctx) => {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 2) {
      return { data: { query, results: [] } };
    }

    const db = getDb();
    const pattern = `%${query}%`;
    const results: SearchResultItem[] = [];

    // 1. Search Work Orders
    const wos = await db
      .select({
        number: workOrders.number,
        title: workOrders.title,
        status: workOrders.status,
        assetCode: workOrders.assetCode,
      })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.organizationId, ctx!.orgId),
          or(ilike(workOrders.number, pattern), ilike(workOrders.title, pattern), ilike(workOrders.assetCode, pattern)),
        ),
      )
      .limit(6);

    for (const w of wos) {
      results.push({
        id: w.number,
        type: 'work_order',
        title: `${w.number} — ${w.title}`,
        subtitle: `Asset: ${w.assetCode || 'N/A'} • Status: ${w.status}`,
        badge: w.status,
        href: `/work-orders/${w.number}`,
      });
    }

    // 2. Search Service Requests
    const srs = await db
      .select({
        number: serviceRequests.number,
        title: serviceRequests.title,
        status: serviceRequests.status,
      })
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.organizationId, ctx!.orgId),
          or(ilike(serviceRequests.number, pattern), ilike(serviceRequests.title, pattern)),
        ),
      )
      .limit(5);

    for (const s of srs) {
      results.push({
        id: s.number,
        type: 'service_request',
        title: `${s.number} — ${s.title}`,
        subtitle: `Status: ${s.status}`,
        badge: s.status,
        href: `/service-requests/${s.number}`,
      });
    }

    // 3. Search Assets
    const asts = await db
      .select({
        code: assets.code,
        name: assets.name,
        klass: assets.klass,
        location: assets.location,
      })
      .from(assets)
      .where(
        and(
          eq(assets.organizationId, ctx!.orgId),
          or(ilike(assets.code, pattern), ilike(assets.name, pattern), ilike(assets.klass, pattern)),
        ),
      )
      .limit(5);

    for (const a of asts) {
      results.push({
        id: a.code,
        type: 'asset',
        title: `${a.code} — ${a.name}`,
        subtitle: `Class: ${a.klass} • Loc: ${a.location || 'N/A'}`,
        badge: a.klass,
        href: `/assets/${a.code}`,
      });
    }

    // 4. Search Parts
    const prts = await db
      .select({
        sku: parts.sku,
        name: parts.name,
        bin: parts.bin,
        onHand: parts.onHand,
      })
      .from(parts)
      .where(
        and(
          eq(parts.organizationId, ctx!.orgId),
          or(ilike(parts.sku, pattern), ilike(parts.name, pattern)),
        ),
      )
      .limit(5);

    for (const p of prts) {
      results.push({
        id: p.sku,
        type: 'part',
        title: `${p.sku} — ${p.name}`,
        subtitle: `Bin: ${p.bin} • Stock: ${p.onHand} units`,
        badge: `${p.onHand} in stock`,
        href: `/inventory/${p.sku}`,
      });
    }

    return { data: { query, results } };
  });
}
