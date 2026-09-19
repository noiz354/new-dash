# Service Requests — Implementation (Traceability)

> Peta file aktual terverifikasi sesi ini, bukan klaim.

- UI: `app/(ops)/service-requests/page.tsx`, `[id]/page.tsx`.
  TIDAK ADA: `app/(ops)/requests/*`, halaman `new` khusus SR.
- API: `app/api/service-requests/route.ts`, `[id]/transitions/route.ts`.
  TIDAK ADA: `requests*`, `[id]/approve`, `[id]/convert` terpisah.
- Aturan: `lib/services/sr-service.ts` (`convertToWorkOrder`,
  return `{sr, workOrder, convertedWoNumber}` sejak fix 2026-09-19 — SEBELUMNYA
  `{sr, workOrder}` tanpa `convertedWoNumber`; lihat `verification.md`).
  TIDAK ADA: `lib/service-request-service.ts`.
- Slice: SLICE2 TIDAK ADA — jangan dikutip untuk domain ini.
- Remediation: `docs/remediation-gap-09-spec.md` (ADA).
