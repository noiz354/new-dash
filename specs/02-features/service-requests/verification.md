# Service Requests — Verification (Evidence)

> REVISI P2 (2026-09-19): ref truth-map fabrikan DIHAPUS (lihat WO verification).
> Status E2E diperbarui dari hasil eksekusi nyata.

- Runtime TASK-24 (Wave 4): REPORTED (`docs/runtime-verification-wave-3-4.md`
  ada; isi belum dibaca ulang).
- E2E `critical-journey.spec.ts` 2026-09-19 (Chrome nyata): login ✅ → SR
  create 201 ✅ → convert 200 ✅ → assertion `convertedWoNumber` FAIL.
  Root cause: `lib/services/sr-service.ts:301` me-return
  `{ sr: dto, workOrder: createdWo }`, test membaca `data.convertedWoNumber`
  → drift kontrak test↔API. Konversi atomik (SR CONVERTED + WO dibuat)
  SUKSES — yang gagal hanya assertion. Fix = commit app terpisah.
- Status: IMPLEMENTED UNVERIFIED.
