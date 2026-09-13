import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <EmptyState
      title={"Purchase {id}".replace('{id}', params.id)}
      description="PO detail + GRN + match. Seeded record: PO-2026-0298 (Trane Supply Co)."
      action={(<div className="flex gap-2"><Link href="/work-orders/WO-2026-0894"><Button variant="secondary">Open linked WO-2026-0894</Button></Link></div>)}
    />
  );
}
