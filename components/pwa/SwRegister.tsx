'use client';

import { useEffect } from 'react';
import { has } from '@/lib/platform/capability';
import { subscribeAuthSignals } from '@/lib/auth/broadcast';
import { mark } from '@/lib/telemetry/rum';

/**
 * FP-16/TASK-24 — registrasi Service Worker (prod-only; headless dev tidak butuh).
 * Selalu ditunda hingga window.load agar tidak berlomba dengan boot render.
 * Saat LOGOUT/SESSIONS_REVOKED → kirim PURGE ke SW agar tidak ada data tenant
 * tersisa di cache (tablet lapangan bersama).
 */
export function SwRegister() {
  useEffect(() => {
    if (!has.serviceWorker()) return;
    if (process.env.NODE_ENV !== 'production') return;

    let cancelled = false;
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          if (cancelled) return;
          mark('sw.registered', '1');
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                mark('sw.update_available', '1');
              }
            });
          });
        })
        .catch(() => mark('sw.register_failed', '1'));
    };

    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register, { once: true });
    }

    // FP-17/TASK-25: SW 'sync' event → flush outbox (tanpa blocking).
    const onSwMessage = (e: MessageEvent) => {
      const d = e.data as { type?: string } | null;
      if (d?.type === 'OUTBOX_SYNC_REQUEST') {
        void import('@/lib/offline/outbox')
          .then(({ flushOutbox }) => flushOutbox({}))
          .catch(() => undefined);
      }
    };
    navigator.serviceWorker.addEventListener('message', onSwMessage);

    // Purge cache tenant saat logout — keamanan perangkat bersama.
    const unsub = subscribeAuthSignals(() => {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.active?.postMessage({ type: 'PURGE' });
        })
        .catch(() => undefined);
      // Hapus juga via Cache API dari web-side (SW bisa saja belum ready).
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => keys.filter((k) => k.startsWith('apex-sw-')).forEach((k) => caches.delete(k))).catch(() => undefined);
      }
    });

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('message', onSwMessage);
      unsub();
    };
  }, []);

  return null;
}
