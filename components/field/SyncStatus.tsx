'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CloudUpload, SignalLow, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { FieldToasts, useFieldToasts } from './toasts';

interface Item { id: 'q1' | 'q2'; title: string; op: string; key: string }

const ITEMS: Item[] = [
  { id: 'q1', title: 'STEP 02 DRAFT · 18.4 ppm', op: 'PATCH steps/02', key: 'idem-7f2a-0412-02' },
  { id: 'q2', title: 'VOICE NOTE · 0:12', op: 'POST evidence (audio)', key: 'idem-7f2a-0412-vn' },
];

type State = 'QUEUED' | 'SENDING…' | 'SYNCED';

/** Sync Status — H2 outbox queue (reference: web/sync-status.html). */
export function SyncStatus() {
  const { toasts, push } = useFieldToasts();
  const [states, setStates] = useState<Record<'q1' | 'q2', State>>({ q1: 'QUEUED', q2: 'QUEUED' });
  const q1tries = useRef(0);

  const pending = (['q1', 'q2'] as const).filter((k) => states[k] !== 'SYNCED').length;

  const retry = (item: Item) => {
    if (states[item.id] !== 'QUEUED') return;
    setStates((s) => ({ ...s, [item.id]: 'SENDING…' }));
    setTimeout(() => {
      // Standalone parity: first q1 retry fails partially (item survives), next succeeds.
      if (item.id === 'q1' && q1tries.current === 0) {
        q1tries.current++;
        setStates((s) => ({ ...s, q1: 'QUEUED' }));
        push(false, 'Partial failure', 'q1 kept in queue. Same Idempotency-Key on retry — no duplicate.');
      } else {
        setStates((s) => ({ ...s, [item.id]: 'SYNCED' }));
        push(true, 'Item synced', `${item.id.toUpperCase()} acknowledged with its idempotency key.`);
      }
    }, 800);
  };

  const syncAll = () => {
    push(true, 'Sync started', 'Retrying all items with their original keys…');
    ITEMS.filter((i) => states[i.id] === 'QUEUED').forEach((item, i) => {
      setTimeout(() => retry(item), i * 1200);
    });
  };

  return (
    <>
      <header className="no-print fixed top-7 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b-2 border-slate900">
        <div className="min-h-16 px-4 flex items-center justify-between gap-2 max-w-3xl mx-auto w-full py-2">
          <Link href="/field/audits" className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded border-2 border-slate900 bg-white" aria-label="Back to audits">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-lg font-semibold font-display">Sync Status</h1>
            <p className="text-xs text-muted">{CANON.inspection} · {CANON.inspectionProgress}% · E. Voronova</p>
          </div>
          <span className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded border-2 border-warn bg-warn-bg text-warn-ink" role="status" aria-label="Network degraded">
            <SignalLow size={24} />
          </span>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-4 pt-[124px] flex flex-col gap-4">
        {pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-3 rounded border-2 border-warn bg-warn-bg text-warn-ink" role="alert">
            <WifiOff size={22} />
            <p className="text-sm font-semibold">Link degraded — queue held locally. Nothing is lost.</p>
          </div>
        )}

        <section className="rounded border-2 border-slate900 bg-white shadow-hard p-3 flex items-center justify-between gap-2" aria-label="Queue summary">
          <div>
            <h2 className="text-lg font-semibold font-display">Outbox Queue</h2>
            <p className="text-sm text-muted">{pending === 0 ? 'Queue clear' : `${pending} item(s) pending · oldest 14:31 WIB`}</p>
          </div>
          <Button variant="field" className="bg-slate900" onClick={syncAll} disabled={pending === 0}>Sync Now</Button>
        </section>

        {pending === 0 ? (
          <div className="rounded border-2 border-dashed border-pass bg-white p-6 text-center flex flex-col items-center gap-2">
            <CloudUpload size={36} className="text-pass" />
            <p className="text-lg font-semibold font-display">Queue clear</p>
            <p className="text-sm text-muted">All items synced · progress updated to {CANON.inspectionProgress}%.</p>
            <Link href="/field/audits" className="min-h-[48px] inline-flex items-center px-4 rounded bg-slate900 text-white text-sm font-bold">
              Back to Audits
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Pending items">
            {ITEMS.map((item) => {
              const st = states[item.id];
              if (st === 'SYNCED') return null;
              return (
                <li key={item.id} className="rounded border-2 border-border-strong bg-white p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="apex-id font-bold">{item.title}</span>
                    <span className={cn(
                      'text-xs font-bold border px-2 py-0.5 rounded',
                      st === 'QUEUED' ? 'text-warn border-warn bg-warn-bg' : 'text-cobalt-deep border-cobalt-deep bg-cobalt-tint'
                    )}>
                      {st}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{item.op} · key <span className="apex-id">{item.key}</span></p>
                  <div className="flex gap-2">
                    <Button
                      variant="field"
                      className="flex-1 bg-white text-body border-2 border-slate900"
                      onClick={() => retry(item)}
                      disabled={st === 'SENDING…'}
                    >
                      {st === 'SENDING…' ? 'Sending…' : 'Retry'}
                    </Button>
                    <Link
                      href={`/field/audits/${CANON.inspection}/run`}
                      className="flex-1 min-h-[48px] rounded bg-surface-subtle text-sm font-bold inline-flex items-center justify-center"
                    >
                      Open Step
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section className="rounded border-2 border-border-strong bg-white p-3 flex flex-col gap-1" aria-label="Synced">
          <h2 className="text-lg font-semibold font-display">Recently Synced</h2>
          <ul className="flex flex-col gap-1 text-sm">
            <li className="flex items-center justify-between gap-2">
              <span>PHOTO_CHILLER4_SEAL.RAW · GPS stamped</span>
              <span className="text-xs font-bold text-pass">SYNCED 14:36</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>STEP 01 LOTO PASS · {CANON.lotoPadlock}</span>
              <span className="text-xs font-bold text-pass">SYNCED 08:05</span>
            </li>
          </ul>
        </section>
      </main>

      <FieldToasts toasts={toasts} />
    </>
  );
}
