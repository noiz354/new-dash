import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Package,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';

interface PmRuleDetail {
  id: string;
  name: string;
  frequency: string;
  assetCode: string;
  assetName: string;
  templateId: string;
  templateName: string;
  status: 'ACTIVE' | 'PAUSED' | 'DUE_SOON';
  nextDue: string;
  daysRemaining: number;
  leadCrew: string;
  partsRequired: Array<{ sku: string; name: string; qty: string }>;
  history: Array<{ woId: string; completedAt: string; tech: string; result: string }>;
}

const PM_RULES: Record<string, PmRuleDetail> = {
  'PM-CHL-001': {
    id: 'PM-CHL-001',
    name: 'Central Chiller Semi-Annual Comprehensive Overhaul & Oil Analysis',
    frequency: 'Every 180 Days or 2,500 Operating Hours',
    assetCode: CANON.assetSeal,
    assetName: 'Trane CVHE-500 Centrifugal Chiller #04',
    templateId: 'TMPL-HVAC-CHL-02',
    templateName: 'Central Chiller Safety & Diagnostic Protocol',
    status: 'ACTIVE',
    nextDue: '2026-06-12 (Shift A)',
    daysRemaining: 18,
    leadCrew: 'HVAC Specialist Crew (M. Kowalski Lead)',
    partsRequired: [
      { sku: 'PART-FLTR-401', name: 'MERV 14 Chilled Water Filter', qty: '2 pcs' },
      { sku: 'PART-LUB-09', name: 'Synthetic POE Lubricant ISO 68', qty: '1 pail' },
    ],
    history: [
      { woId: 'WO-2025-0812', completedAt: '2025-12-14', tech: 'Marcus Kowalski', result: 'PASS (Completed with oil change)' },
      { woId: 'WO-2025-0410', completedAt: '2025-06-10', tech: 'Marcus Kowalski', result: 'PASS (Nominal parameters)' },
    ],
  },
};

export default async function PmPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = PM_RULES[id] || {
    id,
    name: `Preventive Maintenance Protocol ${id}`,
    frequency: 'Monthly Preventive Service',
    assetCode: CANON.assetSeal,
    assetName: 'Central Utility Plant Equipment',
    templateId: 'TMPL-HVAC-CHL-02',
    templateName: 'Standard Inspection Protocol',
    status: 'ACTIVE' as const,
    nextDue: '2026-06-01',
    daysRemaining: 7,
    leadCrew: 'Operations Crew',
    partsRequired: [
      { sku: 'PART-FLTR-401', name: 'Primary Air & Water Filter', qty: '1 pc' },
    ],
    history: [
      { woId: 'WO-2026-0701', completedAt: '2026-04-15', tech: 'Lead Tech', result: 'PASS' },
    ],
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
        <Link className="hover:text-cobalt transition-colors" href="/">
          Home
        </Link>
        <span>/</span>
        <Link className="hover:text-cobalt transition-colors" href="/preventive-maintenance">
          Preventive Maintenance
        </Link>
        <span>/</span>
        <span className="font-semibold text-body">{plan.id}</span>
      </nav>

      {/* Header */}
      <section className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cobalt-deep text-white flex items-center justify-center shrink-0">
              <Wrench size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-cobalt">{plan.id}</span>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-ink">{plan.name}</h1>
                <Badge variant={plan.status === 'ACTIVE' ? 'pass' : 'warn'}>
                  {plan.status}
                </Badge>
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                Frequency: {plan.frequency} · Automated Trigger: 7d prior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/work-orders/new?asset=${plan.assetCode}&title=${encodeURIComponent(`Manual PM Dispatch: ${plan.name}`)}`}>
              <Button className="h-9 gap-1.5 text-xs bg-cobalt-deep hover:bg-cobalt text-white">
                <Play size={14} /> Trigger Immediate WO Dispatch
              </Button>
            </Link>
          </div>
        </div>

        {/* Schedule & Due Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border-subtle text-xs">
          <div>
            <span className="text-[10px] font-bold text-muted uppercase block">Target Equipment</span>
            <Link href={`/assets/${plan.assetCode}`} className="font-mono font-bold text-sm text-cobalt hover:underline flex items-center gap-1">
              {plan.assetCode} <ArrowRight size={12} />
            </Link>
            <span className="text-muted truncate block">{plan.assetName}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted uppercase block">Next Scheduled Due</span>
            <span className="font-semibold text-body text-sm">{plan.nextDue}</span>
            <span className="text-pass-ink font-semibold block text-[11px] mt-0.5">
              In {plan.daysRemaining} days
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted uppercase block">Assigned Maintenance Crew</span>
            <span className="font-semibold text-body text-sm">{plan.leadCrew}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted uppercase block">Checklist Protocol</span>
            <Link href="/field-inspections" className="font-mono font-bold text-cobalt text-xs hover:underline block truncate">
              {plan.templateId}
            </Link>
            <span className="text-muted text-[11px] block">{plan.templateName}</span>
          </div>
        </div>
      </section>

      {/* Bill of Materials / Spare Parts Staged */}
      <section className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <Package size={18} className="text-cobalt" /> Required Spare Parts &amp; Staging
        </h2>
        <div className="divide-y divide-border-subtle">
          {plan.partsRequired.map((p) => (
            <div key={p.sku} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Link href={`/inventory/${p.sku}`} className="font-mono font-bold text-cobalt hover:underline">
                  {p.sku}
                </Link>
                <span className="text-body font-semibold">{p.name}</span>
              </div>
              <span className="font-mono font-bold text-body">{p.qty}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Historical PM Executions */}
      <section className="bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <RotateCcw size={18} className="text-cobalt" /> Completed Execution Run History
        </h2>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface text-muted text-[10px] font-bold uppercase tracking-wider border-b border-border-subtle">
                <th className="py-2.5 px-3">Work Order ID</th>
                <th className="py-2.5 px-3">Completed Date</th>
                <th className="py-2.5 px-3">Lead Technician</th>
                <th className="py-2.5 px-3 text-right">Signoff Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono">
              {plan.history.map((h) => (
                <tr key={h.woId} className="hover:bg-surface transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cobalt">
                    <Link href={`/work-orders/${h.woId}`} className="hover:underline">
                      {h.woId}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-muted">{h.completedAt}</td>
                  <td className="py-2.5 px-3 font-sans text-body">{h.tech}</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <span className="text-pass-ink font-semibold">{h.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link href="/preventive-maintenance">
          <Button variant="secondary" className="text-xs gap-1">
            <ArrowLeft size={14} /> Back to PM Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
}
