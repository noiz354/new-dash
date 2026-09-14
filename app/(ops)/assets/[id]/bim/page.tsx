import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { AssetBim } from '@/components/assets/AssetBim';
import { CANON, ID_FORMATS } from '@/lib/canon';

export function generateStaticParams() {
  return [{ id: CANON.assetSeal }];
}

export default function AssetBimPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!ID_FORMATS.asset.test(id)) notFound();
  if (id !== CANON.assetSeal) {
    return (
      <EmptyState
        title={`BIM · ${id}`}
        description="Outside the asset seed — schematic for this record ships in wave 2 (TODO Fase 2)."
        action={
          <Link href={`/assets/${CANON.assetSeal}/bim`}>
            <Button>Open {CANON.assetSeal} BIM instead</Button>
          </Link>
        }
      />
    );
  }
  return <AssetBim assetId={id} />;
}
