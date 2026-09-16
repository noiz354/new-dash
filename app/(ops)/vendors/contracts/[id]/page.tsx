import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, ShieldAlert, ShieldCheck, Download, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CANON } from '@/lib/canon';

export function generateStaticParams() {
  return [
    { id: CANON.msa },
    { id: 'MSA-2023-ABB-02' },
    { id: 'MSA-2025-SIE-11' },
    { id: 'MSA-2024-JCI-07' },
    { id: 'MSA-CATALOG-BLANKET' },
  ];
}

interface ContractRecord {
  id: string;
  vendorName: string;
  vendorSlug: string;
  scope: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RENEWAL_OVERDUE' | 'AMENDMENT_PENDING';
  executedDate: string;
  expirationDate: string;
  daysRemaining: number;
  slaAdherence: string;
  pageCount: number;
  signatories: { name: string; title: string; date: string; status: 'SIGNED' | 'PENDING' }[];
  amendments: { id: string; title: string; effectiveDate: string; status: string }[];
  auditHash: string;
}

const CONTRACTS: Record<string, ContractRecord> = {
  [CANON.msa]: {
    id: CANON.msa,
    vendorName: CANON.vendorName,
    vendorSlug: CANON.vendorSlug,
    scope: 'Centrifugal Chillers, R-134a Overhaul & 24/7 Priority Field Dispatch',
    status: 'ACTIVE',
    executedDate: '12 Mar 2024',
    expirationDate: '31 Dec 2026',
    daysRemaining: CANON.msaDaysLeft,
    slaAdherence: '98.1% (Tier-1 SLA Target: 95.0%)',
    pageCount: 28,
    signatories: [
      { name: 'Marcus Vance', title: 'VP Operations & Facilities', date: '12 Mar 2024 13:52 WIB', status: 'SIGNED' },
      { name: 'Robert Langdon', title: 'Trane OEM Resident Engineer', date: '12 Mar 2024 14:15 WIB', status: 'SIGNED' },
      { name: 'Legal Counsel', title: 'Enterprise Procurement Guardian', date: '12 Mar 2024 14:30 WIB', status: 'SIGNED' },
    ],
    amendments: [
      { id: 'AMD-2025-A1', title: 'Rate Card 2025 Adjustment (Refrigerant Surcharge)', effectiveDate: '01 Jan 2025', status: 'ACTIVE' },
      { id: 'AMD-2026-B1', title: 'Emergency Response SLA Guarantee (4h → 2h window)', effectiveDate: '01 May 2026', status: 'UNDER REVIEW' },
    ],
    auditHash: '0x992fa10e44b82109',
  },
  'MSA-2023-ABB-02': {
    id: 'MSA-2023-ABB-02',
    vendorName: 'ABB Grid Power & Automation',
    vendorSlug: 'abb-grid-power-automation',
    scope: '13.8kV Switchgear, High-Voltage Transformers & Substation SCADA Integration',
    status: 'EXPIRED',
    executedDate: '15 Mar 2023',
    expirationDate: '15 Mar 2026',
    daysRemaining: -185,
    slaAdherence: '96.8% (Target: 95.0%)',
    pageCount: 34,
    signatories: [
      { name: 'Marcus Vance', title: 'VP Operations & Facilities', date: '15 Mar 2023 10:00 WIB', status: 'SIGNED' },
      { name: 'ABB Regional Director', title: 'Grid Services Division', date: '15 Mar 2023 11:30 WIB', status: 'SIGNED' },
    ],
    amendments: [
      { id: 'AMD-2026-RENEWAL', title: '2026 Master Service Agreement Comprehensive Renewal', effectiveDate: 'Pending Execution', status: 'ESCALATED' },
    ],
    auditHash: '0x7711ab44ef091102',
  },
  'MSA-2025-SIE-11': {
    id: 'MSA-2025-SIE-11',
    vendorName: 'Siemens Building Technologies',
    vendorSlug: 'siemens-building-technologies',
    scope: 'Desigo CC BMS, Cleanroom HVAC Actuators & Pressure Cascade Controls',
    status: 'ACTIVE',
    executedDate: '01 Dec 2025',
    expirationDate: '30 Nov 2027',
    daysRemaining: 440,
    slaAdherence: '99.1% (Target: 98.0%)',
    pageCount: 42,
    signatories: [
      { name: 'David Chen', title: 'Facilities Engineering Manager', date: '01 Dec 2025', status: 'SIGNED' },
      { name: 'Marcus Gallagher', title: 'Siemens Account Executive', date: '01 Dec 2025', status: 'SIGNED' },
    ],
    amendments: [],
    auditHash: '0x33b1e988cf012288',
  },
};

function resolveContract(id: string): ContractRecord {
  if (CONTRACTS[id]) return CONTRACTS[id];
  return {
    id,
    vendorName: 'General Contractor Services',
    vendorSlug: 'grainger-industrial-supply',
    scope: 'MRO Facilities Maintenance & Spare Parts Supply',
    status: 'ACTIVE',
    executedDate: '01 Jan 2025',
    expirationDate: '31 Dec 2026',
    daysRemaining: 106,
    slaAdherence: '95.0%',
    pageCount: 16,
    signatories: [
      { name: 'Operations Lead', title: 'Facilities Ops', date: '01 Jan 2025', status: 'SIGNED' },
    ],
    amendments: [],
    auditHash: '0x1122334455667788',
  };
}

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = resolveContract(id);
  const isExpired = contract.status === 'EXPIRED' || contract.daysRemaining <= 0;

  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/vendors">Vendors</Link>
        <span className="text-muted">/</span>
        <Link className="text-muted hover:text-cobalt font-medium" href={`/vendors/${contract.vendorSlug}`}>{contract.vendorName}</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold apex-id">{contract.id}</span>
      </nav>

      {isExpired && (
        <div className="bg-fail-bg border border-fail rounded-lg p-4 flex items-center justify-between gap-4 text-fail-ink shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="shrink-0 text-fail" />
            <div>
              <p className="font-bold text-sm">CRITICAL: Contract Agreement Expired</p>
              <p className="text-xs">
                This Master Service Agreement expired on {contract.expirationDate}. Automatic dispatch locks are active. New work orders require an emergency waiver.
              </p>
            </div>
          </div>
          <Link href={`/vendors/${contract.vendorSlug}`}>
            <Button variant="destructive">Initiate Renewal Protocol</Button>
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isExpired ? 'fail' : 'pass'}>{contract.status}</Badge>
              <Badge variant="info">LEGAL ARTIFACT</Badge>
              <span className="text-xs font-mono text-muted">{contract.pageCount} Pages Executed</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">{contract.id}</h1>
            <p className="text-sm text-muted">
              Master Service Agreement with <Link href={`/vendors/${contract.vendorSlug}`} className="text-cobalt font-semibold hover:underline">{contract.vendorName}</Link>
            </p>
            <p className="text-xs text-muted mt-1">{contract.scope}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/vendors/${contract.vendorSlug}`}>
              <Button variant="secondary"><ArrowLeft size={16} /> Back to Vendor Profile</Button>
            </Link>
            <Link href={`/audit-trail?search=${contract.auditHash}`}>
              <Button><ShieldCheck size={16} /> Forensic Signature Audit</Button>
            </Link>
          </div>
        </div>

        {/* 4 KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-surface p-3 rounded border border-border-subtle flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Executed Date</span>
            <span className="text-base font-bold text-ink">{contract.executedDate}</span>
            <span className="text-[11px] text-muted">Signed &amp; Notarized</span>
          </div>
          <div className="bg-surface p-3 rounded border border-border-subtle flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Expiration Date</span>
            <span className="text-base font-bold text-ink">{contract.expirationDate}</span>
            <span className={isExpired ? 'text-[11px] text-fail font-bold' : 'text-[11px] text-pass font-bold'}>
              {isExpired ? 'EXPIRED' : `${contract.daysRemaining} days remaining`}
            </span>
          </div>
          <div className="bg-surface p-3 rounded border border-border-subtle flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Historical SLA Adherence</span>
            <span className="text-base font-bold text-ink">{contract.slaAdherence}</span>
            <span className="text-[11px] text-pass font-medium">Exceeds contract baseline</span>
          </div>
          <div className="bg-surface p-3 rounded border border-border-subtle flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Cryptographic Proof</span>
            <span className="text-base font-mono font-bold text-cobalt truncate">{contract.auditHash}</span>
            <span className="text-[11px] text-muted">Immutable Merkle Proof</span>
          </div>
        </div>
      </section>

      {/* Grid: Signatories & Amendments */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Signatories */}
        <section className="xl:col-span-6 bg-card border border-border-subtle rounded-lg p-5 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-pass" /> Authorized Signatories &amp; Quorum
            </h2>
            <Badge variant="pass">QUORUM SATISFIED</Badge>
          </div>

          <ul className="flex flex-col divide-y divide-border-subtle text-xs">
            {contract.signatories.map((sig, idx) => (
              <li key={idx} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <strong className="text-ink block text-sm">{sig.name}</strong>
                  <span className="text-muted">{sig.title}</span>
                </div>
                <div className="text-right">
                  <Badge variant={sig.status === 'SIGNED' ? 'pass' : 'warn'}>{sig.status}</Badge>
                  <span className="text-[10px] text-muted font-mono block mt-0.5">{sig.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Right Column: Amendments */}
        <section className="xl:col-span-6 bg-card border border-border-subtle rounded-lg p-5 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Edit3 size={18} className="text-cobalt" /> Contract Amendments &amp; Addendums
            </h2>
            <span className="text-xs text-muted">{contract.amendments.length} Recorded</span>
          </div>

          <ul className="flex flex-col divide-y divide-border-subtle text-xs">
            {contract.amendments.map((amd, idx) => (
              <li key={idx} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <span className="apex-id font-bold text-cobalt block">{amd.id}</span>
                  <strong className="text-ink">{amd.title}</strong>
                  <span className="text-[11px] text-muted block mt-0.5">Effective: {amd.effectiveDate}</span>
                </div>
                <Badge variant={amd.status === 'ACTIVE' ? 'pass' : 'warn'}>{amd.status}</Badge>
              </li>
            ))}
            {contract.amendments.length === 0 && (
              <li className="py-4 text-center text-muted">No amendments recorded on this agreement.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
