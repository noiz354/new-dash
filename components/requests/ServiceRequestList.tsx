'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, Plus, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface SR {
  id: string; title: string; req: string; loc: string; asset: string;
  impact: string; sla: string; status: string; seeded?: boolean;
}

const SEED: SR[] = [
  { id: CANON.serviceRequest, title: 'Chiller #4 seal leak — water on plant floor', req: `${CANON.requestor} · Front Desk · East Wing`, loc: 'East Wing · Front Desk (zone CUP-West)', asset: CANON.assetSeal, impact: '—', sla: 'MET · 11m of 15m', status: 'CONVERTED', seeded: true },
  { id: 'SR-2026-0893', title: 'Main Dock Overhead Hydraulic Door Jammed', req: 'David Ross · Logistics · x2104', loc: 'East Bay · Loading Bay 02', asset: '—', impact: 'Logistics 88/100 · Blocked Route', sla: '6m 42s of 15m', status: 'P1 CRITICAL' },
  { id: 'SR-2026-0892', title: 'Autoclave 3 Pressure Relief Sibilance', req: 'Amina Lee · Bio-Ops · x8812', loc: 'Cleanroom Zone A · Lab 12', asset: '—', impact: 'Lab Assets 74/100 · Sterility Risk', sla: '11m 15s of 15m', status: 'P2 HIGH' },
  { id: 'SR-2026-0887', title: 'Main Atrium Escort Gate Access Sensor Failure', req: 'Thomas Kim · Admin · x1002', loc: 'Main Atrium', asset: '—', impact: '—', sla: '24m 00s of 45m · BREACHED', status: 'BREACHED' },
  { id: 'SR-2026-0885', title: 'Flickering LED Bank in Conference Suite B', req: 'Elena Moreno · Legal · x7731', loc: 'Executive Suite · 11th Floor', asset: '—', impact: 'Lighting 38/100 · Comfort', sla: 'Overrun −12m 18s', status: 'P3 NORMAL' },
];

const DEPTS = ['Front Desk', 'Logistics', 'Bio-Ops', 'Admin', 'Legal'] as const;

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1700;

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
 * Service Requests triage queue — mined from the triage-hub archive rows
 * plus the M2 converted ticket. Timers, impact scores, and extensions are
 * archive-verbatim; unseeded cells render "—" (never invented).
 */
export function ServiceRequestList() {
  const [rows, setRows] = useState<SR[]>(SEED);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [nwName, setNwName] = useState('');
  const [nwDept, setNwDept] = useState<string>('Front Desk');
  const [nwTitle, setNwTitle] = useState('');
  const [nwLoc, setNwLoc] = useState('');
  const [nwTouched, setNwTouched] = useState(false);
  const [seq, setSeq] = useState(895);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = rows.filter((r) => {
    if (status !== 'All Statuses' && r.status !== status) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${r.id} ${r.title} ${r.req} ${r.loc}`.toLowerCase().includes(needle);
  });

  const awaiting = rows.filter((r) => r.status !== 'CONVERTED').length;
  const p1 = rows.filter((r) => r.status === 'P1 CRITICAL').length;
  const breached = rows.filter((r) => r.status === 'BREACHED' || r.sla.includes('Overrun')).length;
  const converted = rows.filter((r) => r.status === 'CONVERTED').length;

  const exportCsv = () => {
    const head = 'id,title,requestor,location,asset,impact,sla,status';
    const body = filtered.map((r) => [`"${r.id}"`, `"${r.title}"`, `"${r.req}"`, `"${r.loc}"`, `"${r.asset}"`, `"${r.impact}"`, `"${r.sla}"`, `"${r.status}"`].join(','));
    download('service-requests-queue.csv', [head, ...body].join('\n'));
    push(true, 'Queue exported', `${filtered.length} tickets → service-requests-queue.csv.`);
  };

  const create = () => {
    setNwTouched(true);
    if (!nwName.trim() || !nwTitle.trim() || !nwLoc.trim()) return;
    const id = `SR-2026-0${seq}`;
    setRows((r) => [{ id, title: nwTitle.trim(), req: `${nwName.trim()} · ${nwDept}`, loc: nwLoc.trim(), asset: '—', impact: '—', sla: 'Triage clock starts on queue', status: 'P3 NORMAL' }, ...r]);
    setSeq((s) => s + 1);
    setNewOpen(false);
    setNwName('');
    setNwTitle('');
    setNwLoc('');
    setNwTouched(false);
    push(true, 'Request queued', `${id} · P3 NORMAL · triage clock started.`);
  };

  const statusTone = (s: string) => (s === 'BREACHED' || s === 'P1 CRITICAL' ? 'fail' : s === 'P2 HIGH' ? 'warn' : s === 'P3 NORMAL' ? 'info' : 'pass');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Service Requests</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="sr-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Triage Queue · {rows.length} seeded tickets</p>
            <h1 id="sr-h" className="text-2xl font-semibold tracking-tight">Service Requests</h1>
            <p className="text-[13px] text-muted">Intake triage — impact scoring, SLA clocks, and conversion to dispatch.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export (CSV)</Button>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> New Request</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="nr-h">
                <DialogTitle id="nr-h">New Service Request</DialogTitle>
                <DialogDescription>Queues a P3 ticket — triage scores impact on review.</DialogDescription>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nr-n">Requestor name</label>
                    <Input id="nr-n" value={nwName} onChange={(e) => setNwName(e.target.value)} invalid={nwTouched && !nwName.trim()} placeholder="e.g. Dana Priya" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nr-d">Department</label>
                    <select id="nr-d" value={nwDept} onChange={(e) => setNwDept(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {DEPTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <label className="text-xs font-semibold" htmlFor="nr-t">Title (required)</label>
                <Input id="nr-t" value={nwTitle} onChange={(e) => setNwTitle(e.target.value)} invalid={nwTouched && !nwTitle.trim()} placeholder="e.g. AHU noise complaint level 5" />
                <label className="text-xs font-semibold" htmlFor="nr-l">Location (required)</label>
                <Input id="nr-l" value={nwLoc} onChange={(e) => setNwLoc(e.target.value)} invalid={nwTouched && !nwLoc.trim()} placeholder="e.g. Tower A · Level 5" />
                {nwTouched && (!nwName.trim() || !nwTitle.trim() || !nwLoc.trim()) && (
                  <p className="text-[11px] font-semibold text-fail">Requestor + title + location are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
                  <Button onClick={create}>Queue SR-2026-0{seq}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Awaiting Triage', v: String(awaiting), s: 'Unconverted queue depth' },
            { l: 'P1 Critical', v: String(p1), s: 'Dock door jam · blocked route' },
            { l: 'SLA Breached', v: String(breached), s: 'Atrium gate + LED overrun' },
            { l: 'Converted', v: String(converted), s: 'SR → WO-2026-0894 chain' },
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by ID, title, requestor, location…" aria-label="Filter service requests" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Statuses', 'P1 CRITICAL', 'P2 HIGH', 'BREACHED', 'P3 NORMAL', 'CONVERTED'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[1000px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">Ticket</th>
                <th className="font-semibold">Title</th>
                <th className="font-semibold">Requestor</th>
                <th className="font-semibold">Location</th>
                <th className="font-semibold">Impact</th>
                <th className="font-semibold">Triage SLA</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2">
                    <Link className="apex-id font-bold text-cobalt hover:underline" href={`/service-requests/${r.id}`}>{r.id}</Link>
                    {r.seeded && <p className="text-[10px] font-bold text-pass">SEEDED DESK</p>}
                  </td>
                  <td className="font-medium">{r.title}</td>
                  <td className="text-xs">{r.req}</td>
                  <td className="text-xs">{r.loc}</td>
                  <td className="text-xs">{r.impact}</td>
                  <td className={cn('apex-id text-xs', r.sla.includes('BREACH') || r.sla.includes('Overrun') ? 'font-bold text-fail' : 'text-muted')}>{r.sla}</td>
                  <td><Badge variant={statusTone(r.status)}>{r.status}</Badge></td>
                  <td>
                    <Link className="text-cobalt font-semibold hover:underline text-xs" href={`/service-requests/${r.id}`}>Triage →</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted">No tickets match — clear filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">Showing {filtered.length} of {rows.length} seeded tickets · batch converts SR-2026-0893 + SR-2026-0892 next (same zone, same shift).</p>
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
