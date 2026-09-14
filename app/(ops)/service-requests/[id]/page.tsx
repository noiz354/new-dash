import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ops/EmptyState';
import { ServiceRequestDetail } from '@/components/requests/ServiceRequestDetail';
import { getSessionContext } from '@/lib/auth/context';
import { can } from '@/lib/auth/rbac';
import { getDb } from '@/db/client';
import { getServiceRequest, listSrHistory } from '@/lib/services/sr-service';
import { getWorkOrder } from '@/lib/services/wo-service';
import { DomainError } from '@/lib/domain/errors';
import { ID_FORMATS } from '@/lib/canon';

/** SR detail — LIVE record for ANY seeded/created ticket (not just canon). */
export default async function ServiceRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!ctx) redirect('/login');

  // NOTE: deliberately EmptyState (HTTP 200) instead of notFound() — with the
  // segment's loading.tsx the shell is streamed before the page resolves, so a
  // thrown notFound() can no longer set the 404 status. Consistent with the
  // WO detail page's behavior.
  if (!ID_FORMATS.serviceRequest.test(id)) {
    return (
      <EmptyState
        title="Invalid ticket format"
        description={`"${id}" is not a service-request number (expected SR-YYYY-NNNN).`}
        action={<Link href="/service-requests"><Button>Back to Service Requests</Button></Link>}
      />
    );
  }

  const db = getDb();
  let sr;
  try {
    sr = await getServiceRequest(db, ctx, id);
  } catch (err) {
    if (err instanceof DomainError && err.status === 404) {
      return (
        <EmptyState
          title={`Service request ${id} not found`}
          description="This ticket does not exist in your organization's database (cross-tenant reads are denied as 404). Run npm run db:setup if the dev database was wiped."
          action={<Link href="/service-requests"><Button>Back to Service Requests</Button></Link>}
        />
      );
    }
    throw err;
  }

  const [history, wo] = await Promise.all([
    listSrHistory(db, ctx, id),
    sr.convertedWoNumber
      ? getWorkOrder(db, ctx, sr.convertedWoNumber).catch((err) => {
          if (err instanceof DomainError && err.status === 404) return null;
          throw err;
        })
      : Promise.resolve(null),
  ]);

  return (
    <ServiceRequestDetail
      sr={sr}
      history={history}
      wo={wo}
      can={{ transition: can(ctx.role, 'sr.transition') }}
    />
  );
}
