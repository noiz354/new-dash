'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { CANON } from '@/lib/canon';
import { cn } from '@/lib/utils';

interface Session { id: string; label: string; current?: boolean; meta?: string }
const SESSIONS: Session[] = [
  { id: 'sess-dispatch-01', label: 'Dispatch Console · Chrome', current: true, meta: '10.14.0.21 · current · since 07:02 WIB' },
  { id: 'sess-field-tab-07', label: 'Rugged Tablet-07', meta: `field · ${CANON.inspection} run attached` },
  { id: 'sess-SSO-02', label: 'SSO token · Analytics', meta: 'expires 16:00 WIB' },
];

interface Toast { id: number; title: string; msg: string }
let toastSeq = 500;

/**
 * Profile & Sessions — L2 port (reference: web/user-profile.html).
 * [ASUMSI-OTOMATIS] Profil = Marcus Vance (persona header desktop H1/M1/M2).
 */
export function ProfileSessions() {
  const [sessions, setSessions] = useState(SESSIONS);
  const [sessState, setSessState] = useState('3 sessions · revoke requires confirmation.');
  const [impersonating, setImpersonating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (title: string, msg: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t, { id, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 7000);
  };

  const revoke = (id: string) => {
    setSessions((s) => s.filter((x) => x.id !== id));
    setSessState(`Revoked ${id} · remaining sessions stay valid.`);
    push('Session revoked', id);
  };

  return (
    <>
      {impersonating && (
        <div className="no-print fixed top-7 left-0 right-0 z-[95] bg-warn-ink text-white text-sm font-semibold text-center py-2">
          IMPERSONATING Field Tech — actions are audit-chained ·{' '}
          <button type="button" className="underline font-bold" onClick={() => setImpersonating(false)}>Exit</button>
        </div>
      )}

      <div className="no-print max-w-[900px] w-full flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link className="text-muted hover:text-cobalt font-medium" href={`/work-orders/${CANON.workOrderSeal}`}>{CANON.workOrderSeal}</Link>
          <span className="text-muted">/</span>
          <span className="font-semibold text-xl tracking-tight">Profile &amp; Sessions</span>
        </nav>

        <section className="bg-card border border-border-subtle rounded-lg p-5 flex flex-wrap items-center gap-4" aria-label="Identity">
          <span className="w-16 h-16 rounded-full bg-cobalt-deep text-white text-xl font-bold flex items-center justify-center">{CANON.sessionInitials}</span>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-lg font-semibold">{CANON.sessionUser}</h2>
            <p className="text-sm text-muted">{CANON.sessionRole} · <span className="apex-id">{CANON.sessionEmail}</span> · RFID-7714</p>
            <p className="text-sm text-muted">Role: <strong className="text-ink">Ops Admin</strong> (1 of {CANON.roles} Roles) · Shift A · Tenant {CANON.tenant}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              <BadgeCheck size={16} /> Print Badge QR
            </Button>
            <Link href="/organization">
              <Button variant="secondary">Open Org &amp; RBAC</Button>
            </Link>
          </div>
        </section>

        <section className="bg-card border border-border-subtle rounded-lg p-5 flex flex-col gap-3" aria-labelledby="sess-h">
          <div className="flex items-center justify-between">
            <h2 id="sess-h" className="font-semibold">Active Sessions</h2>
            <span className="text-xs text-muted">Demo identity · simulated MFA · SCIM v2.4 (mock)</span>
          </div>
          <ul className="flex flex-col divide-y divide-surface-subtle text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>{s.label}</strong> · {s.meta}{' '}
                  {s.current && <span className="text-xs text-pass font-bold">THIS DEVICE</span>}
                </span>
                {!s.current ? (
                  <ConfirmDialog
                    title="Revoke this session?"
                    description={`${s.id} — the device is signed out immediately. Field drafts stay in its local outbox.`}
                    confirmLabel="Revoke Now"
                    onConfirm={() => revoke(s.id)}
                  >
                    <button type="button" className="h-8 px-3 rounded bg-fail-bg text-fail border border-[#FECACA] text-xs font-bold hover:bg-fail hover:text-white">
                      Revoke Session
                    </button>
                  </ConfirmDialog>
                ) : (
                  <span className="text-xs text-muted">protected</span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted" role="status">{sessState}</p>
        </section>

        <section className="bg-card border border-border-subtle rounded-lg p-5 flex flex-col gap-3" aria-label="API access">
          <h2 className="font-semibold">API Access</h2>
          <p className="text-sm text-muted">
            Production key <span className="apex-id font-bold text-ink">…9fb4</span> (last4 only — full secret rotated at seeding per C21, never displayed).
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => push('Rotation started', 'New key reveals once — old key valid 15 min overlap.')}>
              Rotate Key
            </Button>
            <Link href="/settings">
              <Button variant="secondary">Open Settings</Button>
            </Link>
          </div>
        </section>

        <section className="bg-card border-2 border-warn-dot rounded-lg p-5 flex flex-col gap-2" aria-label="Impersonation">
          <h2 className="font-semibold">Audit Impersonate</h2>
          <p className="text-sm text-muted">View the app as a technician for support. Every impersonated action is bannered + audit-chained.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setImpersonating(true); push('Impersonating', 'Field Tech view · banner + audit chain on.'); }}
              className="h-9 px-4 rounded bg-warn-bg border border-warn-dot text-warn-ink text-sm font-bold"
            >
              Impersonate Field Tech
            </button>
            <Link href="/audit-trail" className="h-9 px-4 rounded bg-cobalt-tint text-sm font-semibold inline-flex items-center">
              Verify in Audit Trail
            </Link>
          </div>
        </section>
      </div>

      {/* L3: badge print view — screen-hidden, print-only */}
      <section className="only-print p-8 bg-white text-black flex-col items-center gap-2 text-center" aria-label="Badge print view">
        <svg className="h-10 w-auto" viewBox="0 0 160 40" fill="none" role="img" aria-label="Apex Ops logo">
          <rect width="36" height="36" rx="8" fill="#1E40AF" />
          <path d="M18 8L27 24H9L18 8Z" stroke="#60A5FA" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="18" cy="20" r="2.5" fill="#FFFFFF" />
          <path d="M12 28H24" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          <text x="44" y="23" fontFamily="system-ui" fontWeight="700" fontSize="15" fill="#0F172A">APEXOPS</text>
        </svg>
        <h2 className="text-xl font-bold">{CANON.sessionUser}</h2>
        <p className="text-sm">{CANON.sessionRole} · RFID-7714 · {CANON.tenant}</p>
        <svg width="120" height="120" viewBox="0 0 25 25" role="img" aria-label="Badge QR code">
          <rect width="25" height="25" fill="#fff" />
          <g fill="#000">
            <rect x="1" y="1" width="7" height="7" /><rect x="3" y="3" width="3" height="3" fill="#fff" />
            <rect x="17" y="1" width="7" height="7" /><rect x="19" y="3" width="3" height="3" fill="#fff" />
            <rect x="1" y="17" width="7" height="7" /><rect x="3" y="19" width="3" height="3" fill="#fff" />
            <rect x="10" y="4" width="2" height="2" /><rect x="13" y="7" width="2" height="2" />
            <rect x="10" y="10" width="2" height="2" /><rect x="4" y="11" width="2" height="2" />
            <rect x="14" y="12" width="2" height="2" /><rect x="18" y="11" width="2" height="2" />
            <rect x="11" y="15" width="2" height="2" /><rect x="15" y="17" width="2" height="2" />
            <rect x="20" y="18" width="2" height="2" /><rect x="12" y="20" width="2" height="2" />
            <rect x="17" y="21" width="2" height="2" />
          </g>
        </svg>
        <p className="text-xs font-mono">SK · RFID-7714 · Shift A · {CANON.shiftA}</p>
      </section>

      <div className="no-print fixed bottom-4 right-4 z-[90] flex flex-col gap-2 w-full max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={cn('rounded-lg shadow-modal p-3 flex gap-2 items-start text-sm bg-pass-bg border border-pass text-pass-ink')}>
            <CheckCircle2 size={20} className="shrink-0" />
            <div className="flex-1"><p className="font-bold">{t.title}</p><p className="text-xs">{t.msg}</p></div>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
