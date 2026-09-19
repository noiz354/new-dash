# Purchasing & GRN — Spec (Observed behavior)

> Pages (verified): `app/(ops)/purchasing/page.tsx`, `[id]/page.tsx`,
> `invoices/[id]/page.tsx`; print `app/purchasing/[id]/print/page.tsx`.
> TIDAK ADA page: `/grn`, `/grn/[id]`.
> API (verified): `purchasing`, `[number]/decision`, `grn`, `invoices`.
> TIDAK ADA API: `purchase-orders*`, `receive*`, `grn/[id]`.
> Service: `lib/services/procurement-service.ts`
> (KOREKSI: `lib/procurement-service.ts` top-level TIDAK ADA).

## Perilaku aktual

- PO list + detail + decision (approve/guard role) → GRN receive
  (parsial/penuh — REPORTED) → stok bertambah otomatis (REPORTED).
- Status: draft→sent→approved→partial→received (REPORTED dari pass-1/docs).
- ID + deep link konsisten (GAP-07).

## Batasan terekam

- E2E browser untuk domain ini belum dijalankan sesi ini.
- Badge "mock" PO (G14) = REPORTED, belum diverifikasi ulang sesi ini.
