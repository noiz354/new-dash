import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Vendors & Contractors"
      description="Tier-1 registry. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/vendors/trane-technologies"><Button variant="secondary">Open Trane Technologies</Button></Link></div>)}
    />
  );
}
