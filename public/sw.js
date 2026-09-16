/* eslint-env serviceworker */
/**
 * FP-16 / TASK-24 — Apex Ops Service Worker.
 *
 * Strategi (konservatif — data tenant tidak boleh stale):
 * - PRECACHE: app-shell navigasi inti + ikon (diisi saat install; gagal → SW
 *   tetap aktif tanpa precache).
 * - Navigasi HTML: NETWORK-FIRST (data tenant dilarang stale), fallback cache
 *   → fallback /offline. Cache hanya respon OK non-query-sensitive.
 * - _next/static (hash-konten): CACHE-FIRST (immutable), fallback network.
 * - /api/*: NETWORK-ONLY (mutasi & GET tidak pernah di-cache — keamanan tenant).
 *   SATU-SATUNYA pengecualian cache POST: tidak ada. Offline replay = outbox IDB.
 * - /icons, /manifest: STALE-WHILE-REVALIDATE (aset statis).
 *
 * Purge: pesan 'PURGE' (dikirim saat LOGOUT/SESSIONS_REVOKED di tab) menghapus
 * semua cache tenant — tablet lapangan bersama aman.
 *
 * Reset path: /settings/storage → unregister + clear (lihat StorageReset.tsx).
 */
'use strict';

const SW_VERSION = 'apex-sw-v1';
const CACHE_SHELL = `${SW_VERSION}-shell`;
const CACHE_PAGES = `${SW_VERSION}-pages`;
const CACHE_ASSETS = `${SW_VERSION}-assets`;
const KNOWN_CACHES = [CACHE_SHELL, CACHE_PAGES, CACHE_ASSETS];

const SHELL_URLS = [
  '/offline',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
];

const NAV_TIMEOUT_MS = 6000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => undefined) // jarak jaringan awal pun tetap boleh lanjut
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('apex-sw-') && !KNOWN_CACHES.includes(k)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'PURGE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('apex-sw-')).map((k) => caches.delete(k)))),
    );
  }
  if (event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

/**
 * FP-17/TASK-25: Background Sync — saat Chromium memicu 'sync' (koneksi pulih,
 * tab mungkin sudah tertutup), minta klien yang masih hidup melakukan flush.
 * Catatan batas jujur: SW TIDAK bisa baca IndexedDB outbox di sini tanpa fetch
 * replay logic; strategi = broadcast ke klien aktif (paling umum: tablet tetap
 * buka di satu tab) + tunda event agar klien sempat bereaksi.
 */
self.addEventListener('sync', (event) => {
  if (event.tag !== 'apex-outbox-flush') return;
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'OUTBOX_SYNC_REQUEST' }));
        // SW tanpa klien hidup: item aman di IDB, flush saat buka berikutnya.
      }),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // POST bebas agen — tidak di-cache
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // origin lain: biar browser sendiri
  if (url.pathname.startsWith('/api/')) return; // tenant data: NETWORK-ONLY

  // Aset immutable Next (hash di nama file)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_ASSETS));
    return;
  }

  // Ikon & manifest: SWR
  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith(staleWhileRevalidate(request, CACHE_ASSETS));
    return;
  }

  // Navigasi dokumen HTML
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Sisanya (css/js non-hash, fonts, dll): SWR ringan
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(staleWhileRevalidate(request, CACHE_ASSETS));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request, { ignoreSearch: false });
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone()).catch(() => undefined);
  return res;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const revalidate = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone()).catch(() => undefined);
      return res;
    })
    .catch(() => null);
  return hit || (await revalidate) || new Response('Offline', { status: 503 });
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_PAGES);
  try {
    const res = await fetchWithTimeout(request, NAV_TIMEOUT_MS);
    if (res.ok && !hasNoStore(res)) {
      // Jangan cache route auth/login (response mengandung state sesi).
      if (!/^\/(login|api)\b/.test(new URL(request.url).pathname)) {
        cache.put(request, res.clone()).catch(() => undefined);
      }
    }
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    const offline = await cache.match('/offline');
    return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

function hasNoStore(response) {
  const cc = response.headers.get('Cache-Control') || '';
  return /no-store|private/i.test(cc);
}

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('nav-timeout')), ms);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

/* ------------------------------------------------ push (TASK-27) ------- */

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'APEX Alert' }; }
  const title = data.title ?? 'APEX Alert';
  const options = {
    body: data.body ?? '',
    icon: data.icon ?? '/icons/icon-192.png',
    badge: data.badge ?? '/icons/icon-192-maskable.png',
    tag: data.tag ?? 'apex-push',
    data: { url: data.url ?? '/' },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    // Focus tab yang sudah terbuka ke URL target, atau buka baru.
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c && typeof c.focus === 'function') {
          return c.focus().then((cc) => (cc && 'navigate' in cc ? cc.navigate(url) : clients.openWindow(url)));
        }
      }
      return clients.openWindow(url);
    }),
  );
});
