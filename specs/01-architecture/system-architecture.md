# 01-Architecture — System Architecture (Observed)

> Sumber: rute `app/`, service `lib/services/`, skema `db/schema.ts`
> (keberadaan ADA, isi belum dibaca sesi ini), `docs/AUDIT_SAAS_E2E.md` (ADA).
> KOREKSI: `middleware.ts` TIDAK ADA; `lib/db/schema.ts` TIDAK ADA.

## Topologi aktual

- **Next.js 16 App Router**: grup rute `(ops)` desktop (41 pages) · `(field)`
  mobile · `(auth)` · `api/**` (61 `route.ts` — terhitung sesi ini) ·
  komponen `components/ui/*` (ADA).
  KOREKSI: grup `(print)` TIDAK ADA (print pages menempel di rute biasa:
  `app/work-orders/[id]/print`, `app/purchasing/[id]/print`).
- **Lapisan**: UI pages → service `lib/services/*-service.ts` (aturan transisi +
  guard) → Drizzle ORM → **PGlite** (Postgres 18 WASM file-lokal, repo).
- **Cross-cutting**: `lib/api/http.ts` (`withRoute`: Zod + error envelope +
  audit) + `lib/auth/*` (`session`, `password`, `totp`, `webauthn`, `rbac.ts`;
  RBAC 6 role = REPORTED dari docs) + `lib/services/audit-service.ts`
  (keberadaan ADA, wiring belum dibaca sesi ini).
  TIDAK ADA: `lib/api-helpers.ts`, `lib/auth.ts`, `lib/permissions.ts`,
  `lib/audit.ts`, `middleware.ts` (route guard + security headers =
  REPORTED-tanpa-lokasi — lokasi aktual middleware belum ditemukan).
- **Field sync**: page `app/(field)/field/sync/page.tsx` ADA; backing API
  (`sync-bundle`, `pending-ops`) TIDAK DITEMUKAN di `app/api/` (tidak ada
  direktori `field/`) — lihat G12 di `04-quality/known-gaps.md`.

## Keputusan arsitektur yang terekam (sebagian REPORTED dari docs)

1. DB repo-lokal (PGlite) agar demo deterministik tanpa Postgres eksternal.
2. State machine di service layer, bukan di UI (WO/SR/PO/GRN).
3. Guard destruktif + konfirmasi di server dan UI.
4. Zod schema per endpoint; error envelope konsisten.
5. Kanon data tunggal `lib/canon.ts` untuk semua angka demo.

## Yang belum diputuskan (→ roadmap)

Framework produksi final (default usulan Next.js + Tailwind + shadcn),
storage upload (lokal vs R2), CI/CD, retention/audit sunset.
