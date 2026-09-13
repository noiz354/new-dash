import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <EmptyState
      title={"Finding {id}".replace('{id}', params.id)}
      description="FND-2026-0188 conversion source. Field rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/work-orders/WO-2026-0894"><Button variant="secondary">Open WO-2026-0894</Button></Link></div>)}
    />
  );
}
