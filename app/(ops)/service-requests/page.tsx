import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Service Requests"
      description="Triage hub + SLA <15m. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/service-requests/SR-2026-0894"><Button variant="secondary">Open SR-2026-0894</Button></Link></div>)}
    />
  );
}
