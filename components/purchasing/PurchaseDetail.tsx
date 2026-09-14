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

export function PurchaseDetail({ initialTab }: { initialTab: PurchaseTab }) {
  const router = useRouter();
  const [tab, setTab] = useState<PurchaseTab>(initialTab);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sla, setSla] = useState(48 * 60);
  const [endorsed, setEndorsed] = useState(true);
  const [grn, setGrn] = useState<'draft' | 'posting' | 'posted' | 'disputed'>('draft');
  const [grnMsg, setGrnMsg] = useState('Not posted yet in this session.');
  const [match, setMatch] = useState<'partial' | 'running' | 'matched'>('partial');

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
    router.replace(`/purchasing/${CANON.purchaseOrder}?tab=${t}`, { scroll: false });
  };

  const endorse = () => {
    setEndorsed(true);
    push(true, 'PR endorsed', 'PR-2026-0314 → POST /api/v1/procurement/pr-0314/endorse acknowledged.');
  };

  const postGrn = () => {
    if (grn === 'posting') return;
    if (grn === 'posted') {
      setGrnMsg('Duplicate suppressed — key idem-grn-9941-po0298 already posted. No double stock.');
      push(true, 'Idempotent replay', 'Same key → single posting. Ledger untouched.');
      return;
    }
    setGrn('posting');
    setGrnMsg('Posting GRN-9941…');
    setTimeout(() => {
      setGrn('posted');
      setGrnMsg('GRN-9941 POSTED · +2 seal kits to CRIB-B / Bay 01.');
      push(true, 'GRN posted', 'GRN-9941 · +2 seal kits · ledger updated.');
    }, 900);
  };

  const onDisputed = (_kind: DisputeKind) => {
    setGrn('disputed');
    setGrnMsg('GRN-9941 DISPUTED — vendor claim opened.');
  };

  const runMatch = () => {
    if (match === 'running') return;
    setMatch('running');
    setTimeout(() => {
      setMatch('matched');
      push(true, '3-Way Match', 'PO-2026-0298 · GRN-9941 · INV-2026-1188 reconciled.');
    }, 900);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/purchasing">Purchasing &amp; POs</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{CANON.purchaseOrder}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="po-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="pass">DISPATCHED</Badge>
              <Badge variant="hold">DOCK BAY 02</Badge>
              {breached ? (
                <Badge variant="fail" pulse>SLA BREACH — escalated to VP Operations</Badge>
              ) : (
                <Badge variant="warn">P1 SLA · <span className="tabular-nums">{Math.floor(sla / 60)}m {String(sla % 60).padStart(2, '0')}s</span> left</Badge>
              )}
            </div>
            <h1 id="po-title" className="text-2xl font-semibold tracking-tight">
              {CANON.purchaseOrder} <span className="text-base font-normal text-muted">· Silicon Carbide Shaft Seal 2.5&quot; Kit replenishment</span>
            </h1>
            <p className="text-[13px] text-muted">
              Vendor <Link className="font-semibold text-cobalt hover:underline" href="/vendors/trane-technologies">Trane Supply Co</Link>
              {' '}· {CANON.msa} · Waybill <span className="apex-id">FX-9920148-US</span> (FedEx Freight Priority)
              {' '}· Linked <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
              {' '}· Asset <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/assets/${CANON.assetSeal}`}>{CANON.assetSeal}</Link>
            </p>
            <p className="text-[13px]">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-subtle">
                Envelope: <strong>CUP Maintenance Capex Q1</strong> · <strong className="apex-id">$64,200.00</strong> · remaining <strong className="apex-id text-pass">$61,300.00</strong>
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <AuthDialog push={push} />
            <RfqDialog push={push} />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => push(true, 'Export queued', 'PO-2026-0298 dossier → Reports.')}>Export</Button>
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
                <h2 className="text-base font-semibold">Source Request {CANON.purchaseRequest}</h2>
                <span className="px-1.5 py-0.5 rounded bg-fail text-white apex-id font-bold">CHILLER PLANT EMERGENCY</span>
              </div>
              <p className="text-[13px] text-muted">
                Silicon Carbide Shaft Seal 2.5&quot; Kit · SKU <span className="apex-id text-cobalt font-semibold">{CANON.sealSku}</span>
                {' '}· Trane EarthWise Direct · linked <Link className="text-cobalt font-semibold hover:underline" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
                {' '}· critical asset <span className="apex-id font-semibold">{CANON.assetSeal}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span>Amount <strong className="apex-id">$2,900.00</strong></span>
                <span className="text-muted text-[13px]">Endorse via <span className="apex-id">POST /api/v1/procurement/pr-0314/endorse</span></span>
                <span className="flex gap-2 ml-auto">
                  <Button onClick={endorse}>Endorse PR</Button>
                  <RejectDialog push={push} />
                </span>
              </div>
              <p className="text-xs text-muted" role="status">
                {endorsed ? 'PR-2026-0314 endorsed 13:41 WIB · converted to PO-2026-0315 (pending dispatch).' : 'Awaiting endorsement.'}
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
              <h2 className="text-base font-semibold">Related Documents</h2>
              <ul className="flex flex-col divide-y divide-surface-subtle text-sm">
                <li className="py-2 flex items-center justify-between gap-2"><span><span className="apex-id font-semibold text-cobalt">PO-2026-0302</span> · CREATED from PR-2026-0309</span><Link className="text-cobalt font-semibold hover:underline" href="/purchasing/PO-2026-0302">Review</Link></li>
                <li className="py-2 flex items-center justify-between gap-2"><span><span className="apex-id font-semibold text-cobalt">PO-2026-0285</span> · PARTIAL RECEIPT</span><Link className="text-cobalt font-semibold hover:underline" href={`/purchasing/${CANON.purchaseOrder}?tab=receiving`}>Receive</Link></li>
                <li className="py-2 flex items-center justify-between gap-2"><span><span className="apex-id font-semibold text-cobalt">GRN-9941</span> · POSTED · +2 seal kits · CRIB-B / Bay 01</span><button className="text-cobalt font-semibold hover:underline" onClick={() => showTab('receiving')}>Audit</button></li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'receiving' && (
          <div role="tabpanel" className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Goods Receipt — Dock Bay 02</h2>
                {grn === 'posted' && <Badge variant="pass">GRN-9941 POSTED</Badge>}
                {grn === 'draft' && <Badge variant="warn">GRN DRAFT</Badge>}
                {grn === 'posting' && <Badge variant="info">POSTING…</Badge>}
                {grn === 'disputed' && <Badge variant="fail">GRN DISPUTED</Badge>}
              </div>
              <p className="text-[13px] text-muted">Waybill FX-9920148-US · scanner active · posting is idempotent (same key on retry, double-post blocked).</p>
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
                {match === 'matched' && <Badge variant="pass">MATCHED — 3-way reconciled by AI</Badge>}
                {match === 'partial' && <Badge variant="warn">PARTIAL — invoice pending</Badge>}
                {match === 'running' && <Badge variant="info">MATCHING…</Badge>}
              </div>
              {match === 'running' ? (
                <TableSkeleton rows={3} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded border border-border-subtle p-3"><p className="apex-label-caps text-muted">PO-2026-0298</p><p className="apex-id font-bold">$2,900.00 · 2 ea seal kit</p><p className="text-pass font-semibold">Matched by AI ✓</p></div>
                  <div className="rounded border border-border-subtle p-3"><p className="apex-label-caps text-muted">GRN-9941</p><p className="apex-id font-bold">2 ea received · Dock Bay 02</p><p className="text-pass font-semibold">Qty reconciled ✓</p></div>
                  <div className="rounded border border-border-subtle p-3"><p className="apex-label-caps text-muted">INV-2026-1188</p><p className="apex-id font-bold">$2,900.00 · Trane Supply Co</p><p className={match === 'matched' ? 'text-pass font-semibold' : 'text-warn font-semibold'}>{match === 'matched' ? 'Reconciled ✓' : 'Awaiting vendor upload'}</p></div>
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
                <li className="py-2 flex items-center justify-between gap-2"><span><strong>{CANON.engineer}</strong> · Requesting technician</span><Badge variant="pass">SIGNED 13:44 WIB</Badge></li>
                <li className="py-2 flex items-center justify-between gap-2"><span><strong>Finance Approver</strong> · Capex envelope guardian</span><Badge variant="warn">PENDING — quorum met, dispatch allowed</Badge></li>
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
