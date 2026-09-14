'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, Plus, UserPlus, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface WO {
  id: string; title: string; loc: string; pri: 'P1' | 'P2' | 'P3';
  status: string; sla: string; tech: string; action?: string; seeded?: boolean;
}

const SEED: WO[] = [
  { id: CANON.workOrderSeal, title: 'Primary Shaft Mechanical Seal Replacement', loc: 'Chiller #04 · CUP Basement L2', pri: 'P1', status: 'IN PROGRESS', sla: '42m left', tech: 'M. Kowalski', seeded: true },
  { id: 'WO-2024-0892', title: 'Compressor bearing vibration anomaly above 7.8mm/s safety trip', loc: 'Chiller Unit #03 · Basement Energy Hub', pri: 'P1', status: 'ESCALATED', sla: '−01:42:15 BREACH', tech: '—', action: 'Quick Action' },
  { id: 'WO-2024-0888', title: 'Common-rail fuel pump pressure loss during automated test fire', loc: 'Generator 2B · Outdoor Power Vault', pri: 'P1', status: 'ON HOLD (PARTS)', sla: '−00:24:10 BREACH', tech: '—', action: 'Dispatch Specialist' },
  { id: 'WO-2024-0901', title: 'Secondary optical barcode scanner misalignment and belt drift', loc: 'Conveyor Sorter #4 · Logistics Bay 12', pri: 'P2', status: 'IN PROGRESS', sla: '01:14:30 LEFT', tech: '—', action: 'Expedite SKU' },
  { id: 'WO-2024-0904', title: 'Static air pressure differential dropped below 25 Pa certification threshold', loc: 'Level 3 Pharma Lab · Tower A', pri: 'P2', status: 'OPEN', sla: '02:40:00 LEFT', tech: '—', action: 'Reassign' },
  { id: 'WO-2026-0898', title: 'AHU-02 VAV Box Damper Actuator Calibration', loc: 'Substation East Wing (Roof Level)', pri: 'P2', status: 'DISPATCHED', sla: 'Window Today 15:30 WIB', tech: 'Elena Voronova' },
  { id: 'WO-2026-0881', title: 'Semi-Annual Calibration of Pressure Relief Valve', loc: 'AST-VALV-042 · Room #B-204', pri: 'P3', status: 'SCHEDULED', sla: 'Due Tomorrow 18:00 WIB', tech: 'Shift Delta Team' },
];

const TECHS = ['Marcus Kowalski (HVAC Lead)', 'Elena Voronova (SCADA)', 'Sarah Al-Mansoor (Life Safety)', 'D. Osei (Shift B relief)'];

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1600;

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Work Orders pipeline — mined from dashboard dispatch (2024 vintage rows),
 * H1 seal record, facilities P3 + notifications P2. 2024 IDs are
 * archive-faithful (dashboard owner) and coexist with the 2026 seal chain.
 * Numbering: WO-2026-0904 reserved (C10 glycol demo), 0905 reserved
 * (vendor draft) — PM auto-batch takes 0906–0909, manual opens at 0910.
 */
export function WorkOrderList() {
  const [rows, setRows] = useState<WO[]>(SEED);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [pri, setPri] = useState('All Priorities');
  const [vintage, setVintage] = useState('All Years');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [nwTitle, setNwTitle] = useState('');
  const [nwAsset, setNwAsset] = useState<string>(CANON.assetSeal);
  const [nwPri, setNwPri] = useState<'P1' | 'P2' | 'P3'>('P2');
  const [nwTouched, setNwTouched] = useState(false);
  const [seq, setSeq] = useState(910);
  const [reWO, setReWO] = useState<WO | null>(null);
  const [reTech, setReTech] = useState(TECHS[0]);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = rows.filter((r) => {
    if (status !== 'All Statuses' && r.status !== status) return false;
    if (pri !== 'All Priorities' && r.pri !== pri) return false;
    if (vintage !== 'All Years' && !r.id.startsWith(vintage)) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${r.id} ${r.title} ${r.loc} ${r.tech}`.toLowerCase().includes(needle);
  });

  const statuses = ['All Statuses', ...Array.from(new Set(rows.map((r) => r.status)))];
  const breached = rows.filter((r) => r.sla.includes('BREACH')).length;
  const p1 = rows.filter((r) => r.pri === 'P1').length;
  const hold = rows.filter((r) => r.status.startsWith('ON HOLD')).length;

  const exportCsv = () => {
    const head = 'id,title,location,priority,status,sla,assignee';
    const body = filtered.map((r) => [`"${r.id}"`, `"${r.title}"`, `"${r.loc}"`, r.pri, `"${r.status}"`, `"${r.sla}"`, `"${r.tech}"`].join(','));
    download('work-orders-pipeline.csv', [head, ...body].join('\n'));
    push(true, 'Pipeline exported', `${filtered.length} work orders → work-orders-pipeline.csv.`);
  };

  const create = () => {
    setNwTouched(true);
    if (!nwTitle.trim() || !/^AST-[A-Z]+-\d{3}$/.test(nwAsset.trim())) return;
    const id = `WO-2026-0${seq}`;
    setRows((r) => [{ id, title: nwTitle.trim(), loc: `${nwAsset.trim()} · zone TBD`, pri: nwPri, status: 'OPEN', sla: 'TBD — triage on create', tech: 'Unassigned' }, ...r]);
    setSeq((s) => s + 1);
    setNewOpen(false);
    setNwTitle('');
    setNwTouched(false);
    push(true, 'Work order created', `${id} · OPEN · queued to dispatch.`);
  };

  const quick = (r: WO) => {
    if (r.action === 'Reassign') {
      setReWO(r);
      return;
    }
    const msg: Record<string, string> = {
      'Quick Action': 'Rapid-response pinged · vibration crew ETA 20 min · escalation held.',
      'Dispatch Specialist': 'Fuel-systems specialist dispatched · parts hold stays until pump kit arrives.',
      'Expedite SKU': 'Scanner SKU expedite requested · crib checking stock · sorter kept running.',
    };
    push(true, r.action ?? 'Queued', `${r.id} · ${msg[r.action ?? ''] ?? 'dispatcher notified.'}`);
  };

  const reassign = () => {
    if (!reWO) return;
    setRows((rs) => rs.map((r) => (r.id === reWO.id ? { ...r, tech: reTech } : r)));
    push(true, 'Tech reassigned', `${reWO.id} → ${reTech} · briefing pack sent.`);
    setReWO(null);
  };

  const statusTone = (s: string) => (s.includes('BREACH') || s === 'ESCALATED' ? 'fail' : s.startsWith('ON HOLD') ? 'warn' : s === 'OPEN' || s === 'SCHEDULED' ? 'info' : s === 'DISPATCHED' ? 'hold' : 'pass');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Work Orders</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="wo-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Dispatch Pipeline · {rows.length} seeded work orders (2024 carryover + 2026 live)</p>
            <h1 id="wo-h" className="text-2xl font-semibold tracking-tight">Work Orders</h1>
            <p className="text-[13px] text-muted">Execution pipeline from dispatch to close — priorities, SLA exposure, and crew assignment.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export (CSV)</Button>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> New Work Order</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="nw-h">
                <DialogTitle id="nw-h">New Work Order</DialogTitle>
                <DialogDescription>Manual sequence opens at WO-2026-0910 (past PM auto-batch 0906–0909).</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="nw-t">Title (required)</label>
                <Input id="nw-t" value={nwTitle} onChange={(e) => setNwTitle(e.target.value)} invalid={nwTouched && !nwTitle.trim()} placeholder="e.g. Cooling tower fan belt replacement" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nw-a">Target asset</label>
                    <Input id="nw-a" value={nwAsset} onChange={(e) => setNwAsset(e.target.value.toUpperCase())} invalid={nwTouched && !/^AST-[A-Z]+-\d{3}$/.test(nwAsset.trim())} className="apex-id" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nw-p">Priority</label>
                    <select id="nw-p" value={nwPri} onChange={(e) => setNwPri(e.target.value as 'P1' | 'P2' | 'P3')} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {['P1', 'P2', 'P3'].map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                {nwTouched && (!nwTitle.trim() || !/^AST-[A-Z]+-\d{3}$/.test(nwAsset.trim())) && (
                  <p className="text-[11px] font-semibold text-fail">Title + AST-XXX-000 asset are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
                  <Button onClick={create}>Create WO-2026-0{seq}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Open Pipeline', v: String(rows.length), s: 'Seeded records · full ledger in Reports' },
            { l: 'P1 Critical', v: String(p1), s: 'Seal + vibration + fuel-pump rows' },
            { l: 'SLA Breached', v: String(breached), s: 'ESCALATED + parts-hold rows' },
            { l: 'Parts Hold', v: String(hold), s: 'Generator fuel-pump kit awaited' },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
              <span className="apex-label-caps text-muted">{k.l}</span>
              <span className="text-xl font-semibold tabular-nums">{k.v}</span>
              <span className="text-[11px] text-muted">{k.s}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by ID, title, location, tech…" aria-label="Filter work orders" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={pri} onChange={(e) => setPri(e.target.value)} aria-label="Priority filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Priorities', 'P1', 'P2', 'P3'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={vintage} onChange={(e) => setVintage(e.target.value)} aria-label="Year filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Years', 'WO-2026', 'WO-2024'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[980px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">Work Order</th>
                <th className="font-semibold">Title &amp; Location</th>
                <th className="font-semibold">Priority</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">SLA</th>
                <th className="font-semibold">Assignee</th>
                <th className="font-semibold">Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2">
                    <Link className="apex-id font-bold text-cobalt hover:underline" href={`/work-orders/${r.id}`}>{r.id}</Link>
                    {r.seeded && <p className="text-[10px] font-bold text-pass">SEEDED HUB</p>}
                  </td>
                  <td><p className="font-medium">{r.title}</p><p className="text-xs text-muted">{r.loc}</p></td>
                  <td><Badge variant={r.pri === 'P1' ? 'fail' : r.pri === 'P2' ? 'warn' : 'info'}>{r.pri}</Badge></td>
                  <td><Badge variant={statusTone(r.status)}>{r.status}</Badge></td>
                  <td className={cn('apex-id text-xs', r.sla.includes('BREACH') ? 'font-bold text-fail' : 'text-muted')}>{r.sla}</td>
                  <td className="text-xs">{r.tech}</td>
                  <td>
                    {r.seeded ? (
                      <Link className="text-cobalt font-semibold hover:underline text-xs" href={`/work-orders/${r.id}`}>Open Hub →</Link>
                    ) : r.action ? (
                      <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => quick(r)}>{r.action}</button>
                    ) : (
                      <Link className="text-cobalt font-semibold hover:underline text-xs" href={`/work-orders/${r.id}`}>Open →</Link>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted">No work orders match — clear filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">
          Showing {filtered.length} of {rows.length} seeded work orders · WO-2026-0904 reserved (C10 demo row) · WO-2026-0905 reserved (vendor draft) · manual sequence opens at 0910.
        </p>
      </section>

      <Dialog open={reWO !== null} onOpenChange={(v) => { if (!v) setReWO(null); }}>
        <DialogContent aria-labelledby="re-h">
          <DialogTitle id="re-h">Reassign {reWO?.id}</DialogTitle>
          <DialogDescription>Hands the pharma pressure-differential ticket to another tech.</DialogDescription>
          <label className="text-xs font-semibold" htmlFor="re-tech">Assignee</label>
          <select id="re-tech" value={reTech} onChange={(e) => setReTech(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {TECHS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReWO(null)}>Cancel</Button>
            <Button onClick={reassign}><UserPlus size={15} /> Confirm Reassign</Button>
          </div>
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
