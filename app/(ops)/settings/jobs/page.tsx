import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Database, RefreshCw, RotateCcw, ShieldAlert, Trash2, KeyRound, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MaintenanceJob {
  id: string;
  type: 'BACKUP_SNAPSHOT' | 'RESTORE_SIMULATION' | 'SEED_RESET' | 'DATA_PURGE' | 'CREDENTIAL_ROTATION' | 'VACUUM_ANALYZE';
  title: string;
  initiatedBy: string;
  startedAt: string;
  duration: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'ROLLED_BACK';
  details: string;
  targetScope: string;
  auditHash: string;
}

const JOBS: MaintenanceJob[] = [
  {
    id: 'JOB-2026-089',
    type: 'CREDENTIAL_ROTATION',
    title: 'FIDO2 / MFA Security Key Re-enrollment',
    initiatedBy: 'Marcus Vance (VP Ops)',
    startedAt: 'Today at 14:05 WIB',
    duration: '1.2s',
    status: 'COMPLETED',
    details: 'MFA key rotated for user m.vance@apexops.io. Session tickets invalidated across 2 devices.',
    targetScope: 'Security & Auth Keys',
    auditHash: '0x8f2c31e9a441b80d',
  },
  {
    id: 'JOB-2026-088',
    type: 'RESTORE_SIMULATION',
    title: 'Point-in-Time Restore Simulation (S3 Vault)',
    initiatedBy: 'David Chen (Engineering Lead)',
    startedAt: 'Today at 11:30 WIB',
    duration: '42.8s',
    status: 'COMPLETED',
    details: 'Snapshot 2026-05-24 02:00:14 UTC validated in sandboxed tenant. RTO measured at 11 minutes; 0 data rows touched.',
    targetScope: 's3://apex-backup-us-east-prod-wal/',
    auditHash: '0x33b1e948fcd07721',
  },
  {
    id: 'JOB-2026-087',
    type: 'BACKUP_SNAPSHOT',
    title: 'Scheduled S3 Glacier Deep Archive Snapshot',
    initiatedBy: 'System Cron (Postgres Daemon)',
    startedAt: '2026-05-24 02:00:14 UTC',
    duration: '3m 14s',
    status: 'COMPLETED',
    details: 'Full compressed volume: 842.6 MB (SHA-256 verified). Checksum matching root tree consensus.',
    targetScope: 'Production Database (PostgreSQL 16)',
    auditHash: '0x992b1a03f44e12da',
  },
  {
    id: 'JOB-2026-086',
    type: 'VACUUM_ANALYZE',
    title: 'PostgreSQL Auto-Vacuum & B-Tree Index Rebalance',
    initiatedBy: 'Database Engine Daemon',
    startedAt: '2026-05-23 23:00:00 UTC',
    duration: '1m 45s',
    status: 'COMPLETED',
    details: 'Reclaimed 48.2 MB of dead tuples. Query planner statistics refreshed for work_orders, service_requests, and audit_events.',
    targetScope: 'All Tables (Schema Public)',
    auditHash: '0x4471e988ab29c001',
  },
  {
    id: 'JOB-2026-085',
    type: 'DATA_PURGE',
    title: 'Ephemeral Telemetry Retention Expiry Purge',
    initiatedBy: 'Retention Policy Worker',
    startedAt: '2026-05-23 04:00:00 UTC',
    duration: '12.4s',
    status: 'COMPLETED',
    details: 'Removed 184,200 ephemeral Modbus sensor pings older than 90 days. Summary aggregates preserved.',
    targetScope: 'Sensor Telemetry Buffer',
    auditHash: '0xaa812399cf10e823',
  },
  {
    id: 'JOB-2026-084',
    type: 'SEED_RESET',
    title: 'Development Tenant Fixture Re-seed',
    initiatedBy: 'DevOps CI/CD Automation',
    startedAt: '2026-05-22 18:45:00 UTC',
    duration: '8.1s',
    status: 'COMPLETED',
    details: 'Database seeded with canonical demo fixtures: Chiller #4 seal emergency, P1 dispatch, and 148 personnel profiles.',
    targetScope: 'Tenant dev-sandbox-01',
    auditHash: '0x712fae498c001192',
  },
];

export default function SettingsJobsPage() {
  return (
    <>
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link className="text-muted hover:text-cobalt font-medium" href="/settings">Settings &amp; Configuration</Link>
        <span className="text-muted">/</span>
        <span className="font-semibold">System Jobs &amp; Maintenance History</span>
      </nav>

      {/* Hero Header */}
      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="pass">DAEMON OPERATIONAL</Badge>
              <Badge variant="info">SOC2 AUDIT READY</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Maintenance &amp; Job Execution History</h1>
            <p className="text-sm text-muted">
              Forensic execution log of all administrative actions: database backups, point-in-time restores, seed resets, data purges, and cryptographic rotations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/settings">
              <Button variant="secondary"><ArrowLeft size={16} /> Back to Settings</Button>
            </Link>
            <Link href="/audit-trail?scope=settings">
              <Button><ShieldAlert size={16} /> Audit Trail Cross-Check</Button>
            </Link>
          </div>
        </div>

        {/* 4 Bento KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="rounded border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Total Jobs (30D)</span>
            <span className="text-xl font-bold tabular-nums">482</span>
            <span className="text-[11px] text-muted">100% Success Rate</span>
          </div>
          <div className="rounded border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Latest Snapshot RTO</span>
            <span className="text-xl font-bold text-pass tabular-nums">11 min</span>
            <span className="text-[11px] text-muted">Target SLA &lt; 30 min</span>
          </div>
          <div className="rounded border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Cold S3 Storage</span>
            <span className="text-xl font-bold tabular-nums">842.6 MB</span>
            <span className="text-[11px] text-muted">Encrypted AES-256</span>
          </div>
          <div className="rounded border border-border-subtle bg-surface p-3 flex flex-col gap-0.5">
            <span className="apex-label-caps text-muted">Next Scheduled Backup</span>
            <span className="text-xl font-bold tabular-nums text-cobalt">02:00 UTC</span>
            <span className="text-[11px] text-muted">Daily Full Automated WAL</span>
          </div>
        </div>
      </section>

      {/* Jobs Table */}
      <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Executed Administrative Jobs</h2>
          <span className="text-xs text-muted">Showing 6 recorded executions</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-surface text-muted">
              <tr className="border-b border-border-subtle">
                <th className="p-3 font-semibold">Job ID &amp; Type</th>
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold">Target Scope</th>
                <th className="p-3 font-semibold">Initiated By</th>
                <th className="p-3 font-semibold">Timestamp / Duration</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Audit Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {JOBS.map((j) => (
                <tr key={j.id} className="hover:bg-surface-subtle">
                  <td className="p-3">
                    <span className="apex-id font-bold text-cobalt block">{j.id}</span>
                    <Badge variant="outline" className="mt-0.5 text-[10px]">{j.type}</Badge>
                  </td>
                  <td className="p-3">
                    <strong className="text-ink block">{j.title}</strong>
                    <span className="text-muted text-[11px]">{j.details}</span>
                  </td>
                  <td className="p-3 apex-id text-muted font-medium">{j.targetScope}</td>
                  <td className="p-3">{j.initiatedBy}</td>
                  <td className="p-3">
                    <span className="block">{j.startedAt}</span>
                    <span className="text-muted text-[11px]">Duration: {j.duration}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={j.status === 'COMPLETED' ? 'pass' : j.status === 'RUNNING' ? 'info' : 'fail'}>
                      {j.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <span className="apex-id text-[11px] font-mono text-muted block">{j.auditHash}</span>
                    <Link href={`/audit-trail?search=${j.id}`} className="text-cobalt text-[11px] font-semibold hover:underline">
                      Inspect Chain →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
