# Test Evidence (Bukti Tereksekusi)

> Aturan: status fitur memakai tier bukti — klaim tanpa bukti = REPORTED ONLY.
> - 🟢 **SOURCE-FOUND** — kode/rute ada di repo ( diverifikasi via `ls`/`find`/CodeGraph ).
> - 🟢 **TESTED** — suite relevan lolos dari eksekusi aktual (bukti di bawah).
> - 🟡 **REPORTED** — diklaim selesai di `docs/sdd/`/audit, belum direproduksi sesi ini.
> - 🔴 **BLOCKED** — tidak dapat dieksekusi di environment ini (alasan dicatat).

## Eksekusi 2026-09-19 (mesin ini)

- `npm test` → **182 tests, 182 pass, 0 fail, 0 skipped** (~4.5 dtk).
  Suite: `tests/unit.test.ts`, `tests/integration.test.ts`,
  `tests/audit-truthfulness.test.ts`, `tests/windowing.test.ts`.
  Status: 🟢 TESTED (level unit/integrasi/truthfulness).
- `npx playwright test -c e2e/playwright.config.ts --list` → **6 tests valid, 2 file**
  (`critical-journey.spec.ts`, `smoke.spec.ts`), proyek `chromium`.
- Eksekusi E2E 2026-09-19 — TERBUKA via Chrome sistem (`/usr/bin/google-chrome`,
  CDP `http://127.0.0.1:9222`, Chrome/152.0.7977.83; config temp
  `e2e/playwright.tmp-chrome.config.ts` = `channel: 'chrome'` + webServer,
  DIHAPUS setelah run — tidak di-commit):
  - `smoke.spec.ts` → **5/5 PASS** (~13 dtk): `/`, `/work-orders`, `/inventory`,
    `/organization`, `/notifications` render di Chrome nyata. Status: 🟢 TESTED
    (level render-halaman; warning CSP `eval` hanya dev-mode, prod unaffected).
  - `critical-journey.spec.ts` → **FAIL 1 langkah**: `convert returns the new WO
    number` — `convertedWoNumber` undefined. Langkah login→SR create (201)→convert
    (200) semua lolos; konversi sukses, yang gagal hanya assertion test.
    Root cause: `lib/services/sr-service.ts:301` me-return
    `{ sr: dto, workOrder: createdWo }`, sedangkan test membaca
    `data.convertedWoNumber` → **drift kontrak test↔API**. Fix (test atau API)
    = commit app terpisah, bukan commit konsolidasi SDD ini.
- Cakupan smoke E2E (saat bisa jalan): `/`, `/work-orders`, `/inventory`,
  `/organization`, `/notifications` + critical journey login→SR→WO.

## Konsekuensi untuk status fitur

- Tidak ada fitur yang boleh naik dari REPORTED ke VERIFIED COMPLETE sebelum suite
  yang mencakupnya lolos dari eksekusi aktual (unit untuk logika, E2E untuk alur).
- Fitur yang bukti tertingginya SOURCE-FOUND (rute ada, uji belum mencakup) = IMPLEMENTED UNVERIFIED.
- Reproduksi dari clean clone: `npm install && npm test` (unit, tanpa DB eksternal —
  PGlite). E2E: + `npm run db:setup`, `npm run dev`, install chromium.
