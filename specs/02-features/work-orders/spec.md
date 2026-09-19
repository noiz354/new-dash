# Work Orders — Spec (Observed behavior)

> Pages (verified `find app -name page.tsx`):
> `app/(ops)/work-orders/page.tsx`, `[id]/page.tsx`, `new/page.tsx`,
> print `app/work-orders/[id]/print/page.tsx`.
> API (verified `route.ts`): `work-orders`, `[id]/tasks`, `[id]/evidence`
> (+`[evidenceId]`, +`upload`), `[id]/transitions`.
> TIDAK ADA: endpoint `sla`, `[id]/approve`/`[id]/convert` terpisah.
> Service: `lib/services/wo-service.ts`
> (KOREKSI: `lib/work-order-service.ts` TIDAK ADA).

## Perilaku aktual

- List + filter + detail + form new; ID monospace (WO-2026-0894/0895) + deep link (GAP-07).
- Lifecycle: draft→open→assigned→in_progress→on_hold→completed→closed
  (+cancelled); transisi tervalidasi di server via `[id]/transitions`.
- Tasks per WO + evidence upload per WO.
- Guard destruktif (close/cancel konfirmasi).
- Kanon: seal WO-2026-0894 @ AST-HVAC-004 Trane; belt WO-2026-0895 @ AST-AHU-012
  (REPORTED dari pass-1; pemetaan ke seed belum diulang sesi ini).

## Batasan terekam

- E2E smoke Chromium (sesi ini): halaman WO terakses; alur transisi penuh
  belum diuji browser. Detail: `specs/04-quality/test-evidence.md`.
- Klaim runtime TASK-23/Wave = REPORTED dari docs, bukan hasil sesi ini.
