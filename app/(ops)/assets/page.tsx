import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Asset Registry"
      description="Lifecycle ledger. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/assets/AST-HVAC-004"><Button variant="secondary">Open AST-HVAC-004</Button></Link></div>)}
    />
  );
}
