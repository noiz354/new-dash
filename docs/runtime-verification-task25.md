# Runtime Verification — TASK-25 Background Sync + Badging

Verdict: **FAIL** (scoping presisi, lihat §6) · Via: MCP chrome-devtools → prod
`next start` :3155 · Tanggal: 2026-09-16

## 1. Static — sisi klien: NYATA dan matang

- `lib/offline/outbox.ts` (275 baris): antrian IndexedDB + migrasi legacy
  localStorage + fallback memori; `enqueueOutbox` (id unik, `QUEUED`);
  `flushOutbox` sekuensial (`SYNCED`/`SENDING`/`FAILED`/`EXPIRED`,
  Idempotency-Key preserved, `409`→SYNCED dedup, `NETWORK`/`TIMEOUT`→QUEUED+stop,
  4xx→FAILED permanen, TTL 7 hari→EXPIRED); `clearSyncedOutbox`;
  `subscribeOutbox` (BroadcastChannel `apex-outbox` + storage fallback); badge via
  lazy import `lib/offline/bg-sync`.
- `lib/offline/bg-sync.ts` (54 baris): `registerOutboxSync` feature-detected
  (`false` tanpa SyncManager; fallback flush via event `online` di SyncStatus);
  `updateOutboxBadge` (`false` bila `setAppBadge` tak ada; badge visual hanya
  tampil saat PWA terinstal).
- `FindingCapture.tsx:181-204`: `POST /api/findings` nyata; offline → outbox
  dengan Idempotency-Key asli. `SyncStatus.tsx`: UI Outbox + flush fallback.
- `SyncStatus` PUNYA online-listener (`addEventListener('online')`, auto
  flushOutbox + pesan “Back online — auto-sync”).

## 2. Runtime — enqueue offline: TERBUKTI (oracle A/B)

- `/field/findings/new` (sesi m.vance): isi judul “TASK-25 windowing probe
  finding” + severity LOW + Submit saat emulasi Offline → entry `QUEUED` + `POST`
  + idempotency-key `e57b06df-dc2b` + `1 attempt(s)` + pesan jujur “Network error —
  server tidak terjangkau.” + tombol Retry; nav badge `1 Sync` (badge count
  bekerja). ✅
- Probe offline: SyncManager `true`, `setAppBadge` `true` (visual butuh PWA
  terinstal — ekspektasi `false` jujur di MCP), SW active scope `/`,
  sync tags `[]` (Background Sync tak ter-register untuk enqueue ini),
  IDB `apexops_field` ada.

## 3. Runtime — flush saat online: GAGAL TERAMATI (oracle C)

- Kembali online: badge nav hilang; TAPI halaman yang tampil (Shift Checkout,
  “Pending Uploads empty”) adalah antrean view lain — bukan findings outbox.
- IDB: entry findings **tetap `QUEUED`** (attempts:1); “Recently Synced: Nothing
  synced yet”. Auto-flush tak terpicu — kemungkinan komponen SyncStatus tak
  ter-mount di view saat itu, atau akhir emulasi DevTools tak menghasilkan
  transisi `onLine` yang dipercaya (`navigator.onLine` sempat `true` saat offline).

## 4. Runtime — Retry manual + temuan server (oracle D)

- `/field/sync`: entry `QUEUED` + Retry; klik Retry (online) → 4 dtk kemudian IDB
  = `SYNCED` attempts:2 — TAPI `/api/findings` (limit 200) tak berisi finding
  (race disingkir via cek ulang); log prod menunjukkan `findings.create`
  `POST 201`; scan penuh hanya 3 rows seed.
- Sumber (`app/api/audit-trail/…` no — `app/api/findings/route.ts`):
  **FABRIKASI NYATA**: `GET` mengembalikan `SEEDED_FINDINGS` hardcode (3 rows,
  bukan DB); `POST` mengembalikan `201` + id random + echo body **tanpa insert
  ke mana pun** — padahal tabel `findings` ADA di schema (check
  `OPEN`/`CONVERTED`/`DISMISSED`, format `FND-YYYY-NNNN`). Minor: POST memakai
  permission `assets.read` untuk operasi tulis.

## 5. Console

- `ERR_INTERNET_DISCONNECTED` ×5 (artefak jujur fase offline, bukan bug). ✅

## 6. Verdict

**TASK-25 → FAIL** — dengan scoping presisi:
- ✅ NYATA & terverifikasi: outbox klien (IDB, Idempotency-Key, retry, badge
  count, copy error jujur).
- ❌ FABRIKASI server: `POST /api/findings` 201-tanpa-persist, `GET` hardcode —
  delivery end-to-end (janji inti “background sync”) tidak terjadi.
- ❓ UNPROVEN: auto-flush saat online (pemicu ada di kode, tak terpicu saat uji).
- Memperbaiki endpoint = membangun fitur baru (persist + GET DB), bukan
  verifikasi → masuk backlog, bukan fix-then-verify.

## Backlog (dari task ini)

1. `POST /api/findings` insert ke tabel `findings` (perbaiki permission → bukan
   `assets.read`); `GET` baca DB (ganti seed hardcode).
2. Selidiki pemicu auto-flush (mount SyncStatus / transisi `onLine` tepercaya).
