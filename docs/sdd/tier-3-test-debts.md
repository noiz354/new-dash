# Tier 3 — Test Debts (7 unit)

## T3-1 — Slice 5: seed checklist canon WO-2026-0894 sebagai data

- Fakta: skema `wo_tasks` + service/API sign-off SUDAH `[x]`; yang kurang: seed Step 01–05 (Step 04 ACTIVE + photo gate, Step 05 LOCKED) sebagai rows DB, bukan JSX.
- AC: seed idempotent via `db:setup`; dossier seal membaca steps dari DB; Step 04 menolak complete tanpa evidence (photo gate); Step 05 LOCKED sampai 04 DONE.
- Test: lock/unlock step + photo-gate menolak complete tanpa evidence + upload persisten.
- Verifikasi: CDP dossier WO-2026-0894 → checklist dari DB; coba complete Step 04 tanpa foto → error jujur.

## T3-2 — Slice 5: UI checklist dossier (seal + generic)

- AC: seksi checklist dossier seal ← DB; generic dossier dapat checklist kosong yang bisa diisi; `SignoffDialog` photo gate → upload nyata (buang label "simulated").
- Verifikasi: generic WO baru → tambah step → persist reload; sign-off tanpa foto → ditolak.

## T3-3 — Test Slice 6 (inspections & findings)

- AC: submit inspection menggerakkan progress nyata; konversi finding satu-kali (double-convert → 409); PIN override tercatat di audit.
- Verifikasi: runtime CDP run checklist → submit → progress berubah + reload tahan.

## T3-4 — Test Slice 7 (procurement)

- AC: approval chain + cap; GRN duplikat ditolak (idempotency); 3-way match mismatch → flag; stok bertambah saat receive (relasi ke PART-SEAL-8821 terukur).
- Verifikasi: PR → approve → GRN → stok 2→4 pola GAP-9 diulang hijau.

## T3-5 — Test Slice 8 (PM generator)

- AC: generator idempoten per periode (tidak dobel WO); pause menghentikan generasi; resume melanjutkan.
- Verifikasi: generate 2× dengan key sama → 1 WO; pause → generate → 0 WO baru.

## T3-6 — Test Slice 10 (pagination & filter)

- AC: paging konsisten (`limit`/`offset` stabil lintas request); filter tenant-scoped (decoy tenant tak bocor); filter tanggal/entityType audit bekerja.
- Verifikasi: curl page 1/2 disjoint + cross-tenant 404.

## T3-7 — A.14 Playwright E2E di CI (harness semua uji browser/CDP)

- AC: skenario login (devHint) → create SR → convert → WO hold → refresh assert persisten; smoke 5 critical screens; berjalan lokal via `npx playwright` DAN siap CI (workflow file siap, aktivasi ikut A.16).
- Verifikasi: run harness hijau 2× berturut (deteksi flake seperti probe-1212ms TASK-20).
- Output: harness ini dipakai semua verifikasi Tier 4–6 berikutnya.

---

## Verdict (dieksekusi 2026-09-17)

| Unit | Verdict | Bukti |
|---|---|---|
| T3-1 seed checklist canon | **PASS** | seed = 7 rows `wo_tasks` DB (bukan JSX); status DONE×4/05 IN_PROGRESS/06 PENDING/07 LOCKED; dossier SSR membaca DB (runtime HTML). TODO Slice-5 seed ✓ |
| T3-2 UI checklist dossier | **PASS** (implementasi nyata) | `addWoTask` service + POST action:add (201); WoChecklist "Add step" (termasuk empty-state); SignoffDialog photo gate = upload multipart NYATA (magic-byte/SHA-256 server) — label simulated dihapus; bug ditemukan+fix: upload ke WO hantu kini 404; test baru + runtime end-to-end (upload PNG → complete → DONE persist). TODO ✓ |
| T3-3 test Slice 6 | **PASS** (+fitur override nyata) | progress/convert-1x tests ada; PASS-OVERRIDE kini terkirim ke server + audit `INSPECTION_PASS_OVERRIDE` (tepat-1 row; tanpa verdict = tanpa row) — test baru; PIN 2468 sebelumnya sudah dimusnahkan (step-up TOTP) |
| T3-4 test Slice 7 | **PARTIAL** | approval chain/terminal-409/GRN-dup-409 (DUPLICATE_RECEIPT)/stok-loop tests GAP-9 ada; **3-way match engine masih demo statis** → dossier diberi label jujur (DEMO DOSSIER, placeholder audit ID dihapus) dan engine nyata dipromosikan → **T4-16** |
| T3-5 test Slice 8 | **PASS** | test baru: generate → idempoten replay (WO sama); PAUSED → 422 RULE_PAUSED; resume → WO baru (lanjut) |
| T3-6 test Slice 10 | **PASS** | test baru: page1/2 disjoint, window stabil identik antar-request, filter entityType/from/future, decoy tenant blind (tanpa login rate-limit — ctx manual) |
| T3-7 A.14 Playwright E2E | **PARTIAL (harness READY, eksekusi BLOCKED-BY-ENV)** | `e2e/playwright.config.ts` (webServer otomatis, workers=1, flake-deteksi 2× hijau) + `critical-journey.spec.ts` (login devHint → SR create 201 → convert → WO hold → reload assert ON_HOLD → double-convert 409) + `smoke.spec.ts` (5 layar) + `npm run test:e2e` + job CI `e2e` di ci/ci.yml (aktifasi ikut A.16). Eksekusi lokal: BLOCKED — CDN playwright.dev/azureedge/npmmirror tak terjangkau sandbox + tak ada chromium sistem (pola blocker font T5-5). npm test 173/173 |

**Promosi baru**: T4-16 (3-way match engine dari data GRN/live rows).
