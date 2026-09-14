import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { AssetDetail } from '@/components/assets/AssetDetail';
import { CANON, ID_FORMATS } from '@/lib/canon';

export function generateStaticParams() {
  return [{ id: CANON.assetSeal }, { id: 'AST-PUMP-101' }, { id: 'AST-GEN-001' }];
}

export default function AssetPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!ID_FORMATS.asset.test(id)) notFound();
  if (id !== CANON.assetSeal) {
    return (
      <EmptyState
        title={`Asset ${id}`}
        description="Outside the asset seed — full ledger for this record ships in wave 2 (TODO Fase 2)."
        action={
          <Link href={`/assets/${CANON.assetSeal}`}>
            <Button>Open {CANON.assetSeal} instead</Button>
          </Link>
        }
      />
    );
  }
  return <AssetDetail assetId={id} />;
}
