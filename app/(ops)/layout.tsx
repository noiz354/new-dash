import { redirect } from 'next/navigation';
import { OpsShell } from '@/components/ops/OpsShell';
import { RumInit } from '@/components/telemetry/RumInit';
import { getSessionContext } from '@/lib/auth/context';

/**
 * Ops shell guard (audit §6): server-side session verification against the
 * database on EVERY request — middleware's cookie check is only the cheap
 * first gate. Unauthenticated (or DB unavailable → fail closed) → /login.
 */
export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect('/login');
  return (
    <OpsShell
      user={{
        name: ctx.name,
        initials: ctx.initials,
        role: ctx.role,
        title: ctx.title,
        email: ctx.email,
        orgId: ctx.orgId,
        orgName: ctx.orgName,
      }}
    >
      <RumInit />
      {children}
    </OpsShell>
  );
}
