import type { NextRequest } from 'next/server';
import { getSessionContext } from '@/lib/auth/context';
import { can } from '@/lib/auth/rbac';
import { getDb } from '@/db/client';
import { computeSlaNotifications } from '@/lib/services/notification-service';

/**
 * FP-14 / TASK-26 — SSE alerts stream: GET /api/notifications/stream
 *
 * Retry statistik jujur: ini adalah poll-DB-internal berkala (10s) ditekan jadi
 * event stream — TIDAK ada push real-time DB. Heartbeat 25s via komentar SSE
 * agar proxy/neutralization tidak memutus idle stream. Snapshot hanya terkirim
 * bila berubah (hash banding) untuk menekan bandwidth.
 *
 * Headers anti-buffer wajib: no-store + X-Accel-Buffering: no.
 * Permission: wo.read (sama dgn GET list). Tenant scoped ctx orgId.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POLL_MS = 10_000;
const HEARTBEAT_MS = 25_000;
const MAX_STREAM_MS = 4 * 60_000; // kunci rerun koneksi < 5m agar LB/proxy tidak mutus silent

interface SseEvent {
  event: string;
  data: unknown;
  id?: string;
}

function encode(ev: SseEvent): string {
  const idPart = ev.id ? `id: ${ev.id}\n` : '';
  return `${idPart}event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) return new Response('Unauthorized', { status: 401 });
  // Permission sama dengan GET list route (wo.read).
  if (!can(ctx.role, 'wo.read')) return new Response('Forbidden', { status: 403 });

  const db = getDb();
  const orgId = ctx.orgId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: SseEvent) => controller.enqueue(encoder.encode(encode(ev)));
      const heartbeat = (): void => controller.enqueue(encoder.encode(`: hb ${Date.now()}\n\n`));

      let lastHash = '';
      let ver = 0;
      let closed = false;
      let pollTimer: ReturnType<typeof setInterval> | null = null;
      let hbTimer: ReturnType<typeof setInterval> | null = null;
      const hardStop = setTimeout(() => close('stream-expired'), MAX_STREAM_MS);

      const close = (reason: string) => {
        if (closed) return;
        closed = true;
        if (pollTimer) clearInterval(pollTimer);
        if (hbTimer) clearInterval(hbTimer);
        clearTimeout(hardStop);
        try {
          send({ event: 'stream-end', data: { reason } });
          controller.close();
        } catch {
          /* sudah tertutup */
        }
      };

      const publish = async () => {
        if (closed) return;
        try {
          const items = await computeSlaNotifications(db, orgId);
          const fingerprint = JSON.stringify(items.map((i) => [i.id, i.minutesRemaining, i.severity]));
          if (fingerprint !== lastHash) {
            lastHash = fingerprint;
            ver += 1;
            send({
              event: 'sla-snapshot',
              id: String(ver),
              data: { totalAtRisk: items.length, notifications: items, snapshotAt: new Date().toISOString() },
            });
          }
        } catch {
          send({ event: 'stream-error', data: { message: 'poll failed' } });
        }
      };

      // hello imediately + snapshot pertama
      send({ event: 'hello', data: { orgId, pollMs: POLL_MS, mode: 'server-poll-stream (not real-time push)' } });
      await publish();

      pollTimer = setInterval(publish, POLL_MS);
      hbTimer = setInterval(() => { if (!closed) heartbeat(); }, HEARTBEAT_MS);

      req.signal.addEventListener('abort', () => close('client-abort'));
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Content-Encoding': 'none',
    },
  });
}
