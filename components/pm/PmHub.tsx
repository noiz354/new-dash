'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CheckCircle2, FlaskConical, Plus, X, XCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface Plan {
  id: string; name: string; asset: string; zone: string; cadence: string;
  trigger: string; last: string; lastWo: string; next: string; state: string; cat: string;
}

const SEED: Plan[] = [
  { id: 'PM-PLN-0082', name: 'Monthly High-Speed Elevator Overhaul & Brake Test', asset: 'AST-ELEV-02', zone: 'East Shaft Core (L1-42)', cadence: 'Every 30 Days', trigger: 'Floating Interval', last: '12 Jan 2025', lastWo: 'WO-2025-0144', next: '3d OVERDUE', state: 'OVERDUE', cat: 'Elevators' },
  { id: 'PM-PLN-0056', name: 'Bi-Weekly Diesel Generator Load Bank Run', asset: 'AST-GEN-001', zone: 'Sub-Basement Vault B2', cadence: 'Every 14 Days', trigger: 'Calendar (Fixed)', last: '01 Feb 2025', lastWo: 'WO-2025-0421', next: 'Today 17:00 · Shift B window', state: 'DUE SOON', cat: 'Generators' },
  { id: CANON.pmPlan, name: 'Quarterly Chiller Loop & Compressor Overhaul', asset: CANON.assetSeal, zone: 'Central Utility Plant · Basement L2', cadence: '90d / 5,000 hrs', trigger: 'Hybrid Dual', last: '14 Nov 2024', lastWo: 'WO-2024-8902', next: 'In 2 Days · 188 run-hrs left', state: 'READY', cat: 'HVAC & Chillers' },
  { id: 'PM-PLN-0112', name: 'Semi-Annual Cleanroom HEPA Filter Audit', asset: 'AST-ENV-108', zone: 'Clean Lab Annex 4', cadence: 'Every 180 Days', trigger: 'Calendar (Fixed)', last: '28 Aug 2024', lastWo: 'WO-2024-6101', next: 'In 12 Days', state: 'SCHEDULED', cat: 'Life Safety' },
  { id: 'PM-PLN-0041', name: 'Annual Transformer Dielectric Oil Sampling', asset: 'AST-ELEC-01', zone: 'Grid Substation North Yard', cadence: 'Every 365 Days', trigger: 'Calendar (Fixed)', last: '19 Mar 2024', lastWo: 'WO-2024-2209', next: 'In 32 Days', state: 'SCHEDULED', cat: 'Generators' },
];

const CATS = ['All Plans', 'HVAC & Chillers', 'Elevators', 'Generators', 'Life Safety'] as const;
const CAT_COUNT: Record<string, number> = { 'All Plans': 38, 'HVAC & Chillers': 14, Elevators: 8, Generators: 10, 'Life Safety': 6 };

interface QItem { plan: string; label: string; detail: string; assignee: string; note: string; hours: number }

const QUEUE: QItem[] = [
  { plan: 'PM-PLN-0082', label: 'OVERDUE · 3d LATE', detail: 'Elevator #2 Traction Cable & Brake Test', assignee: 'M. Kowalski', note: 'Shift capacity stall', hours: 6.0 },
  { plan: 'PM-PLN-0056', label: 'DUE TODAY', detail: 'Emergency Diesel Generator Load Test', assignee: 'T. Chen', note: 'Fuel reservoir OK', hours: 2.5 },
  { plan: CANON.pmPlan, label: 'DUE IN 2D', detail: 'Chilled Water Loop & Compressor PM', assignee: 'HVAC Shift A', note: 'Parts staged (Bin 4A)', hours: 5.5 },
  { plan: 'PM-PLN-0099', label: 'TELEMETRY', detail: 'Air Compressor Oil Drain & Separator Swap', assignee: 'Plant Mech Shift', note: '>1,000 operating hrs', hours: 2.5 },
];

const WORKLOAD = [
  { w: 'Feb 15–17 (Weekend / Critical)', pct: 92, a: 'Shift A: 14.5h', b: 'Shift B: 9.8h' },
  { w: 'Feb 18–21 (Mid-Week Maintenance)', pct: 64, a: 'Shift A: 10.0h', b: 'Shift B: 7.2h' },
  { w: 'Feb 22–28 (Planned Shutdown Window)', pct: 78, a: 'Shift A: 18.2h', b: 'Shift B: 11.5h' },
];

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 800;

const stateTone = (s: string) =>
  s === 'OVERDUE' ? 'fail' : s === 'DUE SOON' ? 'warn' : s === 'READY' ? 'info' : 'hold';

/** PM Scheduling & Automation Hub — archive port (unit 6, no prototype). */
export function PmHub() {
  const [plans, setPlans] = useState<Plan[]>(SEED);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All Plans');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dispatched, setDispatched] = useState<Record<string, string>>({});
  const [dispatching, setDispatching] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [npName, setNpName] = useState('');
  const [npAsset, setNpAsset] = useState<string>(CANON.assetSeal);
  const [npDays, setNpDays] = useState('90');
  const [npTouched, setNpTouched] = useState(false);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = plans.filter((p) => {
    if (cat !== 'All Plans' && p.cat !== cat) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${p.id} ${p.name} ${p.asset}`.toLowerCase().includes(needle);
  });

  const executeBatch = () => {
    if (dispatching) return;
    const pending = QUEUE.filter((i) => !dispatched[i.plan]);
    if (pending.length === 0) {
      push(true, 'Batch clear', 'All queued plans already dispatched.');
      return;
    }
    setDispatching(true);
    push(true, 'Dispatch started', `Executing ${pending.length} queued plan(s) · parts + shift leads notified…`);
    pending.forEach((item, i) => {
      setTimeout(() => {
        // Sequential WO numbering continues past the vendor-drafted WO-2026-0905.
        const wo = `WO-2026-090${6 + Object.keys(dispatched).length + i}`;
        setDispatched((d) => ({ ...d, [item.plan]: wo }));
        if (i === pending.length - 1) {
          setDispatching(false);
          push(true, 'Batch dispatched', `${pending.length} WO(s) created · leads paged · parts allocated.`);
        }
      }, 700 * (i + 1));
    });
  };

  const createPlan = () => {
    setNpTouched(true);
    const days = parseInt(npDays, 10);
    if (!npName.trim() || !/^AST-[A-Z]+-\d{3}$/.test(npAsset.trim()) || !Number.isFinite(days) || days < 1) return;
    const id = `PM-PLN-${String(113 + plans.length - SEED.length).padStart(4, '0')}`;
    setPlans((p) => [...p, {
      id, name: npName.trim(), asset: npAsset.trim(), zone: 'Unassigned zone', cadence: `Every ${days} Days`,
      trigger: 'Calendar (Fixed)', last: '—', lastWo: '—', next: `In ${days} Days`, state: 'SCHEDULED', cat: 'HVAC & Chillers',
    }]);
    setNewOpen(false);
    setNpName('');
    setNpTouched(false);
    push(true, 'PM plan staged', `${id} · first cycle due in ${days}d · pending trigger binding.`);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">PM Master &amp; Automation Engine</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="pm-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Operations · <Badge variant="pass">SYS-RUNNING</Badge></p>
            <h1 id="pm-h" className="text-2xl font-semibold tracking-tight">Preventive Maintenance Scheduling &amp; Automation Engine</h1>
            <p className="text-[13px] text-muted">Recurring schedules, real-time SCADA telemetry triggers, automated batch WO dispatch.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/shifts/plan"><Button variant="secondary"><CalendarDays size={16} /> Shift Calendar View</Button></Link>
            <Button
              variant="secondary"
              onClick={() => {
                document.getElementById('dispatch-queue')?.scrollIntoView({ behavior: 'smooth' });
                push(true, 'Queue ready', `${QUEUE.filter((i) => !dispatched[i.plan]).length} plan(s) await execution below.`);
              }}
            >
              <Zap size={16} /> Generate Work Orders Now · {QUEUE.filter((i) => !dispatched[i.plan]).length} Ready
            </Button>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> New PM Plan Definition</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="np-h">
                <DialogTitle id="np-h">New PM Plan Definition</DialogTitle>
                <DialogDescription>Stages a calendar plan — trigger binding follows.</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="np-name">Plan name (required)</label>
                <Input id="np-name" value={npName} onChange={(e) => setNpName(e.target.value)} invalid={npTouched && !npName.trim()} placeholder="e.g. Monthly Cooling Tower Descale" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="np-asset">Target asset</label>
                    <Input id="np-asset" value={npAsset} onChange={(e) => setNpAsset(e.target.value.toUpperCase())} invalid={npTouched && !/^AST-[A-Z]+-\d{3}$/.test(npAsset.trim())} className="apex-id" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="np-days">Cadence (days)</label>
                    <Input id="np-days" inputMode="numeric" value={npDays} onChange={(e) => setNpDays(e.target.value)} invalid={npTouched && !(parseInt(npDays, 10) >= 1)} />
                  </div>
                </div>
                {npTouched && (!npName.trim() || !/^AST-[A-Z]+-\d{3}$/.test(npAsset.trim()) || !(parseInt(npDays, 10) >= 1)) && (
                  <p className="text-[11px] font-semibold text-fail">Name + AST-XXX-000 asset + cadence ≥ 1 day are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
                  <Button onClick={createPlan}>Stage Plan</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          {[
            { l: 'Total Active PM Plans', v: '38', s: '100% asset bound' },
            { l: 'PM Compliance Rate', v: '96.4%', s: '+1.4% vs 95.0% target · On track' },
            { l: 'Upcoming Cycles (14d)', v: '19', s: 'WOs scheduled · 7d lead window' },
            { l: 'Overdue / SLA Breach', v: '03', s: 'Overdue cycles · forced dispatch' },
            { l: 'Auto-Dispatch Engine', v: 'ACTIVE', s: 'Eval 24m 15s · Modbus OK · PID 8841-pm' },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
              <span className="apex-label-caps text-muted">{k.l}</span>
              <span className="text-xl font-semibold tabular-nums">{k.v}</span>
              <span className="text-[11px] text-muted">{k.s}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Hybrid Trigger Matrix — <span className="apex-id">{CANON.pmPlan}</span></h2>
            <Badge variant="warn">TRIGGER IMMINENT · METER LEADS</Badge>
          </div>
          <p className="text-xs text-muted -mt-2">Continuous telemetry ingestion across calendar milestones + Modbus runtime thresholds.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
            <div className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-1">
              <p className="apex-label-caps text-muted">Time Cadence Component · Fixed Interval</p>
              <p className="font-semibold">Every 90 calendar days</p>
              <div className="h-2 rounded bg-surface-subtle overflow-hidden" role="img" aria-label="Cycle elapsed 81 of 90 days">
                <div className="h-full bg-cobalt-deep" style={{ width: '90%' }} />
              </div>
              <p className="text-muted">Cycle elapsed 81 / 90d · due in 9d · 7d lead buffer pre-dispatch.</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-1">
              <p className="apex-label-caps text-muted">IoT Meter Component · 10.14.0.8:502</p>
              <p className="font-semibold">Every 5,000 operating hrs <span className="text-xs font-normal text-muted">(C7 — 2,500 cell fixed)</span></p>
              <div className="h-2 rounded bg-surface-subtle overflow-hidden" role="img" aria-label="Runtime 4812 of 5000 hours">
                <div className="h-full bg-warn" style={{ width: '96%' }} />
              </div>
              <p className="text-muted">Current 4,812 / 5,000h · <strong className="text-warn">188h left (≈4.2d)</strong> · MODBUS_REG_40112.</p>
              <p className="text-muted">Vibe 0.14 in/s nominal (trip &gt; 0.35 in/s RMS).</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-1">
              <p className="apex-label-caps text-muted">Evaluation Logic Engine · EXPR-TRUE</p>
              <p className="apex-id">IF (NOW ≥ LAST + 90d) OR (RUN_HOURS ≥ 5000) → DISPATCH_WO(PRIORITY=P2_HIGH, CHECKLIST=CL-HVAC-Q)</p>
              <p className="text-muted">Auto-assignee: HVAC Shift Team A · Parts: PART-FLTR-401 (×2), PART-LUB-09 (×1).</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter plans by ID, name, asset…" aria-label="Filter plans" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Plan categories">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn('h-8 px-3 rounded text-xs font-semibold border', cat === c ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}
            >
              {c} ({CAT_COUNT[c]})
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[980px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">Plan ID &amp; Nomenclature</th>
                <th className="font-semibold">Target Asset &amp; Zone</th>
                <th className="font-semibold">Cadence</th>
                <th className="font-semibold">Trigger Type</th>
                <th className="font-semibold">Last Executed</th>
                <th className="font-semibold">Next Scheduled</th>
                <th className="font-semibold">SLA Health</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2"><p className="apex-id font-bold text-cobalt">{p.id}</p><p>{p.name}</p></td>
                  <td>
                    {p.asset === CANON.assetSeal ? (
                      <Link className="apex-id font-bold text-cobalt hover:underline" href={`/assets/${p.asset}`}>{p.asset}</Link>
                    ) : (
                      <span className="apex-id font-bold">{p.asset}</span>
                    )}
                    <p className="text-xs text-muted">{p.zone}</p>
                  </td>
                  <td>{p.cadence}</td>
                  <td className="text-xs">{p.trigger}</td>
                  <td><p>{p.last}</p><p className="apex-id text-xs text-muted">{p.lastWo}</p></td>
                  <td>{p.next}</td>
                  <td><Badge variant={stateTone(p.state)}>{p.state}</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted">No seeded plans match — clear filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">Showing {filtered.length} of {plans.length} seeded plans (38 active).</p>

        <div id="dispatch-queue" className="rounded-lg border-2 border-warn bg-warn-bg/40 p-4 flex flex-col gap-3 scroll-mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Generation Dispatch Queue</h2>
            <span className="text-xs text-muted">Broker flagged {QUEUE.length} plans · dispatch allocates parts + pages shift leads.</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUEUE.map((i) => (
              <li key={i.plan} className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-1 text-[13px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="apex-id font-bold">{i.plan}</span>
                  {dispatched[i.plan] ? <Badge variant="pass">DISPATCHED → {dispatched[i.plan]}</Badge> : <Badge variant="warn">{i.label}</Badge>}
                </div>
                <p className="font-semibold">{i.detail}</p>
                <p className="text-muted text-xs">Assignee: {i.assignee} · {i.note} · {i.hours.toFixed(1)} man-hrs</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button onClick={executeBatch} disabled={dispatching}>
              <Zap size={16} /> {dispatching ? 'Dispatching…' : `Execute Dispatch Batch (${QUEUE.filter((i) => !dispatched[i.plan]).length} WOs)`}
            </Button>
            <Button variant="secondary" onClick={() => setSimOpen((s) => !s)}>
              <FlaskConical size={16} /> Simulate Generation Run
            </Button>
          </div>
          {simOpen && (
            <div className="rounded-lg border border-border-subtle bg-card p-3 text-[13px]" role="status">
              <p className="font-semibold">Simulation — est. workload 16.5 man-hrs</p>
              <ul className="text-muted">
                {QUEUE.map((i) => <li key={i.plan}>· {i.plan}: {i.hours.toFixed(1)}h · {i.assignee} · {i.note}</li>)}
              </ul>
              <p className="text-muted">Parts check: FLTR-401 ×2 + LUB-09 ×1 (0104) available · no shift over 92% capacity. Nothing dispatched — dry run only.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Shift Workload Balancing (14d) <span className="text-xs font-normal text-muted">Nusantara East Wing</span></h2>
            {WORKLOAD.map((w) => (
              <div key={w.w} className="text-[13px]">
                <div className="flex justify-between gap-2"><span>{w.w}</span><strong>{w.pct}% capacity</strong></div>
                <div className="h-2 rounded bg-surface-subtle overflow-hidden mt-1" role="img" aria-label={`${w.w} ${w.pct} percent`}>
                  <div className={cn('h-full', w.pct >= 90 ? 'bg-fail' : w.pct >= 75 ? 'bg-warn' : 'bg-pass')} style={{ width: `${w.pct}%` }} />
                </div>
                <p className="text-xs text-muted">{w.a} · {w.b}</p>
              </div>
            ))}
            <Link className="text-cobalt font-semibold hover:underline text-[13px]" href="/shifts/plan">Shift Plan →</Link>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">30-Day Dispatch Outlook</h2>
              <Badge variant="pass">IN SLA 96.4%</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded border border-border-subtle bg-card p-2"><p className="apex-label-caps text-muted">Ready now</p><p className="text-lg font-bold">4 plans</p></div>
              <div className="rounded border border-border-subtle bg-card p-2"><p className="apex-label-caps text-muted">14d window</p><p className="text-lg font-bold">19 cycles</p></div>
              <div className="rounded border border-border-subtle bg-card p-2"><p className="apex-label-caps text-muted">Overdue</p><p className="text-lg font-bold text-fail">03</p></div>
              <div className="rounded border border-border-subtle bg-card p-2"><p className="apex-label-caps text-muted">Compliance</p><p className="text-lg font-bold text-pass">96.4%</p></div>
            </div>
            <div className="rounded border border-border-subtle bg-card p-2 text-[13px]">
              <p className="font-semibold">Modbus SCADA Connection <Badge variant="pass">ACTIVE</Badge></p>
              <p className="apex-id text-muted">Gateway 10.14.0.8:502 (CUP-01) · 1,000ms poll · 99.98% zero packet drop</p>
            </div>
          </div>
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
