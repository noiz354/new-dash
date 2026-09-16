'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, PackagePlus, Printer, X, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { downloadText } from '@/lib/download';

interface Sku {
  id: string; cat: string; name: string; spec: string; bin: string; hub: string;
  on: number; reserved: number | null; avail: number | null; min: number;
  status: string; level: 'critical' | 'rop' | 'optimal';
}

const SEED: Sku[] = [
  { id: CANON.sealSku, cat: 'HVAC Mechanical', name: 'Silicon Carbide Shaft Seal 2.5"', spec: 'Trane EarthWise CVHE Kit • OEM #4920-11', bin: CANON.sealBin, hub: 'Central Crib - Bldg B', on: 2, reserved: 1, avail: 1, min: 4, status: 'CRITICAL (1/4)', level: 'critical' },
  { id: 'PART-LUB-09', cat: 'Lubricants & Fluids', name: 'Synthetic POE Refrigerant Lubricant ISO 68', spec: '5 Gal Pail • Mobil EAL Arctic Series', bin: 'CRIB-CHEM / Rack 02', hub: 'Central Crib - Bldg B', on: 6, reserved: 2, avail: 4, min: 5, status: 'BELOW ROP (4/5)', level: 'rop' },
  { id: 'PART-FLTR-401', cat: 'Filters & Consumables', name: 'MERV 14 Chilled Air Filter Cartridge', spec: '24x24x2 Pleated High Efficiency Camfil', bin: 'SUB-LCK-4B / Bay 01', hub: 'Substation Locker 4B', on: 48, reserved: 4, avail: 44, min: 12, status: 'OPTIMAL', level: 'optimal' },
  { id: 'PART-BRG-6205', cat: 'HVAC Mechanical', name: 'Deep Groove SKF Ceramic Ball Bearing', spec: '25x52x15mm Hybrid Insulated • SKF Explorer', bin: 'CRIB-B / Shelf A-12', hub: 'Central Crib - Bldg B', on: 18, reserved: 0, avail: 18, min: 6, status: 'OPTIMAL', level: 'optimal' },
  { id: 'PART-VALV-GT2', cat: 'Filters & Consumables', name: '2-Inch High Pressure Bronze Gate Valve', spec: 'Threaded 300 WOG • Nibco Class 150', bin: 'CRIB-PIPE / Bin 08', hub: 'Central Crib - Bldg B', on: 2, reserved: null, avail: null, min: 10, status: 'BELOW ROP', level: 'rop' },
  { id: 'PART-FUSE-600V', cat: 'Electrical & Switchgear', name: '600V Fast-Acting Class J Fuse 30A', spec: 'Bussmann LPJ-30SP Dual-Element Time Delay', bin: 'ELEC-VAULT / Drw 03', hub: 'Central Crib - Bldg B', on: 3, reserved: 2, avail: 1, min: 10, status: 'CRITICAL (1/10)', level: 'critical' },
];

const CATS = ['All Categories', 'HVAC Mechanical', 'Electrical & Switchgear', 'Lubricants & Fluids', 'Filters & Consumables'] as const;
const CAT_COUNT: Record<string, string> = { 'All Categories': '4,218', 'HVAC Mechanical': '842', 'Electrical & Switchgear': '612', 'Lubricants & Fluids': '248', 'Filters & Consumables': '1,150' };
const HUBS = ['All Warehouses (Consolidated)', 'Central Crib - Bldg B', 'Substation Locker 4B', 'Cleanroom Cage C-04'] as const;
const LEVELS = ['All Stock Levels', 'Critical Low Stock (< Safety)', 'Below Reorder Point (ROP)', 'Optimal / Adequate'] as const;

type MovKind = 'IN' | 'OUT' | 'ADJ' | 'TRF';
interface Mov { kind: MovKind; delta: string; doc: string; ts: string; part: string; detail: string }

const MOV_SEED: Mov[] = [
  { kind: 'OUT', delta: '−1 ea', doc: CANON.workOrderSeal, ts: 'Today 14:32 UTC', part: `${CANON.sealSku} (Mechanical Shaft Seal)`, detail: `AST-HVAC-004 · ${CANON.sealBin} · dispatched to M. Kowalski (Lead Tech) · auth:mvance` },
  { kind: 'IN', delta: '+2 ea', doc: `${CANON.purchaseOrder} · GRN Rec`, ts: 'Today 11:15 UTC', part: `${CANON.sealSku} (Mechanical Shaft Seal Kit)`, detail: 'Trane Supply Co · dock bay-02 · barcode verified' },
  { kind: 'OUT', delta: '−2 pails', doc: `${CANON.pmPlan} · Quarterly PM`, ts: 'Yest 16:40 UTC', part: 'PART-LUB-09 (Synthetic POE ISO 68)', detail: 'CRIB-CHEM · recipient HVAC Shift Team A · ref:PM-Q1' },
  { kind: 'TRF', delta: '+5 ea [TRF]', doc: 'TRF-2026-0044', ts: 'May 18 09:12 UTC', part: 'PART-VALV-GT2 (Bronze Gate Valve)', detail: 'North Depot → Central · Internal Courier #02 · waybill #772' },
  { kind: 'ADJ', delta: '−2 pcs [ADJ]', doc: 'ADJ-2026-0019', ts: 'May 17 18:00 UTC', part: 'PART-FUSE-600V (Class J Fuse 30A)', detail: 'Terminal pin defect · scrap write-off VP Operations · cc:QA-SCRAP · sha256:d8a2..f041' },
];

const MOV_TABS = ['All', 'Receipts', 'WO Out', 'Adjust', 'Transfers'] as const;
const MOV_TOTAL: Record<string, number> = { All: 1840, Receipts: 1240, 'WO Out': 560, Adjust: 0, Transfers: 40 };

const REASONS = [
  'Transfer to Sub-Warehouse (Field Stage)',
  'Scrap / Damaged Defect Write-Off',
  'Physical Cycle Count Variance Adjustment',
  'Emergency Borrow & Return Allocation',
] as const;

const DESTS = ['Substation Locker 4B (Bldg B - L1)', 'Mobile Van 03 - Field Service', 'Quarantine Holding Bay'] as const;

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 900;

const download = (filename: string, text: string) => downloadText(filename, text);

const utcNow = () => `${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`;

/**
 * Inventory & Spare Parts Ledger — archive port (unit 11, no prototype).
 * Rewires: seal bin → CRIB-B/Bay 01 (C8); +100-filter GRN → +2 seal kits
 * (PO-2026-0298 line cluster); SUB-LCK-4B VERIFIED for filters (C8 amend);
 * PART-BRG-6205 confirmed (C9 CLOSED — pair 6204/6205 complete, never merge).
 */
export function InventoryLedger() {
  const [rows, setRows] = useState<Sku[]>(SEED);
  const [movs, setMovs] = useState<Mov[]>(MOV_SEED);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All Categories');
  const [hub, setHub] = useState<string>('All Warehouses (Consolidated)');
  const [level, setLevel] = useState<string>('All Stock Levels');
  const [mtab, setMtab] = useState<string>('All');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});
  const [recvOpen, setRecvOpen] = useState(false);
  const [recvPo, setRecvPo] = useState('');
  const [recvSku, setRecvSku] = useState<string>(CANON.sealSku);
  const [recvQty, setRecvQty] = useState('2');
  const [recvTouched, setRecvTouched] = useState(false);
  // Mutation desk
  const [focus, setFocus] = useState<string>(CANON.sealSku);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [dest, setDest] = useState<string>(DESTS[0]);
  const [qty, setQty] = useState('1');
  const [woRef, setWoRef] = useState<string>(CANON.workOrderSeal);
  const [pin, setPin] = useState('');
  const [mutTouched, setMutTouched] = useState(false);
  const [seq, setSeq] = useState({ TRF: 45, ADJ: 20 });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hot = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
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

  const filtered = rows.filter((r) => {
    if (cat !== 'All Categories' && r.cat !== cat) return false;
    if (hub !== 'All Warehouses (Consolidated)' && r.hub !== hub) return false;
    if (level === 'Critical Low Stock (< Safety)' && r.level !== 'critical') return false;
    if (level === 'Below Reorder Point (ROP)' && r.level !== 'rop') return false;
    if (level === 'Optimal / Adequate' && r.level !== 'optimal') return false;
    const needle = q.trim().toLowerCase();
    return !needle || `${r.id} ${r.name} ${r.spec} ${r.bin}`.toLowerCase().includes(needle);
  });

  const movFiltered = movs.filter((m) =>
    mtab === 'All' || (mtab === 'Receipts' && m.kind === 'IN') || (mtab === 'WO Out' && m.kind === 'OUT') ||
    (mtab === 'Adjust' && m.kind === 'ADJ') || (mtab === 'Transfers' && m.kind === 'TRF')
  );

  const exportCsv = () => {
    const head = 'sku,category,name,bin,hub,on_hand,reserved,available,min_rop,status';
    const body = filtered.map((r) =>
      [r.id, `"${r.cat}"`, `"${r.name}"`, `"${r.bin}"`, `"${r.hub}"`, r.on, r.reserved ?? '', r.avail ?? '', r.min, `"${r.status}"`].join(',')
    );
    download('spare-parts-ledger.csv', [head, ...body].join('\n'));
    push(true, 'Ledger exported', `${filtered.length} seeded SKUs → spare-parts-ledger.csv (catalog 4,218).`);
  };

  const reorder = (id: string, kind: 'PR' | 'PO') => {
    const ref = kind === 'PR' ? 'PR-2026-0316' : 'PO-2026-0316';
    setNote((n) => ({ ...n, [id]: `${ref} drafted` }));
    push(true, kind === 'PR' ? 'PR drafted' : 'Quick PO drafted', `${ref} · ${id} → purchasing queue.`);
  };

  const issue = (id: string) => {
    setRows((rs) => rs.map((r) => {
      if (r.id !== id || r.avail === null || r.avail < 1) return r;
      push(true, 'Issued to WO', `${id} · 1 pc → ${CANON.workOrderSeal}.`);
      return { ...r, reserved: (r.reserved ?? 0) + 1, avail: r.avail - 1 };
    }));
  };

  const receive = () => {
    setRecvTouched(true);
    const n = parseInt(recvQty, 10);
    if (!/^PO-\d{4}-\d{4}$/.test(recvPo.trim()) || !Number.isFinite(n) || n < 1) return;
    setRows((rs) => rs.map((r) => (r.id === recvSku ? { ...r, on: r.on + n, avail: (r.avail ?? 0) + n } : r)));
    setMovs((ms) => [{ kind: 'IN', delta: `+${n} ea`, doc: `${recvPo.trim()} · GRN Rec`, ts: utcNow(), part: recvSku, detail: 'Dock Bay 02 · barcode verified · posted by Central Crib' }, ...ms]);
    setRecvOpen(false);
    setRecvPo('');
    setRecvTouched(false);
    push(true, 'Stock received', `${recvSku} +${n} · ${recvPo.trim()} · ledger +1.`);
  };

  const focusRow = rows.find((r) => r.id === focus) ?? rows[0];
  const qn = parseInt(qty, 10);
  const mutOk =
    Number.isFinite(qn) && qn >= 1 && (focusRow.avail ?? 0) >= qn &&
    pin.trim() === '2468' && (reason !== REASONS[3] || /^WO-2026-\d{4}$/.test(woRef.trim()));

  const postMutation = () => {
    setMutTouched(true);
    if (!mutOk) return;
    const kind: MovKind = reason === REASONS[1] || reason === REASONS[2] ? 'ADJ' : reason === REASONS[3] ? 'OUT' : 'TRF';
    const doc = kind === 'TRF' ? `TRF-2026-${String(seq.TRF).padStart(4, '0')}` : kind === 'ADJ' ? `ADJ-2026-${String(seq.ADJ).padStart(4, '0')}` : woRef.trim();
    setMovs((ms) => [{
      kind, delta: `−${qn} ea`, doc, ts: utcNow(),
      part: `${focus} (${focusRow.name})`, detail: `${reason} · Central Crib → ${dest} · approver M. Vance (PIN verified)`,
    }, ...ms]);
    setRows((rs) => rs.map((r) => (r.id === focus ? { ...r, on: r.on - qn, avail: (r.avail ?? 0) - qn } : r)));
    if (kind === 'TRF') setSeq((s) => ({ ...s, TRF: s.TRF + 1 }));
    if (kind === 'ADJ') setSeq((s) => ({ ...s, ADJ: s.ADJ + 1 }));
    setQty('1');
    setPin('');
    setMutTouched(false);
    push(true, 'Mutation posted', `${doc} · ${focus} −${qn} · ledger +1 · audit-chained.`);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/">Home</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">Inventory &amp; Spare Parts Ledger</span>
      </nav>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="inv-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="apex-id text-muted">Spare Parts &amp; Consumables Ledger · SKU-REG v4.2 · Hub: Central Crib (Bldg B)</p>
            <h1 id="inv-h" className="text-2xl font-semibold tracking-tight">Inventory &amp; Spare Parts Ledger</h1>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export (CSV/XLS)</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer size={16} /> Print QR / Barcode</Button>
            <Dialog open={recvOpen} onOpenChange={setRecvOpen}>
              <DialogTrigger asChild>
                <Button><PackagePlus size={16} /> Receive Stock (PO / GRN)</Button>
              </DialogTrigger>
              <DialogContent aria-labelledby="recv-h">
                <DialogTitle id="recv-h">Receive Stock</DialogTitle>
                <DialogDescription>Posts a receipt + increments on-hand. Dock Bay 02 · barcode verified.</DialogDescription>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="recv-po">PO ref (PO-YYYY-NNNN)</label>
                    <Input id="recv-po" value={recvPo} onChange={(e) => setRecvPo(e.target.value.toUpperCase())} invalid={recvTouched && !/^PO-\d{4}-\d{4}$/.test(recvPo.trim())} className="apex-id" placeholder="PO-2026-0298" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-semibold" htmlFor="recv-qty">Qty</label>
                    <Input id="recv-qty" inputMode="numeric" value={recvQty} onChange={(e) => setRecvQty(e.target.value)} invalid={recvTouched && !(parseInt(recvQty, 10) >= 1)} />
                  </div>
                </div>
                <label className="text-xs font-semibold" htmlFor="recv-sku">SKU</label>
                <select id="recv-sku" value={recvSku} onChange={(e) => setRecvSku(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card apex-id">
                  {rows.map((r) => <option key={r.id} value={r.id}>{r.id}</option>)}
                </select>
                {recvTouched && (!/^PO-\d{4}-\d{4}$/.test(recvPo.trim()) || !(parseInt(recvQty, 10) >= 1)) && (
                  <p className="text-[11px] font-semibold text-fail">Valid PO ref + qty ≥ 1 are required.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setRecvOpen(false)}>Cancel</Button>
                  <Button onClick={receive}>Post Receipt</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { l: 'Catalog Valuation', v: '$1,428,650.00', s: 'FIFO · 4,218 SKUs · +4.8% this quarter' },
            { l: 'Stock Availability Health', v: '94.2%', s: 'Operational · 38 critical WO-reserved' },
            { l: 'Low Stock & Reorder Triggers', v: '7 PO drafts', s: 'Auto-queued · 2 expedited in-transit' },
            { l: 'Monthly Stock Movement', v: '1,840', s: '+1,240 in · −560 out · 40 trf · 3.8x velocity' },
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
            <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by SKU, name, bin… (Ctrl+/)" aria-label="Filter SKUs" />
          </div>
          <select value={hub} onChange={(e) => setHub(e.target.value)} aria-label="Warehouse hub" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {HUBS.map((h) => <option key={h}>{h}</option>)}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Inventory threshold" className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Part categories">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn('h-8 px-3 rounded text-xs font-semibold border', cat === c ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}
            >
              {c} · {CAT_COUNT[c]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-[13px] min-w-[1000px]">
            <thead>
              <tr className="text-left text-muted border-b border-border-subtle bg-surface">
                <th className="p-2 font-semibold">SKU &amp; Part Specification</th>
                <th className="font-semibold">Bin / Hub</th>
                <th className="font-semibold">On Hand</th>
                <th className="font-semibold">Reserved</th>
                <th className="font-semibold">Available</th>
                <th className="font-semibold">Min / ROP</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-surface-subtle hover:bg-surface">
                  <td className="p-2">
                    <p><span className="apex-id font-bold text-cobalt">{r.id}</span> <span className="text-[10px] font-bold text-muted">{r.cat.split(' ')[0].toUpperCase()}</span></p>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{r.spec}</p>
                  </td>
                  <td><p className="apex-id text-xs">{r.bin}</p><p className="text-xs text-muted">{r.hub}</p></td>
                  <td className="apex-id font-bold">{r.on}</td>
                  <td className="apex-id">{r.reserved ?? '—'}</td>
                  <td className="apex-id font-bold">{r.avail ?? '—'}</td>
                  <td className="apex-id">{r.min}</td>
                  <td>
                    <Badge variant={r.level === 'critical' ? 'fail' : r.level === 'rop' ? 'warn' : 'pass'}>{r.status}</Badge>
                  </td>
                  <td>
                    {note[r.id] ? (
                      <span className="text-xs font-semibold text-pass">{note[r.id]}</span>
                    ) : r.id === CANON.sealSku || r.level === 'critical' ? (
                      <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => reorder(r.id, 'PR')}>+ PR Request</button>
                    ) : r.level === 'rop' && r.id === 'PART-LUB-09' ? (
                      <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => reorder(r.id, 'PO')}>+ Quick PO</button>
                    ) : r.level === 'rop' ? (
                      <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => reorder(r.id, 'PR')}>+ PR Request</button>
                    ) : r.id === 'PART-FLTR-401' ? (
                      <button type="button" className="text-cobalt font-semibold hover:underline text-xs" onClick={() => issue(r.id)}>Issue to WO</button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted">No seeded SKUs in this view — clear filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted" role="status">Showing {filtered.length} of {rows.length} seeded SKUs (catalog 4,218).</p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Movement Ledger <span className="text-xs font-normal text-muted">Live Audit Bus · UTC</span></h2>
              <Badge variant="pass">SYNCED · sha256:d8a2..f041</Badge>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Movement filter">
              {MOV_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMtab(t)}
                  aria-pressed={mtab === t}
                  className={cn('h-8 px-3 rounded text-xs font-semibold border', mtab === t ? 'bg-cobalt-deep text-white border-cobalt-deep' : 'bg-card border-border-subtle')}
                >
                  {t} ({t === 'All' ? MOV_TOTAL.All + movs.length - MOV_SEED.length : MOV_TOTAL[t]})
                </button>
              ))}
            </div>
            <ol className="flex flex-col gap-2">
              {movFiltered.map((m, i) => (
                <li key={`${m.doc}-${i}`} className="rounded-lg border border-border-subtle bg-card p-3 flex flex-col gap-1 text-[13px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('apex-id font-bold', m.kind === 'IN' || m.kind === 'TRF' ? 'text-pass' : m.kind === 'ADJ' ? 'text-warn' : 'text-fail')}>{m.delta}</span>
                    {m.doc === CANON.workOrderSeal ? (
                      <Link className="apex-id font-bold text-cobalt hover:underline" href={`/work-orders/${m.doc}`}>{m.doc}</Link>
                    ) : m.doc.startsWith(CANON.purchaseOrder) ? (
                      <Link className="apex-id font-bold text-cobalt hover:underline" href={`/purchasing/${CANON.purchaseOrder}?tab=receiving`}>{m.doc}</Link>
                    ) : m.doc.startsWith(CANON.pmPlan) ? (
                      <Link className="apex-id font-bold text-cobalt hover:underline" href="/preventive-maintenance">{m.doc}</Link>
                    ) : (
                      <span className="apex-id font-bold">{m.doc}</span>
                    )}
                    <span className="apex-id text-muted ml-auto">{m.ts}</span>
                  </div>
                  <p className="font-semibold">{m.part}</p>
                  <p className="text-muted text-xs">{m.detail}</p>
                </li>
              ))}
              {movFiltered.length === 0 && <li className="text-sm text-muted p-2">No movements in this bucket yet.</li>}
            </ol>
          </div>

          <div className="rounded-lg border-2 border-cobalt-deep bg-surface p-4 flex flex-col gap-3">
            <h2 className="text-base font-semibold">Transfer &amp; Mutation Desk</h2>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold" htmlFor="mut-sku">Active Focus SKU</label>
                <select id="mut-sku" value={focus} onChange={(e) => setFocus(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card apex-id">
                  {rows.map((r) => <option key={r.id} value={r.id}>{r.id}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold" htmlFor="mut-reason">Mutation Reason / Directive</label>
                <select id="mut-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold" htmlFor="mut-dest">Destination Hub / Tech</label>
                <select id="mut-dest" value={dest} onChange={(e) => setDest(e.target.value)} className="h-9 px-2 border border-border-strong rounded text-[13px] bg-card">
                  {DESTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold" htmlFor="mut-qty">Transfer Quantity</label>
                <Input id="mut-qty" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} invalid={mutTouched && !(Number.isFinite(qn) && qn >= 1 && (focusRow.avail ?? 0) >= qn)} />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold" htmlFor="mut-wo">Associated WO / X-Ref{reason === REASONS[3] ? ' (required)' : ''}</label>
                <Input id="mut-wo" value={woRef} onChange={(e) => setWoRef(e.target.value.toUpperCase())} invalid={mutTouched && reason === REASONS[3] && !/^WO-2026-\d{4}$/.test(woRef.trim())} className="apex-id" />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-xs font-semibold" htmlFor="mut-pin">Approver PIN — M. Vance (demo: 2468)</label>
                <Input id="mut-pin" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} invalid={mutTouched && pin.trim() !== '2468'} />
              </div>
            </div>
            <p className="text-[13px]" role="status">
              Avail. Central: <strong className="apex-id">{focusRow.avail ?? '—'}</strong>
              {' '}→ Balance post-transfer: <strong className={cn('apex-id', Number.isFinite(qn) && (focusRow.avail ?? 0) - qn < 0 ? 'text-fail' : 'text-pass')}>
                {focusRow.avail === null ? '—' : Number.isFinite(qn) ? `${(focusRow.avail ?? 0) - qn} available in Central` : '—'}
              </strong>
            </p>
            {mutTouched && !mutOk && (
              <p className="text-[11px] font-semibold text-fail">Qty ≤ available, approver PIN 2468{reason === REASONS[3] ? ', and a WO-2026-NNNN ref' : ''} are required.</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setQty('1'); setPin(''); setMutTouched(false); }}>Cancel</Button>
              <Button onClick={postMutation}>Confirm &amp; Post Mutation</Button>
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
