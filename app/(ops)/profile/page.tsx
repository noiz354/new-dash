import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Profile & Sessions"
      description="Sessions + revoke confirm + impersonate banner. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/organization"><Button variant="secondary">Open Org & RBAC</Button></Link></div>)}
    />
  );
}
