# Service Requests — Verification (Evidence)

> REVISI P2 (2026-09-19): ref truth-map fabrikan DIHAPUS (lihat WO verification).
> Status E2E diperbarui dari hasil eksekusi nyata.

- Runtime TASK-24 (Wave 4): REPORTED (`docs/runtime-verification-wave-3-4.md`
  ada; isi belum dibaca ulang).
- E2E `critical-journey.spec.ts` 2026-09-19 (Chrome nyata, CDP 9227):
  - Run 1 (pra-fix): login ✅ → SR create 201 ✅ → convert 200 ✅ →
    assertion `convertedWoNumber` FAIL. Root cause: `sr-service.ts:301`
    me-return `{ sr, workOrder }` tanpa `convertedWoNumber` → drift kontrak.
  - Fix (commit app, 1 baris): body cabang convert ditambah `convertedWoNumber`
    (aditif; cabang triage/close + konsumen lama tak tersentuh).
  - Run 2 (pasca-fix): **1/1 PASS** (8,3 dtk) — login → SR create → convert →
    WO `WO-2026-0913` → hold → reload `ON_HOLD` ✅ → double-convert 409 ✅.
  - `npm test` 182/182 PASS + `tsc --noEmit` bersih pada commit yang sama.
- Status: VERIFIED COMPLETE (implementasi + uji terverifikasi).
