'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Phone, ShieldAlert, X, XCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON, canonPhone } from '@/lib/canon';
import { cn } from '@/lib/utils';
import { AmendDialog, CommendDialog, DispatchDialog, PdfDialog } from './dialogs';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 300;

interface VendorMeta {
  slug: string;
  name: string;
  code: string;
  duns?: string;
  tier: string;
  scope: string;
  contact: string;
  msa: string;
  msaDaysLeft?: number;
  exp: string;
  status: string;
  isExpired: boolean;
  sla: string;
  phone: string;
  openWork: { id: string; desc: string; href: string; cta: string; mono?: boolean }[];
  perf: { label: string; value: string; width: number }[];
  contractDocs: { title: string; desc: string; action: 'pdf' | 'amend' | 'link'; href?: string }[];
}

const KNOWN_VENDORS: Record<string, VendorMeta> = {
  [CANON.vendorSlug]: {
    slug: CANON.vendorSlug,
    name: CANON.vendorName,
    code: 'VND-HVAC-0012',
    duns: 'DUNS 00-132-9481',
    tier: 'TIER-1 · MISSION CRITICAL',
    scope: 'Centrifugal Chillers & R-134a Overhaul',
    contact: 'Robert Langdon · Sr. Tech Lead',
    msa: CANON.msa,
    msaDaysLeft: CANON.msaDaysLeft,
    exp: 'Exp 31 Dec 2026',
    status: 'ACTIVE (312d left)',
    isExpired: false,
    sla: '98.1%',
    phone: canonPhone('vendor'),
    openWork: [
      { id: CANON.workOrderSeal, desc: 'Seal replacement · IN PROGRESS P1', href: `/work-orders/${CANON.workOrderSeal}`, cta: 'Open WO', mono: true },
      { id: CANON.purchaseOrder, desc: 'Trane Supply Co · DISPATCHED', href: `/purchasing/${CANON.purchaseOrder}`, cta: 'Open PO', mono: true },
      { id: 'PO-2026-0315', desc: 'EarthWise Direct · pending dispatch', href: '/purchasing/PO-2026-0315?tab=review', cta: 'Authorize', mono: true },
      { id: CANON.pmPlan, desc: 'Quarterly chiller PM batch', href: '/preventive-maintenance', cta: 'Open PM', mono: true },
    ],
    perf: [
      { label: 'On-time arrival', value: '96.4%', width: 96 },
      { label: 'First-time fix', value: '91.2%', width: 91 },
      { label: 'SLA adherence', value: '98.1%', width: 98 },
    ],
    contractDocs: [
      { title: `${CANON.msa} Executed`, desc: 'signed 12 Mar 2024 · 28 pages', action: 'pdf' },
      { title: 'Amendment A1', desc: 'rate card 2025 · under review', action: 'amend' },
      { title: 'Trane_CVHE.pdf', desc: `O&M manual · linked to ${CANON.assetSeal}`, action: 'link', href: `/assets/${CANON.assetSeal}` },
    ],
  },
  'abb-grid-power-automation': {
    slug: 'abb-grid-power-automation',
    name: 'ABB Grid Power & Automation',
    code: 'VND-ELEC-0004',
    tier: 'TIER-1 · HIGH VOLTAGE ELECTRICAL',
    scope: '13.8kV Switchgear, Transformers & SCADA Protection',
    contact: 'Elena Voronova · SCADA Lead (internal liaison)',
    msa: 'MSA-2023-ABB-02',
    exp: 'Expired 15 Mar 2026',
    status: 'EXPIRED — renewal overdue',
    isExpired: true,
    sla: '96.8%',
    phone: '+62-21-5082-2000',
    openWork: [
      { id: 'PO-2026-0285', desc: '2000kVA Bushing Kits · PARTIAL RECEIPT', href: '/purchasing/PO-2026-0285', cta: 'Open PO', mono: true },
      { id: 'WO-2026-0881', desc: 'Substation Transformer #2 Bushing Inspection', href: '/work-orders', cta: 'View History', mono: true },
    ],
    perf: [
      { label: 'On-time arrival', value: '94.2%', width: 94 },
      { label: 'First-time fix', value: '88.5%', width: 88 },
      { label: 'SLA adherence', value: '96.8%', width: 97 },
    ],
    contractDocs: [
      { title: 'MSA-2023-ABB-02 (Expired)', desc: 'expired 15 Mar 2026 · Renewal Block Active', action: 'pdf' },
      { title: '2026 Renewal Draft Agreement', desc: 'under legal escalation review', action: 'amend' },
    ],
  },
  'siemens-building-technologies': {
    slug: 'siemens-building-technologies',
    name: 'Siemens Building Technologies',
    code: 'VND-BMS-0019',
    tier: 'TIER-2 · BUILDING AUTOMATION & BMS',
    scope: 'Desigo CC BMS & Cleanroom Actuators',
    contact: 'Marcus Gallagher · Engineering Liaison',
    msa: 'MSA-2025-SIE-11',
    msaDaysLeft: 440,
    exp: 'Exp 30 Nov 2027',
    status: 'ACTIVE (440d left)',
    isExpired: false,
    sla: '99.1%',
    phone: '+62-21-2754-3000',
    openWork: [
      { id: 'PM-BMS-004', desc: 'Monthly Cleanroom Pressure Calibration', href: '/preventive-maintenance', cta: 'Open PM', mono: true },
    ],
    perf: [
      { label: 'On-time arrival', value: '99.2%', width: 99 },
      { label: 'First-time fix', value: '97.0%', width: 97 },
      { label: 'SLA adherence', value: '99.1%', width: 99 },
    ],
    contractDocs: [
      { title: 'MSA-2025-SIE-11 Executed', desc: 'signed 01 Dec 2025 · 42 pages', action: 'pdf' },
    ],
  },
  'johnson-controls-tyco-fire': {
    slug: 'johnson-controls-tyco-fire',
    name: 'Johnson Controls (Tyco Fire)',
    code: 'VND-FIRE-0008',
    tier: 'TIER-1 · LIFE SAFETY & FIRE SUPPRESSION',
    scope: 'FM-200 Clean Agent & VESDA Aspirating Smoke Detection',
    contact: 'Sarah Al-Mansoor (internal liaison)',
    msa: 'MSA-2024-JCI-07',
    exp: 'Expired 14 Apr 2026',
    status: 'EXPIRED — renewal overdue',
    isExpired: true,
    sla: '95.2%',
    phone: '+62-21-2995-5800',
    openWork: [
      { id: 'INS-2026-1092', desc: 'Quarterly Life Safety Deluge Valve Round', href: '/field-inspections/INS-2026-1092', cta: 'Audit Protocol', mono: true },
    ],
    perf: [
      { label: 'On-time arrival', value: '92.1%', width: 92 },
      { label: 'First-time fix', value: '89.0%', width: 89 },
      { label: 'SLA adherence', value: '95.2%', width: 95 },
    ],
    contractDocs: [
      { title: 'MSA-2024-JCI-07 (Expired)', desc: 'expired 14 Apr 2026 · Life Safety Special Waiver', action: 'pdf' },
    ],
  },
  'grainger-industrial-supply': {
    slug: 'grainger-industrial-supply',
    name: 'Grainger Industrial Supply',
    code: 'VND-SUPP-0033',
    tier: 'TIER-3 · MRO SUPPLIES & HARDWARE',
    scope: 'MRO Hardware, Fasteners & Consumables',
    contact: 'B2B Corporate Account Desk',
    msa: 'MSA-CATALOG-BLANKET',
    exp: 'Continuous Renewal',
    status: 'ACTIVE',
    isExpired: false,
    sla: '94.0%',
    phone: '+62-21-5082-1111',
    openWork: [
      { id: 'PR-2026-0295', desc: 'Non-standard cordless power tool accessories', href: '/purchasing/PR-2026-0295', cta: 'Review PR', mono: true },
    ],
    perf: [
      { label: 'On-time arrival', value: '94.0%', width: 94 },
      { label: 'First-time fix', value: '95.0%', width: 95 },
      { label: 'SLA adherence', value: '94.0%', width: 94 },
    ],
    contractDocs: [
      { title: 'MSA-CATALOG-BLANKET', desc: 'Master corporate catalog terms', action: 'pdf' },
    ],
  },
};

function resolveVendor(slug: string): VendorMeta {
  if (KNOWN_VENDORS[slug]) return KNOWN_VENDORS[slug];
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    slug,
    name,
    code: `VND-GEN-${slug.slice(0, 4).toUpperCase()}`,
    tier: 'TIER-2 · MAINTENANCE SERVICE PROVIDER',
    scope: 'General Facility Maintenance & Specialized Services',
    contact: 'Vendor Operations Desk',
    msa: `MSA-2025-${slug.slice(0, 3).toUpperCase()}-01`,
    exp: 'Exp 31 Dec 2026',
    status: 'ACTIVE',
    isExpired: false,
    sla: '95.0%',
    phone: '+62-21-555-0199',
    openWork: [],
    perf: [
      { label: 'On-time arrival', value: '95.0%', width: 95 },
      { label: 'First-time fix', value: '92.0%', width: 92 },
      { label: 'SLA adherence', value: '95.0%', width: 95 },
    ],
    contractDocs: [
      { title: `MSA-2025-${slug.slice(0, 3).toUpperCase()}-01`, desc: 'Standard service level agreement', action: 'pdf' },
    ],
  };
}

/** Vendor Detail — universal dossier for all seeded & active vendors */
export function VendorDetail({ vendorSlug = CANON.vendorSlug }: { vendorSlug?: string }) {
  const vendor = resolveVendor(vendorSlug);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 8000);
  };

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/vendors">Vendors &amp; Contractors</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">{vendor.name}</span>
      </nav>

      {vendor.isExpired && (
        <div className="bg-fail-bg border border-fail rounded-lg p-4 flex items-center justify-between gap-4 text-fail-ink shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="shrink-0 text-fail" />
            <div>
              <p className="font-bold text-sm">CRITICAL: Master Service Agreement (MSA) Expired</p>
              <p className="text-xs">
                Contract expired on {vendor.exp}. Routine work dispatches are locked until renewal agreement is signed and endorsed by Legal &amp; VP Operations.
              </p>
            </div>
          </div>
          <AmendDialog push={push} triggerLabel="Initiate Urgent Renewal" />
        </div>
      )}

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card" aria-labelledby="v-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={vendor.isExpired ? 'fail' : 'pass'}>{vendor.tier}</Badge>
              <Badge variant={vendor.isExpired ? 'fail' : 'pass'}>{vendor.status}</Badge>
              <span className="apex-id text-xs text-muted font-bold">{vendor.code}</span>
            </div>
            <h1 id="v-title" className="text-2xl font-semibold tracking-tight">{vendor.name}</h1>
            <p className="text-[13px] text-muted">
              {vendor.scope} · MSA <span className="apex-id font-semibold text-ink">{vendor.msa}</span> · Contact: <strong>{vendor.contact}</strong>
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="inline-flex items-center gap-2">
                <Phone size={16} className="text-muted" />
                <span className="apex-label-caps text-muted">Priority Dispatch Line (24/7)</span>
                <strong className="apex-id">{vendor.phone}</strong>
              </span>
              <Button
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => push(true, 'Ringing dispatch desk', `${vendor.phone} · Direct dispatch line.`)}
              >
                Direct Ring
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <DispatchDialog push={push} />
            <PdfDialog />
            <AmendDialog push={push} />
            <CommendDialog push={push} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="apex-label-caps text-muted">Master Service Agreement lifecycle</span>
            <span className="apex-id text-muted">
              {vendor.isExpired ? 'Renewal Overdue · Dispatches Locked' : `Active · ${vendor.exp}`}
            </span>
          </div>
          <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden flex" role="img" aria-label="MSA Progress">
            <div className={cn('h-full', vendor.isExpired ? 'bg-fail w-full' : 'bg-pass w-3/4')} />
          </div>
          <div className="flex justify-between apex-id text-muted text-xs">
            <span>Executed</span>
            <span>Mid-term review ✓</span>
            <span className={vendor.isExpired ? 'text-fail font-bold' : ''}>{vendor.exp}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="open-h">
          <div className="flex items-center justify-between">
            <h2 id="open-h" className="text-base font-semibold">Open Work &amp; Linked Orders</h2>
            <span className="text-xs text-muted">{vendor.openWork.length} Records</span>
          </div>
          <ul className="flex flex-col divide-y divide-surface-subtle text-[13px]">
            {vendor.openWork.map((w) => (
              <li key={w.id} className="py-2.5 flex items-center justify-between gap-2">
                <span><span className="apex-id font-semibold text-cobalt">{w.id}</span> · {w.desc}</span>
                <Link className="text-cobalt font-semibold hover:underline shrink-0" href={w.href}>{w.cta}</Link>
              </li>
            ))}
            {vendor.openWork.length === 0 && (
              <li className="py-4 text-center text-muted text-xs">No active work orders or pending purchase requisitions.</li>
            )}
          </ul>
        </section>

        <section className="xl:col-span-5 bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="perf-h">
          <h2 id="perf-h" className="text-base font-semibold">Performance Scorecard · trailing 90d</h2>
          <ul className="flex flex-col gap-3 text-[13px]">
            {vendor.perf.map((p) => (
              <li key={p.label}>
                <div className="flex justify-between"><span className="text-muted">{p.label}</span><strong>{p.value}</strong></div>
                <div className="h-2 rounded-full bg-surface-subtle overflow-hidden mt-1">
                  <div className="h-full bg-pass" style={{ width: `${p.width}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="apex-id text-muted text-xs">Source: vendor scorecard · measured from completed work orders.</p>
        </section>
      </div>

      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-3 shadow-card" aria-labelledby="docs-h">
        <h2 id="docs-h" className="text-base font-semibold">Contract &amp; Compliance Documents</h2>
        <ul className="flex flex-col divide-y divide-surface-subtle text-[13px]">
          {vendor.contractDocs.map((doc, idx) => (
            <li key={idx} className="py-2.5 flex items-center justify-between gap-2">
              <span><strong>{doc.title}</strong> · {doc.desc}</span>
              {doc.action === 'pdf' && <PdfDialog triggerLabel="View PDF" />}
              {doc.action === 'amend' && <AmendDialog push={push} triggerLabel="Draft Amendment" />}
              {doc.action === 'link' && doc.href && (
                <Link className="text-cobalt font-semibold hover:underline" href={doc.href}>Open Entity →</Link>
              )}
            </li>
          ))}
        </ul>
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
