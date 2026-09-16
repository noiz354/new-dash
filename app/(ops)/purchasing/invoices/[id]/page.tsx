import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, ShieldCheck, Scale, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';

export function generateStaticParams() {
  return [
    { id: 'INV-2026-1188' },
    { id: 'INV-2026-0302' },
    { id: 'INV-2026-0285' },
  ];
}

interface InvoiceRecord {
  id: string;
  poNumber: string;
  grnNumber: string;
  vendor: string;
  vendorSlug: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  currency: string;
  status: 'RECONCILED' | 'EXCEPTION_DISPUTED' | 'PENDING_UPLOAD';
  matchConfidence: string;
  lineItems: {
    sku: string;
    desc: string;
    poQty: number;
    grnQty: number;
    invQty: number;
    poPrice: string;
    invPrice: string;
    variance: string;
    status: 'MATCHED' | 'MISMATCH';
  }[];
  paymentTerms: string;
  auditTrailId: string;
}

const INVOICES: Record<string, InvoiceRecord> = {
  'INV-2026-1188': {
    id: 'INV-2026-1188',
    poNumber: CANON.purchaseOrder,
    grnNumber: 'GRN-9941',
    vendor: 'Trane Supply Co',
    vendorSlug: CANON.vendorSlug,
    invoiceDate: '2026-05-24',
    dueDate: '2026-06-23 (Net 30)',
    totalAmount: '$2,900.00',
    currency: 'USD',
    status: 'RECONCILED',
    matchConfidence: '100.0% (Zero Tolerance)',
    lineItems: [
      {
        sku: CANON.sealSku,
        desc: 'Silicon Carbide Shaft Seal 2.5" Kit',
        poQty: 2,
        grnQty: 2,
        invQty: 2,
        poPrice: '$1,450.00',
        invPrice: '$1,450.00',
        variance: '$0.00 (0.0%)',
        status: 'MATCHED',
      },
    ],
    paymentTerms: 'ACH Direct / Corporate Wire · Pre-approved Capex Q1',
    auditTrailId: 'EVT-MATCH-994101',
  },
  'INV-2026-0302': {
    id: 'INV-2026-0302',
    poNumber: 'PO-2026-0302',
    grnNumber: 'GRN-9938',
    vendor: 'Mobil Aero Fluids',
    vendorSlug: 'mobil-aero-fluids',
    invoiceDate: '2026-05-22',
    dueDate: '2026-06-21 (Net 30)',
    totalAmount: '$1,950.00',
    currency: 'USD',
    status: 'RECONCILED',
    matchConfidence: '100.0%',
    lineItems: [
      {
        sku: 'PART-LUB-09',
        desc: 'POE Synthetic Lubricant ISO 68 5-Gal Pail',
        poQty: 10,
        grnQty: 10,
        invQty: 10,
        poPrice: '$195.00',
        invPrice: '$195.00',
        variance: '$0.00 (0.0%)',
        status: 'MATCHED',
      },
    ],
    paymentTerms: 'Corporate Purchasing Card · Discretionary Maintenance',
    auditTrailId: 'EVT-MATCH-993812',
  },
  'INV-2026-0285': {
    id: 'INV-2026-0285',
    poNumber: 'PO-2026-0285',
    grnNumber: 'GRN-9915',
    vendor: 'ABB Grid Power Services',
    vendorSlug: 'abb-grid-power-automation',
    invoiceDate: '2026-05-20',
    dueDate: '2026-06-19 (Net 30)',
    totalAmount: '$14,200.00',
    currency: 'USD',
    status: 'EXCEPTION_DISPUTED',
    matchConfidence: 'Partial Match (Quantity Variance)',
    lineItems: [
      {
        sku: 'PART-BSH-2000',
        desc: '2000kVA Bushing Kits · ELEC-TR-880',
        poQty: 4,
        grnQty: 2,
        invQty: 4,
        poPrice: '$7,100.00',
        invPrice: '$7,100.00',
        variance: '2 pcs pending receipt ($14,200.00 hold)',
        status: 'MISMATCH',
      },
    ],
    paymentTerms: 'Progress Milestone Transfer · Balance on Final Dock Acceptance',
    auditTrailId: 'EVT-DISP-028599',
  },
};

function resolveInvoice(id: string): InvoiceRecord {
  if (INVOICES[id]) return INVOICES[id];
  return {
    id,
    poNumber: 'PO-2026-0298',
    grnNumber: 'GRN-9941',
    vendor: 'General Industrial Supply',
    vendorSlug: 'grainger-industrial-supply',
    invoiceDate: '2026-05-24',
    dueDate: '2026-06-23 (Net 30)',
    totalAmount: '$1,250.00',
    currency: 'USD',
    status: 'RECONCILED',
    matchConfidence: '100.0%',
    lineItems: [
      {
        sku: 'PART-GEN-101',
        desc: 'General Maintenance Components Kit',
        poQty: 1,
        grnQty: 1,
        invQty: 1,
        poPrice: '$1,250.00',
        invPrice: '$1,250.00',
        variance: '$0.00',
        status: 'MATCHED',
      },
    ],
    paymentTerms: 'Standard Corporate Term',
    auditTrailId: 'EVT-MATCH-GEN01',
  };
}

export default async function InvoiceMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^INV-\d{4}-\d{4}$/.test(id)) notFound();

  const inv = resolveInvoice(id);

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/purchasing">Purchasing</Link>
        <span className="text-muted">/</span>
        <span className="text-muted">Invoices</span>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{inv.id}</span>
      </nav>

      {/* Hero Header */}
      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={inv.status === 'RECONCILED' ? 'pass' : 'fail'}>{inv.status}</Badge>
              <Badge variant="info">3-WAY MATCH ENGINE</Badge>
              <span className="text-xs font-mono text-muted">{inv.matchConfidence}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Invoice Reconciliation Dossier {inv.id}</h1>
            <p className="text-sm text-muted">
              Three-way matching between Purchase Order commitment, physical dock receipt (GRN), and electronic vendor invoice.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/purchasing/${inv.poNumber}?tab=match`}>
              <Button variant="secondary"><ArrowLeft size={16} /> Back to Purchase Order</Button>
            </Link>
            <Link href={`/audit-trail?search=${inv.auditTrailId}`}>
              <Button><ShieldCheck size={16} /> Audit Trail Proof</Button>
            </Link>
          </div>
        </div>

        {/* 3 Pillars Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Pillar 1: PO */}
          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex flex-col gap-1 text-xs">
            <span className="apex-label-caps text-muted">1. Purchase Commitment</span>
            <div className="flex justify-between items-center mt-1">
              <Link href={`/purchasing/${inv.poNumber}`} className="apex-id font-bold text-cobalt hover:underline text-sm">
                {inv.poNumber}
              </Link>
              <Badge variant="pass">AUTHORIZED</Badge>
            </div>
            <p className="text-muted mt-1">Vendor: <strong className="text-ink">{inv.vendor}</strong></p>
            <p className="text-muted">PO Total: <strong className="text-ink apex-id">{inv.totalAmount}</strong></p>
          </div>

          {/* Pillar 2: GRN */}
          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex flex-col gap-1 text-xs">
            <span className="apex-label-caps text-muted">2. Physical Dock Receipt</span>
            <div className="flex justify-between items-center mt-1">
              <span className="apex-id font-bold text-sm">{inv.grnNumber}</span>
              <Badge variant={inv.status === 'RECONCILED' ? 'pass' : 'warn'}>
                {inv.status === 'RECONCILED' ? '100% RECEIVED' : 'PARTIAL DOCK'}
              </Badge>
            </div>
            <p className="text-muted mt-1">Dock Location: <strong className="text-ink">Dock Bay 02</strong></p>
            <p className="text-muted">Barcode Scan: <strong className="text-ink">Idempotent Verified</strong></p>
          </div>

          {/* Pillar 3: Invoice */}
          <div className="bg-surface p-4 rounded-lg border border-border-subtle flex flex-col gap-1 text-xs">
            <span className="apex-label-caps text-muted">3. Vendor Invoice</span>
            <div className="flex justify-between items-center mt-1">
              <span className="apex-id font-bold text-sm">{inv.id}</span>
              <span className="apex-id font-bold text-sm text-pass">{inv.totalAmount}</span>
            </div>
            <p className="text-muted mt-1">Date: <span className="apex-id">{inv.invoiceDate}</span> · Due: <span className="apex-id">{inv.dueDate}</span></p>
            <p className="text-muted">Payment: <strong className="text-ink">{inv.paymentTerms}</strong></p>
          </div>
        </div>
      </section>

      {/* Line Item Match Table */}
      <section className="bg-card border border-border-subtle rounded-lg p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Scale size={18} className="text-cobalt" /> Line Item Reconciliation Matrix
          </h2>
          <span className="text-xs text-muted">Zero variance required for automated payment release</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-surface text-muted">
              <tr className="border-b border-border-subtle">
                <th className="p-3 font-semibold">SKU / Item</th>
                <th className="p-3 font-semibold">PO Qty</th>
                <th className="p-3 font-semibold">Dock GRN Qty</th>
                <th className="p-3 font-semibold">Invoiced Qty</th>
                <th className="p-3 font-semibold">PO Unit Price</th>
                <th className="p-3 font-semibold">Invoiced Price</th>
                <th className="p-3 font-semibold">Variance</th>
                <th className="p-3 font-semibold text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {inv.lineItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-subtle">
                  <td className="p-3">
                    <Link href={`/inventory/${item.sku}`} className="apex-id font-bold text-cobalt hover:underline block">
                      {item.sku}
                    </Link>
                    <span className="text-[11px] text-muted">{item.desc}</span>
                  </td>
                  <td className="p-3 font-mono">{item.poQty}</td>
                  <td className="p-3 font-mono font-bold text-pass">{item.grnQty}</td>
                  <td className="p-3 font-mono font-bold">{item.invQty}</td>
                  <td className="p-3 font-mono">{item.poPrice}</td>
                  <td className="p-3 font-mono">{item.invPrice}</td>
                  <td className="p-3 font-mono font-semibold">
                    {item.status === 'MATCHED' ? (
                      <span className="text-pass">{item.variance}</span>
                    ) : (
                      <span className="text-fail font-bold">{item.variance}</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Badge variant={item.status === 'MATCHED' ? 'pass' : 'fail'}>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dispute / Exception Banner */}
        {inv.status === 'EXCEPTION_DISPUTED' ? (
          <div className="bg-fail-bg border border-fail rounded-lg p-4 text-fail-ink flex items-start gap-3 text-xs">
            <AlertTriangle size={20} className="shrink-0 text-fail" />
            <div>
              <p className="font-bold">Quantity Discrepancy Exception Logged</p>
              <p className="mt-0.5">
                Vendor invoiced for 4 units, but Dock Bay 02 verified delivery of only 2 units. Automated payment hold applied. Vendor liaison (Elena Voronova) notified.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-pass-bg border border-pass rounded-lg p-4 text-pass-ink flex items-center gap-3 text-xs">
            <CheckCircle2 size={20} className="shrink-0 text-pass" />
            <div>
              <p className="font-bold">Automated 3-Way Match Reconciled Successfully</p>
              <p className="mt-0.5">
                Quantities, price cards, and tax allocations match within 0.00% variance. Payment voucher scheduled for automated batch release.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
