'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft, CheckCircle2, ChevronRight, Copy, Download, FileText,
  Plus, PowerOff, Printer, Upload, X, XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface Row {
  id: string; flag: string | null; name: string; oem: string;
  loc: string; sub: string; tier: string; health: number; healthLabel: string;
  cat: string; status: string;
}

const SEED: Row[] = [
  { id: CANON.assetSeal, flag: 'DEFECT FLAGGED', name: 'Centrifugal Water Chiller 450-TR', oem: `${CANON.assetOem} • S/N: ${CANON.assetSerial}`, loc: 'Building B (CUP)', sub: 'Basement L2 • Rm #B-204', tier: 'Tier 1 Mission', health: 68, healthLabel: 'CRITICAL', cat: 'HVAC & Chillers', status: 'Online (TCP:502)' },
  { id: 'AST-PUMP-101', flag: 'OPERATIONAL', name: 'Primary Condenser Pump #1', oem: 'Grundfos NK 125-250 • S/N: GRU-8812', loc: 'Basement L2 • Rm #B-201', sub: '', tier: 'Tier 2 Operational', health: 96, healthLabel: 'HEALTHY', cat: 'Pumps & Plumbing', status: 'Online' },
  { id: 'AST-ELEC-012', flag: null, name: 'Main 13.8kV Medium Voltage Switchgear', oem: 'Schneider MasterPact MTZ2 • S/N: SCH-0044', loc: 'Substation East', sub: 'Vault Rm #E-101', tier: 'Tier 1 Mission', health: 92, healthLabel: 'HEALTHY', cat: 'Electrical Switchgear', status: 'Online' },
  { id: 'AST-GEN-001', flag: 'STANDBY', name: 'Emergency Diesel Generator 2000kVA', oem: 'Caterpillar 3516B-HD • S/N: CAT-7741', loc: 'North Utility Yard', sub: 'Gen Enclosure #G-1', tier: 'Tier 2 Operational', health: 84, healthLabel: 'CAUTION', cat: 'Electrical Switchgear', status: 'Idle Standby' },
  { id: 'AST-ENV-108', flag: null, name: 'Data Center Precision CRAH Unit #4', oem: 'Vertiv Liebert DSE • S/N: VRT-4109', loc: 'Building C (Server Wing)', sub: 'Floor 3 • White Space #C-302', tier: 'Tier 1 Mission', health: 94, healthLabel: 'HEALTHY', cat: 'HVAC & Chillers', status: 'Online' },
  { id: 'AST-VALV-042', flag: null, name: 'Motorized Primary Chilled Water Bypass Valve', oem: 'Belimo EV-080+BACnet • S/N: BLM-5510', loc: 'Header Trench Line A', sub: '', tier: 'Tier 3 Support', health: 88, healthLabel: 'HEALTHY', cat: 'Pumps & Plumbing', status: 'Online' },
];

const CATS = ['All Categories', 'HVAC & Chillers', 'Electrical Switchgear', 'Fire & Safety', 'Pumps & Plumbing', 'Elevators'] as const;
const CAT_COUNT: Record<string, string> = { 'All Categories': '1,842', 'HVAC & Chillers': '284', 'Electrical Switchgear': '192', 'Fire & Safety': '310', 'Pumps & Plumbing': '415', Elevators: '48' };
const HEALTHS = ['All Records', 'Critical <70', 'Caution 70–89', 'Healthy ≥90'] as const;

const LIFECYCLE = [
  { d: 'Today 13:39 WIB', t: 'WORK ORDER CREATED', b: `${CANON.workOrderSeal} — primary shaft seal leak 18.4 ppm via ultrasonic probe. Auto-assigned to Marcus Kowalski (Senior HVAC Tech).` },
  { d: '12 Jan 2026', t: 'PM EXECUTION', b: 'Quarterly Chiller Overhaul — lube replacement (PART-LUB-09), filter swap, vibration recalibration. All run parameters passed.' },
  { d: '04 Nov 2025', t: 'PART REPLACEMENT', b: 'Condenser Water Strainer Overhaul — gasket + 316 mesh. Material $480.00 · 2.5 tech hrs.' },
  { d: '18 Aug 2024', t: 'SPATIAL TRANSFER', b: 'Central Yard Storage → Building B Basement L2 #B-204. Rigging certified by Facility Ops Director.' },
  { d: '14 Oct 2020', t: 'COMMISSIONING', b: 'Initial in-service baseline — vibration harmonic mapping, OSHA electrical + environmental sign-off.' },
];

const DOCS = [
  { n: 'OEM_Installation_Operation_Manual_Trane_CVHE.pdf', s: '18.4 MB • Rev 4.2 Technical Manual' },
  { n: 'Factory_Commissioning_Certificate_&_Warranty_Bond.pdf', s: '2.8 MB • Signed OEM Bond & Acceptance' },
  { n: 'P&ID_Mechanical_Piping_Diagram_RevC.pdf', s: '8.1 MB • High-Res CAD Vector Schematic' },
  { n: 'OSHA_Lockout_Tagout_480V_Standard_Operating_Procedure.pdf', s: '1.4 MB • Mandatory Safety Standard' },
];

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 600;

function download(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Asset Registry & Lifecycle Ledger — archive port (unit 4, no prototype). */
export function AssetRegistry() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All Categories');
  const [health, setHealth] = useState<string>('All Records');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [regOpen, setRegOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regCat, setRegCat] = useState<string>('HVAC & Chillers');
  const [regLoc, setRegLoc] = useState('');
  const [regTouched, setRegTouched] = useState(false);
  const [qrLoc, setQrLoc] = useState('Basement L2 • Rm #B-204');
  const [xferOpen, setXferOpen] = useState(false);
  const [xferLoc, setXferLoc] = useState('Building B (CUP) · Basement L2 • Rm #B-204');
  const [decommissioned, setDecommissioned] = useState(false);
  const [docs, setDocs] = useState(DOCS);
  const fileRef = useRef<HTMLInputElement>(null);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const filtered = rows.filter((r) => {
    if (cat !== 'All Categories' && r.cat !== cat) return false;
    if (health === 'Critical <70' && r.health >= 70) return false;
    if (health === 'Caution 70–89' && (r.health < 70 || r.health >= 90)) return false;
    if (health === 'Healthy ≥90' && r.health < 90) return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${r.id} ${r.name} ${r.oem} ${r.loc}`.toLowerCase().includes(needle);
  });

  const exportCsv = () => {
    const head = 'asset_id,name,oem,location,tier,health,health_label,category,status';
    const body = filtered.map((r) =>
      [r.id, `"${r.name}"`, `"${r.oem}"`, `"${r.loc}${r.sub ? ' ' + r.sub : ''}"`, `"${r.tier}"`, r.health, r.healthLabel, `"${r.cat}"`, `"${r.status}"`].join(',')
    );
    download('asset-register.csv', [head, ...body].join('\n'), 'text/csv');
    push(true, 'Register exported', `${filtered.length} seeded rows → asset-register.csv (fleet 1,842 in full extract).`);
  };

  const copyQr = async () => {
    try {
      await navigator.clipboard.writeText(`QR #004 · ${CANON.assetSeal} · DEFECT ACTIVE · TRN-2020-0442`);
      push(true, 'QR payload copied', 'QR #004 · AST-HVAC-004 · DEFECT ACTIVE.');
    } catch {
      push(false, 'Copy blocked', 'Clipboard unavailable — QR #004 noted in toast instead.');
    }
  };

  const manifest = (n: string, s: string) => {
    download(
      n.replace(/\.pdf$/, '.manifest.txt'),
      [`APEX OPS DOCUMENT MANIFEST`, `asset: ${CANON.assetSeal}`, `file: ${n}`, `meta: ${s}`, `vault: Central Distribution Hub`, `note: binary served by the document vault; this manifest carries the indexed metadata.`].join('\n')
    );
    push(true, 'Manifest downloaded', `${n} · metadata only — binary in vault.`);
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const mb = f.size / 1048576;
    setDocs((d) => [...d, { n: f.name, s: `${mb < 0.1 ? '<0.1' : mb.toFixed(1)} MB • pending virus scan` }]);
    push(true, 'Drawing staged', `${f.name} · pending virus scan before vault commit.`);
  };

  const register = () => {
    setRegTouched(true);
    if (!regName.trim() || !regLoc.trim()) return;
    const id = `AST-NEW-${String(rows.length + 1).padStart(3, '0')}`;
    setRows((r) => [...r, {
      id, flag: 'OPERATIONAL', name: regName.trim(), oem: 'Pending OEM capture', loc: regLoc.trim(),
      sub: '', tier: 'Tier 3 Support', health: 100, healthLabel: 'HEALTHY', cat: regCat, status: 'Staged',
    }]);
    setRegOpen(false);
    setRegName('');
    setRegLoc('');
    setRegTouched(false);
    push(true, 'Asset staged', `${id} · ${regName.trim()} → pending survey before commissioning.`);
  };

  const healthTone = (h: number) => (h < 70 ? 'text-fail' : h < 90 ? 'text-warn' : 'text-pass');

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Asset Registry &amp; Lifecycle Ledger</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="reg-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Asset Ledger: 1,842 Managed Units · SCADA Realtime Active · Depreciation Straight-Line (US GAAP / IFRS 16)</p>
            <h1 id="reg-h" className="text-2xl font-semibold tracking-tight">Enterprise Asset Ledger <span className="text-base font-normal text-muted">CAMPUS-WIDE</span></h1>
            <p className="text-[13px] text-muted">Centralized telemetry, equipment lifecycle records, capitalized valuation &amp; preventive schedules.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export (CSV/XLS)</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={16} /> Batch QR Print</Button>
            <Dialog open={regOpen} onOpenChange={setRegOpen}>
              <DialogTrigger asChild>
                <Button><Plus size={16} /> Register New Asset</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="reg-new-h">
                <DialogTitle id="reg-new-h">Register New Asset</DialogTitle>
                <DialogDescription>Stages a record — a field survey is required before commissioning.</DialogDescription>
                <label className="text-xs font-semibold" htmlFor="reg-name">Asset name (required)</label>
                <Input id="reg-name" value={regName} onChange={(e) => setRegName(e.target.value)} invalid={regTouched && !regName.trim()} placeholder="e.g. Condenser Pump P-113" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="reg-cat">Category</label>
                    <select id="reg-cat" value={regCat} onChange={(e) => setRegCat(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                      {CATS.filter((c) => c !== 'All Categories').map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="reg-loc">Location (required)</label>
                    <Input id="reg-loc" value={regLoc} onChange={(e) => setRegLoc(e.target.value)} invalid={regTouched && !regLoc.trim()} placeholder="e.g. Basement L2" />
                  </div>
                </div>
                {regTouched && (!regName.trim() || !regLoc.trim()) && (
                  <p className="text-[11px] font-semibold text-fail">Name and location are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setRegOpen(false)}>Cancel</Button>
                  <Button onClick={register}>Stage Asset</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Total Capital Assets', v: '1,842', s: 'Units · Book $24.8M · Depreciated $18.4M' },
            { l: 'Fleet Health Composite', v: '91.4%', s: '▲ +1.2% vs last quarter' },
            { l: 'Critical Assets (Tier 1)', v: '142', s: '2 WOs ACTIVE · Uptime 98.2%' },
            { l: 'Warranty & Compliance', v: '3 Renewals', s: 'Expiring <60d · ESAs pending review' },
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
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by ID, name, OEM, location… (Ctrl+/)" aria-label="Filter assets" />
          </div>
          <select value={health} onChange={(e) => setHealth(e.target.value)} aria-label="Health filter" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {HEALTHS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn('h-8 px-3 rounded text-xs font-semibold border', cat === c ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle text-body')}
            >
              {c} · {CAT_COUNT[c]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[880px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">Asset Tag &amp; Identification</th>
                <th className="font-semibold">Spatial Location</th>
                <th className="font-semibold">Criticality</th>
                <th className="font-semibold">Health Index</th>
                <th className="font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2">
                    <p><span className="apex-id font-bold text-cobalt">{r.id}</span>{' '}
                      {r.flag && (
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', r.flag === 'DEFECT FLAGGED' ? 'bg-fail-bg text-fail' : r.flag === 'STANDBY' ? 'bg-warn-bg text-warn' : 'bg-pass-bg text-pass')}>
                          {r.flag}
                        </span>
                      )}
                    </p>
                    <p className="font-medium">{r.name}</p>
                    <p className="apex-id text-muted">{r.oem}</p>
                  </td>
                  <td><p>{r.loc}</p>{r.sub && <p className="text-muted text-xs">{r.sub}</p>}</td>
                  <td>{r.tier}</td>
                  <td><span className={cn('apex-id font-bold', healthTone(r.health))}>{r.health}% {r.healthLabel}</span><p className="text-xs text-muted">{r.status}</p></td>
                  <td>
                    <Link href={`/assets/${r.id}`} className="inline-flex items-center gap-1 text-cobalt font-semibold hover:underline" aria-label={`Open ${r.id}`}>
                      Open <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted">No seeded units match — clear filters to see all 6.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">Showing {filtered.length} of {rows.length} seeded units (fleet 1,842 · Page 1 of 308 in full extract).</p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#0B1C30] text-white p-4 flex flex-col gap-2">
            <p className="apex-label-caps text-white/60">Building B (Central Utility Plant) — Sub-Level Asset Density</p>
            <p className="text-sm font-semibold">38 Connected Telemetry Nodes · CUP BASEMENT L2 • SECTOR WEST</p>
            <p className="text-xs text-white/70">Active Cluster: Chiller Plant 1-4 &amp; Primary Pumping Skids</p>
            <Link href={`/assets/${CANON.assetSeal}/bim`} className="h-9 px-4 rounded bg-white text-ink text-[13px] font-bold inline-flex items-center justify-center w-fit">
              Open BIM 3D Model
            </Link>
          </div>
          <div className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">QR #004 <Badge variant="fail">DEFECT ACTIVE</Badge></h2>
              <div className="flex gap-1">
                <button type="button" onClick={() => window.print()} aria-label="Print QR card" className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-subtle"><Printer size={16} /></button>
                <button type="button" onClick={copyQr} aria-label="Copy QR payload" className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-subtle"><Copy size={16} /></button>
              </div>
            </div>
            <p className="text-[13px]"><strong>{CANON.assetOem}</strong> · <span className="apex-id">ID: TRN-2020-0442</span></p>
            <p className="text-[13px] text-fail font-semibold">Seal Pressure Alert (<Link className="underline" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>)</p>
            <p className="text-xs text-muted">Commissioned: Oct 2020 · Location: {qrLoc}</p>
            <div>
              <div className="flex items-center justify-between text-[13px]"><span className="font-semibold">Composite Health Score</span><span className="apex-id font-bold text-fail">68 / 100 [NEEDS OVERHAUL]</span></div>
              <p className="text-xs text-muted">Target: ≥92%</p>
              {[
                { l: 'Mechanical Wear', v: 54 }, { l: 'Vibration Index', v: 62 },
                { l: 'Thermal Delta', v: 89 }, { l: 'Runtime Stress', v: 71 },
              ].map((s) => (
                <div key={s.l} className="flex items-center gap-2 text-xs mt-1">
                  <span className="w-28 text-muted">{s.l}</span>
                  <span className="flex-1 h-1.5 rounded bg-surface-subtle overflow-hidden"><span className={cn('block h-full rounded', s.v < 70 ? 'bg-fail' : 'bg-pass')} style={{ width: `${s.v}%` }} /></span>
                  <span className="apex-id w-8 text-right">{s.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Financial &amp; Capitalization <span className="apex-id font-normal text-muted">{CANON.assetSeal}</span></h2>
            <dl className="text-[13px] grid grid-cols-2 gap-x-4 gap-y-1">
              <dt className="text-muted">Original Purchase Cost</dt><dd className="apex-id font-bold">$285,000.00</dd>
              <dt className="text-muted">Current Book Value</dt><dd className="apex-id font-bold">$114,200.00</dd>
              <dt className="text-muted">Depreciation</dt><dd className="apex-id">−$28,500/yr (Yr 6 of 10)</dd>
              <dt className="text-muted">Factory Warranty</dt><dd className="font-semibold text-fail">EXPIRED (14 Oct 2023)</dd>
              <dt className="text-muted">Active SLA</dt><dd className="text-[12px]"><strong>Trane Care Platinum #TC-8891-B</strong> · thru Nov 2026 (24/7 OEM escalation)</dd>
            </dl>
            {decommissioned && (
              <p className="text-[13px] font-bold text-fail bg-fail-bg border border-fail rounded p-2" role="status">
                DECOMMISSION REQUESTED — pending VP Operations countersign. Work creation locked.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link href="/work-orders"><Button variant="secondary" disabled={decommissioned}>Create WO</Button></Link>
              <Link href="/preventive-maintenance"><Button variant="secondary">Schedule PM</Button></Link>
              <Dialog open={xferOpen} onOpenChange={setXferOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary"><ArrowRightLeft size={16} /> Transfer Loc</Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="xfer-h">
                  <DialogTitle id="xfer-h">Spatial Transfer — {CANON.assetSeal}</DialogTitle>
                  <DialogDescription>Rigging verification is required for plant moves.</DialogDescription>
                  <label className="text-xs font-semibold" htmlFor="xfer-sel">Destination</label>
                  <select id="xfer-sel" value={xferLoc} onChange={(e) => setXferLoc(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                    <option>Building B (CUP) · Basement L2 • Rm #B-204</option>
                    <option>Building B (CUP) · Basement L2 • Rm #B-201</option>
                    <option>Central Yard Storage · Pad 4</option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setXferOpen(false)}>Cancel</Button>
                    <Button onClick={() => { setQrLoc(xferLoc.split('·')[1]?.trim() ?? xferLoc); setXferOpen(false); push(true, 'Transfer staged', `${CANON.assetSeal} → ${xferLoc}. Rigging cert required.`); }}>
                      Stage Transfer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <ConfirmDialog
                title={`Decommission ${CANON.assetSeal}?`}
                description="Tier-1 mission asset. A decommission request locks work creation and routes to VP Operations for countersign."
                confirmLabel="Request Decommission"
                onConfirm={() => { setDecommissioned(true); push(true, 'Decommission requested', `${CANON.assetSeal} · pending countersign.`); }}
              >
                <span>
                  <Button variant="destructive" disabled={decommissioned}><PowerOff size={16} /> Decommission</Button>
                </span>
              </ConfirmDialog>
            </div>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
            <h2 className="text-base font-semibold">Lifecycle &amp; Audit Trail <span className="text-xs font-normal text-muted">5 recorded events</span></h2>
            <ol className="flex flex-col gap-2 text-[13px]">
              {LIFECYCLE.map((e) => (
                <li key={e.t} className="border-l-2 border-border-subtle pl-3">
                  <p className="apex-id text-muted">{e.d}</p>
                  <p className="font-bold">{e.t}</p>
                  <p className="text-muted">{e.b}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Technical Docs &amp; Schematics <span className="text-xs font-normal text-muted">{docs.length} files</span></h2>
            <span>
              <input ref={fileRef} type="file" className="hidden" aria-label="Upload drawing" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
              <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={16} /> Upload Drawing / PDF</Button>
            </span>
          </div>
          <ul className="flex flex-col divide-y divide-surface-subtle text-[13px]">
            {docs.map((d) => (
              <li key={d.n} className="py-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0"><FileText size={16} className="shrink-0 text-muted" /><span className="truncate"><strong>{d.n}</strong> <span className="text-muted">· {d.s}</span></span></span>
                <Button variant="secondary" className="h-8 text-xs shrink-0" onClick={() => manifest(d.n, d.s)}>Manifest</Button>
              </li>
            ))}
          </ul>
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
