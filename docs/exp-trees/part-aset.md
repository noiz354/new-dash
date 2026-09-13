# Pohon Interaksi — Part Aset & Resource (Batch A)

Cakupan: 6 layar saja — asset_registry_lifecycle_management_ledger, asset_detail_spare_parts_inventory_ledger, facility_locations_spatial_hierarchy_management, inventory_spare_parts_management_ledger, purchasing_pos_management_hub, vendors_contractors_management_hub. Semua desktop = sistem A (Apex Operational Facility System). Dokumen ini Markdown murni tanpa kode.

Sumber: docs/exp-check/part-aset.md (check), docs/ui-audit/ui-state-patterns.md (pola), audit per layar + pass2 (audit), code.html tiap folder (fakta mockup).

Legenda vocabulary terminal L5 (hanya ini yang boleh tanpa tag): TableSkeleton + polling + STALE (§03), FormField guard + submit disabled + sukses hijau (§02), ErrorToast + Trace + Retry/Copy Log (2B), OfflineBanner + Force Ping + antrean (2A), EmptyState + CTA (§01), hover-reveal aksi baris + focus ring (§03), status tombol Posting/Transmitting + toast + status terupdate (template L5 + §03/2B).

Legenda tag: [POLA-BARU] = pola belum ada di ui-state-patterns. [ASUMSI] = tanpa sumber, diputuskan saat rebuild. CANON = konflik antar-layar (OEM Trane vs Daikin, skor 68 vs 88 vs 88,4, WO seal WO-2026-0894 vs WO-2025-0812/WO-2025-0044, harga PART-SEAL-8821 $1.450 vs $1.420, SKU PART-BRG-6205 vs PART-BRG-6204, sisa MSA 312d vs 288d, bin CRIB-B vs SUB-LCK-4B, CHILL-NUSA-04 vs AST-HVAC-004, label WO-0894 vs WO-2026-0894) diperlakukan sebagai dependensi, bukan keputusan.

Larangan artefak: bottom-nav field, header mobile field, font Space Grotesk, dan judul Run Checklist pada purchasing/vendors adalah ARTEFAK copy-paste Stitch — dilarang dijadikan pohon.

## 1. Asset Registry — Enterprise Asset Ledger

Konteks: 1.842 unit, drawer AST-HVAC-004 (DEFECT FLAGGED, 68 NEEDS OVERHAUL, Trane EarthWise CVHE — CANON vs Daikin di detail), aksi Create WO / Schedule PM / Transfer Loc / Decommission, search terisi statis AST-HVAC-004, footer Page 1 of 308 vs Rows 25.

### Asset Registry: registrasi aset baru
* L0: Klik + Register New Asset di title bar (check Registry §1 Register P2; audit §2 MISSING)
  * L1: Modal registrasi aset, target POST /api/v1/assets (check Registry §2 Modal Register P2; pass2 §3.4)
    * L2: Isi nama, kategori, OEM, serial, lokasi, kritikalitas lalu submit
      * L3: Field wajib kosong atau serial duplikat → pesan inline per field + submit disabled beralasan
      * L4: Lengkapi field dan perbaiki serial, submit ulang
        * L5: status tombol → toast → baris aset baru muncul di tabel
      * L3: Server menolak 500 → ErrorToast + Trace + Retry, modal tetap terbuka
      * L4: Klik Retry atau salin log via Copy Log
        * L5: ErrorToast + Trace + Retry

### Asset Registry: buka drawer profil aset
* L0: Klik baris tabel atau chevron (check Registry §3 drawer TERDEFINISI; audit §2)
  * L1: Drawer profil AST-HVAC-004 inline, produksi /assets/[id] (audit EXISTS; pass2 §3 drawer ADA)
    * L2: Pilih baris AST-HVAC-004
      * L3: Telemetri SCADA basi → strip merah Telemetry Degraded + penanda STALE pada baris
      * L4: Tunggu polling atau klik ulang baris
        * L5: polling + STALE → badge Online kembali
      * L3: Drawer gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: TableSkeleton → drawer terisi, atau ErrorToast menetap

### Asset Registry: cari, filter, tab kategori, pagination
* L0: Ketik search atau ganti filter lokasi, health, tab kategori, Rows, halaman (check Registry §2 Search P3 dan Sinkronisasi P3; audit §2 query params TERDEFINISI)
  * L1: Direktori terfilter via query params (?q=, ?locationId=, ?health=, ?category=, ?page=) (check Registry §2; pass2 temuan value statis)
    * L2: Ketik AST-HVAC-004, pilih tab HVAC & Chillers (284), pindah halaman
      * L3: Tanpa hasil → EmptyState + tombol Reset Filter
      * L4: Klik Reset Filter atau ubah kata kunci
        * L5: TableSkeleton → tabel terisi kembali
      * L3: Meta halaman tak konsisten (Page 1 of 308 vs Rows 25, 6 baris tampil) → kalibrasi dari meta API; bila meta gagal → ErrorToast + Retry
      * L4: Muat ulang filter
        * L5: ErrorToast + Trace + Retry

### Asset Registry: pindah lokasi aset
* L0: Klik Transfer Loc di drawer (check Registry §1 Transfer P2; audit §2 MISSING)
  * L1: Modal transfer + alasan + audit trail, target POST transfer (check Registry §2 Modal Transfer P2)
    * L2: Pilih lokasi tujuan dan isi alasan lalu submit
      * L3: Tujuan kosong, sama dengan asal, atau alasan kosong → pesan inline + submit disabled
      * L4: Pilih tujuan valid dan lengkapi alasan, submit ulang
        * L5: status tombol → toast → lokasi terupdate + entri audit trail
      * L3: Lokasi tujuan dikunci atau penuh [ASUMSI] → pesan inline + tawarkan pilih ulang
      * L4: Ganti tujuan lalu submit
        * L5: status tombol → toast → lokasi terupdate

### Asset Registry: nonaktifkan aset destruktif
* L0: Klik Decommission sekali klik destruktif (check Registry §1 Decommission P1; pass2 §3.3)
  * L1: Dialog konfirmasi ketik + alasan wajib + toast hasil + rollback (check Registry §2 Konfirmasi P1; pola §02 + 2B)
    * L2: Ketik teks konfirmasi dan isi alasan lalu submit
      * L3: Teks salah atau alasan kosong → submit disabled + pesan inline
      * L4: Ketik ulang dan lengkapi alasan, submit
        * L5: status tombol → toast → status DECOMMISSIONED + aksi Undo rollback
      * L3: Server gagal saat menonaktifkan → ErrorToast + Trace, status tidak berubah
      * L4: Klik Retry atau Batalkan
        * L5: ErrorToast + Trace + Retry

### Asset Registry: buat work order dari aset
* L0: Klik Create WO di drawer (check Registry §1 Prefill WO P2; readiness M5+H1)
  * L1: Form /work-orders/new?asset=AST-HVAC-004 terisi otomatis (dependensi CANON: WO seal tunggal belum diputus)
    * L2: Tinjau prefill lalu submit WO
      * L3: Aset DECOMMISSIONED atau prefill basi → pesan inline + submit diblokir
      * L4: Pilih aset aktif atau muat ulang prefill
        * L5: FormField sukses hijau + lock → status tombol → toast → WO terbuat
      * L3: Submit gagal 500 → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: jadwalkan preventive maintenance
* L0: Klik Schedule PM di drawer (check Registry §1 Prefill PM P2; readiness M5)
  * L1: Form /preventive-maintenance/new?asset=AST-HVAC-004 terisi otomatis
    * L2: Pilih tanggal dan template lalu submit
      * L3: Tanggal lampau atau template kosong → pesan inline + submit disabled
      * L4: Perbaiki tanggal dan template, submit ulang
        * L5: FormField → status tombol → toast → jadwal PM terbuat
      * L3: Submit gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: export direktori async
* L0: Klik Export CSV/XLS (check Registry §2 Export P2; pola §03 + 2B)
  * L1: Job export async lalu unduh berkas (jobId + downloadUrl)
    * L2: Pilih format lalu jalankan export 1.842 baris
      * L3: Job antre atau berjalan lama → status job via polling; tautan unduh kedaluwarsa → pesan + minta ulang [ASUMSI polling job]
      * L4: Tunggu selesai atau jalankan ulang job
        * L5: polling + STALE → toast → berkas terunduh
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: buka model BIM 3D
* L0: Klik Open BIM 3D Model (check Registry §1 BIM P2; readiness M6)
  * L1: BIM viewer, tab vs route belum diputus (audit §3.2)
    * L2: Buka model aset terpilih
      * L3: Model tak cocok atau gagal dimuat → pesan + Retry, plus tautan Recalibrate bila MODEL MISMATCH [ASUMSI ikut facilities]
      * L4: Klik Retry atau pilih revisi model
        * L5: TableSkeleton → model tampil, atau ErrorToast menetap
      * L3: Tanpa aset terpilih → EmptyState + CTA pilih aset
      * L4: Pilih baris aset
        * L5: EmptyState → drawer terisi

### Asset Registry: lihat dan unggah dokumen teknis
* L0: Klik Preview, Download, atau Upload dokumen (check Registry §1 Dokumen P3; audit §3.4)
  * L1: Viewer + uploader (manual OEM Trane CVHE 18,4 MB, P&ID RevC, SOP LOTO; dependensi CANON OEM Trane vs Daikin)
    * L2: Pratinjau, unduh, atau unggah berkas
      * L3: Berkas melebihi batas atau format ditolak → pesan inline per baris + retry
      * L4: Pilih berkas valid lalu unggah ulang
        * L5: status tombol → toast → daftar dokumen terupdate
      * L3: Unduhan gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Registry: cetak label QR
* L0: Klik Batch QR Print atau print tag QR #004 (check Registry §1 Print P3; readiness L3)
  * L1: Pratinjau cetak massal atau satuan
    * L2: Pilih aset lalu cetak
      * L3: Tanpa seleksi → EmptyState + CTA pilih aset
      * L4: Centang baris lalu cetak
        * L5: pratinjau cetak tampil → status tercetak [POLA-BARU: pratinjau cetak]
      * L3: Pratinjau gagal dirender → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 2. Asset Detail & Spare Parts Ledger

Konteks: AST-HVAC-004 versi Daikin (CANON vs Trane registry), dial 88% OPTIMAL Grade A- (CANON vs 68 dan 88,4), BOM 18 SKU, PART-SEAL-8821 DEFICIT par 4 net 0, PART-LUB-09 BELOW PAR, ledger 421 transaksi hash SHA-256 9e08fc, sub-tab IoT/PM/Docs tanpa isi, 3 gauge sampling 1 detik.

### Asset Detail: buka work order dari ledger
* L0: Klik #WO-2025-0812 di ledger pada 2 titik (check Detail §1 WO P1; readiness H1)
  * L1: Detail /work-orders/[id] (audit §3.1; dependensi CANON WO-2025-0812/WO-2025-0044 vs WO-2026-0894)
    * L2: Buka tautan sumber TXN-2025-88419 atau 88390
      * L3: ID tak dikenal atau arsip → EmptyState + CTA kembali ke ledger
      * L4: Kembali atau cari WO pengganti sesuai canon
        * L5: EmptyState → ledger tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: buka PO dan verifikasi 3-Way Match
* L0: Klik #PO-2025-0081 (check Detail §1 PO P2; readiness H3)
  * L1: Detail /purchasing/[id] + tab receiving/match + riwayat signature (edge 3-Way Match: PO vs GRN vs invoice)
    * L2: Buka tab 3-Way Match
      * L3: Kaki dokumen belum lengkap → status PARTIAL + pesan inline; selisih angka → MISMATCH + wajib Flag Discrepancy
      * L4: Lengkapi dokumen atau tandai selisih lalu cocokkan ulang
        * L5: status tombol → toast → status MATCHED
      * L3: Perhitungan match gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: buka dokumen transfer dan adjustment
* L0: Klik #TO-8891 (Sat-B) atau #ADJ-2024-Q4 (check Detail §1 transfer/adjustment P2; audit §3.3)
  * L1: Detail /inventory/transfers/[id] atau /inventory/adjustments/[id]
    * L2: Buka tautan sumber TXN-2025-86102 atau 84902
      * L3: Dokumen tak ditemukan → EmptyState + CTA kembali ke ledger
      * L4: Kembali ke ledger
        * L5: EmptyState → ledger tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: guardrail issue saat SKU defisit
* L0: Klik Issue to WO pada PART-SEAL-8821 par 4 net 0 (check Detail §2 Guardrail P1; dependensi CANON saldo seal dan harga $1.450 vs $1.420)
  * L1: Modal issue ke WO, target POST issue (audit §5)
    * L2: Isi qty dan WO tujuan lalu submit
      * L3: Stok net 0 atau qty melebihi available → blokir + peringatan + tawarkan + PR Request
      * L4: Kurangi qty atau buat PR Request lalu submit ulang
        * L5: status tombol → toast → saldo terupdate
      * L3: WO tujuan kosong atau tak valid → pesan inline + submit disabled
      * L4: Pilih WO valid lalu submit
        * L5: status tombol → toast → mutasi tercatat

### Asset Detail: replenishment dari baris BOM
* L0: Klik + PR Request pada PART-SEAL-8821 atau + Quick PO pada PART-LUB-09 (check Detail §2 PR/PO P2)
  * L1: Flow PR prefill SKU, qty, aset + approval, target POST purchase-requests (audit §5)
    * L2: Tinjau prefill lalu kirim PR atau PO cepat
      * L3: Qty kosong atau vendor belum dipilih [ASUMSI] → pesan inline + submit disabled
      * L4: Lengkapi lalu kirim ulang
        * L5: status tombol → toast → PR atau PO terbuat
      * L3: Gagal kirim → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: tambah SKU ke BOM
* L0: Klik + Add SKU to BOM (check Detail §2 Modal Add SKU P2; audit §3.5)
  * L1: Modal tambah SKU, target POST /api/v1/assets/:id/bom
    * L2: Isi SKU, par, bin lalu submit
      * L3: SKU duplikat, par kosong, atau bin tak dikenal → pesan inline + submit disabled
      * L4: Perbaiki lalu submit
        * L5: status tombol → toast → BOM terupdate
      * L3: SKU tak ada di master → EmptyState hasil + CTA ajukan SKU baru [ASUMSI]
      * L4: Ubah kata kunci atau ajukan SKU
        * L5: EmptyState + CTA

### Asset Detail: quick dispatch WO
* L0: Klik Quick Dispatch WO di toolbar (check Detail §1 Prefill Dispatch M5)
  * L1: Modal atau prefill /work-orders/new?asset=AST-HVAC-004 (audit §3.6)
    * L2: Tinjau prefill lalu submit WO
      * L3: Prioritas kosong atau ringkasan kosong → pesan inline + submit disabled
      * L4: Lengkapi lalu submit ulang
        * L5: FormField → status tombol → toast → WO terbuat
      * L3: Submit gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Asset Detail: catat inspeksi aset
* L0: Klik Log Inspection di toolbar (check Detail §1 Prefill Inspection M5)
  * L1: Form /field-inspections/new?asset=AST-HVAC-004 terisi otomatis
    * L2: Pilih template dan hasil lalu submit
      * L3: Template kosong → pesan inline + submit disabled
      * L4: Pilih template lalu submit ulang
        * L5: FormField → status tombol → toast → inspeksi tercatat
      * L3: Luring saat submit → OfflineBanner + Force Ping + draf antre
      * L4: Online kembali lalu kirim antrean
        * L5: OfflineBanner → toast → inspeksi tercatat

### Asset Detail: jelajah sub-tab dan filter timeline
* L0: Ganti sub-tab IoT Diagnostics, PM Schedules (12), Compliance & Docs (check Detail §1 sub-tab P2; audit §3.4)
  * L1: Konten ?tab=iot, ?tab=pm, ?tab=docs (tab vs route diputus saat rebuild; pass2 usul query)
    * L2: Buka tab dan ganti pill filter timeline All 54, WO 14, Inspections 28, Parts 8, Calibration 4
      * L3: Tab atau filter tanpa data → EmptyState + CTA terkait
      * L4: Kembali ke tab 360° atau tambah data
        * L5: EmptyState → konten tampil
      * L3: Telemetri basi → gauge STALE + badge CONNECTING pada sampling 1 detik
      * L4: Tunggu reconnect
        * L5: polling + STALE → gauge segar

### Asset Detail: ganti scope gudang
* L0: Ganti scope Central Distribution Hub vs Satellite Bin (check Detail §2 scope P3; dependensi CANON selisih saldo antar-scope)
  * L1: BOM ter-refresh per gudang + banner fallback (audit §1 State UI)
    * L2: Ganti scope gudang
      * L3: Scope gagal dimuat → fallback hub primer + banner
      * L4: Coba ulang scope
        * L5: ErrorToast + Retry → BOM scope tampil
      * L3: Saldo beda antar-scope (canon PART-LUB-09, PART-FLTR-401) → tampil apa adanya per warehouseId tanpa dirata-rata
      * L4: Lanjut dengan scope terpilih
        * L5: TableSkeleton → BOM per-scope tampil

### Asset Detail: unduh dossier dan salin tag
* L0: Klik Dossier, Load Full Historical Ledger, atau tombol copy tag (check Detail §1 Dossier+Export P3; §2 copy P3)
  * L1: Unduhan dossier PDF + export CSV atau stream 421 transaksi + hash SHA-256 (audit §5; code.html clipboard)
    * L2: Unduh dossier, stream ledger, atau salin AST-HVAC-004
      * L3: Clipboard ditolak → fallback prompt manual + toast
      * L4: Salin manual lalu tutup
        * L5: ErrorToast → toast → tag tersalin
      * L3: Export besar gagal di tengah → ErrorToast + tawaran lanjutkan atau retry [ASUMSI kelanjutan stream]
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 3. Facility Locations & Spatial Hierarchy

Konteks: satu-satunya interaksi nyata hx-get ke LOC-B2-MECH-204, Quick Selector kaskade 4 tingkat, denah CAD + simbol CHILLER #04 glow merah, WO-2026-0894 SLA Breach 42m, hasil TMPL-HVAC-CHL-02 3/4 passed, konflik label 8 AST vs 4 Linked vs Showing 4 of 8. Sistem A.

### Facilities: navigasi tree spasial
* L0: Klik node tree kampus, gedung, lantai, ruangan (check Facilities §3 tree TERDEFINISI; hx-get nyata)
  * L1: Detail ruangan ?locationId=LOC-B2-MECH-204 via JSON, pengganti fragment HTMX (check Facilities §1 Kontrak JSON P2; readiness G6)
    * L2: Pilih node #B-204, #B-201, atau #B-208
      * L3: Fetch gagal → pesan + Retry di container detail lokasi
      * L4: Klik Retry
        * L5: denah shimmer + TableSkeleton → detail tampil, atau ErrorToast menetap
      * L3: Ruangan tanpa aset → tabel kosong + CTA transfer masuk
      * L4: Transfer aset masuk atau pilih node lain
        * L5: EmptyState + CTA

### Facilities: quick selector kaskade
* L0: Klik Quick Selector (check Facilities §2 Selector P2; code.html toggle hidden; pola §02)
  * L1: Modal kaskade Campus-Building-Floor-Room + preview + Apply Filter Across Dashboard
    * L2: Pilih 4 tingkat lalu Apply
      * L3: Opsi anak gagal dimuat → select disabled + pesan inline; preview kosong → pesan
      * L4: Pilih ulang tingkat atas lalu Apply
        * L5: FormField guard → status tombol → toast → scope global terpasang
      * L3: Apply tanpa room terpilih → pesan inline + Apply disabled
      * L4: Pilih room lalu Apply
        * L5: FormField guard → status tombol → toast → scope global terpasang

### Facilities: dispatch audit ruangan
* L0: Klik Dispatch Room Audit (check Facilities §1 Prefill Audit P2; readiness M5)
  * L1: Prefill /field-inspections/new?locationId=LOC-B2-MECH-204
    * L2: Tinjau prefill lokasi lalu submit audit
      * L3: Template audit kosong → pesan inline + submit disabled
      * L4: Pilih template TMPL-HVAC-CHL-02 lalu submit ulang
        * L5: FormField → status tombol → toast → audit terbuat
      * L3: Submit gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: catat defect ruangan
* L0: Klik + Log Defect (check Facilities §1 Prefill Defect P2; readiness M5)
  * L1: Modal atau prefill /field-inspections/new?locationId=LOC-B2-MECH-204
    * L2: Isi aset, ringkasan defect, foto lalu submit
      * L3: Ringkasan kosong atau aset tak dipilih → pesan inline + submit disabled
      * L4: Lengkapi lalu submit ulang
        * L5: FormField → status tombol → toast → defect tercatat
      * L3: Unggah foto gagal → pesan inline + retry per berkas
      * L4: Pilih ulang berkas lalu unggah
        * L5: status tombol → toast → defect tercatat

### Facilities: buka work order ruangan
* L0: Klik kartu WO-2026-0894 P1 atau WO-2026-0881 P3 (check Facilities §1 WO P1; readiness H1)
  * L1: Detail /work-orders/[id] (dependensi CANON label WO-0894 di denah vs WO-2026-0894)
    * L2: Buka kartu SLA Breach 42m atau due besok 18:00
      * L3: Countdown kedaluwarsa saat dibuka → badge SLA BREACH + eskalasi [POLA-BARU: countdown SLA]
      * L4: Lanjut ke detail untuk percepat penanganan
        * L5: badge SLA BREACH tampil + countdown berhenti [POLA-BARU: countdown SLA]
      * L3: Detail gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: lihat hasil audit ruangan
* L0: Klik hasil TMPL-HVAC-CHL-02 3/4 passed + 1 defect (check Facilities §1 Hasil Audit P2)
  * L1: Detail /field-inspections/[id] atau drawer hasil
    * L2: Buka hasil audit
      * L3: Hasil belum final atau defect belum ditindaklanjuti → pesan + CTA buat defect
      * L4: Buat defect dari temuan
        * L5: EmptyState → defect tercatat
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: pindah aset antar-ruangan
* L0: Klik Reassign atau Transfer (check Facilities §1 Reassign P2; audit §2 MISSING)
  * L1: Modal transfer antar-ruangan + konfirmasi + audit trail, cth tujuan LOC-B2-208
    * L2: Pilih ruangan tujuan lalu konfirmasi
      * L3: Tujuan kosong atau sama dengan asal → pesan inline + submit disabled
      * L4: Pilih tujuan valid lalu konfirmasi ulang
        * L5: status tombol → toast → aset pindah + entri audit trail
      * L3: Ruangan tujuan penuh atau terkunci [ASUMSI] → pesan + tawarkan pilih ulang
      * L4: Ganti tujuan lalu konfirmasi
        * L5: status tombol → toast → aset pindah

### Facilities: tambah sub-lokasi
* L0: Klik + Add Sub-Location / Room (check Facilities §1 Add Sub P3; audit §2)
  * L1: Modal tambah node, target POST /api/v1/locations
    * L2: Isi nama, tipe, induk lalu submit
      * L3: Nama kosong atau induk tak dipilih → pesan inline per field + submit disabled
      * L4: Lengkapi lalu submit ulang
        * L5: FormField → status tombol → toast → node tampil di tree
      * L3: Kode node duplikat → pesan inline + tawarkan kode pengganti [ASUMSI]
      * L4: Ganti kode lalu submit
        * L5: status tombol → toast → node tampil di tree

### Facilities: klik simbol aset di denah
* L0: Klik simbol CHILLER #04 glow merah atau ganti layer, zoom, Heatmap (check Facilities §2 denah P3; audit §1.6)
  * L1: Detail /assets/AST-HVAC-004; view denah lokal state bukan navigasi
    * L2: Klik simbol kritis, toggle layer HVAC-Electrical-Fire, zoom, Heatmap
      * L3: Label singkat WO-0894 (CANON) → dinormalisasi ke WO-2026-0894 saat render
      * L4: Lanjut buka aset
        * L5: hover-reveal aksi → detail aset tampil
      * L3: Layer gagal dimuat → pesan + Retry; legenda tak sinkron → muat ulang layer [ASUMSI]
      * L4: Klik Retry atau pilih layer ulang
        * L5: ErrorToast + Retry → denah sinkron

### Facilities: export geospasial
* L0: Klik Export GeoJSON / BIM (check Facilities §1 Export P3; audit §2)
  * L1: Job export geospasial async lalu unduh
    * L2: Pilih format lalu jalankan export
      * L3: Job berjalan lama → status via polling; tautan kedaluwarsa → pesan + minta ulang [ASUMSI polling job]
      * L4: Tunggu atau jalankan ulang
        * L5: polling + STALE → toast → berkas terunduh
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Facilities: cetak badge dan kalibrasi spasial
* L0: Klik Print Badge QR, Edit Polygon, atau Recalibrate GIS (check Facilities §1 Print P3 dan Editor P3)
  * L1: Pratinjau badge QR LOC-B2-MECH-204
    * L2: Pratinjau lalu cetak badge
      * L3: Pratinjau gagal dirender → ErrorToast + Retry
      * L4: Klik Retry
        * L5: pratinjau cetak tampil → status tercetak [POLA-BARU: pratinjau cetak]
      * L3: Data ruangan basi → penanda STALE pada pratinjau
      * L4: Muat ulang data lalu cetak
        * L5: polling + STALE → pratinjau segar [POLA-BARU: pratinjau cetak]
  * L1: Editor geometri dan job rekalibrasi, build-vs-buy diputus dulu [ASUMSI] (check Facilities §1 Editor P3)
    * L2: Simpan poligon atau jalankan Recalibrate
      * L3: Konflik edit atau GIS mismatch → pesan + MODEL MISMATCH + tautan Recalibrate
      * L4: Muat ulang lalu simpan ulang
        * L5: ErrorToast + Retry → stempel MODEL MATCHED kembali
      * L3: Job rekalibrasi gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 4. Inventory — Spare Parts & Consumables Ledger

Konteks: 4.218 SKU FIFO, PART-SEAL-8821 CRITICAL 2 on-hand 1 reserved 1 available (CANON vs 1/1 net 0 di detail), PART-BRG-6205 (CANON vs 6204), Mutation Desk tab Transfer/Reconciliation dengan form preventDefault demo, approver Marcus Vance PIN Verified statis, contoh transfer unit terakhir Balance 0, feed hash sha256 d8a2. Sistem A.

### Inventory: posting mutasi idempoten
* L0: Klik Confirm & Post Mutation (check Inventory §2 Posting P2; pass2 Idempotency-Key)
  * L1: POST /api/v1/inventory/mutations + Idempotency-Key + optimistic update + rollback (pola 2B + trace)
    * L2: Konfirmasi transfer 1 ea PART-SEAL-8821 ke Substation Locker 4B
      * L3: Double-click atau retry jaringan → kunci idempoten cegah jurnal ganda; konflik kunci → pesan + muat saldo
      * L4: Tunggu hasil kunci yang sama atau muat ulang
        * L5: status tombol Posting → toast → saldo dan feed terupdate
      * L3: Server gagal → rollback optimistic + ErrorToast + Trace + form tetap terisi
      * L4: Klik Retry dengan kunci yang sama
        * L5: ErrorToast + Trace + Retry

### Inventory: guardrail unit terakhir SKU kritis
* L0: Transfer 1 ea terakhir PART-SEAL-8821 (Balance Post-Transfer 0) sementara WO-2026-0894 butuh seal sama (check Inventory §2 Guardrail P2; pass2 §7b.1; dependensi CANON saldo seal)
  * L1: Mutation Desk + guardrail SKU CRITICAL, blokir atau approval khusus saat available ke 0
    * L2: Set qty 1 sebesar seluruh available lalu submit
      * L3: Guardrail aktif → blokir atau minta approval khusus + pesan + tawarkan Draft PO
      * L4: Kurangi qty, selesaikan approval, atau buat Draft PO
        * L5: FormField guard → status tombol → toast → saldo terupdate
      * L3: Approval khusus ditolak → toast + form tetap terisi
      * L4: Batalkan atau ubah qty
        * L5: ErrorToast + form tetap terisi

### Inventory: verifikasi PIN approver
* L0: Persetujuan Marcus Vance ber-PIN statis (check Inventory §2 PIN P1; keamanan; pass2 §3.5)
  * L1: Flow PIN atau OTP nyata + kedaluwarsa + batas nilai tanpa approval
    * L2: Masukkan PIN lalu posting mutasi
      * L3: PIN salah atau kedaluwarsa → badge PIN Expired + verifikasi ulang + posting diblokir [POLA-BARU: pad PIN + kedaluwarsa]
      * L4: Verifikasi ulang lalu posting
        * L5: badge PIN Verified → status tombol → toast → mutasi tercatat [POLA-BARU: pad PIN + kedaluwarsa]
      * L3: Nilai di bawah ambang tanpa approval [ASUMSI ambang] → lewati PIN + catat otomatis
      * L4: Lanjut posting
        * L5: status tombol → toast → mutasi tercatat

### Inventory: validasi form mutation desk
* L0: Isi Mutation Desk qty, destinasi, WO (check Inventory §2 Validasi P2; pola §02)
  * L1: Form desk (qty ≤ available, destinasi ≠ sumber, WO wajib untuk issue)
    * L2: Isi qty, destinasi, WO lalu submit
      * L3: Qty melebihi available, destinasi sama dengan sumber, atau WO kosong untuk issue → error inline + tombol nonaktif
      * L4: Perbaiki lalu submit
        * L5: FormField → status tombol → toast → saldo terupdate
      * L3: Server menolak mutasi → ErrorToast + form tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: rekonsiliasi cycle count
* L0: Ganti tab Cycle Reconciliation plus-minus (check Inventory §2 Cycle P2; audit mode EXISTS)
  * L1: Form countedQty + alasan Cycle Count Variance menjadi ADJ-2026-0020
    * L2: Isi hasil hitung dan alasan lalu submit
      * L3: Selisih tanpa alasan → pesan inline + submit disabled
      * L4: Isi alasan lalu submit ulang
        * L5: FormField → status tombol → toast → ADJ terbuat
      * L3: Submit gagal → ErrorToast + form tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: terima stok GRN
* L0: Klik + Receive Stock PO/GRN (check Inventory §1 Receive P2; audit §3.2)
  * L1: Flow penerimaan PO-2026-0298 +100 pcs PART-FLTR-401 ke ledger (dependensi CANON bin CRIB-B Bay 01 vs SUB-LCK-4B Bay 01)
    * L2: Pilih PO, lines, bin lalu posting GRN
      * L3: PO atau bin kosong, qty tak cocok → pesan inline + submit disabled; bin beda canon → tampilkan bin apa adanya per warehouseId
      * L4: Lengkapi dan selaraskan bin lalu posting ulang
        * L5: FormField → status tombol → toast → stok bertambah
      * L3: Posting GRN gagal → ErrorToast + stok tidak berubah
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: buat draft PO dari baris kritis
* L0: Klik Draft PO pada baris kritis (check Inventory §1 Draft PO P2; readiness M5+H3)
  * L1: Prefill /purchasing/new?sku=PART-SEAL-8821
    * L2: Tinjau prefill SKU dan qty lalu kirim draft
      * L3: Qty kosong atau vendor kosong → pesan inline + submit disabled
      * L4: Lengkapi lalu kirim ulang
        * L5: FormField → status tombol → toast → draft PO terbuat
      * L3: Gagal kirim → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: buka detail SKU
* L0: Klik Details pada baris optimal (check Inventory §1 Detail SKU P2; audit §3.1)
  * L1: Detail /inventory/[sku] (kartu stok, riwayat mutasi, BOM linkage, vendor)
    * L2: Buka detail SKU
      * L3: SKU tak dikenal → EmptyState + CTA kembali ke katalog
      * L4: Kembali ke katalog
        * L5: EmptyState → katalog tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: buka referensi dari feed ledger
* L0: Klik referensi WO-2026-0894, PO-2026-0298, PM-PLN-0104, TRF-2026-0044, ADJ-2026-0019 (check Inventory §1 dokumen sumber P1/P2/P3; readiness H1+H3)
  * L1: Detail /work-orders/[id], /purchasing/[id], /preventive-maintenance/[id], /inventory/transfers/[id], /inventory/adjustments/[id] (dependensi CANON format PM-PLN-0104 vs PM-2025-0812)
    * L2: Klik referensi di feed
      * L3: Format ID tak dikenal (canon PM) atau dokumen arsip → EmptyState + CTA kembali ke feed
      * L4: Kembali ke feed
        * L5: EmptyState → feed tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Inventory: filter katalog dan feed ledger
* L0: Ganti search, warehouse, kategori, threshold, pagination, atau pill filter ledger (check Inventory §3 TERDEFINISI; audit query params dan ?txnType=)
  * L1: Katalog terfilter (?warehouseId=, ?category=, ?threshold=, ?q=, ?page=) + feed All 1.840, Receipts, WO Out, Adjust, Transfers + polling + hash
    * L2: Ketik SKU, pilih hub dan threshold, ganti pill, pindah halaman
      * L3: Tanpa hasil → EmptyState + Clear; sync gagal → badge Live Audit Bus merah + Retry Sync
      * L4: Klik Clear atau Retry Sync
        * L5: EmptyState → hasil tampil; polling + STALE → hash sha256 Synced kembali
      * L3: Polling basi → penanda STALE atau Syncing pada badge hash
      * L4: Tunggu polling berikutnya
        * L5: polling + STALE → feed segar

### Inventory: fokus baris ke desk, cetak, export
* L0: Klik Transfer/Issue pada baris, Print QR/Barcode, atau Export CSV/XLS (check Inventory §3 fokus EXISTS; §1 Print+Export P3; readiness L3)
  * L1: Fokus SKU di Mutation Desk inline + stepper sinkron (audit §2; pola §01)
    * L2: Klik Transfer/Issue pada PART-SEAL-8821
      * L3: Desk tanpa fokus → EmptyState pilih baris katalog
      * L4: Klik baris katalog
        * L5: EmptyState → banner fokus + stepper sinkron tampil
      * L3: Stepper melebihi available → diblokir + pesan ketersediaan
      * L4: Turunkan qty
        * L5: FormField → stepper valid
  * L1: Print view label rak/bin
    * L2: Pilih SKU lalu cetak label
      * L3: Pratinjau gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: pratinjau cetak tampil → label tercetak [POLA-BARU: pratinjau cetak]
  * L1: Job export katalog 4.218 SKU lalu unduh
    * L2: Jalankan export
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

## 5. Purchasing & POs Management Hub

Konteks: PR-2026-0314 darurat chiller $2.900 + WO-2026-0894 + aset CHILL-NUSA-04 (CANON vs AST-HVAC-004), envelope CUP Maintenance Capex Q1 sisa $64.200 SUFFICIENT, rantai 3 tier (2 SIGNED + VP PENDING limit $50.000), Authorize sekali klik simulasi EDI 1,2 dtk menjadi PO-2026-0315, Dock PO-2026-0298 100 PART-FLTR-401 MATCH menjadi GRN-9941 simulasi 1,4 dtk, btnCreatePR tanpa handler, P1 SLA 48m left. Artefak (bottom-nav, header mobile, Space Grotesk, tanpa aside) dilarang. Sistem A.

### Purchasing: otorisasi dan auto-dispatch PO
* L0: Klik Authorize & Auto-Dispatch PO $2.900 btnAuthorizePO (check Purchasing §2 Authorize P1; pass2 §7b.1; dependensi CANON CHILL-NUSA-04)
  * L1: Dialog konfirmasi ringkasan PR, vendor, amount, envelope $64.200 SUFFICIENT + Idempotency-Key sebelum EDI (pola §02 guard + 2B)
    * L2: Tinjau ringkasan lalu konfirmasi otorisasi VP
      * L3: Envelope di bawah $2.900 atau signature belum lengkap → Authorize nonaktif + peringatan over-budget
      * L4: Pilih envelope lain atau lengkapi tanda tangan [ASUMSI opsi envelope]
        * L5: FormField guard → status Transmitting EDI → toast → PO-2026-0315 DISPATCHED
      * L3: EDI gagal → toast + status PO tetap, tidak setengah-dispatch
      * L4: Klik Retry dengan kunci yang sama
        * L5: ErrorToast + Trace + Retry

### Purchasing: posting GRN dan sync ledger
* L0: Klik Post Goods Receipt & Sync Ledger btnPostGRN (check Purchasing §2 Post GRN P2; audit OK aksi)
  * L1: POST goods-receipts idempoten menjadi GRN-9941 + auto-post ledger, tetap di halaman (pola 2B)
    * L2: Konfirmasi expected 100 vs received 100 PART-FLTR-401 bin CRIB-B Bay 01 lalu posting
      * L3: Double post atau retry → kunci idempoten cegah GRN ganda; konflik → pesan + muat status
      * L4: Tunggu hasil kunci yang sama
        * L5: status Posting to Immutable Stock Ledger → toast → GRN-9941 POSTED + saldo terupdate
      * L3: Posting gagal → toast + PO tetap DISPATCHED + ledger tak berubah
      * L4: Klik Retry dengan kunci yang sama
        * L5: ErrorToast + Trace + Retry

### Purchasing: tangani selisih GRN
* L0: Klik Flag Discrepancy saat expected vs received tak sama (check Purchasing §1 Flag P2; guard mismatch P2; pola §02)
  * L1: Modal selisih GRN (retur, klaim, partial-accept) menjadi DISPUTED
    * L2: Catat selisih PART-FLTR-401 lalu pilih tindak lanjut
      * L3: Qty tak sama → status MISMATCH + wajib Flag Discrepancy sebelum posting
      * L4: Flag lalu pilih retur, klaim, atau partial-accept
        * L5: FormField → status tombol → toast → GRN DISPUTED + tindak lanjut tercatat
      * L3: Alasan kosong → pesan inline + submit disabled
      * L4: Isi alasan lalu submit ulang
        * L5: FormField → status tombol → toast → flag tercatat

### Purchasing: buat PR dan PO
* L0: Klik + Create Purchase Request/PO btnCreatePR tanpa handler (check Purchasing §1 Create P2; audit MISSING)
  * L1: Modal create + POST purchase-requests (SKU, qty, vendor, WO link, budget envelope)
    * L2: Isi SKU, qty, vendor, WO-2026-0894, envelope lalu submit
      * L3: Field tak valid → error inline + submit disabled beralasan
      * L4: Perbaiki lalu submit ulang
        * L5: FormField → status tombol → toast → PR terbuat
      * L3: Vendor tak dikenal → EmptyState hasil + CTA onboard vendor [ASUMSI rujuk vendors]
      * L4: Ubah kata kunci atau onboard vendor
        * L5: EmptyState + CTA

### Purchasing: verifikasi 3-Way Match
* L0: Ganti tab GRN atau 3-Way Match, audit PO-2026-0285 partial receipt (check Purchasing §1 tab P2; edge 3-Way Match)
  * L1: Konten ?tab=grn dan ?tab=match dibedakan dari tabel PR (pass2 §3.5)
    * L2: Buka tab match dan audit partial 1 of 2 Bay 04 backorder 2d
      * L3: Kaki belum lengkap → PARTIAL + pesan; selisih → MISMATCH + wajib Flag Discrepancy
      * L4: Lengkapi dokumen atau flag selisih
        * L5: status tombol → toast → status MATCHED atau DISPUTED
      * L3: Tab kosong → EmptyState + CTA buat PR
      * L4: Buat PR atau ganti tab
        * L5: EmptyState → konten tampil

### Purchasing: buka detail PR, PO, GRN, WO
* L0: Klik Review PR-2026-0314, Receive PO-2026-0298, View PO, Audit, Details PR-2026-0295 rejected, atau link WO-2026-0894 (check Purchasing §1 detail P1; readiness H1+H3)
  * L1: Detail /purchasing/[id] + tab review, receiving, match + riwayat signature (audit §3.1)
    * L2: Buka baris triase atau riwayat rejection read-only
      * L3: Dokumen tak dikenal atau workflow closed → EmptyState atau read-only + pesan
      * L4: Kembali ke triase
        * L5: EmptyState → triase tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry
  * L1: Detail /work-orders/[id] dari baris PR dan Sign-off Desk
    * L2: Klik link WO-2026-0894
      * L3: WO tak dikenal → EmptyState + CTA kembali
      * L4: Kembali ke hub
        * L5: EmptyState → hub tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Purchasing: tolak PR dengan justifikasi
* L0: Klik Reject Justification (check Purchasing §1 Reject P2; audit aksi MISSING)
  * L1: Modal alasan penolakan menjadi REJECTED (cth PR-2026-0295 exceeds cap)
    * L2: Isi alasan lalu tolak
      * L3: Alasan kosong → pesan inline + submit disabled
      * L4: Isi alasan lalu tolak ulang
        * L5: FormField → status tombol → toast → PR REJECTED
      * L3: Gagal menolak → ErrorToast + PR tetap PENDING
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Purchasing: minta penawaran OEM
* L0: Klik Request OEM Quotes (check Purchasing §1 RFQ P2; audit MISSING)
  * L1: Flow RFQ menjadi RFQ_SENT
    * L2: Pilih vendor OEM lalu kirim RFQ
      * L3: Tanpa vendor terpilih → pesan inline + kirim disabled
      * L4: Pilih vendor lalu kirim ulang
        * L5: FormField → status tombol → toast → RFQ_SENT
      * L3: Kirim gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Purchasing: filter triase dan countdown SLA
* L0: Ganti tab, search Ctrl+/ , Priority, Status, pagination; pantau P1 SLA 48m left (check Purchasing §3 TERDEFINISI; §2 countdown P3; poll 30 dtk)
  * L1: Daftar terfilter via query params (?tab=, ?q=, ?priority=, ?status=, ?page=) + countdown polling
    * L2: Ketik PR, filter P1, pindah halaman
      * L3: Tanpa hasil → EmptyState + CTA Create
      * L4: Reset filter atau buat PR
        * L5: EmptyState → hasil tampil
      * L3: Countdown habis → badge SLA BREACH + eskalasi [POLA-BARU: countdown SLA]
      * L4: Percepat approval dari Sign-off Desk
        * L5: badge SLA BREACH tampil + countdown berhenti [POLA-BARU: countdown SLA]

### Purchasing: export audit dan cetak batch PO
* L0: Klik Export CSV/Audit atau Print PO Batches (check Purchasing §1 Export+Print P3; readiness L3)
  * L1: Job export lalu unduh berkas
    * L2: Jalankan export tab aktif
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry
      * L3: Tanpa baris pada filter → EmptyState + ubah filter
      * L4: Ubah filter lalu export ulang
        * L5: EmptyState → berkas terunduh
  * L1: Layout cetak batch PO
    * L2: Pratinjau lalu cetak batch
      * L3: Pratinjau gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: pratinjau cetak tampil → batch tercetak [POLA-BARU: pratinjau cetak]

## 6. Vendors & Contractors Management Hub

Konteks: 42 vendor, fokus Trane VND-HVAC-0012 MSA-2024-TRN-09 (CANON 312d di baris vs 288d di kartu), ABB MSA-2023-ABB-02 RENEWAL DUE 28d, JCI 60D WINDOW, DUNS 00-132-9481, hotline 1-800-555-TRANE (dependensi CANON nomor +62 dan kontak Robert Langdon), teknisi Badge #TEC-884 RFID Active, kartu WO-2026-0894 ETA 35 dan PO-2026-0298 $4.800 cocok lintas layar, semua tombol dead click tanpa script. Artefak dilarang. Sistem A.

### Vendors: kunci dispatch saat MSA kedaluwarsa
* L0: Klik Dispatch Work Order pada vendor tanpa MSA aktif atau MSA kedaluwarsa (check Vendors §2 Kunci P1; audit banner merah + kunci)
  * L1: Prefill /work-orders/new?vendorId=… terkunci + banner merah (readiness M5)
    * L2: Coba dispatch pada vendor terkunci, cth ABB RENEWAL DUE 28d
      * L3: MSA kedaluwarsa atau banner No Active MSA → tombol terkunci + banner + arahan Amendment atau Renewal
      * L4: Ajukan amendment atau renewal lalu dispatch ulang
        * L5: FormField guard → status tombol → toast → WO ter-dispatch
      * L3: Tanpa teknisi cleared → toolchain dispatch dinonaktifkan + penjelasan
      * L4: Tambah teknisi cleared atau pilih vendor lain
        * L5: EmptyState + CTA

### Vendors: dispatch work order vendor aktif
* L0: Klik Dispatch Work Order pada Trane aktif (check Vendors §1 Prefill Dispatch P2; readiness M5)
  * L1: Prefill /work-orders/new?vendorId=VND-HVAC-0012 + teknisi cleared Badge #TEC-884 RFID Active
    * L2: Pilih teknisi lalu dispatch
      * L3: Teknisi tak cleared atau RFID nonaktif → pesan inline + dispatch disabled
      * L4: Pilih teknisi cleared lalu dispatch ulang
        * L5: FormField → status tombol → toast → WO ter-dispatch
      * L3: Dispatch gagal → toast + status teknisi tetap
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: buka detail vendor dan scorecard
* L0: Klik baris vendor, chevron, atau badge Active (check Vendors §1 Detail P2; readiness M1; kalibrasi HIGH vs MEDIUM diputus saat rebuild)
  * L1: Detail /vendors/[id], cth VND-HVAC-0012 + scorecard 98,4 Grade A+
    * L2: Buka vendor Trane
      * L3: Vendor tak dikenal → EmptyState + CTA Onboard
      * L4: Kembali ke direktori
        * L5: EmptyState → direktori tampil
      * L3: Scorecard gagal dimuat → skeleton + ErrorToast + Retry
      * L4: Klik Retry
        * L5: TableSkeleton → scorecard tampil, atau ErrorToast menetap

### Vendors: lihat PDF MSA tereksekusi
* L0: Klik View Executed PDF MSA-2024-TRN-09 (check Vendors §1 Detail P2)
  * L1: Document viewer MSA + tombol Initiate Amendment
    * L2: Buka PDF tereksekusi
      * L3: PDF gagal dimuat → pesan viewer + unduh langsung
      * L4: Klik unduh langsung atau Retry
        * L5: ErrorToast + Retry → dokumen tampil atau berkas terunduh
      * L3: Dokumen kedaluwarsa vs lifecycle (canon 312d vs 288d) → tampilkan daysLeft dari satu API tanpa diputus di sini
      * L4: Muat ulang dari sumber tunggal
        * L5: polling → sisa hari tampil konsisten

### Vendors: amandemen kontrak MSA
* L0: Klik Initiate Amendment (check Vendors §1 Amendment P2; audit §3.4)
  * L1: Flow amandemen MSA-2024-TRN-09 menjadi AMD-2026-0012 IN_REVIEW
    * L2: Isi termin dan nilai lalu ajukan
      * L3: Termin kosong atau nilai tak valid → pesan inline + submit disabled
      * L4: Perbaiki lalu ajukan ulang
        * L5: FormField → status tombol → toast → amendment IN_REVIEW
      * L3: Pengajuan gagal → ErrorToast + draf tetap terisi
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: onboard vendor dan MSA baru
* L0: Klik + Onboard New Vendor/MSA (check Vendors §1 Onboarding P2; audit §3.4)
  * L1: Formulir multi-langkah data perusahaan, DUNS, sertifikasi, termin MSA + approval
    * L2: Isi tiap langkah lalu submit final
      * L3: DUNS 00-132-9481 tak valid, kontak kosong, atau domain salah → pesan inline per langkah + lanjut disabled
      * L4: Perbaiki langkah lalu lanjutkan
        * L5: FormField → status tombol → toast → vendor ONBOARDING
      * L3: Approval ditolak → toast + draf tetap tersimpan [ASUMSI draf tersimpan]
      * L4: Revisi lalu ajukan ulang
        * L5: ErrorToast + draf tetap terisi

### Vendors: pantau expiry ledger dan renewal
* L0: Klik Expiry Ledger 6 Expiring (check Vendors §1 Expiry P3; filter inline vs halaman diputus saat rebuild)
  * L1: Filter inline ?msaStatus=expiring + countdown renewal dari satu API (dependensi CANON 312d vs 288d berakhir via satu API)
    * L2: Filter expiring dan pantau RENEWAL DUE 28d, 60D WINDOW
      * L3: Countdown melewati ambang → badge RENEWAL DUE + Immediate Audit [POLA-BARU: countdown renewal]
      * L4: Ajukan renewal atau amendment
        * L5: badge renewal tampil + countdown berhenti [POLA-BARU: countdown renewal]
      * L3: Tanpa hasil pada filter → EmptyState + CTA Onboard
      * L4: Ubah filter
        * L5: EmptyState → hasil tampil

### Vendors: buka WO dan PO dari kartu dispatch
* L0: Klik kartu WO-2026-0894 ETA 35 mins atau PO-2026-0298 GRN RECEIVED $4.800 (check Vendors §1 dispatch P2; readiness H1+H3; konsisten lintas layar)
  * L1: Detail /work-orders/[id]
    * L2: Buka kartu WO dispatch
      * L3: WO tak dikenal → EmptyState + CTA kembali
      * L4: Kembali ke hub
        * L5: EmptyState → hub tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry
  * L1: Detail /purchasing/[id]
    * L2: Buka kartu PO dispatch
      * L3: PO tak dikenal → EmptyState + CTA kembali
      * L4: Kembali ke hub
        * L5: EmptyState → hub tampil
      * L3: Gagal dimuat → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: aksi cepat vendor
* L0: Klik Direct Ring, Commendation, Export Compliance, print atau history (check Vendors §1 aksi P3; audit §2)
  * L1: Aksi tel:1-800-555-TRANE (dependensi CANON nomor +62) (audit TERDEFINISI aksi)
    * L2: Klik Direct Ring
      * L3: Hotline tak terjangkau → tombol disabled + pesan
      * L4: Coba lagi atau hubungi kontak cadangan [ASUMSI kontak cadangan]
        * L5: panggilan keluar atau status tak-terjangkau menetap [POLA-BARU: aksi tel]
  * L1: Aksi Commendation tanpa handler (audit MISSING)
    * L2: Beri apresiasi vendor
      * L3: Catatan kosong → pesan inline + kirim disabled [ASUMSI catatan]
      * L4: Isi catatan lalu kirim ulang
        * L5: status tombol → toast → apresiasi tercatat
  * L1: Dossier vendor, riwayat audit, job Export Compliance CSV/PDF (readiness L3)
    * L2: Unduh dossier atau jalankan export
      * L3: Job gagal → ErrorToast + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Trace + Retry

### Vendors: filter direktori dan sync ERP
* L0: Ganti search, MSA Status, Risk, chip domain, pagination (check Vendors §3 TERDEFINISI; audit query params)
  * L1: Direktori terfilter (?q=Trane, ?msaStatus=, ?risk=, ?domain=, ?page=) + footer Auto-synced with Oracle ERP
    * L2: Ketik Trane, filter Active, pilih chip HVAC 12, pindah halaman
      * L3: Tanpa hasil → EmptyState + CTA Onboard
      * L4: Klik Onboard atau ubah filter
        * L5: EmptyState + CTA
      * L3: Sync Oracle ERP gagal → footer Sync Failed + Retry
      * L4: Klik Retry
        * L5: ErrorToast + Retry → footer Synced kembali
