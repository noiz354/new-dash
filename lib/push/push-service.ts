/**
 * FP-18 / TASK-27 — Web Push (VAPID).
 *
 * Design:
 * - Kunci VAPID diambil dari env (WEBPUSH_PUBLIC_VAPID_KEY / WEBPUSH_PRIVATE_VAPID_KEY).
 *   Jika env tidak ada (dev/testing), generate deterministik-sekali di in-memory
 *   dan diumumkan via warn — TIDAK pernah disimpan di git.
 * - Subscription disimpan per-user di tabel push_subscriptions; endpoint unik
 *   (re-registration browser yang sama = upsert).
 * - Pengiriman fan-out via web-push; endpoint kadaluwarsa (404/410) dibersihkan
 *   agar tabel tidak membocorkan bloat.
 * - Deep link payload: { title, body, url } — service worker menavigasi ke url
 *   saat notifikasi diklik (default "/wo/NOTIF-<eventId>" style).
 */
import webPush from 'web-push';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { auditEvents, pushSubscriptions } from '@/db/schema';
import type { Tx } from '@/db/client';

export interface PushSubInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
}

const ENV_PUBLIC = 'WEBPUSH_PUBLIC_VAPID_KEY';
const ENV_PRIVATE = 'WEBPUSH_PRIVATE_VAPID_KEY';

let _keys: { publicKey: string; privateKey: string } | null = null;

export function getVapidKeys(): { publicKey: string; privateKey: string } {
  const pub = process.env[ENV_PUBLIC];
  const priv = process.env[ENV_PRIVATE];
  if (pub && priv) return { publicKey: pub, privateKey: priv };
  if (!_keys) {
    _keys = webPush.generateVAPIDKeys();
    // EPHEMERAL-DEV-ONLY: keys rotate on restart. Set env for stability.
    console.warn(`[push] EPHEMERAL-DEV-ONLY VAPID keys — set ${ENV_PUBLIC}/WEBPUSH_PRIVATE_VAPID_KEY for stability`);
  }
  return _keys;
}

export function getPublicVapidKey(): string {
  return getVapidKeys().publicKey;
}

function initWebPush() {
  const k = getVapidKeys();
  webPush.setVapidDetails('mailto:ops@apex-cmms.local', k.publicKey, k.privateKey);
}

async function audit(tx: Tx, orgId: string, action: string, userId: string, entityId: string) {
  await tx.insert(auditEvents).values({
    organizationId: orgId,
    actorUserId: userId,
    actorName: 'push-service',
    action,
    entityType: 'push_subscription',
    entityId,
  });
}

/**
 * Simpan (atau perbarui) subscription push untuk user.
 * endpoint unik — browser re-register cukup dipetakan ke user terkini.
 */
export async function subscribePush(orgId: string, userId: string, input: PushSubInput) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, input.endpoint))
      .limit(1);
    if (existing[0]) {
      await tx
        .update(pushSubscriptions)
        .set({ userId, organizationId: orgId, p256dh: input.p256dh, auth: input.auth, userAgent: input.userAgent, lastUsedAt: new Date() })
        .where(eq(pushSubscriptions.id, existing[0].id));
      await audit(tx, orgId, 'PUSH_SUB_UPDATED', userId, existing[0].id);
      return existing[0].id;
    }
    const [row] = await tx
      .insert(pushSubscriptions)
      .values({
        organizationId: orgId,
        userId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent,
      })
      .returning({ id: pushSubscriptions.id });
    await audit(tx, orgId, 'PUSH_SUB_CREATED', userId, row.id);
    return row.id;
  });
}

/** Cabut subscription (user logout atau opt-out). */
export async function unsubscribePush(orgId: string, userId: string, endpoint: string) {
  const db = getDb();
  const rows = await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.organizationId, orgId), eq(pushSubscriptions.userId, userId)))
    .returning({ id: pushSubscriptions.id });
  return rows.length > 0;
}

/**
 * Fan-out P1 SLA alert ke semua subscription HTTPS user.
 * Requirement: only P1 (immediate action) — inisiatif SLA-TIER P2 nemakai SW/WS.
 */
export async function sendP1PushToUser(
  orgId: string,
  userId: string,
  payload: { title: string; body: string; url: string },
): Promise<{ sent: number; pruned: number }> {
  initWebPush();
  const db = getDb();
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.organizationId, orgId), eq(pushSubscriptions.userId, userId)));
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: `apex-p1-${Date.now()}`,
  });
  let sent = 0;
  let pruned = 0;
  for (const sub of subs) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body,
        { TTL: 300, urgency: 'high' },
      );
      await db.update(pushSubscriptions).set({ lastUsedAt: new Date() }).where(eq(pushSubscriptions.id, sub.id));
      sent++;
    } catch (err) {
      const status = (err as { statusCode?: number } | null)?.statusCode;
      if (status === 404 || status === 410) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        pruned++;
      } else {
        console.warn('[push] sendNotification failed', status, (err as Error)?.message);
      }
    }
  }
  return { sent, pruned };
}

/** Helper eskalasi: P1 push mengarahkan teknisi ke halaman notifikasi live. */
export function p1PushUrl(): string {
  return '/notifications';
}
