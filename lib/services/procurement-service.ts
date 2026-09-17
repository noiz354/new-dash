/**
 * Procurement Service (Phase 1 Slice 7): PR → PO → GRN → 3-Way Match.
 * Handles purchasing state transitions, endorsement quorum, and idempotent dock GRN receipts.
 */
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db, Tx } from '../../db/client';
import { auditEvents, goodsReceiptNotes, invoiceLineItems, invoices, poLineItems, purchaseOrders } from '../../db/schema';
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
  filter?: { kind?: 'PO' | 'PR'; status?: string; number?: string; limit?: number; offset?: number },
): Promise<PurchaseDocument[]> {
  const conditions = [eq(purchaseOrders.organizationId, ctx.orgId)];
  if (filter?.kind) conditions.push(eq(purchaseOrders.kind, filter.kind));
  if (filter?.status) conditions.push(eq(purchaseOrders.status, filter.status));
  if (filter?.number) conditions.push(eq(purchaseOrders.number, filter.number));

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
  if (!input.lineItems || input.lineItems.length === 0) {
    throw new DomainError(400, 'LINE_ITEMS_REQUIRED', 'A requisition needs at least one line item');
  }
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
  opts: { idempotencyKey?: string | null; requestId?: string; stepUpAt?: string | null } = {},
): Promise<GrnRow> {
  // Step-up is enforced here, not just at the route (GAP-09): a GRN mutates
  // stock, so every caller must carry a verified approver timestamp.
  if (!opts.stepUpAt) {
    throw new DomainError(403, 'STEP_UP_REQUIRED',
      'Posting a goods receipt requires a verified approver code (step-up TOTP)');
  }
  const exec = async (tx: Tx): Promise<GrnRow> => {
    // The referenced PO must exist and really be a PO (GAP-09: no blind writes).
    const [po] = await tx
      .select({ number: purchaseOrders.number, kind: purchaseOrders.kind })
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.organizationId, ctx.orgId),
        eq(purchaseOrders.number, input.poNumber),
      ))
      .limit(1);
    if (!po) throw notFound('PURCHASE_DOCUMENT', input.poNumber);
    if (po.kind !== 'PO') {
      throw new DomainError(422, 'WRONG_DOCUMENT_KIND',
        `Goods receipt requires a PO — ${input.poNumber} is a ${po.kind}`);
    }

    // Canon numbering (GAP-09): GRN-YYYY-NNNN from the sequences engine.
    const year = new Date().getFullYear();
    const grnId = input.grnNumber || await nextNumber(tx, ctx.orgId, 'GRN', year);

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
        // T4-16: persist what the dock actually received — the 3-way match
        // engine reads these columns (legacy rows keep NULL = unknown qty).
        skuReceived: input.skuReceived,
        qtyReceived: input.qtyReceived,
        status: 'RECEIVED',
        verifiedBy: ctx.name,
      })
      .returning();

    // Call stock receive mutation (step-up approval carried over from the
    // GRN route, GAP-03/GAP-09: audit PART_RECEIVE.after.stepUpAt stays filled).
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
      { stepUpAt: opts.stepUpAt ?? undefined, requestId: opts.requestId ?? undefined },
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
      dockLocation: grn.dockLocation ?? input.dockLocation ?? 'Dock Bay 02',
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

export type PurchaseDecision = 'APPROVE' | 'REJECT';

export interface DecidePurchaseInput {
  decision: PurchaseDecision;
  /** Required when decision is REJECT (min 3 chars). */
  reason?: string;
}

export interface DecisionRow {
  number: string;
  kind: 'PO' | 'PR';
  status: string;
  decidedBy: string;
  decidedAt: string;
  reason: string | null;
}

const DECIDABLE_FROM = ['PENDING_APPROVAL', 'CREATED'];
const TERMINAL_DECISION = ['APPROVED', 'DISPATCHED', 'RECEIVED', 'REJECTED'];

/**
 * Approve / reject a requisition or order (GAP-09: the missing "authorize"
 * half of F13). Records PO_APPROVE / PO_REJECT in the audit trail.
 * Honest scope: approval is recorded — vendor EDI dispatch stays manual
 * (no transmit integration exists).
 */
export async function decidePurchase(
  db: Db,
  ctx: AuthContext,
  number: string,
  input: DecidePurchaseInput,
  opts: { idempotencyKey?: string | null; requestId?: string } = {},
): Promise<DecisionRow> {
  if (input.decision === 'REJECT' && !(input.reason ?? '').trim()) {
    throw new DomainError(400, 'REASON_REQUIRED', 'Rejecting a purchase document requires a reason');
  }

  const exec = async (tx: Tx): Promise<DecisionRow> => {
    const [doc] = await tx
      .select()
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.organizationId, ctx.orgId),
        eq(purchaseOrders.number, number),
      ))
      .limit(1);
    if (!doc) throw notFound('PURCHASE_DOCUMENT', number);
    if (TERMINAL_DECISION.includes(doc.status)) {
      throw new DomainError(409, 'ALREADY_DECIDED',
        `${number} is already ${doc.status} — decision is terminal`);
    }
    if (!DECIDABLE_FROM.includes(doc.status)) {
      throw new DomainError(409, 'NOT_DECIDABLE',
        `${number} is ${doc.status} — only PENDING_APPROVAL or CREATED documents can be decided`);
    }

    const status = input.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const reason = input.decision === 'REJECT' ? input.reason!.trim().slice(0, 300) : null;
    const decidedAt = new Date().toISOString();

    await tx
      .update(purchaseOrders)
      .set({ status })
      .where(and(
        eq(purchaseOrders.organizationId, ctx.orgId),
        eq(purchaseOrders.number, number),
      ));

    await tx.insert(auditEvents).values({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: input.decision === 'APPROVE' ? 'PO_APPROVE' : 'PO_REJECT',
      entityType: 'purchase_document',
      entityId: number,
      requestId: opts.requestId ?? null,
      before: { status: doc.status },
      after: { status, reason, decidedBy: ctx.name, decidedAt },
    });

    return {
      number: doc.number,
      kind: doc.kind as 'PO' | 'PR',
      status,
      decidedBy: ctx.name,
      decidedAt,
      reason,
    };
  };

  if (!opts.idempotencyKey) {
    return db.transaction(exec);
  }

  const hash = requestHash({ number, ...input });
  return db.transaction(async (tx) => {
    const res = await withIdempotency(tx, ctx.orgId, opts.idempotencyKey, 'procurement.decision', hash, async () => {
      const body = await exec(tx);
      return { status: 200, body };
    });
    return res.body;
  });
}

// ---------------------------------------------------------------------------
// T4-16 — real 3-way match engine (PO lines vs GRN received qty vs invoice).
// ---------------------------------------------------------------------------

export interface InvoiceLineInput {
  sku: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface RegisterInvoiceInput {
  invoiceNumber: string;
  poNumber: string;
  vendorSlug?: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate?: string;
  paymentTerms?: string;
  lines: InvoiceLineInput[];
}

export interface MatchLineResult {
  sku: string;
  description: string;
  poQty: number;
  grnQty: number;
  invQty: number;
  unitPriceCents: number;
  invUnitPriceCents: number;
  matched: boolean;
  variance: string;
}

export interface MatchResult {
  status: 'MATCHED' | 'DISPUTED';
  paymentHold: boolean;
  lines: MatchLineResult[];
  holdCents: number;
  holdFormatted: string;
}

export interface InvoiceDossier {
  number: string;
  poNumber: string;
  vendorSlug: string | null;
  invoiceDate: string;
  dueDate: string | null;
  paymentTerms: string;
  /** Stored engine verdict (source of truth); lines below are recomputed live. */
  status: 'PENDING' | 'MATCHED' | 'DISPUTED';
  paymentHold: boolean;
  lines: MatchLineResult[];
  holdCents: number;
  holdFormatted: string;
  /** Real MATCH_RECONCILED / MATCH_DISPUTED audit event id (never fabricated). */
  auditTrailId: number | null;
  /** How many GRN rows fed the live line computation. */
  grnCount: number;
  createdAt: string;
}

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

/**
 * Pure 3-way match shared by registerInvoice (verdict persisted) and
 * getInvoiceDossier (lines recomputed live from current GRN rows).
 *
 * Strict rule: every PO line must be fully received AND fully invoiced at the
 * exact PO unit price. Anything else is a MISMATCH with payment hold.
 */
export function computeMatch(
  poLines: { sku: string; description: string; quantity: number; unitPriceCents: number }[],
  grnQtyBySku: Map<string, number>,
  invLines: { sku: string; description: string; quantity: number; unitPriceCents: number }[],
): MatchResult {
  const lines: MatchLineResult[] = [];
  let holdCents = 0;
  const seenInv = new Set<string>();

  for (const po of poLines) {
    const grnQty = grnQtyBySku.get(po.sku) ?? 0;
    const inv = invLines.find((l) => l.sku === po.sku);
    if (inv) seenInv.add(inv.sku);
    const invQty = inv?.quantity ?? 0;
    const invPrice = inv?.unitPriceCents ?? po.unitPriceCents;
    const problems: string[] = [];
    let lineHold = 0;
    if (!inv) {
      problems.push('not invoiced');
      lineHold += po.quantity * po.unitPriceCents;
    } else {
      if (invQty !== po.quantity) {
        problems.push(`invoiced ${invQty}, ordered ${po.quantity}`);
        lineHold += Math.abs(invQty - po.quantity) * invPrice;
      }
      if (invPrice !== po.unitPriceCents) {
        problems.push(`price ${money(invPrice)}/unit vs PO ${money(po.unitPriceCents)}/unit`);
        lineHold += invQty * Math.abs(invPrice - po.unitPriceCents);
      }
    }
    if (grnQty !== po.quantity) {
      const short = po.quantity - grnQty;
      problems.push(short > 0
        ? `${short} pcs pending receipt`
        : `${-short} pcs over-received`);
      // Invoiced-but-unreceived value stays on hold.
      lineHold += Math.max(0, Math.min(invQty, po.quantity) - Math.min(grnQty, po.quantity)) * invPrice;
    }
    const matched = problems.length === 0;
    holdCents += lineHold;
    lines.push({
      sku: po.sku,
      description: po.description,
      poQty: po.quantity,
      grnQty,
      invQty,
      unitPriceCents: po.unitPriceCents,
      invUnitPriceCents: invPrice,
      matched,
      variance: matched ? '$0.00 (0.0%)' : `${problems.join('; ')} (${money(lineHold)} hold)`,
    });
  }

  // Invoice lines for SKUs that were never ordered are always a mismatch.
  for (const inv of invLines) {
    if (seenInv.has(inv.sku)) continue;
    const lineHold = inv.quantity * inv.unitPriceCents;
    holdCents += lineHold;
    lines.push({
      sku: inv.sku,
      description: inv.description,
      poQty: 0,
      grnQty: grnQtyBySku.get(inv.sku) ?? 0,
      invQty: inv.quantity,
      unitPriceCents: 0,
      invUnitPriceCents: inv.unitPriceCents,
      matched: false,
      variance: `not on PO (${money(lineHold)} hold)`,
    });
  }

  const disputed = lines.some((l) => !l.matched);
  return {
    status: disputed ? 'DISPUTED' : 'MATCHED',
    paymentHold: disputed,
    lines,
    holdCents,
    holdFormatted: money(holdCents),
  };
}

/**
 * Register a vendor invoice and run the 3-way match in the SAME transaction:
 * the persisted status/paymentHold IS the engine verdict (T4-16 AC: mismatch
 * → flag + payment hold), evidenced by INVOICE_REGISTER + MATCH_* audit rows.
 */
export async function registerInvoice(
  db: Db,
  ctx: AuthContext,
  input: RegisterInvoiceInput,
  opts: { idempotencyKey?: string | null; requestId?: string; stepUpAt?: string | null } = {},
): Promise<InvoiceDossier> {
  // Like GRN (GAP-09): booking a vendor claim needs a verified approver code.
  if (!opts.stepUpAt) {
    throw new DomainError(403, 'STEP_UP_REQUIRED',
      'Registering a vendor invoice requires a verified approver code (step-up TOTP)');
  }
  if (!/^INV-\d{4}-\d{4}$/.test(input.invoiceNumber)) {
    throw new DomainError(422, 'INVALID_INVOICE_NUMBER',
      `Invoice number must look like INV-2026-1188 — got ${input.invoiceNumber}`);
  }
  if (!input.lines || input.lines.length === 0) {
    throw new DomainError(422, 'INVOICE_LINES_REQUIRED', 'Invoice needs at least one line item');
  }
  for (const [i, l] of input.lines.entries()) {
    if (!l.sku || !Number.isInteger(l.quantity) || l.quantity <= 0 || !Number.isInteger(l.unitPriceCents) || l.unitPriceCents < 0) {
      throw new DomainError(422, 'INVALID_INVOICE_LINE', `Line ${i + 1}: sku + positive integer qty + non-negative unitPriceCents required`);
    }
  }

  const exec = async (tx: Tx): Promise<InvoiceDossier> => {
    const [po] = await tx
      .select()
      .from(purchaseOrders)
      .where(and(
        eq(purchaseOrders.organizationId, ctx.orgId),
        eq(purchaseOrders.number, input.poNumber),
      ))
      .limit(1);
    if (!po) throw notFound('PURCHASE_DOCUMENT', input.poNumber);
    if (po.kind !== 'PO') {
      throw new DomainError(422, 'WRONG_DOCUMENT_KIND',
        `Invoice matching requires a PO — ${input.poNumber} is a ${po.kind}`);
    }

    const [dup] = await tx
      .select({ number: invoices.number })
      .from(invoices)
      .where(and(
        eq(invoices.organizationId, ctx.orgId),
        eq(invoices.number, input.invoiceNumber),
      ))
      .limit(1);
    if (dup) {
      throw new DomainError(409, 'DUPLICATE_INVOICE',
        `Invoice ${input.invoiceNumber} already registered`);
    }

    const poLines = await tx
      .select()
      .from(poLineItems)
      .where(and(
        eq(poLineItems.organizationId, ctx.orgId),
        eq(poLineItems.documentNumber, input.poNumber),
      ));
    if (poLines.length === 0) {
      throw new DomainError(422, 'PO_HAS_NO_LINES',
        `PO ${input.poNumber} has no line items to match against`);
    }

    const grnRows = await tx
      .select()
      .from(goodsReceiptNotes)
      .where(and(
        eq(goodsReceiptNotes.organizationId, ctx.orgId),
        eq(goodsReceiptNotes.poNumber, input.poNumber),
      ));
    const grnQtyBySku = new Map<string, number>();
    for (const g of grnRows) {
      if (!g.skuReceived || g.qtyReceived == null) continue; // legacy row: unknown qty
      grnQtyBySku.set(g.skuReceived, (grnQtyBySku.get(g.skuReceived) ?? 0) + g.qtyReceived);
    }

    const match = computeMatch(poLines, grnQtyBySku, input.lines);

    const [inv] = await tx
      .insert(invoices)
      .values({
        organizationId: ctx.orgId,
        number: input.invoiceNumber,
        poNumber: input.poNumber,
        vendorSlug: input.vendorSlug ?? po.vendorSlug ?? '',
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate ?? null,
        paymentTerms: input.paymentTerms ?? 'NET_30',
        status: match.status,
        paymentHold: match.paymentHold,
      })
      .returning();

    for (let i = 0; i < input.lines.length; i++) {
      const l = input.lines[i];
      await tx.insert(invoiceLineItems).values({
        organizationId: ctx.orgId,
        id: `${input.invoiceNumber}-L${i + 1}`,
        invoiceNumber: input.invoiceNumber,
        sku: l.sku,
        description: l.description,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
      });
    }

    await tx.insert(auditEvents).values({
      organizationId: ctx.orgId,
      actorUserId: ctx.userId,
      actorName: ctx.name,
      action: 'INVOICE_REGISTER',
      entityType: 'vendor_invoice',
      entityId: input.invoiceNumber,
      requestId: opts.requestId ?? null,
      before: null,
      after: { poNumber: input.poNumber, lineCount: input.lines.length, status: match.status },
    });

    const [matchEvent] = await tx
      .insert(auditEvents)
      .values({
        organizationId: ctx.orgId,
        actorUserId: ctx.userId,
        actorName: ctx.name,
        action: match.status === 'MATCHED' ? 'MATCH_RECONCILED' : 'MATCH_DISPUTED',
        entityType: 'vendor_invoice',
        entityId: input.invoiceNumber,
        requestId: opts.requestId ?? null,
        before: null,
        after: {
          status: match.status,
          paymentHold: match.paymentHold,
          holdCents: match.holdCents,
          lines: match.lines.map((l) => ({
            sku: l.sku, poQty: l.poQty, grnQty: l.grnQty, invQty: l.invQty, matched: l.matched,
          })),
        },
      })
      .returning({ id: auditEvents.id });

    return {
      number: inv.number,
      poNumber: inv.poNumber,
      vendorSlug: inv.vendorSlug,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      paymentTerms: inv.paymentTerms,
      status: inv.status as InvoiceDossier['status'],
      paymentHold: inv.paymentHold,
      lines: match.lines,
      holdCents: match.holdCents,
      holdFormatted: match.holdFormatted,
      auditTrailId: matchEvent.id,
      grnCount: grnRows.length,
      createdAt: inv.createdAt.toISOString(),
    };
  };

  if (!opts.idempotencyKey) {
    return db.transaction(exec);
  }

  const hash = requestHash(input);
  return db.transaction(async (tx) => {
    const res = await withIdempotency(tx, ctx.orgId, opts.idempotencyKey, 'procurement.invoice', hash, async () => {
      const body = await exec(tx);
      return { status: 201, body };
    });
    return res.body;
  });
}

/** Tenant-scoped invoice list (newest first). */
export async function listInvoices(
  db: Db,
  ctx: AuthContext,
  filter: { poNumber?: string; limit?: number } = {},
): Promise<{ number: string; poNumber: string; status: string; paymentHold: boolean; invoiceDate: string; createdAt: string }[]> {
  const conditions = [eq(invoices.organizationId, ctx.orgId)];
  if (filter.poNumber) conditions.push(eq(invoices.poNumber, filter.poNumber));
  const rows = await db
    .select()
    .from(invoices)
    .where(and(...conditions))
    .orderBy(desc(invoices.createdAt))
    .limit(filter.limit ?? 50);
  return rows.map((r) => ({
    number: r.number,
    poNumber: r.poNumber,
    status: r.status,
    paymentHold: r.paymentHold,
    invoiceDate: r.invoiceDate,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Live invoice dossier: stored engine verdict + lines recomputed from CURRENT
 * GRN rows. Unknown numbers 404 (T4-16: the static INVOICES fallback is gone).
 */
export async function getInvoiceDossier(
  db: Db,
  ctx: AuthContext,
  number: string,
): Promise<InvoiceDossier> {
  const [inv] = await db
    .select()
    .from(invoices)
    .where(and(
      eq(invoices.organizationId, ctx.orgId),
      eq(invoices.number, number),
    ))
    .limit(1);
  if (!inv) throw notFound('VENDOR_INVOICE', number);

  const [invLines, poLines, grnRows, matchEvents] = await Promise.all([
    db.select().from(invoiceLineItems).where(and(
      eq(invoiceLineItems.organizationId, ctx.orgId),
      eq(invoiceLineItems.invoiceNumber, number),
    )),
    db.select().from(poLineItems).where(and(
      eq(poLineItems.organizationId, ctx.orgId),
      eq(poLineItems.documentNumber, inv.poNumber),
    )),
    db.select().from(goodsReceiptNotes).where(and(
      eq(goodsReceiptNotes.organizationId, ctx.orgId),
      eq(goodsReceiptNotes.poNumber, inv.poNumber),
    )),
    db.select({ id: auditEvents.id })
      .from(auditEvents)
      .where(and(
        eq(auditEvents.organizationId, ctx.orgId),
        eq(auditEvents.entityType, 'vendor_invoice'),
        eq(auditEvents.entityId, number),
        inArray(auditEvents.action, ['MATCH_RECONCILED', 'MATCH_DISPUTED']),
      ))
      .orderBy(desc(auditEvents.id))
      .limit(1),
  ]);

  const grnQtyBySku = new Map<string, number>();
  for (const g of grnRows) {
    if (!g.skuReceived || g.qtyReceived == null) continue;
    grnQtyBySku.set(g.skuReceived, (grnQtyBySku.get(g.skuReceived) ?? 0) + g.qtyReceived);
  }
  const match = computeMatch(poLines, grnQtyBySku, invLines);

  return {
    number: inv.number,
    poNumber: inv.poNumber,
    vendorSlug: inv.vendorSlug,
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    paymentTerms: inv.paymentTerms,
    status: inv.status as InvoiceDossier['status'],
    paymentHold: inv.paymentHold,
    lines: match.lines,
    holdCents: match.holdCents,
    holdFormatted: match.holdFormatted,
    auditTrailId: matchEvents[0]?.id ?? null,
    grnCount: grnRows.length,
    createdAt: inv.createdAt.toISOString(),
  };
}
