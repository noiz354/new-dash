# Triase Batch 4 — ui-audit (~457 TODO)

> Sumber: `docs/ui-audit/` (40 file: 21 top-level + 19 `pass2/`). NOL checkbox —
> 458 sebutan TODO (404 baris unik, `/tmp/opencode/ui-audit-todos.txt`), mayoritas
> blok `// TODO:` usulan audit.
> Metode: spec-driven bulk per kelompok — tiap usulan dibuktikan vs (a) peta rute
> batch 1-2, (b) inventaris 61 op backend nyata (`/tmp/opencode/real-ops.txt`,
> 43 `route.ts`), (c) verdict batch 1-3. Tanpa bukti = PROMOTE/(U), bukan DONE.
> Konvensi penting: prefix `/api/v1/*` TAK ADA di kode (API nyata = `/api/*`
> tanpa v1) — triase per kapabilitas, bukan per path.
> Legenda: DONE = ada & bekerja · PROMOTE = backlog · (U) = sebagian/belum
> terverifikasi · USANG = ditolak/digantikan.

## A. Routing detail (~30 sebutan)

| Usulan (frekuensi) | Bukti | Verdict |
|---|---|---|
| Detail WO `/work-orders/[id]` (17) | rute ada (batch 1) | DONE |
| Detail purchasing `/purchasing/[id]` (6) | rute ada (batch 2) | DONE |
| Rute field findings/run (5) | `field/findings*` ada (batch 1) | DONE |
| Detail PM `/preventive-maintenance/[id]` | rute ada (terverifikasi) | DONE |
| Dossier `/reports/[id]` | rute ada (batch 3) | DONE |
| Detail SR `/service-requests/[id]` | rute ada (batch 1) | DONE |
| Detail transfer/adjustment `/inventory/transfers|adjustments/[id]` | rute TAK ADA (terverifikasi) | PROMOTE |
| Halaman/route `field/runs*` | rute TAK ADA (terverifikasi) | PROMOTE |

## B. Usulan `/api/v1/*` → kapabilitas backend (231 sebutan, ~30 endpoint distinct)

| Usulan (frekuensi) | Op nyata | Verdict |
|---|---|---|
| work-orders CRUD/transisi (20) | `wo.*` 8 op (evidence, tasks, transitions) | DONE |
| service-requests (16) | `sr.*` 3 op | DONE |
| audit-logs/events (5) | `audit.trail` + `verify_chain` (TASK-20) | DONE |
| notifications list/stream (6) | `notifications.*` (TASK-26) | DONE |
| inspections (7) | `inspections.*` 3 op | DONE |
| pm-plans/generate (9) | `pm.*` 3 op | DONE |
| purchase-requests list/create (11) | `po.list` + `po.create` (terverifikasi) | DONE-backend |
| goods-receipts (4) | `po.receive` POST idempoten update stok (terverifikasi) | DONE-backend |
| users org (11) | `org.users.*` 3 op, di-wire OrgHub | DONE |
| reports kpi/opex/cost (10) | `reports.aggregates` GET (terverifikasi) | DONE-backend, (U) wiring UI |
| inventory-summary/parts (4) | `inventory.*` 2 op + `/api/parts` | DONE-backend, (U) wiring UI |
| search (dietak) | `search.query` | DONE |
| queue/jobs | `queue.jobs` 2 op | DONE |
| telemetry | `telemetry.*` 5 op | DONE |
| auth/session/mfa | `auth.*` 13 op | DONE |
| purchase authorize flow (6) | TAK ADA op authorize (hanya `po.create` izin approve) | PROMOTE |
| locations/facilities (4) | TAK ADA backend | PROMOTE |
| assets registry/telemetri/bom (13) | TAK ADA backend aset | PROMOTE |
| vendors + msa + summary (18) | TAK ADA backend vendor | PROMOTE |
| settings/system (6) | TAK ADA backend | PROMOTE |
| live-queue/steps/time-entries (18) | TAK ADA backend | PROMOTE |
| dispatch-queue/batch (11) | TAK ADA backend | PROMOTE |
| notifications read-all/preferences (8) | TAK ADA (`notifications.list` hanya baca) | PROMOTE |
| webhook vendor (4) | `billing.webhook` = Stripe inbound SAJA | PROMOTE |
| wo-draft (4) | TAK ADA backend | PROMOTE |
| inventory/mutations (8) | `inventory.mutate` ADA tapi TAK ADA pemanggil UI | PROMOTE (wire-up) |
| findings CRUD (6+) | FABRIKASI (TASK-25 FAIL) — rujuk backlog TASK-25, tak diduplikasi | PROMOTE (ref) |
| audit-logs/verify-root (5) | endpoint SENGAJA DIHAPUS (fabrikasi); diganti `verify-chain` DONE | USANG |

## C. Anti-artifak (bottom-nav, Logo, secret-last4, kanonisasi)

Bulk-DONE dengan merujuk batch 1-3 (`Logo.tsx` ada, secret rotate selesai,
shell desktop + sidebar). Sisa inkonsistensi ID/telepon/tenant mengikuti
dependensi kanon batch 1-3 (tak diduplikasi di sini).

## D. Singleton aksi

| Item | Verdict |
|---|---|
| PIN supervisor nyata (kini hardcoded `2468`, batch 2) | PROMOTE |
| Tombol Retry outbox (ada di UI, TASK-25) | DONE |
| Auto-flush reconnect (listener ada, pemicu unproven) | (U) |
| Impersonate enforcement | (U) — rujuk batch 3 |

## Rekap

| Kelompok | DONE | PROMOTE | (U) | USANG |
|---|---|---|---|---|
| A. Routing (8 distinct) | 6 | 2 | 0 | 0 |
| B. Kapabilitas API (~30 distinct) | 16 | 12+1 ref | 2 | 1 |
| C. Anti-artifak | bulk-ref | 0 | 0 | 0 |
| D. Singleton (4) | 1 | 1 | 2 | 0 |
| **Total distinct** | **23+ref** | **15+1 ref** | **4** | **1** |

Cakupan sebutan: frekuensi eksplisit 259 (routing 28 + api/v1 231); ~199
sebutan sisa = pola UI/copy/state yang dirujuk ke verdict batch 1-3.
Dependensi kanon mengikuti batch 1-3 (tak diputus, tak diduplikasi).
