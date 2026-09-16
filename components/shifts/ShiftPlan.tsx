'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface Toast { id: number; ok: boolean; title: string; msg: string }
let toastSeq = 400;

interface HandoverRecord {
  id: string;
  shiftFrom: string;
  shiftTo: string;
  leadFrom: string;
  leadTo: string;
  time: string;
  status: 'ACCEPTED' | 'REJECTED' | 'STALE' | 'PENDING';
  itemsHandedOver: string;
  notes: string;
}

const HISTORIC_HANDOVERS: HandoverRecord[] = [
  {
    id: 'HND-2026-0523-B',
    shiftFrom: 'Shift B (Evening)',
    shiftTo: 'Shift C (Night)',
    leadFrom: 'David Chen',
    leadTo: 'Sarah Al-Mansoor',
    time: '2026-05-23 23:05 WIB',
    status: 'ACCEPTED',
    itemsHandedOver: '4 WOs, Cleanroom BMS telemetry nominal',
    notes: 'Cleanroom humidity sensor recalibrated at 21:00.',
  },
  {
    id: 'HND-2026-0523-A',
    shiftFrom: 'Shift A (Day)',
    shiftTo: 'Shift B (Evening)',
    leadFrom: 'Marcus Kowalski',
    leadTo: 'David Chen',
    time: '2026-05-23 15:10 WIB',
    status: 'ACCEPTED',
    itemsHandedOver: '2 WOs, 1 inspection completed',
    notes: 'No abnormal vibration detected on main chiller loop.',
  },
  {
    id: 'HND-2026-0522-B',
    shiftFrom: 'Shift B (Evening)',
    shiftTo: 'Shift C (Night)',
    leadFrom: 'Robert Langdon',
    leadTo: 'Sarah Al-Mansoor',
    time: '2026-05-22 23:25 WIB',
    status: 'REJECTED',
    itemsHandedOver: 'ELEC-TR-880 bushing kit incomplete',
    notes: 'LOTO padlock #4091 key missing from lockbox. Supervisor escalated.',
  },
];

/** Shift Plan — A→B handover with live acceptance, rejection dialog, and stale guard */
export function ShiftPlan() {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (ok: boolean, title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, ok, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  };

  const accept = () => {
    setStatus('accepted');
    push(true, 'Handover accepted', `${CANON.workOrderSeal} · active timer transferred to Shift B lead.`);
  };

  const reject = () => {
    if (!rejectReason.trim()) return;
    setStatus('rejected');
    setRejectOpen(false);
    push(false, 'Handover rejected', `Handover blocked: "${rejectReason.trim()}". Escalated to Ops Lead.`);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link className="text-muted hover:text-cobalt font-medium" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
          <span className="text-muted">/</span>
          <span className="font-semibold">Shift Plan · Operational Handover Protocol</span>
        </nav>
        <div className="flex gap-2">
          <Link href="/audit-trail?scope=shifts">
            <Button variant="secondary"><ShieldCheck size={16} /> Audit Ledger</Button>
          </Link>
          <Link href="/preventive-maintenance">
            <Button>PM Hub</Button>
          </Link>
        </div>
      </div>
      <p className="text-xs text-muted -mt-4">Site operational hours 07:00–23:00 WIB · Tenant {CANON.tenant} · Site: Padang Data Center Campus</p>

      {/* Handover Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shift A */}
        <section className="bg-card border-2 border-cobalt-deep rounded-lg p-4 flex flex-col gap-2" aria-label="Shift A">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shift A · OUTGOING</h2>
            <Badge variant="pass">ACTIVE</Badge>
          </div>
          <span className="apex-id font-bold">{CANON.shiftA.replace(' WIB', '')}</span>
          <ul className="text-sm flex flex-col gap-1">
            <li className="flex justify-between gap-2">
              <span><strong>{CANON.engineer}</strong> · Outgoing Lead</span>
              <span className="text-xs font-bold text-pass">CLOCKED IN</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>3 technicians · CUP-West</span>
              <span className="text-xs text-muted">active on site</span>
            </li>
          </ul>
          <div className="h-2 rounded-full bg-cobalt-tint overflow-hidden mt-1" role="img" aria-label="Shift A 88 percent elapsed">
            <div className="h-full bg-cobalt-deep" style={{ width: '88%' }} />
          </div>
          <p className="text-xs text-muted">88% elapsed · handover transfer window is OPEN</p>
        </section>

        {/* Shift B */}
        <section className="bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-2" aria-label="Shift B">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shift B · INCOMING</h2>
            <Badge variant="warn">STANDBY</Badge>
          </div>
          <span className="apex-id font-bold">15:30–23:00 WIB</span>
          <ul className="text-sm flex flex-col gap-1">
            <li className="flex justify-between gap-2">
              <span><strong>David Chen</strong> · Incoming Lead</span>
              <span className="text-xs font-bold text-warn">ON SITE (STBY)</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>2 technicians · CUP-West</span>
              <span className="text-xs text-muted">briefing complete</span>
            </li>
          </ul>
          <Link href="/field/audits" className="h-9 rounded bg-cobalt-tint text-cobalt-deep text-sm font-semibold inline-flex items-center justify-center mt-auto hover:bg-cobalt-light/20">
            Field Audits Companion →
          </Link>
        </section>

        {/* Handover Action Panel */}
        <section className="bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-2" aria-label="Shift handover queue">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Active Handover Queue</h2>
            {status === 'accepted' && <Badge variant="pass">HANDOVER ACCEPTED</Badge>}
            {status === 'rejected' && <Badge variant="fail">HANDOVER REJECTED</Badge>}
            {status === 'pending' && <Badge variant="warn">ACTION REQUIRED</Badge>}
          </div>

          <div className="rounded-lg border border-warn-dot bg-warn-bg p-3 flex flex-col gap-2">
            <div>
              <p className="font-semibold text-sm">
                <span className="apex-id">{CANON.workOrderSeal}</span> · Seal Replacement
              </p>
              <p className="text-xs text-warn-ink mt-0.5">
                Stopwatch active: 01:42:18 · LOTO #4092 key in cabinet · Step 04 torqued.
              </p>
            </div>

            <div className="flex gap-2 mt-1">
              {status === 'pending' && (
                <>
                  <Button className="flex-1" onClick={accept}>
                    Accept Handover
                  </Button>
                  <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Reject Shift Handover</DialogTitle>
                      <DialogDescription>
                        State the missing safety criteria, unverified LOTO, or documentation discrepancy.
                      </DialogDescription>
                      <label className="text-xs font-semibold" htmlFor="rej-reason">Discrepancy Reason</label>
                      <Input
                        id="rej-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Missing photo evidence on Step 04 torque check..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={reject}>Confirm Rejection</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {status === 'accepted' && (
                <div className="w-full text-xs font-semibold text-pass flex items-center justify-center gap-1.5 py-1">
                  <CheckCircle2 size={16} /> Handover signed off by Shift B lead (David Chen)
                </div>
              )}
              {status === 'rejected' && (
                <div className="w-full text-xs font-semibold text-fail flex items-center justify-center gap-1.5 py-1">
                  <XCircle size={16} /> Handover rejected. Outgoing technician must remain on duty.
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted" role="status">
            Handover window closes at 15:30 WIB. Stale handovers escalate automatically to Operations Director.
          </p>
        </section>
      </div>

      {/* Historical Handover Ledger */}
      <section className="bg-card border border-border-subtle rounded-lg p-5 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Shift Handover Audit History</h2>
            <p className="text-xs text-muted">Full accountability trail of shift transitions, LOTO lockbox handoffs, and active timers.</p>
          </div>
          <Badge variant="hold">AUDIT COMPLIANT</Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-surface text-muted">
              <tr className="border-b border-border-subtle">
                <th className="p-3 font-semibold">Handover ID</th>
                <th className="p-3 font-semibold">Shift Transition</th>
                <th className="p-3 font-semibold">Out / In Leads</th>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Handed Over Items</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {HISTORIC_HANDOVERS.map((h) => (
                <tr key={h.id} className="hover:bg-surface-subtle">
                  <td className="p-3 apex-id font-bold text-cobalt">{h.id}</td>
                  <td className="p-3 font-medium">{h.shiftFrom} → {h.shiftTo}</td>
                  <td className="p-3">{h.leadFrom} / {h.leadTo}</td>
                  <td className="p-3 apex-id">{h.time}</td>
                  <td className="p-3">{h.itemsHandedOver}</td>
                  <td className="p-3">
                    <Badge variant={h.status === 'ACCEPTED' ? 'pass' : h.status === 'REJECTED' ? 'fail' : 'warn'}>
                      {h.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted text-[11px]">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating Notifications */}
      <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 w-full max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={cn('rounded-lg shadow-modal p-3 flex gap-2 items-start text-sm border', t.ok ? 'bg-pass-bg border-pass text-pass-ink' : 'bg-fail-bg border-fail text-fail-ink')}>
            {t.ok ? <CheckCircle2 size={20} className="shrink-0 text-pass" /> : <AlertTriangle size={20} className="shrink-0 text-fail" />}
            <div><p className="font-bold">{t.title}</p><p className="text-xs">{t.msg}</p></div>
          </div>
        ))}
      </div>
    </>
  );
}
