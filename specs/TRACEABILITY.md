# Traceability Matrix (Requirement → Desain → Kode → Uji → Status)

> Bukti tier: 🟢 SOURCE-FOUND · 🟢 TESTED · 🟡 REPORTED · 🔴 BLOCKED (definisi: `04-quality/test-evidence.md`).
> "Desain" = folder Stitch aktual (revisi 2026-09-19) atau "—" bila tanpa mockup.

| Requirement (00-product) | Desain (Stitch) | Kode (route/API) | Uji | Status |
|---|---|---|---|---|
| WO lifecycle + state machine | work_order_management_execution_hub | `app/(ops)/work-orders`, `app/work-orders/[id]`, `app/api/work-orders` | unit 182/182 🟢 · smoke E2E 5/5 🟢 (2026-09-19) | IMPLEMENTED UNVERIFIED (journey E2E) |
| SR intake → triase → convert WO | service_requests_triage_hub | `app/(ops)/service-requests`, `app/api/service-requests` | unit 🟢 · journey 🔴 FAIL = drift test↔API `sr-service.ts:301` | IMPLEMENTED UNVERIFIED (E2E) |
| Temuan inspeksi → auto-WO | inspection_findings_auto_wo_conversion_desk | `app/api/findings`, `app/api/inspections` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Eksekusi inspeksi mobile (B) | mobile_field_inspection_execution_desk | `app/(field)/field` | — (tanpa uji khusus) | SOURCE-FOUND |
| Antrean inspeksi/audit | field_inspections_audit_queue_hub | `app/(ops)/field-inspections` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Inventory + FIFO + opname | inventory_spare_parts_management_ledger | `app/(ops)/inventory`, `app/api/parts` | unit 🟢 · smoke E2E 🟢 (2026-09-19) | IMPLEMENTED UNVERIFIED (journey E2E) |
| Purchasing + GRN + match | purchasing_pos_management_hub | `app/(ops)/purchasing`, `app/purchasing/[id]` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Vendor & kontraktor | vendors_contractors_management_hub | `app/(ops)/vendors` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| PM scheduling | preventive_maintenance_scheduling_automation_hub | `app/(ops)/preventive-maintenance` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Aset + ledger spare part | asset_registry… + asset_detail… | `app/(ops)/assets` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Fasilitas & lokasi | facility_locations… | `app/(ops)/facilities` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Organisasi/RBAC | organization_rbac_governance_hub | `app/(ops)/organization` | unit 🟢 · smoke E2E 🟢 (2026-09-19) | IMPLEMENTED UNVERIFIED (journey E2E) |
| Audit trail | audit_trail_system_logs_hub | `app/(ops)/audit-trail`, `audit-logs` | unit 🟢 | IMPLEMENTED UNVERIFIED |
| Notifikasi & SLA | notifications_sla_alerts_hub | `app/(ops)/notifications` (+ `app/api/push/subscribe` wired, G13) | unit 🟢 · smoke E2E 🟢 (2026-09-19) | IMPLEMENTED UNVERIFIED (journey E2E) |
| Laporan & analitik | reports_analytics_hub | `app/(ops)/reports` | 🟡 (scope uji belum dipetakan) | REPORTED |
| Settings | settings_system_configuration | `app/(ops)/settings` | 🟡 | REPORTED |
| Dashboard operasi | operations_dashboard | `app/(ops)` home (page TBD) | 🟡 | REPORTED |
| Auth login/signup | — (tanpa mockup) | `app/(auth)/login`, `signup` | journey: login lolos, FAIL di langkah convert (drift test↔API) | SOURCE-FOUND |
| Offline fallback + outbox (G12) | — (tanpa mockup) | `app/offline/page.tsx` ✅ ada (fallback + outbox nyata) | — (belum diuji) | SOURCE-FOUND |
| 24 missing pages (P0–P3) | — (backlog) | — (belum ada) | — | PLANNED (`03-design/page-layout-specs-index.md` → `05-roadmap/roadmap.md` § P0–P3) |
| 20 known gaps | — | per gap | kolom Uji per baris | peta G1–G20 ↔ baris: `04-quality/known-gaps.md` § Tautan traceability |

## Aturan naik status

REPORTED → IMPLEMENTED UNVERIFIED butuh SOURCE-FOUND (file diverifikasi ada).
IMPLEMENTED UNVERIFIED → VERIFIED COMPLETE butuh TESTED pada suite yang mencakup baris itu
(unit saja tidak cukup untuk alur lintas-halaman — butuh E2E).
