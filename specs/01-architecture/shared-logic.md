# 01-Architecture — Shared Logic (Observed)

> Sumber terverifikasi: `lib/api/http.ts`, `lib/auth/*`, `lib/canon.ts`,
> `lib/services/audit-service.ts` (keberadaan).
> TIDAK ADA: `lib/api-helpers.ts`, `lib/permissions.ts`, `lib/audit.ts`,
> `lib/validation/*`, `middleware.ts`. UNIT-08, TASK-20 = REPORTED dari docs.

## Pola bersama yang terbukti dipakai

1. **API envelope**: Zod validasi → 400 bernama; sukses/error konsisten via
   `lib/api/http.ts` (`withRoute`).
2. **RBAC**: 6 role (REPORTED), guard di server + UI; matrix di
   `lib/auth/rbac.ts` (KOREKSI: `lib/permissions.ts` TIDAK ADA).
3. **Audit**: mutasi penting menulis audit log (`lib/services/audit-service.ts`;
   KOREKSI: `lib/audit.ts` TIDAK ADA; GAP-06 = REPORTED).
4. **Kanon**: `lib/canon.ts` satu sumber angka demo (keberadaan ADA).
5. **ID display + deep link**: setiap list punya ID monospace + link detail
   (GAP-07).
6. **Upload**: endpoint file/foto konsisten (TASK-20 = REPORTED; backend lokal).
7. **Middleware**: guard rute + security headers = REPORTED-tanpa-lokasi
   (`middleware.ts` TIDAK ADA di root).

## Aturan untuk kode baru

Ikuti 7 pola di atas; penyimpangan dicatat di `06-history/decisions.md`.
Jangan tambah pola auth/validasi/audit paralel tanpa ADR.
