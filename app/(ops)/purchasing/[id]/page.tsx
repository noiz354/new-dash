import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { PurchaseDetail, type PurchaseTab } from '@/components/purchasing/PurchaseDetail';
import { CANON } from '@/lib/canon';

export function generateStaticParams() {
  return [{ id: CANON.purchaseOrder }, { id: 'PO-2026-0302' }, { id: 'PO-2026-0285' }];
}

const TABS: PurchaseTab[] = ['review', 'receiving', 'match', 'signatures'];

export default async function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  if (!/^PO-\d{4}-\d{4}$/.test(id)) notFound();
  if (id !== CANON.purchaseOrder) {
    return (
      <EmptyState
        title={`Purchase ${id}`}
        description="Outside the purchasing seed — full dossier for this record ships in wave 2 (TODO Fase 2)."
        action={
          <Link href={`/purchasing/${CANON.purchaseOrder}`}>
            <Button>Open {CANON.purchaseOrder} instead</Button>
          </Link>
        }
      />
    );
  }
  const { tab } = await searchParams;
  const initialTab: PurchaseTab = TABS.includes(tab as PurchaseTab) ? (tab as PurchaseTab) : 'review';
  return <PurchaseDetail initialTab={initialTab} />;
}
