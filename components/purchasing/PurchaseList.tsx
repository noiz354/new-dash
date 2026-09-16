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
import { downloadText } from '@/lib/download';

interface Doc {
  id: string; kind: 'PO' | 'PR'; title: string; vendor: string; vendorSlug?: string;
  amount: string; req: string; status: string; note?: string; seeded?: boolean;
}

const SEED: Doc[] = [
  { id: CANON.purchaseOrder, kind: 'PO', title: 'Silicon Carbide Shaft Seal 2.5" Kit replenishment', vendor: 'Trane Supply Co', vendorSlug: CANON.vendorSlug, amount: '$2,900.00', req: '—', status: 'DISPATCHED · DOCK BAY 02', note: 'P1 SLA · GRN-9941 · INV-2026-1188', seeded: true },
  { id: 'PR-2026-0314', kind: 'PR', title: '—', vendor: 'Trane EarthWise Direct', vendorSlug: CANON.vendorSlug, amount: '—', req: '—', status: 'ENDORSED → PO-2026-0315', note: 'Endorsed 13:41 WIB · POST pr-0314/endorse' },
  { id: 'PO-2026-0315', kind: 'PO', title: '—', vendor: 'Trane Co.', vendorSlug: CANON.vendorSlug, amount: '—', req: '—', status: 'DISPATCHED', note: 'Per authorize demo string (JS-only source)' },
  { id: 'PR-2026-0309', kind: 'PR', title: '10 Pails POE Synthetic Lubricant', vendor: 'Mobil Aero Fluids', amount: '$1,950.00', req: 'J. Thorne · Lube Specialist', status: 'CONVERTED → PO-2026-0302' },
  { id: 'PO-2026-0302', kind: 'PO', title: '10 Pails POE Synthetic Lubricant', vendor: 'Mobil Aero Fluids', amount: '$1,950.00', req: 'J. Thorne · Lube Specialist', status: 'CREATED', note: '10 × $195.00/pail' },
  { id: 'PO-2026-0285', kind: 'PO', title: '2000kVA Bushing Kits · ELEC-TR-880', vendor: 'ABB Grid Power Services', vendorSlug: 'abb-grid-power-automation', amount: '$28,400.00', req: 'E. Vance · Chief Electrical', status: 'PARTIAL' },
  { id: 'PR-2026-0295', kind: 'PR', title: 'Non-standard cordless power tool accessories', vendor: 'Grainger Industrial', vendorSlug: 'grainger-industrial-supply', amount: '$850.00', req: '—', status: 'REJECTED BY VP', note: 'Exceeds crib discretionary cap' },
];

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1800;

const download = (filename: string, text: string) => downloadText(filename, text);

/**
 * Purchasing documents — mined from the POs hub archive plus the M3 seal
 * order. PR-2026-0314 → PO-2026-0315 is the archive's live conversion chain;
 * 0315 exists only as an authorize-demo string (amount/title unseeded "—").
 * PR-0315 suffix skipped — PO-2026-0315 owns it.
 */
export function PurchaseList() {
  const [rows, setRows] = useState<Doc[]>(SEED);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [nwTitle, setNwTitle] = useState('');
  const [nwVendor, setNwVendor] = useState('');
  const [nwAmount, setNwAmount] = useState('');
  const [nwTouched, setNwTouched] = useState(false);
  const [seq, setSeq] = useState(316);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = rows.filter((r) => {
    if (kind !== 'All Types' && r.kind !== kind) return false;
    if (status !== 'All Statuses' && r.status !== status) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${r.id} ${r.title} ${r.vendor} ${r.req}`.toLowerCase().includes(needle);
  });

  const statuses = ['All Statuses', ...Array.from(new Set(rows.map((r) => r.status)))];
  const partial = rows.filter((r) => r.status === 'PARTIAL').length;
  const rejected = rows.filter((r) => r.status.startsWith('REJECTED')).length;

  const exportCsv = () => {
    const head = 'id,type,title,vendor,amount,requestor,status';
    const body = filtered.map((r) => [`"${r.id}"`, r.kind, `"${r.title}"`, `"${r.vendor}"`, `"${r.amount}"`, `"${r.req}"`, `"${r.status}"`].join(','));
    download('purchasing-documents.csv', [head, ...body].join('\n'));
    push(true, 'Documents exported', `${filtered.length} records → purchasing-documents.csv.`);
  };

  const amountOk = /^\$?\d[\d,]*(\.\d{2})?$/.test(nwAmount.trim());

  const create = () => {
    setNwTouched(true);
    if (!nwTitle.trim() || !nwVendor.trim() || !amountOk) return;
    const id = `PR-2026-0${seq}`;
    setRows((r) => [{ id, kind: 'PR', title: nwTitle.trim(), vendor: nwVendor.trim(), amount: nwAmount.trim().startsWith('$') ? nwAmount.trim() : `$${nwAmount.trim()}`, req: 'Self-raised · Front Desk', status: 'SUBMITTED', note: 'Queued for endorsement' }, ...r]);
    setSeq((s) => s + 1);
    setNewOpen(false);
    setNwTitle('');
    setNwVendor('');
    setNwAmount('');
    setNwTouched(false);
    push(true, 'Requisition submitted', `${id} · queued for endorsement.`);
  };

  const statusTone = (s: string) => (s.startsWith('REJECTED') ? 'fail' : s === 'PARTIAL' || s === 'SUBMITTED' ? 'warn' : s === 'CREATED' ? 'info' : 'pass');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Purchasing</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="po-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Procurement Documents · {rows.length} seeded records (PO + PR)</p>
            <h1 id="po-h" className="text-2xl font-semibold tracking-tight">Purchasing</h1>
            <p className="text-[13px] text-muted">Requisitions to dispatched orders — endorsement chain, partial receipts, and rejections.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export (CSV)</Button>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> New Requisition</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="np-h">
                <DialogTitle id="np-h">New Purchase Requisition</DialogTitle>
                <DialogDescription>PR-2026-0315 suffix skipped — PO-2026-0315 owns it.</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="np-t">Title (required)</label>
                <Input id="np-t" value={nwTitle} onChange={(e) => setNwTitle(e.target.value)} invalid={nwTouched && !nwTitle.trim()} placeholder="e.g. MERV 14 filter box — AHU-02" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="np-v">Vendor (required)</label>
                    <Input id="np-v" value={nwVendor} onChange={(e) => setNwVendor(e.target.value)} invalid={nwTouched && !nwVendor.trim()} placeholder="e.g. Grainger Industrial" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="np-a">Amount (required)</label>
                    <Input id="np-a" value={nwAmount} onChange={(e) => setNwAmount(e.target.value)} invalid={nwTouched && !amountOk} placeholder="$1,200.00" className="apex-id" />
                  </div>
                </div>
                {nwTouched && (!nwTitle.trim() || !nwVendor.trim() || !amountOk) && (
                  <p className="text-[11px] font-semibold text-fail">Title + vendor + numeric amount are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
                  <Button onClick={create}>Submit PR-2026-0{seq}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Documents', v: String(rows.length), s: '4 POs · 3 PRs seeded' },
            { l: 'Open PO Value', v: '$33,250.00', s: '0298 + 0302 + 0285 · 0315 undisclosed' },
            { l: 'Partial Receipt', v: String(partial), s: 'Bushing kits · ELEC-TR-880' },
            { l: 'Rejected', v: String(rejected), s: 'VP cap · power-tool accessories' },
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by ID, title, vendor, requestor…" aria-label="Filter purchasing documents" />
          </div>
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Types', 'PO', 'PR'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[1000px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">Document</th>
                <th className="font-semibold">Type</th>
                <th className="font-semibold">Title</th>
                <th className="font-semibold">Vendor</th>
                <th className="font-semibold">Amount</th>
                <th className="font-semibold">Requestor</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">Dossier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2">
                    <Link className="apex-id font-bold text-cobalt hover:underline" href={`/purchasing/${r.id}`}>{r.id}</Link>
                    {r.seeded && <p className="text-[10px] font-bold text-pass">SEEDED RECORD</p>}
                    {r.note && <p className="text-[10px] text-muted">{r.note}</p>}
                  </td>
                  <td><Badge variant={r.kind === 'PO' ? 'info' : 'hold'}>{r.kind}</Badge></td>
                  <td className="font-medium">{r.title}</td>
                  <td className="text-xs">
                    {r.vendorSlug ? (
                      <Link className="text-cobalt font-semibold hover:underline" href={`/vendors/${r.vendorSlug}`}>{r.vendor}</Link>
                    ) : r.vendor}
                  </td>
                  <td className="apex-id font-semibold tabular-nums">{r.amount}</td>
                  <td className="text-xs">{r.req}</td>
                  <td><Badge variant={statusTone(r.status)}>{r.status}</Badge></td>
                  <td>
                    <Link className="text-cobalt font-semibold hover:underline text-xs" href={`/purchasing/${r.id}`}>Dossier →</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted">No documents match — clear filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">Showing {filtered.length} of {rows.length} seeded documents · PO-2026-0315 amount/title unseeded (demo-string only) · PR sequence opens at 0316.</p>
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
