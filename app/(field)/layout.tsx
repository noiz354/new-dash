import { redirect } from 'next/navigation';
import { FieldShell } from '@/components/field/FieldShell';
import { getSessionContext } from '@/lib/auth/context';

/** Field shell guard — same server-side session enforcement as (ops). */
export default async function FieldLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getSessionContext();
  if (!ctx) redirect('/login');
  return <FieldShell>{children}</FieldShell>;
}
