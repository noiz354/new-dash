'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, Plus, RefreshCw, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { downloadText } from '@/lib/download';

interface V {
  slug: string; name: string; code: string; duns?: string; tier: string; scope: string;
  contact: string; msa: string; exp: string; status: string; sla: string; seeded?: boolean;
}

const SEED: V[] = [
  { slug: CANON.vendorSlug, name: 'Trane Technologies', code: 'VND-HVAC-0012', duns: 'DUNS 00-132-9481', tier: 'Tier-1 Mission Critical', scope: 'Centrifugal Chillers & R-134a Overhaul', contact: 'Robert Langdon · Sr. Tech Lead', msa: 'MSA-2024-TRN-09', exp: 'Exp 31 Dec 2026', status: 'ACTIVE (312d left)', sla: '98.1%', seeded: true },
  { slug: 'abb-grid-power-automation', name: 'ABB Grid Power & Automation', code: 'VND-ELEC-0004', tier: 'Tier-1 Electrical', scope: '13.8kV Switchgear, Transformers, SCADA', contact: 'Elena Voronova · SCADA Lead (liaison)', msa: 'MSA-2023-ABB-02', exp: 'Exp 15 Mar 2026', status: 'EXPIRED — renewal overdue', sla: '96.8% · 4.7★' },
  { slug: 'siemens-building-technologies', name: 'Siemens Building Technologies', code: 'VND-BMS-0019', tier: 'Tier-2 Ops', scope: 'Desigo CC BMS & Cleanroom Actuators', contact: 'Marcus Gallagher', msa: 'MSA-2025-SIE-11', exp: 'Exp 30 Nov 2027', status: 'ACTIVE', sla: '99.1% · 4.9★' },
  { slug: 'johnson-controls-tyco-fire', name: 'Johnson Controls (Tyco Fire)', code: 'VND-FIRE-0008', tier: 'Tier-1 Safety', scope: 'FM-200 Clean Agent & VESDA Aspirating', contact: 'Sarah Al-Mansoor (liaison)', msa: 'MSA-2024-JCI-07', exp: 'Exp 14 Apr 2026', status: 'EXPIRED — renewal overdue', sla: '95.2% · 4.6★' },
  { slug: 'grainger-industrial-supply', name: 'Grainger Industrial Supply', code: 'VND-SUPP-0033', tier: 'Tier-3 Supplies', scope: 'MRO Hardware, Fasteners & Electrical', contact: 'B2B Corporate Account Desk', msa: 'MSA-CATALOG-BLANKET', exp: 'Continuous Renewal', status: 'ACTIVE', sla: '94.0% · 4.5★' },
];

const CATS = ['HVAC', 'ELEC', 'BMS', 'FIRE', 'SUPP'] as const;
const TIERS = ['Tier-1', 'Tier-2', 'Tier-3'] as const;

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 1900;

const download = (filename: string, text: string) => downloadText(filename, text);

/**
 * Vendor directory — mined from the vendors-hub archive + M1 Trane profile.
 * ABB/JCI expiries (Mar/Apr 2026) predate today, so the archive's 28d/60D
 * window labels are recomputed to EXPIRED — renewal overdue (same principle
 * as PM relative dues). Contact phones omitted per C19.
 */
export function VendorList() {
  const [rows, setRows] = useState<V[]>(SEED);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('All Tiers');
  const [status, setStatus] = useState('All Statuses');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [nwName, setNwName] = useState('');
  const [nwCat, setNwCat] = useState<string>('SUPP');
  const [nwTier, setNwTier] = useState<string>('Tier-3');
  const [nwDuns, setNwDuns] = useState('');
  const [nwTouched, setNwTouched] = useState(false);
  const [seq, setSeq] = useState(34);
  const [reV, setReV] = useState<V | null>(null);
  const [reTerm, setReTerm] = useState('24 months');

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = rows.filter((r) => {
    if (tier !== 'All Tiers' && !r.tier.startsWith(tier)) return false;
    if (status === 'Active only' && !r.status.startsWith('ACTIVE')) return false;
    if (status === 'Expired only' && !r.status.startsWith('EXPIRED')) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${r.name} ${r.code} ${r.scope} ${r.contact}`.toLowerCase().includes(needle);
  });

  const active = rows.filter((r) => r.status.startsWith('ACTIVE')).length;
  const expired = rows.filter((r) => r.status.startsWith('EXPIRED')).length;

  const exportCsv = () => {
    const head = 'company,code,tier,scope,contact,msa,expiry,status,sla';
    const body = filtered.map((r) => [`"${r.name}"`, `"${r.code}"`, `"${r.tier}"`, `"${r.scope}"`, `"${r.contact}"`, `"${r.msa}"`, `"${r.exp}"`, `"${r.status}"`, `"${r.sla}"`].join(','));
    download('vendor-directory.csv', [head, ...body].join('\n'));
    push(true, 'Directory exported', `${filtered.length} vendors → vendor-directory.csv.`);
  };

  const dunsOk = /^\d{2}-\d{3}-\d{4}$/.test(nwDuns.trim());

  const create = () => {
    setNwTouched(true);
    if (!nwName.trim() || !dunsOk) return;
    const code = `VND-${nwCat}-00${seq}`;
    const slug = nwName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setRows((r) => [{ slug, name: nwName.trim(), code, duns: `DUNS ${nwDuns.trim()}`, tier: `${nwTier} (pending scope review)`, scope: 'Scope intake pending', contact: 'Vendor onboarding desk', msa: 'MSA-DRAFT', exp: 'Term on signature', status: 'ONBOARDING', sla: '—' }, ...r]);
    setSeq((s) => s + 1);
    setNewOpen(false);
    setNwName('');
    setNwDuns('');
    setNwTouched(false);
    push(true, 'Vendor onboarding started', `${code} · ${nwName.trim()} · DUNS verified format.`);
  };

  const renew = () => {
    if (!reV) return;
    setRows((rs) => rs.map((r) => (r.code === reV.code ? { ...r, status: 'RENEWAL IN PROGRESS' } : r)));
    push(true, 'Renewal opened', `${reV.msa} · ${reTerm} term sheet sent to ${reV.name}.`);
    setReV(null);
  };

  const statusTone = (s: string) => (s.startsWith('EXPIRED') ? 'fail' : s === 'RENEWAL IN PROGRESS' || s === 'ONBOARDING' ? 'warn' : 'pass');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Vendors</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="vnd-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Approved Vendor Directory · {rows.length} seeded vendors</p>
            <h1 id="vnd-h" className="text-2xl font-semibold tracking-tight">Vendors</h1>
            <p className="text-[13px] text-muted">MSA terms, SLA scorecards, and renewal posture across tiers.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export (CSV)</Button>
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> New Vendor</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="nv-h">
                <DialogTitle id="nv-h">Onboard Vendor</DialogTitle>
                <DialogDescription>Issues the next VND code in sequence (past VND-SUPP-0033).</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="nv-n">Company (required)</label>
                <Input id="nv-n" value={nwName} onChange={(e) => setNwName(e.target.value)} invalid={nwTouched && !nwName.trim()} placeholder="e.g. Carrier Rental Systems" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nv-c">Category</label>
                    <select id="nv-c" value={nwCat} onChange={(e) => setNwCat(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {CATS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nv-t">Tier</label>
                    <select id="nv-t" value={nwTier} onChange={(e) => setNwTier(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {TIERS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="nv-d">DUNS</label>
                    <Input id="nv-d" value={nwDuns} onChange={(e) => setNwDuns(e.target.value)} invalid={nwTouched && !dunsOk} placeholder="00-000-0000" className="apex-id" />
                  </div>
                </div>
                {nwTouched && (!nwName.trim() || !dunsOk) && (
                  <p className="text-[11px] font-semibold text-fail">Company + DUNS (##-###-####) are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button>
                  <Button onClick={create}>Onboard VND-{nwCat}-00{seq}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Active Vendors', v: String(active), s: 'In-term MSAs' },
            { l: 'Expired Terms', v: String(expired), s: 'ABB + JCI renewals overdue' },
            { l: 'Average SLA', v: '96.6%', s: 'Trailing scorecard mean · 5 vendors' },
            { l: 'OEM Certified', v: '1', s: 'Trane · chiller overhaul authority' },
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by company, code, scope, contact…" aria-label="Filter vendors" />
          </div>
          <select value={tier} onChange={(e) => setTier(e.target.value)} aria-label="Tier filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Tiers', 'Tier-1', 'Tier-2', 'Tier-3'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['All Statuses', 'Active only', 'Expired only'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[1060px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">Company</th>
                <th className="font-semibold">Code</th>
                <th className="font-semibold">Tier &amp; Scope</th>
                <th className="font-semibold">Contact</th>
                <th className="font-semibold">MSA · Expiry</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">SLA</th>
                <th className="font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.code} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2">
                    <Link className="font-bold text-cobalt hover:underline" href={`/vendors/${r.slug}`}>{r.name}</Link>
                    {r.seeded && <p className="text-[10px] font-bold text-pass">SEEDED PROFILE</p>}
                  </td>
                  <td><p className="apex-id font-semibold">{r.code}</p>{r.duns && <p className="text-[10px] text-muted apex-id">{r.duns}</p>}</td>
                  <td><p className="font-medium">{r.tier}</p><p className="text-xs text-muted">{r.scope}</p></td>
                  <td className="text-xs">{r.contact}</td>
                  <td><p className="apex-id text-xs font-semibold">{r.msa}</p><p className="text-xs text-muted">{r.exp}</p></td>
                  <td><Badge variant={statusTone(r.status)}>{r.status}</Badge></td>
                  <td className="apex-id text-xs font-semibold tabular-nums">{r.sla}</td>
                  <td>
                    {r.status.startsWith('EXPIRED') ? (
                      <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => setReV(r)}>Open Renewal</button>
                    ) : (
                      <Link className="text-cobalt font-semibold hover:underline text-xs" href={`/vendors/${r.slug}`}>Profile →</Link>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted">No vendors match — clear filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">
          Showing {filtered.length} of {rows.length} seeded vendors · ABB/JCI windows recomputed vs Sep 2026 — archive labels 28d/60D predate their Mar/Apr expiries.
        </p>
      </section>

      <Dialog open={reV !== null} onOpenChange={(v) => { if (!v) setReV(null); }}>
        <DialogContent aria-labelledby="rn-h">
          <DialogTitle id="rn-h">Renew {reV?.msa}</DialogTitle>
          <DialogDescription>{reV?.name} · expired {reV?.exp.replace('Exp ', '')} · sends a fresh term sheet.</DialogDescription>
          <label className="text-xs font-semibold" htmlFor="rn-term">Renewal term</label>
          <select id="rn-term" value={reTerm} onChange={(e) => setReTerm(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {['12 months', '24 months', '36 months'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReV(null)}>Cancel</Button>
            <Button onClick={renew}><RefreshCw size={15} /> Send Term Sheet</Button>
          </div>
        </DialogContent>
      </Dialog>

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
