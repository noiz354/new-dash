'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton';
import { AuthDialog, DisputeDialog, RejectDialog, RfqDialog, type DisputeKind } from './dialogs';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

export type PurchaseTab = 'review' | 'receiving' | 'match' | 'signatures';
const TABS: { id: PurchaseTab; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'receiving', label: 'Receiving · GRN' },
  { id: 'match', label: '3-Way Match' },
  { id: 'signatures', label: 'Signatures' },
];

interface Toast { id: number; ok: boolean; title: string; msg: string; retry?: boolean }
let toastSeq = 1;

interface PurchaseDocMeta {
  id: string;
  kind: 'PO' | 'PR';
  title: string;
  vendor: string;
  vendorSlug: string;
  amount: string;
  status: string;
  statusVariant: 'pass' | 'warn' | 'fail' | 'info' | 'hold';
  carrier: string;
  waybill: string;
  linkedWo?: string;
  linkedAsset?: string;
  requestor: string;
  lineItems: { sku: string; desc: string; qty: string; unitPrice: string; total: string }[];
  matchStatus: 'matched' | 'partial' | 'pending';
}

const KNOWN_DOCS: Record<string, PurchaseDocMeta> = {
  [CANON.purchaseOrder]: {
    id: CANON.purchaseOrder,
    kind: 'PO',
    title: 'Silicon Carbide Shaft Seal 2.5" Kit replenishment',
    vendor: 'Trane Supply Co',
    vendorSlug: CANON.vendorSlug,
    amount: '$2,900.00',
    status: 'DISPATCHED',
    statusVariant: 'pass',
    carrier: 'FedEx Freight Priority',
    waybill: 'FX-9920148-US',
    linkedWo: CANON.workOrderSeal,
    linkedAsset: CANON.assetSeal,
    requestor: CANON.engineer,
    lineItems: [
      { sku: CANON.sealSku, desc: 'Silicon Carbide Shaft Seal 2.5" Kit', qty: '2 ea', unitPrice: '$1,450.00', total: '$2,900.00' }
    ],
    matchStatus: 'partial',
  },
  'PO-2026-0315': {
    id: 'PO-2026-0315',
    kind: 'PO',
    title: 'Silicon Carbide Shaft Seal 2.5" Kit (Converted from PR-2026-0314)',
    vendor: 'Trane Co.',
    vendorSlug: CANON.vendorSlug,
    amount: '$2,900.00',
    status: 'DISPATCHED',
    statusVariant: 'pass',
    carrier: 'FedEx Freight Priority',
    waybill: 'FX-9920155-US',
    linkedWo: CANON.workOrderSeal,
    linkedAsset: CANON.assetSeal,
    requestor: CANON.engineer,
    lineItems: [
      { sku: CANON.sealSku, desc: 'Silicon Carbide Shaft Seal 2.5" Kit', qty: '2 ea', unitPrice: '$1,450.00', total: '$2,900.00' }
    ],
    matchStatus: 'partial',
  },
  'PR-2026-0314': {
    id: 'PR-2026-0314',
    kind: 'PR',
    title: 'Emergency Shaft Seal Requisition for Chiller #4',
    vendor: 'Trane EarthWise Direct',
    vendorSlug: CANON.vendorSlug,
    amount: '$2,900.00',
    status: 'ENDORSED → PO-2026-0315',
    statusVariant: 'pass',
    carrier: 'Pending Dispatch',
    waybill: 'Awaiting Carrier',
    linkedWo: CANON.workOrderSeal,
    linkedAsset: CANON.assetSeal,
    requestor: CANON.engineer,
    lineItems: [
      { sku: CANON.sealSku, desc: 'Silicon Carbide Shaft Seal 2.5" Kit', qty: '2 ea', unitPrice: '$1,450.00', total: '$2,900.00' }
    ],
    matchStatus: 'pending',
  },
  'PR-2026-0309': {
    id: 'PR-2026-0309',
    kind: 'PR',
    title: '10 Pails POE Synthetic Lubricant',
    vendor: 'Mobil Aero Fluids',
    vendorSlug: 'mobil-aero-fluids',
    amount: '$1,950.00',
    status: 'CONVERTED → PO-2026-0302',
    statusVariant: 'pass',
    carrier: 'Regional Freight',
    waybill: 'MOB-882109',
    requestor: 'J. Thorne · Lube Specialist',
    lineItems: [
      { sku: 'PART-LUB-09', desc: 'POE Synthetic Lubricant ISO 68 5-Gal Pail', qty: '10 pails', unitPrice: '$195.00', total: '$1,950.00' }
    ],
    matchStatus: 'matched',
  },
  'PO-2026-0302': {
    id: 'PO-2026-0302',
    kind: 'PO',
    title: '10 Pails POE Synthetic Lubricant',
    vendor: 'Mobil Aero Fluids',
    vendorSlug: 'mobil-aero-fluids',
    amount: '$1,950.00',
    status: 'CREATED',
    statusVariant: 'info',
    carrier: 'Regional Freight',
    waybill: 'MOB-882109',
    requestor: 'J. Thorne · Lube Specialist',
    lineItems: [
      { sku: 'PART-LUB-09', desc: 'POE Synthetic Lubricant ISO 68 5-Gal Pail', qty: '10 pails', unitPrice: '$195.00', total: '$1,950.00' }
    ],
    matchStatus: 'pending',
  },
  'PO-2026-0285': {
    id: 'PO-2026-0285',
    kind: 'PO',
    title: '2000kVA Bushing Kits · ELEC-TR-880',
    vendor: 'ABB Grid Power Services',
    vendorSlug: 'abb-grid-power-automation',
    amount: '$28,400.00',
    status: 'PARTIAL',
    statusVariant: 'warn',
    carrier: 'Heavy Haul Logistics',
    waybill: 'ABB-TR-9941',
    linkedAsset: 'AST-ELEC-002',
    requestor: 'E. Vance · Chief Electrical',
    lineItems: [
      { sku: 'PART-BSH-2000', desc: '2000kVA Transformer Bushing Assembly Kit', qty: '4 sets', unitPrice: '$7,100.00', total: '$28,400.00' }
    ],
    matchStatus: 'partial',
  },
  'PR-2026-0295': {
    id: 'PR-2026-0295',
    kind: 'PR',
    title: 'Non-standard cordless power tool accessories',
    vendor: 'Grainger Industrial',
    vendorSlug: 'grainger-industrial-supply',
    amount: '$850.00',
    status: 'REJECTED BY VP',
    statusVariant: 'fail',
    carrier: 'N/A',
    waybill: 'N/A',
    requestor: 'Front Desk Maintenance',
    lineItems: [
      { sku: 'TOOL-ACC-01', desc: 'Cordless Power Tool Impact Bits & Accessories', qty: '1 kit', unitPrice: '$850.00', total: '$850.00' }
    ],
    matchStatus: 'pending',
  },
};

function resolveDoc(id: string): PurchaseDocMeta {
  if (KNOWN_DOCS[id]) return KNOWN_DOCS[id];
  const isPr = id.startsWith('PR');
  return {
    id,
    kind: isPr ? 'PR' : 'PO',
    title: isPr ? `Requisition for Facility Spares (${id})` : `Procurement Order for Facility Maintenance (${id})`,
    vendor: 'Grainger Industrial Supply',
    vendorSlug: 'grainger-industrial-supply',
    amount: '$1,250.00',
    status: isPr ? 'PENDING_APPROVAL' : 'DISPATCHED',
    statusVariant: isPr ? 'warn' : 'pass',
    carrier: 'Standard Ground Freight',
    waybill: `TRK-${id.replace(/[^0-9]/g, '')}`,
    requestor: 'Field Maintenance Crew',
    lineItems: [
      { sku: 'PART-GEN-101', desc: 'General Maintenance Components and Replacement Kit', qty: '1 lot', unitPrice: '$1,250.00', total: '$1,250.00' }
    ],
    matchStatus: 'pending',
  };
}

export function PurchaseDetail({ initialTab, docId = CANON.purchaseOrder }: { initialTab: PurchaseTab; docId?: string }) {
  const router = useRouter();
  const doc = resolveDoc(docId);
  const [tab, setTab] = useState<PurchaseTab>(initialTab);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sla, setSla] = useState(48 * 60);
  const [endorsed, setEndorsed] = useState(doc.status.includes('ENDORSED') || doc.status === 'DISPATCHED');
  const [grn, setGrn] = useState<'draft' | 'posting' | 'posted' | 'disputed'>(doc.id === 'PO-2026-0285' ? 'draft' : 'posted');
  const [grnMsg, setGrnMsg] = useState(doc.id === 'PO-2026-0285' ? '2 of 4 kits received on dock.' : 'Initial dock delivery verified.');
  const [match, setMatch] = useState<'partial' | 'running' | 'matched'>(doc.matchStatus === 'matched' ? 'matched' : 'partial');

  const push = useCallback((ok: boolean, title: string, msg: string, retry = false) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg, retry }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 9000);
  }, []);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    const t = setInterval(() => setSla((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const breached = sla === 0;

  const showTab = (t: PurchaseTab) => {
    setTab(t);
    router.replace(`/purchasing/${doc.id}?tab=${t}`, { scroll: false });
  };

  const endorse = () => {
    setEndorsed(true);
    push(true, `${doc.kind} endorsed`, `${doc.id} → endorsement acknowledged and recorded in ledger.`);
  };

  const postGrn = () => {
    if (grn === 'posting') return;
    if (grn === 'posted') {
      setGrnMsg(`Duplicate suppressed — receipt for ${doc.id} already verified.`);
      push(true, 'Idempotent replay', 'Same key → single posting. Ledger untouched.');
      return;
    }
    setGrn('posting');
    setGrnMsg(`Posting GRN for ${doc.id}…`);
    setTimeout(() => {
      setGrn('posted');
      setGrnMsg(`GRN-9941 POSTED · Line items added to CRIB-B.`);
      push(true, 'GRN posted', `GRN recorded for ${doc.id} · inventory ledger updated.`);
    }, 900);
  };

  const onDisputed = (_kind: DisputeKind) => {
    setGrn('disputed');
    setGrnMsg(`GRN for ${doc.id} DISPUTED — vendor claim opened.`);
  };

  const runMatch = () => {
    if (match === 'running') return;
    setMatch('running');
    setTimeout(() => {
      setMatch('matched');
      push(true, '3-Way Match', `${doc.id} · GRN · Invoice reconciled successfully.`);
    }, 900);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/purchasing">Purchasing &amp; POs</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{doc.id}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="po-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={doc.statusVariant}>{doc.status}</Badge>
              <Badge variant="hold">DOCK BAY 02</Badge>
              {breached ? (
                <Badge variant="fail" pulse>SLA BREACH — escalated to VP Operations</Badge>
              ) : (
                <Badge variant="warn">P1 SLA · <span className="tabular-nums">{Math.floor(sla / 60)}m {String(sla % 60).padStart(2, '0')}s</span> left</Badge>
              )}
            </div>
            <h1 id="po-title" className="text-2xl font-semibold tracking-tight">
              {doc.id} <span className="text-base font-normal text-muted">· {doc.title}</span>
            </h1>
            <p className="text-[13px] text-muted">
              Vendor <Link className="font-semibold text-cobalt hover:underline" href={`/vendors/${doc.vendorSlug}`}>{doc.vendor}</Link>
              {' '}· Waybill <span className="apex-id">{doc.waybill}</span> ({doc.carrier})
              {doc.linkedWo && <> · Linked <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/work-orders/${doc.linkedWo}`}>{doc.linkedWo}</Link></>}
              {doc.linkedAsset && <> · Asset <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/assets/${doc.linkedAsset}`}>{doc.linkedAsset}</Link></>}
            </p>
            <p className="text-[13px]">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-subtle">
                Amount: <strong className="apex-id text-cobalt">{doc.amount}</strong> · Requestor: <strong>{doc.requestor}</strong>
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <AuthDialog push={push} />
            <RfqDialog push={push} />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => push(true, 'Export queued', `${doc.id} dossier → Reports.`)}>Export</Button>
              <Link href={`/purchasing/${CANON.purchaseOrder}/print`}><Button variant="secondary">Print PO Batch</Button></Link>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border-subtle" role="tablist" aria-label="Purchase tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => showTab(t.id)}
              className={cn(
                'h-10 px-4 text-[13px] font-semibold border-b-2',
                tab === t.id ? 'border-cobalt-deep text-cobalt' : 'border-transparent text-muted hover:text-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'review' && (
          <div role="tabpanel" className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Document Details — {doc.id}</h2>
                <Badge variant={doc.statusVariant}>{doc.status}</Badge>
              </div>
              <p className="text-[13px] text-muted">
                {doc.title} · Vendor: <strong className="text-ink">{doc.vendor}</strong>
              </p>
              
              <div className="overflow-x-auto rounded border border-border-subtle mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-subtle text-muted">
                    <tr>
                      <th className="p-2">Line Item / SKU</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Unit Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {doc.lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 apex-id font-bold text-cobalt">
                          <Link href={`/inventory/${item.sku}`} className="hover:underline">{item.sku}</Link>
                        </td>
                        <td className="p-2">{item.desc}</td>
                        <td className="p-2 apex-id">{item.qty}</td>
                        <td className="p-2 apex-id">{item.unitPrice}</td>
                        <td className="p-2 text-right apex-id font-bold">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
                <span>Total Amount <strong className="apex-id">{doc.amount}</strong></span>
                <span className="flex gap-2 ml-auto">
                  <Button onClick={endorse}>Endorse / Authorize</Button>
                  <RejectDialog push={push} />
                </span>
              </div>
              <p className="text-xs text-muted" role="status">
                {endorsed ? `${doc.id} authorized & active in procurement ledger.` : 'Awaiting procurement endorsement.'}
              </p>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
              <h2 className="text-base font-semibold">Related Procurement Documents</h2>
              <ul className="flex flex-col divide-y divide-surface-subtle text-sm">
                <li className="py-2 flex items-center justify-between gap-2">
                  <span><span className="apex-id font-semibold text-cobalt">{CANON.purchaseOrder}</span> · Silicon Carbide Shaft Seal 2.5&quot; Kit</span>
                  <Link className="text-cobalt font-semibold hover:underline" href={`/purchasing/${CANON.purchaseOrder}`}>View</Link>
                </li>
                <li className="py-2 flex items-center justify-between gap-2">
                  <span><span className="apex-id font-semibold text-cobalt">PO-2026-0302</span> · CREATED from PR-2026-0309</span>
                  <Link className="text-cobalt font-semibold hover:underline" href="/purchasing/PO-2026-0302">Review</Link>
                </li>
                <li className="py-2 flex items-center justify-between gap-2">
                  <span><span className="apex-id font-semibold text-cobalt">PO-2026-0285</span> · PARTIAL RECEIPT</span>
                  <Link className="text-cobalt font-semibold hover:underline" href="/purchasing/PO-2026-0285?tab=receiving">Receive</Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'receiving' && (
          <div role="tabpanel" className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Goods Receipt — Dock Bay 02</h2>
                {grn === 'posted' && <Badge variant="pass">GRN VERIFIED</Badge>}
                {grn === 'draft' && <Badge variant="warn">GRN DRAFT</Badge>}
                {grn === 'posting' && <Badge variant="info">POSTING…</Badge>}
                {grn === 'disputed' && <Badge variant="fail">GRN DISPUTED</Badge>}
              </div>
              <p className="text-[13px] text-muted">Waybill {doc.waybill} · scanner active · posting is idempotent (same key on retry, double-post blocked).</p>
              {grn === 'posting' && <TableSkeleton rows={2} />}
              <div className="flex flex-wrap gap-2">
                <Button onClick={postGrn} disabled={grn === 'posting'}>Post GRN</Button>
                <DisputeDialog push={push} onDisputed={onDisputed} />
              </div>
              <p className="text-[13px] text-muted" role="status">{grnMsg}</p>
            </div>
          </div>
        )}

        {tab === 'match' && (
          <div role="tabpanel" className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">3-Way Match — PO · GRN · Invoice</h2>
                {match === 'matched' && <Badge variant="pass">MATCHED — 3-way reconciled</Badge>}
                {match === 'partial' && <Badge variant="warn">PARTIAL — reconciliation pending</Badge>}
                {match === 'running' && <Badge variant="info">MATCHING…</Badge>}
              </div>
              {match === 'running' ? (
                <TableSkeleton rows={3} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded border border-border-subtle p-3">
                    <p className="apex-label-caps text-muted">{doc.id}</p>
                    <p className="apex-id font-bold">{doc.amount} · {doc.lineItems.length} line items</p>
                    <p className="text-pass font-semibold">Order Matched ✓</p>
                  </div>
                  <div className="rounded border border-border-subtle p-3">
                    <p className="apex-label-caps text-muted">GRN Status</p>
                    <p className="apex-id font-bold">Dock Bay 02 verification</p>
                    <p className="text-pass font-semibold">Qty Reconciled ✓</p>
                  </div>
                  <div className="rounded border border-border-subtle p-3">
                    <p className="apex-label-caps text-muted">Invoice {doc.id.replace('PO', 'INV').replace('PR', 'INV')}</p>
                    <p className="apex-id font-bold">{doc.amount} · {doc.vendor}</p>
                    <p className={match === 'matched' ? 'text-pass font-semibold' : 'text-warn font-semibold'}>{match === 'matched' ? 'Reconciled ✓' : 'Awaiting electronic invoice'}</p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={runMatch} disabled={match === 'running'}>Run Match</Button>
                <DisputeDialog push={push} onDisputed={onDisputed} />
              </div>
            </div>
          </div>
        )}

        {tab === 'signatures' && (
          <div role="tabpanel" className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
              <h2 className="text-base font-semibold">Approval Chain — quorum 2 of 3</h2>
              <ul className="flex flex-col divide-y divide-surface-subtle text-sm">
                <li className="py-2 flex items-center justify-between gap-2"><span><strong>Marcus Vance</strong> · VP Operations &amp; Facilities</span><Badge variant="pass">SIGNED 13:52 WIB</Badge></li>
                <li className="py-2 flex items-center justify-between gap-2"><span><strong>{doc.requestor}</strong> · Originating technician</span><Badge variant="pass">SIGNED 13:44 WIB</Badge></li>
                <li className="py-2 flex items-center justify-between gap-2"><span><strong>Finance Approver</strong> · Procurement controller</span><Badge variant="warn">PENDING — quorum met, dispatch allowed</Badge></li>
              </ul>
            </div>
          </div>
        )}
      </section>

      <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 w-full max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.ok ? 'status' : 'alert'} className={cn('rounded-lg shadow-modal p-4 flex gap-3 items-start', t.ok ? 'bg-pass-bg border border-pass text-pass-ink' : 'bg-fail-bg border border-fail text-fail-ink')}>
            {t.ok ? <CheckCircle2 size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
            <div className="flex-1">
              <p className="text-sm font-bold">{t.title}</p>
              <p className="text-xs">{t.msg}</p>
              {t.retry && (
                <button type="button" onClick={() => push(true, 'Retry queued', 'Same Idempotency-Key — no duplicate.')} className="mt-1 h-8 px-3 rounded bg-card/60 text-xs font-bold">
                  Retry
                </button>
              )}
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}><X size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
