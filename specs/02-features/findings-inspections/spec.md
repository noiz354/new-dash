# Findings & Inspections — Spec (Observed behavior)

> Pages (verified): ops `app/(ops)/field/findings/page.tsx`, `[id]/page.tsx`;
> `app/(ops)/field-inspections/page.tsx`, `new/page.tsx`, `[id]/page.tsx`;
> field `app/(field)/field/findings/new/page.tsx`.
> TIDAK ADA page: `/findings`, `/inspections`, `/templates`, `/schedule`,
> `/field/inspections*`, `/field/work/*`.
> API (verified): `findings`, `[id]/convert`, `[id]/dismiss`;
> `inspections`, `[id]/progress`, `[id]/force-dispatch`.
> TIDAK ADA API: `inspection-templates`, `insp-templates`.
> Service: `lib/services/inspection-service.ts`
> (KOREKSI: `lib/inspection-service.ts` top-level TIDAK ADA).

## Perilaku aktual

- Findings list + detail + dismiss + konversi ke WO (`[id]/convert` ADA).
- Inspeksi template-driven (pass/fail per item, System B di field),
  progress + force-dispatch tersimpan.
- Kanon: temuan kritis terikat asset kanon (`lib/canon.ts` ADA — keberadaan
  file verified, isi belum dibaca sesi ini).

## Batasan terekam

- Slice P1S3 + GAP-10 = REPORTED dari docs (file slice terverifikasi ADA:
  `docs/PHASE1_SLICE1.md`, `docs/PHASE1_SLICE3.md`; SLICE2 TIDAK ADA).
- E2E browser untuk domain ini belum dijalankan sesi ini.
