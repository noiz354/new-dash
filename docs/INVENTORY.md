# INVENTORY.md — Inventaris Layar Stitch

Hasil ekstraksi `stitch_facility_maintenance_platform_ui.zip`, diverifikasi 2026-09-13.
Setiap layar = satu folder berisi `code.html` (mockup statis) + `screen.png` (referensi visual).

## Layar Utama (20)

| # | Folder / Modul | `code.html` | Pasangan `screen.png` | Peran (dari nama) |
|---|---|---|---|---|
| 1 | `operations_dashboard` | 749 baris / 60K | ✅ | Dashboard operasi & facility control center |
| 2 | `work_order_management_execution_hub` | 651 baris / 56K | ✅ | Manajemen & eksekusi work order (inti CMMS) |
| 3 | `service_requests_triage_hub` | 650 baris / 56K | ✅ | Triase service request |
| 4 | `asset_registry_lifecycle_management_ledger` | 858 baris / 68K | ✅ | Registry & lifecycle aset |
| 5 | `asset_detail_spare_parts_inventory_ledger` | 985 baris / 72K | ✅ | Detail aset + ledger spare part |
| 6 | `preventive_maintenance_scheduling_automation_hub` | 957 baris / 68K | ✅ | Penjadwalan & otomasi preventive maintenance |
| 7 | `field_inspections_audit_queue_hub` | 653 baris / 56K | ✅ | Antrean inspeksi & audit lapangan |
| 8 | `inspection_findings_auto_wo_conversion_desk` | 543 baris / 48K | ✅ | Konversi temuan inspeksi → WO otomatis |
| 9 | `mobile_field_inspection_execution_desk` | 254 baris / 24K | ✅ | Eksekusi inspeksi mobile (sistem B / rugged) |
| 10 | `facility_locations_spatial_hierarchy_management` | 773 baris / 64K | ✅ | Hierarki lokasi & spasial fasilitas |
| 11 | `inventory_spare_parts_management_ledger` | 725 baris / 64K | ✅ | Manajemen inventaris & spare part |
| 12 | `purchasing_pos_management_hub` | 719 baris / 48K | ✅ | Purchasing & PO |
| 13 | `vendors_contractors_management_hub` | 727 baris / 48K | ✅ | Vendor & kontraktor |
| 14 | `organization_rbac_governance_hub` | 1052 baris / 88K | ✅ | Organisasi, RBAC, governance (terbesar) |
| 15 | `audit_trail_system_logs_hub` | 777 baris / 60K | ✅ | Audit trail & system log |
| 16 | `notifications_sla_alerts_hub` | 701 baris / 60K | ✅ | Notifikasi & alert SLA |
| 17 | `reports_analytics_hub` | 868 baris / 64K | ✅ | Laporan & analitik |
| 18 | `settings_system_configuration` | 920 baris / 68K | ✅ | Pengaturan & konfigurasi sistem |
| 19 | `ui_state_variants_patterns` | 451 baris / 44K | ✅ | Varian state & pola UI → jadikan komponen reusable |
| 20 | `apex_ops_logo` | 7 baris / 4K | ✅ | Logo → jadikan aset/SVG |

## Pendukung

| Folder | Isi | Keterangan |
|---|---|---|
| `apex_operational_facility_system` | `DESIGN.md` (267 baris) | Design system A — dispatch/desktop |
| `apex_ops_cmms` | `DESIGN.md` (204 baris) | Design system B — field/rugged |
| `professional_headshot_avatar_of_a_male_enterprise_operations_facility_director` | `screen.png` saja (1,4 MB) | Avatar placeholder direktur operasi |

## Catatan Teknik (seragam di semua `code.html`)

- HTML statis satu file, Tailwind via `https://cdn.tailwindcss.com` + `tailwind.config` inline.
- Font Google: Inter + JetBrains Mono (+ Space Grotesk di layar sistem B).
- Ikon: Material Symbols Outlined via Google Fonts.
- Tanpa JS framework / build step / routing.
