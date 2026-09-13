import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Organization & RBAC"
      description="6 Roles + Shift A 07:00–15:30 WIB. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/"><Button variant="secondary">Back to dashboard</Button></Link></div>)}
    />
  );
}
