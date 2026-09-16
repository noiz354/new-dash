# GAP-10 Spec — PM Hub (F19) FRONTEND-ONLY → END-TO-END

## Temuan audit (F19)
- `components/pm/PmHub.tsx` (357 baris): SEED 5 plans, QUEUE 4 items, CATS/CAT_COUNT, WORKLOAD — zero fetch.
- `executeBatch` fabricates `WO-2026-0906+` via setTimeout; `createPlan` fabricates `PM-PLN-0113+` local.
- Copy fiktif: "Auto-Dispatch Engine ACTIVE · Eval 24m 15s · Modbus OK · PID 8841-pm", "Modbus SCADA Connection ACTIVE · Gateway 10.14.0.8:502 · 1,000ms poll · 99.98% zero packet drop", KPI 38/96.4%/19/03 (statis), "parts + shift leads notify logged" (no pager).
- Jujur parsial: toast batch "local simulation — nothing dispatched", sim panel "Nothing dispatched — dry run only", queue subtitle "notify logged (local) — no broker, no paging".
- Backend ADA tapi uncalled dari PmHub: GET/POST `/api/preventive-maintenance` (wo.read/wo.create), POST `/api/preventive-maintenance/[id]/generate` (idempoten), `togglePmRule` service (TANPA route).
- `pm-service.createPmRule:79` pakai `Math.random()` untuk ruleId — sumber Math.random lain yang harus dibasmi (lih. GAP-09 GRN).

## Scope
IN:
1. Backend: tambah `'PM'` ke SequenceEntity + seed; `createPmRule` pakai `nextNumber` → id kanon `PM-2026-NNNN` bila input.id absent (Math.random dihapus).
2. Backend: route toggle baru `POST /api/preventive-maintenance/[id]/toggle {status: ACTIVE|PAUSED}` (service sudah ada; perm wo.create).
3. Frontend PmHub → live-data: GET list + SEED fallback demo-badge; create dialog → POST; dispatch queue dibangun dari rules server (overdue/due≤14d) dengan tombol Generate per rule + batch Execute → POST generate + Idempotency-Key; toggle pause/resume; link WO hasil ke /work-orders/[n].
4. KPI cards dari rules server (Total rules, Active, Overdue, Due ≤14d) + label jujur; CAT_COUNT/filter lokal atas data server.
5. Copy telemetry jujur: trigger matrix + Modbus panel diberi label local-planning/demo (telemetry ingest backend-only F25; tak ada koneksi Modbus dari UI ini).
6. Test: create happy + nomor kanon + audit + tenant; generate happy + WO SCHEDULED + nextDueAt maju + audit PM_GENERATE_WO; replay idempoten (sama key → sama WO, tanpa duplikat); paused → 422 RULE_PAUSED; 404 rule; toggle ACTIVE→PAUSED→ACTIVE + audit.
OUT (eksplisit): scheduler otomatis/cron PM (no trigger infra — sama seperti retention F29); SCADA live polling; shift workload balancing backend; FindingDesk doSchedulePm (sudah live, untouched).

## Kontrak
- GET /api/preventive-maintenance → {data: PmRuleRow[]} (tetap).
- POST /api/preventive-maintenance {title, assetCode, intervalDays, priority?, nextDueDays?} → 201 PmRuleRow, id `PM-2026-NNNN` bila absent.
- POST /api/preventive-maintenance/[id]/generate (+ Idempotency-Key) → 201 {rule, wo}; replay → WO yang sama.
- POST /api/preventive-maintenance/[id]/toggle {status} → 200 PmRuleRow.
- UI offline: SEED demo + badge + aksi disabled.

## Verdict target
F19 → END-TO-END. Telemetry matrix + Modbus + workload → honest-local (bukan E2E, dilabeli).
