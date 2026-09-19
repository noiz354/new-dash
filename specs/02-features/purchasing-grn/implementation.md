# Purchasing & GRN — Implementation (Traceability)

> Peta file aktual terverifikasi sesi ini, bukan klaim.

- UI: `app/(ops)/purchasing/page.tsx`, `[id]/page.tsx`,
  `invoices/[id]/page.tsx`; print `app/purchasing/[id]/print/page.tsx`.
  TIDAK ADA page: `grn/*`.
- API: `app/api/purchasing/route.ts`, `[number]/decision/route.ts`,
  `grn/route.ts`, `invoices/route.ts`.
  TIDAK ADA: `purchase-orders/*`, `receive/*`, `grn/[id]`.
- Aturan: `lib/services/procurement-service.ts` (approve→receive→stock =
  REPORTED, isi belum dibaca sesi ini).
  TIDAK ADA: `lib/procurement-service.ts` top-level.
- Slice: `docs/PHASE1_SLICE3.md` (ADA). KOREKSI:
  `docs/PHASE1_SLICE3_FINDINGS_INV_PO.md` TIDAK ADA bentuk itu.
- Remediation: `docs/remediation-gap-12-spec.md` (ADA).
