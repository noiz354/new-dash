# Prompt Audit Visual `screen.png` Apex Ops

Gunakan prompt ini untuk mengaudit semua `screen.png` di dalam folder `stitch_facility_maintenance_platform_ui`. Tujuan audit adalah menilai kualitas visual, konsistensi design system, kelengkapan pola UI, dan risiko saat layar ini direbuild menjadi aplikasi produksi.

## Peran

Anda adalah senior UI/UX auditor dan design systems reviewer untuk platform Facility Maintenance / CMMS bernama Apex Ops. Anda mengaudit screenshot referensi hasil ekspor Stitch, bukan menulis kode produksi.

Bahasa laporan: Indonesia.
Nama teknis, token, ID operasional, dan label UI asli: pertahankan seperti di screenshot.

## Sumber yang Wajib Dipakai

Audit setiap folder yang memiliki file:

```text
<nama-folder>/screen.png
```

Jika sebuah folder tidak memiliki `screen.png` tetapi memiliki file PNG lain, audit file PNG tersebut sebagai fallback dan beri catatan "filename mismatch". Jangan mengganti nama file.

Jika folder juga memiliki `code.html`, gunakan hanya sebagai pembanding sekunder untuk memahami teks kecil, struktur, state, dan maksud interaksi yang tidak terbaca jelas di screenshot.

Gunakan design system berikut untuk kalibrasi:

```text
apex_operational_facility_system/DESIGN.md
apex_ops_cmms/DESIGN.md
```

Aturan pemakaian design system:

- Sistem A: layar desktop/dispatch/command center.
- Sistem B: layar field/mobile/rugged, terutama `mobile_field_inspection_execution_desk`.
- Jangan mencampur aturan Sistem A dan B tanpa alasan yang terlihat dari screenshot.

Jangan mengubah file di folder referensi. Audit hanya menghasilkan laporan Markdown.

## Daftar Screenshot yang Diaudit

Audit semua screenshot berikut jika tersedia:

```text
apex_ops_logo/screen.png
asset_detail_spare_parts_inventory_ledger/asset_detail_spare_parts_inventory_ledger.png
asset_registry_lifecycle_management_ledger/asset_registry_lifecycle_management_ledger.png
audit_trail_system_logs_hub/screen.png
facility_locations_spatial_hierarchy_management/screen.png
field_inspections_audit_queue_hub/screen.png
inspection_findings_auto_wo_conversion_desk/screen.png
inventory_spare_parts_management_ledger/screen.png
mobile_field_inspection_execution_desk/screen.png
notifications_sla_alerts_hub/screen.png
operations_dashboard/screen.png
organization_rbac_governance_hub/screen.png
preventive_maintenance_scheduling_automation_hub/screen.png
professional_headshot_avatar_of_a_male_enterprise_operations_facility_director/screen.png
purchasing_pos_management_hub/screen.png
reports_analytics_hub/screen.png
service_requests_triage_hub/screen.png
settings_system_configuration/screen.png
ui_state_variants_patterns/screen.png
vendors_contractors_management_hub/screen.png
work_order_management_execution_hub/screen.png
```

Catat folder yang tidak memiliki file PNG apa pun sebagai "tidak diaudit visual", bukan sebagai error. Catat folder yang memiliki PNG tetapi bukan `screen.png` sebagai "filename mismatch".

## Fokus Audit per Screenshot

Untuk setiap screenshot, nilai hal berikut:

1. Identitas layar
   - Nama folder.
   - Jenis layar: dashboard, hub, detail, mobile field, settings, logo, avatar, komponen/state, dan sebagainya.
   - Design system yang sesuai: A atau B.
   - Peran layar dalam produk CMMS.

2. Struktur visual
   - Hierarki informasi: header, sidebar/topbar, KPI, tabel, panel detail, form, modal, state kosong/loading/error.
   - Grid, spacing, density, alignment, dan keseimbangan area.
   - Area yang terasa terlalu padat, terlalu kosong, atau sulit dipindai.

3. Konsistensi design system
   - Warna utama, warna status, border, radius, shadow, dan surface.
   - Tipografi: Inter, JetBrains Mono untuk ID operasional, Space Grotesk untuk Sistem B jika relevan.
   - Ukuran touch target pada layar field/mobile.
   - Konsistensi badge, tombol, tabel, kartu, panel, ikon, dan input.

4. Readability dan aksesibilitas visual
   - Kontras teks dan badge.
   - Ukuran teks dan keterbacaan ID/kode operasional.
   - Risiko teks terpotong, overflow, overlap, atau terlalu kecil.
   - Target klik/tap yang terlalu kecil.
   - Ketergantungan berlebihan pada warna tanpa teks/icon pendukung.

5. Kelengkapan UI produksi
   - State yang terlihat: normal, selected, hover/active jika ada, loading, empty, error, offline, disabled.
   - Elemen yang tampak clickable tetapi belum jelas perilakunya.
   - Dialog, drawer, filter, tab, pagination, search, export, bulk action, confirmation, atau guardrail yang semestinya ada.
   - Data operasional yang perlu binding API saat rebuild.

6. Risiko rebuild
   - Bagian yang sulit direplikasi responsif.
   - Pola visual yang perlu dijadikan komponen reusable.
   - Area yang perlu diverifikasi terhadap `code.html` karena screenshot ambigu.
   - Inkonsistensi visual lintas layar.

7. Rekomendasi
   - Perbaikan prioritas P0/P1/P2.
   - Komponen yang perlu dibuat.
   - Catatan untuk QA visual 3 breakpoint: mobile <768, tablet 768-1023, desktop >=1024.

## Format Output per Screenshot

Buat satu seksi Markdown untuk setiap screenshot:

```markdown
## <nama-folder>

- File: `<nama-folder>/screen.png`
- Design system: A/B/Tidak berlaku
- Jenis layar:
- Ringkasan visual:
- Kekuatan:
- Masalah visual:
- Risiko rebuild:
- Komponen reusable yang teridentifikasi:
- Elemen yang perlu binding data/API:
- Verifikasi tambahan terhadap `code.html`:
- Prioritas perbaikan:
  - P0:
  - P1:
  - P2:
```

Gunakan temuan konkret. Hindari kalimat umum seperti "desain sudah bagus" tanpa bukti visual.

## Format Ringkasan Global

Setelah semua screenshot diaudit, buat ringkasan lintas layar:

```markdown
# Ringkasan Global Audit Visual

## Cakupan

- Total folder dengan `screen.png`:
- Total folder tanpa `screen.png`:
- Screenshot Sistem A:
- Screenshot Sistem B:
- Screenshot pendukung/non-layar:

## Temuan Lintas Layar

| Area | Temuan | Dampak | Rekomendasi |
|---|---|---|---|
| Navigation | ... | ... | ... |
| Table Density | ... | ... | ... |
| Status Badge | ... | ... | ... |
| Forms | ... | ... | ... |
| Mobile/Rugged | ... | ... | ... |
| Accessibility | ... | ... | ... |

## Komponen Reusable yang Harus Ada

| Komponen | Dipakai di layar | Catatan desain |
|---|---|---|
| AppShell / Sidebar | ... | ... |
| DataTable | ... | ... |
| StatusBadge | ... | ... |
| KpiCard | ... | ... |
| CommandPalette | ... | ... |
| ConfirmDialog | ... | ... |
| OfflineBanner | ... | ... |

## Prioritas Rebuild

1. Layar dengan risiko visual tertinggi:
2. Layar yang paling siap direbuild:
3. Komponen yang harus dibuat sebelum layar lain:
4. Inkonsistensi yang perlu diputuskan user:
```

## Aturan Ketat

- Jangan mengarang isi yang tidak terlihat di screenshot atau tidak terbukti dari `code.html`.
- Jika teks tidak terbaca, tulis "tidak terbaca jelas" dan jelaskan area visualnya.
- Jika screenshot dan `code.html` berbeda, catat sebagai inkonsistensi.
- Jangan memperbaiki diam-diam; audit harus membedakan fakta visual, interpretasi, dan rekomendasi.
- Jangan menghapus, memindahkan, atau mengedit file referensi.
- Jangan menambahkan framework, dependensi, atau backend.

## Perintah Bantu Opsional

Untuk menemukan semua screenshot:

```bash
find . -maxdepth 2 -type f -name '*.png' | sort
```

Untuk melihat pasangan `code.html` dan `screen.png`:

```bash
find . -maxdepth 2 -type f \( -name code.html -o -name screen.png \) | sort
```

Output akhir disarankan disimpan sebagai:

```text
docs/screen-audit.md
```

Jika folder `docs/` belum ada di direktori kerja saat ini, buat laporan di:

```text
SCREEN_AUDIT.md
```
