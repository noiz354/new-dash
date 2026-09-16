# Runtime Verification — TASK-26 SSE Alerts

Verdict: **PASS** (siklus penuh termasuk recovery) · Via: MCP chrome-devtools →
prod `next start` :3155 · Tanggal: 2026-09-16

## 1. Static — jujur by design

- Server `app/api/notifications/stream/route.ts` (113 baris): `GET` SSE dilindungi
  sesi + `wo.read`; **server-poll internal 10 dtk (bukan push)**; heartbeat
  komentar 25 dtk; event `hello` mendeklarasikan mode
  `server-poll-stream (not real-time push)`; snapshot hanya bila fingerprint
  berubah; hard-stop 4 menit + `stream-end` agar klien reconnect; header
  anti-buffer (`no-store`, `X-Accel-Buffering: no`).
- Klien `lib/realtime/useSlaStream.ts` (127 baris): state
  `connecting`/`live`/`fallback-polling`/`idle`; `sla-snapshot`→live;
  `stream-end`→reconnect 1 dtk; `onerror` backoff 1→30 dtk; 3 gagal
  beruntun→polling 30 dtk via `GET /api/notifications` + label jujur; dipakai
  `NotificationsHub` (“Polling 30s (SSE unavailable) — honest fallback”).
- Samping (di luar scope): label `WS-PUSH: 12ms` di panel debugger → kandidat
  triase Step 2.

## 2. Runtime — stream/snapshot/heartbeat/headers (oracle A/B/C)

- `/notifications` (sesi m.vance): label transport JUJUR “SSE live stream — 6 SLA
  at risk real server events · snapshot 08:04:14 · 0/3 synthetic on bus” + kartu
  “LIVE SLA WATCH · P1 LIVE STREAM” + tombol “Trigger Test P1 Alert (simulated)”
  berlabel jujur. ✅
- Probe stream 40 dtk (fetch+reader): `200`, `Content-Type:
  text/event-stream; charset=utf-8`; `hello` deklarasikan mode; `sla-snapshot`
  `totalAtRisk:6` (cocok UI); heartbeat comment ~25 dtk (elapsed 27 dtk,
  3 chunks). ✅

## 3. Runtime — kematian stream + fallback (oracle D/E)

- Emulasi Offline 18 dtk: transport MASIH live — analisis jujur: stream yang sudah
  tersambung hanya stall saat paket diblokir (tanpa TCP close) sehingga
  EventSource tak pernah error. Bukan kegagalan hook.
- Reload saat offline (dokumen dari HTTP cache; koneksi baru langsung gagal) →
  setelah 20 dtk: “Polling 30s (SSE unavailable) — honest fallback · Network
  error — server tidak terjangkau. (NETWORK)”. Kematian→error jujur,
  3 gagal→label fallback jujur. ✅

## 4. Runtime — recovery (bonus)

- Restore online + reload + 20 dtk → kembali “SSE live stream — 6 SLA at risk …
  snapshot 08:08:21”, `navigator.onLine true`. Siklus penuh
  live → mati → fallback → pulih. ✅

## 5. Console (oracle F)

- Aktif kosong (post-reload); preserved: `ERR_INTERNET_DISCONNECTED` (artefak
  offline jujur) + 2× issue a11y form-field tanpa id/name (pre-existing,
  backlog); **nol JS exception**. ✅

## Verdict

**TASK-26 → PASS** — stream, snapshot data server nyata, heartbeat, header,
penanganan mati + fallback jujur, dan recovery semuanya terbukti runtime.
