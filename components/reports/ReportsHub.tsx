'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, CalendarClock, CheckCircle2, Database, Download, Eye, FileText, Play, TrendingDown, TrendingUp, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { downloadText } from '@/lib/download';
import { apiFetch } from '@/lib/api/client';

interface Aggregates {
  workOrders: { total: number; open: number; completed: number };
  assets: { totalRegistered: number };
  inventory: { totalSkus: number; lowStockSkus: number; valuationUsd: string };
  serviceRequests: { total: number; converted: number };
}

const MONTHS = [
  { m: 'JAN', v: 292 }, { m: 'FEB', v: 298 }, { m: 'MAR', v: 275 },
  { m: 'APR', v: 280 }, { m: 'MAY', v: 284 }, { m: 'JUN (Est)', v: 290 },
];
const BUDGET = 305;

const CATS = [
  { n: 'HVAC & Central Utility Plant (CUP)', d: 'Chillers, Cooling Towers, BAS automation', v: '$600,033', p: 42.0 },
  { n: 'Electrical & High Voltage Switchgear', d: 'Transformers, UPS arrays, ATS generators', v: '$342,876', p: 24.0 },
  { n: 'Fire & Life Safety Suppression', d: 'VESDA detectors, dry chemical risers', v: '$214,297', p: 15.0 },
  { n: 'Plumbing & Water Treatment', d: 'Reverse osmosis, graywater pumps', v: '$157,151', p: 11.0 },
  { n: 'Elevators & Vertical Conveyance', d: 'Otis SkyRise 1-8 hydraulic traction', v: '$114,293', p: 8.0 },
];

const SLA = [
  { p: 'Priority 1 · Emergency', max: '4.0h', avg: '1.4 hrs avg', buf: '2.6h Buffer (65% margin)', tgt: 'Target: < 4.0h', met: '100% Met (42 / 42 tickets)', pct: 100 },
  { p: 'Priority 2 · Urgent Routine', max: '8.0h', avg: '3.2 hrs avg', buf: '4.8h Buffer (60% margin)', tgt: 'Target: < 8.0h', met: '97.8% Met (184 / 188 tickets)', pct: 97.8 },
  { p: 'Priority 3 · Routine PM', max: '24.0h', avg: '5.1 hrs avg', buf: '18.9h Buffer (78% margin)', tgt: 'Target: < 24.0h', met: '99.4% Met (628 / 632 tickets)', pct: 99.4 },
];

interface Dossier { id: string; title: string; cat: string; meta: string; gen: string; owner: string; cadence: string; status: string }

const DOSSIERS: Dossier[] = [
  { id: 'RPT-OPEX-2026-M05', title: 'Comprehensive Maintenance Cost & Variance Ledger', cat: 'Financial & OPEX', meta: '42 Pages · Full General Ledger sync', gen: 'Today, 08:00 UTC', owner: 'Marcus Vance (VP Ops)', cadence: 'Monthly Automated (1st of month)', status: 'GAAP / SOX Compliant' },
  { id: 'RPT-REL-CHLR-004', title: 'Asset Health, Telemetry & Critical Downtime Dossier', cat: 'Reliability Engineering', meta: 'Focus: Chiller #04, Substation B, Boiler #02', gen: 'Yesterday, 18:30 UTC', owner: 'Automated Telemetry Daemon', cadence: 'Weekly on Mondays (06:00 UTC)', status: 'ISO 55001 Aligned' },
  { id: 'RPT-WFM-SHIFT-02', title: 'Technician Field Productivity & Labor Utilization', cat: 'Workforce Operations', meta: '96 Active Techs · 88.4% wrench time logged', gen: '2 Days Ago', owner: 'Shift Lead Sarah K.', cadence: 'Bi-weekly Shift Cycle', status: '0.00 TRIR Safety Zero' },
  { id: 'RPT-INV-FIFO-91', title: 'Spare Parts Inventory Valuation & Dead Stock Audit', cat: 'Supply Chain', meta: '18 SKUs flagged reorder · FIFO cost basis', gen: 'May 14, 2026', owner: 'Logistics Officer Kenji R.', cadence: 'Monthly Audit (15th)', status: 'Reconciled Ledger' },
];

const RANGES = ['Last 7 Days', 'L30D Rolling', 'Q1 2026', 'YTD 2026'] as const;
const FACS = ['HQ Campus - East Wing (Active)', 'Central Utility Plant B-204', 'High Voltage Substation A/B', 'West Tower Commercial Annex', 'Logistics Warehouse Crib #4', 'All Aggregated Locations (Cluster)'] as const;
const FAC_IDS = ['HQ-EAST-NUSANTARA', 'CUP-B2-MECH', 'SUBSTN-AB', 'WEST-TOWER-ANX', 'LOG-CRIB-04', 'ALL-CLUSTER'] as const;
const DIMS = ['Asset Class (HVAC, Mech, Power)', 'Failure Code (ISO 14224 Standard)', 'Vendor Tier & Service Provider', 'Cost Center & General Ledger Code', 'Work Order Type (Corrective vs PM)'] as const;
const DIM_SQL = ['asset_class', 'failure_code_iso14224', 'vendor_tier', 'cost_center_gl', 'wo_type'] as const;
const METRICS = [
  { n: 'Labor Hours', sql: 'SUM(labor_cost)' },
  { n: 'Parts Cost', sql: 'SUM(parts_cost)' },
  { n: 'Contractor Fees', sql: 'SUM(contractor_fees)' },
  { n: 'SLA Exposure', sql: 'AVG(mttr_hours)' },
] as const;
const OUTPUTS = ['PDF Executive Dossier', 'Formatted Excel (.xlsx)', 'Raw CSV / Parquet', 'Live Data Grid (simulated)'] as const;

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1400;

const download = (filename: string, text: string, type = 'text/csv') => downloadText(filename, text, type);

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Reports & Analytics Hub — archive port (unit 17). All charted figures
 * are archive values (monthly bars, category split sums exactly to the
 * OPEX KPI, SLA counts verbatim). Known Stitch reuses kept + documented:
 * $1,428,650 also appears as inventory catalog valuation (OPEX keeps it —
 * monthly bars + category split both reconcile to it); 1,840 "active"
 * SKUs vs 4,218 catalog SKUs read as stocked-subset vs master count.
 */
export function ReportsHub() {
  const [cat, setCat] = useState('All Report Classifications');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [schedOpen, setSchedOpen] = useState(false);
  const [schedRep, setSchedRep] = useState(DOSSIERS[0].id);
  const [schedCad, setSchedCad] = useState('Weekly on Mondays (06:00 UTC)');
  const [schedMail, setSchedMail] = useState('');
  const [schedTouched, setSchedTouched] = useState(false);
  const [scheduled, setScheduled] = useState<string[]>([
    'RPT-OPEX-2026-M05 · Monthly Automated (1st of month)',
    'RPT-REL-CHLR-004 · Weekly on Mondays (06:00 UTC)',
  ]);
  const [prev, setPrev] = useState<Dossier | null>(null);
  const [range, setRange] = useState<string>(RANGES[0]);
  const [fac, setFac] = useState<string>(FACS[0]);
  const [dim, setDim] = useState<string>(DIMS[0]);
  const [mets, setMets] = useState<string[]>(['Labor Hours', 'Parts Cost']);
  const [out, setOut] = useState<string>(OUTPUTS[2]);
  const [ran, setRan] = useState(false);
  const [agg, setAgg] = useState<Aggregates | null>(null);
  const [aggMs, setAggMs] = useState<number | null>(null);
  const [aggError, setAggError] = useState<string | null>(null);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = DOSSIERS.filter((d) => cat === 'All Report Classifications' || d.cat === cat);

  const manifest = (d: Dossier) => {
    const rows = [['section', 'key', 'value'],
      ['dossier', 'id', d.id], ['dossier', 'title', d.title], ['dossier', 'category', d.cat],
      ['dossier', 'meta', d.meta], ['dossier', 'last_generated', d.gen], ['dossier', 'owner', d.owner],
      ['dossier', 'cadence', d.cadence], ['dossier', 'compliance', d.status]];
    download(`${d.id}-manifest.csv`, rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'));
    push(true, 'Dossier manifest downloaded', `${d.id} · local extract (no replica).`);
  };

  const schedule = () => {
    setSchedTouched(true);
    if (!/.+@.+\..+/.test(schedMail.trim())) return;
    setScheduled((s) => [...s, `${schedRep} · ${schedCad} → ${schedMail.trim().toLowerCase()}`]);
    setSchedOpen(false);
    setSchedMail('');
    setSchedTouched(false);
    push(true, 'Dispatch scheduled', `${schedRep} · ${schedCad}.`);
  };

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 864e5);
  const monthAgo = new Date(today.getTime() - 30 * 864e5);
  const rangeSql = range === 'Last 7 Days' ? `BETWEEN '${isoDay(weekAgo)}' AND '${isoDay(today)}'`
    : range === 'L30D Rolling' ? `BETWEEN '${isoDay(monthAgo)}' AND '${isoDay(today)}'`
    : range === 'Q1 2026' ? `BETWEEN '2026-01-01' AND '2026-03-31'` : `BETWEEN '2026-01-01' AND '${isoDay(today)}'`;
  const sql = `SELECT ${DIM_SQL[DIMS.indexOf(dim as (typeof DIMS)[number])]}, ${mets.map((m) => METRICS.find((x) => x.n === m)?.sql).join(', ') || 'COUNT(*)'} FROM telemetry_mart WHERE facility_id = '${FAC_IDS[FACS.indexOf(fac as (typeof FACS)[number])]}' AND log_timestamp ${rangeSql}`;

  // GAP-12/F10: the builder SQL is a local design preview (telemetry_mart does not
  // exist); "Run" executes the REAL server aggregate query and reports live counts.
  const runQuery = async () => {
    if (mets.length === 0) {
      push(false, 'No metrics selected', 'Pick at least one telemetry metric.');
      return;
    }
    setAggError(null);
    const t0 = performance.now();
    try {
      // apiFetch unwraps the { data } envelope — the resolved value IS the aggregates.
      const aggData = await apiFetch<Aggregates>('/api/reports/aggregates');
      setAgg(aggData);
      setAggMs(Math.round(performance.now() - t0));
      setRan(true);
      const total = aggData.workOrders.total + aggData.assets.totalRegistered
        + aggData.inventory.totalSkus + aggData.serviceRequests.total;
      push(true, 'Aggregate query executed', `${total} live records · server aggregates (this database).`);
    } catch (e) {
      setAgg(null);
      setAggMs(null);
      const msg = e instanceof Error ? e.message : 'Aggregate query failed';
      setAggError(`${msg} — showing no figures rather than estimates.`);
      push(false, 'Aggregate query failed', `${msg} — no figures shown.`);
    }
  };

  const dossierCsv = () => {
    const live = agg
      ? `live · WO ${agg.workOrders.total} / assets ${agg.assets.totalRegistered} / SKUs ${agg.inventory.totalSkus} / SR ${agg.serviceRequests.total}`
      : 'no live aggregate loaded — run the aggregate query first';
    const rows = [['section', 'key', 'value'],
      ['query', 'temporal_scope', range], ['query', 'facility', fac], ['query', 'dimension', dim],
      ['query', 'metrics', mets.join(' | ') || '(none)'], ['query', 'output', out],
      ['receipt', 'records', live], ['receipt', 'exec_ms', aggMs === null ? 'n/a' : String(aggMs)], ['receipt', 'engine', 'server aggregates (this database)']];
    download('custom-query-dossier.csv', rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n'));
    push(true, 'Dossier downloaded', `${out} · ${live} · manifest + receipt attached.`);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Reports &amp; Analytics Hub</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="rep-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">BI ENGINE v4.6-OLAP · direct DB read · no replica</p>
            <h1 id="rep-h" className="text-2xl font-semibold tracking-tight">Reports &amp; Analytics Hub</h1>
            <p className="text-[13px] text-muted">Enterprise operational business intelligence, cost accounting, MTTR telemetry analysis, and custom report builder for multi-facility operations.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Dialog open={schedOpen} onOpenChange={setSchedOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary"><CalendarClock size={16} /> Schedule Automated Dispatch</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="sch-h">
                <DialogTitle id="sch-h">Schedule Automated Dispatch</DialogTitle>
                <DialogDescription>Emails the dossier on cadence.</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="sch-rep">Dossier</label>
                <select id="sch-rep" value={schedRep} onChange={(e) => setSchedRep(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card apex-id">
                  {DOSSIERS.map((d) => <option key={d.id} value={d.id}>{d.id} · {d.title}</option>)}
                </select>
                <label className="text-xs font-semibold" htmlFor="sch-cad">Cadence</label>
                <select id="sch-cad" value={schedCad} onChange={(e) => setSchedCad(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                  {['Weekly on Mondays (06:00 UTC)', 'Monthly Automated (1st of month)', 'Bi-weekly Shift Cycle', 'Monthly Audit (15th)'].map((c) => <option key={c}>{c}</option>)}
                </select>
                <label className="text-xs font-semibold" htmlFor="sch-mail">Recipient email</label>
                <Input id="sch-mail" value={schedMail} onChange={(e) => setSchedMail(e.target.value)} invalid={schedTouched && !/.+@.+\..+/.test(schedMail.trim())} placeholder="lead@apexops.io" />
                {schedTouched && !/.+@.+\..+/.test(schedMail.trim()) && <p className="text-[11px] font-semibold text-fail">Valid recipient email required.</p>}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setSchedOpen(false)}>Cancel</Button>
                  <Button onClick={schedule}>Schedule Dispatch</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" onClick={() => { window.print(); push(true, 'PDF dossier queued', 'Full-fidelity print dossier · 4 dossiers · charts embedded.'); }}>
              <Download size={16} /> Export Full PDF Dossier
            </Button>
            <Button onClick={() => document.getElementById('query-builder')?.scrollIntoView({ behavior: 'smooth' })}>
              <Database size={16} /> Build Custom Query (SQL/Visual)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'YTD Maintenance OPEX', v: '$1,428,650.00', s: '-4.2% Under Budget · Healthy · Cap: $1,490,000 · Oracle ERP Sync: 4m ago' },
            { l: 'Fleet Mean Time to Repair (MTTR)', v: '2.38 hours', s: '-18m vs L30D Target · Optimal (≤3.0h) · 94.6% First-Time Fix · +1.8% L7D' },
            { l: 'Fleet Availability & Uptime', v: '99.82% YTD', s: '+0.14% Uptime · Tier-1: 100% · Unplanned: 14.2h / 412 assets · Zero fatal trips' },
            { l: 'Inventory Carrying Valuation', v: '$582,340', s: '1,840 Active SKUs · Turns: 4.8x/yr · 98.9% In-Stock Critical Spares' },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
              <span className="apex-label-caps text-muted">{k.l}</span>
              <span className="text-xl font-semibold tabular-nums">{k.v}</span>
              <span className="text-[11px] text-muted">{k.s}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Monthly OPEX vs Budget Variance <span className="text-xs font-normal text-muted">FY 2026</span></h2>
              <TrendingDown size={16} className="text-pass" />
            </div>
            <p className="text-xs text-muted -mt-1">Consolidated operating maintenance spend across Nusantara Tower campus</p>
            <div className="flex items-end gap-2 h-40 pt-4" role="img" aria-label="Monthly OPEX bars January to June against 305k budget cap">
              {MONTHS.map((m) => (
                <div key={m.m} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="apex-id text-[11px] font-bold">{m.m.startsWith('JUN') ? '~$290k' : `$${m.v}k`}</span>
                  <div className="w-full rounded-t bg-cobalt-deep/80" style={{ height: `${(m.v / 320) * 100}%`, opacity: m.m.startsWith('JUN') ? 0.45 : 1 }} />
                  <span className="text-[10px] font-bold text-muted">{m.m}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cobalt-deep/80 inline-block" /> Actual Spend (OPEX)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-fail inline-block" /> Approved Budget Cap ($305k/mo)</span>
            </div>
            <p className="text-[13px]">May Actual $284k vs Budget $305k <strong className="text-pass">(-$21k favorable)</strong></p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Category Cost Allocation</h2>
            <p className="text-xs text-muted -mt-1">Distribution across primary infrastructure subsystems · Total Tracked Runs: 4,892 WO lines</p>
            {CATS.map((c) => (
              <div key={c.n} className="text-[13px]">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">{c.n} <span className="font-normal text-muted text-xs">· {c.d}</span></span>
                  <strong className="apex-id whitespace-nowrap">{c.v} · {c.p.toFixed(1)}%</strong>
                </div>
                <div className="h-2.5 rounded bg-surface-subtle overflow-hidden mt-0.5" role="img" aria-label={`${c.n} ${c.p} percent`}>
                  <div className="h-full bg-cobalt-deep" style={{ width: `${c.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold flex items-center gap-2"><Activity size={16} /> Incident Resolution Velocity &amp; SLA Compliance</h2>
            <Badge variant="pass">100% P1 COMPLIANCE</Badge>
          </div>
          <p className="text-xs text-muted -mt-1">Real-time dispatch response benchmarks correlated against facility severity thresholds · Sensor Telemetry Cycle: 60s</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[13px]">
            {SLA.map((s) => (
              <div key={s.p} className="rounded border border-border-subtle bg-card p-3 flex flex-col gap-1">
                <p className="font-semibold">{s.p} <span className="text-xs font-normal text-muted">· Max SLA {s.max}</span></p>
                <p><strong className="text-lg">{s.avg}</strong> <span className="text-muted text-xs">{s.buf} · {s.tgt}</span></p>
                <div className="h-2 rounded bg-surface-subtle overflow-hidden" role="img" aria-label={`${s.p} ${s.met}`}>
                  <div className={cn('h-full', s.pct >= 99 ? 'bg-pass' : 'bg-warn')} style={{ width: `${s.pct}%` }} />
                </div>
                <p className="text-xs font-bold text-pass">{s.met}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Standard Operational Reports &amp; Dossiers <span className="text-xs font-normal text-muted">{filtered.length} Active Dossiers</span></h2>
            <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Report classification filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
              {['All Report Classifications', 'Financial & OPEX', 'Reliability Engineering', 'Workforce Operations', 'Supply Chain'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <p className="text-xs text-muted -mt-2">Automated regulatory, financial, and engineering compliance exports</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead>
                <tr className="text-left text-muted border-b border-border-subtle bg-card">
                  <th className="p-2 font-semibold">Report Identifier &amp; Title</th>
                  <th className="font-semibold">Category</th>
                  <th className="font-semibold">Last Generated</th>
                  <th className="font-semibold">Cadence / Scope</th>
                  <th className="font-semibold">Compliance Status</th>
                  <th className="font-semibold">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-surface-subtle hover:bg-card">
                    <td className="p-2"><p className="apex-id font-bold text-cobalt">{d.id}</p><p className="font-medium">{d.title}</p><p className="text-xs text-muted">{d.meta}</p></td>
                    <td>{d.cat}</td>
                    <td><p>{d.gen}</p><p className="text-xs text-muted">{d.owner}</p></td>
                    <td className="text-xs">{d.cadence}</td>
                    <td><Badge variant="pass">{d.status}</Badge></td>
                    <td>
                      <div className="flex gap-2">
                        <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => setPrev(d)}>Preview</button>
                        <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => manifest(d)}>Extract</button>
                        <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => { setSchedRep(d.id); setSchedOpen(true); }}>Schedule</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Scheduled dispatches: {scheduled.join(' · ')}</p>
        </div>

        <div id="query-builder" className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-3 scroll-mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Custom Analytical Query &amp; Report Builder</h2>
            <Badge variant="info">OLAP CUBE</Badge>
          </div>
          <p className="text-[13px] text-muted -mt-2">Compose multidimensional queries with granular field cross-sections · Ready (Est Execution: ~84ms)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold" htmlFor="qb-range">1. Temporal Scope / Range</label>
              <select id="qb-range" value={range} onChange={(e) => { setRange(e.target.value); setRan(false); }} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {RANGES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold" htmlFor="qb-fac">2. Facility Scope <span className="font-normal text-muted">· 412 Assets · 28 Zones Included</span></label>
              <select id="qb-fac" value={fac} onChange={(e) => { setFac(e.target.value); setRan(false); }} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {FACS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold" htmlFor="qb-dim">3. Primary Aggregation Dimension <span className="font-normal text-muted">· Hierarchy: Category &gt; Subcategory &gt; Tag</span></label>
              <select id="qb-dim" value={dim} onChange={(e) => { setDim(e.target.value); setRan(false); }} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {DIMS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <fieldset>
              <legend className="text-xs font-semibold">4. Metric Telemetry Inclusion</legend>
              <div className="flex flex-wrap gap-3 mt-1">
                {METRICS.map((m) => (
                  <label key={m.n} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={mets.includes(m.n)} onChange={() => { setMets((x) => (x.includes(m.n) ? x.filter((y) => y !== m.n) : [...x, m.n])); setRan(false); }} className="w-4 h-4 accent-[#1E40AF]" />
                    {m.n}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <fieldset>
            <legend className="text-xs font-semibold">Output Format</legend>
            <div className="flex flex-wrap gap-2 mt-1" role="radiogroup" aria-label="Output format">
              {OUTPUTS.map((o) => (
                <button key={o} type="button" onClick={() => setOut(o)} aria-pressed={out === o} className={cn('h-8 px-3 rounded text-xs font-semibold border', out === o ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}>
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-[11px] text-muted">Builder preview (local only — Run executes the server aggregate query, not this SQL):</p>
          <pre className="rounded border border-border-subtle bg-card p-2 text-[11px] apex-id overflow-x-auto" aria-label="Generated SQL (local design preview — not executed)">{sql}</pre>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="secondary" onClick={() => void runQuery()}><Play size={15} /> Run Aggregate Query (live)</Button>
            <Button onClick={dossierCsv}><FileText size={15} /> Generate &amp; Download Dossier</Button>
            {aggError && <span className="text-[13px] font-semibold text-fail" role="alert">{aggError}</span>}
            {ran && agg && aggMs !== null && (
              <span className="text-[13px] font-semibold text-pass" role="status">
                Live aggregates in {aggMs}ms · WO {agg.workOrders.total} (open {agg.workOrders.open})
                {' '}· assets {agg.assets.totalRegistered} · SKUs {agg.inventory.totalSkus} (low {agg.inventory.lowStockSkus})
                {' '}· valuation ${agg.inventory.valuationUsd} · SR {agg.serviceRequests.total} (converted {agg.serviceRequests.converted})
              </span>
            )}
          </div>
        </div>
      </section>

      <Dialog open={prev !== null} onOpenChange={(v) => { if (!v) setPrev(null); }}>
        <DialogContent aria-labelledby="prev-h">
          {prev && (
            <>
              <DialogTitle id="prev-h">{prev.id}</DialogTitle>
              <DialogDescription>{prev.title}</DialogDescription>
              <ul className="text-[13px] flex flex-col gap-1">
                <li><strong>Category:</strong> {prev.cat}</li>
                <li><strong>Scope:</strong> {prev.meta}</li>
                <li><strong>Generated:</strong> {prev.gen} · {prev.owner}</li>
                <li><strong>Cadence:</strong> {prev.cadence}</li>
                <li><strong>Status:</strong> {prev.status}</li>
              </ul>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPrev(null)}>Close</Button>
                <Button onClick={() => { if (prev) manifest(prev); }}><Eye size={15} /> Download Extract</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
