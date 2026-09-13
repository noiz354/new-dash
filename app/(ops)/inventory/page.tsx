import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Inventory & Parts Ledger"
      description="CRIB-B / Bay 01 + Idempotency-Key posting. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/work-orders/WO-2026-0894"><Button variant="secondary">Open WO-2026-0894 ledger</Button></Link></div>)}
    />
  );
}
