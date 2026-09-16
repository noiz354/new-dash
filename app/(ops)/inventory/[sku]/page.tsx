import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  History,
  Layers,
  MapPin,
  Package,
  Plus,
  ReceiptText,
  ShieldAlert,
  ShoppingCart,
  TrendingDown,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface SkuDetail {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  onHand: number;
  reserved: number;
  minReorder: number;
  binLocation: string;
  leadTimeDays: number;
  compatibleAssets: string[];
  ledger: Array<{
    id: string;
    ts: string;
    type: 'GRN_RECEIVE' | 'WO_DISPENSE' | 'CYCLE_ADJUST';
    ref: string;
    refUrl?: string;
    qtyDelta: number;
    balance: number;
    actor: string;
  }>;
}

const SKU_DATA: Record<string, SkuDetail> = {
  [CANON.sealSku]: { // PART-SEAL-8821
    sku: CANON.sealSku,
    name: 'Silicon Carbide Mechanical Shaft Seal Assembly 2.5"',
    category: 'HVAC Mechanical Seals',
    unitPrice: 1450.0,
    onHand: 1,
    reserved: 1,
    minReorder: 2,
    binLocation: 'CRIB-B / Bay 01 / Shelf 2',
    leadTimeDays: 14,
    compatibleAssets: [CANON.assetSeal, 'AST-HVAC-003', 'AST-HVAC-002'],
    ledger: [
      { id: 'TXN-901', ts: '2026-05-24 14:35 UTC', type: 'WO_DISPENSE', ref: CANON.workOrderSeal, refUrl: `/work-orders/${CANON.workOrderSeal}`, qtyDelta: -1, balance: 1, actor: 'Marcus Kowalski' },
      { id: 'TXN-872', ts: '2026-05-20 10:15 UTC', type: 'GRN_RECEIVE', ref: 'PO-2026-0285', refUrl: '/purchasing/PO-2026-0285', qtyDelta: +2, balance: 2, actor: 'Sarah Al-Mansoor' },
      { id: 'TXN-811', ts: '2026-04-10 08:30 UTC', type: 'CYCLE_ADJUST', ref: 'ADJ-2026-Q1', qtyDelta: 0, balance: 0, actor: 'Sarah Al-Mansoor' },
    ],
  },
  'PART-FLTR-401': {
    sku: 'PART-FLTR-401',
    name: 'MERV 14 Chilled Water Loop & AHU Primary Filter',
    category: 'Filtration & Consumables',
    unitPrice: 120.0,
    onHand: 145,
    reserved: 10,
    minReorder: 50,
    binLocation: 'CRIB-B / Bay 01 / Pallet Rack',
    leadTimeDays: 3,
    compatibleAssets: [CANON.assetSeal, 'AST-ENV-108', 'AST-AHU-001'],
    ledger: [
      { id: 'TXN-947', ts: '2026-05-24 11:15 UTC', type: 'GRN_RECEIVE', ref: 'PO-2026-0298', refUrl: '/purchasing/PO-2026-0298', qtyDelta: +100, balance: 145, actor: 'Sarah Al-Mansoor' },
      { id: 'TXN-912', ts: '2026-05-22 09:00 UTC', type: 'WO_DISPENSE', ref: 'WO-2026-0888', refUrl: '/work-orders/WO-2026-0888', qtyDelta: -5, balance: 45, actor: 'T. Chen' },
    ],
  },
  'PART-LUB-09': {
    sku: 'PART-LUB-09',
    name: 'Synthetic POE Refrigeration Lubricant ISO 68 (5 Gal)',
    category: 'Chemicals & Lubrication',
    unitPrice: 195.0,
    onHand: 8,
    reserved: 1,
    minReorder: 4,
    binLocation: 'CRIB-CHEM / Rack 02',
    leadTimeDays: 5,
    compatibleAssets: [CANON.assetSeal, 'AST-HVAC-003'],
    ledger: [
      { id: 'TXN-880', ts: '2026-05-21 16:00 UTC', type: 'WO_DISPENSE', ref: CANON.workOrderSeal, refUrl: `/work-orders/${CANON.workOrderSeal}`, qtyDelta: -1, balance: 8, actor: 'Marcus Kowalski' },
    ],
  },
};

export default async function InventorySkuDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const decodedSku = decodeURIComponent(sku);
  const item = SKU_DATA[decodedSku] || {
    sku: decodedSku,
    name: `Spare Part ${decodedSku}`,
    category: 'General Maintenance Parts',
    unitPrice: 250.0,
    onHand: 24,
    reserved: 2,
    minReorder: 10,
    binLocation: 'CRIB-A / Bay 04',
    leadTimeDays: 7,
    compatibleAssets: [CANON.assetSeal],
    ledger: [
      { id: 'TXN-700', ts: '2026-05-20 08:00 UTC', type: 'GRN_RECEIVE' as const, ref: 'PO-2026-0290', qtyDelta: +24, balance: 24, actor: 'Sarah Al-Mansoor' },
    ],
  };

  const isLowStock = item.onHand <= item.minReorder;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
        <Link className="hover:text-cobalt transition-colors" href="/">
          Home
        </Link>
        <span>/</span>
        <Link className="hover:text-cobalt transition-colors" href="/inventory">
          Inventory Ledger
        </Link>
        <span>/</span>
        <span className="font-semibold text-body">{item.sku}</span>
      </nav>

      {/* Header */}
      <section className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cobalt-deep text-white flex items-center justify-center shrink-0">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-cobalt">{item.sku}</span>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-ink">{item.name}</h1>
                <Badge variant={isLowStock ? 'warn' : 'pass'}>
                  {isLowStock ? 'REORDER REQUIRED' : 'IN STOCK'}
                </Badge>
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                Category: {item.category} · Unit Cost: ${item.unitPrice.toFixed(2)} USD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/purchasing">
              <Button className="h-9 gap-1.5 text-xs bg-cobalt-deep hover:bg-cobalt text-white">
                <ShoppingCart size={14} /> Initiate Reorder PO
              </Button>
            </Link>
          </div>
        </div>

        {/* Stock Balance Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border-subtle text-xs">
          <div className="p-3 bg-surface rounded-lg border border-border-subtle">
            <span className="text-[10px] font-bold text-muted uppercase block">Total On-Hand</span>
            <span className="text-2xl font-bold font-display text-ink tabular-nums">{item.onHand}</span>
            <span className="text-muted block text-[11px] mt-0.5">Physically in Crib</span>
          </div>

          <div className="p-3 bg-surface rounded-lg border border-border-subtle">
            <span className="text-[10px] font-bold text-muted uppercase block">Allocated / Reserved</span>
            <span className="text-2xl font-bold font-display text-warn tabular-nums">{item.reserved}</span>
            <span className="text-muted block text-[11px] mt-0.5">Staged for WOs</span>
          </div>

          <div className="p-3 bg-surface rounded-lg border border-border-subtle">
            <span className="text-[10px] font-bold text-muted uppercase block">Net Available</span>
            <span className="text-2xl font-bold font-display text-pass-ink tabular-nums">
              {item.onHand - item.reserved}
            </span>
            <span className="text-muted block text-[11px] mt-0.5">Free for Dispatch</span>
          </div>

          <div className="p-3 bg-surface rounded-lg border border-border-subtle">
            <span className="text-[10px] font-bold text-muted uppercase block">Storage Bin Location</span>
            <span className="text-sm font-bold font-mono text-body block truncate mt-1">{item.binLocation}</span>
            <span className="text-muted block text-[11px] mt-0.5">Lead Time: {item.leadTimeDays}d</span>
          </div>
        </div>
      </section>

      {/* Movement Ledger History */}
      <section className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <History size={18} className="text-cobalt" /> SKU Transaction &amp; Movement Ledger
          </h2>
          <span className="text-xs text-muted font-mono">{item.ledger.length} Recorded Movements</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface text-muted text-[10px] font-bold uppercase tracking-wider border-b border-border-subtle">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">UTC Timestamp</th>
                <th className="py-2.5 px-3">Movement Type</th>
                <th className="py-2.5 px-3">Reference Document</th>
                <th className="py-2.5 px-3">Quantity Delta</th>
                <th className="py-2.5 px-3">Balance After</th>
                <th className="py-2.5 px-3 text-right">Custodian / Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono">
              {item.ledger.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface transition-colors">
                  <td className="py-2.5 px-3 font-bold text-body">{tx.id}</td>
                  <td className="py-2.5 px-3 text-muted">{tx.ts}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold',
                        tx.type === 'GRN_RECEIVE'
                          ? 'bg-pass-bg text-pass-ink'
                          : tx.type === 'WO_DISPENSE'
                          ? 'bg-fail-bg text-fail-ink'
                          : 'bg-surface text-muted'
                      )}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {tx.refUrl ? (
                      <Link href={tx.refUrl} className="text-cobalt font-bold hover:underline">
                        {tx.ref}
                      </Link>
                    ) : (
                      <span>{tx.ref}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span className={tx.qtyDelta > 0 ? 'text-pass-ink' : 'text-fail'}>
                      {tx.qtyDelta > 0 ? `+${tx.qtyDelta}` : tx.qtyDelta}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-body">{tx.balance}</td>
                  <td className="py-2.5 px-3 text-right font-sans text-body">{tx.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Linked Assets */}
      <section className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-3">
        <h2 className="text-base font-bold text-ink">Compatible Equipment &amp; Bills of Materials</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {item.compatibleAssets.map((ast) => (
            <Link key={ast} href={`/assets/${ast}`}>
              <Badge variant="info" className="cursor-pointer hover:bg-cobalt hover:text-white transition-colors">
                {ast}
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/inventory">
          <Button variant="secondary" className="text-xs gap-1">
            <ArrowLeft size={14} /> Back to Parts Ledger
          </Button>
        </Link>
      </div>
    </div>
  );
}
