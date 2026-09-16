import type { NextRequest } from 'next/server';
import { withRoute } from '@/lib/api/http';
import { getDb } from '@/db/client';
import { processStripeWebhook } from '@/lib/services/billing-service';

/**
 * POST /api/billing/webhook
 * Stripe webhook handler with signature verification, duplicate guard, and dunning / downgrade management.
 */
export async function POST(req: NextRequest) {
  return withRoute({ op: 'billing.webhook', method: 'POST', public: true }, req, async () => {
    const rawBody = await req.json();
    const signature = req.headers.get('stripe-signature');

    const result = await processStripeWebhook(getDb(), rawBody, signature);
    return { data: result };
  });
}
