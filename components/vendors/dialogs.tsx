'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, FileText, Send, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';

export type Push = (ok: boolean, title: string, msg: string) => void;

const PDF_PAGES = [
  'Page 1 of 3 (viewer excerpt): Tier-1 response within 2h for P1 chiller events at HQ Campus East Wing…',
  'Page 2 of 3: Rate card 2024 — after-hours multiplier 1.5×, parts at cost +12% handling…',
  'Page 3 of 3: Signatures — Trane Regional VP + Apex VP Operations, hash-anchored 12 Mar 2024.',
];

/** Executed-MSA viewer — 3-page excerpt with Prev/Next + hash verification link. */
export function PdfDialog({ triggerLabel = 'View Executed PDF' }: { triggerLabel?: string }) {
  const [page, setPage] = useState(0);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary"><FileText size={16} /> {triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="pdf-h" className="max-w-2xl">
        <DialogTitle id="pdf-h">{CANON.msa} · Executed</DialogTitle>
        <DialogDescription className="apex-id">SHA-256 anchored · 28 pages · signed 12 Mar 2024</DialogDescription>
        <div className="rounded-lg border border-border-subtle bg-surface p-6 min-h-[220px] flex flex-col gap-2">
          <p className="text-[13px] font-bold">§4.2 Emergency Response — Chilled Water Core</p>
          <p className="text-[13px] text-muted">{PDF_PAGES[page]}</p>
          <div className="flex items-center gap-2 mt-auto pt-2">
            <Button variant="secondary" onClick={() => setPage((p) => (p + 2) % 3)}>Prev</Button>
            <span className="apex-id">{page + 1} / 3</span>
            <Button variant="secondary" onClick={() => setPage((p) => (p + 1) % 3)}>Next</Button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/audit-trail">
            <Button variant="secondary">Verify Hash in Audit Trail</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Amendment A1 — scope required; submit routes draft to Legal + VP Operations. */
export function AmendDialog({ push, triggerLabel = 'Initiate Amendment' }: { push: Push; triggerLabel?: string }) {
  const [scope, setScope] = useState('Rate card 2025: after-hours multiplier 1.5× → 1.35× for P1 chiller events.');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('Draft routes to Legal + VP Operations for countersign.');
  const ok = scope.trim().length > 0;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary"><SquarePen size={16} /> {triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="amd-h">
        <DialogTitle id="amd-h">Initiate Amendment</DialogTitle>
        <DialogDescription>{CANON.msa} · Amendment A1 draft</DialogDescription>
        <label className="text-xs font-semibold" htmlFor="amd-scope">Scope (required)</label>
        <textarea
          id="amd-scope"
          rows={2}
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-full p-2 border border-border-strong rounded text-[13px] outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt"
        />
        {touched && !ok && <p className="text-[11px] font-semibold text-fail">Scope is required.</p>}
        <div className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogTrigger>
          <Button
            onClick={() => {
              setTouched(true);
              if (!ok) return;
              setState('Amendment A1 draft submitted · routed to Legal + VP Operations.');
              push(true, 'Amendment drafted', 'A1 scope submitted for countersign.');
            }}
          >
            Submit Draft
          </Button>
        </div>
        <p className="text-xs text-muted" role="status">{state}</p>
      </DialogContent>
    </Dialog>
  );
}

/** Vendor-locked WO dispatch — title required; priority arms the matching SLA. */
export function DispatchDialog({ push }: { push: Push }) {
  const [title, setTitle] = useState('Chiller vibration re-check after seal replacement');
  const [asset, setAsset] = useState<string>(CANON.assetSeal);
  const [pri, setPri] = useState('P2 HIGH');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('Vendor-locked dispatch · SLA auto-armed by priority.');
  const ok = title.trim().length > 0;
  const assetOk = /^AST-[A-Z]+-\d{3}$/.test(asset.trim());
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><Send size={16} /> Dispatch Work Order</Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="dsp-h">
        <DialogTitle id="dsp-h">Dispatch Work Order</DialogTitle>
        <DialogDescription className="apex-id">Prefill ?vendorId={CANON.vendorSlug} · tenant {CANON.tenant}</DialogDescription>
        <label className="text-xs font-semibold" htmlFor="dsp-title">Title (required)</label>
        <Input id="dsp-title" value={title} onChange={(e) => setTitle(e.target.value)} invalid={touched && !ok} />
        {touched && !ok && <p className="text-[11px] font-semibold text-fail">Title is required.</p>}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-semibold" htmlFor="dsp-asset">Asset</label>
            <Input id="dsp-asset" value={asset} onChange={(e) => setAsset(e.target.value)} invalid={touched && !assetOk} className="apex-id" />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-semibold" htmlFor="dsp-pri">Priority</label>
            <select id="dsp-pri" value={pri} onChange={(e) => setPri(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
              <option>P2 HIGH</option>
              <option>P1 CRITICAL</option>
              <option>P3 MEDIUM</option>
            </select>
          </div>
        </div>
        {touched && !assetOk && <p className="text-[11px] font-semibold text-fail">Asset must look like AST-HVAC-004.</p>}
        <div className="flex justify-end gap-2">
          <Link href={`/work-orders/${CANON.workOrderSeal}`}>
            <Button variant="secondary">See {CANON.workOrderSeal}</Button>
          </Link>
          <Button
            onClick={() => {
              setTouched(true);
              if (!ok || !assetOk) return;
              // Prototype numbers the draft WO-2026-0904, but that ID is already the
              // verified pharma-lab dispatch on the dashboard — 0905 keeps ledger integrity.
              setState(`WO-2026-0905 drafted · vendor-locked · ${pri.split(' ')[0]} SLA armed.`);
              push(true, 'WO drafted', `WO-2026-0905 · ${asset.trim()} · ${pri} · vendor-locked.`);
            }}
          >
            Dispatch
          </Button>
        </div>
        <p className="text-xs text-muted" role="status">{state}</p>
      </DialogContent>
    </Dialog>
  );
}

/** Commendation — note required; publish lands on the vendor scorecard. */
export function CommendDialog({ push }: { push: Push }) {
  const [note, setNote] = useState('2h night response on P1 seal leak — zero downtime extension.');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState('Published commendations appear on the vendor scorecard.');
  const ok = note.trim().length > 0;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary"><Award size={16} /> Commendation</Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="cmd-h">
        <DialogTitle id="cmd-h">Commendation</DialogTitle>
        <DialogDescription>Recognize {CANON.vendorName} crew on record</DialogDescription>
        <label className="text-xs font-semibold" htmlFor="cmd-note">Note (required)</label>
        <textarea
          id="cmd-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-2 border border-border-strong rounded text-[13px] outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt"
        />
        {touched && !ok && <p className="text-[11px] font-semibold text-fail">Note is required.</p>}
        <div className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogTrigger>
          <Button
            onClick={() => {
              setTouched(true);
              if (!ok) return;
              setState('Commendation published to the vendor scorecard.');
              push(true, 'Commendation published', 'Trane night crew recognized on record.');
            }}
          >
            Publish
          </Button>
        </div>
        <p className="text-xs text-muted" role="status">{state}</p>
      </DialogContent>
    </Dialog>
  );
}
