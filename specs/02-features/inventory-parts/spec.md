# Inventory & Parts — Spec (Observed behavior)

> Pages (verified): `app/(ops)/inventory/page.tsx`, `[sku]/page.tsx`.
> API (verified): `parts`, `parts/movements` (+ sub-route `movements` di bawah
> `parts`; direktori `movements` terpisah juga terlihat di tree API).
> Service: `lib/services/inventory-service.ts`
> (KOREKSI: `lib/inventory-service.ts` top-level TIDAK ADA).

## Perilaku aktual

- List parts + detail per SKU + pergerakan stok (movements).
- FIFO/adjust/opname = REPORTED dari pass-1 (belum dibaca ulang dari service
  sesi ini).
- Scope slice terverifikasi: `docs/PHASE1_SLICE3.md` L52 (link part↔asset/BOM,
  pergerakan stok, requisition dari WO).

## Batasan terekam

- `tasks.md` + `verification.md` domain ini = SUPERSEDED (verdict karantina
  P0 — menyebut GAP-11/P1S3 yang tidak relevan; dipertahankan historis,
  JANGAN dipakai sebagai acuan).
- E2E browser untuk domain ini belum dijalankan sesi ini.
