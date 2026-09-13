import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Purchasing & POs"
      description="PR/PO/GRN + 3-Way Match. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/purchasing/PO-2026-0298"><Button variant="secondary">Open PO-2026-0298</Button></Link></div>)}
    />
  );
}
