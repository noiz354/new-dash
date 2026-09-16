# AUDIT POTENSI WEB PLATFORM API — Apex Ops CMMS (`new-dash`)

**Tanggal:** 2026-09-16 · **Mode:** READ-ONLY · **Branch:** `arena/01a0a835-new-dash`
**Basis bukti:** implementasi aktual di `app/`, `components/`, `lib/`, `db/`, `proxy.ts`, `package.json`, `tsconfig.json`, `next.config.mjs`. Setiap klaim memiliki bukti file + baris. Yang tidak ditemukan ditandai **NOT FOUND**.

---

## A. Executive Summary (maks 15 poin)

1. **Produk ini adalah CMMS lapangan (field-first)** — teknisi di "Basement Mech Room B-204" dengan "Link degraded — queue held locally" (`components/field/SyncStatus.tsx:73`) — tetapi **kemampuan offline nyata = NOL**: tidak ada Service Worker, manifest, IndexedDB, Cache Storage (semua NOT FOUND). Ini gap terbesar antara janji produk dan kode.
2. **4 modul infrastruktur browser-side bernilai tinggi sudah ditulis tetapi DEAD CODE** (tidak diimpor siapa pun): `lib/offline/outbox.ts` (offline queue), `lib/api/etag.ts` (ETag engine), `lib/auth/csrf.ts` (double-submit token), `lib/telemetry/analytics.ts` (funnel). Halaman `/field/sync` justru mensimulasikan sync dengan `setTimeout` dan 2 item hardcoded (`components/field/SyncStatus.tsx:12-16, 33-43`).
3. **Pipeline "photo evidence" hanya metadata**: API `POST /api/work-orders/[id]/evidence` mengharapkan `sha256Hash` (`app/api/work-orders/[id]/evidence/route.ts:8-15`) tetapi **tidak ada satu pun** `<input type="file">`, `getUserMedia`, `crypto.subtle`, atau upload biner di seluruh repo (NOT FOUND). UI kamera/scan saat ini = `setTimeout` palsu (`components/field/FindingCapture.tsx:42-49`).
4. **15 call-site `fetch()` client tanpa satu pun `AbortController`** → race condition nyata: hasil pencarian ⌘K basi bisa menimpa hasil baru (`components/ops/CommandPalette.tsx:49-70`); flush outbox berjalan sekuensial tanpa timeout (`lib/offline/outbox.ts:89-105`).
5. **Keamanan sesi backend kuat** (scrypt, TOTP RFC 6238 real, cookie httpOnly + sameSite=lax + secure di prod, hash sha256 di DB — `lib/auth/session.ts`, `lib/auth/password.ts`, `lib/auth/totp.ts`), tetapi **nol security headers**: CSP, Permissions-Policy, COOP/CORP semua NOT FOUND di `next.config.mjs`.
6. **WebAuthn/Passkeys adalah kandidat nyata, bukan hype**: halaman Settings sudah menampilkan copy "FIDO2 / MFA Security Key Re-enrollment" (`app/(ops)/settings/jobs/page.tsx:21-28`) padahal implementasinya hanya TOTP — copy produk sudah menjanjikan capability yang belum ada.
7. **Pola download CSV/JSON diduplikasi di 12 komponen** (Blob + `createObjectURL` + `<a>` temp; `DUPLICATED`) — kandidat konsolidasi util + (P2) `showSaveFilePicker` dengan fallback.
8. **Observability server cukup baik** (structured log + `traceparent` W3C + RED metrics in-memory di `lib/api/http.ts:55-75`, `lib/telemetry/metrics.ts`), tetapi **frontend buta total**: tidak ada Web Vitals/Performance API/Beacon — tidak bisa menjawab "halaman/API/interaksi mana yang lambat" dari sisi browser.
9. **"Realtime" di UI = fiksi**: toast "Real-time WebSocket & Merkle chain verified" (`components/audit/AuditTrail.tsx:570`) dan copy "WebSocket: Channel: sha256-aes-gcm" (`components/notifications/NotificationsHub.tsx:480`) — `WebSocket`/`EventSource`/`socket.io` NOT FOUND. SSE adalah kandidat arsitekturally-cocok (satu arah, alert-driven) untuk SLA alerts.
10. **Komponen client raksasa di main thread**: `components/audit/AuditTrail.tsx` = 1.639 baris `'use client'` termasuk CSV-builder 412-record dan pseudo-hash generator — kandidat Web Worker/`scheduler` bila data nyata masuk.
11. **GPS, barcode, QR semuanya hardcoded/mock**: GPS kanon literal `'0.7893°S 113.9213°E'` di 7+ lokasi; scan barcode = timeout 800ms; QR di print badge = ikon `lucide` `QrCode` (`app/badges/[id]/print/page.tsx:184`, komentar kode: "Simulated 1D Barcode"). Geolocation API + BarcodeDetector punya use case produk aktual.
12. **304/conditional-request gratis hilang**: ETag engine ada tapi 0 route menggunakannya → dashboard & list fetch ulang payload penuh setiap navigasi.
13. **PGlite (PostgreSQL→WASM) sudah menjadi dependency backend** (`db/client.ts`) — WASM bukan hal baru bagi repo ini; off-load komputasi berat client (hash/CSV/resize) via Worker adalah langkah evolutif, bukan revolusioner.
14. **Tidak ada Playwright/Cypress/Puppeteer** (NOT FOUND) — repo belum siap untuk browser-automation/agentic testing; hanya `node --test` (unit+integration PGlite).
15. **Yang layak diimplementasi dulu (jawaban §15)**: AbortController+timeout helper, wiring outbox→IndexedDB+`/field/sync`, media capture + `crypto.subtle` untuk evidence, security headers, client perf beacon, SSE notifikasi, manifest+SW untuk field shell. Detail file, fallback, dan metrik ada di bagian L/N.

---

## B. Current Architecture

| Aspek | Implementasi aktual | Bukti |
|---|---|---|
| **Frontend** | Next.js 16.3.5 App Router, React 18.3.1, RSC + 47 client components (dari 107 `.tsx`), Tailwind 3.4 + Radix UI (dialog/alert-dialog/slot), lucide-react | `package.json:14-24`; `components/ops/*`, `components/field/*` |
| **Backend** | Next.js Route Handlers — 35 file `route.ts` di `app/api/*` (auth, work-orders, service-requests, findings, inspections, parts, purchasing, PM, notifications, audit-trail, reports, search, telemetry, billing, queue, retention, health) | `app/api/**/route.ts` |
| **Runtime** | Node.js (target @types/node ^20; tanpa `engines` field — NOT FOUND), npm (`package-lock.json`), TypeScript ^5.6.2 (`tsc --noEmit`), target ES2017 + lib DOM | `package.json:30-40`, `tsconfig.json` |
| **Framework/Build** | `next dev/build/start`; PostCSS+Tailwind; `drizzle-kit` untuk migrasi; tidak ada bundler custom | `next.config.mjs`, `postcss.config.mjs` |
| **Deployment** | NOT FOUND — tidak ada `Dockerfile`, `docker-compose.*`, `.github/workflows/`; ada `ci/ci.yml` siap-salin (typecheck + npm audit + build) | `ls Dockerfile*` → kosong; `README.md:48` |
| **SSR/CSR/SSG** | Hybrid: RSC membaca DB langsung (dashboard `app/(ops)/page.tsx:31-35`), client components untuk interaksi; `generateStaticParams()` pada print pages & BIM; layout `(ops)`/`(field)` = server-side session gate | `app/(ops)/layout.tsx:8-12`, `app/(field)/layout.tsx:6-9` |
| **API architecture** | Envelope JSON `{ok,data}\|{ok:false,error}` via `withRoute()`: RBAC permission check, CSRF origin-vs-host, Zod→400, DomainError, structured log + `traceparent`, RED metric | `lib/api/http.ts:45-136` |
| **Database** | Drizzle ORM + **PGlite (PostgreSQL 18 dikompilasi ke WASM)**, data dir `.data/pg`, 16 tabel multi-tenant; produksi: swap ke node-pg via `DATABASE_URL` (belum ada) | `db/client.ts:1-52`, `package.json:15` |
| **Auth** | scrypt N=16384 (node:crypto), TOTP RFC 6238 (HMAC-SHA1, ±1 step), sesi opaque 256-bit → cookie `apex_session` httpOnly/sameSite=lax/secure(prod), DB menyimpan sha256(token), RBAC 6 role, rate limit memory+DB, MFA challenge | `lib/auth/password.ts`, `totp.ts`, `session.ts:30-37`, `limits.ts`, `rbac.ts` |
| **Storage (client)** | `localStorage` saja, hanya di `lib/offline/outbox.ts:21-25` (dead code). `sessionStorage`/IndexedDB/OPFS/CacheStorage: NOT FOUND | §3 |
| **Caching** | Engine ETag `lib/api/etag.ts` — **0 route memakainya** (DEAD); `Cache-Control: private, no-cache` hanya di helper; HTTP cache browser untuk halaman: default Next | grep `api/etag` → hanya definisi |
| **Realtime** | NOT FOUND — tidak ada WebSocket/SSE/socket.io; klaim realtime di UI disimulasikan via toast/copy | `AuditTrail.tsx:570`, `NotificationsHub.tsx:480` |
| **Media** | NOT FOUND — tidak ada getUserMedia/MediaRecorder/ImageCapture; foto/scan/voice note disimulasikan | `FindingCapture.tsx:42-49`, `RunChecklist.tsx:85-87`, `SyncStatus.tsx:13` |
| **Observability** | Server: structured JSON log + W3C trace context + RED metrics in-memory (rolling 5000, dgn seed palsu saat cold); endpoint `/api/telemetry/metrics`. Client: NOT FOUND (0 Performance API / beacon / RUM) | `lib/log.ts`, `lib/telemetry/metrics.ts:77-86` |
| **PWA** | NOT FOUND — tidak ada `manifest.*`, `sw.*`, `service-worker.*`, ikon maskable | `find` → 0 |
| **Workers/WASM** | Browser Worker/SharedWorker/Worklet: NOT FOUND. WASM: PGlite di server. `SharedArrayBuffer`: N/A | `db/client.ts:17` |
| **Background job** | `lib/queue/worker.ts` — in-memory queue + DLQ (proses server), hanya dipakai `/api/queue/jobs`; bukan browser Background Sync | `lib/queue/worker.ts`, `app/api/queue/jobs/route.ts` |
| **Testing/automation** | `node --test` (unit + integration PGlite temp). Playwright/Cypress/Puppeteer/Selenium: NOT FOUND | `package.json:9`, `tests/` |
| **File pipeline** | Evidence POST = JSON metadata (`fileName`, `filePath`, `mimeType`, `fileSize`, `sha256Hash`) — **tidak ada upload biner, multipart, presigned URL, atau object storage** | `app/api/work-orders/[id]/evidence/route.ts:8-15` |

---

## C. Existing Browser API Usage

| API | Lokasi | Usage | Assessment |
|---|---|---|---|
| `navigator.onLine` + `online`/`offline` events | `components/field/FieldOffline.tsx:11-18`; `components/field/AuditQueue.tsx:66` | Banner offline + toast "served from cache" | **PARTIAL** — deteksi ada, tetapi tidak ada cache sungguhan di belakangnya (klaim "served from cache" tanpa SW/Cache = misleading) |
| `navigator.clipboard.writeText` | `components/audit/AuditTrail.tsx:560` | Copy hash audit | **IMPLEMENTED** — tanpa fallback non-secure-context (minor) |
| `crypto.randomUUID()` | 6 call-site idempotency-key (`WorkOrderList.tsx:107,136`; `WoDialogs.tsx:43`; `ServiceRequestList.tsx:108,144`; `ServiceRequestDetail.tsx:62`) + `lib/log.ts:56` | Idempotency key & request id | **IMPLEMENTED** — benar & secure-context-safe |
| `crypto.getRandomValues` | `components/settings/SettingsHub.tsx:57` | Generate fake scanner API key | **IMPLEMENTED** (data demo) |
| `crypto.subtle` | — | — | **NOT FOUND** — padahal server mengharapkan `sha256Hash` dari client (evidence) |
| `Blob` + `URL.createObjectURL` + anchor-download | 12 komponen: `AssetRegistry.tsx:59-61`, `AuditTrail.tsx:1630-1638`, `FacilityHub.tsx:40-45`, `InventoryLedger.tsx:60-61`, `NotificationsHub.tsx:79-80`, `OrgHub.tsx:96-97`, `PurchaseList.tsx:32-33`, `ReportsHub.tsx:58-59`, `ServiceRequestList.tsx:85-87`, `SettingsHub.tsx:46-47`, `VendorList.tsx:33-34`, `WorkOrderList.tsx:88-90` | Export CSV/JSON client-side | **DUPLICATED** — pola copy-paste identik; `revokeObjectURL` tidak konsisten (hanya `AuditTrail.tsx:1638` yang me-revoke) → memory leak kecil |
| `window.print()` | 8+ lokasi + 4 print pages (`app/work-orders/[id]/print`, `app/permits/[id]/print`, `app/badges/[id]/print`, `app/purchasing/[id]/print`) | Travel pack WO, permit LOTO, badge CR80, PO | **IMPLEMENTED** — sudah tepat; `--nya` `onClick="window.print()"` sebagai atribut string di RSC |
| `window.location.assign` | `LoginForm.tsx:62,90`, `TopBar.tsx:18` | Full navigation setelah login/logout | **IMPLEMENTED** — disengaja agar layout server re-read cookie (komentar `LoginForm.tsx:9-10`) |
| `localStorage` | `lib/offline/outbox.ts:21-47` | Outbox field (DEAD — tak diimpor) | **LEGACY/PARTIAL** — sinkron, 5-10MB cap, tanpa schema migration, tanpa cross-tab coherence; salah wadah untuk antrian mutasi |
| `document.addEventListener('keydown')` | 8 komponen (⌘K di `OpsShell.tsx:44-53`, ESC di dialog BIM/palette, hotkeys tabel) | Keyboard shortcuts | **IMPLEMENTED** — cleanup benar |
| `setInterval` timers | `WoTimers.tsx:13,39`, `PurchaseDetail.tsx:213`, `WoDialogs.tsx:233` | Countdown SLA / stopwatch lapangan | **IMPLEMENTED** — kandidat `document.startViewTransition`/PAHA tidak berlaku; timer tetap jalan saat tab hidden (throttling browser) — borderline OK |
| ScrollIntoView / anchor scroll | `FacilityHub.tsx:175`, `RunChecklist.tsx:107` | Navigasi in-page | **IMPLEMENTED** |
| `performance.*` / PerformanceObserver | — | — | **NOT FOUND** |
| `IntersectionObserver` / `ResizeObserver` / `MutationObserver` | — | — | **NOT FOUND** — list panjang (audit 412 records, inventory ledger) render penuh tanpa virtualisasi/lazy |
| `fetch()` client | ~15 call-site | JSON API calls | **PARTIAL/UNSAFE-ish** — 0 `AbortController`, 0 timeout, 0 retry policy di client |
| Service Worker / `caches.*` / Web App Manifest / Push / Notification API / Badging / Web Share / File System Access / IndexedDB / BroadcastChannel / Background Sync/Fetch / sendBeacon / Wake Lock / Vibration / Geolocation / getUserMedia / MediaRecorder / BarcodeDetector / WebAuthn / WebTransport / WebGPU / OffscreenCanvas / Worker | — | — | **SEMUA: NOT FOUND** (dapur produk sudah menamai beberapa di copy UI — lihat D) |

---

## §3. CURRENT CAPABILITY MAP (ringkas)

| Capability | Current implementation | File evidence | Browser/API | Status |
|---|---|---|---|---|
| Offline detection | Banner online/offline | `FieldOffline.tsx` | `navigator.onLine`, events | PARTIAL |
| Offline mutation queue | Modul ada, tidak dipakai; UI sync disimulasikan | `lib/offline/outbox.ts`, `SyncStatus.tsx:12-43` | localStorage | LEGACY (salah wadah) + NOT WIRED |
| Conditional GET | Engine ada, 0 pemakaian | `lib/api/etag.ts` | ETag/If-None-Match | NOT WIRED |
| Idempotency mutasi | Header `Idempotency-Key` real dgn `crypto.randomUUID` | 6 komponen + `lib/services/idempotency.ts` | crypto.randomUUID | IMPLEMENTED |
| Client search | Debounce 200ms, tanpa abort | `CommandPalette.tsx:49-70` | fetch | PARTIAL (race) |
| Export file | 12 duplikasi Blob-download | lihat tabel C | Blob/createObjectURL | DUPLICATED |
| Print artifacts | 4 print pages + print CSS | `app/*/print/page.tsx`, `globals.css:46-56` | window.print | IMPLEMENTED |
| Hash evidence klien | Server minta `sha256Hash`, client tidak ada | `evidence/route.ts:14` | crypto.subtle (usul) | NOT FOUND |
| Foto/scan evidence | Simulasi timeout + GPS literal | `FindingCapture.tsx:42-49` | Media Capture (usul) | NOT FOUND |
| Realtime alerts | Copy "WebSocket" palsu; Hub memakai SEED | `NotificationsHub.tsx:22,480` | SSE (usul) | NOT FOUND |
| Client observability | Nol | — | Performance/Beacon (usul) | NOT FOUND |
| Security headers | Nol | `next.config.mjs` | CSP/Permissions-Policy (usul) | NOT FOUND |
| WebAuthn/Passkeys | Copy "FIDO2 re-enrollment" tanpa implementasi | `settings/jobs/page.tsx:21-28` | WebAuthn (usul) | NOT FOUND |
| Auth session | Cookie httpOnly + DB hash | `lib/auth/session.ts` | Cookie | IMPLEMENTED (baik) |
| CSRF | Origin-vs-host di `withRoute`; lib double-submit DEAD | `lib/api/http.ts:46-56`, `lib/auth/csrf.ts` | Fetch metadata | PARTIAL |
| Dialog/modal | Radix Dialog/AlertDialog | `components/ui/dialog.tsx` | `<dialog>` terbungkus | IMPLEMENTED (pertahankan) |
| QR/barcode encode | Ikon lucide `QrCode` sebagai placeholder | `badges/[id]/print/page.tsx:184` | — (tidak ada API native) | NOT FOUND (butuh lib kecil — bukan native) |
| Server WASM DB | PGlite | `db/client.ts` | WASM (server) | IMPLEMENTED |

---

## §4. AUDIT AREA (A–L) — status per area terhadap kode aktual

> Format: **Digunakan** / **Sebagian** / **Relevan-belum-dipakai** / **Tidak relevan** — dengan bukti.

### A. DEVICE & HARDWARE
| API | Status | Bukti/use case produk |
|---|---|---|
| Geolocation | **Relevan-belum-dipakai (NILAI TINGGI)** | GPS hardcoded `0.7893°S 113.9213°E` di `FindingCapture.tsx:196`, `RunChecklist.tsx:16`, `FindingDesk.tsx:163`; copy "GPS Locked/±1m" sudah jadi requirement UI |
| Vibration | **Relevan-belum-dipakai** | Design System B = tablet rugged, tombol PASS/FAIL besar (`README.md`); haptics untuk konfirmasi LOTO |
| Wake Lock | **Relevan-belum-dipakai** | `RunChecklist` checklist langkah 05: "pressure hold test (150 PSI for 30 minutes)" (`app/work-orders/[id]/print/page.tsx:24`) — layar tablet tidak boleh tidur saat checklist terbuka |
| Network Information (`connection.saveData/effectiveType`) | **Relevan-belum-dipakai (P3)** | Penyesuaian antrian upload evidence di jaringan seluler lapangan |
| DeviceMemory/hardwareConcurrency | **Relevan-belum-dipakai (P3)** | Gate fitur berat (dossier builder) untuk tablet kelas bawah |
| BarcodeDetector | **Relevan-belum-dipakai (NILAI TINGGI)** | `FindingCapture.tsx:42-49` simulateScan; `InventoryLedger.tsx:212` "Print QR / Barcode"; GRN `app/(ops)/purchasing/invoices/[id]/page.tsx:228` "Barcode Scan: Idempotent Verified" (copy tanpa fungsi); badge RFID |
| Screen Orientation | **Relevan (P3)** — kunci landscape untuk mode run di tablet kiosk (iringi PWA) | |
| Generic Sensor/Accelerometer/Gyro/Magnetometer/Ambient Light | **Tidak relevan** — telemetri industri masuk via gateway SCADA/Modbus → `POST /api/telemetry/ingest` (`route.ts`), bukan sensor browser | |
| Web Bluetooth/USB/Serial/HID/Gamepad/Pointer Lock/Keyboard Lock/Virtual Keyboard/Device Orientation/Motion/Battery/Contact Picker/EyeDropper/Face & Text Detection (Shape Detection) | **Tidak relevan** untuk produk CMMS multi-tenant SaaS saat ini (lihat M) | |

### B. CAMERA, AUDIO & VIDEO
| API | Status | Bukti/use case |
|---|---|---|
| HTML Media Capture (`<input type=file accept capture>`) | **Relevan-belum-dipakai (P1)** | "Tap to activate camera with GPS & time overlay" (`FindingCapture.tsx:231`); guard RunChecklist: "reading + photo + finding note required" (`RunChecklist.tsx:270`); `evidence.requiresPhoto` (`db/schema.ts:351`) |
| `getUserMedia` + ImageCapture | **Relevan-belum-dipakai (P2)** | In-app camera preview + GPS watermark overlay canvas sebelum upload |
| MediaRecorder | **Relevan-belum-dipakai (P2)** | Item antrian "VOICE NOTE · 0:12" (`SyncStatus.tsx:13`) — voice-note evidence sudah dinamai produk |
| enumerateDevices | **Relevan (P2)** | Pemilihan kamera belakang di tablet lapangan |
| MediaCapabilities | **Relevan (P3)** | Pilih codec voice note |
| WebRTC/RTCDataChannel/getDisplayMedia/Region/Element Capture/Insertable Streams | **Tidak relevan** — tidak ada requirement voice/video/screen-share realtime di repo (lihat M) | |
| Picture-in-Picture / Document PiP / Media Session / MSE / WebCodecs/AudioWorklet | **Tidak relevan** — tidak ada media playback | |

Backend→client offload aman (B): **resize/kompres foto + hash SHA-256 + thumbnail** sebelum upload (server tetap validasi authoritative — §5/K).

### C. GPU, GRAPHICS & LOCAL COMPUTE
| API | Status | Bukti/use case |
|---|---|---|
| SVG | **Digunakan** | BIM schematic viewer `components/assets/AssetBim.tsx` (node/edge SVG statis) — memadai untuk schematic; bukan BIM 3D |
| Canvas/`createImageBitmap`/ImageBitmap | **Relevan-belum-dipakai** | Resize thumbnail + watermark GPS pada foto evidence sebelum upload |
| OffscreenCanvas + Worker | **Relevan (P3)** | Pemrosesan gambar di luar main thread bila volume foto tinggi |
| CSS filters | **Digunakan sebagian** (Tailwind backdrop-blur di header/shell) | `SyncStatus.tsx:64` `backdrop-blur-xl` |
| WebGL/WebGL2/WebGPU/WGSL/WebXR/CSS Paint/Typed OM/HDR spatial | **Tidak relevan saat ini** — viewer BIM 3D (IFC) = proyek terpisah (lihat M); tidak ada beban ML/inferensi lokal | |

### D. FILES & LOCAL STORAGE
| API | Status | Bukti/use case |
|---|---|---|
| localStorage | **Sebagian (UNSAFE-ish untuk kasus ini)** | Outbox JSON di `lib/offline/outbox.ts`: sinkron di main thread, quota ~5MB, `JSON.parse` tanpa versioning (key `..._v1`), gagal diam-diam (`catch {}` baris 41-44), tanpa cross-tab coherence, tanpa cleanup saat logout |
| IndexedDB | **Relevan-belum-dipakai (P1)** | Wadah yang benar untuk outbox + cached list field (asinkron, transaksional, >50MB, index per status) |
| StorageManager `persist()`/`estimate()` | **Relevan-belum-dipakai (P1-adjacent)** | Mutasi lapangan yang hilang karena eviction = data-integrity issue; UI Sync bisa menampilkan `estimate()` |
| BroadcastChannel | **Relevan-belum-dipakai (P2)** | (1) Coherence outbox lintas tab; (2) force-logout lintas tab saat `revokeAllUserSessions` (`ProfileSessions.tsx` + `auth/sessions/route.ts`) |
| File/Blob/FileReader | **Sebagian** — Blob untuk export; FileReader & `<input type=file>` NOT FOUND | |
| File System Access (`showSaveFilePicker`) | **Relevan (P2, Chromium, dgn fallback)** | Dialog Save-As untuk dossier 412-record (`ReportsHub.tsx:113-149`) |
| structuredClone | **Relevan (P3)** | Util internal; tidak ada hot path |
| CompressionStream/DecompressionStream | **Relevan (P3)** | Kompresi export besar di client |
| Cache Storage/OPFS/Storage Buckets/Shared Storage/Cookie Store/partitioned cookies/Storage Access | **NOT FOUND**; relevansi: Cache Storage baru masuk bila SW dibangun (Wave 3); sisanya tidak relevan | |

Risiko storage saat ini: oversized JSON parse sinkron; stale data antar-tab; corrupted state telan-senyap; **logout tidak membersihkan outbox lokal** (potensi kebocoran draft lintas-user di tablet bersama) — disebutkan eksplisit karena tablet lapangan = shared device dengan impersonation window 30-menit (`OrgHub.tsx:242`).

### E. NETWORKING
| Item | Status | Bukti |
|---|---|---|
| fetch | **Digunakan, PARTIAL** — 15 call-site, 0 AbortController, 0 timeout, 0 central client | daftar di C |
| Streaming fetch/Streams | **Relevan (P2)** | Export report besar: server bisa stream CSV (route handler `ReadableStream`) alih-alih buffer penuh; copy "full extract streams from read replica" (`ReportsHub.tsx:113`) |
| SSE (EventSource) | **Relevan-belum-dipakai (P2 NILAI TINGGI)** | SLA alerts sudah dihitung server-side dari `sla_due_at` (`app/api/notifications/route.ts:24-60`) — push satu arah cocok; ganti copy "WebSocket" palsu |
| WebSocket/WebSocketStream/WebTransport | **Tidak direkomendasikan (M)** — kebutuhan realtime = alert satu arah; WS menambah kompleksitas two-way tanpa use case | |
| Beacon (`navigator.sendBeacon`) | **Relevan-belum-dipakai (P1)** | Flush telemetri RUM + last-chance outbox marker saat `pagehide` |
| Background Sync | **Relevan (P3→Wave 3)** — butuh SW; auto-flush outbox saat koneksi pulih | |
| Background Fetch / Periodic Sync | **Tidak relevan** saat ini | |
| preconnect/dns-prefetch | **Tidak relevan** — API same-origin; font CDN tidak dipakai (`app/layout.tsx:7-9` system stack by design) | |
| preload | **Relevan kecil** — preload font woff2 self-hosted saat TODO font dikerjakan (`PROGRESS.md`) | |
| Speculation Rules/prerender/Early Hints | **P3** — mayoritas halaman dinamis ber-sesi; keuntungan kecil | |
| Duplicate request/cancellation | Temuan: ⌘K race (C.4); route search menjalankan 4 query **sekuensial** (`app/api/search/route.ts:34+`) — bisa `Promise.all` (backend micro-opt, P2) | |
| HTTP/2/3 | Di luar repo (layer hosting) — NOT FOUND config; dicatat saja | |

### F. PWA & OS INTEGRATION
| API | Status | Bukti/use case |
|---|---|---|
| Web App Manifest + installability | **Relevan-belum-dipakai (Wave 3, NILAI TINGGI produk)** | Target pengguna = teknisi lapangan tablet + "kiosk"; `FieldShell` bottom-nav + safe-area (`pt-safe/pb-safe` `globals.css:59-66`) sudah dirancang seperti app shell |
| Service Worker (app-shell cache) | **Relevan (Wave 3)** | "Offline — drafts queue locally" (`FieldOffline.tsx:23`) janji UI; basement = dead zone (kanon lokasi) |
| Push API + Notifications | **Relevan (Wave 3)** | Eskalasi SLA: "paged D. Chen + on-duty VP" (`NotificationsHub.tsx:134-140`) → push lebih tepat daripada in-app seed |
| Badging API | **Relevan (P3)** | Badge `Sync` hardcoded `badge: 2` di `FieldShell.tsx:20` → jadikan count outbox nyata |
| App Shortcuts | **Relevan (P3)** — shortcut "New Finding", "Sync Queue" di manifest | |
| Web Share/Share Target | **Relevan kecil (P3)** — share link WO ke teknisi | |
| File Handling/Protocol Handler/Launch Handler/Window Controls Overlay | **Tidak relevan** saat ini | |

Kesesuaian produk: **offline-first = YA untuk slice field**; installable = YA; kiosk/POS = sebagian (badge print station); internal operational tool = ya; mobile field application = ya. Ini bukan retrofit — copy produk sudah menjanjikannya.

### G. AUTHENTICATION & SECURITY
| Item | Status | Bukti |
|---|---|---|
| Token location | **httpOnly cookie (BENAR)** — bukan localStorage | `lib/auth/session.ts:30-37` |
| Cookie flags | httpOnly ✓ sameSite=lax ✓ secure=production ✓ path=/ ✓ maxAge 7d ✓ | `session.ts:30-37` |
| Session storage server | sha256(token) di DB, revoke + list + revoke-all | `session.ts`, `app/api/auth/sessions/route.ts` |
| CSRF | Origin-vs-Host check di `withRoute:46-56` + SameSite=Lax; **lib double-submit `csrf.ts` DEAD** — putuskan: wire atau hapus | |
| WebAuthn/Passkeys | **NOT FOUND — kandidat P2 NILAI TINGGI**: copy "FIDO2 / MFA Security Key Re-enrollment" sudah tayang (`settings/jobs/page.tsx:21-28`); TOTP sudah real sehingga passkey = faktor phishing-resistant tambahan untuk peran VP/Manager di tablet | |
| Credential Management/FedCM/Digital Credentials | **Tidak relevan** saat ini (IdP eksternal belum ada) | |
| Web Crypto (client) | **Relevan-belum-dipakai (P1)** | `crypto.subtle.digest('SHA-256', file)` untuk `sha256Hash` evidence (`evidence/route.ts:14`); juga verify hash-chain audit di client bila diinginkan |
| Trusted Types | **P3** — 0 `dangerouslySetInnerHTML`/`innerHTML`/`eval` ditemukan (grep) → permukaan XSS kecil; TT menambah kompleksitas tanpa temuan | |
| CSP/SRI/COOP/COEP/CORP/Permissions-Policy | **NOT FOUND semuanya** — kandidat P1 (CSP report-only → enforce; Permissions-Policy batasi camera/mic/geolocation ke route field bila fitur itu dibangun) | `next.config.mjs` (hanya 9 baris, tanpa `headers()`) |
| Payment Request/Secure Payment Confirmation | **Tidak relevan** — billing via Stripe webhook server-side (`app/api/billing/webhook/route.ts`) | |
| Local/auth di storage | Tidak ada token di localStorage ✓; outbox pasca-logout = gap (D) | |

XSS surface: tidak ada dynamic HTML injection/eval/unsafe script; Radix aman; sisa risiko = misconfiguration header — maka CSP = obat yang tepat.

### H. PERFORMANCE & OBSERVABILITY
| Item | Status | Bukti |
|---|---|---|
| Performance API/Observer (LCP/INP/CLS/ Long Tasks/Resource/Navigation/User/Element/Paint Timing) | **NOT FOUND (client)** | grep `performance\.` → 0 di app/components/lib |
| Server-side APM | **Digunakan** | RED in-memory + `x-request-id`/`traceparent` di setiap respons (`lib/api/http.ts:83-94`); endpoint `/api/telemetry/metrics` |
| Propagasi trace | **Sebagian** | Server membaca & membalas `traceparent`; **client fetch tidak mengirim `traceparent`** → rantai FE→BE putus |
| Server-Timing header | **Relevan-belum-dipakai (P1, 1-baris)** | `durationMs` sudah dihitung di `withRoute:76`; tinggal emit header — langsung terlihat di DevTools client |
| IntersectionObserver | **Relevan-belum-dipakai (P2)** | Lazy-render baris audit 412-record & ledger; virtualisasi manual saat ini = render penuh |
| Long Animation Frames | **P3** | |
| Sentry/OTel-collector/Datadog/NewRelic/GA | **NOT FOUND** (self-hosted log only — desain sadar "zero CDN") | README stack |

Gap matrix yang tidak bisa dijawab hari ini: halaman lambat ✗ · API lambat dari sisi user ✗ (server punya `durationMs` tapi tanpa konteks jaringan client) · interaksi lambat (INP) ✗ · browser/device bermasalah ✗ · route terberat (RUM) ✗ · resource penghambat LCP ✗ · error JS client ✗ (tidak ada window.onerror/unhandledrejection beacon).

### I. MODERN UI
| Item | Status | Bukti |
|---|---|---|
| `<dialog>`/`popover` | **Digunakan via Radix** (alert-dialog, dialog, critical-action-dialog) — **JANGAN diganti native** (Radix menambah focus-trap/portal/aria yang native belum samakan UX-nya di semua browser target) | `components/ui/dialog.tsx` |
| View Transitions | **Relevan (P3)** | Next router; transisi list↔detail WO |
| Container queries | **Relevan (P2)** | Shell padat `OpsShell` (`desktop:pl-72`); komponen hub dalam grid lebar variatif — hari ini breakpoint global Tailwind |
| `:has()` | **Relevan (P2, kosmetik)** | Styling kartu berdasar state anak (badge P1) — sekarang conditional class JS — kecil |
| Scroll snapping | **Digunakan?** tidak ditemukan — daftar audit panjang: kandidat kecil | |
| Anchor positioning/custom select/field-sizing/cascade layers/subgrid/CSS nesting | **Tidak ada kebutuhan kustom di repo** (tooltip engine: NOT FOUND — tak perlu replacement) | |
| JS animation library | **NOT FOUND** — transisi CSS saja; tidak ada yang perlu di-native-kan | |
| Custom resize/manual tooltip/modal manual | **NOT FOUND** (Radix menutupi) — jadi "potensi pengurangan JS" dari modern-UI ≈ **rendah** di repo ini; yang dominan justru pengurangan duplikasi download & virtualisasi list | |

Estimasi pengurangan JS dari Modern UI saja: **kecil (<5%)** — codebase sudah disiplin Radix+Tailwind. Pengurangan JS terbesar justru: konsolidasi 12 util download (∼150 baris), menghapus pseudo-hash generator klien (∼30 baris, `AuditTrail.tsx:131-150`), dan mengganti simulasi sync (∼40 baris `SyncStatus.tsx`).

### J. WORKERS, WASM & BACKGROUND COMPUTE
| Item | Status | Bukti/use case |
|---|---|---|
| Web Worker | **Relevan-belum-dipakai (P2)** | CSV dossier 412-record + pseudo-hash di main thread `AuditTrail.tsx:131-150,576-586`; bila data nyata: serialize ribuan audit event → worker |
| WASM | **Digunakan (server)** | PGlite — bukti tim sudah nyaman dengan WASM; kandidat client-WASM (ZXing barcode) = P3 dgn fallback BarcodeDetector |
| scheduler.postTask/requestIdleCallback | **Relevan (P3)** | Defer CSV build saat idle |
| SharedWorker/Worklets/SharedArrayBuffer/Atomics/Web Locks | **Tidak relevan** | |
| WASM SIMD/threads/streaming compilation | **Tidak relevan** | |

Operasi berat frontend aktual: CSV building (kecil-sedang), pseudo-hash (kecil), filter/search list besar di memori (`NotificationsHub` filter 38+ SEED; AuditTrail filter `e.id…hash` baris 534). **Tidak ada** PDF generation, crypto bulk, atau parsing CSV besar di client — maka skala Worker = sedang, bukan mendesak.

### K. NAVIGATION
| Item | Status | Bukti |
|---|---|---|
| Next `<Link>` + `router.push` | **Digunakan** | `CommandPalette.tsx:95-109`, dsb. |
| Prefetch | Default Next (viewport-based di prod) — **Digunakan implisit** | |
| View Transitions/Speculation/prerender/Navigation API/URLPattern custom | **Tidak relevan/P3** — halaman dinamis sesi | |
| `location.href` | Digunakan sadar (full reload pasca login) ✓ | `LoginForm.tsx:62` |

### L. BROWSER AUTOMATION & AGENTIC
| Item | Status | Bukti |
|---|---|---|
| Playwright/Puppeteer/Selenium/Cypress/WebDriver/CDP | **NOT FOUND** | `package.json` devDeps |
| Test runner | `node --test` + PGlite temp (bagus untuk BE/domain) | `package.json:9`, `tests/` |
| Kesiapan agentic | **Sebagian**: app bisa `next dev` + smoke 200/404 sudah dilakukan manual (`PROGRESS.md:47`); tanpa browser harness, coding agent tidak bisa verifikasi UI otomatis | |

Rekomendasi arah (bukan implementasi): Playwright = P2 observability/QA (aksi nyata login→MFA→dashboard bisa diautomasi; MFA punya dev hint — harness-able).

---

## §5. FRONTEND vs BACKEND RESPONSIBILITY

| Opportunity | Frontend | Backend | Hybrid | Reason |
|---|---|---|---|---|
| Foto evidence: resize/kompres/watermark GPS | ✓ (canvas, preview) | ✓ (validasi authoritative: mime sniffing, ukuran max, scan, EXIF policy) | **Hybrid** | Client = optimasi bandwidth; server tidak boleh trust client |
| SHA-256 hash evidence | ✓ (`crypto.subtle.digest`) | ✓ (re-hash ulang file yang diterima & bandingkan) | **Hybrid** | Hash klien = dedup/integritas cepat; hash server = kebenaran |
| Barcode scan aset | ✓ (BarcodeDetector/kamera) | ✓ (validasi kode aset ada & milik tenant) | **Hybrid** | Client tidak trusted |
| Offline list cache (WO/inspection milik teknisi) | ✓ (IndexedDB) | ✓ (scope query, ETag/304, TTL policy) | **Hybrid** | |
| Outbox replay | ✓ (antri + idem-key persist) | ✓ (idempotency store + 409 dedup — SUDAH ADA: `lib/services/idempotency.ts`) | **Hybrid** — backend-nya sudah siap sejak Phase 1 | |
| SSE alert SLA | ✓ (render + reconnect backoff) | ✓ (stream + RBAC filter per-tenant + heartbeat) | **Hybrid** | |
| CSV dossier besar | ✓ (preview kecil) | ✓ (stream authoritative, RBAC `reports.read`) | **Hybrid** | Pindahkan pembuatan 412-record ke server stream bertahap |
| Passkeys | ✓ (`navigator.credentials.create/get`) | ✓ (challenge store, verify attestation/assertion, counter) | **Hybrid** | |
| RUM beacon | ✓ (collect + batch + sendBeacon) | ✓ (`/api/telemetry/rum` baru + agregasi, jangan log PII) | **Hybrid** | |
| ETag/304 | ✓ (otomatis via fetch cache) | ✓ (wire `createEtagResponse` di GET list) | **Backend-led** | Client gratis |
| Push SLA | ✓ (subscribe, tampilkan) | ✓ (VAPID keys, enqueue, RBAC) | **Hybrid** | |
| Kompresi export | ✓ | ✓ | Frontend-led | ukuran kecil hari ini |

Prinsip ditegakkan: **client tidak pernah trusted untuk validasi keamanan**.

---

## §7/§10. PRIORITIZATION + QUICK WINS (≤15)

### P0 — Existing risk (bug/security/reliability sekarang)
| # | Candidate | Current problem | Native API | Location | Benefit | Complexity | Metric |
|---|---|---|---|---|---|---|---|
| 1 | Abort/timeout untuk ⌘K search | Respons basi menimpa hasil baru (race) | `AbortController` | `components/ops/CommandPalette.tsx:49-70` | Hasil benar; −dupe request | **XS** | error rate ↓, stale-result count = 0 |
| 2 | Outbox DEAD vs `/field/sync` simulasi | Janji "Nothing is lost" tanpa implementasi; mutasi lapangan hilang | localStorage→IndexedDB + wiring | `lib/offline/outbox.ts`, `components/field/SyncStatus.tsx:12-43` | Reliabilitas inti field | **M** | offline success rate; item hilang = 0 |
| 3 | Nol security headers | Tidak ada CSP/Permissions-Policy; damage-limit XSS/absuse-fitur | HTTP headers | `next.config.mjs` (+`headers()`) | Attack surface ↓ | **S** | CSP report count; audit pass |
| 4 | CSRF lib DEAD + hanya Origin check | `lib/auth/csrf.ts` tak terpakai; Origin fallback lemah untuk non-browser | (server) putuskan wire/hapus | `lib/api/http.ts:46-56` | Kejelasan batas keamanan | **S** | 403 CSRF mismatch test |
| 5 | Outbox survive logout di shared tablet | Draft mutasi user A terkirim sebagai user B | (storage policy + `BroadcastChannel('auth')`) | `lib/offline/outbox.ts`, `TopBar.tsx:16-18` | Data-integrity & privasi | **S** | 0 replay lintas-user |

### P1 — High-value / low-complexity
| # | Candidate | Current problem | Native API | Location | Benefit | Complexity | Metric |
|---|---|---|---|---|---|---|---|
| 6 | Fetch helper terpusat: timeout + abort + retry-idempotent + `traceparent` | 15 call-site duplikatif, tanpa timeout, trace putus | fetch + AbortController | `lib/api/client.ts` (baru) + semua call-site | Konsistensi error UX; jejak e2e | **S** | network error rate; % req dgn trace |
| 7 | Client SHA-256 untuk evidence | Server minta `sha256Hash`, tak ada yang menghitung | `crypto.subtle.digest` | util baru dipakai `FindingCapture`/upload | Integritas + dedup | **XS** | upload bytes (dedup hit) |
| 8 | Media Capture foto evidence | Kamera = simulasi 800ms | `<input type="file" accept="image/*" capture>` | `FindingCapture.tsx:42-49`, `RunChecklist.tsx:150-200` | Fitur inti mobile jadi nyata | **S** | evidence attach success rate |
| 9 | Geolocation stamp nyata | GPS literal hardcoded | `navigator.geolocation.getCurrentPosition` | `FindingCapture.tsx:196` | Bukti forensik benar | **XS** | % finding dengan koordinat asli |
| 10 | RUM beacon (LCP/INP/CLS/LongTask) | FE buta performa/error | PerformanceObserver + `sendBeacon` | `lib/telemetry/rum.ts` (baru) → route `/api/telemetry/rum` (baru) | Jawaban "halaman mana lambat" | **S** | LCP/INP p75 per route |
| 11 | `Server-Timing` header | `durationMs` tak terlihat client | header HTTP | `lib/api/http.ts:83-94` | Debug latency 0-alat | **XS** | waktu diagnosa |
| 12 | ETag oleh 3-5 GET list terberat | Engine DEAD; payload penuh setiap kunjungan | (server) wire `createEtagResponse` | `app/api/work-orders/route.ts`, `service-requests`, `notifications` | 304 hemat bytes | **S** | network bytes ↓, cache hit rate |
| 13 | Vibration feedback PASS/FAIL | Tak ada haptic di tablet rugged | `navigator.vibrate` | `RunChecklist.tsx` tombol PASS/FAIL | UX sarung tangan | **XS** | task-tap error rate (BENEFIT sulit diukur → tandai) |
| 14 | Wake Lock di mode run | Layar tidur saat 30-menit hold test | `navigator.wakeLock.request('screen')` | `RunChecklist.tsx` (lifecycle) | Sesi checklist tak terputus | **XS** | screen-off mid-run events |
| 15 | Konsolidasi 12 download util + revoke | Duplikasi + memory leak kecil | (util, lalu `showSaveFilePicker` dgn fallback di P2) | 12 komponen (tabel C) | −150 baris; API konsisten | **S** | bundle size ↓ kecil; leak object URL = 0 |

### P2 — Strategic (butuh perubahan arsitektur)
- **SSE `/api/notifications/stream`** menggantikan copy WebSocket palsu (server sudah menghitung alert dari `sla_due_at`). Metric: alert delivery latency, reconnect rate.
- **Service Worker + manifest (field shell)**: app-shell cache, IndexedDB outbox + Background Sync, Badging count nyata; installable di tablet. Metric: offline success rate, cache hit rate, install rate.
- **Upload pipeline evidence nyata**: multipart/presigned + client resize/hash (Hybrid §5). Metric: upload bytes, waktu attach, backend CPU (decode turun).
- **Passkeys/WebAuthn** sebagai MFA phishing-resistant (copy FIDO2 sudah tayang). Metric: login success time, MFA abandonment.
- **Playwright harness** untuk verifikasi agentic (login/MFA→dashboard→transisi WO). Metric: automated smoke pass rate.
- **Virtualisasi/lazy list via IntersectionObserver** untuk AuditTrail 412-record & ledger. Metric: INP, main-thread blocking.

### P3 — Experimental / belum terbukti
- View Transitions pada router Next; CompressionStream untuk export; File System Access save-as; Speculation Rules; Network Information adaptif; WASM ZXing (fallback BarcodeDetector); `scheduler.postTask`; Container queries + `:has()` styling pass; Document PiP (gimmick untuk checklist); Periodic Background Sync.

---

## §9/§5. BACKEND OFFLOAD OPPORTUNITIES (K)

| Workload | Current location | Browser capability | Safe to offload? | Server tetap responsible untuk |
|---|---|---|---|---|
| Resize/thumbnail foto | Belum ada sama sekali | Canvas/`createImageBitmap` (+Worker) | **Ya (optimasi)** | validasi mime+size (authoritative), re-encode kanonik, storage |
| SHA-256 checksum | Server mengharapkan dari client (`evidence/route.ts:14`) | `crypto.subtle` | **Ya (prima)** | re-hash & bandingkan; chain-of-custody |
| Watermark GPS/waktu | Copy UI menjanjikan | Canvas overlay | **Sebagian** (kosmetik) | GPS tidak boleh dipercaya — simpan sbg klaim, bukan bukti; server catat `receivedAt` otoritatif |
| Barcode decode | Simulasi | BarcodeDetector (Chromium) / WASM ZXing fallback | **Ya** | validasi aset-tenant |
| CSV preview kecil | Client Blob (12 komponen) | tetap client | Ya (ukuran kecil) | export besar → streaming server |
| Search ⌘K relevansi | Server 4 query sekuensial | — (tetap server) | Tidak | paralelkan query, index `ilike` |
| Offline cache list field | Nol | SW + IndexedDB + ETag | **Ya (read-only cache)** | scope & TTL per tenant; invalidasi |
| Kompresi payload export | Nol | CompressionStream | Ya (P3) | integritas arsip |
| Local search atas cache field | Nol | IndexedDB index | Ya (scope teknisi) | canonical search tetap server |
| Enkripsi at-rest outbox | Nol | Web Crypto (kunci non-extractable) | **Hati-hati (P3)** — manajemen kunci di browser shared-device rumit | Kebijakan retensi & purge |

---

## §11/M. DO NOT IMPLEMENT

| API | Reason | Current product requirement | Why benefit does not justify complexity |
|---|---|---|---|
| WebRTC / RTCPeerConnection / getDisplayMedia | Tidak ada satu pun flow komunikasi P2P/screen-share di 87 route | Kolaborasi = audit trail + handover shift berbasis catatan | Membangun infra P2P+TURN untuk zero use case |
| WebSocket (generik) | Realtime yang dibutuhkan = alert satu arah (SLA) | `notifications/route.ts` sudah hitung dari DB | SSE (HTTP, proxy-friendly, auto-reconnect) mencukupi; WS menambah state conn mgmt & auth handshake kustom |
| WebTransport | HTTP/3 datagram tidak menyelesaikan masalah produk | — | Eksperimental + butuh infra |
| WebGPU / WebGL viewer BIM 3D | `AssetBim` = schematic SVG yang memadai untuk 38 node telemetri | Tidak ada model IFC/3D di repo (`*.ifc` NOT FOUND) | Proyek viewer 3D = scope produk baru, bukan API swap |
| WebXR | Tidak ada requirement AR/VR | — | — |
| Generic Sensor / Web Bluetooth / WebUSB / Web Serial / WebHID | Telemetri masuk via gateway SCADA/Modbus → REST (`telemetry/ingest/route.ts:26-35`) | Browser bukan ingestion path; tablet lapangan tidak tersambung sensor industri | Chromium-only + pairing UX rapuh di tablet shared |
| Gamepad/Pointer Lock/Keyboard Lock/EyeDropper/Contact Picker/FedCM/Digital Credentials/Payment Request/Secure Payment Confirmation/Shared Storage/Storage Access/Window Controls Overlay/File Handling/Protocol Handler | Tidak ada kebutuhan produk yang cocok | Billing via Stripe server-side; IdP eksternal tidak ada | Zero requirement |
| Trusted Types | Permukaan XSS sudah kecil: 0 `dangerouslySetInnerHTML`/`innerHTML`/`eval` | CSP (report-only) terlebih dahulu | TT tanpa sink penulisan DOM = beban tanpa temuan |
| Navigation API / URLPattern custom | Next router sudah menangani | — | Duplikasi router |
| Local AI inference (WASM/WebGPU LLM) | Tidak ada data pipeline/teks besar untuk summarization lokal; kanon data kecil | — | BENEFIT NOT YET MEASURABLE; revisit bila work-order notes volume besar |
| Periodic Background Sync / Background Fetch | Konten bukan media besar/berkala | — | Outbox cukup Background Sync biasa (Wave 3) |
| Ganti Radix dgn `<dialog>` murni | Radix memberi focus-trap, portal, DismissableLayer, aria yang konsisten | 3 varian dialog kritis (reason/PIN/spend) | Native belum menyamakan lintas Safari — fungsi penting hilang |

---

## §12. CROSS-BROWSER CHECK (target: Chrome, Edge, Safari; Firefox opsional)

| Proposal | Kategori | Fallback wajib (feature-detect, BUKAN UA-sniff) |
|---|---|---|
| `<input capture>` foto | **Cross-browser** (iOS Safari & Android Chrome OK) | File picker biasa bila `capture` diabaikan |
| `crypto.subtle.digest` | **Cross-browser** (secure context) | Server-side hashing tetap jalan |
| Geolocation | **Cross-browser** | `if (!('geolocation' in navigator))` → input zona manual (sudah ada kolom zone) |
| PerformanceObserver (LCP/INP/CLS) | **Chromium penuh; Safari sebagian** (INP belum; LCP terbatas) | Buffer entries yang tersedia; tandai unsupported per UA string di agregasi server |
| `sendBeacon` | **Cross-browser** | `fetch(..., {keepalive:true})` fallback |
| BarcodeDetector | **Chromium-focused** | `if ('BarcodeDetector' in window)` → fallback entri kode manual (today's behavior) → WASM ZXing (P3) |
| Vibration | **Chromium/Android; Safari iOS tidak** | no-op silently (haptic enhancement) |
| Wake Lock | **Chromium-focused, Safari 16.4+** | fallback: instruksi "keep screen on"; tidak blocking |
| SSE EventSource | **Cross-browser** | fallback polling `fetch` interval 30-60s pada `error` persisten |
| Service Worker/manifest/Badging | **Cross-browser (SW); Badging Chromium-focused** | app tetap jalan tanpa SW; `if ('setAppBadge' in navigator)` |
| Background Sync | **Chromium-focused** | flush on `online` event (sudah ada pola di `FieldOffline`) |
| WebAuthn/Passkeys | **Cross-browser modern** | TOTP tetap sebagai faktor kedua (SUDAH IMPLEMENTED) |
| `showSaveFilePicker` | **Chromium-focused** | anchor-download (pola saat ini) |
| CompressionStream | **Cross-browser modern** | kirim uncompressed |
| View Transitions | **Chromium-focused; Safari 18+** | none (enhancement) |
| Trusted Types | **Chromium** (tapi: DO NOT IMPLEMENT) | — |

Server middleware `proxy.ts` sudah benar tidak melakukan UA-sniffing — pertahankan pola feature-detect di client.

---

## §6. TYPESCRIPT FEASIBILITY — kandidat nilai tertinggi

**Feature: Offline outbox nyata (IndexedDB + wiring `/field/sync`)**
- Current implementation: `lib/offline/outbox.ts` (localStorage, DEAD); `SyncStatus.tsx` simulasi.
- Browser API: IndexedDB, BroadcastChannel, `online` event, (Wave 3) Background Sync.
- Frontend TypeScript location: `lib/offline/outbox.ts` (ganti storage layer — IDB promise wrapper ~60 baris tanpa dependency baru), `components/field/SyncStatus.tsx` (render dari `listOutbox()`), wire `enqueueOutbox` di `RunChecklist` submit & `FindingCapture`.
- Backend TypeScript location: tidak perlu — idempotency + 409 sudah ada (`lib/services/idempotency.ts`, route transitions).
- Required dependency: **0** (native).
- Can use native API: ya.
- Browser compatibility: cross-browser.
- Fallback: memory queue + banner (degradasi terhormat).
- Security implication: purge saat logout (`TopBar.tsx:16`); jangan simpan payload sensitif melebihi TTL; tenant scope check server tetap.
- Performance implication: hapus JSON.parse sinkron dari main thread.
- Implementation complexity: M.
- Expected benefit: offline success rate; nol mutasi hilang (metrik: `synced/(synced+failed)` dari `flushOutbox` return, `lib/offline/outbox.ts:66-120`).
- Evidence: §B/C/D.

**Feature: Photo evidence capture + hash (P1 chain)**
- Current: simulasi + metadata-only API.
- Browser API: `<input capture>`, File API, `crypto.subtle.digest`, Canvas (resize, P2), `createImageBitmap`.
- FE TS: `FindingCapture.tsx:225-235` (area "Tap to activate camera…"), util baru `lib/media/evidence.ts`; upload `FormData` ke route baru `POST /api/work-orders/[id]/evidence/upload`.
- BE TS: route upload baru (multipart) → simpan bytes (disk lokal dev; object storage prod) → panggil `addEvidence` (`lib/services/task-service.ts`) dengan hash terverifikasi ulang.
- Dependency: 0 untuk P1 (multipart native Next route handler; `req.formData()`).
- Compatibility: cross-browser; resize canvas P2.
- Fallback: kirim file asli tanpa resize; server re-encode.
- Security: validasi mime sniffing + max size di server; strip EXIF per kebijakan; path traversal guard pada `filePath`.
- Performance: −upload bytes (target: 8MP → ≤1600px JPEG q0.8 ≈ 70-85% lebih kecil); metrik: upload bytes, waktu attach.
- Complexity: M. Expected benefit: fitur inti field menjadi nyata; metric: attach success rate, rerata MB/evidence.
- Evidence: `RunChecklist.tsx:270` guard mewajibkan foto; `db/schema.ts:351` `requiresPhoto`.

**Feature: RUM beacon**
- Current: nol client telemetry.
- Browser API: PerformanceObserver (`largest-contentful-paint`, `event`/INP via `performance.eventCounts` atau web-vitals-style buffer, `layout-shift`, `longtask`), `sendBeacon`, `pagehide`.
- FE TS: `lib/telemetry/rum.ts` baru; mount di `app/(ops)/layout.tsx` & `app/(field)/layout.tsx` (client boundary kecil).
- BE TS: `app/api/telemetry/rum/route.ts` baru (zod schema; permission public-session; agregasi in-memory mirip `lib/telemetry/metrics.ts`).
- Dependency: 0 (tolak web-vitals lib sesuai semangat zero-dep repo; tapi web-vitals@4 = 2KB bila diizinkan).
- Compatibility: Chromium penuh, Safari parsial → tandai.
- Fallback: kirim hanya navigation timing.
- Security: jangan kirim URL dengan parameter sensitif; sampling.
- Performance: overhead <0.5ms/frame; beacon batched.
- Complexity: S-M. Metric: LCP/INP/CLS p75 per route group; long-task count.
- Evidence: §H gap matrix.

**Feature: SSE alerts**
- Current: `NotificationsHub` SEED-only + copy WebSocket palsu.
- Browser API: `EventSource`.
- FE TS: `components/notifications/NotificationsHub.tsx` (ganti SEED → stream + render state reconnect).
- BE TS: `app/api/notifications/stream/route.ts` baru — `ReadableStream`, interval recompute dari query yang sama (`notifications/route.ts:24-60`), heartbeat 25s, tenant filter dari `getSessionContext()`.
- Dependency: 0. Compatibility: cross-browser. Fallback: polling GET 60s.
- Security: jangan emit data lintas tenant (query sudah `eq(organizationId)`); CSRF tidak relevan (GET).
- Performance: −request polling; koneksi satu arah murah.
- Complexity: M. Metric: alert delivery latency (target <5s dari breach), reconnect rate.
- Evidence: §F.

**Feature: Passkeys (P2)**
- FE: `navigator.credentials.create/get` di `LoginForm.tsx` + halaman profil (`components/profile/ProfileSessions.tsx`).
- BE: tabel `webauthn_credentials` baru (Drizzle), challenge store (reuse pola MFA challenge), verifikasi assertion (implementasi manual = L; pertimbangkan lib @simplewebauthn/server bila dependency diizinkan kelak).
- Compatibility: cross-browser modern; fallback TOTP (ada). Security: phishing-resistant; origin pinning `.apexops` domain. Complexity: L. Metric: MFA completion time ↓, lockout rate ↓.
- Evidence: `settings/jobs/page.tsx:21-28` (copy FIDO2), `lib/auth/totp.ts` (baseline).

---

## §14. METRIK PER PROPOSAL (ringkas)

| Proposal | Metric utama | BENEFIT NOT YET MEASURABLE? |
|---|---|---|
| AbortController ⌘K | request count, stale-overwrite = 0 | tidak |
| Outbox IDB | offline success rate, reconnect flush latency | tidak |
| Security headers | CSP violation reports, scanner pass | Sebagian (preventif) |
| Fetch helper + traceparent | % respons BE yang bisa di-join dgn FE span | tidak |
| Media capture + hash | upload bytes −70%, attach success rate | tidak |
| Geolocation | % evidence dgn koordinat aktual | tidak |
| RUM beacon | LCP/INP/CLS p75 per route | tidak |
| Server-Timing | waktu diagnosis | **YA (kualitatif)** — tandai |
| ETag wire | 304 hit rate, network bytes | tidak |
| SSE alerts | delivery latency, reconnect rate | tidak |
| Vibration/Wake Lock | error tap mid-run | **YA — UX; tandai eksplisit** |
| Konsolidasi download | KB bundle, objectURL leak = 0 | tidak |
| Passkeys | waktu login, abandonment | tidak |
| SW/manifest | cache hit rate, offline shell load, install rate | tidak |
| Playwright | smoke pass rate CI | tidak |
| Download save-as picker | — | **YA (UX)** |

---

## §15. JAWABAN FINAL (eksplisit)

> **"Dari seluruh capability browser yang diaudit, fitur mana yang benar-benar layak diimplementasikan pada aplikasi ini, di file mana, mengapa, apa fallback-nya, dan metric apa yang akan membuktikan implementasinya berhasil?"**

1. **AbortController + fetch helper** — `components/ops/CommandPalette.tsx:49-70` & helper `lib/api/client.ts` baru untuk 15 call-site. Mengapa: race nyata hari ini. Fallback: tidak perlu (universal). Metric: stale-response = 0; request count per sesi pencarian.
2. **Outbox nyata di atas IndexedDB + wiring UI sync** — `lib/offline/outbox.ts`, `components/field/SyncStatus.tsx`, enqueue dari `RunChecklist`/`FindingCapture`. Mengapa: janji produk field-offline (`SyncStatus.tsx:73`) + backend idempotency SUDAH siap. Fallback: in-memory + banner. Metric: offline success rate ≥99%, 0 item hilang pada uji airplane-mode.
3. **Foto evidence: `<input capture>` + `crypto.subtle` SHA-256 (+upload route)** — `FindingCapture.tsx`, `RunChecklist.tsx`, route upload baru + `lib/services/task-service.ts`. Mengapa: `requiresPhoto` ada di schema & guard, tapi tak ada jalur nyata. Fallback: file picker biasa; file asli tanpa resize. Metric: attach success rate; upload bytes/evidence −70% setelah resize.
4. **Security headers (CSP report-only → enforce + Permissions-Policy)** — `next.config.mjs`. Mengapa: satu-satunya layer hardening yang hilang di stack yang lainnya rapi. Fallback: report-only dulu. Metric: 0 violation valid setelah tuning; scanner pass.
5. **RUM beacon (LCP/INP/CLS/LongTask + sendBeacon)** — `lib/telemetry/rum.ts` + `/api/telemetry/rum`. Mengapa: tim tidak bisa menjawab satu pun pertanyaan performa sisi browser (§H matrix). Fallback: navigation-timing saja. Metric: dashboard p75 per route; regresi terdeteksi di CI build-vs-build.
6. **SSE untuk SLA alerts** — `app/api/notifications/stream/route.ts` + `NotificationsHub.tsx`. Mengapa: data sudah dihitung server; copy "WebSocket" palsu harus diganti hal yang benar, dan SSE cukup. Fallback: polling 60s. Metric: alert latency <5s; reconnect sukses >99%.
7. **Geolocation stamp nyata** — `FindingCapture.tsx:196`. Mengapa: forensik field; literal hardcoded = bukti palsu. Fallback: input manual zone. Metric: % finding dengan koordinat asli.
8. **ETag wiring di 3 GET list terberat** — `app/api/work-orders/route.ts`, `service-requests/route.ts`, `notifications/route.ts` memakai `lib/api/etag.ts`. Mengapa: engine sudah ada & mati; gratis. Fallback: tidak perlu. Metric: 304 hit rate ≥30% pada navigasi berulang.
9. **PWA field shell (manifest + SW + Background Sync + Badging)** — Wave 3: `app/manifest.ts`, `public/sw.js` (atau `app/sw.ts` passthrough), `FieldShell.tsx` badge dinamis. Mengapa: tablet basement/dead-zone adalah persona inti. Fallback: app web biasa tetap jalan. Metric: offline shell load berhasil, sync setelah reconnect otomatis.
10. **Passkeys sebagai MFA kedua** — Wave 3/4: `LoginForm.tsx`, profil, tabel kredensial baru. Mengapa: copy FIDO2 sudah tayang; phishing-resistance untuk role tinggi. Fallback: TOTP (ada). Metric: waktu login MFA, abandonment.

Yang **tidak** layak: WebRTC, WebSocket generik, WebGPU/GL 3D, sensor APIs, dan daftar §11 — masing-masing dengan alasan produk, bukan alasan teknologi.

---

## N. SUGGESTED IMPLEMENTATION WAVES (tanpa implementasi)

**Wave 1 — Low-risk native enhancements (P0/P1, hari, tanpa dep baru):**
fetch helper + AbortController semua call-site · konsolidasi util download + `revokeObjectURL` · wire `Server-Timing` · CSP report-only + Permissions-Policy · putuskan nasib `lib/auth/csrf.ts` (wire/hapus) · purge outbox on logout · Geolocation stamp · Vibration haptic (feature-detect) · Wake Lock di run mode.

**Wave 2 — Performance + observability (P1/P2, hari–1 minggu):**
RUM beacon + `/api/telemetry/rum` · ETag wiring di 3-5 GET list · wire outbox→IndexedDB + `/field/sync` nyata + BroadcastChannel coherence · paralelisasi query `/api/search` · IntersectionObserver lazy-render untuk list 412-record · self-host font (TODO repo) + preload.

**Wave 3 — Offline/PWA/realtime (P2, 1-2 minggu):**
manifest + ikon + SW app-shell (cache strategi stale-while-revalidate untuk shell; network-first untuk API) · Background Sync flush · Badging count nyata · SSE `/api/notifications/stream` + UI reconnect · upload pipeline evidence (multipart + resize canvas + hash verify) · Push API (VAPID) untuk eskalasi P1 · Playwright smoke harness.

**Wave 4 — GPU/WASM/local compute (P3, selektif):**
Worker untuk CSV/dossier builder + pseudo-hash keluar dari main thread · OffscreenCanvas resize untuk batch foto · `scheduler.postTask`/idle scheduling · CompressionStream export · WASM ZXing sebagai fallback BarcodeDetector lintas-browser.

**Wave 5 — Experimental (gate di belakang feature-detect + ukur dulu):**
View Transitions navigasi · `showSaveFilePicker` · Network Information adaptif · Periodic Background Sync · Passkeys penuh (bila Wave 3 menyiapkan fondasi kredensial dan produk mengonfirmasi prioritas anti-phishing).

---

*Akhir audit. Tidak ada source code, konfigurasi, dependency, branch, atau commit yang diubah/dibuat selama audit ini. Satu-satunya artefak baru adalah dokumen laporan ini.*
