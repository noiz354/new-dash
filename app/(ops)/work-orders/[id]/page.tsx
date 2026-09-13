import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { SlaCountdown, LaborStopwatch } from '@/components/ops/WoTimers';
import { HoldDialog, EscalateDialog, SignoffDialog, ExportDialog, PrintButton } from '@/components/ops/WoDialogs';
import { CANON } from '@/lib/canon';

const PARTS = [
  { sku: CANON.sealSku, name: 'Silicon Carbide Mechanical Seal 2.5"', note: 'Dispensed & Installed (-1 from CRIB-B / Bay 01)', price: '$1,450.00', qty: '1 pc' },
  { sku: 'PART-LUB-09', name: 'POE Lubricant ISO 68', note: 'Dispensed (-1 from CRIB-B / Bay 01)', price: '$195.00', qty: '1 pc' },
  { sku: 'PART-FLTR-401', name: 'MERV 14 Chilled Water Filter', note: 'Reserved in Local Locker 4B', price: '$120.00', qty: '2 pc' },
];

/** Work Order Detail — Fase F rebuild of H1 (reference: web/work-order-detail.html). */
export default function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (id !== CANON.workOrderSeal) {
    return (
      <EmptyState
        title={`Work order ${id}`}
        description="Outside the Fase F seed — full rebuild of this record ships in wave 2 (TODO Fase 2)."
        action={
          <Link href={`/work-orders/${CANON.workOrderSeal}`}>
            <Button>Open {CANON.workOrderSeal} instead</Button>
          </Link>
        }
      />
    );
  }
  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/work-orders">Work Orders</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{CANON.workOrderSeal}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="wo-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warn">IN PROGRESS</Badge>
              <Badge variant="fail">P1 CRITICAL</Badge>
              <Badge variant="fail" pulse>CRITICAL SLA</Badge>
            </div>
            <h1 id="wo-title" className="text-2xl font-semibold tracking-tight">
              Primary Shaft Mechanical Seal Replacement <span className="apex-id text-cobalt font-semibold">{CANON.workOrderSeal}</span>
            </h1>
            <p className="text-[13px] text-muted">
              Asset <Link className="apex-id text-cobalt font-semibold hover:underline" href="/assets/AST-HVAC-004">{CANON.assetSeal}</Link>
              {' '}· {CANON.assetOem} · S/N <span className="apex-id">{CANON.assetSerial}</span>
              {' '}· Health <strong className="text-fail">68/100 NEEDS OVERHAUL</strong>
            </p>
            <p className="apex-id text-muted">
              Origin: <Link className="text-cobalt font-semibold hover:underline" href="/field/findings/FND-2026-0188">{CANON.finding}</Link>
              {' → '}
              <Link className="text-cobalt font-semibold hover:underline" href={`/service-requests/${CANON.serviceRequest}`}>{CANON.serviceRequest}</Link>
              {' → '}<span className="font-semibold text-ink">{CANON.workOrderSeal}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="apex-label-caps text-muted">SLA Countdown</span>
            <SlaCountdown />
            <span className="apex-id text-muted">Breach at 15:12 WIB · Shift A 07:00–15:30 WIB</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="apex-label-caps text-muted">Live Chiller Telemetry Stream</span>
            <span className="apex-id text-muted">Modbus Bus: 192.168.4.112:502</span>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { l: 'Seal Cavity Temp', v: '84.1°C', s: '▲ Above 80°C trip watch', c: 'text-fail' },
              { l: 'Bearing Vibration', v: '7.8 mm/s', s: '▲ Above 7.8mm/s safety trip', c: 'text-fail' },
              { l: 'Refrigerant Sniff', v: '18.4 ppm', s: 'R-134a trace at lower flange', c: 'text-warn' },
              { l: 'Chilled Water ΔP', v: '6.9 BAR', s: '● Within DN300 envelope', c: 'text-pass' },
            ].map((t) => (
              <div key={t.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
                <span className="apex-label-caps text-muted">{t.l}</span>
                <span className="text-xl font-semibold tabular-nums">{t.v}</span>
                <span className={`text-[11px] font-semibold ${t.c}`}>{t.s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-label="Execution checklist">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Execution Checklist</h2>
            <span className="apex-id text-muted">3 of 5 steps verified</span>
          </div>
          <ol className="flex flex-col gap-2">
            {[
              { n: 'STEP 01', t: 'Permit & LOTO Isolation — Padlock #4092', d: 'Energy isolated at Panel DP-02 lockout point M-44. Zero-energy verified by E. Voronova · 08:04 WIB.' },
              { n: 'STEP 02', t: 'Refrigerant Recovery & Housing Drain', d: '4.5 kg R-134a recovered to cylinder R-REC-11. Housing drained and solvent-wiped · 09:12 WIB.' },
              { n: 'STEP 03', t: 'Defective Seal Extraction & Face Inspection', d: 'Carbon face scored; defect logged to FND-2026-0188 evidence pack · 10:27 WIB.' },
            ].map((s) => (
              <li key={s.n} className="rounded-lg border border-border-subtle bg-surface p-4 flex gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-pass-bg text-pass flex items-center justify-center text-sm font-bold">✓</span>
                <div><p className="text-[13px]"><span className="apex-id text-muted">{s.n}</span> <strong>{s.t}</strong></p><p className="text-[13px] text-muted">{s.d}</p></div>
              </li>
            ))}
            <li className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-2" aria-current="step">
              <p className="text-[13px]"><span className="apex-id text-muted">STEP 04 · ACTIVE</span> <span className="apex-id bg-cobalt-tint text-cobalt-deep px-1.5 py-0.5 rounded font-semibold">SKU: {CANON.sealSku}</span></p>
              <h3 className="text-base font-semibold">Replace Worn Primary Shaft Mechanical Seal</h3>
              <p className="text-[13px] text-muted">Extract defective seal cartridge from scroll chassis housing. Clean housing mating surface with solvent, apply POE lubricant, seat Trane OEM silicon carbide seal assembly. Torque bolts cross-pattern to 45 Nm.</p>
              <p className="text-[13px] bg-[#EFF4FF] rounded p-2">Old seal removed, carbon face scored. Torquing new Trane OEM seal to 45 Nm using calibrated CDI torque wrench #CAL-2025-98. <span className="text-warn font-semibold">(verification photo required for sign-off)</span></p>
            </li>
            <li className="rounded-lg border border-dashed border-border-strong bg-surface p-4 flex gap-3 opacity-80">
              <span className="w-6 h-6 shrink-0 rounded-full bg-hold-bg text-hold flex items-center justify-center text-sm">🔒</span>
              <div><p className="text-[13px]"><span className="apex-id text-muted">STEP 05 · LOCKED</span> <strong>Pressure Test &amp; Commissioning</strong></p><p className="text-[13px] text-muted">Unlocks after Step 04 sign-off + LOTO release + verification photo.</p></div>
            </li>
          </ol>
        </section>

        <div className="xl:col-span-5 flex flex-col gap-6">
          <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-card" aria-label="Labor">
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Labor Dispatch &amp; Time Clock</h2><Badge variant="pass" pulse>ACTIVE CLOCK</Badge></div>
            <span className="apex-label-caps text-muted">Lead Tech (Shift A) Elapsed</span>
            <LaborStopwatch />
            <span className="text-[11px] text-muted">{CANON.engineer} · Senior Field Tech · RFID-7714 · Shift A 07:00–15:30 WIB</span>
          </section>
          <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-card" aria-label="Parts ledger">
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Parts Ledger</h2><Link href={`/inventory?wo=${CANON.workOrderSeal}`}><Button variant="secondary">+ Requisition</Button></Link></div>
            <ul className="flex flex-col divide-y divide-surface-subtle">
              {PARTS.map((p) => (
                <li key={p.sku} className="py-2 flex items-center justify-between gap-2">
                  <div><p className="apex-id font-bold text-cobalt">{p.sku}</p><p className="text-[11px] font-medium">{p.name}</p><p className="apex-id text-muted">{p.note}</p></div>
                  <div className="text-right"><p className="apex-id font-bold">{p.price}</p><p className="apex-id text-muted">{p.qty}</p></div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border-subtle pt-2"><span className="apex-label-caps text-muted">Ledger Total</span><span className="text-base font-semibold font-mono">$1,765.00</span></div>
          </section>
          <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-card" aria-label="Compliance">
            <h2 className="text-base font-semibold">Compliance · OSHA 1910.147</h2>
            <ul className="text-[13px] flex flex-col gap-1">
              <li className="flex justify-between"><span className="text-muted">LOTO padlock</span><span className="apex-id font-semibold text-pass">#4092 · Seal Intact</span></li>
              <li className="flex justify-between"><span className="text-muted">Lockout point</span><span className="apex-id">M-44 · Panel DP-02</span></li>
              <li className="flex justify-between"><span className="text-muted">Integrity SHA-256</span><span className="apex-id">7f8c92a10b48…</span></li>
            </ul>
          </section>
        </div>
      </div>

      <section className="no-print bg-[#213145] rounded-lg p-4 flex flex-wrap items-center gap-2" aria-label="Execution toolbar">
        <HoldDialog />
        <EscalateDialog />
        <SignoffDialog />
        <Link href="/shifts/plan"><Button variant="secondary">Shift Handover</Button></Link>
        <ExportDialog />
        <PrintButton />
      </section>
    </>
  );
}
