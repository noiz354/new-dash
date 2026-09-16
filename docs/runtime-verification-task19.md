# TASK-19 — Barcode (FindingCapture) · Runtime Verification Report

> Tanggal: 2026-09-16 · Branch: `arena/01a0a835-new-dash` · Metode: Chrome CDP :9227 (driver: `/tmp/opencode/cdp/task19.cjs`, lib: `cdplib.cjs`)
> Evidence mentah: `/tmp/opencode/evidence/task19/` (8 PNG + `result.json`)

## Expected behavior

Tombol "Scan Barcode / QR" di `/field/findings/new` memakai `BarcodeDetector` asli bila ada
(feature-detected); kamera hidup hanya saat scan aktif; kode terkonfirmasi ≥2 frame mengisi
Asset Tag + toast; cancel/unmount menghentikan semua track; API tak tersedia / izin ditolak →
pesan jujur + input manual tetap jalan; `Permissions-Policy: camera=(self)`.

## Runtime path tested

- URL: `http://localhost:3145/login` → `/` → `/field/findings/new`
- Action: login password+MFA (run 1, screenshot `02-mfa.png`), capability probe, klik Scan saat
  denied (via `Browser.setPermission`), fake-camera stream + QR canvas, tab baru dengan
  `BarcodeDetector` dihapus (simulasi browser unsupported)
- User state: `e.voronova@apexops.io` (Senior Field Tech), session cookie `apex_session`
  (httpOnly) — login+MFA real, bukan stub
- Browser state: Chrome 152.0 Win64, secure context (`isSecureContext=true`, localhost),
  `navigator.mediaDevices.getUserMedia` tersedia, Kaspersky AV menyuntik skrip ke halaman

## Visual evidence

- Screenshot: `01-login.png` (dashboard, already-authed run 2), `02-mfa.png` (form TOTP +
  devHint `492991` ter-render — run 1), `03-findings-form.png` (form + tombol Scan muted),
  `04-denied.png` (klik saat unsupported: tidak ada perubahan — benar), `08-fallback.png`
  (tab unsupported: tombol disabled, `AST-PUMP-011` terketik manual)
- Description: tidak ada video element / indikator kamera yang pernah muncul; tidak ada toast
  error palsu; state fallback terlihat identik di tab utama dan tab simulasi-unsupported

## Runtime evidence

- DOM: `'BarcodeDetector' in window === false`, `typeof BarcodeDetector === 'undefined'`;
  tombol Scan `disabled=true`, `title="BarcodeDetector not supported — type the tag manually"`;
  `document.querySelectorAll('video').length === 0` di semua state; tab-E: `manualTyped ===
  'AST-PUMP-011'`
- Console: 0 exception, 0 error. Sisanya info: React DevTools, HMR connected, dan spam
  CSP-report-only `unsafe-eval` dari host suntikan Kaspersky (`gc.kis.v2.scr.kaspersky-labs.com`)
  → ENVIRONMENTAL, non-blocking (policy report-only)
- Network: 0 failed, 0 status ≥400 pada request aplikasi. `POST /api/security/csp-report → 204`
  (pipeline report TERBUKTI menerima laporan — dipicu suntikan Kaspersky);
  `POST /api/telemetry/rum → 202`; `GET /manifest.webmanifest → 200`;
  `GET /icons/icon-192.png → 200`; `GET /field/findings/new → 200`
- Storage: session via cookie httpOnly (tak terbaca dari `document.cookie` — benar);
  `Network.getCookies` memastikan `apex_session` ada
- Performance: tidak diukur (tidak ada path scan yang jalan) — NO BASELINE
- Permissions: `Browser.setPermission(camera, denied/granted)` diterima CDP; catatan:
  nama permission yang valid di Chrome ini adalah `camera`, BUKAN `videoCapture`
  (driver awal fatal `Invalid PermissionDescriptor` — diperbaiki, murni harness)
- Other (headers dokumen authed, via curl + cookie sesi): `Content-Security-Policy-Report-Only`
  sesuai `next.config.mjs` ✅, `Permissions-Policy: camera=(self), microphone=(), ...` ✅

## Expected vs Actual

- Expected (spec §7): A–F semua teruji termasuk decode sukses + lifecycle kamera bersih.
- Actual: A ✅ (deteksi jujur), E ✅ (manual fallback), B/C/D/F tak terjangkau — Chrome
  Windows desktop TIDAK mengekspos `BarcodeDetector` (MDN compat-data: didukung hanya di
  ChromeOS dan macOS). Direct probe `new BarcodeDetector()` → `BarcodeDetector is not defined`.
  Koreksi metodologi: oracle poll C sempat cocok dengan nilai DEFAULT (`AST-HVAC-004`) —
  dikoreksi via `toastDecoded=false` + nilai tak pernah berubah: TIDAK ada decode yang terjadi.

## Issues found

1. ENVIRONMENTAL (bukan bug kode): scan path native unreachable di Chrome Win64/Linux desktop.
   Di perangkat field Windows, fallback manual ADALAH production path. Bila scan kamera
   wajib di Windows → butuh polyfill (mis. ZXing WASM) = dependensi baru, perlu persetujuan
   (AGENTS.md §6.9). Calon item backlog, BUKAN fix fase ini.
2. Harness (diperbaiki saat sesi): permission name `camera` bukan `videoCapture`.

## Verdict

**PARTIAL** (A=PASS, E=PASS, B/C/D/F=BLOCKED BY ENVIRONMENT, headers=PASS, console+network bersih)

## Required fix

NONE (kode). Tindak lanjut backlog: (a) polyfill scan untuk Windows (butuh keputusan produk +
persetujuan dependensi); (b) uji ulang B/C/D/F di ChromeOS/macOS atau Android bila tersedia.
