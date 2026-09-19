# 00-Product — Product Requirements (Observed, bukan dibuat-buat)

> Persyaratan yang **terbukti diimplementasikan** (bukan wishlist).
> Setiap butir → evidence file. Butir tanpa evidence → `05-roadmap/`.
> REVISI P2 (2026-09-19): path `lib/*.ts` dan rute yang dikutip sebelumnya
> DIVERIFIKASI ULANG — yang TIDAK ADA diperbaiki ke path aktual
> (`lib/services/*`, `lib/auth/*`, `[id]/transitions`).
> Ref `GAP-xx`/`P1Sx`/`TASK-xx` = klaim `docs/sdd` (REPORTED).

## Fungsional (terbukti ada)

1. **Auth sesi + MFA + RBAC**: login scrypt, sesi DB, TOTP RFC 6238, 6 role
   (super_admin..requester), guard server-side. Evidence: `lib/auth/` (session,
   password, totp, webauthn), `lib/services/auth-service.ts`,
   `lib/auth/rbac.ts` (KOREKSI: `lib/auth.ts`, `lib/mfa.ts`, `lib/permissions.ts`
   TIDAK ADA). UNIT-08, Tier-0 = REPORTED (docs).
2. **WO lifecycle penuh**: create → assign → start → hold → complete → close →
   cancel, SLA tracking, guard destruktif. Evidence: `lib/services/wo-service.ts`
   (KOREKSI: `lib/work-order-service.ts` TIDAK ADA),
   `app/api/work-orders/[id]/transitions/route.ts` (KOREKSI: bukan top-level
   `transitions/`; TANPA endpoint `sla`). GAP-08, runtime TASK-23 = REPORTED.
3. **SR intake → approve → convert→WO**: Evidence:
   `lib/services/sr-service.ts` (KOREKSI: `lib/service-request-service.ts`
   TIDAK ADA), `app/api/service-requests/[id]/transitions/route.ts`.
   GAP-09, runtime TASK-24 = REPORTED. E2E journey: convert 200 ✅, assertion
   FAIL = drift test↔API (`sr-service.ts:301`).
4. **Findings → WO + inspeksi** ("template-driven" = klaim docs, TANPA
   `inspection-templates` API): Evidence: `lib/services/inspection-service.ts`
   (KOREKSI: bukan `lib/inspection-service.ts`). GAP-10, P1S3 = REPORTED
   (string `P1S3` nol di `docs/`).
5. **Inventory FIFO + adjust** (subrute stock-take/cycle-count TAK
   TERVERIFIKASI): Evidence: `lib/services/inventory-service.ts`
   (KOREKSI: bukan `lib/inventory-service.ts`), API `parts`, `parts/movements`.
   GAP-11, P1S3 = REPORTED (GAP-11 = force-dispatch, bukan inventory).
6. **PO → decision → GRN receive → stock masuk** (TANPA halaman `/grn`):
   Evidence: `lib/services/procurement-service.ts`
   (KOREKSI: bukan `lib/procurement-service.ts`), API `purchasing`,
   `[number]/decision`, `/grn`, `/invoices`. GAP-12, P1S3 = REPORTED.
7. **Field offline-first** (halaman `(field)/field/sync` ADA; API
   `field/sync-bundle`/`pending-ops` TAK TERVERIFIKASI — TANPA `field/*` API):
   Evidence: halaman sync ✅. GAP-19, runtime TASK-26 = REPORTED
   (KOREKSI: `app/api/field/*` TIDAK ADA).
8. **Upload file/foto** (endpoint `[id]/evidence/upload` ADA): Evidence:
   TASK-20 = REPORTED (`docs/runtime-verification-task20.md` ada, isi belum
   dibaca ulang). Storage lokal; swap R2 = roadmap.

## Non-fungsional (terbukti ada)

1. **Validasi Zod di semua mutasi API** (400 konsisten). Evidence:
   `lib/api/http.ts` (`withRoute`; KOREKSI: `lib/api-helpers.ts` TIDAK ADA).
2. **Audit log konsisten** lintas mutasi — GAP-06, TASK-21 = REPORTED (klaim docs).
3. **DemoBanner jujur**: bagian belum nyata diberi label simulated/demo (REPORTED —
   belum dipetakan baris-per-baris sesi ini).
4. **Responsif 3 breakpoint** per layar rebuild; touch 48px di field (System B)
   (REPORTED — belum diukur sesi ini).
5. **ID operasional monospace** (JetBrains Mono): AST-*, WO#*, SKU, LOTO (REPORTED —
   pola terlihat di seed/canon, audit menyeluruh belum).

## Batasan terekam (bukan asumsi)

- E2E Playwright: smoke 5/5 PASS di Chrome nyata 2026-09-19 (config temp,
  dihapus); critical-journey FAIL 1 assertion = drift test↔API
  (`sr-service.ts:301`, fix = commit app terpisah). Detail: `test-evidence.md`.
- Upload memakai storage lokal (R2 = backlog).
- `.github/workflows` + aset woff2 menunggu keputusan maintainer.
- Retention sunset, transfer routes = keputusan produk terbuka (`05-roadmap/`).
