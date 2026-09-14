'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface Toast { id: number; title: string; msg: string }
let toastSeq = 400;

/** Shift Plan — A→B handover (reference: web/shift-plan.html). */
export function ShiftPlan() {
  const [accepted, setAccepted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const accept = () => {
    if (accepted) return;
    setAccepted(true);
    const id = toastSeq++;
    setToasts((t) => [...t, { id, title: 'Handover accepted', msg: `${CANON.workOrderSeal} · timer transfers at 15:00.` }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link className="text-muted hover:text-cobalt font-medium" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
          <span className="text-muted">/</span>
          <span className="font-semibold">Shift Plan · A → B Handover</span>
        </nav>
        <Link href="/preventive-maintenance">
          <Button>PM Hub</Button>
        </Link>
      </div>
      <p className="text-xs text-muted -mt-4">Site hours Sen–Sab 07:00–22:00 WIB · tenant {CANON.tenant}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="bg-card border-2 border-cobalt-deep rounded-lg p-4 flex flex-col gap-2" aria-label="Shift A">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shift A · ON SHIFT</h2>
            <span className="apex-id font-bold">{CANON.shiftA.replace(' WIB', '')}</span>
          </div>
          <ul className="text-sm flex flex-col gap-1">
            <li className="flex justify-between gap-2"><span><strong>{CANON.engineer}</strong> · Lead Tech</span><span className="text-xs font-bold text-pass">CLOCKED IN</span></li>
            <li className="flex justify-between gap-2"><span>2 techs · CUP-West</span><span className="text-xs text-muted">all active</span></li>
          </ul>
          <div className="h-2 rounded-full bg-cobalt-tint overflow-hidden" role="img" aria-label="Shift A 82 percent elapsed">
            <div className="h-full bg-cobalt-deep" style={{ width: '82%' }} />
          </div>
          <p className="text-xs text-muted">82% elapsed · handover window opens 15:00</p>
        </section>

        <section className="bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-2" aria-label="Shift B">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shift B · NEXT</h2>
            <span className="apex-id font-bold">15:30–23:00</span>
          </div>
          <ul className="text-sm flex flex-col gap-1">
            <li className="flex justify-between gap-2"><span>Shift B lead</span><span className="text-xs font-bold text-warn">STANDBY</span></li>
            <li className="flex justify-between gap-2"><span>2 techs · CUP-West</span><span className="text-xs text-muted">briefed 14:50</span></li>
          </ul>
          <Link href="/field/audits" className="h-9 rounded bg-cobalt-tint text-sm font-semibold inline-flex items-center justify-center mt-auto">
            Field Audits (B)
          </Link>
        </section>

        <section className="bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-2" aria-label="Shift handover queue">
          <h2 className="font-semibold">Handover Queue</h2>
          <ul className="text-sm flex flex-col gap-2">
            <li className="rounded-lg border border-warn-dot bg-warn-bg p-2">
              <p className="font-semibold"><span className="apex-id">{CANON.workOrderSeal}</span> · Step 04 torqued, photo pending</p>
              <p className="text-xs text-warn-ink">ACTIVE CLOCK 01:42:18 — stop or transfer at handover.</p>
              <div className="flex gap-2 mt-2">
                <Link href={`/work-orders/${CANON.workOrderSeal}`} className="flex-1 h-9 rounded bg-cobalt-deep text-white text-sm font-semibold inline-flex items-center justify-center">
                  Open WO
                </Link>
                <Button variant="secondary" className="flex-1 border-cobalt-deep text-cobalt-deep" onClick={accept} disabled={accepted}>
                  {accepted ? 'Accepted ✓' : 'Accept (B)'}
                </Button>
              </div>
            </li>
            <li className="rounded-lg border border-border-subtle p-2">
              <p className="font-semibold"><span className="apex-id">{CANON.inspection}</span> · {CANON.inspectionProgress}% · FAIL Step 02 open</p>
              <Link className="text-sm font-semibold text-cobalt-deep hover:underline" href={`/field/audits/${CANON.inspection}/run`}>Resume run</Link>
            </li>
          </ul>
          <p className="text-xs text-muted" role="status">
            {accepted ? `Accepted by Shift B lead · ${CANON.workOrderSeal} timer transferred 15:00.` : '1 handover pending · window 15:00–15:30.'}
          </p>
        </section>
      </div>

      <section className="bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-2" aria-label="Timeline">
        <h2 className="font-semibold">Today Timeline (WIB)</h2>
        <ol className="flex flex-col gap-0 border-l-2 border-border-subtle ml-1 text-sm">
          {[
            { t: '07:00', d: `Shift A start · toolbox talk · LOTO ${CANON.lotoPadlock} verified`, c: 'bg-pass' },
            { t: '13:39', d: `${CANON.serviceRequest} → ${CANON.workOrderSeal} dispatched`, c: 'bg-cobalt-deep' },
            { t: '15:00', d: 'Handover window opens (pending)', c: 'bg-warn-dot' },
            { t: '15:30', d: 'Shift B start', c: 'bg-hold-dot' },
          ].map((h) => (
            <li key={h.t} className="pl-4 py-1 relative">
              <span className={cn('absolute -left-[7px] top-2 w-3 h-3 rounded-full', h.c)} />
              <strong>{h.t}</strong> — {h.d}
            </li>
          ))}
        </ol>
      </section>

      <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 w-full max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="rounded-lg shadow-modal p-3 flex gap-2 items-start text-sm bg-pass-bg border border-pass text-pass-ink">
            <CheckCircle2 size={20} className="shrink-0" />
            <div><p className="font-bold">{t.title}</p><p className="text-xs">{t.msg}</p></div>
          </div>
        ))}
      </div>
    </>
  );
}
