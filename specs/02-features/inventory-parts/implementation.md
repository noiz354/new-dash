# Inventory & Parts — Implementation (Traceability)

> Peta file aktual terverifikasi sesi ini, bukan klaim.

- UI: `app/(ops)/inventory/page.tsx`, `[sku]/page.tsx`.
- API: `app/api/parts/route.ts`, `app/api/parts/movements/route.ts`
  (+ direktori `movements` terpisah di tree API — relasi pasti belum dipetakan).
- Aturan: `lib/services/inventory-service.ts` (isi belum dibaca sesi ini;
  FIFO/adjust/opname = REPORTED).
  TIDAK ADA: `lib/inventory-service.ts` top-level.
- Slice: `docs/PHASE1_SLICE3.md` (baris 52: scope inventory — link part↔asset/BOM, pergerakan stok, requisition dari WO).
  CATATAN: `docs/remediation-gap-11-spec.md` TIDAK relevan untuk domain ini (GAP-11 = force-dispatch/field-queue; lihat verdict karantina di `tasks.md`).
