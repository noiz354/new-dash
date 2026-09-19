# Screen Audits

> Ringkasan audit screenshot per layar. Sumber: `stitch_facility_maintenance_platform_ui/screen-audits/`
> (KOREKSI 2026-09-19: path lama `docs/screen-audits/` SALAH — direktori itu tidak ada).
> Status: 🔶 partial (temuan dicatat, belum semua diperbaiki di kode).

## Cakupan (terverifikasi 2026-09-19)

- 21 file PNG = 19× `screen.png` + 2× PNG bernama-folder
  (`asset_registry_lifecycle_management_ledger`, `asset_detail_spare_parts_inventory_ledger`).
- Komposisi (per `screen-audits/summary.md`): 18 artefak UI desktop Sistem A + 1 layar mobile field
  Sistem B (`mobile_field_inspection_execution_desk`) + 2 non-layar (`apex_ops_logo`, avatar headshot).
- Rekonsiliasi 20-vs-21: **20 folder punya `code.html`** (layar) + 1 folder avatar
  (`professional_headshot_avatar_of_a_male_enterprise_operations_facility_director`) punya
  `screen.png` TANPA `code.html` → selisih 1 = aset pendukung, bukan layar hilang. ✅ closed.
- Metode: bandingkan `code.html` vs PNG per folder modul.

## Temuan berulang

1. **Shell** — inkonsistensi header/sidebar antar layar Stitch; implementasi Next.js memakai satu `AppShell` konsisten (divergensi disengaja, dicatat).
2. **Active-nav** — state navigasi aktif tidak konsisten di mockup; diimplementasi via `isActive` helper (§1 shared-logic).
3. **Artefak bottom-nav** — sisa navigasi mobile di beberapa mockup desktop; tidak diimplementasikan (diabaikan dengan sadar).
4. **Destructive-guards** — mockup tidak punya konfirmasi hapus/batal; implementasi menambahkan dialog konfirmasi (divergensi disengaja).

## Detail per layar

Lihat file individual di `stitch_facility_maintenance_platform_ui/screen-audits/`
(21 PNG + catatan; KOREKSI P2: `docs/screen-audits/` TIDAK ADA). Audit adalah HISTORICAL evidence — jangan edit; temuan baru masuk ke specs ini atau PROGRESS.md.
