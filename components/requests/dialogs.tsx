'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

export type Push = (ok: boolean, title: string, msg: string) => void;

const ZONES = ['CUP-West (current)', 'CUP-East', 'Tower L1–L12', 'Yard & Utilities'] as const;

const ASSETS = [
  { id: CANON.assetSeal, desc: `${CANON.assetOem} · 68 NEEDS OVERHAUL`, current: true },
  { id: 'AST-PMP-112', desc: 'Chilled Water Pump P-112 · 91 HEALTHY', current: false },
];

/** Convert — already converted: opens the WO instead of duplicating (idempotent). */
export function ConvertDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Convert to Work Order &amp; Dispatch Lead</Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="cv-h">
        <DialogTitle id="cv-h">Convert to Work Order</DialogTitle>
        <DialogDescription>{CANON.serviceRequest} → new WO + dispatch lead</DialogDescription>
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warn-bg border border-warn-dot text-warn-ink text-xs">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>Already converted to {CANON.workOrderSeal} (IN PROGRESS). Confirm to open the converted WO instead of duplicating.</span>
        </div>
        <div className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogTrigger>
          <Link href={`/work-orders/${CANON.workOrderSeal}`}>
            <Button>Open {CANON.workOrderSeal}</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Re-assign zone — save writes back to the conversion status line + toast. */
export function ZoneDialog({ zone, onSave }: { zone: string; onSave: (z: string) => void }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(zone);
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setSel(zone); }}>
      <DialogTrigger asChild>
        <Button variant="secondary">Re-Assign Zone</Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="zn-h">
        <DialogTitle id="zn-h">Re-Assign Zone</DialogTitle>
        <DialogDescription>Current: {zone} · Shift A on shift</DialogDescription>
        <label className="text-xs font-semibold" htmlFor="zone-sel">Zone</label>
        <select
          id="zone-sel"
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card"
        >
          {ZONES.map((z) => (
            <option key={z} value={z.replace(' (current)', '')}>{z}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onSave(sel); setOpen(false); }}>Save Zone</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Change linked asset — pick rewires the header link (M5 ?asset= parity). */
export function AssetDialog({ asset, onPick }: { asset: string; onPick: (a: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-cobalt font-semibold hover:underline text-[13px]">Change</button>
      </DialogTrigger>
      <DialogContent aria-labelledby="as-h">
        <DialogTitle id="as-h">Change Linked Asset</DialogTitle>
        <DialogDescription className="apex-id">M5 prefill · ?asset={asset}</DialogDescription>
        <ul className="flex flex-col gap-2 text-[13px]">
          {ASSETS.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => { onPick(a.id); setOpen(false); }}
                className={cn(
                  'w-full text-left rounded border-2 p-3',
                  a.id === asset ? 'border-cobalt-deep bg-cobalt-tint' : 'border-border-subtle bg-card hover:border-border-strong'
                )}
              >
                <strong className="apex-id">{a.id}</strong> · {a.desc}{a.id === asset ? ' (current)' : ''}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Link href="/assets">
            <Button variant="secondary">Open Registry</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
