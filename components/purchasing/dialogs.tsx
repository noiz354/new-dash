'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CANON } from '@/lib/canon';

export type ToastFn = (ok: boolean, title: string, msg: string, retry?: boolean) => void;

/** H3 authorize: summary ($2,900 vs $64,200 envelope) → EDI transmit → DISPATCHED. */
export function AuthDialog({ push }: { push: ToastFn }) {
  const [phase, setPhase] = useState<'ready' | 'sending' | 'done' | 'failed'>('ready');
  const confirm = () => {
    if (phase === 'sending') return;
    setPhase('sending');
    setTimeout(() => {
      // Standalone-safe: no backend → demonstrate success path + idempotency note.
      setPhase('done');
      push(true, 'Authorized + dispatched', 'PO-2026-0315 · $2,900.00 within $64,200.00 envelope · key idem-auth-po0315.');
    }, 1100);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Authorize &amp; Auto-Dispatch</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Authorize &amp; Auto-Dispatch</DialogTitle>
        <DialogDescription>PO-2026-0315 (from PR-2026-0314) → Trane EarthWise Direct</DialogDescription>
        <ul className="text-[13px] flex flex-col gap-1.5">
          <li className="flex justify-between"><span className="text-muted">Amount</span><strong className="apex-id">$2,900.00</strong></li>
          <li className="flex justify-between"><span className="text-muted">Envelope CUP Maintenance Capex Q1</span><strong className="apex-id">$64,200.00</strong></li>
          <li className="flex justify-between"><span className="text-muted">Remaining after post</span><strong className="apex-id text-pass">$61,300.00</strong></li>
          <li className="flex justify-between"><span className="text-muted">Signatures</span><strong>2 of 3 (quorum met)</strong></li>
          <li className="flex justify-between"><span className="text-muted">Idempotency-Key</span><span className="apex-id">idem-auth-po0315</span></li>
        </ul>
        <p className="text-xs text-muted" role="status">
          {phase === 'ready' && 'Ready — EDI dispatch to vendor on confirm.'}
          {phase === 'sending' && 'Transmitting EDI to Trane EarthWise Direct…'}
          {phase === 'done' && 'PO-2026-0315 DISPATCHED (local simulation — no EDI transmit) · key idem-auth-po0315.'}
          {phase === 'failed' && 'EDI failed — PO status unchanged (no half-dispatch). Retry with the same key.'}
        </p>
        {phase === 'done' && <Badge variant="pass">PO-2026-0315 DISPATCHED (local)</Badge>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPhase('ready')}>Reset demo</Button>
          <Button onClick={confirm} disabled={phase === 'sending'}>
            {phase === 'sending' ? 'Transmitting…' : 'Confirm & Dispatch'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** H3 RFQ: vendor multi-select guard → RFQ_SENT. */
const RFQ_VENDORS = [
  { id: 'earthwise', label: 'Trane EarthWise Direct', sub: '+62-21-5090-0440' },
  { id: 'supplyco', label: 'Trane Supply Co', sub: 'SLA Platinum' },
];

export function RfqDialog({ push }: { push: ToastFn }) {
  const [sel, setSel] = useState<string[]>(['earthwise', 'supplyco']);
  const [sent, setSent] = useState(false);
  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((v) => v !== id) : [...s, id]));
  const send = () => {
    setSent(true);
    push(true, 'RFQ sent', `PART-SEAL-8821 quotes requested from ${sel.length} OEM channel(s). Due 16:30 WIB.`);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Request OEM Quotes</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Request OEM Quotes</DialogTitle>
        <DialogDescription>{CANON.sealSku} · select at least one vendor</DialogDescription>
        <div className="flex flex-col gap-2 text-sm">
          {RFQ_VENDORS.map((v) => (
            <label key={v.id} className="flex items-center gap-2 rounded border border-border-subtle p-3 cursor-pointer">
              <input
                type="checkbox"
                className="accent-[#1E40AF]"
                checked={sel.includes(v.id)}
                onChange={() => {
                  toggle(v.id);
                  setSent(false);
                }}
              />
              {v.label} · <span className="apex-id text-muted">{v.sub}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted" role="status">
          {sent ? 'RFQ_SENT · quotes due 16:30 WIB.' : sel.length === 0 ? 'Select at least one vendor.' : `${sel.length} vendor(s) selected.`}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary">Cancel</Button>
          <Button disabled={sel.length === 0} onClick={send}>Send RFQ</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** H3 reject PR: destructive, reason required (AlertDialog contract). */
export function RejectDialog({ push }: { push: ToastFn }) {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const ok = reason.trim().length > 0;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Reject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Reject PR-2026-0314</DialogTitle>
        <DialogDescription>Destructive — requires a reason</DialogDescription>
        <label className="text-xs font-semibold" htmlFor="pr-reject-reason">Reason (required)</label>
        <textarea
          id="pr-reject-reason"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-border-strong rounded text-sm outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt"
        />
        {!ok && <p className="text-[11px] font-semibold text-fail">A reason is required to reject a P1 request.</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!ok}
            onClick={() => {
              setOpen(false);
              push(false, 'PR-2026-0314 REJECTED', 'Reason logged to audit trail.', true);
            }}
          >
            Reject PR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type DisputeKind = 'return' | 'claim' | 'partial';

/** H3 GRN dispute: kind radio + required note → GRN DISPUTED. */
export function DisputeDialog({
  push,
  onDisputed,
}: {
  push: ToastFn;
  onDisputed: (kind: DisputeKind) => void;
}) {
  const [kind, setKind] = useState<DisputeKind>('return');
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const ok = note.trim().length > 0;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Flag Discrepancy</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Flag Discrepancy</DialogTitle>
        <DialogDescription>GRN-9941 · PO-2026-0298</DialogDescription>
        <div className="flex flex-col gap-2 text-sm" role="radiogroup" aria-label="Dispute kind">
          {(
            [
              ['return', 'Return to vendor'],
              ['claim', 'Warranty / damage claim'],
              ['partial', 'Partial accept + backorder'],
            ] as [DisputeKind, string][]
          ).map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="dsp-kind" value={v} checked={kind === v} onChange={() => setKind(v)} className="accent-[#1E40AF]" />
              {l}
            </label>
          ))}
        </div>
        <label className="text-xs font-semibold" htmlFor="dsp-note">Note (required)</label>
        <textarea
          id="dsp-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-2 border border-border-strong rounded text-sm outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt"
        />
        {!ok && <p className="text-[11px] font-semibold text-fail">Describe the discrepancy.</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!ok}
            onClick={() => {
              setOpen(false);
              onDisputed(kind);
              push(false, 'GRN-9941 DISPUTED', `Vendor claim opened (${kind}).`, true);
            }}
          >
            File Dispute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
