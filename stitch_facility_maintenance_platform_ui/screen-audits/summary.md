# Ringkasan Global Audit Visual

## Cakupan

- Total file PNG diaudit: 21
- Folder dengan `screen.png`: 19
- Folder dengan PNG non-`screen.png`: 2 (`asset_registry_lifecycle_management_ledger`, `asset_detail_spare_parts_inventory_ledger`)
- Screenshot Sistem A: 18 layar/artefak UI desktop
- Screenshot Sistem B: 1 layar mobile field
- Screenshot pendukung/non-layar: 2 (`apex_ops_logo`, avatar headshot)

## Temuan Lintas Layar

| Area | Temuan | Dampak | Rekomendasi |
|---|---|---|---|
| Shell desktop | Mayoritas layar Sistem A memakai sidebar gelap + topbar global, tetapi `purchasing` dan `vendors` memakai header berbeda dan mendapat overlay bottom nav mobile. | Konsistensi navigasi pecah dan konten tertutup. | Standarkan AppShell A; pisahkan shell field mobile dari desktop. |
| Active nav | `reports` dan `notifications` tampak menyorot `Audit Trail & Logs`. | User kehilangan orientasi lokasi. | Active route harus berbasis route aktual, bukan hardcoded. |
| Table density | Hampir semua hub memakai tabel padat dengan truncation. | Mobile/tablet berisiko tidak terbaca. | Sediakan DataTable desktop dan SummaryCardList mobile. |
| Status badge | Status emerald/amber/crimson/slate konsisten kuat. | Baik untuk scan cepat, tetapi beberapa chip kecil. | Standarkan StatusBadge dengan icon/text dan min width. |
| Destructive/critical actions | Convert, dismiss, decommission, revoke, deactivate, authorize PO, deploy rule perlu guard. | Risiko action kritikal tanpa konfirmasi. | Gunakan ConfirmDialog + reason/PIN bila perlu. |
| Mobile/Rugged | Sistem B kuat di mobile checklist, tetapi artefak bottom nav muncul di layar desktop purchasing/vendors. | Sistem desain tercampur. | FieldShell hanya untuk route `/field/*`. |
| Accessibility | Banyak teks monospace kecil, charts/blueprints butuh zoom/fallback. | Risiko gagal keterbacaan dan keyboard flow. | Uji 3 breakpoint, keyboard, focus ring, zoom untuk media. |
| Asset filenames | Dua asset screenshot tidak bernama `screen.png`. | Audit otomatis berbasis `screen.png` bisa melewatkan halaman. | Catat sebagai filename mismatch atau pulihkan nama bila diinginkan. |

## Komponen Reusable yang Harus Ada

| Komponen | Dipakai di layar | Catatan desain |
|---|---|---|
| AppShell / Sidebar / TopBar | Semua Sistem A | Sidebar 240-280px, rail collapse, active route valid. |
| FieldShell / BottomNav | Mobile field only | Jangan muncul di desktop purchasing/vendors. |
| KpiCard | Dashboard, PM, inventory, reports, alerts | Metric besar, secondary text kecil tapi terbaca. |
| DataTable | WO, SR, assets, inventory, purchasing, vendors, audit | Desktop table + mobile cards. |
| StatusBadge | Semua layar operasional | Semantic color + text/icon; ID tetap monospace. |
| DetailPanel / RightRail | SR, assets, vendors, audit, notifications | Collapse menjadi drawer di tablet/mobile. |
| ConfirmDialog | Critical actions | Support destructive, PIN, reason, and audit trail. |
| EvidenceViewer | WO, field, findings, asset docs | Photo zoom, metadata, download. |
| TelemetryCard | Dashboard, WO, PM, facilities, asset detail | Stable dimensions and live refresh state. |
| Empty/Loading/Error/Offline states | `ui_state_variants_patterns` | Jadikan component contract. |

## Prioritas Rebuild

1. Layar dengan risiko visual tertinggi: `purchasing_pos_management_hub`, `vendors_contractors_management_hub`, `mobile_field_inspection_execution_desk`, `work_order_management_execution_hub`, `asset_detail_spare_parts_inventory_ledger`.
2. Layar yang paling siap direbuild: `operations_dashboard`, `service_requests_triage_hub`, `facility_locations_spatial_hierarchy_management`, `settings_system_configuration`, `apex_ops_logo`.
3. Komponen yang harus dibuat sebelum layar lain: AppShell, FieldShell, KpiCard, DataTable, StatusBadge, ConfirmDialog, DetailPanel/Drawer, EvidenceViewer.
4. Inkonsistensi yang perlu diputuskan user: apakah dua filename asset dikembalikan ke `screen.png`; apakah bottom nav desktop di purchasing/vendors dianggap artefak dan harus dibuang; active nav reports/notifications harus dikoreksi saat rebuild.
