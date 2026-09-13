import Link from 'next/link';
import { EmptyState } from '@/components/ops/EmptyState';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <EmptyState
      title="Preventive Maintenance"
      description="PM-PLN-0104 batch parent + 5000h rule. Full rebuild ships in wave 2."
      action={(<div className="flex gap-2"><Link href="/"><Button variant="secondary">Back to dashboard</Button></Link></div>)}
    />
  );
}
