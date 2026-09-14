'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, CloudUpload, Inbox, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { FieldOffline } from './FieldOffline';
import { FieldToasts, useFieldToasts } from './toasts';

interface Audit {
  id: string;
  title: string;
  sub: string;
  pill: string;
  pillTone: 'fail' | 'warn' | 'pass';
  progress?: number;
  foot?: string;
  critical?: boolean;
}

const AUDITS: Audit[] = [
  {
    id: CANON.inspection,
    title: 'Weekly Chiller Run-Check · Chiller #04',
    sub: `${CANON.assetSeal} · ${CANON.assetOem} · Step 2 of 4`,
    pill: '1 CRITICAL DEFECT',
    pillTone: 'fail',
    progress: CANON.inspectionProgress,
    foot: 'Due 15:30 WIB · Tap to resume run',
    critical: true,
  },
  {
    id: 'INS-2026-0415',
    title: 'Pump Room Walkdown · #B-201 Emer Gen Vault',
    sub: 'Not started · 6 checkpoints · est. 25 min',
    pill: 'DUE 16:00',
    pillTone: 'warn',
  },
  {
    id: 'INS-2026-0418',
    title: 'AHU Filter Bank Inspection · Level 12',
    sub: 'Not started · 4 checkpoints · est. 15 min',
    pill: 'QUEUED',
    pillTone: 'pass',
  },
];

const pillTone: Record<Audit['pillTone'], string> = {
  fail: 'text-fail border-fail bg-fail-bg',
  warn: 'text-warn border-warn bg-warn-bg',
  pass: 'text-pass border-pass bg-pass-bg',
};

/** My Audits — H2 field queue (reference: web/my-audits.html). */
export function AuditQueue() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const { toasts, push } = useFieldToasts();

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      if (!navigator.onLine) push(false, 'Offline', 'List served from cache. Changes queue to Sync.');
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = AUDITS.filter(
    (a) => a.id.toLowerCase().includes(q.toLowerCase()) || a.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <header className="no-print fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b-2 border-slate900">
        <div className="min-h-16 px-4 flex items-center justify-between gap-2 max-w-3xl mx-auto w-full py-2">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="h-9 w-9 shrink-0" viewBox="0 0 160 40" fill="none" role="img" aria-label="Apex Ops logo">
              <rect width="36" height="36" rx="8" fill="#1E40AF" />
              <path d="M18 8L27 24H9L18 8Z" stroke="#60A5FA" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="18" cy="20" r="2.5" fill="#FFFFFF" />
              <path d="M12 28H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold font-display leading-tight truncate">My Audits</h1>
              <p className="text-xs text-muted truncate">E. Voronova · Shift A · {CANON.tenant}</p>
            </div>
          </div>
          <Link
            href="/field/sync"
            className="relative min-w-[48px] min-h-[48px] flex items-center justify-center rounded border-2 border-slate900 bg-white"
            aria-label="Sync status, 2 items pending"
          >
            <CloudUpload size={24} />
            <span className="absolute -top-2 -right-2 px-1 rounded bg-fail text-white text-[11px] leading-tight font-bold min-w-[20px] text-center">2</span>
          </Link>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-4 pt-24 flex flex-col gap-4">
        <FieldOffline />

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter audits by ID or title…"
            aria-label="Filter audits"
            className="min-h-[48px] pl-10 text-base border-2 focus:border-slate900 focus:ring-0"
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-2" aria-label="Loading audits">
            <Skeleton className="h-24 rounded border-2 border-border-strong" />
            <Skeleton className="h-24 rounded border-2 border-border-strong" />
            <Skeleton className="h-24 rounded border-2 border-border-strong" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded border-2 border-dashed border-hold bg-white p-6 text-center flex flex-col items-center gap-2">
            <Inbox size={36} className="text-muted" />
            <p className="text-lg font-semibold font-display">No matching audits</p>
            <p className="text-sm text-muted">No assigned run matches “{q}”.</p>
            <Link href="/field/sync" className="min-h-[48px] inline-flex items-center px-4 rounded bg-slate900 text-white text-sm font-bold">
              Open Sync Queue
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Assigned audits">
            {rows.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/field/audits/${a.id}/run`}
                  className={cn(
                    'block rounded border-2 bg-white overflow-hidden active:scale-[0.99]',
                    a.critical ? 'border-fail' : 'border-border-strong'
                  )}
                >
                  <span className="flex">
                    {a.critical && <span className="w-2 bg-fail shrink-0" aria-hidden="true" />}
                    <span className="flex-1 p-3 flex flex-col gap-2 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="apex-id font-bold bg-surface-subtle border-[1.5px] border-hold px-2 py-0.5 rounded">{a.id}</span>
                        <span className={cn('text-xs font-bold border px-2 py-0.5 rounded', pillTone[a.pillTone])}>{a.pill}</span>
                      </span>
                      <span className="text-lg font-semibold font-display">{a.title}</span>
                      <span className="text-sm text-muted">{a.sub}</span>
                      {typeof a.progress === 'number' && (
                        <span className="flex items-center gap-2">
                          <span className="flex-1 h-3 rounded-full bg-surface-subtle border border-border-strong overflow-hidden">
                            <span className="block h-full bg-pass rounded-full" style={{ width: `${a.progress}%` }} />
                          </span>
                          <span className="apex-id font-bold">{a.progress}%</span>
                        </span>
                      )}
                      {a.foot && <span className="text-xs text-muted">{a.foot}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="rounded border-2 border-slate900 bg-white shadow-hard p-3 flex flex-col gap-2" aria-label="Last submission">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display">Last Submission</h2>
            <span className="text-xs font-bold text-pass border border-pass bg-pass-bg px-2 py-0.5 rounded">SUBMITTED</span>
          </div>
          <p className="text-sm">
            INS-2026-0409 · Cooling Tower Loop · auto-dispatched{' '}
            <Link className="apex-id font-bold text-cobalt-deep underline" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
          </p>
          <p className="text-xs text-muted">Submitted 13:58 WIB · hash-chained to audit ledger</p>
        </section>

        <p className="text-xs text-muted flex items-center gap-1">
          <ClipboardList size={14} /> 3 assigned · Shift A {CANON.shiftA}
        </p>
      </main>

      <FieldToasts toasts={toasts} />
    </>
  );
}
