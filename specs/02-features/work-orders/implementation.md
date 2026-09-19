# Work Orders — Implementation (Traceability)

> Peta file aktual terverifikasi sesi ini (`find` + `ls`), bukan klaim.

- UI: `app/(ops)/work-orders/page.tsx`, `[id]/page.tsx`, `new/page.tsx`;
  print `app/work-orders/[id]/print/page.tsx`.
- API: `app/api/work-orders/route.ts`, `[id]/tasks/route.ts`,
  `[id]/evidence/route.ts`, `[id]/evidence/[evidenceId]/route.ts`,
  `[id]/evidence/upload/route.ts`, `[id]/transitions/route.ts`.
  CATATAN: tidak ada `[id]/route.ts` polos — detail diambil via list/tasks
  (mekanisme pasti belum dibaca; jangan diklaim).
- Aturan: `lib/services/wo-service.ts` (state machine + guard).
  TIDAK ADA: `lib/work-order-service.ts`, `lib/validation/*`, `lib/api-helpers.ts`.
- Validasi: Zod + envelope `lib/api/http.ts` (`withRoute`).
- DB: `db/schema.ts` (KOREKSI: `lib/db/schema.ts` TIDAK ADA; isi skema
  belum dibaca sesi ini).
- Slice: `docs/PHASE1_SLICE1.md` (ADA). KOREKSI: `docs/PHASE1_SLICE2_WO_SR.md`
  TIDAK ADA — jangan dikutip.
- Remediation: `docs/remediation-gap-08-spec.md` (ADA).
- SDD exec: `docs/sdd/tier-1-work-orders.md` TIDAK ADA (verified missing).
