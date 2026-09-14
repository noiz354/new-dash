'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileText, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

type EvType = 'WO' | 'Inspection' | 'Parts' | 'Calibration';
interface Ev { id: string; type: EvType; title: string; state: string; body: string; meta: string }

const EVENTS: Ev[] = [
  { id: CANON.workOrderSeal, type: 'WO', title: 'Primary shaft seal refrigerant leak — corrective breakdown', state: 'IN PROGRESS P1', body: '18.4 ppm R-134a via ultrasonic probe; seal cartridge extraction + Trane OEM reseat at 45 Nm. LOTO #4092 armed.', meta: `Today 13:39 WIB · Tech: ${CANON.engineer}` },
  { id: 'PM-2025-0812', type: 'WO', title: 'Scheduled Preventive Maintenance (Semi-Annual Overhaul)', state: 'Completed', body: 'Replaced shaft seals, topped 4.5 kg R-134a, verified mag-bearing levitation, balanced condenser flow. Parts: PART-SEAL-8821 (−2), PART-LUB-09 (−2). Downtime 3.5h.', meta: '14 Feb 2025 · 20:30–24:00 WIB · Tech: M. Kowalski (#1042)' },
  { id: 'WO-2025-0044', type: 'WO', title: 'IoT Telemetry Spike Alert & Corrective Bearing Lube', state: 'Resolved', body: 'Radial vibration exceeded 0.32 in/s on compressor stage 2. Root cause: micro-debris in secondary bypass filter. Closed in 1.4 hrs.', meta: '04 Jan 2025 · 10:14 WIB · Tech: J. Chen (Night Lead)' },
  { id: CANON.inspection, type: 'Inspection', title: 'Weekly Chiller Run-Check — Step 02 FAIL open', state: 'In progress 65%', body: 'Refrigerant sniff FAIL at 18.4 ppm; finding FND-2026-0188 opened with photo + GPS evidence pack.', meta: `Today · Tech: ${CANON.engineer}` },
  { id: 'INS-2024-4401', type: 'Inspection', title: 'Annual Statutory Pressure Vessel Hydrostatic Test', state: 'Pass / Cert Issued', body: 'Evaporator + condenser vessels UT-scanned (min 14.8mm vs 12.0mm tolerance). Certificate #NBIC-990-2024 (valid 12 months).', meta: '18 Nov 2024 · 22:00 WIB · Inspector: R. Davies (Gov PE)' },
  { id: 'TXN-2025-88419', type: 'Parts', title: 'WO dispatch usage — seals + lube', state: 'Posted', body: 'PART-SEAL-8821 (−2 pcs, bal 1) + PART-LUB-09 (−2 pails, bal 3) against #WO-2025-0812.', meta: '14 Feb 2025 · 14:15 UTC · M. Kowalski' },
  { id: 'CAL-2026-0118', type: 'Calibration', title: 'Vibration telemetry sensor recalibration', state: 'Passed', body: 'Quarterly overhaul calibration pass — all run parameters within envelope.', meta: '12 Jan 2026 · Shift A' },
];

const TABS: ('All' | EvType)[] = ['All', 'WO', 'Inspection', 'Parts', 'Calibration'];
const TAB_TOTAL: Record<string, number> = { All: 54, WO: 14, Inspection: 28, Parts: 8, Calibration: 4 };

interface Bom { sku: string; crit?: boolean; name: string; oem: string; sub: string; bin: string; par: string; on: number; alloc: number; allocRef?: string; unit: number; status: string; action: 'PR' | 'PO' | 'ISSUE' | null }

const BOM_SEED: Bom[] = [
  { sku: CANON.sealSku, crit: true, name: 'Silicon Carbide Mechanical Shaft Seal 2.5"', oem: 'Trane OEM silicon carbide', sub: 'Compressor Core', bin: CANON.sealBin, par: '4 pcs', on: 1, alloc: 1, allocRef: 'WO-0812', unit: 1450.0, status: 'STOCK DEFICIT (0 NET)', action: 'PR' },
  { sku: 'PART-LUB-09', name: 'Synthetic Polyolester Lubricant ISO 68 (5-Gal Pail)', oem: 'Grade: Emkarate RL68H', sub: 'Lubrication', bin: 'Cabinet F-02 · Flammable Store', par: '5 pails', on: 3, alloc: 0, unit: 195.0, status: 'BELOW PAR (REORDER)', action: 'PO' },
  { sku: 'PART-FLTR-401', name: 'MERV 14 Chilled Water Loop Inline Filter Cartridge', oem: 'Size: 24" x 24" x 2" (5 Micron)', sub: 'Filtration', bin: 'Rack A-01 / Bin 03 · General Bulk Aisle', par: '8 pcs', on: 24, alloc: 2, unit: 94.5, status: 'OPTIMAL BUFFER', action: 'ISSUE' },
  { sku: 'PART-VLV-102', name: 'Electronic Expansion Solenoid Valve 24VAC / Pulse', oem: 'Danfoss ETS-50B Collet', sub: 'Electrical / Solenoid', bin: 'Rack D-02 / Bin 09 · Precision Controls Bin', par: '3 pcs', on: 0, alloc: 0, unit: 890.0, status: 'STOCKOUT (0 ON-HAND)', action: 'PR' },
  { sku: 'PART-BRG-6204', name: 'SKF Explorer Deep Groove Hybrid Ceramic Ball Bearing', oem: 'Specs: 20x47x14mm C3 P6', sub: 'Compressor Core', bin: 'Rack C-01 / Bin 44 · Anti-Static Cabinet', par: '—', on: 6, alloc: 0, unit: 315.0, status: 'IN STOCK (PAR UNSET)', action: null },
];

const SUBS = ['All Subsystems', 'Compressor Core', 'Filtration', 'Lubrication', 'Electrical / Solenoid'] as const;

const TXNS = [
  { id: 'TXN-2025-88419', ts: '2025-02-14 14:15:22', part: 'PART-SEAL-8821 · Ceramic Shaft Seal 2.5"', type: 'WO DISPATCH USAGE', delta: '−2 pcs', bal: '1 pc', src: '#WO-2025-0812', op: 'M. Kowalski · Lead Field Tech' },
  { id: 'TXN-2025-88390', ts: '2025-02-14 14:12:01', part: 'PART-LUB-09 · Polyolester Oil ISO 68', type: 'WO DISPATCH USAGE', delta: '−2 pails', bal: '3 pails', src: '#WO-2025-0812', op: 'M. Kowalski · Lead Field Tech' },
  { id: 'TXN-2025-87910', ts: '2025-01-29 19:40:11', part: 'PART-FLTR-401 · MERV 14 Chiller Filter', type: 'PO RECEIPT STOCK-IN', delta: '+20 pcs', bal: '24 pcs', src: '#PO-2025-0081', op: 'R. Pratama · Storeman Hub' },
  { id: 'TXN-2025-86102', ts: '2025-01-15 16:05:40', part: 'PART-BRG-6204 · SKF Hybrid Ball Bearing', type: 'TRANSFER RECEIVED', delta: '+4 pcs', bal: '6 pcs', src: '#TO-8891 (Sat-B)', op: 'R. Pratama · Storeman Hub' },
  { id: 'TXN-2025-84902', ts: '2024-12-28 21:20:00', part: 'PART-VLV-102 · Expansion Solenoid 24V', type: 'AUDIT CYCLE COUNT', delta: '−1 pc', bal: '3 pcs', src: '#ADJ-2024-Q4', op: 'M. Vance · VP Ops Auditor' },
];

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 700;

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Asset Detail + Spare Parts Ledger — archive port (unit 5, no prototype).
 * Canon rewires: Daikin→Trane (C4), health 68 (C5), lube $195 (2-source),
 * seal bin CRIB-B/Bay 01 (C8), commissioned 14 Oct 2020 (registry 3×),
 * EST→WIB / UTC-5→UTC. PART-BRG-6204 verbatim (C9 partial confirm).
 */
export function AssetDetail({ assetId }: { assetId: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');
  const [sub, setSub] = useState<string>('All Subsystems');
  const [bom, setBom] = useState<Bom[]>(BOM_SEED);
  const [skuOpen, setSkuOpen] = useState(false);
  const [sku, setSku] = useState('');
  const [skuQty, setSkuQty] = useState('1');
  const [skuTouched, setSkuTouched] = useState(false);
  const [prNote, setPrNote] = useState<Record<string, string>>({});

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  const events = EVENTS.filter((e) => tab === 'All' || e.type === tab);
  const parts = bom.filter((b) => sub === 'All Subsystems' || b.sub === sub);

  const addSku = () => {
    setSkuTouched(true);
    const qty = parseInt(skuQty, 10);
    if (!/^PART-[A-Z]+-\d+$/.test(sku.trim()) || !Number.isFinite(qty) || qty < 1) return;
    setBom((b) => [...b, {
      sku: sku.trim(), name: 'Pending nomenclature capture', oem: 'Unmapped — survey required',
      sub: 'Compressor Core', bin: 'Staging · Inbound Dock', par: '—', on: qty, alloc: 0,
      unit: 0, status: 'STAGED (UNVALUED)', action: null,
    }]);
    setSkuOpen(false);
    setSku('');
    setSkuQty('1');
    setSkuTouched(false);
    push(true, 'SKU staged to BOM', `${sku.trim()} · ${qty} pc → pending survey + valuation.`);
  };

  const issue = (skuId: string) => {
    setBom((b) => b.map((x) => {
      if (x.sku !== skuId || x.on - x.alloc < 1) return x;
      push(true, 'Issued to WO', `${skuId} · 1 pc → ${CANON.workOrderSeal}.`);
      return { ...x, alloc: x.alloc + 1 };
    }));
  };

  const request = (skuId: string, kind: 'PR' | 'PO') => {
    const ref = kind === 'PR' ? 'PR-2026-0316' : 'PO-2026-0316';
    setPrNote((n) => ({ ...n, [skuId]: `${ref} drafted` }));
    push(true, kind === 'PR' ? 'PR drafted' : 'Quick PO drafted', `${ref} · ${skuId} → purchasing queue.`);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <Link className="text-muted hover:text-cobalt font-medium" href="/assets">Asset Registry</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{assetId}</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="asset-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="fail">P1 · MISSION CRITICAL FACILITY PLANT</Badge>
              <Badge variant="warn">ACTIVE / UNDER MONITORING</Badge>
              <Badge variant="info">BOM VERIFIED · REV-2024.3</Badge>
            </div>
            <h1 id="asset-h" className="text-2xl font-semibold tracking-tight">
              Centrifugal Water Chiller Unit 4 <span className="apex-id text-cobalt font-semibold">{assetId}</span>
            </h1>
            <p className="text-[13px] text-muted">
              {CANON.assetOem} · Telemetry ID <span className="apex-id">IOT-CHL-450-04</span> · HQ Campus (East Wing) · Building B (CUP) · Basement L2 · Mech Room #B-204
            </p>
            <p className="text-[13px] text-muted">Asset Custodian: <strong className="text-ink">HVAC Central Plant Team (Ops L2)</strong></p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex flex-wrap gap-2">
              <Link href={`/vendors/${CANON.vendorSlug}`}><Button>Quick Dispatch WO</Button></Link>
              <Link href={`/field/audits/${CANON.inspection}/run`}><Button variant="secondary">Log Inspection</Button></Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/assets/${assetId}/bim`}><Button variant="secondary">Open BIM</Button></Link>
              <Button variant="secondary" onClick={() => push(true, 'Dossier queued', `${assetId} asset dossier → Reports.`)}>
                <FileText size={16} /> Dossier
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Nominal Capacity', v: '450 TR', s: '1,582 kW thermal' },
            { l: 'Refrigerant Spec', v: 'HFC-134a', s: 'Charge: 620 lbs (dry)' },
            { l: 'Compressor Topology', v: 'Dual Mag-Bearing', s: 'Oil-free centrifugal' },
            { l: 'Electrical Supply', v: '480V / 3Ø / 60Hz', s: 'FLA: 512 Amps' },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
              <span className="apex-label-caps text-muted">{k.l}</span>
              <span className="text-base font-semibold">{k.v}</span>
              <span className="text-[11px] text-muted">{k.s}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-lg border border-border-subtle bg-surface p-3">
            <p className="apex-label-caps text-muted">OEM Warranty &amp; SLA</p>
            <p><strong>{CANON.vendorName}</strong> · Factory warranty <span className="text-fail font-semibold">expired 14 Oct 2023</span></p>
            <p><strong>Trane Care Platinum #TC-8891-B</strong> · active thru Nov 2026 (Tier-1 2h response)</p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface p-3">
            <p className="apex-label-caps text-muted">Commissioning &amp; Age</p>
            <p><strong>14 Oct 2020</strong> · Design life 20 yrs · S/N <span className="apex-id">{CANON.assetSerial}</span></p>
            <p className="text-muted">Straight-line depreciation · Yr 6 of 10 · book $114,200.00</p>
          </div>
        </div>

        <div className="rounded-lg border-2 border-fail bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Health &amp; Telemetry Diagnostics <span className="apex-id font-normal text-muted">SAMPLING 1 SEC · IOT-CHL-450-04</span></h2>
            <Badge variant="fail">68 / 100 · NEEDS OVERHAUL</Badge>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { l: 'Seal Cavity Temp (TT-04A)', v: '84.1°C', s: '▲ Above 80°C trip watch', c: 'text-fail' },
              { l: 'Bearing Vibration (VT-04B)', v: '7.8 mm/s', s: '▲ At safety trip', c: 'text-fail' },
              { l: 'Refrigerant Sniff (GS-04C)', v: '18.4 ppm', s: '▲ Exceeds 5 ppm limit', c: 'text-warn' },
              { l: 'Discharge Pressure (PT-03A)', v: '118 PSI', s: '● Envelope 110–130', c: 'text-pass' },
            ].map((t) => (
              <div key={t.l} className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-0.5">
                <span className="apex-label-caps text-muted">{t.l}</span>
                <span className="text-xl font-semibold tabular-nums">{t.v}</span>
                <span className={cn('text-[11px] font-semibold', t.c)}>{t.s}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted">
            <span>MTBF <strong className="text-ink">1,840 hrs</strong></span>
            <span>MTTR <strong className="text-ink">3.2 hrs</strong></span>
            <span>Lifetime runtime <strong className="text-ink">32,491.4 h</strong></span>
            <span>Availability <strong className="text-ink">99.2%</strong> (18.5h total outage)</span>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
          <h2 className="text-base font-semibold">Asset Lifecycle &amp; Maintenance Audit Trail</h2>
          <p className="text-xs text-muted -mt-2">Immutable ledger of work orders, inspections, parts usage, calibrations.</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Event filter">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={cn('h-8 px-3 rounded text-xs font-semibold border', tab === t ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}
              >
                {t === 'All' ? 'All Events' : t === 'WO' ? 'Work Orders' : t === 'Inspection' ? 'Inspections' : t === 'Parts' ? 'Parts Replaced' : 'Calibration'} ({TAB_TOTAL[t]})
              </button>
            ))}
          </div>
          <ol className="flex flex-col gap-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  {e.id === CANON.workOrderSeal ? (
                    <Link className="apex-id font-bold text-cobalt hover:underline" href={`/work-orders/${e.id}`}>{e.id}</Link>
                  ) : e.id === CANON.inspection ? (
                    <Link className="apex-id font-bold text-cobalt hover:underline" href={`/field/audits/${e.id}/run`}>{e.id}</Link>
                  ) : (
                    <span className="apex-id font-bold">{e.id}</span>
                  )}
                  <Badge variant={e.type === 'WO' ? 'info' : e.type === 'Inspection' ? 'warn' : 'hold'}>{e.state}</Badge>
                </div>
                <p className="text-[13px] font-semibold">{e.title}</p>
                <p className="text-[13px] text-muted">{e.body}</p>
                <p className="apex-id text-muted">{e.meta}</p>
              </li>
            ))}
            {events.length === 0 && <li className="text-sm text-muted p-2">No recent {tab.toLowerCase()} events in the seeded window.</li>}
          </ol>
          <p className="text-xs text-muted" role="status">Showing {events.length} recent of {TAB_TOTAL[tab]} {tab === 'All' ? 'events' : tab.toLowerCase() + ' records'}.</p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Bill of Materials &amp; Linked Spare Parts Ledger</h2>
            <Dialog open={skuOpen} onOpenChange={setSkuOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">+ Add SKU to BOM</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="sku-h">
                <DialogTitle id="sku-h">Add SKU to BOM</DialogTitle>
                <DialogDescription>Stages a row — survey + valuation follow before it counts as stocked.</DialogDescription>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="sku-id">SKU (PART-XXX-000)</label>
                    <Input id="sku-id" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} invalid={skuTouched && !/^PART-[A-Z]+-\d+$/.test(sku.trim())} className="apex-id" placeholder="PART-XXX-000" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="sku-qty">Qty on-hand</label>
                    <Input id="sku-qty" inputMode="numeric" value={skuQty} onChange={(e) => setSkuQty(e.target.value)} invalid={skuTouched && !(parseInt(skuQty, 10) >= 1)} />
                  </div>
                </div>
                {skuTouched && (!/^PART-[A-Z]+-\d+$/.test(sku.trim()) || !(parseInt(skuQty, 10) >= 1)) && (
                  <p className="text-[11px] font-semibold text-fail">SKU must look like PART-SEAL-8821 and qty ≥ 1.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setSkuOpen(false)}>Cancel</Button>
                  <Button onClick={addSku}>Stage SKU</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xs text-muted -mt-2">Warehouse scope: Central Distribution Hub (primary) · Stored BOM valuation <strong className="text-ink">$34,820.00</strong> WAC · 100% critical assemblies mapped.</p>
          <p className="text-[13px]"><Badge variant="warn">LOW STOCK</Badge> <span className="apex-id font-bold">{CANON.sealSku}</span> deficit (par 4, net 0) · PO-2025-0144 +4 in-transit · last tracked Feb 2025.</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Subsystem filter">
            {SUBS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSub(s)}
                aria-pressed={sub === s}
                className={cn('h-8 px-3 rounded text-xs font-semibold border', sub === s ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-border-subtle bg-card">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead>
                <tr className="text-left text-muted border-b border-border-subtle">
                  <th className="p-2 font-semibold">Part SKU &amp; Nomenclature</th>
                  <th className="font-semibold">Subsystem</th>
                  <th className="font-semibold">Bin / Staging</th>
                  <th className="font-semibold">Par</th>
                  <th className="font-semibold">On-Hand</th>
                  <th className="font-semibold">Allocated</th>
                  <th className="font-semibold">Unit / Value</th>
                  <th className="font-semibold">Health / Stock Status</th>
                  <th className="font-semibold">Warehouse Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((b) => (
                  <tr key={b.sku} className="border-b border-surface-subtle">
                    <td className="p-2">
                      <p><span className="apex-id font-bold text-cobalt">{b.sku}</span>{b.crit && <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-fail-bg text-fail">CRITICAL</span>}</p>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted">{b.oem}</p>
                    </td>
                    <td>{b.sub}</td>
                    <td className="apex-id text-xs">{b.bin}</td>
                    <td className="apex-id">{b.par}</td>
                    <td className="apex-id font-bold">{b.on} pc{b.on === 1 ? '' : 's'}</td>
                    <td className="apex-id">{b.alloc} pc{b.alloc === 1 ? '' : 's'}{b.allocRef ? ` (${b.allocRef})` : ''}</td>
                    <td className="apex-id">{money(b.unit)}<br /><span className="text-muted">Tot: {money(b.unit * b.on)}</span></td>
                    <td><span className={cn('text-[11px] font-bold', b.on - b.alloc <= 0 ? 'text-fail' : b.status.includes('BELOW') ? 'text-warn' : 'text-pass')}>{b.status}</span></td>
                    <td>
                      {prNote[b.sku] ? (
                        <span className="text-xs font-semibold text-pass">{prNote[b.sku]}</span>
                      ) : b.action === 'PR' ? (
                        <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => request(b.sku, 'PR')}>+ PR Request</button>
                      ) : b.action === 'PO' ? (
                        <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => request(b.sku, 'PO')}>+ Quick PO</button>
                      ) : b.action === 'ISSUE' ? (
                        <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => issue(b.sku)}>Issue to WO</button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted" role="status">Showing {parts.length} of {bom.length} linked parts (ledger holds 18 SKUs).</p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Immutable Stock Movement Ledger</h2>
            <Badge variant="pass">AUTO-RECONCILIATION ACTIVE</Badge>
          </div>
          <p className="text-xs text-muted -mt-2">Double-entry perpetual journal · Warehouse hash SHA-256: 9e08fc…18a.</p>
          <div className="overflow-x-auto rounded-lg border border-border-subtle bg-card">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead>
                <tr className="text-left text-muted border-b border-border-subtle">
                  <th className="p-2 font-semibold">Transaction ID</th>
                  <th className="font-semibold">Timestamp (UTC)</th>
                  <th className="font-semibold">Part SKU &amp; Spec</th>
                  <th className="font-semibold">Type</th>
                  <th className="font-semibold">Δ</th>
                  <th className="font-semibold">Balance</th>
                  <th className="font-semibold">Source</th>
                  <th className="font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody>
                {TXNS.map((t) => (
                  <tr key={t.id} className="border-b border-surface-subtle">
                    <td className="p-2 apex-id font-bold">{t.id}</td>
                    <td className="apex-id">{t.ts}</td>
                    <td>{t.part}</td>
                    <td className="text-xs font-semibold">{t.type}</td>
                    <td className={cn('apex-id font-bold', t.delta.startsWith('+') ? 'text-pass' : 'text-fail')}>{t.delta}</td>
                    <td className="apex-id">{t.bal}</td>
                    <td className="apex-id">{t.src}</td>
                    <td className="text-xs">{t.op}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">Showing latest 5 of 421 ledger transactions for {assetId}.</p>
            <Button variant="secondary" onClick={() => push(true, 'Ledger extract queued', 'Full 421-row history → Reports (CSV).')}>Load Full Historical Ledger</Button>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-2">
          <h2 className="text-base font-semibold">Compliance &amp; Docs</h2>
          <ul className="text-[13px] flex flex-col gap-1">
            <li className="flex justify-between gap-2"><span className="text-muted">Pressure vessel cert</span><span className="font-semibold">#NBIC-990-2024 · valid 12 months</span></li>
            <li className="flex justify-between gap-2"><span className="text-muted">LOTO program</span><span className="font-semibold">Padlock #4092 · M-44 · Panel DP-02 · 0.0V verified</span></li>
            <li className="flex justify-between gap-2"><span className="text-muted">O&amp;M manual</span><Link className="text-cobalt font-semibold hover:underline" href={`/vendors/${CANON.vendorSlug}`}>Trane_CVHE.pdf via {CANON.vendorName}</Link></li>
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
