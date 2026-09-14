'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { AuditRow } from '@/lib/services/audit-service';

/**
 * System Audit Trail — LIVE from the append-only audit_events table
 * (Phase 1 slice 3). Every row is a real event written inside an auth/WO/SR
 * transaction: actor, action, entity, before/after payload, requestId (the
 * same id the server logs carry — failures are diagnosable end-to-end).
 * The old Merkle-verify/hash/rollback widgets were fiction and are gone;
 * ledger integrity = append-only table + DB transactions (documented).
 */
type Sev = 'Critical' | 'Notice' | 'Info';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1200;

function severityOf(action: string): Sev {
  if (/FAIL|LOCKED|REJECT/.test(action)) return 'Critical';
  if (/HOLD|ESCALATE|CANCEL|CLOSE|REVOKE|LOGOUT/.test(action)) return 'Notice';
  return 'Info';
}

const SEV_TONE: Record<Sev, 'fail' | 'warn' | 'info'> = { Critical: 'fail', Notice: 'warn', Info: 'info' };

const ENTITY_SCOPE: Record<string, string> = {
  auth: 'Security & Auth',
  work_order: 'Work Orders',
  service_request: 'Service Requests',
  asset: 'Asset State',
  other: 'Other',
};

function entityHref(row: AuditRow): string | null {
  if (!row.entityId) return null;
  switch (row.entityType) {
    case 'work_order': return `/work-orders/${row.entityId}`;
    case 'service_request': return `/service-requests/${row.entityId}`;
    case 'asset': return `/assets/${row.entityId}`;
    default: return null;
  }
}

function fmtTs(iso: string): string {
  const d = new Date(iso);
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}.${p(d.getUTCMilliseconds(), 3)} UTC`;
}

export function AuditTrail({
  rows,
  counts,
  total,
  truncated,
  orgId,
}: {
  rows: AuditRow[];
  counts: { entityType: string; total: number }[];
  total: number;
  truncated: boolean;
  orgId: string;
}) {
  const [q, setQ] = useState('');
  const [entity, setEntity] = useState('All Entities');
  const [action, setAction] = useState('All Actions');
  const [principal, setPrincipal] = useState('All Principals');
  const [scope, setScope] = useState('All Logs');
  const [sev, setSev] = useState('All Levels');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [selId, setSelId] = useState<number | null>(rows[0]?.id ?? null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expOpen, setExpOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hot = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', hot);
    return () => document.removeEventListener('keydown', hot);
  }, []);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const entities = useMemo(() => Array.from(new Set(rows.map((r) => r.entityId).filter(Boolean))) as string[], [rows]);
  const actions = useMemo(() => Array.from(new Set(rows.map((r) => r.action))).sort(), [rows]);
  const principals = useMemo(() => Array.from(new Set(rows.map((r) => r.actorName))).sort(), [rows]);

  const filtered = rows.filter((e) => {
    if (entity !== 'All Entities' && e.entityId !== entity) return false;
    if (action !== 'All Actions' && e.action !== action) return false;
    if (principal !== 'All Principals' && e.actorName !== principal) return false;
    if (sev !== 'All Levels' && severityOf(e.action) !== sev) return false;
    if (scope !== 'All Logs' && ENTITY_SCOPE[e.entityType ?? 'other'] !== scope) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${e.id} ${e.action} ${e.entityId ?? ''} ${e.actorName} ${e.requestId ?? ''}`.toLowerCase().includes(needle);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const sel = rows.find((r) => r.id === selId) ?? filtered[0] ?? rows[0] ?? null;

  const reset = () => {
    setQ(''); setEntity('All Entities'); setAction('All Actions');
    setPrincipal('All Principals'); setScope('All Logs'); setSev('All Levels'); setPage(0);
  };

  const exportLog = () => {
    if (format === 'csv') {
      const head = 'id,utc,action,entity_type,entity_id,actor,severity,request_id';
      const body = filtered.map((e) => [e.id, `"${fmtTs(e.ts)}"`, `"${e.action}"`, `"${e.entityType ?? ''}"`, `"${e.entityId ?? ''}"`, `"${e.actorName}"`, severityOf(e.action), `"${e.requestId ?? ''}"`].join(','));
      downloadFile('audit-ledger.csv', [head, ...body].join('\n'), 'text/csv');
    } else {
      downloadFile('audit-ledger.json', JSON.stringify(filtered, null, 2), 'application/json');
    }
    setExpOpen(false);
    push(true, 'Ledger exported', `${filtered.length} real events → audit-ledger.${format}.`);
  };

  const scopes = [
    { n: 'All Logs', c: total },
    ...counts.map((g) => ({ n: ENTITY_SCOPE[g.entityType] ?? g.entityType, c: g.total })),
  ];

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Audit Trail &amp; System Logs</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="at-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Append-only ledger · {total} real events · tenant {orgId}</p>
            <h1 id="at-h" className="text-2xl font-semibold tracking-tight">Audit Trail</h1>
            <p className="text-[13px] text-muted">
              Every auth decision, work-order transition, and service-request action — written inside the same DB
              transaction as the change itself. <span className="apex-id">requestId</span> matches the server logs.
            </p>
            {truncated && (
              <p className="text-[11px] font-semibold text-warn mt-1">
                Showing the newest {rows.length} of {total} events — server-side paging ships with the observability slice.
              </p>
            )}
          </div>
          <Dialog open={expOpen} onOpenChange={setExpOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary"><Download size={16} /> Export Ledger</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Export Audit Ledger</DialogTitle>
              <DialogDescription>{filtered.length} filtered events — a real client-side download of persisted rows.</DialogDescription>
              <div className="flex gap-2">
                {(['csv', 'json'] as const).map((f) => (
                  <Button key={f} variant={format === f ? 'primary' : 'secondary'} onClick={() => setFormat(f)}>{f.toUpperCase()}</Button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setExpOpen(false)}>Cancel</Button>
                <Button onClick={exportLog}>Download</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Scope sidebar — real counts */}
          <aside className="xl:col-span-3 flex flex-col gap-1" aria-label="Scopes">
            {scopes.map((s) => (
              <button key={s.n} type="button" onClick={() => { setScope(s.n); setPage(0); }}
                className={cn('flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium text-left',
                  scope === s.n ? 'bg-[#EFF4FF] text-cobalt-deep border border-cobalt' : 'border border-transparent hover:bg-surface')}>
                <span>{s.n}</span>
                <span className="apex-id text-muted">{s.c.toLocaleString('en-US')}</span>
              </button>
            ))}
            <div className="rounded-lg bg-surface-subtle p-3 text-[11px] text-muted mt-2">
              Integrity: append-only table + transactional writes (no update/delete paths in code). Hash-chained ledger
              is a future hardening item — not claimed today.
            </div>
          </aside>

          {/* Ledger table */}
          <div className="xl:col-span-9 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Input ref={searchRef} value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search action, entity, actor, requestId… (⌘/)" aria-label="Search audit events" />
              </div>
              <select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(0); }} aria-label="Entity filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card max-w-[180px]">
                {['All Entities', ...entities].map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={action} onChange={(e) => { setAction(e.target.value); setPage(0); }} aria-label="Action filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {['All Actions', ...actions].map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={principal} onChange={(e) => { setPrincipal(e.target.value); setPage(0); }} aria-label="Actor filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {['All Principals', ...principals].map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={sev} onChange={(e) => { setSev(e.target.value); setPage(0); }} aria-label="Severity filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                {['All Levels', 'Critical', 'Notice', 'Info'].map((s) => <option key={s}>{s}</option>)}
              </select>
              <Button variant="ghost" onClick={reset}>Reset</Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full text-[13px] min-w-[860px]">
                <thead>
                  <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                    <th className="p-2 font-semibold">Event</th>
                    <th className="font-semibold">UTC</th>
                    <th className="font-semibold">Action</th>
                    <th className="font-semibold">Entity</th>
                    <th className="font-semibold">Principal</th>
                    <th className="font-semibold">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((e) => {
                    const href = entityHref(e);
                    const s = severityOf(e.action);
                    return (
                      <tr key={e.id} onClick={() => setSelId(e.id)}
                        className={cn('border-b border-surface-subtle cursor-pointer', selId === e.id ? 'bg-[#EFF4FF]' : 'hover:bg-surface')}>
                        <td className="p-2 apex-id text-muted">#{e.id}</td>
                        <td className="apex-id text-xs whitespace-nowrap">{fmtTs(e.ts)}</td>
                        <td className="font-semibold apex-id">{e.action}</td>
                        <td className="apex-id text-xs">
                          {href ? <Link className="text-cobalt font-bold hover:underline" href={href} onClick={(ev) => ev.stopPropagation()}>{e.entityId}</Link> : (e.entityId ?? '—')}
                          {e.entityType && <span className="text-muted"> · {e.entityType}</span>}
                        </td>
                        <td className="text-xs">{e.actorName}</td>
                        <td><Badge variant={SEV_TONE[s]}>{s}</Badge></td>
                      </tr>
                    );
                  })}
                  {shown.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-muted">No events match — reset filters. Events appear as soon as auth/WO/SR actions run.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted" role="status">
              <span>Showing {shown.length} of {filtered.length} filtered ({total} total in ledger)</span>
              <span className="flex items-center gap-2">
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} aria-label="Page size" className="h-8 px-1 border border-border-strong rounded bg-card">
                  {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
                </select>
                <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <span className="apex-id">{page + 1}/{pages}</span>
                <Button variant="secondary" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Detail pane */}
      {sel && (
        <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="atd-h">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="atd-h" className="text-base font-semibold">
              Event #{sel.id} · <span className="apex-id">{sel.action}</span> <Badge variant={SEV_TONE[severityOf(sel.action)]}>{severityOf(sel.action)}</Badge>
            </h2>
            <span className="apex-id text-muted">{fmtTs(sel.ts)}</span>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[13px]">
            <div><dt className="apex-label-caps text-muted">Principal</dt><dd className="font-semibold">{sel.actorName}</dd></div>
            <div><dt className="apex-label-caps text-muted">Entity</dt><dd className="apex-id">{sel.entityId ?? '—'} · {sel.entityType ?? '—'}</dd></div>
            <div className="col-span-2"><dt className="apex-label-caps text-muted">Request ID (matches server log)</dt><dd className="apex-id break-all">{sel.requestId ?? '—'}</dd></div>
          </dl>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="apex-label-caps text-muted mb-1">Before</p>
              <pre className="text-[11px] bg-surface border border-border-subtle rounded p-2 overflow-auto max-h-48">{sel.before ? JSON.stringify(sel.before, null, 2) : '—'}</pre>
            </div>
            <div>
              <p className="apex-label-caps text-muted mb-1">After</p>
              <pre className="text-[11px] bg-surface border border-border-subtle rounded p-2 overflow-auto max-h-48">{sel.after ? JSON.stringify(sel.after, null, 2) : '—'}</pre>
            </div>
          </div>
        </section>
      )}

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

function downloadFile(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
