'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Phone, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON, canonPhone } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { AmendDialog, CommendDialog, DispatchDialog, PdfDialog } from './dialogs';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 300;

const OPEN_WORK = [
  { id: CANON.workOrderSeal, desc: 'Seal replacement · IN PROGRESS P1', href: `/work-orders/${CANON.workOrderSeal}`, cta: 'Open WO', mono: true },
  { id: CANON.purchaseOrder, desc: 'Trane Supply Co · DISPATCHED', href: `/purchasing/${CANON.purchaseOrder}`, cta: 'Open PO', mono: true },
  { id: 'PO-2026-0315', desc: 'EarthWise Direct · pending dispatch', href: '/purchasing/PO-2026-0315?tab=review', cta: 'Authorize', mono: true },
  { id: CANON.pmPlan, desc: 'Quarterly chiller PM batch', href: '/preventive-maintenance', cta: 'Open PM', mono: true },
];

const PERF = [
  { label: 'On-time arrival', value: '96.4%', width: 96 },
  { label: 'First-time fix', value: '91.2%', width: 91 },
  { label: 'SLA adherence', value: '98.1%', width: 98 },
];

/** Vendor Detail — M1 port (reference: web/vendor-detail.html). */
export function VendorDetail() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };
  const phone = canonPhone('vendor');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/vendors">Vendors &amp; Contractors</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">{CANON.vendorName}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="v-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="pass">TIER-1 · MISSION CRITICAL</Badge>
              <Badge variant="pass">MSA ACTIVE · {CANON.msaDaysLeft}d left</Badge>
            </div>
            <h1 id="v-title" className="text-2xl font-semibold tracking-tight">{CANON.vendorName}</h1>
            <p className="text-[13px] text-muted">
              Chillers &amp; EarthWise service · MSA <span className="apex-id font-semibold text-ink">{CANON.msa}</span> (Chilled Water Core) · Trane Care Platinum #TC-8891-B
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex items-center gap-2">
                <Phone size={16} className="text-muted" />
                <span className="apex-label-caps text-muted">Priority Dispatch Line (24/7)</span>
                <strong className="apex-id">{phone} (Ext. 4 Ops)</strong>
              </span>
              <Button
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => push(true, 'Ringing dispatch desk', `${phone} Ext. 4 Ops · Tier-1 line.`)}
              >
                Direct Ring
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <DispatchDialog push={push} />
            <PdfDialog />
            <AmendDialog push={push} />
            <CommendDialog push={push} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="apex-label-caps text-muted">Master Service Agreement lifecycle</span>
            <span className="apex-id text-muted">Executed 2024 · {CANON.msaDaysLeft}d remaining of 730d</span>
          </div>
          <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden flex" role="img" aria-label={`MSA elapsed 57 percent, ${CANON.msaDaysLeft} days remaining`}>
            <div className="bg-pass h-full" style={{ width: '57%' }} />
          </div>
          <div className="flex justify-between apex-id text-muted"><span>Executed</span><span>Mid-term review ✓</span><span>Renewal window (90d)</span></div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="open-h">
          <h2 id="open-h" className="text-base font-semibold">Open Work &amp; Orders</h2>
          <ul className="flex flex-col divide-y divide-surface-subtle text-[13px]">
            {OPEN_WORK.map((w) => (
              <li key={w.id} className="py-2 flex items-center justify-between gap-2">
                <span><span className="apex-id font-semibold text-cobalt">{w.id}</span> · {w.desc}</span>
                <Link className="text-cobalt font-semibold hover:underline shrink-0" href={w.href}>{w.cta}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="xl:col-span-5 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="perf-h">
          <h2 id="perf-h" className="text-base font-semibold">Performance · trailing 90d</h2>
          <ul className="flex flex-col gap-3 text-[13px]">
            {PERF.map((p) => (
              <li key={p.label}>
                <div className="flex justify-between"><span className="text-muted">{p.label}</span><strong>{p.value}</strong></div>
                <div className="h-2 rounded-full bg-surface-subtle overflow-hidden mt-1">
                  <div className="h-full bg-pass" style={{ width: `${p.width}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="apex-id text-muted">Source: vendor scorecard · measured, not self-reported.</p>
        </section>
      </div>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="docs-h">
        <h2 id="docs-h" className="text-base font-semibold">Contract Documents</h2>
        <ul className="flex flex-col divide-y divide-surface-subtle text-[13px]">
          <li className="py-2 flex items-center justify-between gap-2">
            <span><strong>{CANON.msa} Executed</strong> · signed 12 Mar 2024 · 28 pages</span>
            <PdfDialog triggerLabel="View" />
          </li>
          <li className="py-2 flex items-center justify-between gap-2">
            <span><strong>Amendment A1</strong> · rate card 2025 · under review</span>
            <AmendDialog push={push} triggerLabel="Continue Amendment" />
          </li>
          <li className="py-2 flex items-center justify-between gap-2">
            <span><strong>Trane_CVHE.pdf</strong> · O&amp;M manual · linked to {CANON.assetSeal}</span>
            <Link className="text-cobalt font-semibold hover:underline" href={`/assets/${CANON.assetSeal}`}>Open Asset</Link>
          </li>
        </ul>
      </section>

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
