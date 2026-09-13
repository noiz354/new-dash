import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <EmptyState
      title={"Service Request {id}".replace('{id}', params.id)}
      description="SR detail + conversion result. Seeded record: SR-2026-0894 → WO-2026-0894."
      action={(<div className="flex gap-2"><Link href="/work-orders/WO-2026-0894"><Button variant="secondary">Open converted WO-2026-0894</Button></Link></div>)}
    />
  );
}
