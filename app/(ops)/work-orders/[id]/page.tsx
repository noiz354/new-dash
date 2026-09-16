import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { SlaCountdown, LaborStopwatch } from '@/components/ops/WoTimers';
import { HoldDialog, EscalateDialog, ResumeDialog, CancelDialog, SignoffDialog, ExportDialog, PrintButton } from '@/components/ops/WoDialogs';
import { getSessionContext } from '@/lib/auth/context';
import { can } from '@/lib/auth/rbac';
import { getDb } from '@/db/client';
import { getWorkOrder, listWoEvents } from '@/lib/services/wo-service';
import { findSrByConvertedWo } from '@/lib/services/asset-service';
import { DomainError } from '@/lib/domain/errors';
import { CANON } from '@/lib/canon';

const PARTS = [
  { sku: CANON.sealSku, name: 'Silicon Carbide Mechanical Seal 2.5"', note: 'Dispensed & Installed (-1 from CRIB-B / Bay 01)', price: '$1,450.00', qty: '1 pc' },
  { sku: 'PART-LUB-09', name: 'POE Lubricant ISO 68', note: 'Dispensed (-1 from CRIB-B / Bay 01)', price: '$195.00', qty: '1 pc' },
  { sku: 'PART-FLTR-401', name: 'MERV 14 Chilled Water Filter', note: 'Reserved in Local Locker 4B', price: '$120.00', qty: '2 pc' },
];

/**
 * Work Order Detail — canon seal dossier (H1) with LIVE core fields:
 * status, SLA countdown, and toolbar transitions come from Postgres via
 * the state-machine API. Checklist steps / parts ledger / telemetry remain
 * canon-seeded content (DB-driven in slice #2).
 */
export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!ctx) redirect('/login');

  let wo;
  try {
    wo = await getWorkOrder(getDb(), ctx, id);
  } catch (err) {
    if (err instanceof DomainError && err.status === 404) {
      return (
        <EmptyState
          title={`Work order ${id} not found`}
          description="This record does not exist in your organization's database (cross-tenant reads are denied as 404). Run npm run db:setup if the dev database was wiped."
          action={<Link href="/work-orders"><Button>Back to Work Orders</Button></Link>}
        />
      );
    }
    throw err;
  }

  const [history, originSr] = await Promise.all([
    listWoEvents(getDb(), ctx, id),
    findSrByConvertedWo(getDb(), ctx, id),
  ]);

  const breached = wo.slaLabel.includes('BREACH');
  const dueAt = wo.slaDueAt ? new Date(wo.slaDueAt) : null;
  const startSec = dueAt ? Math.max(0, Math.floor((dueAt.getTime() - Date.now()) / 1000)) : 0;
  const transitionable = can(ctx.role, 'wo.transition');

  if (id !== CANON.workOrderSeal) {
    // ------------------------------------------------- generic live dossier --
    return (
      <>
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link className="text-muted hover:text-cobalt font-medium" href="/work-orders">Work Orders</Link>
          <span className="text-muted">/</span>
          <span className="font-semibold apex-id">{wo.number}</span>
        </nav>

        <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="wo-title-g">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={wo.isTerminal ? 'pass' : wo.status === 'ON_HOLD' || wo.status === 'ESCALATED' ? 'fail' : 'warn'}>{wo.statusLabel}</Badge>
                <Badge variant={wo.priority === 'P1' ? 'fail' : wo.priority === 'P2' ? 'warn' : 'info'}>{wo.priority}</Badge>
                {breached && !wo.isTerminal && <Badge variant="fail" pulse>SLA BREACH</Badge>}
              </div>
              <h1 id="wo-title-g" className="text-2xl font-semibold tracking-tight">
                {wo.title} <span className="apex-id text-cobalt font-semibold">{wo.number}</span>
              </h1>
              <p className="text-[13px] text-muted">
                {wo.location || 'Location not recorded'}
                {wo.assetCode && <> · asset <Link className="apex-id text-cobalt font-semibold hover:underline" href={`/assets/${wo.assetCode}`}>{wo.assetCode}</Link></>}
                {wo.tech && <> · assigned <strong className="text-ink">{wo.tech}</strong></>}
              </p>
              {originSr && (
                <p className="apex-id text-muted">
                  Origin: <Link className="text-cobalt font-semibold hover:underline" href={`/service-requests/${originSr.number}`}>{originSr.number}</Link> — {originSr.title}
                </p>
              )}
              {wo.holdReason && (
                <p className="text-[13px] font-semibold text-warn-ink bg-warn-bg rounded px-2 py-1 w-fit">ON HOLD — {wo.holdReason}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="apex-label-caps text-muted">SLA Countdown (real due {dueAt ? dueAt.toISOString().slice(11, 16) + ' UTC' : '—'})</span>
              <SlaCountdown startSec={startSec} breached={breached || wo.isTerminal} />
              <span className="apex-id text-muted">{wo.slaLabel}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <section className="xl:col-span-7 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-label="Transition history">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Transition History</h2>
              <span className="apex-id text-muted">work_order_events · WIB</span>
            </div>
            <ol className="flex flex-col gap-0 border-l-2 border-border-subtle ml-1">
              {history.map((h, i) => (
                <li key={`${h.ts}-${i}`} className="pl-4 py-1 relative">
                  <span className={`absolute -left-[7px] top-3 w-3 h-3 rounded-full ${h.action === 'COMPLETE' ? 'bg-pass' : h.action === 'HOLD' || h.action === 'ESCALATE' || h.action === 'CANCEL' ? 'bg-fail' : h.action === 'CREATE' ? 'bg-warn-dot' : 'bg-cobalt-deep'}`} />
                  <p className="text-[13px]">
                    <strong className="apex-id">{new Date(h.ts).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
                    {' '}— {h.action}{h.fromStatus && h.toStatus ? ` ${h.fromStatus} → ${h.toStatus}` : ''} · {h.actorName}
                    {h.reason && <span className="text-muted"> — {h.reason}</span>}
                  </p>
                </li>
              ))}
              {history.length === 0 && <li className="pl-4 text-[13px] text-muted">No transitions recorded yet.</li>}
            </ol>
            <p className="text-[11px] text-muted" role="note">
              Checklist, parts ledger, and telemetry dossiers are canon-seeded for {CANON.workOrderSeal} only — DB-driven
              execution records (tasks/parts/evidence) for every WO ship with the inventory &amp; evidence slice.
            </p>
          </section>
          <section className="xl:col-span-5 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-card" aria-label="Record">
            <h2 className="text-base font-semibold">Record</h2>
            <ul className="text-[13px] flex flex-col gap-1">
              <li className="flex justify-between"><span className="text-muted">Number</span><span className="apex-id font-semibold">{wo.number}</span></li>
              <li className="flex justify-between"><span className="text-muted">Priority / SLA window</span><span className="apex-id">{wo.priority} · {wo.priority === 'P1' ? '4h' : wo.priority === 'P2' ? '8h' : '24h'}</span></li>
              <li className="flex justify-between"><span className="text-muted">Status</span><span className="apex-id">{wo.statusLabel}{wo.isTerminal ? ' (terminal)' : ''}</span></li>
              <li className="flex justify-between"><span className="text-muted">Assignee</span><span>{wo.tech ?? 'Unassigned'}</span></li>
              <li className="flex justify-between"><span className="text-muted">Last update</span><span className="apex-id">{new Date(wo.updatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</span></li>
            </ul>
          </section>
        </div>

        <section className="no-print bg-[#213145] rounded-lg p-4 flex flex-wrap items-center gap-2" aria-label="Execution toolbar">
          <HoldDialog number={wo.number} status={wo.status} enabled={transitionable} />
          <EscalateDialog number={wo.number} status={wo.status} enabled={transitionable} />
          <ResumeDialog number={wo.number} status={wo.status} enabled={transitionable} />
          <SignoffDialog number={wo.number} status={wo.status} enabled={transitionable} />
          <CancelDialog number={wo.number} status={wo.status} enabled={transitionable} />
          <PrintButton />
        </section>
      </>
    );
  }

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/work-orders">Work Orders</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{wo.number}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="wo-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={wo.isTerminal ? 'pass' : wo.status === 'ON_HOLD' || wo.status === 'ESCALATED' ? 'fail' : 'warn'}>{wo.statusLabel}</Badge>
              <Badge variant="fail">{wo.priority} CRITICAL</Badge>
              {breached && !wo.isTerminal && <Badge variant="fail" pulse>SLA BREACH</Badge>}
              {!breached && wo.priority === 'P1' && !wo.isTerminal && <Badge variant="fail" pulse>CRITICAL SLA</Badge>}
            </div>
            <h1 id="wo-title" className="text-2xl font-semibold tracking-tight">
              {wo.title} <span className="apex-id text-cobalt font-semibold">{wo.number}</span>
            </h1>
            <p className="text-[13px] text-muted">
              Asset <Link className="apex-id text-cobalt font-semibold hover:underline" href="/assets/AST-HVAC-004">{CANON.assetSeal}</Link>
              {' '}· {CANON.assetOem} · S/N <span className="apex-id">{CANON.assetSerial}</span>
              {' '}· Health <strong className="text-fail">{CANON.assetHealth}/100 {CANON.assetHealthLabel}</strong>
              {wo.tech && <> · Assigned <strong className="text-ink">{wo.tech}</strong></>}
            </p>
            {wo.holdReason && (
              <p className="text-[13px] font-semibold text-warn-ink bg-warn-bg rounded px-2 py-1 w-fit">
                ON HOLD — {wo.holdReason}
              </p>
            )}
            <p className="apex-id text-muted">
              Origin: <Link className="text-cobalt font-semibold hover:underline" href="/field/findings/FND-2026-0188">{CANON.finding}</Link>
              {' → '}
              <Link className="text-cobalt font-semibold hover:underline" href={`/service-requests/${CANON.serviceRequest}`}>{CANON.serviceRequest}</Link>
              {' → '}<span className="font-semibold text-ink">{wo.number}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="apex-label-caps text-muted">SLA Countdown (real due {dueAt ? dueAt.toISOString().slice(11, 16) + ' UTC' : '—'})</span>
            <SlaCountdown startSec={startSec} breached={breached || wo.isTerminal} />
            <span className="apex-id text-muted">{wo.slaLabel} · Shift A {CANON.shiftA}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="apex-label-caps text-muted">Chiller Telemetry Stream (simulated)</span>
            <span className="apex-id text-muted">Modbus Bus: 192.168.4.112:502 (demo)</span>
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
            <h2 className="text-base font-semibold">Execution Checklist (canon-seeded)</h2>
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
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Labor Dispatch &amp; Time Clock</h2><Badge variant={wo.isTerminal ? 'info' : 'pass'} pulse={!wo.isTerminal}>{wo.isTerminal ? 'STOPPED' : 'ACTIVE CLOCK'}</Badge></div>
            <span className="apex-label-caps text-muted">Lead Tech (Shift A) Elapsed <span className="normal-case font-normal">(simulated until time-clock slice)</span></span>
            <LaborStopwatch />
            <span className="text-[11px] text-muted">{wo.tech ?? CANON.engineer} · RFID-7714 · Shift A {CANON.shiftA}</span>
          </section>
          <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-card" aria-label="Parts ledger">
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Parts Ledger (canon-seeded)</h2><Link href={`/inventory?wo=${wo.number}`}><Button variant="secondary">+ Requisition</Button></Link></div>
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
              <li className="flex justify-between"><span className="text-muted">LOTO padlock</span><span className="apex-id font-semibold text-pass">{CANON.lotoPadlock} · Seal Intact</span></li>
              <li className="flex justify-between"><span className="text-muted">Lockout point</span><span className="apex-id">{CANON.lotoPoint} · {CANON.lotoPanel}</span></li>
              <li className="flex justify-between"><span className="text-muted">Integrity SHA-256</span><span className="apex-id">7f8c92a10b48…</span></li>
            </ul>
          </section>
          <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-2 shadow-card" aria-label="Transition history">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Transition History</h2>
              <span className="apex-id text-muted">work_order_events · WIB</span>
            </div>
            <ol className="flex flex-col gap-0 border-l-2 border-border-subtle ml-1">
              {history.map((h, i) => (
                <li key={`${h.ts}-${i}`} className="pl-4 py-1 relative">
                  <span className={`absolute -left-[7px] top-3 w-3 h-3 rounded-full ${h.action === 'COMPLETE' ? 'bg-pass' : h.action === 'HOLD' || h.action === 'ESCALATE' ? 'bg-fail' : h.action === 'CREATE' ? 'bg-warn-dot' : 'bg-cobalt-deep'}`} />
                  <p className="text-[13px]">
                    <strong className="apex-id">{new Date(h.ts).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
                    {' '}— {h.action}{h.fromStatus && h.toStatus ? ` ${h.fromStatus} → ${h.toStatus}` : ''} · {h.actorName}
                    {h.reason && <span className="text-muted"> — {h.reason}</span>}
                  </p>
                </li>
              ))}
              {history.length === 0 && <li className="pl-4 text-[13px] text-muted">No transitions recorded yet.</li>}
            </ol>
          </section>
        </div>
      </div>

      <section className="no-print bg-[#213145] rounded-lg p-4 flex flex-wrap items-center gap-2" aria-label="Execution toolbar">
        <HoldDialog number={wo.number} status={wo.status} enabled={transitionable} />
        <EscalateDialog number={wo.number} status={wo.status} enabled={transitionable} />
        <ResumeDialog number={wo.number} status={wo.status} enabled={transitionable} />
        <SignoffDialog number={wo.number} status={wo.status} enabled={transitionable} />
        <CancelDialog number={wo.number} status={wo.status} enabled={transitionable} />
        <Link href="/shifts/plan"><Button variant="secondary">Shift Handover</Button></Link>
        <ExportDialog />
        <PrintButton />
      </section>
    </>
  );
}
