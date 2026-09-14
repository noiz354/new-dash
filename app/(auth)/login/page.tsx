import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getSessionContext } from '@/lib/auth/context';

/** Login page — already-authenticated visitors go straight to the dashboard. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const ctx = await getSessionContext();
  if (ctx) redirect('/');
  const { next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return <LoginForm redirectTo={safeNext} />;
}
