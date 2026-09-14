import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';

const KPIS = [
  { label: 'Open Work Orders', value: '14', delta: '+3 vs last shift', tone: 'info' as const },
  { label: 'P1 Critical', value: '3', delta: 'WO-2026-0894 · SLA 42m', tone: 'fail' as const },
  { label: 'SLA Compliance', value: '98.1%', delta: '+0.4pt · 7d', tone: 'pass' as const },
  { label: 'Techs On Shift', value: '9', delta: 'Shift A · 07:00–15:30', tone: 'info' as const },
];

/** Dispatch rows verified against operations_dashboard/code.html (rows 1–4). */
const DISPATCH = [
  { id: CANON.workOrderSeal, title: 'Primary Shaft Mechanical Seal Replacement', loc: 'Chiller #04 · CUP Basement L2', pri: 'P1-CRITICAL', status: 'IN PROGRESS', sla: '42m left', tone: 'warn' as const },
  { id: 'WO-2024-0892', title: 'Compressor bearing vibration anomaly above 7.8mm/s safety trip', loc: 'Chiller Unit #03 · Basement Energy Hub', pri: 'P1-CRITICAL', status: 'ESCALATED', sla: '-01:42:15 BREACH', tone: 'fail' as const },
  { id: 'WO-2024-0888', title: 'Common-rail fuel pump pressure loss during automated test fire', loc: 'Generator 2B · Outdoor Power Vault', pri: 'P1-CRITICAL', status: 'ON HOLD (PARTS)', sla: '-00:24:10 BREACH', tone: 'fail' as const },
  { id: 'WO-2024-0901', title: 'Secondary optical barcode scanner misalignment and belt drift', loc: 'Conveyor Sorter #4 · Logistics Bay 12', pri: 'P2-HIGH', status: 'IN PROGRESS', sla: '01:14:30 LEFT', tone: 'warn' as const },
  { id: 'WO-2024-0904', title: 'Static air pressure differential dropped below 25 Pa certification threshold', loc: 'Level 3 Pharma Lab · Tower A', pri: 'P2-HIGH', status: 'OPEN', sla: '02:40:00 LEFT', tone: 'info' as const },
];

/** Operations Dashboard — Fase F rebuild (reference: web/ + stitch archive). */
export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="text-[13px] text-muted">
            Active mission-critical dispatch line · Real-time field telemetry &amp; technician execution feed
          </p>
        </div>
        <Link href={`/work-orders/${CANON.workOrderSeal}`}>
          <Button>Open {CANON.workOrderSeal}</Button>
        </Link>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="KPIs">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-1 shadow-card">
            <span className="apex-label-caps text-muted">{k.label}</span>
            <span className="text-4xl font-bold tracking-tight tabular-nums">{k.value}</span>
            <span className="text-[11px] text-muted">{k.delta}</span>
          </div>
        ))}
      </section>

      <section className="bg-card border border-border-subtle rounded-lg shadow-card overflow-hidden" aria-label="Dispatch queue">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-base font-semibold">Live Dispatch Queue</h2>
          <span className="apex-id text-muted">Modbus 192.168.4.112:502 · synced</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="h-9 bg-surface border-b border-border-subtle text-left">
                <th className="apex-label-caps text-muted px-4">Work Order</th>
                <th className="apex-label-caps text-muted px-4">Title</th>
                <th className="apex-label-caps text-muted px-4">Asset</th>
                <th className="apex-label-caps text-muted px-4">Pri</th>
                <th className="apex-label-caps text-muted px-4">Status</th>
                <th className="apex-label-caps text-muted px-4">SLA</th>
              </tr>
            </thead>
            <tbody>
              {DISPATCH.map((r, i) => (
                <tr key={r.id} className={i % 2 ? 'bg-[#FBFCFD] border-b border-surface-subtle' : 'border-b border-surface-subtle hover:bg-surface-subtle'}>
                  <td className="px-4 py-2.5">
                    <Link href={`/work-orders/${r.id}`} className="apex-id font-bold text-cobalt hover:underline">
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 max-w-xs">{r.title}</td>
                  <td className="px-4 py-2.5">{r.loc}</td>
                  <td className="px-4 py-2.5 apex-id font-bold whitespace-nowrap">{r.pri}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={r.tone}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">{r.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border-subtle rounded-lg p-4 shadow-card">
          <h2 className="text-base font-semibold mb-2">Chiller #04 — Live Telemetry</h2>
          <ul className="text-[13px] flex flex-col gap-2">
            <li className="flex justify-between"><span className="text-muted">Seal cavity temp</span><strong className="tabular-nums text-fail">84.1°C ▲</strong></li>
            <li className="flex justify-between"><span className="text-muted">Bearing vibration</span><strong className="tabular-nums text-fail">7.8 mm/s ▲</strong></li>
            <li className="flex justify-between"><span className="text-muted">Refrigerant sniff</span><strong className="tabular-nums text-warn">18.4 ppm</strong></li>
            <li className="flex justify-between"><span className="text-muted">Chilled water ΔP</span><strong className="tabular-nums text-pass">6.9 BAR ●</strong></li>
          </ul>
        </div>
        <div className="bg-card border border-border-subtle rounded-lg p-4 shadow-card">
          <h2 className="text-base font-semibold mb-2">Execution Feed</h2>
          <ol className="text-[13px] flex flex-col gap-2 border-l-2 border-border-subtle ml-1">
            <li className="pl-4 relative"><span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-cobalt" />Logged parts consumption on <span className="apex-id font-bold">[WO-2024-0889]</span>: 2x Precision Bearings 6204RS.</li>
            <li className="pl-4 relative"><span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-warn-dot" />Compressor bearing vibration anomaly above 7.8mm/s safety trip — dispatch in transit.</li>
            <li className="pl-4 relative"><span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-pass" />Sensor alert on <span className="apex-id font-bold">[AST-CHILLER-03]</span>: exceeded 84°C — auto-ticketed.</li>
          </ol>
        </div>
      </section>
    </>
  );
}
