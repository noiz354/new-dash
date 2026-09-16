# IMPLEMENTATION PLAN — WEB PLATFORM API
## Apex Ops CMMS (`new-dash`) — turunan dari `AUDIT_WEB_PLATFORM_API.md`

**Status:** PLAN ONLY — belum diverifikasi terhadap repo. Semua path file, line reference, dan fakta dependency berasal dari audit sebelumnya dan **wajib diverifikasi ulang oleh coding agent saat eksekusi**. Dokumen ini tidak mengimplementasikan apa pun.

**Konvensi:**
- Feature ID: `FP-NN` (dipakai konsisten di seluruh dokumen: blueprint, task, wave, risk, rollback).
- Task ID: `TASK-NN`.
- File yang belum tentu ada ditandai **PROPOSED NEW FILE**.
- Priority: **P0** existing risk · **P1** high-value/low-complexity · **P2** strategic · **P3** experimental.
- Category: **FRONTEND ONLY** · **BACKEND ONLY** · **HYBRID** · **INFRA/CONFIG** · **EXPERIMENTAL**.
- Baseline angka yang belum ada: **"BASELINE TO BE COLLECTED BY IMPLEMENTATION AGENT"**.

---

## §1. INPUT (dari audit — tidak diulang)

P0: fetch tanpa AbortController (race ⌘K) · outbox DEAD vs `/field/sync` simulasi · nol security headers · CSRF lib DEAD · outbox survive logout pada shared tablet.
P1: fetch helper+timeout+traceparent · client SHA-256 evidence · media capture foto · Geolocation stamp · RUM beacon · Server-Timing · ETag wiring · Vibration · Wake Lock · konsolidasi 12 util download.
P2: SSE alerts · PWA (manifest+SW+Background Sync+Badging) · upload pipeline evidence nyata · Passkeys · Playwright harness · lazy-render list besar · self-host font.
P3: View Transitions · showSaveFilePicker · CompressionStream · Worker CSV/dossier · WASM ZXing fallback · Network Information adaptif.
Native replacements: 12×duplikasi download → util · "WebSocket palsu" → SSE · localStorage outbox → IndexedDB · simulasi scan → BarcodeDetector · GPS literal → Geolocation API · Radix dialog → KEEP · window.print → KEEP · QR placeholder → DEFER (tidak ada API native).

---

## §2. FEATURE GROUPING (kategori & owner)

| FP | Feature | Category | Owner utama | Dependency antar layer |
|---|---|---|---|---|
| FP-01 | Fetch client foundation (abort/timeout/traceparent/retry-idempotent) | HYBRID (FE-led) | Frontend | BE sudah membalas `traceparent`; FE memanfaatkannya |
| FP-02 | Konsolidasi download util (Blob/anchor → satu modul) | FRONTEND ONLY | Frontend | — |
| FP-03 | Security headers (CSP report-only→enforce, Permissions-Policy) | INFRA/CONFIG | Platform/FE | CSP rollout bergantung inventaris inline handler |
| FP-04 | CSRF decision + fetch-metadata hardening | BACKEND ONLY | Backend | — |
| FP-05 | Logout hygiene (purge outbox + BroadcastChannel auth) | FRONTEND ONLY | Frontend | Bergantung state outbox (FP-06 untuk bentuk final) |
| FP-06 | Offline outbox nyata (IndexedDB migration + wiring `/field/sync`) | HYBRID (FE-led) | Frontend | Backend idempotency SUDAH ADA; wajib precede FP-17 |
| FP-07 | RUM beacon (LCP/INP/CLS/LongTask + sendBeacon) | HYBRID | Frontend | Route BE baru `/api/telemetry/rum` |
| FP-08 | Server-Timing header emit | BACKEND ONLY | Backend | — |
| FP-09 | ETag wiring di GET list terberat | BACKEND ONLY | Backend | Client gratis (fetch default) |
| FP-10 | Geolocation stamp nyata | FRONTEND ONLY | Frontend | Server menyimpan sebagai klaim (bukan bukti) |
| FP-11 | Photo evidence capture + client hash + upload pipeline | HYBRID | Frontend | Route upload BE baru + object storage policy |
| FP-12 | Field ergonomics: Wake Lock + Vibration | FRONTEND ONLY | Frontend | — |
| FP-13 | Barcode detection (aset/part/badge) | FRONTEND ONLY | Frontend | Validasi kode tetap server |
| FP-14 | SSE alerts (`/api/notifications/stream`) | HYBRID | Backend→Frontend | Recompute query notifikasi yang sudah ada |
| FP-15 | PWA manifest + icons + installability | INFRA/CONFIG | Frontend/Platform | Precede FP-16 |
| FP-16 | Service Worker app-shell + runtime cache strategy | FRONTEND ONLY (cache infra) | Frontend | Precede FP-17; koordinasi CSP (FP-03) |
| FP-17 | Background Sync flush outbox + Badging count | FRONTEND ONLY | Frontend | Butuh FP-06 + FP-16 |
| FP-18 | Web Push untuk eskalasi P1 | HYBRID | Backend+Frontend | VAPID keys, SW (FP-16); P2/P3 |
| FP-19 | Passkeys / WebAuthn MFA tambahan | HYBRID | Backend+Frontend | Tabel kredensial + challenge store baru |
| FP-20 | Playwright browser harness | INFRA/CONFIG | QA/Platform | Dev server runnable (sudah) |
| FP-21 | Lazy-render list besar (IntersectionObserver) | FRONTEND ONLY | Frontend | — |
| FP-22 | `showSaveFilePicker` untuk export dossier | FRONTEND ONLY | Frontend | Bergantung FP-02 (util) |
| FP-23 | Web Worker untuk CSV/dossier + hapus pseudo-hash klien | FRONTEND ONLY | Frontend | — |
| FP-24 | View Transitions navigasi | EXPERIMENTAL | Frontend | Next router compatibility check oleh agent |
| FP-25 | Self-host font via `next/font` (repo TODO) | INFRA/CONFIG | Frontend | Asset woff2 tersedia |
| FP-26 | Paralelisasi query `/api/search` | BACKEND ONLY | Backend | — |

---

## §3. PRIORITY MAP

**P0 (existing risk):** FP-01 (subset: race ⌘K), FP-03, FP-04, FP-05, FP-06.
**P1 (high-value/low-complexity):** FP-01 (penuh), FP-02, FP-07, FP-08, FP-09, FP-10, FP-11 (subset capture+hash), FP-12, FP-13, FP-25.
**P2 (strategic):** FP-11 (upload pipeline penuh), FP-14, FP-15, FP-16, FP-17, FP-18, FP-19, FP-20, FP-21, FP-26.
**P3 (experimental):** FP-22, FP-23, FP-24.

---

## §4. TARGET ARCHITECTURE (flow per fitur penting)

### FP-06 Offline outbox
```
Current flow:
User → RunChecklist/FindingCapture (submit) → fetch langsung → ❌ offline = hilang
                                                     ↘ /field/sync → setTimeout simulasi (fake)

Proposed flow:
User → RunChecklist/FindingCapture
  ↓ navigator.onLine === false / fetch gagal jaringan
 Frontend TS: enqueueOutbox(item{url,method,body,idempotencyKey}) → IndexedDB (idb, transaksional)
  ↓ online event / manual Sync / Background Sync tag (FP-17)
 flushOutbox(): sequential replay, Idempotency-Key preserved
  ↓
API (transitions/evidence) → Backend: withIdempotency() → 200/201 | 409 duplicate → tandai SYNCED
  ↓ BroadcastChannel('apex-outbox') → sinkron status antar-tab
Storage: PGlite (server, authoritative) · IndexedDB (client, antrian sementara, TTL + purge on logout)
```
Berubah: storage layer outbox, wiring UI sync, enqueue points. Tetap: idempotency server, state machine, envelope API. Fallback: antrian in-memory per-tab + banner jika IDB gagal open.

### FP-11 Photo evidence
```
Current flow:
"Tap to activate camera" → setTimeout(800ms) → toast "GPS Locked" (tidak ada foto, tidak ada file)
API POST evidence (JSON metadata: fileName/filePath/mimeType/fileSize/sha256Hash) — tidak ada yang memanggil

Proposed flow:
User → <input type="file" accept="image/*" capture="environment"> (FP-13: juga jalur barcode)
  ↓ File
Frontend TS: preview → (P2) canvas resize ≤1600px JPEG q0.8 → crypto.subtle.digest('SHA-256') → FormData
  ↓ multipart POST /api/work-orders/[id]/evidence/upload (route baru, permission wo.transition)
Authoritative validation backend: ukuran max, mime sniffing (magic bytes), EXIF strip per policy, re-hash SHA-256
  ↓ simpan bytes (disk dev / object storage prod) → addEvidence() dengan hash server-verified
Storage: object storage (file) + tabel evidence (metadata, chain-of-custody via auditEvents)
Boundary: hash klien = petunjuk dedup; hash server = kebenaran. Client untrusted.
Fallback: kirim file asli tanpa resize; tanpa JS → file picker biasa tetap berfungsi (progressive form).
```

### FP-14 SSE alerts
```
Current flow:
NotificationsHub → render SEED statis + toast palsu "WebSocket" — tidak ada transport

Proposed flow:
Browser → new EventSource('/api/notifications/stream') (cookie sesi terkirim otomatis)
  ↓ Frontend TS: state { CONNECTING | OPEN | RECONNECTING }, backoff manual bila error persisten
Route handler baru: ReadableStream; loop recompute query SLA (query yang sama dengan GET list) tiap N detik
  ↓ event: alert / heartbeat (25s); tenant filter server-side via session context
Backend → PGlite (authoritative) — satu arah saja
Fallback: error > M kali → polling GET /api/notifications tiap 60s.
```

### FP-19 Passkeys
```
Current flow: password → TOTP (RFC 6238 real) → sesi httpOnly cookie
Proposed flow: password → [passkey assertion SEBAGAI/TAMBAHAN MFA] → sesi
  Registration (di profil, sesi aktif): navigator.credentials.create({publicKey}) → challenge dari server → attestation → simpan credential (tabel baru) — counter, transports, AAGUID
  Login: navigator.credentials.get({publicKey:{challenge}}) → POST assertion → verify signature + counter → MFA satisfied
Fallback: TOTP tetap ada (tidak dihapus); recovery codes (P3).
```

---

## §5. FRONTEND VS BACKEND RESPONSIBILITY (per fitur)

**FP-01 Fetch client foundation**
- Frontend: modul `apiFetch` (timeout default 15s GET / 30s mutation; AbortSignal gabungan caller+timeout; bentuk ulang `traceparent` dari respons sebelumnya bila ada; error terstruktur `{code,message,status,requestId}` dari envelope); migrasi 15 call-site.
- Backend: tetap — `traceparent` sudah dibalas; tambahkan header `x-request-id` ke error log sisi client (sudah ada).
- Shared: format envelope `{ok,data}|{ok:false,error}` (tetap).
- Security boundary: helper TIDAK menambah credential/otorisasi di client; cookie httpOnly tetap satu-satunya kredensial.

**FP-06 Outbox**
- Frontend: enqueue/flush/retry/backoff UI; IndexedDB schema v2; TTL item (misal 7 hari); purge on logout.
- Backend: `withIdempotency` + 409 dedup (ADA — tetap); tidak ada perubahan kontrak.
- Shared: format `Idempotency-Key` (`crypto.randomUUID()`).
- Security boundary: server tetap authoritative state machine; replay hanya mempercepat jalur yang sama.

**FP-11 Photo evidence**
- Frontend: capture, preview, resize opsional, `crypto.subtle` hash, progress UI, abort upload.
- Backend: batas ukuran, validasi magic-bytes mime, re-hash, EXIF strip (policy), penyimpanan, `addEvidence`, audit event.
- Shared: field metadata (`fileName`, `mimeType`, `fileSize`, `sha256Hash`).
- Security boundary: SEMUA validasi keamanan di server; optimasi klien dapat dilewati penyerang tanpa mengurangi keamanan.

**FP-14 SSE**
- Frontend: render, indikator koneksi, reconnect backoff, fallback polling.
- Backend: stream, heartbeat, RBAC + tenant filter, batas umur koneksi + `X-Accel-Buffering: no` bila perlu.
- Shared: skema event `alert` (samakan dengan `NotificationItem`).
- Security boundary: tidak pernah emit data lintas tenant; tidak ada kanal publik.

**FP-19 Passkeys**
- Frontend: `credentials.create/get`, UX fallback TOTP, penamaan perangkat.
- Backend: challenge store ber-TTL (reuse pola challenge MFA), verifikasi attestation/assertion, counter monotonik, tabel `webauthn_credentials`, revoke per kredensial, audit event.
- Security boundary: challenge one-time, `rp.id` dikunci origin produksi; tidak pernah menganggap assertion tanpa verifikasi server.

(CP-01..CP-26 lain: pola yang sama — rincian di blueprint §6.)

---

## §6. IMPLEMENTATION BLUEPRINT

### FP-01 — Fetch client foundation
- **Priority:** P0→P1 · **Category:** HYBRID (FE-led)
- **Problem solved:** 15 call-site fetch tanpa abort/timeout; race ⌘K; trace FE→BE putus.
- **Current behavior:** `fetch()` langsung; debounce-only di palette; error handling berbeda-beda.
- **Target behavior:** Satu helper terpakai semua call-site; setiap request punya batas waktu; respons basi dibuang; `traceparent` diteruskan.
- **Browser/Web capability:** `AbortController`, `AbortSignal.timeout` (dengan fallback manual), fetch.
- **Frontend changes:** **PROPOSED NEW FILE** `lib/api/client.ts`; migrasi 15 call-site (daftar di §7); palette membatalkan request saat query berubah.
- **Backend changes:** tidak ada (opsional: log `traceId` yang datang dari client — sudah didukung `withRoute`).
- **Infra/config:** tidak ada.
- **Files likely affected:** `components/ops/CommandPalette.tsx`, `components/auth/LoginForm.tsx`, `components/ops/TopBar.tsx`, `components/ops/WoDialogs.tsx`, `components/workorders/WorkOrderList.tsx`, `components/requests/ServiceRequestList.tsx`, `components/requests/ServiceRequestDetail.tsx`, `components/org/OrgHub.tsx`, `app/(ops)/work-orders/new/page.tsx`, `lib/offline/outbox.ts` (flush nanti di FP-06).
- **Dependencies:** 0 baru.
- **Fallback:** jika `AbortSignal.timeout` tidak tersedia → timer + `controller.abort()` manual.
- **Security:** jangan kirim kredensial tambahan; pastikan helper tidak menelan 401 (redirect login tetap via mekanisme saat ini).
- **Observability:** hitung `client_request_timeout`, `client_request_aborted` (kirim via FP-07 saat tersedia; sementara console/debug counter).
- **Tests:** unit (abort mengabaikan respons terlambat; timeout memicu AbortError; envelope error mapping); E2E (⌘K ketik cepat → hanya hasil query terakhir).
- **Rollout:** internal/dev → default (risiko rendah). **Rollback:** revert migrasi call-site satu per satu; helper tidak mengubah perilaku bila tidak dipakai.
- **Success metric:** stale-overwrite = 0 (test), request count per sesi pencarian turun (BASELINE TO BE COLLECTED), timeout terukur.

### FP-02 — Download util consolidation
- **Priority:** P1 · **Category:** FRONTEND ONLY
- **Problem solved:** 12 duplikasi pola Blob+anchor; `revokeObjectURL` tidak konsisten (memory leak).
- **Current behavior:** copy-paste per komponen; hanya satu yang me-revoke.
- **Target behavior:** `downloadBlob(filename, blob)` satu-satunya; revoke deterministik; titik ekstensi untuk `showSaveFilePicker` (FP-22).
- **Browser/Web capability:** Blob, `URL.createObjectURL` (sekarang), File System Access (nanti, feature-detect).
- **Frontend changes:** **PROPOSED NEW FILE** `lib/download.ts`; migrasi 12 komponen.
- **Backend changes:** tidak ada.
- **Files likely affected:** `components/assets/AssetRegistry.tsx`, `components/audit/AuditTrail.tsx`, `components/facilities/FacilityHub.tsx`, `components/inventory/InventoryLedger.tsx`, `components/notifications/NotificationsHub.tsx`, `components/org/OrgHub.tsx`, `components/purchasing/PurchaseList.tsx`, `components/reports/ReportsHub.tsx`, `components/requests/ServiceRequestList.tsx`, `components/settings/SettingsHub.tsx`, `components/vendors/VendorList.tsx`, `components/workorders/WorkOrderList.tsx`.
- **Dependencies:** 0. **Fallback:** pola lama (anchor) — util sendiri adalah fallback-safe.
- **Security:** filename disanitasi (hindari path-ish char); konten tetap data yang sudah di-scope server.
- **Observability:** counter export per komponen (opsional, via FP-07).
- **Tests:** unit (URL dibuat & direvoke); snapshot kecil per komponen.
- **Rollout:** dev → default. **Rollback:** util dihapus, komponen kembali inline (git revert).
- **Success metric:** baris JS duplikat −~150; 0 kebocoran objectURL (audit manual + test).

### FP-03 — Security headers
- **Priority:** P0 · **Category:** INFRA/CONFIG
- **Problem solved:** tanpa CSP/Permissions-Policy; blast radius XSS/abuse fitur tak terbatas.
- **Current behavior:** `next.config.mjs` 9 baris tanpa `headers()`.
- **Target behavior:** CSP `report-only` di semua route → (Wave 2) enforce; `Permissions-Policy` membatasi `camera/microphone/geolocation` ke origin sendiri, default off untuk fitur lain; `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'self'`.
- **Browser/Web capability:** HTTP headers (CSP L2/L3, Permissions-Policy).
- **Frontend changes:** inventaris inline handler (ada bukti `onClick="window.print()"` sebagai atribut string di RSC — verifikasi apakah termasuk `script-src 'unsafe-inline'` kebutuhan; umumnya atribut event inline = pelanggaran CSP → rencanakan migrasi ke client component kecil).
- **Backend changes:** `next.config.mjs` tambah `async headers()`.
- **Infra/config:** ya (satu file).
- **Dependencies:** 0.
- **Fallback:** report-only permanen bila enforce berisiko di tahap awal.
- **Security:** inti fitur ini. Pelanggaran dilaporkan via `report-uri`/Reporting API ke endpoint BE baru (PROPOSED NEW FILE `app/api/security/csp-report/route.ts`, body `application/csp-report`, no-store).
- **Observability:** volume violation per directive (dashboard ringkas dari log).
- **Tests:** E2E header ada; endpoint report menerima sample; regression: halaman print tetap berfungsi setelah enforce.
- **Rollout:** report-only (Wave 1) → amati ≥1 siklus → enforce (Wave 2). **Rollback:** hapus header enforce, kembali report-only/non.
- **Success metric:** 0 violation valid pada 2 minggu report-only; scanner eksternal lulus.

### FP-04 — CSRF decision + fetch-metadata
- **Priority:** P0 · **Category:** BACKEND ONLY
- **Problem solved:** `lib/auth/csrf.ts` DEAD; satu-satunya pertahanan = Origin-vs-Host (meleset untuk client non-browser tanpa Origin).
- **Current behavior:** origin check saja; SameSite=Lax sebagai pelengkap implisit.
- **Target behavior:** pertahankan prinsip minimal: perkuat `csrfFailure()` memakai `Sec-Fetch-Site` (blokir `cross-site` pada mutasi) + tetap Origin-vs-Host; **hapus** `lib/auth/csrf.ts` (double-submit HMAC) dari repo, ATAU wire sepenuhnya — keputusan direkomendasikan: **hapus** (kompleksitas tanpa kebutuhan mengingat cookie SameSite=Lax + fetch-metadata).
- **Browser/Web capability:** Fetch Metadata headers (server-side evaluation).
- **Frontend changes:** tidak ada.
- **Backend changes:** `lib/api/http.ts` (fungsi `csrfFailure`); hapus file csrf (jika keputusan=hapus); update comment.
- **Dependencies:** 0.
- **Fallback:** perilaku saat ini (hanya lebih ketat, kompatibel).
- **Security:** perhatikan client non-browser (curl) tanpa header — kebijakan: tolak mutasi cookie-auth yang `Sec-Fetch-Site: cross-site`; izinkan yang tanpa header (SAMA dengan sekarang, didokumentasikan).
- **Observability:** log `CSRF_ORIGIN_MISMATCH` sudah ada; tambah counter `fetch_metadata_blocked`.
- **Tests:** integration (mutasi dengan Origin beda → 403; `Sec-Fetch-Site: cross-site` → 403; GET tetap lolos; client tanpa header sesuai kebijakan).
- **Rollout:** dev → default. **Rollback:** revert satu fungsi.
- **Success metric:** skenario test hijau; tidak ada 403 tak terduga dari browser sah (pantau log 7 hari).

### FP-05 — Logout hygiene + BroadcastChannel auth
- **Priority:** P0/P1 · **Category:** FRONTEND ONLY
- **Problem solved:** draft outbox tinggal di localStorage setelah logout di shared tablet; tab lain tetap tampil "login".
- **Current behavior:** logout = POST + `location.assign`; storage klien tak tersentuh.
- **Target behavior:** logout → bersihkan state lokal sensitif (outbox + semua key ber-prefix `apex`) → `BroadcastChannel('apex-auth')` post `LOGOUT` → tab lain redirect `/login`. Revoke-all dari ProfileSessions → post `SESSIONS_REVOKED`.
- **Browser/Web capability:** `BroadcastChannel` (fallback: event `storage` pada key sentinel), localStorage.
- **Frontend changes:** `components/ops/TopBar.tsx` (logout), `components/profile/ProfileSessions.tsx`, **PROPOSED NEW FILE** `lib/auth/broadcast.ts`.
- **Backend changes:** tidak ada.
- **Dependencies:** 0.
- **Fallback:** `("BroadcastChannel" in globalThis)`; kalau tidak ada → sentinel `localStorage` + listener `storage`.
- **Security:** jangan broadcast payload sensitif — hanya sinyal; pesan diberi timestamp + origin-check implisit same-origin.
- **Observability:** counter logout-sync (via FP-07 nanti).
- **Tests:** 2 tab: logout di A → B redirect; outbox kosong setelah logout; revoke-all → sinyal diterima.
- **Rollout:** dev → default. **Rollback:** hapus pemanggil broadcast (storage purge tetap aman).
- **Success metric:** 0 kasus draft user A terkirim sebagai user B (test); B redirect <1s.

### FP-06 — Offline outbox nyata (IndexedDB)
- **Priority:** P0 · **Category:** HYBRID (FE-led)
- **Problem solved:** janji "Nothing is lost" tanpa implementasi; SQLite… salah — localStorage sinkron tak cocok; modul ada tapi mati.
- **Current behavior:** `lib/offline/outbox.ts` (localStorage, tak diimpor); `/field/sync` = simulasi.
- **Target behavior:** storage IDB v2 (store `outbox`, index `status`, `createdAt`); API publik modul tetap (`enqueueOutbox/flushOutbox/listOutbox/clearSyncedOutbox`) agar diff kecil; wiring: `SyncStatus.tsx` render dari `listOutbox()`; enqueue dari `RunChecklist` submit-step & `FindingCapture` submit saat `navigator.onLine === false` atau fetch network-error; flush pada `online` event + manual tombol; broadcast status antar-tab.
- **Browser/Web capability:** IndexedDB (native, promise-wrapper ~60 baris tanpa dep), `navigator.onLine`, `online` event, BroadcastChannel (FP-05 pola).
- **Frontend changes:** `lib/offline/outbox.ts` (storage layer baru), **PROPOSED NEW FILE** `lib/offline/db.ts`, `components/field/SyncStatus.tsx` (daftar nyata + retry per item + sync-all), `components/field/RunChecklist.tsx`, `components/field/FindingCapture.tsx` (enqueue points).
- **Backend changes:** tidak ada (idempotency + 409 ada).
- **Dependencies:** 0.
- **Fallback:** `indexedDB in globalThis` gagal → antrian in-memory + banner "queue tidak persisten".
- **Security:** purge on logout (FP-05); TTL item 7 hari + marker; payload hanya mutasi milik user sendiri (server menolak bila sesi berubah — perilaku yang diinginkan: 401 → tandai FAILED-permanent, jangan replay).
- **Observability:** metrik `outbox_enqueued`, `outbox_synced`, `outbox_failed_permanent`, `offline_success_rate` (denominator: enqueued).
- **Tests:** integration-ish browser: airplane-mode → submit → online → synced; duplikasi replay → 409 ditandai SYNCED; TTL purge; migrasi v1(localStorage)→v2(IDB) membaca & membersihkan legacy key.
- **Rollout:** dev → limited (field routes) → default. **Rollback:** nonaktifkan enqueue points (flag konstanta) — UI sync kembali read-only; data IDB dibiarkan (inert).
- **Success metric:** offline success rate ≥99% pada skenario uji; 0 item hilang; `SyncStatus` menampilkan item nyata.

### FP-07 — RUM beacon
- **Priority:** P1 · **Category:** HYBRID · (juga fondasi §21 Wave 0)
- **Problem solved:** FE buta performa/error (tak bisa jawab halaman/API/interaksi lambat, browser/device bermasalah).
- **Current behavior:** observability hanya server.
- **Target behavior:** collector ringan: `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`, `longtask`, `event` timing/INP bila tersedia, `resource` untuk `/api/*` saja), `navigation` timing; error JS (`error`, `unhandledrejection`); batch → `sendBeacon` saat `pagehide` / interval; route BE menyimpan agregat in-memory gaya `lib/telemetry/metrics.ts` + expose di `/api/telemetry/metrics` gabungan.
- **Browser/Web capability:** PerformanceObserver, `navigator.sendBeacon` (fallback `fetch keepalive`), `pagehide`.
- **Frontend changes:** **PROPOSED NEW FILE** `lib/telemetry/rum.ts`; mount client boundary kecil di `app/(ops)/layout.tsx` & `app/(field)/layout.tsx` (misal `<RumInit/>`).
- **Backend changes:** **PROPOSED NEW FILE** `app/api/telemetry/rum/route.ts` (zod schema, permission: sesi aktif, sampling server-side, batas ukuran body).
- **Dependencies:** 0 (hindari lib web-vitals bila ingin tetap zero-dep; bila diizinkan: `web-vitals` ~2KB).
- **Fallback:** browser tanpa observer tipe tertentu → kirim subset; semua observer gagal → no-op.
- **Security/privacy:** jangan kirim query string/PII; route dinormalisasi (misal `/work-orders/[id]`); sampling agar tidak membanjiri log.
- **Observability:** ini sendiri; tambahkan custom marks untuk flow kritikal (login→dashboard interactive; sync flush durasi).
- **Tests:** unit (buffering, clamp ukuran, normalisasi route); integration (endpoint menerima payload valid/menolak invalid); E2E (navigasi dashboard menghasilkan ≥1 beacon di dev).
- **Rollout:** internal/dev (sampling 100%) → limited (10%) → default (10–25%). **Rollback:** set sampling 0 via konstanta; route mengembalikan 204.
- **Success metric:** p75 LCP/INP/CLS per route-group tersedia; 2 regresi tiruan terdeteksi saat uji.

### FP-08 — Server-Timing
- **Priority:** P1 · **Category:** BACKEND ONLY
- **Problem solved:** `durationMs` server tak terlihat di browser.
- **Changes:** di `finish()` `lib/api/http.ts` tambah header `Server-Timing: app;dur=<durationMs>` (+ `db;dur=` bila granular tersedia nanti).
- **Fallback/Observability:** terlihat di DevTools Network; dipetik FP-07 bila diinginkan.
- **Tests:** integration assert header format. **Metric:** waktu diagnosis ↓ (kualitatif — ditandai NOT YET MEASURABLE di audit → tetap kecil, 1-baris).
- **Rollback:** hapus header.

### FP-09 — ETag wiring
- **Priority:** P1 · **Category:** BACKEND ONLY
- **Problem solved:** engine `lib/api/etag.ts` DEAD; list fetch ulang penuh.
- **Target behavior:** pakai `createEtagResponse` pada GET: `/api/work-orders` (list), `/api/service-requests`, `/api/notifications` (+ kandidat `/api/parts`, `/api/audit-trail` bila payload besar). Pastikan envelope konsisten bila dibungkus `withRoute` (opsi: panggil dalam handler dan return `NextResponse` langsung — agent memutuskan titik integrasi bersih).
- **Fallback:** klien mengabaikan ETag = perilaku lama.
- **Observability:** counter `etag_304` per route (tambah di metrics).
- **Tests:** integration (If-None-Match cocok → 304 kosong; berubah data → 200 + ETag baru).
- **Success metric:** 304 hit rate ≥30% pada kunjungan berulang (BASELINE TO BE COLLECTED); network bytes turun.

### FP-10 — Geolocation stamp
- **Priority:** P1 · **Category:** FRONTEND ONLY
- **Problem solved:** GPS literal hardcoded tampil sebagai "bukti".
- **Target behavior:** `('geolocation' in navigator)` → `getCurrentPosition({enableHighAccuracy:false, timeout:8000, maximumAge:60000})` → tampilkan koordinat aktual + akurasi; sertakan dalam payload finding/evidence sebagai klaim (`gpsLat`, `gpsLng`, `gpsAccuracyM`, `gpsClaimedAt`); UI menandai "device-reported".
- **Backend (opsional minimal):** terima field opsional di schema finding/evidence-upload; catat sebagai klaim (bukan verified); `receivedAt` server tetap otoritatif.
- **Fallback:** permission denied/timeout → input zone manual (UI sudah ada) + label "manual".
- **Security:** jangan blokir submit bila GPS gagal; Permissions-Policy (FP-03) mengizinkan `geolocation=(self)`.
- **Tests:** mock geolocation (Playwright context) grant/deny/timeout.
- **Metric:** % finding dengan koordinat aktual; tingkat deny ditampilkan agar ops dapat melatih user.

### FP-11 — Photo evidence capture + hash (+upload pipeline)
- **Priority:** P1 (capture+hash) / P2 (pipeline) · **Category:** HYBRID
- **Problem solved:** kamera & hash fiktif; tidak ada jalur file sama sekali.
- **Target behavior:** `<input type="file" accept="image/*" capture="environment">` di `FindingCapture` & `RunChecklist`; preview object-URL; tombol "Attach" → (P2) resize canvas ≤1600px JPEG q0.8 → `crypto.subtle.digest` → `FormData` → `POST /api/work-orders/[id]/evidence/upload` (route baru) dengan progress + abort (FP-01 helper diperluas multipart); server: batas 10MB, magic-bytes check (JPEG/PNG/WebP), re-hash, simpan, `addEvidence`, audit event; UI menampilkan thumbnail dari respons.
- **Frontend files:** `components/field/FindingCapture.tsx`, `components/field/RunChecklist.tsx`, **PROPOSED NEW FILE** `lib/media/evidence.ts` (hash, resize, formdata).
- **Backend files:** **PROPOSED NEW FILE** `app/api/work-orders/[id]/evidence/upload/route.ts`, `lib/services/task-service.ts` (varian addEvidence dgn bytes), storage driver lokal dev (`.data/evidence/` gitignored) + antarmuka agar prod swap object storage.
- **Fallback:** tanpa JS → form posting standar tetap bekerja (route menerima multipart biasa); resize gagal → kirim asli; hash gagal (non-secure-context) → server tetap hash.
- **Security:** `wo.transition` permission; nama file server-generated; konten disajikan lewat route ter-otentikasi (bukan public static); EXIF strip policy: hapus saat re-encode server (P2 bila lib tersedia — jika tidak, dokumentasikan risiko dan batasi akses).
- **Observability:** `upload_bytes` (sum/route), `upload_duration`, `upload_fail`, rerata rasio kompresi klien.
- **Tests:** unit (hash vector, resize dimensi, fallback asli); integration (multipart diterima, mime palsu ditolak, oversize 413); E2E (fixture gambar → lampir → muncul di daftar evidence); permission denied kamera tidak memblokir file picker.
- **Rollout:** P1 subset (tanpa resize) dev→default; resize+pipeline P2 limited→default. **Rollback:** sembunyikan tombol attach (flag); route upload return 503; data evidence lama (metadata-only) tetap valid.
- **Metric:** attach success rate; upload bytes/evidence (target −≥60% setelah resize; BASELINE TO BE COLLECTED); backend CPU decode stabil.

### FP-12 — Wake Lock + Vibration
- **Priority:** P1 · **Category:** FRONTEND ONLY
- **Target behavior:** saat `RunChecklist` mode run aktif → `navigator.wakeLock.request('screen')`, re-acquire pada `visibilitychange` visible; release saat keluar/selesai. `navigator.vibrate(50)` pada PASS; `vibrate([80,40,80])` pada FAIL/CRITICAL.
- **Files:** `components/field/RunChecklist.tsx`, **PROPOSED NEW FILE** `lib/platform/wake-lock.ts`, `lib/platform/haptics.ts`.
- **Fallback:** `('wakeLock' in navigator)` / `('vibrate' in navigator)` → no-op diam (UX enhancement).
- **Security:** Permissions-Policy biarkan default (screen-wake-lock tidak perlu policy khusus); battery note di docs.
- **Tests:** mock API; pastikan release dipanggil (unit); manual di tablet.
- **Metric:** BENEFIT sebagian NOT YET MEASURABLE (UX) — ukur `screen_off_mid_run` sebagai proxy via RUM visibility events.

### FP-13 — Barcode detection
- **Priority:** P1/P2 · **Category:** FRONTEND ONLY
- **Target behavior:** `if ('BarcodeDetector' in window)` → aliran kamera ringan (`getUserMedia({video:{facingMode:'environment'}})`) + detect loop pada `FindingCapture` (ganti `simulateScan`), dan titik scan inventory/GRN bila diaktifkan; hasil → kolom kode aset; selalu ada tombol "enter manually" (perilaku hari ini).
- **Files:** `components/field/FindingCapture.tsx`, **PROPOSED NEW FILE** `lib/media/barcode.ts` (abstraksi start/stop, rAF-interval hemat baterai); (opsional P3) WASM ZXing fallback.
- **Backend:** validasi kode aset tetap server (sudah ada pola lookup aset).
- **Fallback:** tidak support / kamera ditolak → input manual.
- **Security:** Permissions-Policy `camera=(self)` hanya setelah fitur ini; jangan stream frame keluar.
- **Tests:** mock `BarcodeDetector`; deny-permission path; E2E dengan fake device (Playwright) bila memungkinkan, else unit.
- **Metric:** waktu memasukkan aset (scan vs manual); scan success rate. (Sebagian UX → baseline dikumpulkan agent.)

### FP-14 — SSE alerts
- **Priority:** P2 · **Category:** HYBRID
- **Blueprint flow:** lihat §4. Frontend mengganti SEED di `NotificationsHub.tsx` dengan state dari stream; tombol "Trigger Test P1" diarahkan ke POST nyata (atau dihapus dari UI produksi).
- **Backend:** **PROPOSED NEW FILE** `app/api/notifications/stream/route.ts` — `ReadableStream`, enqueue interval recompute (misal 15s) query SLA yang sama, heartbeat 25s, close pada 10 menit (client reconnect), header `Cache-Control: no-cache`, `X-Accel-Buffering: no`.
- **Fallback:** EventSource error berulang → polling GET 60s (helper FP-01).
- **Security:** sess cookie same-origin; cek ulang per-event bahwa tenant filter diterapkan (query memang sudah per-org).
- **Observability:** `sse_connect/open/drop/reconnect`, alert latency (waktu dari kondisi terpenuhi → event terkirim).
- **Tests:** integration stream mengirim heartbeat & event pada data uji; E2E dua klien menerima event tenant sendiri saja; kill koneksi → fallback polling aktif.
- **Rollout:** dev → limited (notifications page saja) → default. **Rollback:** komponen kembali ke SEED/GET satu-kali (flag).
- **Metric:** alert delivery latency <5s; reconnect success >99%; copy "WebSocket" palsu dihapus (audit teks).

### FP-15 — PWA manifest + installability
- **Priority:** P2 · **Category:** INFRA/CONFIG
- **Changes:** **PROPOSED NEW FILE** `app/manifest.ts` (name, short_name "Apex Field", `display: 'standalone'`, `theme_color` cobalt/slate900 per dua design system — satu manifest global; start_url `/`, `scope /`), ikon (192/512/maskable) di `public/icons/`, `metadata`/viewport export tema di layout, App Shortcuts: "New Finding" → `/field/findings/new`, "Sync Queue" → `/field/sync`.
- **Fallback:** tanpa manifest = aplikasi web biasa.
- **Observability/Rollout:** install prompt event ditangkap (counter); está gated oleh SW untuk kriteria lama — Chrome modern cukup manifest+HTTPS; dokumentasikan.
- **Tests:** Lighthouse PWA section (installable) lulus di field route; ikon tidak 404.
- **Metric:** install rate (basis sukarela).

### FP-16 — Service Worker app-shell + runtime cache
- **Priority:** P2 · **Category:** FRONTEND ONLY (infra file publik)
- **Target behavior:** **PROPOSED NEW FILE** `public/sw.js` + registrasi client (`lib/pwa/register-sw.ts`, dipanggil dari field+ops shell, hanya production build): precache app-shell field (halaman `/field/*`, CSS/JS hasil build via daftar saat deploy — gunakan pendekatan sederhana: runtime cache `stale-while-revalidate` untuk `_next/static`, `network-first` untuk dokumen field, `network-only` untuk mutasi & auth), offline fallback page (PROPOSED NEW FILE `app/(field)/field/offline/page.tsx` atau static `public/offline.html`), versioning `CACHE-v{N}` + cleanup activate.
- **Koordinasi:** CSP (FP-03) tidak menghambat SW (same-origin); jangan cache respons bercookie-scope sensitif; `POST` tidak pernah dicache.
- **Fallback:** SW gagal → situs normal; tombol "Reset offline data" di `/field/sync` (unregister + clear caches).
- **Observability:** `sw_install/activate/fetch_cache_hit`, gagal fetch saat offline → tampilkan banner.
- **Tests:** browser E2E: load → offline → navigasi field shell tetap render; API GET network-first jatuh ke banner (bukan data basi diam-diam); versi baru SW menggantikan lama; mutasi tetap network.
- **Rollout:** internal → limited (hanya field group) → default. **Rollback:** unregister & clear (endpoint halaman reset di atas); hapus registrasi.
- **Metric:** offline shell load success; cache hit rate static; tidak ada konten sesi basi setelah login ulang.

### FP-17 — Background Sync + Badging
- **Priority:** P2 · **Category:** FRONTEND ONLY
- **Target behavior:** saat enqueue (FP-06) dan `'serviceWorker' in navigator && 'SyncManager' in window` → `registration.sync.register('apex-outbox')`; handler `sync` di SW memanggil flush (postMessage ke klien terbuka bila ada, atau tandai "pending saat dibuka"); `setAppBadge(count)` saat outbox > 0, clear saat 0 (FieldShell badge dinamis menggantikan angka hardcoded 2).
- **Fallback:** `online` event + tombol Sync manual (sudah ada di FP-06); badging no-op.
- **Tests:** fake SyncManager (unit); badge count naik/turun; flush otomatis saat online (Chromium).
- **Metric:** waktu dari enqueue → synced pada koneksi pulih (turun vs manual).

### FP-18 — Web Push eskalasi P1
- **Priority:** P2/P3 · **Category:** HYBRID
- **Target behavior:** server menyimpan subscription per user (`push_subscriptions` tabel baru; VAPID keys via env — **PROPOSED SECRET ENV** `VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY`); ketika notifikasi severity P1 tercipta (logika yang sama dengan `/api/notifications`), kirim push; SW `push` event → `showNotification` dengan deep link ke WO; `notificationclick` fokus tab.
- **Frontend:** izin notifikasi dari halaman Settings saja (bukan prompt agresif); unsubscribe UI.
- **Fallback:** tidak ada push → SSE (FP-14) tetap kanal utama.
- **Security:** endpoint disimpan terenkripsi-at-rest bila kebijakan mengharuskan; payload minimal (tanpa data WO sensitif — hanya nomor + link); permission `wo.read` saat membuka.
- **Rollout:** internal (uji VAPID) → opt-in per-user. **Rollback:** hapus subscription, matikan enqueue.
- **Metric:** P1 ack time turun; delivery rate (requires web-push lib server — putuskan di fase itu; boleh implement via fetch ke service push dengan JWT manual, atau lib — dicatat sebagai dependency decision).

### FP-19 — Passkeys
- **Priority:** P2 · **Category:** HYBRID
- Blueprint §4. Backend: tabel `webauthn_credentials` (credential_id, public_key, counter, transports, user_id, org_id, name, created_at, last_used_at), challenge store TTL 5 menit (reuse tabel/pola challenge MFA bila ada), routes: `POST /api/auth/webauthn/register/options|verify`, `POST /api/auth/webauthn/login/options|verify`, delete-kredensial; verifikasi assertion+attestation — **dependency decision:** implementasi manual (besar, berisiko) vs `@simplewebauthn/server` — rekomendasi: izinkan dependency pada fase itu (dicatat eksplisit, karena plan ini zero-dep by default).
- Frontend: tombol "Add passkey" di `ProfileSessions`, opsi passkey pada step MFA di `LoginForm` (bila user punya kredensial), nama perangkat.
- Fallback: TOTP tetap; passkey tak pernah jadi satu-satunya faktor pada fase awal.
- Security: `rp.id` domain produksi; `userVerification: 'preferred'`; counter regresi → tolak + alert audit.
- Tests: virtual authenticator (Playwright/WDIO) register+login; counter replay ditolak; fallback TOTP masih jalan.
- Rollout: internal → opt-in role admin/VP. Rollback: nonaktifkan opsi login passkey; kredensial tetap tersimpan.
- Metric: waktu penyelesaian MFA ↓; % login MFA via passkey (adopsi).

### FP-20 — Playwright harness
- **Priority:** P2 · **Category:** INFRA/CONFIG
- **Changes:** tambah devDependency `@playwright/test` (keputusan dependency dicatat), config baseURL dev server, skenario smoke: login (dengan devHint TOTP non-prod) → dashboard 200 → transisi WO uji pada DB temp → logout; util `context.grantPermissions` untuk geolocation/kamera pada tes FP-10/11/13; trace + screenshot on failure.
- **Fallback:** tidak menghalangi pipeline bila browser download gagal di CI (job terpisah, non-blocking awal).
- **Metric:** smoke pass rate; durasi suite <5 mnt.

### FP-21 — Lazy-render list besar
- **Priority:** P2 · **Category:** FRONTEND ONLY
- **Target behavior:** tabel audit trail (412+ baris) & ledger: render windowing sederhana dengan `IntersectionObserver` pada sentinel (chunk 50 baris) — bukan lib virtualisasi (zero-dep); pencarian/filter memotong dataset dulu, lalu windowing membatasi DOM.
- **Files:** `components/audit/AuditTrail.tsx`, `components/inventory/InventoryLedger.tsx`, **PROPOSED NEW FILE** `lib/ui/use-infinite-window.ts`.
- **Fallback:** observer tak tersedia → render penuh (perilaku lama).
- **Metric:** INP pada interaksi filter; main-thread blocking saat scroll (bandingkan sebelum/sesudah via FP-07 longtask).

### FP-22 — showSaveFilePicker export
- **Priority:** P3 · **Category:** FRONTEND ONLY
- **Changes:** perluas `lib/download.ts`: `if ('showSaveFilePicker' in window)` → picker dengan `types` csv/json; tulis via `FileSystemWritableFileStream`; selain itu → anchor (FP-02).
- **Fallback:** anchor. **Tests:** unit branching; E2E Chromium untuk happy path (opsional).
- **Metric:** UX — BENEFIT NOT YET MEASURABLE (ditandai), adopsi rendah diperkirakan.

### FP-23 — Worker untuk CSV/dossier + hapus pseudo-hash klien
- **Priority:** P3 · **Category:** FRONTEND ONLY
- **Changes:** **PROPOSED NEW FILE** `lib/workers/export.worker.ts` (DERET → CSV string), dipakai bila dataset > ambang (misal >2.000 baris) dan `'Worker' in window`; `AuditTrail` memakai hash dari server (API audit sudah menyediakan hash asli) — hapus generator pseudo-hash klien dari path tampilan.
- **Fallback:** main-thread build (perilaku lama) dengan `scheduler`-yield sederhana.
- **Metric:** long-task count saat export 412-record → 0 di atas 50ms; waktu export total.

### FP-24 — View Transitions
- **Priority:** P3 · **Category:** EXPERIMENTAL
- **Changes:** `document.startViewTransition` pada navigasi list↔detail (hook router events bila Next 16 exposure memungkinkan; agent memverifikasi). Fallback: navigasi normal.
- **Metric:** persepsi (INP tidak berubah; ukur CLS tidak naik). Digelar hanya setelah Wave 1–3 stabil.

### FP-25 — Self-host font
- **Priority:** P1/P2 · **Category:** INFRA/CONFIG
- **Changes:** letakkan woff2 (Inter/JetBrains Mono/Space Grotesk) di `app/fonts/` + `next/font/local` di `app/layout.tsx` (variabel CSS), hapus komentar TODO; preload otomatis oleh next/font; hapus UI font-fallback flash risk.
- **Fallback:** system stack (perilaku sekarang) via `fallback` option.
- **Metric:** CLS font-swap ≈ 0; request font lokal 200 (bukan CDN — sesuai prinsip zero-CDN).

### FP-26 — Paralelisasi `/api/search`
- **Priority:** P2 · **Category:** BACKEND ONLY
- **Changes:** 4 query tenant-scope di `app/api/search/route.ts` dibungkus `Promise.all` (dan batalkan sisanya bila satu error dengan log yang jelas); permission check ulang apakah `audit.read` tepat untuk palette (agent memverifikasi intent — kemungkinan harus permission yang dimiliki semua role operasional).
- **Metric:** API latency p95 route itulah; waktu hingga hasil palette.

---

## §7. FILE-LEVEL CHANGE PLAN

| File / area | Proposed responsibility | Planned change | Reason |
|---|---|---|---|
| `lib/api/client.ts` **PROPOSED NEW FILE** | satu-satunya fetch helper FE (timeout/abort/trace/envelope) | buat + adopsi bertahap | FP-01 |
| `components/ops/CommandPalette.tsx` | pencarian ⌘K | pakai helper; abort saat query berubah | FP-01 race fix |
| 9 call-site fetch lain (+`lib/offline/outbox.ts` flush via FP-06) | mutasi/auth/search | migrasi ke helper | FP-01 |
| `lib/download.ts` **PROPOSED NEW FILE** | download terpusat + revoke | buat; migrasi 12 komponen | FP-02; extend FP-22 |
| `next.config.mjs` | konfigurasi Next | `headers()` CSP report-only + Permissions-Policy + nosniff + referrer | FP-03; koordinasi FP-11/13 (camera/geo) |
| `app/api/security/csp-report/route.ts` **PROPOSED NEW FILE** | terima CSP report | validasi body, log, no-store | FP-03 |
| `lib/api/http.ts` | plumbing API | `csrfFailure` + fetch-metadata; emit `Server-Timing` | FP-04, FP-08 |
| `lib/auth/csrf.ts` | (dead) double-submit | HAPUS (keputusan) atau wire — direkomendasikan hapus | FP-04 |
| `components/ops/TopBar.tsx` | logout | purge state lokal + broadcast `LOGOUT` | FP-05 |
| `lib/auth/broadcast.ts` **PROPOSED NEW FILE** | kanal auth antar-tab | buat + fallback storage-event | FP-05 |
| `lib/offline/db.ts` **PROPOSED NEW FILE** | wrapper IndexedDB minimal | buat | FP-06 |
| `lib/offline/outbox.ts` | API outbox (tetap) | ganti storage → IDB v2; TTL; migrasi dari localStorage v1 | FP-06 |
| `components/field/SyncStatus.tsx` | UI antrian sync | render data nyata; retry/sync-all dari modul | FP-06 |
| `components/field/RunChecklist.tsx` | checklist run | enqueue saat offline; wake lock; vibrate; (FP-11 attach) | FP-06/11/12 |
| `components/field/FindingCapture.tsx` | capture finding | geolocation nyata; input capture; scan nyata (feature-detect) | FP-10/11/13 |
| `lib/media/evidence.ts` **PROPOSED NEW FILE** | hash+resize+FormData | buat | FP-11 |
| `app/api/work-orders/[id]/evidence/upload/route.ts` **PROPOSED NEW FILE** | terima multipart | validasi+simpan+addEvidence+audit | FP-11 |
| `lib/media/barcode.ts` **PROPOSED NEW FILE** | abstraksi scan kamera | buat (BarcodeDetector) | FP-13 |
| `lib/platform/wake-lock.ts`, `lib/platform/haptics.ts` **PROPOSED NEW FILES** | ergonomi tablet | buat | FP-12 |
| `lib/telemetry/rum.ts` **PROPOSED NEW FILE** | collector RUM | buat + mount di 2 layout | FP-07 |
| `app/api/telemetry/rum/route.ts` **PROPOSED NEW FILE** | ingest RUM | zod+sampling+agregasi | FP-07 |
| `lib/api/etag.ts` + 3–5 routes GET | conditional GET | wire `createEtagResponse`; counter 304 | FP-09 |
| `components/notifications/NotificationsHub.tsx` | hub alerts | SEED → SSE state + fallback polling; hapus copy WebSocket | FP-14 |
| `app/api/notifications/stream/route.ts` **PROPOSED NEW FILE** | SSE | ReadableStream + heartbeat + tenant filter | FP-14 |
| `app/manifest.ts` **PROPOSED NEW FILE** · `public/icons/*` | installability | buat | FP-15 |
| `public/sw.js` + `lib/pwa/register-sw.ts` **PROPOSED NEW FILES** | cache app-shell/runtime | buat + registrasi prod-only | FP-16; konsumsi FP-17 |
| `app/(field)/field/offline/page.tsx` atau `public/offline.html` **PROPOSED NEW FILE** | fallback offline | buat | FP-16 |
| `components/field/FieldShell.tsx` | chrome field | badge sync dinamis (setAppBadge + count) | FP-17 |
| `app/api/auth/webauthn/*` + `db/schema.ts` + `components/profile/ProfileSessions.tsx` + `components/auth/LoginForm.tsx` | passkeys | tabel+routes+UI | FP-19 |
| `playwright.config.ts` + `e2e/*` **PROPOSED NEW FILES** | harness E2E | buat | FP-20 |
| `lib/ui/use-infinite-window.ts` **PROPOSED NEW FILE** + `AuditTrail.tsx`/`InventoryLedger.tsx` | windowing sederhana | buat+adopsi | FP-21 |
| `lib/workers/export.worker.ts` **PROPOSED NEW FILE** | CSV berat | buat + adopsi bila ambang | FP-23 |
| `app/fonts/*` + `app/layout.tsx` | font self-host | `next/font/local` | FP-25 |
| `app/api/search/route.ts` | pencarian | `Promise.all` + review permission | FP-26 |

---

## §8. TYPESCRIPT DESIGN (bentuk modul — konseptual, bukan kode penuh)

Pola baku browser-side:
```
Capability detection → Typed abstraction → Primary implementation → Fallback implementation
```

```ts
// lib/platform/capability.ts — konvensi tunggal
export interface Capability {
  readonly id: string;
  isSupported(): boolean;            // feature-detect murni, tanpa UA sniff
}

// Pola "provider dengan fallback"
export interface Provider<TArgs, TResult> {
  isSupported(): boolean;
  run(args: TArgs): Promise<TResult>;
}
export function withFallback<A, R>(primary: Provider<A, R>, fallback: Provider<A, R>): Provider<A, R>;

// lib/api/client.ts (FP-01)
export interface ApiError { code: string; message: string; status: number; requestId?: string }
export interface ApiFetchOptions extends Omit<RequestInit, 'signal'> {
  timeoutMs?: number;                 // default 15s GET / 30s lain
  idempotencyKey?: string;            // auto crypto.randomUUID() untuk mutasi bila tak diberi
  signal?: AbortSignal;               // digabung dengan timeout
  traceparent?: string;               // diteruskan dari respons sebelumnya
}
export function apiFetch<T>(input: string, opts?: ApiFetchOptions): Promise<T>; // lempar ApiError

// lib/offline/outbox.ts (FP-06) — API publik TIDAK berubah; engine storage di bawahnya
export interface OutboxStorage {
  load(): Promise<OutboxItem[]>; save(items: OutboxItem[]): Promise<void>;
  migrateLegacy?(): Promise<void>;    // localStorage v1 → v2
}

// lib/media/evidence.ts (FP-11)
export interface PreparedEvidence {
  file: Blob; fileName: string; mimeType: string; fileSize: number;
  sha256Hash: string;                 // heksadesimal, client-computed (advisory)
  wasResized: boolean;
}
export function prepareEvidence(file: File, opts?: { maxEdge?: number; quality?: number }): Promise<PreparedEvidence>;

// lib/telemetry/rum.ts (FP-07)
export interface RumEvent { kind: 'webvital'|'longtask'|'error'|'mark'; name: string; value: number; route: string; ts: number }
export function initRum(opts: { sample: (e: RumEvent) => boolean }): () => void; // return disposer

// lib/media/barcode.ts (FP-13)
export interface ScannerHandle { stop(): void }
export async function startScan(video: HTMLVideoElement, onHit: (code: string) => void): Promise<ScannerHandle | null>; // null = unsupported/denied

// lib/platform/wake-lock.ts (FP-12)
export interface WakeLockController { acquire(): Promise<boolean>; release(): Promise<void>; readonly active: boolean }
export function createScreenWakeLock(): WakeLockController;   // no-op controller bila unsupported
```

Batas modul: folder `lib/platform/*` (primitive browser), `lib/media/*` (capture/proses), `lib/offline/*` (antrian), `lib/api/client.ts` (transport) — komponen hanya berbicara dengan abstraksi ini, tidak langsung ke `navigator.*` (kecuali yang sudah ada dan tetap: onLine/clipboard/print).

---

## §9. FEATURE DETECTION (konvensi wajib)

| Capability | Deteksi |
|---|---|
| IndexedDB | `'indexedDB' in globalThis` + uji open sekali (private mode gagal-open) |
| BroadcastChannel | `'BroadcastChannel' in globalThis` |
| sendBeacon | `'sendBeacon' in navigator` (fallback `fetch keepalive`) |
| PerformanceObserver tipe | `PerformanceObserver.supportedEntryTypes?.includes('layout-shift')` dll |
| Geolocation | `'geolocation' in navigator` (+ hasil izin via `navigator.permissions.query({name:'geolocation'})` bila ada) |
| Wake Lock | `'wakeLock' in navigator` |
| Vibration | `'vibrate' in navigator` |
| BarcodeDetector | `'BarcodeDetector' in window` (+ `getSupportedFormats()` memuat `'qr_code'/'code_128'`) |
| File System Access | `'showSaveFilePicker' in window` |
| Service Worker | `'serviceWorker' in navigator` (hanya prod) |
| Background Sync | `'SyncManager' in window` |
| Badging | `'setAppBadge' in navigator` |
| WebAuthn | `window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` |
| EventSource | `'EventSource' in window` |
| Worker | `'Worker' in window` |
| View Transitions | `'startViewTransition' in document` |
| AbortSignal.timeout | `'timeout' in AbortSignal` (fallback timer manual) |

DILARANG: deteksi nama browser/UA untuk memilih jalur. UA hanya boleh dicatat di agregasi RUM (FP-07) sebagai dimensi analisis.

---

## §10. FALLBACK MATRIX

| Capability | Primary path | Fallback | Failure behavior |
|---|---|---|---|
| AbortSignal.timeout | timer bawaan | timer manual + abort | request tetap berbatas waktu |
| IndexedDB | antrian persisten | antrian in-memory per-tab | banner "queue tidak persisten"; tidak ada data hilang tanpa peringatan |
| localStorage→IDB migrasi | baca+salin+bersihkan legacy | abaikan legacy (tetap utuh) | antri baru tetap jalan; legacy tak hilang |
| sendBeacon | beacon saat pagehide | `fetch keepalive` | sesi itu tanpa beacon → metrik kurang, tak ada error user |
| PerformanceObserver tipe | observer penuh | subset (navigation timing) | RUM parsial, ditandai per event |
| Geolocation | koordinat aktual | input manual zone (ada) | label "manual"; submit tak terblokir |
| `<input capture>` | kamera langsung (mobile) | file picker biasa | attach tetap mungkin |
| canvas resize | ≤1600px JPEG | kirim file asli | server tetap validasi/encode ulang |
| crypto.subtle | hash klien | tanpa hash klien | server hash authoritative — tidak ada celah |
| BarcodeDetector | scan kamera | input manual (perilaku lama) | UX turun, fungsi utuh |
| Wake Lock | layar tetap nyala | — | UX turun; tak ada error |
| Vibration | haptic | — | no-op diam |
| EventSource | stream SSE | polling GET 60s | latency naik, data sama |
| Service Worker | app-shell offline | web normal online | tak ada offline, tak ada error |
| Background Sync | flush otomatis | flush saat `online`/manual | antrian menunggu aksi user |
| Badging | badge ikon/app | angka di tab UI saja | kosmetik |
| WebAuthn | passkey | TOTP (ada) | login tetap MFA |
| showSaveFilePicker | dialog save-as | anchor download | perilaku lama |
| Worker | CSV off-thread | main-thread (ambang mengecil) | UI berat hanya pada dataset besar |
| View Transitions | animasi | navigasi normal | kosmetik |
| Web Push | push native | SSE in-app | eskalasi hanya saat app terbuka |
| CSP enforce | blokir pelanggaran | report-only | keamanan turun terkontrol + visibility |

---

## §11. NATIVE REPLACEMENT PLAN

| Existing implementation | Native capability | Replacement scope | What remains | Migration approach | Expected benefit | Risk | Fallback | Recommendation |
|---|---|---|---|---|---|---|---|---|
| 12× pola download Blob/anchor inline | (util internal; nanti File System Access) | seluruh 12 komponen | Blob/anchor sebagai fallback sah | buat util → migrasi per komponen → hapus inline | −150 baris; 1 titik revoke; titik upgrade picker | regresi filename/konten | perilaku lama per komponen | **REPLACE** |
| Simulasi `/field/sync` (setTimeout) | IndexedDB outbox + online events (+Background Sync) | `SyncStatus.tsx`, enqueue di RunChecklist/FindingCapture | idempotency server (tetap) | FP-06 storage swap → wiring UI → BroadcastChannel | janji offline jadi nyata | kompleksitas IDB di private mode | antrian in-memory + banner | **REPLACE** |
| localStorage sebagai storage outbox | IndexedDB | storage layer `lib/offline/outbox.ts` | API publik modul | schema v2 + migrasi v1 | async, kapasitas, index status | kegagalan open IDB | v1 tetap dibaca (tak dihapus dulu) | **REPLACE** |
| Copy/toast "WebSocket" palsu | SSE (EventSource) | `NotificationsHub` (+ copy AuditTrail diralat) | GET list sebagai fallback/polling | route stream baru → ganti state SEED | transport nyata satu arah | beban koneksi per tab | polling 60s | **REPLACE** |
| GPS literal hardcoded | Geolocation API | FindingCapture (+ label sumber koordinat) | input manual | tombol "use current location" + auto saat capture | bukti koordinat benar | permission deny umum | manual | **REPLACE** (dgn label klaim) |
| `simulateScan` timeout | BarcodeDetector | FindingCapture; (ops) inventory/GRN nanti | entri manual | abstraksi scanner + kamera | waktu input aset ↓ | support Chromium saja | manual input | **REPLACE** (feature-detect) |
| Debounce-only ⌘K | AbortController (bukan "native baru" — API platform) | palette + semua fetch | debounce (tetap, untuk hemat request) | helper FP-01 | race hilang | salah meng-abort request valid → handled | perilaku lama | **REPLACE** |
| Pseudo-hash generator klien (`getPseudoHash`) | hash audit asli dari server (`audit-service` sha256) | tampilan `AuditTrail` | tidak ada hashing klien | ganti sumber data kolom hash → field API | integritas tampilan forensik | data API harus sudah berisi hash (agent verifikasi) | sembunyikan kolom | **REPLACE** |
| Ikon lucide `QrCode` sbg "QR" di print | — (tidak ada API native encode QR) | — | placeholder | perlu lib kecil (bukan native) | — | — | placeholder tetap | **KEEP (DEFER)** — bukan kandidat native |
| Radix Dialog/AlertDialog | `<dialog>` native | — | Radix | — | — | kehilangan focus-trap konsisten Safari | — | **KEEP** |
| `window.print()` + print CSS | (tetap print API) | — | semua | — | sudah native & tepat | — | — | **KEEP** |
| `navigator.onLine` + events | (tetap) | — | diperluas memicu flush (FP-06) | — | fondasi benar | — | — | **KEEP** (augment) |
| Sesi cookie httpOnly | Cookie Store API | — | cookie apa adanya | — | httpOnly sengaja tak bisa diakses JS | — | — | **KEEP** (jangan ubah) |

---

## §12. BACKEND OFFLOAD PLAN

| Workload | Current backend responsibility | Proposed browser responsibility | Backend after change | Expected bandwidth reduction | Expected CPU reduction | Security boundary | Fallback | Kategori |
|---|---|---|---|---|---|---|---|---|
| Resize foto evidence | — (belum ada upload) | resize ≤1600px JPEG q0.8 (canvas) | validasi+simpan; (opsional) re-encode kanonik | ~60–80% per foto (BASELINE TBD) | decode/encode turun bila server re-encode dimatikan utk file sudah patuh | server tak pernah percaya dimensi/mime klien | kirim asli | **PARTIAL OFFLOAD** |
| SHA-256 evidence | server minta `sha256Hash` (tak ada penghitung) | `crypto.subtle` digest | re-hash & bandingkan; simpan | — (hemat retry duplikat) | tak berubah | hash klien = advisori | tanpa hash klien | **SAFE CLIENT OPTIMIZATION** |
| Watermark GPS/wkatu pada foto | — | overlay canvas (kosmetik) | tetap catat `receivedAt`; overlay bukan bukti | — | — | teks overlay = klaim | foto polos | **SAFE CLIENT OPTIMIZATION** |
| Decode barcode | — | BarcodeDetector | validasi keberadaan aset/tenant | — | — | kode divalidasi server | input manual | **SAFE CLIENT OPTIMIZATION** |
| Build CSV dossier besar | copy UI mengklaim stream server | (P3) Worker klien utk preview kecil; ekspor penuh tetap server | ekspor authoritative (ops: streaming route) | — | — | data scope RBAC | build di main thread | **KEEP SERVER SIDE** (preview boleh klien ≤ N baris) |
| Cache list read-only lapangan | — | SW runtime cache + IDB (FP-16/06) | ETag/304 + TTL policy + invalidasi saat mutasi | hemat GET berulang | query berulang turun | cache = snapshot milik sesi; purge on logout (FP-05) | network normal | **SAFE CLIENT OPTIMIZATION** |
| Kompresi export | — | (P3) CompressionStream | fallback plain | bytes arsip ↓ | CPU kompres bergeser sebagian | integritas arsip tetap server-side saat diminta | plain | **PARTIAL OFFLOAD (P3)** |
| Pencarian lokal atas cache field | — | filter IndexedDB scope teknisi | canonical search server tetap | request ⌘K pada data cache ↓ | query ringan turun | hasil lokal diberi label "offline snapshot" | fetch server | **SAFE CLIENT OPTIMIZATION (Wave 4, opsional)** |

---

## §13. PERFORMANCE PLAN

> Baseline belum tersedia untuk semua baris → **BASELINE TO BE COLLECTED BY IMPLEMENTATION AGENT** (via FP-07 + FP-08 + §25 Phase 0).

| Feature | Baseline metric | Expected direction | Success criteria | Regression signal |
|---|---|---|---|---|
| FP-01 abort | request count/sesi ⌘K; stale-overwrite count | ↓ / → 0 | overwrite basi = 0 di test; −≥30% request saat mengetik cepat | error `AbortError` tampil ke user (tidak boleh) |
| FP-02 download util | KB JS duplikat; objectURL hidup pasca-download | ↓ / → 0 | revoke terverifikasi 12/12 | ekspor gagal di 1 komponen pun |
| FP-06 outbox | offline success rate (uji skenario) | → ≥99% | 0 item hilang; replay 409→SYNCED | FAILED-permanent naik di koneksi baik |
| FP-07 RUM | — (alatnya sendiri) | — | p75 per route terlihat | overhead longtask collector > N ms (ukur diri sendiri via self-mark) |
| FP-08 Server-Timing | — | — | header ada 100% respons API | header salah format |
| FP-09 ETag | network bytes list; 304 hit rate | ↓ / ↑≥30% kunjungan ulang | 304 berisi 0 byte; 200 tetap benar setelah mutasi | stale list setelah transisi (invalidasi alami: ETag konten — ok) |
| FP-11 upload | upload bytes/evidence; waktu attach; backend CPU decode | ↓ ≥60% (resize) | rasio kompresi ≥3; sukses ≥99% jaringan baik | kegagalan mime valid (false reject) |
| FP-14 SSE | latency kondisi→event; polling req count | <5s / ↓ | reconnect >99% | koneksi menumpuk di server (pantau count) |
| FP-16 SW | offline shell load; cache hit static | berhasil / ↑ | field shell render offline setelah kunjungan pertama | konten sesi basi; SW tak update (versi) |
| FP-21 windowing | INP filter audit 412; longtask scroll | ↓ | longtask >50ms saat scroll → ~0 | baris salah/hilang (correctness test) |
| FP-23 Worker CSV | longtask saat ekspor | → 0 | ekspor selesai; UI responsif | worker crash → fallback benar |
| FP-25 font | CLS font-swap | → ~0 | preload 200; tanpa CDN | FOUT mencolok di 3G |
| FP-26 search parallel | p95 latency route | ↓ ≥30% | hasil identik dgn sekuensial | satu query gagal → 500 total (harus degradasi parsial) |

---

## §14. OBSERVABILITY PLAN

**Frontend (FP-07 collector + custom marks per fitur):**
- Web Vitals & long tasks: LCP, INP (event timing), CLS, longtask — per route-group dinormalisasi (`/work-orders/[id]`).
- Custom marks/measures: `login_to_interactive`, `outbox_enqueue→synced`, `evidence_attach_total`, `sse_first_event`, `sw_offline_render`.
- Error: `window.onerror`, `unhandledrejection` (stack dipotong, tanpa PII).
- Dimensi: route, koneksi efektif (bila ada), UA mentah (analisis agregat), versi SW.
- Transport: beacon batched ≤~8KB; sampling client+server.

**Backend (memakai pola `lib/telemetry/metrics.ts` — rolling window + route summary):**
- FP-08: `Server-Timing` semua API.
- FP-09: counter `etag_304` per route.
- FP-11: `upload_bytes_total`, `upload_duration_ms`, `upload_rejected{reason}` (mime/oversize), rasio resize klien (field advisory).
- FP-14: `sse_connections_open`, `sse_events_sent`, `sse_reconnects`, umur koneksi.
- FP-06 (server sisi efek): rate 409 idempotency naik saat replay = sinyal sehat (diberi note di dashboard).
- FP-19: `webauthn_register/verify` sukses-gagal; counter-regression attempts (harus 0; >0 → alert).
- FP-03: CSP violation count per directive (dari route report).
- Semua route baru ikut `withRoute` → RED metrics otomatis.

---

## §15. SECURITY PLAN (migration strategies)

**CSP (FP-03)**
```
Report-only (semua route; report ke /api/security/csp-report)
 ↓ amati ≥1 siklus release; triase violation
Perbaiki path yang melanggar (inline event handler di print pages → client component kecil;
 atribut on* string dihapus; third-party = nol by design)
 ↓
Enforce (script-src 'self'; style-src 'self' 'unsafe-inline' [Tailwind runtime aman? agent verifikasi —
 bila perlu nonce/hash di tahap lanjut]; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self')
 ↓
Tetap report-to aktif pasca-enforce
```

**Permissions-Policy (FP-03, dikunci dengan FP-10/11/13/18):**
```
Default deny semua fitur ( camera=(), microphone=(), geolocation=(), notifications=() )
 ↓ saat fitur mendarat:
geolocation=(self)  [FP-10] → camera=(self) [FP-11/13] → notifications=(self) [FP-18]
Prinsip: header hanya dilonggarkan oleh PR fitur, bukan pre-emptif.
```

**WebAuthn (FP-19)**
```
Auth sekarang (password+TOTP) tetap
 ↓ registrasi passkey di profil (sesi aktif + konfirmasi ulang)
 ↓ login passkey sebagai faktor tambahan (challenge TTL 5 mnt, counter)
 ↓ recovery tetap via TOTP (+ admin revoke sesi); kredensial bisa dihapus per perangkat
 ↓ (P3) evaluasi passkey-first utk role tinggi setelah adopsi > ambang
```

**Trusted Types:** **DO NOT IMPLEMENT sekarang** — audit: 0 sink berbahaya; masuk daftar §33 DO NOT IMPLEMENT (revisit bila nanti ada sink HTML dinamis).

**Cookie/sesi:** tidak diubah (sudah benar). **Auth lintas-tab:** sinyal via FP-05 tanpa payload.

---

## §16. STORAGE PLAN (migrasi localStorage → IndexedDB)

```
localStorage key 'apexops_field_outbox_v1' (array JSON)
 ↓ saat modul dimuat: baca → JSON.parse aman (try/catch) → validasi schema item (zod ringan/validator manual)
 ↓ item valid → tulis ke IDB store 'outbox' (schemaVersion: 2)
 ↓ item tak valid → pindahkan ke key 'apexops_field_outbox_v1_corrupt' (jangan hapus bukti; tampilkan note di UI sync)
 ↓ setelah sukses: hapus key v1 (kecuali salinan corrupt)
 ↓ operasi berikutnya murni IDB
```
- **Schema/versioning:** `db.open(name, 2, {upgrade})`; store `outbox` index `by-status`, `by-createdAt`; record menyimpan `schemaVersion` per item.
- **TTL:** item `SYNCED` dihapus saat flush selesai (perilaku `clearSyncedOutbox` tetap); item non-synced > 7 hari → ditandai `EXPIRED`, tidak di-replay, disembunyikan di balik "show expired".
- **Invalidation:** per-user guard — simpan `userIdHash` (hash sederhana dari id sesi view) di metadata store; bila beda user → antrian diblokir + prompt "queue milik sesi lain" (diputuskan user: hapus/pertahankan) — mencegah replay lintas user pada shared tablet; logout (FP-05) = purge total.
- **Sensitive-data:** payload hanya mutasi domain (tanpa PII di luar yang disubmit); dokumentasikan bahwa perangkat bersama = purge wajib (FP-05 menutup ini).
- **Cross-tab:** BroadcastChannel 'apex-outbox' (invalidate + status flip); tab yang memulai flush menandai `SENDING` agar tab lain tidak double-send; 409 server = bukti dedup akhir.

---

## §17. WORKER PLAN

```
Main thread (komponen export)
 ↓ pesan {rows, columns, format} via postMessage (structured clone; rows = array objek kecil)
Web Worker 'export.worker.ts'
 ↓ serialisasi CSV (escape, header) incremental → string (atau bagian-bagian)
Main thread ← {csvString} → Blob → lib/download.ts (revoke pasti)
```
- **Kandidat saat ini:** CSV dossier (412+ records) di `AuditTrail`/`ReportsHub`; kandidat nanti: resize batch foto (OffscreenCanvas di worker — gate: hanya jika utama-thread resize terbukti jadi longtask dari RUM), kompresi arsip.
- **Kapan dipakai:** dataset > ambang (usul 2.000 baris atau perkiraan JSON >1MB) — di bawah itu tetap main thread (biaya spawn tak sepadan).
- **Fallback:** `Worker` tak tersedia/error → build di main thread + `setTimeout(0)` yield per 500 baris.
- **Keputusan sadar (bukan hype):** volume data hari ini kecil-sedang → **P3**; dijadwalkan setelah RUM (FP-07) membuktikan longtask nyata; jangan masuk critical path.

---

## §18. REALTIME PLAN

| Requirement | Proposed transport | Reason |
|---|---|---|
| SLA/P1 alert ke hub ops (FP-14) | **SSE** | satu arah, frekuensi menit, payload kecil, auto-reconnect, HTTP/proxy-friendly, auth cookie biasa |
| Push saat app tertutup (FP-18) | **Web Push** | satu-satunya jalur ke user tanpa tab terbuka; severity P1 saja |
| Sinkronisasi status antar-tab (FP-05/06/17) | **BroadcastChannel** | same-origin lokal, bukan jaringan |
| Status koneksi/online | events `online/offline` | bawaan, cukup |
| Chat/kolaborasi dua arah | — | tidak ada requirement → **tidak dibangun** (lihat §33 DO NOT IMPLEMENT: WebSocket generik, WebTransport) |

Pertimbangan konseptual tercatat: two-way tak dibutuhkan; ukuran pesan kecil; reconnect SSE otomatis + backoff manual; kompatibilitas proxy baik (tambahkan anti-buffering header); kompleksitas operasional jauh di bawah WS (tanpa handshake kustom/auth kustom).

---

## §19. PWA / OFFLINE PLAN

- **Phase 1 — Manifest (FP-15):** `app/manifest.ts`, ikon, tema, shortcuts; kriteria installable diverifikasi Lighthouse.
- **Phase 2 — Service Worker (FP-16):** registrasi prod-only; siklus hidup update + halaman reset.
- **Phase 3 — Static cache:** `_next/static` SWR; font lokal (FP-25) precache; offline fallback page.
- **Phase 4 — Runtime cache (hati-hati):** HANYA GET milik sesi dengan policy network-first + max-age pendek + purge on logout; boleh ditiadakan pada tahap awal — putuskan per-route (daftar kandidat: GET list field milik teknisi).
- **Phase 5 — Offline UX:** banner (ada: `FieldOffline`), status antrian nyata (FP-06), label "offline snapshot" pada data cache.
- **Phase 6 — Background sync (FP-17).**
- **Phase 7 — Installability/push (FP-15 lanjutan, FP-18).**

Kategori data:
- **static asset** → precache/SWR (aman).
- **cacheable API** → GET list scope-user, TTL pendek, label snapshot (hati-hati; default: network-first).
- **user data (preferensi UI)** → localStorage boleh (non-sensitif, kalau nanti ada).
- **transactional data** → JANGAN cache; mutasi murni jaringan/outbox.
- **sensitive data** (sesi, evidence bytes, payload findings) → tidak di-cache oleh SW; outbox IDB dengan purge-on-logout + user-guard.

Tidak offline-first menyeluruh: shell ops desktop tetap online-first; offline difokuskan ke grup route `(field)`.

---

## §20. WEBGPU / WASM / LOCAL AI PLAN

**WebGPU:** tidak ada use case aktual (viewer BIM 3D/ML tidak ada di produk) → **DO NOT IMPLEMENT** (§33).
**WASM saat ini:** PGlite di server (tetap). Kandidat client: **ZXing WASM** sebagai fallback BarcodeDetector — **Workload:** decode frame kamera → string kode aset; **Input:** ImageData; **Output:** string; **Why browser-side:** menghemat roundtrip frame; **Primary:** BarcodeDetector native; **Fallback:** input manual (WASM hanya jika gap cross-browser terbukti menyakitkan); **Worker:** tidak wajib (detect throttled rAF); **Memory:** <16MB; **Rollout:** P3 opt-in. **Recommendation: DEFER.**
**WebCodecs/MediaRecorder (voice note evidence):** ada sinyal produk ("VOICE NOTE · 0:12"). Plan konseptual: MediaRecorder (audio/webm) → jalur upload FP-11 yang sama (FormData + hash + validasi mime server) → **P3 setelah FP-11 stabil**; WebCodecs encode custom = **DO NOT IMPLEMENT** (MediaRecorder cukup).
**Local AI:** tidak didukung requirement data saat ini → **DO NOT IMPLEMENT**; kriteria revisit tertulis: volume catatan WO besar & permintaan ringkasan lokal dari lapangan.

---

## §21. IMPLEMENTATION WAVES

**Wave 0 — Baseline & safety**
FP-07 RUM (collector+route, sampling 100% dev) · FP-08 Server-Timing · §8 capability module + konvensi feature-detect · FP-20 Playwright skeleton (smoke login→dashboard) · snapshot baseline performa (skrip Lighthouse/notes) · **TASK-01..04**.

**Wave 1 — Low-risk improvements**
FP-01 helper + migrasi semua call-site (perbaiki race ⌘K) · FP-02 download util · FP-12 wake lock + vibrate · FP-10 geolocation · FP-09 ETag wiring · FP-26 search parallel (+review permission) · FP-25 font self-host.

**Wave 2 — Security & reliability**
FP-03 CSP report-only + Permissions-Policy + report endpoint · FP-04 CSRF fetch-metadata + hapus csrf lib · FP-05 logout hygiene + broadcast · FP-06 outbox IDB penuh (storage+wiring+migrasi) · enforce CSP di akhir wave bila violation bersih.

**Wave 3 — Performance**
FP-21 windowing list · FP-23 worker CSV (bila RUM menunjukkan longtask) · FP-11 upload pipeline (capture→hash→upload; resize) · optimasi lanjutan dari temuan RUM.

**Wave 4 — Offline / realtime**
FP-15 manifest · FP-16 SW + caches · FP-17 background sync + badging · FP-14 SSE alerts · FP-18 web push (P1 eskalasi, opt-in).

**Wave 5 — Advanced compute**
FP-19 passkeys · FP-22 save picker · FP-24 view transitions · WASM ZXing (bila perlu) · MediaRecorder voice note (bila diprioritaskan produk).

(Wave tanpa kandidat dihapus sesuai instruksi — semua wave di atas punya kandidat.)

---

## §22. DEPENDENCY GRAPH

```
§8 capability/§9 detection conventions
   ├─→ FP-01 fetch helper ─→ dipakai FP-06 flush, FP-11 upload, FP-14 polling fallback
   ├─→ FP-12 wake-lock/haptics
   ├─→ FP-10 geolocation
   └─→ FP-13 barcode
FP-07 RUM + FP-08 Server-Timing (baseline)
   └─→ bukti untuk FP-21 windowing, FP-23 worker, tuning FP-16
FP-03 CSP report-only ─────────→ blok/koordinasi FP-11 (blob: img), FP-16 (SW), lalu enforce
FP-05 logout hygiene ─→ wajib sebelum FP-06 data menetap di perangkat
FP-06 outbox IDB ─→ FP-17 background sync/badging ─→ (diperkuat) FP-16 SW
FP-15 manifest ─→ FP-16 SW ─→ installable penuh; FP-18 push butuh FP-16
FP-11 capture+hash ─→ FP-13 scan QR aset terkait ─→ (P3) voice note
FP-14 SSE ─→ menggantikan copy palsu; FP-18 melengkapi saat app tertutup
FP-19 passkeys ─→ tidak bergantung fitur lain; bergantung keputusan dependency verifikasi
FP-20 harness ─→ memverifikasi hampir semua tes browser di atas
```

---

## §23. BLAST RADIUS

| FP | Radius | Components | Routes | API | Shared utils | Auth | Storage | Deployment | Tests |
|---|---|---|---|---|---|---|---|---|---|
| FP-01 | MODULE | 10 call-site komponen | — | — | client baru | login/logout flow | — | — | unit+E2E |
| FP-02 | MODULE | 12 komponen | — | — | download.ts | — | — | — | unit |
| FP-03 | SYSTEM-WIDE | (semua, via header) | semua | +csp-report | — | — | — | next.config | E2E+integrasi |
| FP-04 | MODULE | — | semua mutasi | http.ts | — | sesi cookie path | — | — | integrasi |
| FP-05 | CROSS-MODULE | TopBar, ProfileSessions, (sink) | — | logout route (tetap) | broadcast.ts | sinyal auth | outbox purge | — | 2-tab E2E |
| FP-06 | CROSS-MODULE | SyncStatus, RunChecklist, FindingCapture, FieldOffline | /field/sync, run, findings/new | (kontrak tetap) | offline/* | user-guard sesi | IDB baru | — | offline E2E |
| FP-07 | CROSS-MODULE | layout ops+field (mount) | — | +rum route | telemetry/rum | sesi untuk ingest | — | — | unit+integrasi |
| FP-08 | LOCAL | — | semua API | http.ts header | — | — | — | — | integrasi |
| FP-09 | MODULE | — | 3–5 GET route | routes ts | etag.ts | — | — | — | integrasi |
| FP-10 | LOCAL | FindingCapture | findings/new | (field opsional) | — | — | — | — | mock geo |
| FP-11 | CROSS-MODULE | FindingCapture, RunChecklist | evidence upload baru | +upload route, task-service | media/evidence | permission wo.transition | files .data/evidence (dev) | volume/env prod | unit+integrasi+E2E |
| FP-12 | LOCAL | RunChecklist | run | — | platform/* | — | — | — | unit+manual |
| FP-13 | MODULE | FindingCapture (+inventory nanti) | — | — | media/barcode | — | — | — | unit/mock |
| FP-14 | MODULE | NotificationsHub | notifications/stream | +stream route | — | sesi/tenant filter | — | anti-buffering | integrasi+E2E |
| FP-15 | LOCAL | — | (metadata) | — | — | — | — | ikon publik | Lighthouse |
| FP-16 | SYSTEM-WIDE (runtime) | register-sw di shells | shell dokumen | cache policy | pwa/* | purge saat logout | caches.* | prod-only gate | offline E2E |
| FP-17 | MODULE | FieldShell, sync | — | — | — | — | — | SW (FP-16) | unit+E2E |
| FP-18 | CROSS-MODULE | Settings toggle, SW handler | +push routes | push_subscriptions | — | subscription per user | tabel baru | VAPID env | integrasi+manual |
| FP-19 | CROSS-MODULE | LoginForm, ProfileSessions | webauthn routes | +routes, schema | — | MFA flow | tabel baru | rp.id config | authenticator virtual |
| FP-20 | INFRA | — | — | — | — | devHint TOTP | db temp | CI job | seluruh E2E |
| FP-21 | LOCAL | AuditTrail, InventoryLedger | — | — | ui/hook | — | — | — | unit+perf check |
| FP-22 | LOCAL | (util konsumen) | — | — | download.ts | — | — | — | unit |
| FP-23 | LOCAL | AuditTrail (export) | — | — | workers/* | — | — | — | unit+perf |
| FP-24 | LOCAL | shell navigasi | — | — | — | — | — | — | visual |
| FP-25 | LOCAL | layout root | — | — | fonts | — | — | aset woff2 | visual |
| FP-26 | LOCAL | — | search | search route | — | review permission | — | — | integrasi |

---

## §24. RISK REGISTER

| Risk | Potential impact | Planned mitigation | Rollback |
|---|---|---|---|
| Browser lama tanpa IDB/private mode gagal-open (FP-06) | antrian tak persisten | deteksi + in-memory + banner jujur | nonaktifkan enqueue (flag) |
| Permission denied (geo/kamera/notifikasi) | fitur tak terpakai; kepercayaan turun | UI selalu sediakan jalur manual; minta izin dari konteks aksi (bukan saat load) | hapus CTA berbasis izin |
| CSP enforce memblokir halaman print inline handler (FP-03) | print rusak (P0 operasional) | report-only dulu; migrasi handler → client comp; regression test print | kembali report-only |
| Hydration mismatch dari feature-detect saat SSR (FP-10/12/13/16) | warning/flash React | semua deteksi di `useEffect`/handler, bukan render awal; pola `mounted` | revert komponen terkait |
| Stale cache SW menyajikan dokumen sesi lama (FP-16/05) | kebocoran data antar user | network-first dokumen; purge caches saat logout; version bump | unregister+clear (halaman reset) |
| Local state corrupt (IDB) (FP-06) | antrian macet | validator + karantina `_corrupt`; tombol reset antrian | hapus DB (data antrian hilang, server tak terpengaruh) |
| Duplicate request saat replay (FP-06) | mutasi ganda | Idempotency-Key preserved + dedup server (409→SYNCED) + single-flusher guard antar-tab | tetap aman by design |
| Auth regression passkeys (FP-19) | lockout user | TOTP fallback permanen; rollout role-terbatas; counter direject | matikan opsi passkey login |
| Worker crash (FP-23) | ekspor gagal | try/catch + fallback main-thread | ambang → ∞ (flag) |
| Memory pressure: preview banyak foto thumb (FP-11) | tab crash tablet | revokeObjectURL disiplin; batasi jumlah preview; resize dulu | nonaktifkan resize & tampilkan nama file saja |
| SSE disconnect storm (FP-14) | koneksi menumpuk/server panas | heartbeat, max-age koneksi, backoff jitter client, fallback polling | flag → polling-only |
| Upload failure mid-transfer (FP-11) | evidence hilang | retry idempotent per file (key per file), tombol retry, simpan File ref sampai sukses (session) | file picker ulang manual |
| Beacon flood dari tab banyak (FP-07) | log bising | sampling + clamp ukuran + rate route ingest | sampling=0 (konstanta) |
| ETag stale-304 setelah mutasi (FP-09) | UI tak segar | ETag = hash konten aktual; mutasi mengubah konten; verifikasi test | lepas wiring route tsb |
| Playwright flaky (FP-20) | CI merah semu | retry=1, trace on failure, smoke minimal dulu | job non-blocking |

---

## §25. ROLLOUT PLAN

**Phase 0 — baseline (semua fitur):** gabungkan hasil FP-07/08 + pengukuran manual → catat baseline di dokumen ini (agent mengisi kolom §13).
**Phase 1 — internal/dev:** default ON di `NODE_ENV!=='production'` atau flag konstanta per fitur; demo tenant saja.
**Phase 2 — limited rollout:** batasi per route-group (`(field)` saja: FP-06/10/11/12/13/16/17; `(ops)` saja: FP-14/21) atau per role (FP-19: admin/VP).
**Phase 3 — expanded:** semua route/role; sampling RUM diturunkan ke 10–25%.
**Phase 4 — default:** flag dihapus; dokumentasi final; metric watch 2 minggu.
**Phase 5 — legacy cleanup:** hapus key storage v1; hapus kode simulasi (SEED notifikasi, `simulateScan`, copy WebSocket palsu, pseudo-hash); hapus file csrf (FP-04) bila keputusan=hapus.

Fitur sederhana (FP-02/08/09/10/12/25/26): Phase 0→1→4 langsung (skip 2–3).

---

## §26. ROLLBACK PLAN (P0/P1/P2)

| FP | Rollback trigger | Rollback action | Legacy path | State compatibility | Data compatibility | Expected user impact |
|---|---|---|---|---|---|---|
| FP-01 | error user naik / abort mengganggu | migrasi call-site di-revert per file; helper di-nonaktifkan | fetch langsung lama | tak ada state | — | tidak ada (transparan) |
| FP-03 | violation valid >0 setelah enforce / halaman rusak | header → report-only; lalu non | tanpa CSP | — | laporan tetap terkumpul | tidak ada saat report-only; saat enforce rollback mengembalikan fungsi |
| FP-04 | 403 pada klien sah | revert fungsi `csrfFailure` | origin-only lama | — | — | mutasi sempat 403 — komunikasikan |
| FP-05 | tab lain logout liar/loop | hapus listener broadcast; purge tetap manual | logout lama | sinyal tak persisten | purge hanya saat aksi | tab lain tak auto-redirect |
| FP-06 | antrian gagal replay massal / IDB error | flag enqueue off; UI sync read-only; data IDB dibiarkan (inert) | simulasi dihapus → tampil "sync manual via server" (jujur, bukan palsu) | item tersimpan tak terkirim — jangan auto-delete | server tak pernah terima replay setengah (idempoten) | antrian menunggu; tak ada kehilangan senyap |
| FP-07 | beacon beban/bug | sampling=0; route 204 | tanpa RUM | buffer di-drop | — | tidak ada |
| FP-09 | stale-304 | lepas `createEtagResponse` route tsb | 200 penuh | — | — | bytes naik kembali |
| FP-11 | reject mime valid / storage penuh | route → 503 terkontrol; sembunyikan tombol attach (flag) | metadata-only evidence (lama) | evidence lama tetap terdaftar | file terunggah tetap ada | attach nonaktif sementara |
| FP-14 | beban koneksi/loop event | flag → polling GET 60s; stream route dimatikan | GET list (nyata, bukan SEED) | — | — | latency alert naik |
| FP-16 | konten basi/SW salah versi | halaman reset (unregister+clear); hapus registrasi | tanpa SW | caches dibersihkan | — | offline hilang sementara |
| FP-19 | verify gagal massal | matikan opsi passkey login (registrasi tetap) | TOTP | kredensial tersimpan | audit events utuh | login via TOTP |

---

## §27. TEST PLAN (requirement — tidak dijalankan di sini)

**FP-01:** unit: abort mengabaikan respons terlambat; timeout memicu error bertipe `TIMEOUT`; envelope error dipetakan; idempotency key auto untuk POST. browser E2E: ⌘K ketik cepat, hasil akhir sesuai query terakhir; halaman tak error saat abort di tengah jalan.
**FP-02:** unit: revoke dipanggil; filename disanitasi; tiap komponen render tanpa regresi (snapshot kecil).
**FP-03:** API: header ada & format benar; report endpoint menerima `application/csp-report`, menolak body besar. E2E: halaman print bekerja pasca-enforce.
**FP-04:** integration: cross-site mutasi → 403 (Origin & `Sec-Fetch-Site`); GET aman; tanpa header sesuai kebijakan; envelope error `CSRF_ORIGIN_MISMATCH`.
**FP-05:** browser compatibility: 2 tab logout-sync; fallback storage-event (paksa `BroadcastChannel=undefined`); purge key prefix `apex`.
**FP-06:** offline: submit saat offline → antre; online → synced; duplikat replay → 409→SYNCED; TTL expired tak direplay; migrasi v1→v2 (legacy valid & corrupt); large payload (payload 200KB) tersimpan; user-guard beda sesi diblokir.
**FP-07:** unit buffer/clamp/normalisasi; integration route valid/invalid; sampling; E2E 1 beacon per sesi dev (mock sendBeacon).
**FP-08:** integration header `Server-Timing` cocok dengan `durationMs`.
**FP-09:** integration 304/200; konsistensi setelah mutasi (data baru → ETag baru).
**FP-10:** permission granted/denied/timeout (Playwright geolocation mock); label sumber koordinat benar; submit tanpa GPS berhasil.
**FP-11:** unit: hash vector PNG/JPEG kecil; resize dimensi & fallback; integration: multipart diterima+dibuat evidence; mime dipalsukan → 415/400; >10MB → 413; permission route (`wo.transition`); E2E: fixture → attach → list menampilkan; slow network: progress + abort bekerja; camera-denied tak memblokir picker.
**FP-12:** unit mock acquire/release; release pada unmount; re-acquire visible.
**FP-13:** mock BarcodeDetector hit/miss; denied → manual; loop berhenti saat komponen unmount.
**FP-14:** integration: heartbeat diterima; event pada data uji; tenant lain tak menerima; reconnect: E2E kill koneksi → badge RECONNECTING → polling fallback aktif.
**FP-16:** offline: setelah kunjungan pertama, navigasi field render; POST tak pernah dari cache; versi baru mengambil alih; purge on logout membersihkan cache sesi.
**FP-17:** unit badge naik/turun; Chromium E2E background sync (bila deterministik — else manual checklist).
**FP-19:** virtual authenticator register/login; replay counter ditolak; TOTP fallback login sukses; revoke kredensial.
**FP-21:** correctness: baris tak hilang/duplikat saat filter+scroll; perf check: longtask scroll turun (RUM before/after).
**FP-23:** unit pekerja CSV (escape koma/kutip/newline); fallback saat Worker throw.
**FP-26:** integration: hasil identik sekuensial vs paralel; satu query error → respons terdegradasi terdokumentasi; permission palette review test.

Kategori global wajib per fitur: unit + integration + (browser E2E bila menyentuh browser API) + fallback + permission-denied (bila izin) + offline/slow-network (FP-06/11/14/16) + large-payload (FP-11/23) + browser-matrix (§28).

---

## §28. BROWSER TEST MATRIX (checklist untuk agent)

| Scenario | Chrome | Edge | Safari/WebKit | Fallback yang dicek |
|---|---|---|---|---|
| ⌘K abort race | ✔ hasil benar | ✔ | ✔ (WebKit sama) | tanpa AbortSignal.timeout → timer manual hidup |
| Outbox offline→online (FP-06) | ✔ IDB | ✔ | ✔ IDB (private-mode → in-memory) | banner queue-tak-persisten |
| CSP report→enforce (FP-03) | ✔ | ✔ | ⚠ quirks report lama — amati | tetap report-only bila noise |
| Geolocation grant/deny (FP-10) | ✔ | ✔ | ✔ iOS/macOS | manual zone |
| `<input capture>` (FP-11) | ✔ Android | ✔ | ✔ iOS Safari | file picker biasa (desktop) |
| crypto.subtle hash (FP-11) | ✔ | ✔ | ✔ | server re-hash selalu jalan |
| BarcodeDetector (FP-13) | ✔ | ✔ | ✖ → manual | manual input diverifikasi |
| Wake Lock (FP-12) | ✔ | ✔ | ✔ (16.4+) | no-op |
| Vibration (FP-12) | ✔ Android | ✔ | ✖ iOS | no-op |
| SSE (FP-14) | ✔ | ✔ | ✔ | polling 60s |
| SW + caches (FP-16) | ✔ | ✔ | ✔ (perhatikan eviction agresif) | online-normal + reset page |
| Background Sync (FP-17) | ✔ | ✔ | ✖ | flush `online`/manual |
| Badging (FP-17) | ✔ | ✔ | ⚠ terbatas | angka di UI tab saja |
| WebAuthn (FP-19) | ✔ platform & roaming | ✔ | ✔ iCloud Keychain | TOTP |
| showSaveFilePicker (FP-22) | ✔ | ✔ | ✖ | anchor |
| View Transitions (FP-24) | ✔ | ✔ | ⚠ versi baru | navigasi normal |

(Firefox opsional: jalankan matriks yang sama bila produk menyatakan dukungan; pola fallback identik.)

---

## §29. DEFINITION OF DONE (template per FP)

- [ ] implementasi selesai sesuai blueprint §6
- [ ] fallback tersedia & diuji (§10)
- [ ] security boundary utuh (client untrusted; Permissions-Policy disesuaikan hanya PR fitur)
- [ ] unit test lulus
- [ ] integration test lulus (route/service tersentuh)
- [ ] browser test lulus (matriks §28 relevan)
- [ ] observability terpasang (counter/mark/beacon per §14)
- [ ] metric sebelum/sesudah dicatat ke dokumen ini
- [ ] rollback terdokumentasi & dibuktikan (setidaknya simulasi flag-off)
- [ ] dokumentasi diperbarui (README/PROGRESS/CODEX sesuai aturan repo: tag `[ASUMSI-OTOMATIS]` untuk keputusan otonom)
- [ ] teks/copy UI tidak lagi mengklaim kemampuan yang tidak ada (khusus FP-06/13/14: hapus fiksi)

---

## §30. TASK BREAKDOWN

> Independently verifiable; satu concern per task; urutan merefleksikan §31/§33.

**TASK-01** Goal: modul feature-detection & konvensi capability. Priority: P0-fondasi. Category: FRONTEND ONLY/infra FE. Files/areas: `lib/platform/capability.ts` (baru), konvensi di docs. Planned changes: abstraksi §8 (Provider/withFallback) + helper deteksi §9. Dependencies: —. Acceptance: unit test deteksi palsu/nyata via stub. Test: unit. Metric: n/a (fondasi). Fallback: —. Risk: deviasi dari konvensi → mitigasi lint-lite (manual review).

**TASK-02** Goal: RUM collector + route ingest (baseline ada). FP-07. Files: `lib/telemetry/rum.ts` (baru), `app/api/telemetry/rum/route.ts` (baru), mount di 2 layout. Acceptance: event sampai ke endpoint; normalisasi route; sampling bekerja. Test: unit+integration. Metric: p75 tersedia; overhead diri <0.5ms (self-mark). Fallback: subset/no-op. Risk: beacon flood → clamp+sampling.

**TASK-03** Goal: `Server-Timing` di semua API. FP-08. Files: `lib/api/http.ts`. Acceptance: header format benar pada 200/4xx/5xx. Test: integration. Metric: header ada 100%. Fallback: —. Risk: ~nol.

**TASK-04** Goal: Playwright smoke minimal. FP-20 (subset). Files: `playwright.config.ts`, `e2e/smoke.spec.ts` (baru). Acceptance: login (devHint) → dashboard render → logout; jalan lokal. Test: itu sendiri. Metric: pass rate; durasi <5 mnt. Fallback: job non-blocking. Risk: flaky → retry=1.

**TASK-05** Goal: fetch helper + adopsi di 3 call-site paling berisiko (palette, login, logout). FP-01 subset P0. Files: `lib/api/client.ts` (baru), `CommandPalette.tsx`, `LoginForm.tsx`, `TopBar.tsx`. Acceptance: race ⌘K = 0 (test); timeout bekerja; envelope error seragam. Test: unit+E2E. Metric: request count ↓; stale=0. Fallback: timer manual. Risk: salah abort → test menuntaskan.

**TASK-06** Goal: migrasi sisa call-site fetch ke helper. FP-01 lanjutan. Files: WoDialogs, WorkOrderList, ServiceRequestList×2, ServiceRequestDetail, OrgHub, work-orders/new. Acceptance: 0 `fetch(` mentah tersisa di komponen (grep). Test: unit (builder ops), regression E2E transisi WO/SR. Metric: konsistensi error UX. Fallback: —. Risk: perilaku redirect 401 berubah — uji eksplisit.

**TASK-07** Goal: CSP report-only + Permissions-Policy + nosniff + report endpoint. FP-03 (bagian A). Files: `next.config.mjs`, `app/api/security/csp-report/route.ts` (baru). Acceptance: header terlihat; laporan masuk & ter-log. Test: API+E2E. Metric: baseline violations terkumpul. Fallback: —. Risk: laporan bising → filter directive.

**TASK-08** Goal: CSRF fetch-metadata + keputusan csrf lib (hapus). FP-04. Files: `lib/api/http.ts`, hapus `lib/auth/csrf.ts`. Acceptance: matriks attack test hijau; tidak ada 403 sah (pantau). Test: integration. Metric: 0 false-positive 7 hari. Fallback: revert fungsi. Risk: klien non-browser terblokir — didokumentasikan kebijakan header-absen.

**TASK-09** Goal: util download + migrasi 12 komponen. FP-02. Files: `lib/download.ts` (baru) + 12 komponen. Acceptance: revoke di semua; satu helper saja. Test: unit+snapshot. Metric: −150 baris; 0 leak. Fallback: —. Risk: regresi nama file — snapshot.

**TASK-10** Goal: logout hygiene + broadcast auth. FP-05. Files: `TopBar.tsx`, `ProfileSessions.tsx`, `lib/auth/broadcast.ts` (baru). Acceptance: purge prefix key; 2-tab redirect; revoke-all menyiarkan sinyal. Test: E2E 2 konteks + fallback storage-event. Metric: draft lintas-user=0. Fallback: storage-event. Risk: loop pesan → timestamp guard.

**TASK-11** Goal: ETag wiring 3 GET list. FP-09. Files: routes work-orders/service-requests/notifications + counter. Acceptance: 304 roundtrip benar. Test: integration. Metric: 304 rate ≥30% kunjungan ulang. Fallback: lepas wiring. Risk: stale-304 → test mutasi.

**TASK-12** Goal: paralelkan `/api/search` + review permission untuk palette. FP-26. Acceptance: hasil identik; p95 turun; permission sesuai role operasional (keputusan terdokumentasi). Test: integration. Metric: p95 ↓≥30%. Risk: satu query gagal → parsial terdokumentasi.

**TASK-13** Goal: geolocation stamp. FP-10. Files: `FindingCapture.tsx`, schema finding (field opsional opsional). Acceptance: grant/deny/timeout paths; label sumber. Test: Playwright geo mock. Metric: % koordinat aktual. Fallback: manual.

**TASK-14** Goal: wake lock + vibrate. FP-12. Files: `RunChecklist.tsx`, `lib/platform/{wake-lock,haptics}.ts` (baru). Acceptance: acquire/release lifecycle benar; no-op unsupported. Test: unit mock + manual tablet. Metric: proxy `screen_off_mid_run` bila diukur; else UX (ditandai).

**TASK-15** Goal: outbox storage IDB + migrasi v1. FP-06 (bagian A). Files: `lib/offline/db.ts` (baru), `lib/offline/outbox.ts`. Acceptance: API publik sama; migrasi valid/corrupt; TTL. Test: integration-browser. Metric: —. Fallback: in-memory. Risk: private mode.

**TASK-16** Goal: wiring sync nyata (UI + enqueue points). FP-06 (bagian B). Files: `SyncStatus.tsx`, `RunChecklist.tsx`, `FindingCapture.tsx`. Acceptance: skenario airplane hijau; 409→SYNCED; cross-tab status sinkron. Test: offline E2E. Metric: offline success ≥99%. Fallback: flag enqueue-off. Risk: double-flush antar-tab → guard SENDING.

**TASK-17** Goal: foto evidence capture+hash FE. FP-11 (FE). Files: `FindingCapture.tsx`, `RunChecklist.tsx`, `lib/media/evidence.ts` (baru). Acceptance: picker/capture, preview dengan revoke, hash cocok dengan referensi. Test: unit hash/resize + E2E fixture. Metric: — (menunggu BE). Fallback: tanpa resize, unggah asli.

**TASK-18** Goal: route upload evidence BE. FP-11 (BE). Files: `app/api/work-orders/[id]/evidence/upload/route.ts` (baru), `task-service.ts`, storage dev `.data/evidence/`. Acceptance: multipart→evidence tercatat; mime palsu/oversize ditolak; hash server diverifikasi ulang; audit event. Test: integration+E2E dengan TASK-17. Metric: attach success; bytes/evidence. Fallback: 503 terkontrol. Risk: penyimpanan lokal dev penuh → guard ukuran total.

**TASK-19** Goal: barcode scan aset. FP-13. Files: `FindingCapture.tsx`, `lib/media/barcode.ts` (baru). Acceptance: detect→isi kode; unsupported/denied→manual; stop bersih. Test: mock+Playwright (fake cam bila ada). Metric: waktu input aset (baseline dikumpulkan). Fallback: manual.

**TASK-20** Goal: hapus pseudo-hash klien & ralat copy forensik. (bagian audit-trail truthfulness; pendahulu FP-23). Files: `components/audit/AuditTrail.tsx`. Acceptance: kolom hash memakai data server; copy WebSocket/Merkle "klien" diganti jujur (link ke verify server yang ada). Test: snapshot+grep teks fiksi. Metric: —. Risk: data API belum punya field hash → agent verifikasi, isi via verify-chain yang ada (GET list membawa hash bila tersedia).

**TASK-21** Goal: windowing list audit/ledger. FP-21. Files: hook baru + 2 komponen. Acceptance: benar saat filter+scroll; longtask turun (diukur RUM). Test: correctness+perf note. Fallback: render penuh.

**TASK-22** Goal: CSP enforce (setelah ≥1 siklus bersih) + migrasi inline handler print. FP-03 (bagian B). Acceptance: enforce aktif; print regression hijau; violations valid = 0. Test: E2E print+smoke semua shell. Rollback: report-only.

**TASK-23** Goal: manifest+icons+shortcuts. FP-15. Acceptance: Lighthouse installable; ikon 200. Test: Lighthouse CI (opsional manual). Metric: install rate (nanti).

**TASK-24** Goal: SW app-shell + caches + offline fallback + reset page. FP-16. Acceptance: matriks offline hijau; purge on logout. Test: offline E2E. Metric: cache hit; offline render. Rollback: unregister+clear.

**TASK-25** Goal: background sync + badging dinamis. FP-17 (butuh TASK-16 & 24). Acceptance: badge mengikuti count; register sync saat enqueue; flush per `online`. Test: unit+E2E Chromium. Fallback: manual.

**TASK-26** Goal: SSE stream + hub nyata. FP-14. Files: route stream baru, `NotificationsHub.tsx`. Acceptance: heartbeat+event tenant-akurat; fallback polling; copy WebSocket palsu hilang. Test: integration+E2E reconnect. Metric: latency <5s; reconnect >99%. Rollback: flag polling-only.

**TASK-27** Goal: web push P1 opt-in. FP-18. Acceptance: subscription→push P1→notifikasi→deep link fokus. Test: integrasi (endpoint tiruan) + manual 2 browser. Rollback: hapus subscription. Risk: VAPID/key mgmt → env terdokumentasi.

**TASK-28** Goal: passkeys end-to-end. FP-19. Acceptance: register/login/revoke; counter replay ditolak; TOTP tetap. Test: authenticator virtual. Rollout: role-terbatas. Metric: MFA time ↓.

**TASK-29** Goal: worker CSV. FP-23 (gated oleh bukti RUM longtask). Acceptance: ekspor tanpa longtask >50ms; fallback benar. Metric: longtask=0 saat ekspor.

**TASK-30** Goal: save-as picker. FP-22. Acceptance: Chromium picker; lainnya anchor. Metric: UX (ditandai NOT YET MEASURABLE).

Selain itu berdiri: **TASK-FONT (FP-25)** — self-host font via `next/font/local` (Wave 1 bila aset woff2 tersedia; DEFER bila belum — tombol ada di repo TODO).

---

## §31/§33. FIRST 10 TASKS (urutan eksekusi) + FINAL OUTPUT

### IMPLEMENT NOW
FP-01 (fetch helper + race fix) · FP-02 (download util) · FP-07 (RUM) · FP-08 (Server-Timing) · FP-03-report-only (CSP A) · FP-04 (CSRF) · FP-05 (logout hygiene) · FP-09 (ETag) · FP-10 (geolocation) · FP-12 (wake lock/vibrate) · FP-26 (search parallel) · FP-06 (outbox IDB penuh — prioritas tertinggi reliabilitas) · FP-11 capture+hash→upload (berurutan FE→BE).

### IMPLEMENT AFTER BASELINE
FP-21 (windowing — buktikan longtask dulu) · FP-23 (worker CSV) · FP-16 tuning cache runtime (pola GET mana yang layak cache) · FP-25 font (menunggu aset).

### INVESTIGATE
FP-19 verifikasi strategi dependency verifikasi WebAuthn (manual vs lib) + desain tabel · FP-18 penyedia/teknik web-push & manajemen VAPID · FP-24 kompatibilitas View Transitions dengan router Next 16 · FP-13 cakupan format barcode industri yang dibutuhkan (memastikan `getSupportedFormats()`).

### DEFER
FP-22 (save picker) · voice note MediaRecorder · WASM ZXing fallback · FP-24 view transitions · Network Information adaptif · local search atas cache field.

### DO NOT IMPLEMENT
WebRTC/RTCPeerConnection/getDisplayMedia · WebSocket generik & WebTransport untuk kebutuhan ini · WebGPU/WebGL/WebXR (BIM 3D) · Generic Sensor/Web Bluetooth/USB/Serial/HID · Trusted Types (0 sink) · Navigation API/URLPattern kustom · Local AI inference · Periodic Background Sync/Background Fetch · mengganti Radix dengan `<dialog>` · mengubah cookie httpOnly menjadi akses-JS (Cookie Store) · Shape/Face/Text Detection · Payment Request/SPC/FedCM (tanpa IdP/checkout).

### Recommended First Execution Wave (maks 10, berurutan)

1. **TASK-01** capability module + konvensi deteksi — tujuan: fondasi fallback semua fitur. Area: `lib/platform/*` (baru). Dep: —. Fallback: —. Test: unit. Metric: n/a.
2. **TASK-02** RUM beacon + route — fondasi baseline. Area: `lib/telemetry/rum.ts` (baru), route ingest (baru), 2 layout. Dep: TASK-01 (transport boleh fetch mentah dulu). Fallback: no-op subset. Test: unit+integration. Metric: p75/route tersedia; overhead <0,5ms.
3. **TASK-03** Server-Timing — 1-baris observability. Area: `lib/api/http.ts`. Dep: —. Test: integration. Metric: header 100%.
4. **TASK-04** Playwright smoke — harness untuk semua tes browser berikutnya. Area: config+e2e (baru). Dep: devHint login (ada). Test: dirinya. Metric: pass rate.
5. **TASK-05** fetch helper + 3 call-site (palette race ditutup) — P0 fix pertama. Area: `lib/api/client.ts` (baru) + 3 komponen. Dep: TASK-01. Fallback: timer manual. Test: unit+E2E race. Metric: stale=0; request count ↓.
6. **TASK-06** migrasi sisa fetch — konsistensi timeout/abort/trace. Area: 6–7 file komponen/page. Dep: TASK-05. Test: unit builder + regression E2E transisi. Metric: 0 `fetch(` mentah di komponen.
7. **TASK-07** CSP report-only + endpoint report + Permissions-Policy minimal — aman, mulai jam observasi untuk enforce. Area: `next.config.mjs`, route report (baru). Dep: —. Test: API+E2E header. Metric: baseline violations terkumpul.
8. **TASK-08** CSRF fetch-metadata + hapus `lib/auth/csrf.ts` — menutup risiko skor P0 kecil & membersihkan dead code. Area: `lib/api/http.ts`, file csrf. Dep: —. Test: integration attack-matrix. Metric: 0 false-403.
9. **TASK-09** util download + 12 migrasi — quick win pengurangan JS + tutup leak revoke. Area: `lib/download.ts` (baru) + 12 komponen. Dep: —. Test: unit+snapshot. Metric: −~150 baris; revoke 12/12.
10. **TASK-10** logout hygiene + broadcast auth — syarat keamanan sebelum data menetap di perangkat (mendahului outbox IDB). Area: `TopBar.tsx`, `ProfileSessions.tsx`, `lib/auth/broadcast.ts` (baru). Dep: TASK-01. Fallback: storage-event. Test: E2E 2-tab. Metric: 0 replay lintas-user.

(Melanjutkan: TASK-11 ETag → TASK-12 search → TASK-13/14 field ergonomics → TASK-15/16 outbox penuh → TASK-17/18 evidence → dst. sesuai §30.)

---

## §32. EXECUTIVE DECISION TABLE

| Candidate | Priority | Owner | Complexity | Risk | Metric | Decision |
|---|---|---|---|---|---|---|
| FP-01 fetch helper | P0/P1 | FE | S-M | rendah | stale=0; req count | IMPLEMENT |
| FP-02 download util | P1 | FE | S | rendah | −baris; leak=0 | IMPLEMENT |
| FP-03 CSP+PP | P0 | Platform | M | sedang (enforce) | violations=0; scanner | IMPLEMENT (report-only lalu enforce) |
| FP-04 CSRF metadata | P0 | BE | S | sedang | false-403=0 | IMPLEMENT |
| FP-05 logout hygiene | P0/P1 | FE | S | rendah | replay lintas-user=0 | IMPLEMENT |
| FP-06 outbox IDB | P0 | FE(HYBRID) | M-L | sedang | offline success ≥99% | IMPLEMENT |
| FP-07 RUM | P1 | FE(HYBRID) | S-M | rendah | p75/route | IMPLEMENT (duluan) |
| FP-08 Server-Timing | P1 | BE | XS | ~nol | header 100% | IMPLEMENT |
| FP-09 ETag | P1 | BE | S | rendah | 304≥30% | IMPLEMENT |
| FP-10 geolocation | P1 | FE | XS-S | rendah | % koord aktual | IMPLEMENT |
| FP-11 evidence pipeline | P1→P2 | HYBRID | M | sedang | attach success; bytes ↓60% | IMPLEMENT (FE hash dulu, upload menyusul) |
| FP-12 wake/vibrate | P1 | FE | XS | ~nol | proxy UX (ditandai) | IMPLEMENT |
| FP-13 barcode | P1/P2 | FE | M | rendah | waktu input aset | IMPLEMENT AFTER spike format (investigate kecil) |
| FP-14 SSE | P2 | HYBRID | M | sedang | latency<5s; reconnect | IMPLEMENT (Wave 4) |
| FP-15 manifest | P2 | FE/Platform | S | ~nol | installable | IMPLEMENT (Wave 4) |
| FP-16 SW+caches | P2 | FE | M-L | sedang | offline render; cache hit | IMPLEMENT (Wave 4, dgn reset path) |
| FP-17 bg-sync/badging | P2 | FE | S-M | rendah | enqueue→synced lebih cepat | IMPLEMENT (setelah 06+16) |
| FP-18 web push | P2/P3 | HYBRID | M | sedang | P1 ack time | INVESTIGATE→IMPLEMENT (opt-in) |
| FP-19 passkeys | P2 | HYBRID | L | sedang | MFA time ↓ | INVESTIGATE (strategi verifikasi) → IMPLEMENT role-terbatas |
| FP-20 playwright | P2 | Platform | S-M | rendah | pass rate | IMPLEMENT (duluan, minimal) |
| FP-21 windowing | P2 | FE | M | rendah | INP/longtask | IMPLEMENT AFTER BASELINE |
| FP-22 save picker | P3 | FE | XS | ~nol | UX (ditandai) | DEFER |
| FP-23 worker CSV | P3 | FE | M | rendah | longtask=0 | IMPLEMENT AFTER BASELINE |
| FP-24 view transitions | P3 | FE | M | rendah | CLS tak naik | DEFER/INVESTIGATE router-compat |
| FP-25 font self-host | P1/P2 | FE | S | rendah | CLS~0 | IMPLEMENT (jika aset siap; else DEFER) |
| FP-26 search parallel | P2 | BE | XS-S | rendah | p95 ↓30% | IMPLEMENT |
| WebSocket/WebRTC/WebGPU/Sensor/BLE/TrustedTypes/local-AI/Navigation-API/Periodic-BGSync | — | — | — | — | — | DO NOT IMPLEMENT |

---

*Akhir implementation plan. Verifikasi file/symbol/dependency/browser-support/runtime, pengukuran baseline, dan implementasi adalah tanggung jawab coding agent fase berikutnya. Dokumen audit sumber: `AUDIT_WEB_PLATFORM_API.md`.*
