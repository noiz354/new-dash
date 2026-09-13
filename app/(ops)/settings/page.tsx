import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Settings & System Config"
      description="Secrets shown last4 only (C21). Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/profile"><Button variant="secondary">Open profile</Button></Link></div>)}
    />
  );
}
