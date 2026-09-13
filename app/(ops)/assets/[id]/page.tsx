import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <EmptyState
      title={"Asset {id}".replace('{id}', params.id)}
      description="Asset ledger + spares. Seeded record: AST-HVAC-004 (Trane, 68 NEEDS OVERHAUL)."
      action={(<div className="flex gap-2"><Link href="/assets/AST-HVAC-004/bim"><Button variant="secondary">Open BIM viewer</Button></Link></div>)}
    />
  );
}
