# Service Requests — Spec (Observed behavior)

> Pages (verified): `app/(ops)/service-requests/page.tsx`, `[id]/page.tsx`.
> TIDAK ADA page: `/requests`, `/requests/new`, `/requests/[id]`.
> API (verified): `service-requests`, `[id]/transitions`.
> TIDAK ADA endpoint: `requests*`, `[id]/approve`, `[id]/convert` terpisah
> (approve/convert dilewatkan `[id]/transitions` — root cause drift test↔API,
> lihat `verification.md`).
> Service: `lib/services/sr-service.ts`
> (KOREKSI: `lib/service-request-service.ts` TIDAK ADA).

## Perilaku aktual

- List (12 SR, 4 pending — REPORTED dari pass-1/docs) → detail → transisi
  (approve/reject/convert menjadi WO, link WO hasil konversi).
- Guard persetujuan berbasis role; audit tercatat (GAP-06).

## Batasan terekam

- Critical-journey E2E (sesi ini): SR create ✅ + convert HTTP 200 ✅, TAPI
  test gagal membaca nomor WO hasil konversi (drift kontrak, bukan gagal
  konversi). Detail: `specs/04-quality/test-evidence.md`.
- Klaim runtime TASK-24/Wave 4 = REPORTED dari docs.
