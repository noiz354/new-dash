'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2, Copy, Download, FileText, Flag, History, Lock, Pause, Play, RotateCcw, ShieldCheck, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

type Sev = 'Critical' | 'Notice' | 'Info';

interface Evt {
  id: string; ts: string; action: string; entity: string; scope: string; sev: Sev;
  hash: string; detail: string; who: string; title: string; ip: string; term: string;
  href?: string; live?: boolean;
}

const SEED: Evt[] = [
  { id: 'EVT-20260524-94812', ts: '2026-05-24 14:35:18.421 UTC', action: 'APPROVE', entity: 'PR-2026-0314', scope: 'Purchasing & POs', sev: 'Notice', hash: 'sha256:7f4c9a…', detail: 'Approved CapEx emergency procurement for Chiller mechanical shaft seal ($2,900.00)', who: 'David Chen', title: 'Facilities Eng Mgr', ip: '10.14.8.42', term: 'Terminal: HVC-ENG-02' },
  { id: 'EVT-20260524-94770', ts: '2026-05-24 14:22:04.118 UTC', action: 'STATE_CHANGE', entity: CANON.workOrderSeal, scope: 'Work Orders', sev: 'Info', hash: 'sha256:3a1b8e…', detail: 'Work order status shifted from CREATED to DISPATCHED; technician assigned', who: 'Marcus Kowalski', title: 'HVAC Lead Specialist', ip: '10.14.12.88', term: 'HVC-TAB-04 (Mobile)', href: `/work-orders/${CANON.workOrderSeal}` },
  { id: 'EVT-20260524-94755', ts: '2026-05-24 14:18:52.004 UTC', action: 'CREATE / ALERT', entity: CANON.assetSeal, scope: 'Asset State', sev: 'Critical', hash: 'sha256:e92d41…', detail: 'Chiller #4 ultrasonic probe triggered critical defect flag (refrigerant leak 18.4 ppm threshold breach)', who: 'System Telemetry Daemon', title: 'SCADA Auto-Bot', ip: '10.14.0.8', term: 'Broker: SCADA-BROKER-01', href: `/assets/${CANON.assetSeal}` },
  { id: 'EVT-20260524-94102', ts: '2026-05-24 11:15:30.892 UTC', action: 'MUTATION', entity: CANON.sealSku, scope: 'Purchasing & POs', sev: 'Info', hash: 'sha256:88a10c…', detail: `GRN received: +2 kits ${CANON.sealSku} added to ${CANON.sealBin} via ${CANON.purchaseOrder} dock barcode scan`, who: 'Sarah Al-Mansoor', title: 'Fire & Suppression Inspector (dock receiving assist)', ip: '10.14.22.15', term: 'DCK-SCN-02', href: '/inventory' },
  { id: 'EVT-20260524-93877', ts: '2026-05-24 09:40:12.771 UTC', action: 'POLICY_UPDATE', entity: 'RBAC: Sr. Field Tech', scope: 'Security & RBAC', sev: 'Notice', hash: 'sha256:bb401f…', detail: 'Modified discretionary parts expenditure cap from $250.00 to $500.00 for on-duty leads', who: 'Marcus Vance', title: 'VP Operations', ip: '10.14.1.2', term: 'DIR-SEC-01', href: '/organization' },
  { id: 'EVT-20260524-93501', ts: '2026-05-24 08:02:44.310 UTC', action: 'CALIBRATION', entity: 'AST-ELEC-012', scope: 'Asset State', sev: 'Info', hash: 'sha256:44dc92…', detail: 'Quarterly busbar thermal infrared telemetry sensor recalibration acknowledged & signed off', who: CANON.engineer, title: 'SCADA Specialist', ip: '10.14.18.55', term: 'SUB-STN-01', href: '/assets' },
];

const SCOPES = [
  { n: 'All Logs', c: '184.9k' },
  { n: 'Work Orders', c: '42.1k' },
  { n: 'Purchasing & POs', c: '18.2k' },
  { n: 'Asset State', c: '12.4k' },
  { n: 'Security & RBAC', c: '4.8k' },
] as const;

const FULL_HASH = 'sha256:7f4c9a8820d88b42e47c1a93b4ff0291cc8823b199042b91024cd';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1200;

function download(filename: string, text: string, type = 'text/plain') {
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

const utcStamp = () => {
  const d = new Date();
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}.${p(d.getUTCMilliseconds(), 3)} UTC`;
};

/**
 * System Audit Trail & Immutable Event Ledger — archive port (unit 15).
 * Rewires: GRN +100 filters → +2 seal kits (Chunk-9 cluster); S. Al-Mansoor
 * title aligned to org roster; /api/v2 → v1 (C20); line-item SKU SEAL-CHILL
 * → PART-SEAL-8821, 4.5in → 2.5in, qty 1×$2,900 → 2×$1,450 (C3 + Pack-of-2).
 * Seed stamps stay May-24 UTC (ledger); live probes use real current UTC.
 */
export function AuditTrail() {
  const [probes, setProbes] = useState<Evt[]>([]);
  const [live, setLive] = useState(false);
  const [q, setQ] = useState('');
  const [date, setDate] = useState('All Dates');
  const [entity, setEntity] = useState('All Entities');
  const [action, setAction] = useState('All Actions');
  const [principal, setPrincipal] = useState('All Principals');
  const [scope, setScope] = useState<string>('All Logs');
  const [sev, setSev] = useState('All Levels');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState('EVT-20260524-94812');
  const [tab, setTab] = useState<'diff' | 'json'>('diff');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expOpen, setExpOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sim, setSim] = useState<'idle' | 'running' | 'done'>('idle');
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const probeSeq = useRef(1);
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

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const n = probeSeq.current++;
      setProbes((p) => [{
        id: `PROBE-${String(n).padStart(3, '0')}`, ts: utcStamp(), action: 'HEARTBEAT', entity: 'SCADA-BROKER-01',
        scope: 'All Logs', sev: 'Info' as Sev, hash: 'sha256:live…', detail: `WS heartbeat · 42 nodes · 12ms · 0 drops (synthetic live probe #${n})`,
        who: 'System Telemetry Daemon', title: 'SCADA Auto-Bot', ip: '10.14.0.8', term: 'Broker: SCADA-BROKER-01', live: true,
      }, ...p].slice(0, 12));
    }, 5000);
    return () => clearInterval(t);
  }, [live]);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const all = [...probes, ...SEED];
  const filtered = all.filter((e) => {
    if (date === '24 May 2026 (seed)' && e.live) return false;
    if (date === 'Today (live probes)' && !e.live) return false;
    if (entity !== 'All Entities' && e.entity !== entity) return false;
    if (action !== 'All Actions' && e.action !== action) return false;
    if (principal !== 'All Principals' && e.who !== principal) return false;
    if (scope !== 'All Logs' && e.scope !== scope) return false;
    if (sev !== 'All Levels' && e.sev !== sev) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${e.id} ${e.action} ${e.entity} ${e.detail} ${e.who}`.toLowerCase().includes(needle);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const selEvt = all.find((e) => e.id === sel) ?? SEED[0];

  const reset = () => {
    setQ(''); setDate('All Dates'); setEntity('All Entities'); setAction('All Actions');
    setPrincipal('All Principals'); setScope('All Logs'); setSev('All Levels'); setPage(0);
  };

  const exportLog = () => {
    if (format === 'csv') {
      const head = 'event_id,utc,action,entity,severity,principal,hash,detail';
      const body = filtered.map((e) => [`"${e.id}"`, `"${e.ts}"`, `"${e.action}"`, `"${e.entity}"`, e.sev, `"${e.who}"`, `"${e.hash}"`, `"${e.detail}"`].join(','));
      download('audit-ledger.csv', [head, ...body].join('\n'), 'text/csv');
    } else {
      download('audit-ledger.json', JSON.stringify(filtered, null, 2), 'application/json');
    }
    setExpOpen(false);
    push(true, 'Ledger exported', `${filtered.length} events → audit-ledger.${format}.`);
  };

  const verify = () => {
    if (verifying) return;
    setVerifying(true);
    setVerified(false);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      push(true, 'Merkle root confirmed', '9a01f7bb84… · 48,102 proofs · 0 mismatch · 1.42s.');
    }, 1600);
  };

  const rollback = () => {
    if (sim !== 'idle') return;
    setSim('running');
    setTimeout(() => {
      setSim('done');
      push(true, 'Rollback simulated', `${selEvt.id}: rejected — ledger immutable · 0 rows affected.`);
    }, 1400);
  };

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(FULL_HASH);
      push(true, 'Hash copied', 'sha256:7f4c9a…cd · 64 hex chars.');
    } catch {
      push(false, 'Copy blocked', 'Clipboard unavailable — select the hash manually.');
    }
  };

  const proof = () => {
    download('TXN-88120-NUSA-proof.json', JSON.stringify({
      txn: 'TXN-88120-NUSA', event: 'EVT-20260524-94812', entity: 'PR-2026-0314',
      hash: FULL_HASH, merkle: { root: '9a01f7bb84…', index: 48102, proof_chain_valid: true },
      signer: { user_id: 'USR-0042', name: 'David Chen', mfa: 'Okta SCIM FIDO2' },
    }, null, 2), 'application/json');
    push(true, 'Signed proof downloaded', 'TXN-88120-NUSA-proof.json · countersigned envelope.');
  };

  const sevTone = (s: Sev) => (s === 'Critical' ? 'fail' : s === 'Notice' ? 'warn' : 'info');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Audit Trail &amp; System Logs</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="aud-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">AUDIT BUS: REAL-TIME SECURE · Tenant ID: {CANON.tenant} · Cipher: SHA-256 Merkle Chain · Epoch: 1748097318</p>
            <h1 id="aud-h" className="text-2xl font-semibold tracking-tight">System Audit Trail &amp; Immutable Event Ledger</h1>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Dialog open={expOpen} onOpenChange={setExpOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary"><Download size={16} /> Export CSV / JSON Log</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="exp-h">
                <DialogTitle id="exp-h">Export Audit Log</DialogTitle>
                <DialogDescription>Exports the current filtered view ({filtered.length} events).</DialogDescription>
                <div className="flex gap-2" role="radiogroup" aria-label="Export format">
                  {(['csv', 'json'] as const).map((f) => (
                    <button key={f} type="button" onClick={() => setFormat(f)} aria-pressed={format === f} className={cn('h-9 px-4 rounded text-[13px] font-bold border uppercase', format === f ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setExpOpen(false)}>Cancel</Button>
                  <Button onClick={exportLog}>Download</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" onClick={() => { window.print(); push(true, 'Compliance report sent', 'Print/PDF dossier queued · ledger snapshot attached.'); }}>
              <FileText size={16} /> Compliance PDF Report
            </Button>
            <Button onClick={verify} disabled={verifying}>
              <ShieldCheck size={16} /> {verifying ? 'Verifying…' : 'Verify Cryptographic Root'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Total Audited Events (L30D)', v: '184,920', s: '+14.2% MoM · 100% Ingestion Rate' },
            { l: 'Security Overrides Flagged', v: '3', s: '2 Asset Tier-1 Shifts · 1 Off-hours Signoff' },
            { l: 'Tamper-Proof Integrity', v: '100% Verified', s: 'Block #892,104 · 0 Hash Mismatch' },
            { l: 'Active Telemetry Terminals', v: '42 Live Nodes', s: 'WS Broker: 12ms Latency · Healthy' },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
              <span className="apex-label-caps text-muted">{k.l}</span>
              <span className="text-xl font-semibold tabular-nums">{k.v}</span>
              <span className="text-[11px] text-muted">{k.s}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, entities, principals… (Ctrl+/)" aria-label="Search audit events" />
          </div>
          <select value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date scope" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Dates', '24 May 2026 (seed)', 'Today (live probes)'].map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={entity} onChange={(e) => setEntity(e.target.value)} aria-label="Entity filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Entities', ...Array.from(new Set(all.map((e) => e.entity)))].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Action filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Actions', ...Array.from(new Set(all.map((e) => e.action)))].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={principal} onChange={(e) => setPrincipal(e.target.value)} aria-label="Principal filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Principals', ...Array.from(new Set(all.map((e) => e.who)))].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select value={sev} onChange={(e) => setSev(e.target.value)} aria-label="Severity filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Levels', 'Critical', 'Notice', 'Info'].map((x) => <option key={x}>{x}</option>)}
          </select>
          <Button variant="secondary" onClick={reset}><RotateCcw size={15} /> Reset</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quick scope">
          <span className="apex-label-caps text-muted">Quick Scope:</span>
          {SCOPES.map((s) => (
            <button key={s.n} type="button" onClick={() => { setScope(s.n); setPage(0); }} aria-pressed={scope === s.n} className={cn('h-8 px-3 rounded-full text-xs font-semibold border', scope === s.n ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}>
              {s.n} · {s.c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Live Activity Stream <span className="text-xs font-normal text-muted">(6 Recent Focused Events)</span></h2>
              <Button variant="secondary" onClick={() => { setLive((l) => !l); push(true, live ? 'Polling paused' : 'Simulated polling on', live ? 'Simulated 5s poll suspended.' : 'Simulated polling (5s) · synthetic probes prepended.'); }}>
                {live ? <Pause size={15} /> : <Play size={15} />} {live ? 'Pause' : 'Simulated Polling (5s)'}
              </Button>
            </div>
            <ol className="flex flex-col gap-2">
              {shown.map((e) => (
                <li key={e.id} className={cn('rounded-lg border bg-card', sel === e.id ? 'border-cobalt-deep' : 'border-border-subtle')}>
                  <button
                    type="button"
                    onClick={() => { setSel(e.id); setTab('diff'); setSim('idle'); }}
                    aria-current={sel === e.id ? 'true' : undefined}
                    className="w-full text-left p-3 pb-1 flex flex-wrap items-center gap-2 text-[13px]"
                  >
                    <span className="apex-id text-muted">{e.ts}</span>
                    <Badge variant={sevTone(e.sev)}>{e.action}</Badge>
                    {e.live && <Badge variant="info">LIVE PROBE</Badge>}
                    {flagged[e.id] && <Badge variant="warn">FLAGGED</Badge>}
                    <span className="ml-auto text-xs text-cobalt font-semibold">Inspect →</span>
                  </button>
                  <div className="px-3 pb-3 flex flex-col gap-1">
                    <p className="text-[13px]">
                      {e.href ? (
                        <Link className="apex-id font-bold text-cobalt hover:underline" href={e.href}>{e.entity}</Link>
                      ) : (
                        <span className="apex-id font-bold text-cobalt">{e.entity}</span>
                      )}{' '}
                      <span className="apex-id text-muted">{e.hash}</span>
                    </p>
                    <p className="text-[13px]">{e.detail}</p>
                    <p className="text-xs text-muted">{e.who} · {e.title} · {e.ip} · {e.term}</p>
                  </div>
                </li>
              ))}
              {shown.length === 0 && <li className="text-sm text-muted p-4 text-center">No events in this view — reset filters.</li>}
            </ol>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-muted">Showing {filtered.length === 0 ? 0 : page * pageSize + 1}–{Math.min(filtered.length, page * pageSize + pageSize)} of {filtered.length} Audited Records ({SEED.length} seeded + {probes.length} live)</span>
              <label className="ml-auto text-xs font-semibold" htmlFor="rpp">Rows per page:</label>
              <select id="rpp" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} className="h-8 px-2 border border-border-strong rounded text-xs bg-card">
                {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹ Prev</Button>
              <span className="apex-id text-xs">… 7396</span>
              <Button variant="secondary" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next ›</Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">State Transition &amp; Diff Inspector</h2>
                <Badge variant="info">IMMUTABLE</Badge>
              </div>
              <p className="text-[13px]">Entity: <strong>{selEvt.id === SEED[0].id ? 'Purchase Request' : selEvt.entity}</strong> · TXN: <strong className="apex-id">{selEvt.id === SEED[0].id ? 'TXN-88120-NUSA' : 'unseeded'}</strong></p>
              {selEvt.id === SEED[0].id ? (
                <>
                  <div className="rounded border border-border-subtle bg-card p-2 text-[13px] flex flex-col gap-1">
                    <p className="apex-label-caps text-muted">Cryptographic Event Hash</p>
                    <p className="apex-id text-xs break-all">{FULL_HASH}</p>
                    <p className="apex-id text-xs text-muted">HTMX POST /api/v1/procurement/pr-0314/endorse <span className="text-[10px]">(C20 — v2 fixed)</span></p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={copyHash}><Copy size={14} /> Copy Full Hash</Button>
                      <span className="text-pass font-semibold self-center text-xs">Merkle Root Confirmed</span>
                    </div>
                  </div>
                  <div className="flex gap-2" role="group" aria-label="Inspector view">
                    {([['diff', 'Formatted Diff (Field-by-Field)'], ['json', 'Raw JSON Payload']] as const).map(([k, label]) => (
                      <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={cn('h-8 px-3 rounded text-xs font-semibold border', tab === k ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}>
                        {label}
                      </button>
                    ))}
                    <span className="text-xs text-muted self-center ml-auto">4 Fields Mutated</span>
                  </div>
                  {tab === 'diff' ? (
                    <ul className="text-[13px] flex flex-col gap-2">
                      {[
                        ['field: approval_stage · Status Mutation', '− "PENDING_DEPT_MGR"', '+ "ENDORSED_CAPEX_AUTHORIZED"'],
                        ['field: authorized_by · Signoff Signer', '− null', '+ {"user_id": "USR-0042", "name": "David Chen", "role": "Eng Lead / Mgr"}'],
                        ['field: budget_envelope_allocated · Fiscal Ledger', '− $0.00', '+ $2,900.00 [CUP Maintenance Capex]'],
                        ['field: next_signoff_tier · Approval Chain', '− "David Chen (Level 2)"', '+ "Marcus Vance (VP Operations - Level 3)"'],
                      ].map(([h, a, b]) => (
                        <li key={h} className="rounded border border-border-subtle bg-card p-2">
                          <p className="apex-id text-xs text-muted">{h}</p>
                          <p className="apex-id text-fail">{a}</p>
                          <p className="apex-id text-pass">{b}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="rounded border border-border-subtle bg-card p-2 text-[11px] apex-id overflow-x-auto">{`{
  "event_id": "EVT-20260524-94812",
  "mutation_type": "APPROVE",
  "entity": { "type": "PURCHASE_REQUEST", "key": "PR-2026-0314",
    "line_items": [{ "sku": "${CANON.sealSku}",
      "description": "Silicon Carbide Shaft Seal 2.5in",
      "qty": 2, "unit_price": 1450.00 }] },
  "delta": { "approval_stage": { "old": "PENDING_DEPT_MGR",
      "new": "ENDORSED_CAPEX_AUTHORIZED" } },
  "merkle_verification": { "root": "9a01f7bb84...",
    "index": 48102, "proof_chain_valid": true } }`}</pre>
                  )}
                  <div className="rounded border border-border-subtle bg-card p-2 text-[13px] flex flex-col gap-1">
                    <p className="font-semibold">Authentication &amp; Session Envelope</p>
                    <p>Verified Identity · <strong>David Chen (Badge: RFID-4180)</strong></p>
                    <p className="text-muted text-xs">IP 10.14.8.42 (Internal VPN East) · Chrome 125.0 Enterprise / macOS · Bldg A Floor 4 (Eng Dept)</p>
                    <p className="text-xs">Two-Factor Auth: <span className="text-pass font-semibold">Okta SCIM MFA Verified (FIDO2 WebAuthn Key)</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={proof}><Download size={14} /> Download Signed Proof</Button>
                    <Button variant="secondary" onClick={rollback} disabled={sim !== 'idle'}>
                      <History size={14} /> {sim === 'running' ? 'Simulating…' : sim === 'done' ? 'Simulation Done' : 'Rollback Simulation'}
                    </Button>
                    <Button variant="secondary" onClick={() => { setFlagged((f) => ({ ...f, [selEvt.id]: true })); push(true, 'Flagged for review', `${selEvt.id} · routed to compliance queue.`); }}>
                      <Flag size={14} /> Flag Review
                    </Button>
                  </div>
                  {sim === 'done' && (
                    <p className="text-[13px] font-semibold text-warn" role="status">Simulation result: rollback REJECTED — ledger immutable · 0 rows affected · countersigned snapshot retained.</p>
                  )}
                </>
              ) : (
                <div className="rounded border border-dashed border-border-strong bg-card p-6 text-center flex flex-col gap-1 items-center">
                  <Lock size={22} className="text-muted" />
                  <p className="text-sm font-semibold">{selEvt.id} — envelope only</p>
                  <p className="text-[13px] text-muted">Full field diff only seeded for TXN-88120-NUSA. Hash {selEvt.hash} verifies against Merkle forest.</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setSel(SEED[0].id)}>Back to TXN-88120-NUSA</Button>
                    <Button variant="secondary" onClick={() => { setFlagged((f) => ({ ...f, [selEvt.id]: true })); push(true, 'Flagged for review', `${selEvt.id} · routed to compliance queue.`); }}>
                      <Flag size={14} /> Flag Review
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold flex items-center gap-2"><Activity size={16} /> Merkle Forest Root Status</h2>
                <Badge variant={verified || !verifying ? 'pass' : 'warn'}>{verifying ? 'VERIFYING…' : 'SYNCED 100%'}</Badge>
              </div>
              {verifying && (
                <div className="h-2 rounded bg-surface-subtle overflow-hidden" role="status" aria-label="Verifying root">
                  <div className="h-full w-2/3 bg-cobalt rounded animate-pulse" />
                </div>
              )}
              <dl className="text-[13px] grid grid-cols-2 gap-x-4 gap-y-1">
                <dt className="text-muted">Proof Index</dt><dd className="apex-id font-bold">#48,102</dd>
                <dt className="text-muted">Sync Node</dt><dd className="apex-id font-bold">NUSA-LEDGER-A</dd>
                <dt className="text-muted">Consensus Time</dt><dd className="apex-id font-bold">1.42s</dd>
                <dt className="text-muted">Root</dt><dd className="apex-id font-bold">9a01f7bb84…</dd>
              </dl>
              {verified && <p className="text-[13px] font-semibold text-pass" role="status">Verify result: 48,102 proofs valid · 0 hash mismatch · chain head Block #892,104.</p>}
            </div>
          </div>
        </div>
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
