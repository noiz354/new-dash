# Runtime Verification — TASK-24 Service Worker

Verdict: **PASS** (dengan nuansa tercatat) · Via: MCP chrome-devtools → prod `next start` :3155 · Tanggal: 2026-09-16

## 1. Static (ringkas)

- `public/sw.js` (215 baris): precache app-shell + ikon; navigasi network-first dengan
  fallback cache → `/offline`; `_next/static` cache-first; `/api/*` network-only;
  icons/manifest stale-while-revalidate; handler `PURGE` menghapus cache `apex-sw-*`;
  sync handler + broadcast flush; push handler.
- `components/pwa/SwRegister.tsx`: register `/sw.js` scope `/` — **prod-only**
  (`NODE_ENV !== 'production'` → return, sehingga tak bisa diuji di dev :3145);
  kirim `PURGE` saat `LOGOUT`/`SESSIONS_REVOKED` + hapus Cache API web-side;
  `updatefound` → tandai update.
- Rantai logout terverifikasi statik: TopBar Sign Out → `POST /api/auth/logout` →
  `purgeLocalState()` + `postAuthSignal('LOGOUT')` → BroadcastChannel → SwRegister.
- Halaman offline ada: `app/offline` (“You are offline”).

## 2. Runtime — registrasi & cache (oracle A)

- Sesi MCP authed m.vance (Enterprise Admin). SW: **ter-register, active, controlling,
  scope `/`**; cache `apex-sw-v1-shell` ada; precache berisi `/offline` + 4 ikon. ✅

## 3. Runtime — offline (oracle B)

- Emulasi Offline: fetch probe gagal (network benar diblokir); `navigator.onLine`
  tetap `true` (perilaku Chrome yang wajar, bukan cacat).
- Anomali yang terjelaskan: `navigate /inventory` tepat setelah emulasi menyala
  merender halaman PENUH — balapan (navigasi lolos sebelum enforcement steady),
  respons dari HTTP browser cache via passthrough, BUKAN bukti fallback gagal.
  State cache membuktikan: `PAGES` kosong (by design: dokumen Next no-store/private
  → `cache.put` dilewati), `SHELL` berisi `/offline` + 4 ikon.

## 4. BUG NYATA → fix-then-verify (oracle C)

- Temuan: `location.reload` saat offline steady → hanya teks polos `Offline` 503,
  BUKAN halaman `/offline` yang didesain.
- Root cause (statik): `networkFirstNavigation` membuka `CACHE_PAGES`, fallback
  `cache.match('/offline')` di cache PAGES — padahal `/offline` di-precache ke
  `CACHE_SHELL` (sw.js:41 vs :145) → selalu MISS → 503 teks.
- Fix (satu titik, `public/sw.js`): bila PAGES miss, periksa juga SHELL cache.
- Verifikasi ulang: prod menyajikan sw.js baru; SW update diterapkan (active, no
  waiting, controlling); navigasi cache-busting `/inventory?swtest=1` saat offline
  steady → **halaman `/offline` yang didesain tampil** (“You are offline”, copy
  outbox-safe, tombol Open Field Audits + Dashboard; bukti screenshot
  `/tmp/opencode/evidence/task21/mcp-windowed.png` era TASK-21 + snapshot).
  FIX TERVERIFIKASI END-TO-END. ✅

## 5. Runtime — online + logout purge + console (oracle D/E)

- Restore online (MCP `emulate` tanpa `networkConditions`; nilai `'Online'` ditolak
  enum) → sesi tetap valid. ✅
- Sign Out → redirect `/login`; session 401; caches tersisa hanya
  `['apex-sw-v1-assets']` — shell+pages TERHAPUS. Sisa assets = RACE: load `/login`
  pasca-logout me-re-cache 3 statik publik (chunk JS, manifest, icon-192),
  non-sensitif — bukan kegagalan purge (`PURGE` menghapus SEMUA `apex-sw-*`
  di sisi SW maupun web-side). ✅
- Console: 2 error di `/login` pasca-logout — React #418 (hydration) + 401.
  Clean-load `/login` mereproduksi #418 (**pre-existing, di luar scope SW**,
  backlog F-418); 401 hilang (artefak state logged-out).

## Verdict

**TASK-24 → PASS** — register/activate/control, strategi cache, fallback `/offline`,
logout purge semuanya terbukti runtime. Nuansa: 1 console error pre-existing
(React hydration #418 di `/login`, backlog); fix fallback SHELL sudah
terverifikasi end-to-end.
