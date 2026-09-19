# Screen Inventory (20 Layar Stitch — REVISI TERVERIFIKASI 2026-09-19)

> Sumber: `docs/INVENTORY.md` (20 baris, nama folder hub/ledger/desk) divalidasi via
> `find … -name code.html` (20 hasil) di `stitch_facility_maintenance_platform_ui/`.
> KOREKSI: revisi ini menggantikan tabel sebelumnya yang memakai nama modul lama
> (`work_order_management`, `service_request_intake`, …) yang TIDAK ADA di repo.
> Kolom "Route" = `page.tsx` yang TERVERIFIKASI via `find app -name page.tsx`
> (52 file, 2026-09-19) — tidak ada lagi TBD di tabel ini.

| # | Folder Stitch (aktual) | Route Next.js (direktori terverifikasi) | Sistem |
|---|---|---|---|
| 1 | operations_dashboard | `app/(ops)/page.tsx` ✅ | A |
| 2 | work_order_management_execution_hub | `app/(ops)/work-orders` (+ `[id]`, + `new`) + print `app/work-orders/[id]/print` | A |
| 3 | service_requests_triage_hub | `app/(ops)/service-requests` (+ `[id]`) | A |
| 4 | asset_registry_lifecycle_management_ledger | `app/(ops)/assets` (+ `[id]`) | A |
| 5 | asset_detail_spare_parts_inventory_ledger | `app/(ops)/assets/[id]/page.tsx` ✅ (+ `bim`, + `documents/[docId]`) | A |
| 6 | preventive_maintenance_scheduling_automation_hub | `app/(ops)/preventive-maintenance` (+ `[id]`) | A |
| 7 | field_inspections_audit_queue_hub | `app/(ops)/field-inspections` (+ `new`) | A |
| 8 | inspection_findings_auto_wo_conversion_desk | `app/(ops)/field/findings/page.tsx` ✅ + `[id]` ✅ (+ `(field)/field/findings/new`) — via `app/api/findings` + konversi WO | A |
| 9 | mobile_field_inspection_execution_desk | `app/(field)/field` ✅ (+ `field/*` di bawah `(field)`) | **B** |
| 10 | facility_locations_spatial_hierarchy_management | `app/(ops)/facilities` (+ `[id]`) | A |
| 11 | inventory_spare_parts_management_ledger | `app/(ops)/inventory` (+ `[sku]`, + `app/api/parts`) | A |
| 12 | purchasing_pos_management_hub | `app/(ops)/purchasing` (+ `[id]`, + `invoices/[id]`) + print `app/purchasing/[id]/print` | A |
| 13 | vendors_contractors_management_hub | `app/(ops)/vendors` (+ `[id]`, + `contracts/[id]`) | A |
| 14 | organization_rbac_governance_hub | `app/(ops)/organization` (+ `users/[id]`) | A |
| 15 | audit_trail_system_logs_hub | `app/(ops)/audit-trail` (+ `[id]`, + `app/(ops)/audit-logs`) | A |
| 16 | notifications_sla_alerts_hub | `app/(ops)/notifications` | A |
| 17 | reports_analytics_hub | `app/(ops)/reports` (+ `[id]`) | A |
| 18 | settings_system_configuration | `app/(ops)/settings` (+ `jobs`) | A |
| 19 | ui_state_variants_patterns | `app/(ops)/ui-patterns` (pustaka komponen, bukan layar) | A |
| 20 | apex_ops_logo | aset/SVG (bukan layar) | — |

## Catatan verifikasi halaman (2026-09-19)

- Semua 20 baris di atas punya `page.tsx` terverifikasi — nol TBD tersisa.
- Nuansa: route-ada ≠ fully-functional. Sampel 8 halaman detail: 3 memakai
  `EmptyState` (`service-requests/[id]`, `work-orders/[id]`, `audit-trail/[id]`)
  untuk data non-kanonik (seed-only). Detail: baris matriks TRACEABILITY per fitur.
- 52 `page.tsx` total di `app/` — selisih vs 20 mockup = rute tanpa mockup:
  `(auth)/login+signup`, `(ops)/profile`, `(ops)/shifts/plan` (TANPA root
  `/shifts`), `(ops)/ui-patterns`, `(ops)/audit-logs`, `app/offline`,
  4 print pages. TIDAK ADA page: `permits` (hanya print), `badges` (hanya
  print), `/sessions`, `/mfa-setup`, `/locations`.

## Route terimplementasi TANPA mockup Stitch (tanpa referensi desain — backlog workflow Figma)

`app/(auth)/login`, `app/(auth)/signup`, `app/(ops)/profile`, `app/(ops)/shifts/plan`
(TANPA root `/shifts`), `app/(ops)/field`, print `app/badges/[id]/print` +
`app/permits/[id]/print` (TANPA page non-print), `app/offline`,
API: `billing`, `queue`, `retention`, `search`, `security`, `telemetry`, `push`.

## PNG ke-21 (bukan layar)

`professional_headshot_avatar_of_a_male_enterprise_operations_facility_director/screen.png` —
avatar placeholder, tanpa `code.html`. Lihat `screen-audits.md` (rekonsiliasi 20-vs-21 closed).
