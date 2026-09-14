'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON, wibNow } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { AssetDialog, ConvertDialog, ZoneDialog } from './dialogs';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 200;

/** Service Request Detail — M2 port (reference: web/service-request-detail.html). */
export function ServiceRequestDetail({ initialAsset }: { initialAsset: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [zone, setZone] = useState('CUP-West');
  const [asset, setAsset] = useState(initialAsset);
  const [statusLine, setStatusLine] = useState(
    `Re-conversion is blocked while ${CANON.workOrderSeal} is IN PROGRESS (idempotent).`
  );

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const saveZone = (z: string) => {
    setZone(z);
    setStatusLine(`Zone set to ${z} · saved ${wibNow()} WIB.`);
    push(true, 'Zone saved', `${CANON.serviceRequest} → ${z}.`);
  };

  const pickAsset = (a: string) => {
    setAsset(a);
    setStatusLine(`Linked asset set to ${a} (M5 ?asset= prefill).`);
    push(true, 'Asset linked', a);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/service-requests">Service Requests</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{CANON.serviceRequest}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="sr-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="fail">P1 CRITICAL</Badge>
              <Badge variant="pass">CONVERTED → {CANON.workOrderSeal}</Badge>
              <Badge variant="pass">TRIAGE SLA MET · 11m</Badge>
            </div>
            <h1 id="sr-title" className="text-2xl font-semibold tracking-tight">
              Chiller #4 seal leak — water on plant floor <span className="apex-id text-cobalt font-semibold">{CANON.serviceRequest}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cobalt-deep text-white flex items-center justify-center text-[11px] font-bold">SM</span>
                Requestor <strong className="text-ink">{CANON.requestor}</strong> · Front Desk, East Wing
              </span>
              <span>
                Linked asset{' '}
                <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/assets/${asset}`}>{asset}</Link>{' '}
                <AssetDialog asset={asset} onPick={pickAsset} />
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <ConvertDialog />
            <div className="flex gap-2">
              <ZoneDialog zone={zone} onSave={saveZone} />
              <Button
                variant="secondary"
                onClick={() => push(true, 'Export queued', `${CANON.serviceRequest} ticket log → Reports.`)}
              >
                Export Ticket Log
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="conv-h">
          <h2 id="conv-h" className="text-base font-semibold">Conversion Result — SR → WO</h2>
          <div className="rounded-lg border border-pass bg-pass-bg p-4 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 apex-id">
              <span className="font-semibold">{CANON.serviceRequest}</span>
              <span aria-hidden="true">→</span>
              <Link className="font-bold text-cobalt hover:underline" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
              <Badge variant="pass">IN PROGRESS P1</Badge>
            </div>
            <ul className="text-[13px] text-pass-ink flex flex-col gap-0.5">
              <li>Converted 13:39 WIB by triage automation + dispatcher review · SLA 11m of 15m budget.</li>
              <li>Lead dispatched: {CANON.engineer} (Shift A) · LOTO {CANON.lotoPadlock} armed · evidence pack inherited from {CANON.finding}.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link href={`/work-orders/${CANON.workOrderSeal}`}>
                <Button>Review Converted WO</Button>
              </Link>
              <Link href={`/field/findings/${CANON.finding}`}>
                <Button variant="secondary">Open {CANON.finding}</Button>
              </Link>
            </div>
          </div>
          <div role="status" className="text-xs text-muted">{statusLine}</div>
        </section>

        <section className="xl:col-span-5 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="hist-h">
          <div className="flex items-center justify-between">
            <h2 id="hist-h" className="text-base font-semibold">Ticket History</h2>
            <span className="apex-id text-muted">per-ticket · WIB</span>
          </div>
          <ol className="flex flex-col gap-0 border-l-2 border-border-subtle ml-1">
            {[
              { t: '13:39', d: `Converted to ${CANON.workOrderSeal} · lead dispatched`, c: 'bg-pass' },
              { t: '13:31', d: `Triaged P1 · linked ${asset} · zone ${zone}`, c: 'bg-cobalt-deep' },
              { t: '13:28', d: `Filed by ${CANON.requestor} (Front Desk) · photo attached`, c: 'bg-warn-dot' },
            ].map((h) => (
              <li key={h.t} className="pl-4 py-1 relative">
                <span className={cn('absolute -left-[7px] top-3 w-3 h-3 rounded-full', h.c)} />
                <p className="text-[13px]"><strong>{h.t}</strong> — {h.d}</p>
              </li>
            ))}
          </ol>
          <div className="rounded-lg bg-surface-subtle p-3 text-[13px]">
            <p className="font-semibold">Batch Triage</p>
            <p className="text-muted">This ticket converted solo — batch converts SR-2026-0893 + SR-2026-0892 next (same zone, same shift).</p>
            <Link className="text-cobalt font-semibold hover:underline" href="/service-requests">Back to triage queue</Link>
          </div>
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 w-full max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.ok ? 'status' : 'alert'} className={cn('rounded-lg shadow-modal p-4 flex gap-3 items-start', t.ok ? 'bg-pass-bg border border-pass text-pass-ink' : 'bg-fail-bg border border-fail text-fail-ink')}>
            {t.ok ? <CheckCircle2 size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
            <div className="flex-1"><p className="text-sm font-bold">{t.title}</p><p className="text-xs">{t.msg}</p></div>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
