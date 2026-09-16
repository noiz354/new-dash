'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Plus,
  Search,
  ShieldAlert,
  Workflow,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface FindingRecord {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  zone: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PENDING_TRIAGE' | 'CONVERTED' | 'DISMISSED';
  inspector: string;
  inspectionId: string;
  reportedAt: string;
  actionRequired: string;
  convertedWo?: string;
}

const FINDINGS: FindingRecord[] = [
  {
    id: CANON.finding, // FND-2026-0188
    title: 'Severe R-134a Refrigerant Shaft Seal Leak (18.4 ppm breach)',
    assetId: CANON.assetSeal,
    assetName: 'Trane CVHE-500 Centrifugal Chiller #04',
    zone: 'Basement Mech Room B-204',
    severity: 'CRITICAL',
    status: 'PENDING_TRIAGE',
    inspector: 'Elena Voronova',
    inspectionId: CANON.inspection,
    reportedAt: 'Today 14:15 WIB',
    actionRequired: 'LOTO Lockout & Emergency Seal Replacement Work Order',
  },
  {
    id: 'FND-2026-0185',
    title: 'Emergency Starter Battery Bank Float Voltage Low (21.4 VDC vs 24.0 VDC nominal)',
    assetId: 'AST-GEN-01',
    assetName: 'Cummins QSK60 Emergency Diesel Generator #01',
    zone: 'Sub-Basement Vault #02',
    severity: 'HIGH',
    status: 'CONVERTED',
    inspector: 'T. Chen',
    inspectionId: 'INS-2026-0409',
    reportedAt: 'Today 12:45 WIB',
    actionRequired: 'Battery float charger recalibration',
    convertedWo: 'WO-2026-0902',
  },
  {
    id: 'FND-2026-0182',
    title: 'Static Differential Pressure Across Stage 2 Filter Bank High (340 Pa vs 280 Pa max)',
    assetId: 'AST-ENV-108',
    assetName: 'Camfil CamCleaner Cleanroom AHU #12',
    zone: 'Clean Lab Annex 4',
    severity: 'MEDIUM',
    status: 'PENDING_TRIAGE',
    inspector: 'E. Rostova',
    inspectionId: 'INS-2026-0415',
    reportedAt: 'Today 10:30 WIB',
    actionRequired: 'Pre-filter bank replacement scheduled for Shift 2',
  },
];

export default function FindingsListPage() {
  const [filterSev, setFilterSev] = useState('ALL');
  const [q, setQ] = useState('');

  const filtered = FINDINGS.filter((f) => {
    if (filterSev !== 'ALL' && f.severity !== filterSev) return false;
    const needle = q.trim().toLowerCase();
    return (
      !needle ||
      `${f.id} ${f.title} ${f.assetId} ${f.inspector} ${f.zone}`.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Breadcrumb & Header */}
      <section className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
          <Link className="hover:text-cobalt transition-colors" href="/">
            Home
          </Link>
          <span>/</span>
          <Link className="hover:text-cobalt transition-colors" href="/field-inspections">
            Field Inspections
          </Link>
          <span>/</span>
          <span className="font-semibold text-body">Findings &amp; Defect Triage Desk</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fail-bg border border-fail/30 text-fail flex items-center justify-center">
              <Workflow size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-display">
                  Findings &amp; Auto-WO Conversion Desk
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-fail text-white text-[11px] font-mono font-bold">
                  2 Pending Triage
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Review failed checklist steps and convert critical field defects into dispatched Work Orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/field/findings/new">
              <Button className="h-9 gap-1.5 text-xs bg-fail hover:bg-fail-dot text-white">
                <Plus size={14} /> + Log Defect Finding
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Total Logged Defects
            </span>
            <span className="text-2xl font-bold font-display text-ink tabular-nums">03</span>
            <span className="text-xs text-muted block mt-0.5">Across all zones (7d)</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-muted">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Critical / Immediate Hazard
            </span>
            <span className="text-2xl font-bold font-display text-fail tabular-nums">01</span>
            <span className="text-xs text-fail font-semibold block mt-0.5">LOTO Lockout Required</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-fail-bg flex items-center justify-center text-fail">
            <AlertOctagon size={20} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border-subtle shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Dispatched to Work Orders
            </span>
            <span className="text-2xl font-bold font-display text-pass-ink tabular-nums">01</span>
            <span className="text-xs text-pass-ink font-semibold block mt-0.5">Auto-WO Chain Active</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-pass-bg flex items-center justify-center text-pass">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="bg-card rounded-xl p-4 border border-border-subtle shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search finding ID, title, asset, or zone…"
            className="pl-8 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-muted">Criticality:</span>
          <select
            value={filterSev}
            onChange={(e) => setFilterSev(e.target.value)}
            className="h-9 px-2 border border-border-strong rounded text-xs bg-card"
          >
            <option value="ALL">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </section>

      {/* Findings List */}
      <section className="flex flex-col gap-3">
        {filtered.map((f) => (
          <div
            key={f.id}
            className={cn(
              'bg-card rounded-xl border p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all',
              f.severity === 'CRITICAL' ? 'border-fail/40 bg-fail-bg/10' : 'border-border-subtle'
            )}
          >
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-ink">{f.id}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-mono font-bold',
                    f.severity === 'CRITICAL'
                      ? 'bg-fail text-white'
                      : f.severity === 'HIGH'
                      ? 'bg-warn text-white'
                      : 'bg-surface border border-border-subtle text-muted'
                  )}
                >
                  {f.severity}
                </span>
                <span className="font-mono text-xs text-muted">
                  from {f.inspectionId} ({f.reportedAt})
                </span>
              </div>

              <h2 className="text-base font-bold text-ink font-display">{f.title}</h2>

              <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1 font-mono font-semibold text-body">
                  {f.assetId} · {f.assetName}
                </span>
                <span>•</span>
                <span>{f.zone}</span>
                <span>•</span>
                <span>Inspector: <strong className="text-body">{f.inspector}</strong></span>
              </div>

              <p className="text-xs text-muted font-mono mt-0.5">
                Action: <span className="text-body font-semibold">{f.actionRequired}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {f.status === 'CONVERTED' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-pass-ink bg-pass-bg border border-pass/30 px-2 py-1 rounded">
                    CONVERTED: {f.convertedWo}
                  </span>
                  <Link href={`/work-orders/${f.convertedWo}`}>
                    <Button variant="secondary" className="h-8 px-2.5 text-xs">
                      View WO <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/field/findings/${f.id}`}>
                  <Button
                    className={cn(
                      'h-9 px-3 text-xs gap-1.5 font-bold',
                      f.severity === 'CRITICAL'
                        ? 'bg-fail hover:bg-fail-dot text-white'
                        : 'bg-cobalt-deep hover:bg-cobalt text-white'
                    )}
                  >
                    Triage &amp; Auto-Convert <ArrowRight size={14} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
