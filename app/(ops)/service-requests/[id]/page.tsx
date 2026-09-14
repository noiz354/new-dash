import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { ServiceRequestDetail } from '@/components/requests/ServiceRequestDetail';
import { CANON, ID_FORMATS } from '@/lib/canon';

export function generateStaticParams() {
  return [{ id: CANON.serviceRequest }, { id: 'SR-2026-0893' }, { id: 'SR-2026-0892' }];
}

export default async function ServiceRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ asset?: string }>;
}) {
  const { id } = await params;
  if (!ID_FORMATS.serviceRequest.test(id)) notFound();
  if (id !== CANON.serviceRequest) {
    return (
      <EmptyState
        title={`Service request ${id}`}
        description="Outside the triage seed — full ticket for this record ships in wave 2 (TODO Fase 2)."
        action={
          <Link href={`/service-requests/${CANON.serviceRequest}`}>
            <Button>Open {CANON.serviceRequest} instead</Button>
          </Link>
        }
      />
    );
  }
  const { asset } = await searchParams;
  const initialAsset = asset && ID_FORMATS.asset.test(asset) ? asset : CANON.assetSeal;
  return <ServiceRequestDetail initialAsset={initialAsset} />;
}
