'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CANON } from '@/lib/canon';

/** WOD-05 hold/escalate — reason required, submit disabled until filled. */
export function HoldDialog() {
  const [reason, setReason] = useState('Awaiting Trane field advisor — seal seating torque spec confirmation.');
  const [done, setDone] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="secondary">Put On Hold</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>Put On Hold</DialogTitle>
        <DialogDescription>{CANON.workOrderSeal} · clock keeps running unless stopped</DialogDescription>
        <label className="text-xs font-semibold" htmlFor="wo-hold-reason">Reason (required)</label>
        <textarea id="wo-hold-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-border-strong rounded text-sm outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt" />
        {!reason.trim() && <p className="text-[11px] font-semibold text-fail">A reason is required to hold a P1 work order.</p>}
        {done && <Badge variant="warn">ON HOLD — pill updates after ledger write</Badge>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDone(false)}>Cancel</Button>
          <Button disabled={!reason.trim()} onClick={() => setDone(true)}>Confirm Hold</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EscalateDialog() {
  const [reason, setReason] = useState('Vibration 7.8 mm/s at trip threshold — request Tier-1 advisor on site before commissioning.');
  const [done, setDone] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="secondary">Escalate to Vendor</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>Escalate to Vendor</DialogTitle>
        <DialogDescription>Trane Technologies · {CANON.msa} · <span className="apex-id">+62-21-5090-0440</span></DialogDescription>
        <label className="text-xs font-semibold" htmlFor="wo-esc-reason">Reason (required)</label>
        <textarea id="wo-esc-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-border-strong rounded text-sm outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt" />
        {done && <Badge variant="info">ESCALATED — Tier-1 advisor paged</Badge>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDone(false)}>Cancel</Button>
          <Button disabled={!reason.trim()} onClick={() => setDone(true)}>Send Escalation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** WOD-06 sign-off — 3 guards; photo attach simulated, enables sign. */
export function SignoffDialog() {
  const [photo, setPhoto] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Mark Task Complete</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>OSHA Sign-off</DialogTitle>
        <DialogDescription>{CANON.workOrderSeal} · Step 04 completion</DialogDescription>
        <ul className="text-sm flex flex-col gap-2">
          <li className="flex items-center gap-2"><Badge variant="pass">✓</Badge> Step 05 prerequisites reviewed</li>
          <li className="flex items-center gap-2"><Badge variant="pass">✓</Badge> LOTO verified · Padlock {CANON.lotoPadlock} @ {CANON.lotoPoint}</li>
          <li className="flex items-center gap-2">
            <Badge variant={photo ? 'pass' : 'warn'}>{photo ? '✓' : '!'}</Badge>
            Step 04 verification photo attached
            {!photo && <Button variant="secondary" onClick={() => setPhoto(true)}>Attach Photo</Button>}
          </li>
        </ul>
        <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-3">
          <span className="w-10 h-10 rounded-full bg-cobalt-tint text-cobalt-deep text-sm font-bold flex items-center justify-center">MB</span>
          <div><p className="text-sm font-semibold">Smart Badge sign-off</p><p className="apex-id text-muted">Tap badge RFID-7714 · {CANON.engineer}</p></div>
        </div>
        {!photo && <p className="text-[11px] font-semibold text-warn">Attach the Step 04 verification photo to enable sign-off.</p>}
        {done && <Badge variant="pass">COMPLETED — Step 05 unlocked</Badge>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary">Cancel</Button>
          <Button disabled={!photo} onClick={() => setDone(true)}>Sign &amp; Complete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** WOD-12 export — background job with progress + retry vocabulary. */
export function ExportDialog() {
  const [pct, setPct] = useState(0);
  const [running, setRunning] = useState(false);
  const start = () => {
    if (running) return;
    setRunning(true);
    setPct(0);
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(t);
          setRunning(false);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="secondary">Export WO Log</Button></DialogTrigger>
      <DialogContent>
        <DialogTitle>Export WO Log</DialogTitle>
        <DialogDescription>{CANON.workOrderSeal} · CSV + evidence manifest</DialogDescription>
        <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
          <div className="h-full bg-cobalt-deep transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted" role="status">
          {pct === 100 ? 'Done — wo-2026-0894-log.csv ready in Reports.' : running ? 'Job exp-7d21 running…' : 'Ready. Export runs as a background job.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={start}>{pct === 100 ? 'Retry' : 'Start Export'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      Print Work Permit
    </Button>
  );
}
