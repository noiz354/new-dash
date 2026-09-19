# Findings & Inspections — Implementation (Traceability)

> Peta file aktual terverifikasi sesi ini, bukan klaim.

- UI ops: `app/(ops)/field/findings/page.tsx`, `[id]/page.tsx`;
  `app/(ops)/field-inspections/page.tsx`, `new/page.tsx`, `[id]/page.tsx`.
- UI field: `app/(field)/field/findings/new/page.tsx`
  (+`audits/`, `sync/` di bawah `(field)/field/`).
  TIDAK ADA: `app/(ops)/findings/*`, `inspections/*`, `app/(field)/field/inspections/*`,
  `app/field/*`.
- API: `app/api/findings/route.ts`, `[id]/convert/route.ts`,
  `[id]/dismiss/route.ts`; `app/api/inspections/route.ts`,
  `[id]/progress/route.ts`, `[id]/force-dispatch/route.ts`.
  TIDAK ADA: `inspection-templates/*`, `insp-templates/*`.
- Aturan: `lib/services/inspection-service.ts` (SOURCE-FOUND, lihat
  `verification.md`). TIDAK ADA: `lib/inspection-service.ts` top-level.
- Kanon: `lib/canon.ts` (keberadaan ADA, isi belum dibaca).
- Slice: `docs/PHASE1_SLICE3.md` (ADA). KOREKSI:
  `docs/PHASE1_SLICE3_FINDINGS_INV_PO.md` TIDAK ADA bentuk itu — nama
  aktualnya `PHASE1_SLICE3.md`; SLICE2 TIDAK ADA.
- Remediation: `docs/remediation-gap-10-spec.md` (ADA).
