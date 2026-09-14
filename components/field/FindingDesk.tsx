'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, CheckCircle2, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

type WoType = 'EMERGENCY BREAKDOWN (WO-EM-01)' | 'CORRECTIVE MAINTENANCE (WO-CM-02)' | 'PREVENTIVE OVERHAUL (WO-PM-03)';
type Convert = 'idle' | 'converting' | 'converted';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 100;

const BOM = [
  { sku: CANON.sealSku, desc: 'Silicon Carbide Shaft Seal Assembly 2.5"', qty: '1 ea', bin: 'CRIB-B / Bay 01', cost: '$1,450.00' },
  { sku: 'PART-LUB-09', desc: 'Synthetic POE Refrigeration Lubricant ISO 68', qty: '1 pail (5 gal)', bin: 'CRIB-CHEM / Rack 02', cost: '$195.00' },
];

const OTHERS = [
  { id: 'FND-2026-0185', title: 'Emergency Starter Battery Bank Float Voltage', asset: 'AST-GEN-001', meta: '21.4 VDC vs 24.0 nominal · T. Chen · INS-2026-0409 · 2h ago' },
  { id: 'FND-2026-0182', title: 'Static Differential Pressure Across Stage 2 Filter', asset: 'AST-ENV-108', meta: '340 Pa vs 280 max · E. Voronova · INS-2026-0415 · 4h ago' },
];

/**
 * Findings Auto-WO Conversion Desk — desktop desk for FND-2026-0188.
 * Reference: stitch inspection_findings_auto_wo_conversion_desk (no H-prototype;
 * archive-faithful port). Canon fixes applied: GPS → 0.7893°S 113.9213°E
 * (archive EXIF 48.12°N is a Chicago-artefact), WIB timestamps, Rostova → Voronova.
 */
export function FindingDesk() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [woType, setWoType] = useState<WoType>('EMERGENCY BREAKDOWN (WO-EM-01)');
  const [loto, setLoto] = useState(false);
  const [convert, setConvert] = useState<Convert>('idle');
  const [dismissOpen, setDismissOpen] = useState(false);
  const [reason, setReason] = useState('');

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 9000);
  };

  const doConvert = () => {
    if (convert !== 'idle' || !loto) return;
    setConvert('converting');
    setTimeout(() => {
      setConvert('converted');
      push(true, 'WO auto-dispatched', `${CANON.workOrderSeal} created from ${CANON.finding} · M. Kowalski paged.`);
    }, 1200);
  };

  const doDismiss = () => {
    if (reason.trim().length < 10) return;
    setDismissOpen(false);
    push(true, 'Finding dismissed', `${CANON.finding} dismissed with justification · audit-chained.`);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/field/audits">Field Inspections</Link>
        <span className="text-muted">/</span>
        <span className="text-muted">Findings</span>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{CANON.finding}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="fnd-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="fail">CRITICAL FAIL</Badge>
              <Badge variant="fail">OSHA MANDATORY</Badge>
              <Badge variant="warn">SLA: &lt;30m TRIAGE</Badge>
              {convert === 'converted' ? <Badge variant="pass">CONVERTED → {CANON.workOrderSeal}</Badge> : <Badge variant="info">ACTIVE TRIAGE</Badge>}
            </div>
            <h1 id="fnd-title" className="text-2xl font-semibold tracking-tight">
              Refrigerant Line Primary Mechanical Shaft Seal <span className="apex-id text-cobalt font-semibold">{CANON.finding}</span>
            </h1>
            <p className="text-[13px] text-muted">
              <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/assets/${CANON.assetSeal}`}>{CANON.assetSeal}</Link>
              {' '}· Centrifugal Chiller Unit 04 (Basement Mech B-204) · 22m ago · M. Kowalski (Lead Tech) via{' '}
              <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/field/audits/${CANON.inspection}/run`}>{CANON.inspection}</Link>
            </p>
            <p className="text-[13px] flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-surface-subtle">
                Triage Rule <strong className="apex-id">#HVAC-LEAK-R134A</strong> · leaks &gt;10ppm → Emergency P1
              </span>
              <Badge variant="pass">ENFORCED</Badge>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button onClick={doConvert} disabled={!loto || convert !== 'idle'}>
              {convert === 'idle' && 'Convert Finding to WO & Auto-Dispatch'}
              {convert === 'converting' && 'Dispatching…'}
              {convert === 'converted' && 'Dispatched ✓'}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => push(true, 'PM scheduled', 'Routine PM drafted from finding · PM-PLN-0104 queue.')}>Schedule Routine PM</Button>
              <Dialog open={dismissOpen} onOpenChange={setDismissOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Dismiss Finding</Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="dismiss-h">
                  <DialogTitle id="dismiss-h">Dismiss {CANON.finding}</DialogTitle>
                  <DialogDescription>Dismissal requires a written justification. It is chained to the audit ledger.</DialogDescription>
                  <label className="apex-id font-bold" htmlFor="dismiss-reason">Justification (min 10 chars)</label>
                  <textarea
                    id="dismiss-reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-border-strong rounded text-[13px] outline-none focus:border-cobalt"
                    placeholder="e.g. Duplicate of FND-2026-0188 evidence pack…"
                  />
                  {reason.length > 0 && reason.trim().length < 10 && (
                    <p className="text-[11px] font-semibold text-fail">Justification too short — {10 - reason.trim().length} more chars needed.</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setDismissOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={doDismiss} disabled={reason.trim().length < 10}>Confirm Dismiss</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {!loto && convert === 'idle' && (
              <p className="text-[11px] font-semibold text-warn">Convert locked — acknowledge LOTO enforcement below.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Finding Record</h2>
            <dl className="text-[13px] grid grid-cols-2 gap-x-4 gap-y-1">
              <dt className="text-muted">Recorded At</dt><dd className="font-semibold">Today 14:15 WIB</dd>
              <dt className="text-muted">Certified Auditor</dt><dd className="font-semibold">M. Kowalski (Cert #882)</dd>
              <dt className="text-muted">Asset Tier</dt><dd className="font-semibold">Tier 1 Critical Mission</dd>
              <dt className="text-muted">Location Tag</dt><dd className="font-semibold">Mech Room B-204 / Pad 4</dd>
            </dl>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Criteria vs Actual</h2>
            <p className="text-[13px]"><strong className="text-pass">Nominal:</strong> hermetic seal integrity, 0.0 ppm R-134a threshold, flange torqued to 45 Nm.</p>
            <p className="text-[13px]"><strong className="text-fail">Actual:</strong> sniffer alarmed at <span className="apex-id font-bold">18.4 ppm R-134a</span>; oil emulsion weeping lower flange; slight bearing chirping on off-load spin down.</p>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Evidence Photo</h2>
            <Badge variant="pass">SHA-256 VERIFIED</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded bg-slate900 text-white flex items-center justify-center"><Camera size={22} /></span>
            <div className="text-[13px]">
              <p className="apex-id font-bold">PHOTO_CHILLER4_SEAL.RAW</p>
              <p className="text-muted">GPS 0.7893°S 113.9213°E ±1m · 14:20 WIB</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="ml-auto">Full Specimen View</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="spec-h">
                <DialogTitle id="spec-h">PHOTO_CHILLER4_SEAL.RAW</DialogTitle>
                <DialogDescription>GPS 0.7893°S 113.9213°E · SHA-256 7f8c92a10b48… · 14:20 WIB</DialogDescription>
                <div className="rounded bg-slate900 text-white p-8 flex flex-col items-center gap-2 text-center">
                  <Camera size={44} />
                  <p className="text-sm font-bold">Flange weeping · lower quadrant</p>
                  <p className="text-xs text-white/70">Oil emulsion + GPS overlay stamped</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Auto-WO Dispatch Profile <span className="apex-id text-muted font-normal">PRE-COMPILED VIA TEMPLATE #WO-HVAC-LEAK</span></h2>
            <Badge variant="fail">P1 · SCORE 94/100</Badge>
          </div>
          <fieldset>
            <legend className="apex-label-caps text-muted mb-1">Target Work Order Type</legend>
            <div className="flex flex-col gap-1" role="radiogroup" aria-label="Work order type">
              {(['EMERGENCY BREAKDOWN (WO-EM-01)', 'CORRECTIVE MAINTENANCE (WO-CM-02)', 'PREVENTIVE OVERHAUL (WO-PM-03)'] as WoType[]).map((t) => (
                <label key={t} className={cn('flex items-center gap-2 text-[13px] px-3 py-2 rounded border cursor-pointer', woType === t ? 'border-cobalt-deep bg-cobalt-tint font-semibold' : 'border-border-subtle bg-card')}>
                  <input type="radio" name="wo-type" checked={woType === t} onChange={() => setWoType(t)} className="accent-[#1E40AF]" />
                  <span className="apex-id">{t}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
            <div className="rounded border border-border-subtle bg-card p-3"><p className="apex-label-caps text-muted">Lead Technician</p><p className="font-semibold">Marcus Kowalski · HVAC Master</p><Badge variant="pass">AVAILABLE</Badge></div>
            <div className="rounded border border-border-subtle bg-card p-3"><p className="apex-label-caps text-muted">Target Completion SLA</p><p className="font-semibold">Today 18:15 WIB (4h window)</p><p className="text-muted text-xs">OSHA Clean Air Containment Mandate</p></div>
            <div className="rounded border border-border-subtle bg-card p-3"><p className="apex-label-caps text-muted">Generated Title &amp; Scope</p><p className="font-semibold">Primary Shaft Mechanical Seal Replacement</p><p className="text-muted text-xs">45 Nm torque · POE lube · purge cert</p></div>
          </div>
          {convert === 'converting' && (
            <div className="h-2 rounded bg-surface-subtle overflow-hidden" role="status" aria-label="Dispatching">
              <div className="h-full w-2/3 bg-cobalt rounded animate-pulse" />
            </div>
          )}
          {convert === 'converted' && (
            <p className="text-[13px] font-semibold text-pass">
              Dispatched as <Link className="apex-id underline" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link> · {woType} · M. Kowalski paged 14:36 WIB.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
          <h2 className="text-base font-semibold">Auto-Staged Spare Parts (BOM) <span className="text-xs font-normal text-muted">— all line items in Central Crib</span></h2>
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-muted border-b border-border-subtle"><th className="py-1 font-semibold">Part ID / SKU</th><th className="font-semibold">Description</th><th className="font-semibold">Qty</th><th className="font-semibold">Bin</th><th className="text-right font-semibold">Est. Cost</th></tr></thead>
            <tbody>
              {BOM.map((b) => (
                <tr key={b.sku} className="border-b border-surface-subtle">
                  <td className="py-1.5 apex-id font-bold text-cobalt">{b.sku}</td>
                  <td>{b.desc}</td><td>{b.qty}</td><td className="apex-id">{b.bin}</td>
                  <td className="text-right apex-id font-bold">{b.cost}</td>
                </tr>
              ))}
              <tr><td colSpan={4} className="py-1.5 text-right apex-label-caps text-muted">BOM Total</td><td className="text-right apex-id font-bold">$1,645.00</td></tr>
            </tbody>
          </table>
          <label className="flex items-start gap-2 text-[13px] bg-card border border-border-subtle rounded p-3 cursor-pointer">
            <input type="checkbox" checked={loto} onChange={(e) => setLoto(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#1E40AF]" />
            <span><strong>Enforce Mandatory LOTO 480V 3-Phase Lockout.</strong> <span className="text-muted">Technician cannot close or certify the WO without a signed dual-key lock voucher + gas sniffer purge certificate.</span></span>
          </label>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
          <h2 className="text-base font-semibold">Other Active Findings</h2>
          <ul className="flex flex-col divide-y divide-surface-subtle text-[13px]">
            {OTHERS.map((o) => (
              <li key={o.id} className="py-2 flex items-center justify-between gap-2">
                <span><span className="apex-id font-bold text-cobalt">{o.id}</span> · <span className="apex-id">{o.asset}</span> · <strong>{o.title}</strong> <span className="text-muted">— {o.meta}</span></span>
                <Link className="text-cobalt font-semibold hover:underline shrink-0" href={`/field/findings/${o.id}`}>Triage →</Link>
              </li>
            ))}
          </ul>
        </div>
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
