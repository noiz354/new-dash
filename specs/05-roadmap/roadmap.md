# Roadmap (Ringkas)

> Status jujur per tier docs/sdd. Detail: `roadmap-full.md`.

| Tier | Nama | Status |
|---|---|---|
| Tier 0 | Project Bootstrap | ✅ done |
| Tier 1 | Foundation (DB, auth, shell) | ✅ done |
| Tier 2 | Core Ops (WO, SR, inspection, inventory) | ✅ done |
| Tier 3 | Extended (vendors, PO/GRN, PM, reports) | ✅ done (dengan klaim parsial, lihat known-gaps) |
| Tier 4 | Field + Quality (14 tasks) | 🔶 4/14 — T4-11, T4-13, T4-14, T4-15, T4-16 done |
| Tier 5 | Hardening & Deploy | ❌ backlog |
| Tier 6 | Expansion | ❌ backlog |

## Urutan berikutnya (usulan)

1. **App-fix terpisah (bukan konsolidasi SDD):** drift test↔API
   `lib/services/sr-service.ts:301` (`{ sr, workOrder }` vs `convertedWoNumber`
   yang dibaca `critical-journey.spec.ts`) — putuskan kontrak, fix, re-run journey.
2. Selesaikan sisa Tier 4 (T4-17..T4-26) — verifikasi klaim T4-13..T4-16 yang masih 🔶.
3. Lengkapi verification.md per domain (bukti baris-per-baris).
4. Migration map 174 .md (CANONICAL/HISTORICAL/SUPERSEDED/DUPLICATE/REQUIRES REVIEW).
5. Tier 5 hardening (perf, a11y, E2E di CI).
6. Tier 6 expansion (approval flow, GRN approval, PM generate, reports builder).

## 24 missing-page specs → roadmap (P0–P3, dari `page-layout-specs-index.md`)

| Prioritas | Halaman (contoh) | Dependensi | Acceptance |
|---|---|---|---|
| P0 | rute kritis tanpa halaman (daftar per `page-layout-specs-index.md`) | Tier 4 selesai | `page.tsx` ada + smoke E2E render |
| P1 | halaman detail seed-only → data nyata (3 terkonfirmasi `EmptyState`: service-requests/[id], work-orders/[id], audit-trail/[id]) | API list/detail kanonik | tanpa `EmptyState` untuk data seed |
| P2 | rute tanpa mockup → desain via workflow Figma (`figma-workflow.md`) | skill/agen desain disetujui | mockup ↔ implementasi 1:1 |
| P3 | Polish + perluasan (reports builder, vendor perf, PM generate) | Tier 6 | acceptance per domain spec |
