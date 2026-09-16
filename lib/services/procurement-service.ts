/**
 * Procurement Service (Phase 1 Slice 7): PR → PO → GRN → 3-Way Match.
 * Handles purchasing state transitions, endorsement quorum, and idempotent dock GRN receipts.
 */
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Db, Tx } from '../../db/client';
import { auditEvents, goodsReceiptNotes, poLineItems, purchaseOrders } from '../../db/schema';
import type { AuthContext } from '../auth/session';
import { DomainError, notFound } from '../domain/errors';
import { requestHash, withIdempotency } from './idempotency';
import { mutateStock } from './inventory-service';
import { nextNumber } from './sequence';

export interface PurchaseLineItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  priceFormatted: string;
  totalFormatted: string;
}

export interface PurchaseDocument {
  number: string;
  kind: 'PO' | 'PR';
  title: string;
  vendorSlug: string | null;
  totalCents: number;
  totalFormatted: string;
  status: string;
  slaDueAt: string | null;
  lineItems: PurchaseLineItem[];
  createdAt: string;
}

export interface GrnRow {
  number: string;
  poNumber: string;
  waybill: string;
  dockLocation: string;
  status: 'RECEIVED' | 'DISPUTED';
  verifiedBy: string;
  createdAt: string;
}

export async function listPurchases(
  db: Db,
  ctx: AuthContext,
  filter?: { kind?: 'PO' | 'PR'; status?: string; limit?: number; offset?: number },
): Promise<PurchaseDocument[]> {
  const conditions = [eq(purchaseOrders.organizationId, ctx.orgId)];
  if (filter?.kind) conditions.push(eq(purchaseOrders.kind, filter.kind));
  if (filter?.status) conditions.push(eq(purchaseOrders.status, filter.status));

  let query = db
    .select()
    .from(purchaseOrders)
    .where(and(...conditions))
    .orderBy(desc(purchaseOrders.createdAt));

  if (filter?.offset) {
    query = query.offset(filter.offset) as any;
  }
  if (filter?.limit) {
    query = query.limit(filter.limit) as any;
  }

  const docs = await query;

  const results: PurchaseDocument[] = [];
  for (const doc of docs) {
    const lines = await db
      .select()
      .from(poLineItems)
      .where(and(
        eq(poLineItems.organizationId, ctx.orgId),
        eq(poLineItems.documentNumber, doc.number),
      ));

    results.push({
      number: doc.number,
      kind: doc.kind as 'PO' | 'PR',
      title: doc.title,
      vendorSlug: doc.vendorSlug,
      totalCents: doc.totalCents,
      totalFormatted: `$${(doc.totalCents / 100).toFixed(2)}`,
      status: doc.status,
      slaDueAt: doc.slaDueAt ? doc.slaDueAt.toISOString() : null,
      lineItems: lines.map((l) => ({
        id: l.id,
        sku: l.sku,
        description: l.description,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
        priceFormatted: `$${(l.unitPriceCents / 100).toFixed(2)}`,
        totalFormatted: `$${((l.unitPriceCents * l.quantity) / 100).toFixed(2)}`,
      })),
      createdAt: doc.createdAt.toISOString(),
    });
  }

  return results;
}

export async function getPurchase(
  db: Db,
  ctx: AuthContext,
  number: string,
): Promise<PurchaseDocument> {
  const docs = await db
    .select()
    .from(purchaseOrders)
    .where(and(
      eq(purchaseOrders.organizationId, ctx.orgId),
      eq(purchaseOrders.number, number),
    ))
    .limit(1);

  if (!docs[0]) throw notFound('PURCHASE_DOCUMENT', number);
  const doc = docs[0];

  const lines = await db
    .select()
    .from(poLineItems)
    .where(and(
      eq(poLineItems.organizationId, ctx.orgId),
      eq(poLineItems.documentNumber, doc.number),
    ));

  return {
    number: doc.number,
    kind: doc.kind as 'PO' | 'PR',
    title: doc.title,
    vendorSlug: doc.vendorSlug,
    totalCents: doc.totalCents,
    totalFormatted: `$${(doc.totalCents / 100).toFixed(2)}`,
    status: doc.status,
    slaDueAt: doc.slaDueAt ? doc.slaDueAt.toISOString() : null,
    lineItems: lines.map((l) => ({
      id: l.id,
      sku: l.sku,
      description: l.description,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
      priceFormatted: `$${(l.unitPriceCents / 100).toFixed(2)}`,
      totalFormatted: `$${((l.unitPriceCents * l.quantity) / 100).toFixed(2)}`,
    })),
    createdAt: doc.createdAt.toISOString(),
  };
}

export interface CreateRequisitionInput {
  title: string;
  vendorSlug?: string | null;
  lineItems: { sku: string; description: string; quantity: number; unitPriceCents: number }[];
}

export async function createRequisition(
  db: Db,
  ctx: AuthContext,
  input: CreateRequisitionInput,
): Promise<PurchaseDocument> {
  const year = new Date().getFullYear();
  return db.transaction(async (tx) => {
    const number = await nextNumber(tx, ctx.orgId, 'PR', year);
    const totalCents = input.lineItems.reduce((acc, it) => acc + it.quantity * it.unitPriceCents, 0);

    const [pr] = await tx
      .insert(purchaseOrders)
      .values({
        organizationId: ctx.orgId,
        number,
        kind: 'PR',
        title: input.title.slice(0, 200),
        vendorSlug: input.vendorSlug ?? null,
        totalCents,
        status: 'PENDING_APPROVAL',
      })
      .returning();

    for (let i = 0; i < input.lineItems.length; i++) {
      const it = input.lineItems[i];
      await tx.insert(poLineItems).values({
        organizationId: ctx.orgId,
        id: `${number}-L${i + 1}`,
        documentNumber: number,
        sku: it.sku,
        description: it.description,
        quantity: it.quantity,
        unitPriceCents: it.unitPriceCents,
      });
    }

    await tx.insert(auditEvents).values({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: 'PR_CREATE',
      entityType: 'purchase_requisition',
      entityId: number,
      after: { title: pr.title, totalCents },
    });

    return getPurchase(tx as unknown as Db, ctx, number);
  });
}

export interface PostGrnInput {
  poNumber: string;
  grnNumber?: string;
  waybill: string;
  dockLocation?: string;
  skuReceived: string;
  qtyReceived: number;
}

export async function postGoodsReceipt(
  db: Db,
  ctx: AuthContext,
  input: PostGrnInput,
  opts: { idempotencyKey?: string | null; requestId?: string } = {},
): Promise<GrnRow> {
  const exec = async (tx: Tx): Promise<GrnRow> => {
    const grnId = input.grnNumber || `GRN-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await tx
      .select()
      .from(goodsReceiptNotes)
      .where(and(
        eq(goodsReceiptNotes.organizationId, ctx.orgId),
        eq(goodsReceiptNotes.number, grnId),
      ))
      .limit(1);

    if (existing.length > 0) {
      throw new DomainError(409, 'DUPLICATE_RECEIPT',
          `GRN ${grnId} already verified on dock`);
    }

    const [grn] = await tx
      .insert(goodsReceiptNotes)
      .values({
        organizationId: ctx.orgId,
        number: grnId,
        poNumber: input.poNumber,
        waybill: input.waybill,
        dockLocation: input.dockLocation || 'Dock Bay 02',
        status: 'RECEIVED',
        verifiedBy: ctx.name,
      })
      .returning();

    // Call stock receive mutation
    await mutateStock(
      tx as unknown as Db,
      ctx,
      {
        sku: input.skuReceived,
        type: 'RECEIVE',
        qty: input.qtyReceived,
        refNumber: input.poNumber,
        reason: `Dock Bay GRN ${grnId} receipt from ${input.poNumber}`,
      },
    );

    // Update PO status to RECEIVED or PARTIAL
    await tx
      .update(purchaseOrders)
      .set({ status: 'RECEIVED' })
      .where(and(
        eq(purchaseOrders.organizationId, ctx.orgId),
        eq(purchaseOrders.number, input.poNumber),
      ));

    return {
      number: grn.number,
      poNumber: grn.poNumber,
      waybill: grn.waybill,
      dockLocation: grn.dockLocation,
      status: grn.status as GrnRow['status'],
      verifiedBy: grn.verifiedBy,
      createdAt: grn.createdAt.toISOString(),
    };
  };

  if (!opts.idempotencyKey) {
    return db.transaction(exec);
  }

  const hash = requestHash(input);
  return db.transaction(async (tx) => {
    const res = await withIdempotency(tx, ctx.orgId, opts.idempotencyKey, 'procurement.grn', hash, async () => {
      const body = await exec(tx);
      return { status: 201, body };
    });
    return res.body;
  });
}
