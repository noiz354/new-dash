import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { VendorDetail } from '@/components/vendors/VendorDetail';
import { CANON } from '@/lib/canon';

export function generateStaticParams() {
  return [{ id: CANON.vendorSlug }];
}

export default function VendorPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!/^[a-z0-9-]{3,40}$/.test(id)) notFound();
  if (id !== CANON.vendorSlug) {
    return (
      <EmptyState
        title={`Vendor ${id}`}
        description="Outside the vendor seed — full profile for this record ships in wave 2 (TODO Fase 2)."
        action={
          <Link href={`/vendors/${CANON.vendorSlug}`}>
            <Button>Open {CANON.vendorName} instead</Button>
          </Link>
        }
      />
    );
  }
  return <VendorDetail />;
}
