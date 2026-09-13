import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <EmptyState
      title={"Vendor {id}".replace('{id}', params.id)}
      description="MSA-2024-TRN-09 ACTIVE 312d. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/purchasing/PO-2026-0298"><Button variant="secondary">Open PO-2026-0298</Button></Link></div>)}
    />
  );
}
