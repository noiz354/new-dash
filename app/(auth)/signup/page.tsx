import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm';
import { getSessionContext } from '@/lib/auth/context';

/** Signup page — already-authenticated visitors go straight to the dashboard. */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const ctx = await getSessionContext();
  if (ctx) redirect('/');
  const { next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return <SignupForm redirectTo={safeNext} />;
}
