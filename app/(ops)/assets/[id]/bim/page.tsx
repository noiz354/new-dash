import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <EmptyState
      title={"BIM · {id}".replace('{id}', params.id)}
      description="CUP Basement L2 schematic viewer. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/assets/AST-HVAC-004"><Button variant="secondary">Back to asset</Button></Link></div>)}
    />
  );
}
