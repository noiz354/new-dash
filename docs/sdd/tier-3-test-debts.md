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
