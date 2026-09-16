import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import {
  createCheckoutSession,
  getOrganizationSubscription,
  type PlanType,
} from '@/lib/services/billing-service';

const CheckoutSchema = z.object({
  plan: z.enum(['COMMUNITY', 'GROWTH', 'ENTERPRISE']),
  successUrl: z.string().url().optional(),
});

/** GET /api/billing — current tenant subscription & entitlement limits */
export async function GET(req: NextRequest) {
  return withRoute({ op: 'billing.get', method: 'GET', permission: 'org.read' }, req, async (ctx) => {
    const sub = await getOrganizationSubscription(getDb(), ctx!.orgId);
    return { data: sub };
  });
}

/** POST /api/billing — initiate subscription upgrade / checkout session */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'billing.checkout', method: 'POST', permission: 'org.manage' }, req, async (ctx) => {
    const body = await req.json();
    const input = CheckoutSchema.parse(body);

    const defaultSuccess = `${req.nextUrl.origin}/settings?billing=success`;
    const res = await createCheckoutSession(
      getDb(),
      ctx!,
      input.plan as PlanType,
      input.successUrl || defaultSuccess,
    );

    return { status: 201, data: res };
  });
}
