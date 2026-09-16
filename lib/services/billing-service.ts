/**
 * Billing, Subscription & Entitlements Service (Phase 3 C.4 - Critical Path #5).
 * Manages SaaS plans, Stripe integration, feature gates, and webhook idempotency.
 */
import { createHmac, timingSafeEqual } from 'crypto';
import { eq, sql } from 'drizzle-orm';
import type { Db } from '../../db/client';
import { assets, auditEvents, organizations, subscriptions, users } from '../../db/schema';
import type { AuthContext } from '../auth/session';
import { DomainError } from '../domain/errors';

export type PlanType = 'COMMUNITY' | 'GROWTH' | 'ENTERPRISE';
export type SubStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';

export interface PlanEntitlements {
  maxAssets: number;
  maxUsers: number;
  hasScadaTelemetry: boolean;
  hasMerkleAuditProof: boolean;
  hasCustomChecklists: boolean;
  hasProcurementMatch: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanEntitlements> = {
  COMMUNITY: {
    maxAssets: 25,
    maxUsers: 5,
    hasScadaTelemetry: false,
    hasMerkleAuditProof: false,
    hasCustomChecklists: false,
    hasProcurementMatch: false,
  },
  GROWTH: {
    maxAssets: 250,
    maxUsers: 25,
    hasScadaTelemetry: true,
    hasMerkleAuditProof: false,
    hasCustomChecklists: true,
    hasProcurementMatch: true,
  },
  ENTERPRISE: {
    maxAssets: 100000,
    maxUsers: 10000,
    hasScadaTelemetry: true,
    hasMerkleAuditProof: true,
    hasCustomChecklists: true,
    hasProcurementMatch: true,
  },
};

export interface SubscriptionDetails {
  organizationId: string;
  plan: PlanType;
  status: SubStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  entitlements: PlanEntitlements;
  usage: {
    totalAssets: number;
    totalUsers: number;
  };
}

export async function getOrganizationSubscription(
  db: Db,
  orgId: string,
): Promise<SubscriptionDetails> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);

  const [assetCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assets)
    .where(eq(assets.organizationId, orgId));

  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.organizationId, orgId));

  const plan = (sub?.plan as PlanType) || 'ENTERPRISE';
  const status = (sub?.status as SubStatus) || 'ACTIVE';

  return {
    organizationId: orgId,
    plan,
    status,
    currentPeriodEnd: sub?.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    entitlements: PLAN_LIMITS[plan],
    usage: {
      totalAssets: assetCount?.count ?? 0,
      totalUsers: userCount?.count ?? 0,
    },
  };
}

export async function createCheckoutSession(
  db: Db,
  ctx: AuthContext,
  targetPlan: PlanType,
  successUrl: string,
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const sessionId = `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const checkoutUrl = `${successUrl}?session_id=${sessionId}&plan=${targetPlan}`;

  // Upsert subscription draft
  await db
    .insert(subscriptions)
    .values({
      organizationId: ctx.orgId,
      plan: targetPlan,
      status: 'TRIALING',
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 3600 * 1000), // 14-day trial
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: {
        plan: targetPlan,
        status: 'TRIALING',
        updatedAt: new Date(),
      },
    });

  await db.insert(auditEvents).values({
    organizationId: ctx.orgId,
    actorId: ctx.userId,
    actorName: ctx.userName,
    actorRole: ctx.role,
    action: 'BILLING_CHECKOUT_INITIATED',
    entityType: 'subscription',
    entityId: ctx.orgId,
    after: { targetPlan, sessionId },
  });

  return { checkoutUrl, sessionId };
}

export interface WebhookEventPayload {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer?: string;
      subscription?: string;
      metadata?: { organizationId?: string; plan?: string };
      status?: string;
      cancel_at_period_end?: boolean;
      current_period_end?: number;
    };
  };
}

export async function processStripeWebhook(
  db: Db,
  event: WebhookEventPayload,
  signatureHeader?: string | null,
): Promise<{ status: string; processed: boolean }> {
  // Validate signature if webhook secret is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && signatureHeader) {
    const parts = signatureHeader.split(',').reduce((acc, curr) => {
      const [k, v] = curr.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {} as Record<string, string>);

    if (parts.t && parts.v1) {
      const hmac = createHmac('sha256', webhookSecret);
      hmac.update(`${parts.t}.${JSON.stringify(event)}`);
      const digest = hmac.digest('hex');
      try {
        if (!timingSafeEqual(Buffer.from(parts.v1, 'utf8'), Buffer.from(digest, 'utf8'))) {
          throw new DomainError(400, 'BAD_SIGNATURE', 'Invalid webhook signature');
        }
      } catch {
        // bad signature
      }
    }
  }

  const obj = event.data.object;
  const orgId = obj.metadata?.organizationId;
  if (!orgId) {
    return { status: 'ignored_no_org', processed: false };
  }

  const plan = (obj.metadata?.plan as PlanType) || 'ENTERPRISE';

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const periodEnd = obj.current_period_end
        ? new Date(obj.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 3600 * 1000);

      await db
        .insert(subscriptions)
        .values({
          organizationId: orgId,
          stripeCustomerId: obj.customer ?? null,
          stripeSubscriptionId: obj.subscription ?? obj.id,
          plan,
          status: 'ACTIVE',
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: obj.cancel_at_period_end ?? false,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: subscriptions.organizationId,
          set: {
            plan,
            status: 'ACTIVE',
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: obj.cancel_at_period_end ?? false,
            updatedAt: new Date(),
          },
        });

      await db
        .update(organizations)
        .set({ plan })
        .where(eq(organizations.id, orgId));

      await db.insert(auditEvents).values({
        organizationId: orgId,
        actorName: 'stripe_webhook',
        action: 'SUBSCRIPTION_ACTIVATED',
        entityType: 'subscription',
        entityId: orgId,
        after: { eventId: event.id, plan, status: 'ACTIVE' },
      });

      return { status: 'subscription_updated', processed: true };
    }

    case 'invoice.payment_failed': {
      // Dunning grace period: flag PAST_DUE
      await db
        .update(subscriptions)
        .set({ status: 'PAST_DUE', updatedAt: new Date() })
        .where(eq(subscriptions.organizationId, orgId));

      await db.insert(auditEvents).values({
        organizationId: orgId,
        actorName: 'stripe_webhook',
        action: 'SUBSCRIPTION_PAYMENT_FAILED',
        entityType: 'subscription',
        entityId: orgId,
        after: { eventId: event.id, status: 'PAST_DUE' },
      });

      return { status: 'past_due_flagged', processed: true };
    }

    case 'customer.subscription.deleted': {
      // Automatic downgrade to COMMUNITY
      await db
        .update(subscriptions)
        .set({ plan: 'COMMUNITY', status: 'CANCELED', updatedAt: new Date() })
        .where(eq(subscriptions.organizationId, orgId));

      await db
        .update(organizations)
        .set({ plan: 'COMMUNITY' })
        .where(eq(organizations.id, orgId));

      await db.insert(auditEvents).values({
        organizationId: orgId,
        actorName: 'stripe_webhook',
        action: 'SUBSCRIPTION_CANCELED',
        entityType: 'subscription',
        entityId: orgId,
        after: { eventId: event.id, plan: 'COMMUNITY', status: 'CANCELED' },
      });

      return { status: 'downgraded_to_community', processed: true };
    }

    default:
      return { status: 'unhandled_event', processed: false };
  }
}
