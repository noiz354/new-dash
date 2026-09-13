# Expansion Checklist — Part Aset & Resource (Batch A)

> Cakupan batch: 6 layar di bawah ini saja. Semua desktop = sistem A (Apex Operational Facility System).
> Skema prioritas: P1 = dead-end jalur utama, aksi destruktif tanpa konfirmasi, keamanan; P2 = alur medium (3-Way Match, posting mutasi + Idempotency-Key, guardrail SKU CRITICAL); P3 = low/enhancement.
> Format ID kanon: `AST-*`, `PART-*`, `PO-2026-XXXX`, `PR-2026-XXXX`, `WO-2026-XXXX`.
> Dependensi kanon belum diputus (lihat docs/AUDIT_MULTI_PAGE_READINESS.md §1/G3, jangan diam-diam diperbaiki): OEM `AST-HVAC-004` Trane (registry) vs Daikin (detail); skor kesehatan 68 vs 88 vs 88,4; WO seal `WO-2026-0894` vs `WO-2026-8802` vs `WO-2025-0812`/`WO-2025-0044`; harga `PART-SEAL-8821` $1.450 vs $1.420; SKU bearing `PART-BRG-6205` vs `PART-BRG-6204`; sisa MSA Trane 312d vs 288d; bin `CRIB-B` vs `SUB-LCK-4B`; `CHILL-NUSA-04` vs `AST-HVAC-004`; label singkat `WO-0894` vs `WO-2026-0894`.

## Asset Registry — Enterprise Asset Ledger (`asset_registry_lifecycle_management_ledger/`)
> Sumber: docs/ui-audit/asset-registry.md + docs/ui-audit/pass2/asset-registry.md, readiness §2 (M5, M6, L3, H1) + §3, navigation-audit §3-§5.
### 1. Missing Sub-Pages
- [ ] [P2] **BIM 3D viewer** — Menampilkan model BIM dari tombol Open BIM 3D Model. (tag: [SUDAH-DI-READINESS §2/M6]; docs/ui-audit/asset-registry.md §3.2)
- [ ] [P2] **Form prefill Create WO (`/work-orders/new?asset=AST-HVAC-004`)** — Membuat WO dengan aset terisi otomatis dari drawer. (tag: [SUDAH-DI-READINESS §2/M5+H1]; dependensi: WO seal tunggal belum diputus; docs/ui-audit/asset-registry.md §3.1)
- [ ] [P2] **Form prefill Schedule PM (`/preventive-maintenance/new?asset=...`)** — Menjadwalkan PM dengan aset terisi otomatis dari drawer. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/asset-registry.md §3.1)
- [ ] [P2] **Flow Transfer Loc** — Memindahkan aset antar-lokasi dengan modal, alasan, dan audit trail. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.3)
- [ ] [P1] **Flow Decommission** — Menonaktifkan aset dengan konfirmasi wajib + alasan karena tombolnya destruktif sekali klik. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.3, pass2 §3.3)
- [ ] [P3] **Document viewer + upload** — Melihat/mengunggah manual OEM Trane CVHE 18,4 MB, P&ID RevC, SOP LOTO. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.4)
- [ ] [P3] **Print views (Batch QR Print + print tag QR #004)** — Mencetak label QR fisik massal/satuan. (tag: [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/asset-registry.md §3.5)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Konfirmasi Decommission** — Pemicu klik Decommission; butuh modal konfirmasi ketik + alasan + toast hasil + rollback. (pola ui-state-patterns §02 FormField guard + 2B ErrorToast; docs/ui-audit/pass2/asset-registry.md §3.3)
- [ ] [P2] **Modal Transfer Loc** — Pemicu klik Transfer Loc; butuh pilih lokasi tujuan + alasan + validasi + toast. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.3)
- [ ] [P2] **Modal Register New Asset** — Pemicu + Register New Asset; butuh field, validasi, target POST, spinner inline. (tag: [BARU]; docs/ui-audit/pass2/asset-registry.md §3.4)
- [ ] [P2] **Umpan balik Export async** — Pemicu Export (CSV/XLS); butuh status job + unduh + toast gagal. (pola ui-state-patterns §03 + 2B; docs/ui-audit/asset-registry.md §2)
- [ ] [P3] **Dialog Batch QR Print** — Pemicu Batch QR Print; butuh pratinjau cetak massal. (tag: [BARU]; docs/ui-audit/asset-registry.md §3.5)
- [ ] [P3] **Search terkontrol** — Pemicu ketik di search (saat ini `value="AST-HVAC-004"` statis tanpa handler); butuh state `?q=`, empty state + Reset Filter. (tag: [BARU]; docs/ui-audit/pass2/asset-registry.md §7b.1)
- [ ] [P3] **Sinkronisasi filter/pagination** — Pemicu ganti tab kategori/pill/Rows/halaman; butuh query params + skeleton + kalibrasi `Page 1 of 308` (6 baris vs Rows 25). (tag: [BARU]; dependensi: total 1.842 vs perPage; docs/ui-audit/asset-registry.md Temuan no. 3)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik baris tabel / chevron | Drawer profil `AST-HVAC-004` inline, produksi `/assets/[id]` | TERDEFINISI DI MOCKUP |
| Klik Create WO | `/work-orders/new?asset=AST-HVAC-004` (prefill) | TAK TERDEFINISI |
| Klik Schedule PM | `/preventive-maintenance/new?asset=...` (prefill) | TAK TERDEFINISI |
| Klik Transfer Loc | Modal transfer + audit trail | TAK TERDEFINISI |
| Klik Decommission | Konfirmasi + status DECOMMISSIONED | TAK TERDEFINISI |
| Klik Open BIM 3D Model | BIM viewer (tab vs route belum diputus) | TAK TERDEFINISI |
| Klik + Register New Asset | Modal registrasi (`POST /api/v1/assets`) | TAK TERDEFINISI |
| Klik Export (CSV/XLS) | Job export async lalu unduh berkas | TAK TERDEFINISI |
| Klik Batch QR Print | Print view QR massal | TAK TERDEFINISI |
| Klik Preview / Download dokumen | Viewer + unduhan berkas (4 file 30,7 MB) | TAK TERDEFINISI |
| Klik Upload Drawing, Schematic or PDF Manual | Uploader dokumen aset | TAK TERDEFINISI |
| Klik print QR tag / more_vert | Print tag satuan / menu konteks | TAK TERDEFINISI |
| Ganti search / filter / tab kategori / pagination | Hasil terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik ikon notifications | `/notifications` | TERDEFINISI DI MOCKUP |
| Klik + New Dispatch / Request (header) | Command palette / modal kontekstual global | TAK TERDEFINISI |

## Asset Detail & Spare Parts Ledger (`asset_detail_spare_parts_inventory_ledger/`)
> Sumber: docs/ui-audit/asset-detail.md + docs/ui-audit/pass2/asset-detail.md, readiness §2 (H1, H3, M5) + §3, navigation-audit §3-§5.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `#WO-2025-0812` yang dirujuk 2x di ledger tanpa tujuan. (tag: [SUDAH-DI-READINESS §2/H1]; dependensi: WO seal tunggal `WO-2025-0812`/`WO-2025-0044` vs `WO-2026-0894` belum diputus; docs/ui-audit/asset-detail.md §3.1)
- [ ] [P2] **Detail PR/PO/GRN + 3-Way Match (`/purchasing/[id]`)** — Membuka `#PO-2025-0081` yang menggantung. (tag: [SUDAH-DI-READINESS §2/H3]; docs/ui-audit/asset-detail.md §3.2)
- [ ] [P2] **Detail transfer antar-gudang (`/inventory/transfers/[id]`)** — Membuka `#TO-8891 (Sat-B)`. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.3)
- [ ] [P2] **Detail adjustment cycle-count (`/inventory/adjustments/[id]`)** — Membuka `#ADJ-2024-Q4`. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.3)
- [ ] [P2] **Isi sub-tab IoT Diagnostics** — Menampilkan diagnostik/telemetri riwayat `AST-HVAC-004` (opsi `?tab=iot`). (tag: [BARU]; docs/ui-audit/pass2/asset-detail.md §3.2)
- [ ] [P2] **Isi sub-tab PM Schedules (12)** — Menampilkan 12 jadwal PM aset ini (opsi `?tab=pm`). (tag: [BARU]; docs/ui-audit/asset-detail.md §3.4)
- [ ] [P2] **Isi sub-tab Compliance & Docs** — Menampilkan sertifikat `#NBIC-990-2024` dan dokumen kepatuhan (opsi `?tab=docs`). (tag: [BARU]; docs/ui-audit/asset-detail.md §3.4)
- [ ] [P2] **Prefill Quick Dispatch WO (`/work-orders/new?asset=AST-HVAC-004`)** — Membuat WO dengan aset terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P2] **Prefill Log Inspection (`/field-inspections/new?asset=...`)** — Mencatat inspeksi dengan aset terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P3] **Dossier PDF aset** — Mengunduh dossier 360° `AST-HVAC-004`. (tag: [BARU]; docs/ui-audit/asset-detail.md §2)
- [ ] [P3] **Export full ledger (CSV/stream, 421 transaksi)** — Mengunduh/men-stream jurnal mutasi penuh beserta hash `SHA-256: 9e08fc...18a`. (tag: [BARU]; docs/ui-audit/asset-detail.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Guardrail Issue to WO saat SKU DEFICIT** — Pemicu Issue pada `PART-SEAL-8821` (par 4, net 0); butuh blokir/peringatan + tawarkan + PR Request. (tag: [BARU]; dependensi: saldo `PART-SEAL-8821` 1/1 net 0 vs 2/1/1 dan harga $1.450 vs $1.420 belum diputus; docs/ui-audit/asset-detail.md §1.6)
- [ ] [P2] **Modal Quick Dispatch WO** — Pemicu toolbar Quick Dispatch; butuh form prefill + validasi + toast. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P2] **Modal Log Inspection** — Pemicu toolbar Log Inspection; butuh form prefill + validasi. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.6)
- [ ] [P2] **Modal Add SKU to BOM** — Pemicu + Add SKU to BOM; butuh field SKU/par/bin + validasi. (tag: [BARU]; docs/ui-audit/asset-detail.md §3.5)
- [ ] [P2] **Flow + PR Request baris kritis** — Pemicu + PR Request pada `PART-SEAL-8821`; butuh PR prefill SKU/qty/aset + approval. (tag: [BARU]; dependensi harga `PART-SEAL-8821`; docs/ui-audit/asset-detail.md §2)
- [ ] [P2] **Flow + Quick PO baris BELOW PAR** — Pemicu + Quick PO pada `PART-LUB-09`; butuh PO cepat prefill SKU. (tag: [BARU]; docs/ui-audit/asset-detail.md §2)
- [ ] [P3] **Copy tag + fallback** — Pemicu tombol copy `AST-HVAC-004`; sudah `onclick` clipboard di mockup, butuh fallback prompt + toast. (pola ui-state-patterns 2B; code.html `navigator.clipboard.writeText`; docs/ui-audit/pass2/asset-detail.md §1.3)
- [ ] [P3] **Warehouse scope toggle** — Pemicu ganti Central Distribution Hub vs Satellite Bin; butuh refresh BOM + banner fallback. (tag: [BARU]; dependensi: selisih saldo `PART-LUB-09`/`PART-FLTR-401` antar-scope belum diputus; docs/ui-audit/asset-detail.md Temuan no. 4)
- [ ] [P3] **Filter pill timeline** — Pemicu ganti All Events (54) / Work Orders (14) / Inspections (28) / Parts Replaced (8) / Calibration (4); butuh daftar terfilter + empty state. (pola ui-state-patterns §01 EmptyState; docs/ui-audit/asset-detail.md §1.4)
- [ ] [P3] **Telemetri STALE / reconnect** — Pemicu gauge basi; butuh badge STALE + status CONNECTING pada badge SAMPLING 1 detik. (pola ui-state-patterns §03 + 2A; docs/ui-audit/asset-detail.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik breadcrumb Asset Registry | `/assets` (daftar induk) | TERDEFINISI DI MOCKUP |
| Klik sub-tab Asset 360° and Lifecycle | Tab inline aktif halaman ini | TERDEFINISI DI MOCKUP |
| Klik sub-tab Spare Parts Ledger (18) | Scroll ke BOM atau `?tab=bom` | TERDEFINISI DI MOCKUP |
| Klik sub-tab IoT Diagnostics | Konten diagnostik (`?tab=iot`) | TAK TERDEFINISI |
| Klik sub-tab PM Schedules (12) | Daftar 12 jadwal (`?tab=pm`) | TAK TERDEFINISI |
| Klik sub-tab Compliance and Docs | Dokumen kepatuhan (`?tab=docs`) | TAK TERDEFINISI |
| Klik Quick Dispatch WO | Modal / prefill `?asset=AST-HVAC-004` | TAK TERDEFINISI |
| Klik Log Inspection | Form inspeksi prefill aset | TAK TERDEFINISI |
| Klik Dossier | Unduh PDF dossier aset | TAK TERDEFINISI |
| Klik tombol copy tag | Clipboard `AST-HVAC-004` + fallback | TERDEFINISI DI MOCKUP |
| Klik `#WO-2025-0812` (2 titik) | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik `#PO-2025-0081` | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik `#TO-8891 (Sat-B)` | Detail transfer antar-gudang | TAK TERDEFINISI |
| Klik `#ADJ-2024-Q4` | Detail adjustment cycle-count | TAK TERDEFINISI |
| Klik + PR Request / + Quick PO / Issue to WO | Flow PR / PO cepat / issue ke WO | TAK TERDEFINISI |
| Klik Add SKU to BOM | Modal tambah SKU | TAK TERDEFINISI |
| Klik Load Full Historical Ledger | Export CSV / stream 421 transaksi | TAK TERDEFINISI |
| Ganti warehouse scope / search BOM | BOM terfilter per gudang | TERDEFINISI DI MOCKUP |
| Ganti pill filter timeline | Event terfilter per tipe | TERDEFINISI DI MOCKUP |

## Facility Locations & Spatial Hierarchy (`facility_locations_spatial_hierarchy_management/`)
> Sumber: docs/ui-audit/facilities.md + docs/ui-audit/pass2/facilities.md, readiness §2 (H1, M5, M6, L3, Hx/G6) + §3, navigation-audit §3-§5. Satu-satunya layar dengan interaksi nyata fragment HTMX (`hx-get="/locations/tree/node/LOC-B2-MECH-204"`).
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `WO-2026-0894` (P1, SLA breach 42m) dan `WO-2026-0881` dari panel ruangan. (tag: [SUDAH-DI-READINESS §2/H1]; docs/ui-audit/facilities.md §3.2)
- [ ] [P2] **Prefill Dispatch Room Audit (`/field-inspections/new?locationId=LOC-B2-MECH-204`)** — Membuat audit ruangan dengan lokasi terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/facilities.md §3.1)
- [ ] [P2] **Prefill Log Defect (modal atau `/field-inspections/new?locationId=...`)** — Mencatat defect dengan lokasi terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/facilities.md §3.1)
- [ ] [P2] **Hasil audit ruangan `TMPL-HVAC-CHL-02`** — Melihat hasil 3/4 passed + 1 defect via `/field-inspections/[id]` atau drawer. (tag: [BARU]; docs/ui-audit/facilities.md §3.3)
- [ ] [P2] **Flow Reassign / Transfer aset antar-ruangan** — Memindahkan aset (mis. ke `LOC-B2-208`) dengan audit trail. (tag: [BARU]; docs/ui-audit/facilities.md §2)
- [ ] [P2] **Kontrak JSON pengganti fragment HTMX** — `GET /api/v1/locations/:id` + state `?locationId=` menggantikan `hx-get` HTML (fragment tidak diporting 1:1). (tag: [Hx]; docs/ui-audit/facilities.md §3.6, readiness §1/G6)
- [ ] [P2] **Entri BIM 3D viewer dari blueprint** — Membuka model Revit dari stempel `BIM REVIT 2026.2 MODEL MATCHED`. (tag: [SUDAH-DI-READINESS §2/M6]; docs/ui-audit/pass2/facilities.md §3.4)
- [ ] [P3] **Editor geometri Edit Polygon + Recalibrate GIS** — Mengubah poligon ruangan / rekalibrasi (putuskan build-vs-buy dulu). (tag: [BARU]; docs/ui-audit/facilities.md §3.4)
- [ ] [P3] **Modal + Add Sub-Location / Room** — Menambah node ruangan (`POST /api/v1/locations`). (tag: [BARU]; docs/ui-audit/facilities.md §2)
- [ ] [P3] **Print Badge QR ruangan** — Mencetak badge QR `LOC-B2-MECH-204`. (tag: [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/facilities.md §2)
- [ ] [P3] **Export GeoJSON / BIM** — Mengekspor geospasial via job async. (tag: [BARU]; docs/ui-audit/facilities.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P2] **Modal Quick Selector kaskade** — Pemicu Quick Selector (sudah toggle `hidden` inline); butuh 4 dropdown Campus-Building-Floor-Room + preview + validasi + select disabled saat opsi gagal. (pola ui-state-patterns §02; code.html toggle `quick-selector-modal`; docs/ui-audit/facilities.md §1.10)
- [ ] [P2] **Modal Log Defect** — Pemicu + Log Defect; butuh form prefill lokasi + validasi + toast. (tag: [BARU]; docs/ui-audit/facilities.md §3.1)
- [ ] [P2] **Modal Reassign / Transfer** — Pemicu Reassign / Transfer; butuh pilih ruangan tujuan + konfirmasi + audit trail. (tag: [BARU]; docs/ui-audit/facilities.md §2)
- [ ] [P2] **Validasi Add Sub-Location** — Pemicu submit tambah ruangan; butuh inline validation + pesan error per field. (pola ui-state-patterns §02; docs/ui-audit/facilities.md §2)
- [ ] [P2] **Countdown SLA ruangan** — Timer `SLA Breach in 42m` dan `Due Tomorrow 18:00` via polling + format tanggal. (tag: [BARU]; docs/ui-audit/facilities.md §1.9)
- [ ] [P3] **Layer / zoom / heatmap denah** — State view lokal (tab HVAC/Electrical/Fire + zoom + Heatmap sudah inline); butuh pan/zoom reaktif + legenda sinkron. (tag: [BARU] untuk reaktivitas; code.html SVG inline ±110 elemen; docs/ui-audit/pass2/facilities.md §1.6)
- [ ] [P3] **Klik simbol aset di denah** — Pemicu klik `CHILLER #04` (glow merah + pulse) menuju `/assets/AST-HVAC-004`. (tag: [BARU]; dependensi: label `WO-0894` vs `WO-2026-0894`; docs/ui-audit/facilities.md Temuan no. 2)
- [ ] [P3] **Kegagalan hx-get + sensor basi** — `hx-get` gagal butuh pesan + Retry di `#location-detail-container`; sensor basi butuh tile STALE; GIS mismatch butuh `MODEL MISMATCH` + link Recalibrate. (pola ui-state-patterns 2B + 2A; docs/ui-audit/facilities.md §1 State UI)
- [ ] [P3] **Unifikasi label hitungan ruangan** — Node `8 AST` vs pil `4 Linked` vs `Showing 4 of 8` butuh pagination/scroll eksplisit + satu sumber angka. (tag: [BARU]; docs/ui-audit/pass2/facilities.md §7b.1)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik node tree spasial | Swap fragment `hx-get /locations/tree/node/[id]` ke `#location-detail-container`, produksi `?locationId=` + JSON | TERDEFINISI DI MOCKUP |
| Klik Quick Selector | Modal kaskade terbuka | TERDEFINISI DI MOCKUP |
| Klik Apply Filter Across Dashboard | Set scope global `locationId` lintas dashboard | TERDEFINISI DI MOCKUP |
| Klik Cancel / close modal | Modal tertutup | TERDEFINISI DI MOCKUP |
| Ganti layer / zoom / Heatmap | View denah lokal berubah | TERDEFINISI DI MOCKUP |
| Klik View All 8 in Asset Registry | `/assets?locationId=LOC-B2-MECH-204` | TERDEFINISI DI MOCKUP |
| Klik baris Installed Assets (`AST-*`) | `/assets/[id]` | TERDEFINISI DI MOCKUP |
| Klik Dispatch Room Audit | Prefill `/field-inspections/new?locationId=` | TAK TERDEFINISI |
| Klik + Log Defect | Flow defect prefill lokasi | TAK TERDEFINISI |
| Klik Reassign / Transfer | Flow transfer antar-ruangan | TAK TERDEFINISI |
| Klik kartu `WO-2026-0894` / `WO-2026-0881` | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik hasil `TMPL-HVAC-CHL-02` | `/field-inspections/[id]` atau drawer hasil | TAK TERDEFINISI |
| Klik Edit Polygon | Editor geometri GIS/BIM | TAK TERDEFINISI |
| Klik Print Badge QR | Print view badge ruangan | TAK TERDEFINISI |
| Klik + Add Sub-Location / Room | Modal tambah node | TAK TERDEFINISI |
| Klik Export GeoJSON / BIM | Job export geospasial | TAK TERDEFINISI |
| Klik Recalibrate GIS | Job rekalibrasi GIS | TAK TERDEFINISI |
| Klik simbol CHILLER #04 di denah | `/assets/AST-HVAC-004` | TAK TERDEFINISI |

## Inventory — Spare Parts & Consumables Ledger (`inventory_spare_parts_management_ledger/`)
> Sumber: docs/ui-audit/inventory.md + docs/ui-audit/pass2/inventory.md, readiness §2 (H1, H3, M5, L3) + §3, navigation-audit §3-§5.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `WO-2026-0894` (reserved lock + feed + Associated WO desk). (tag: [SUDAH-DI-READINESS §2/H1]; docs/ui-audit/inventory.md §3.3)
- [ ] [P2] **Detail SKU (`/inventory/[sku]`)** — Menampilkan kartu stok, riwayat mutasi, BOM linkage, vendor per SKU dari tombol Details. (tag: [BARU]; docs/ui-audit/inventory.md §3.1)
- [ ] [P2] **Flow Receive Stock / GRN (`/inventory/receive` atau Dock Desk purchasing)** — Menerima `PO-2026-0298` +100 pcs `PART-FLTR-401` ke ledger. (tag: [BARU]; dependensi: bin `CRIB-B / Bay 01` vs `SUB-LCK-4B / Bay 01` belum diputus; docs/ui-audit/inventory.md §3.2)
- [ ] [P2] **Prefill Draft PO (`/purchasing/new?sku=PART-SEAL-8821`)** — Membuat draft PO dari baris kritis. (tag: [SUDAH-DI-READINESS §2/M5+H3]; docs/ui-audit/inventory.md §3.4)
- [ ] [P2] **Detail purchasing (`/purchasing/[id]`)** — Membuka `PO-2026-0298` dari feed GRN. (tag: [SUDAH-DI-READINESS §2/H3]; docs/ui-audit/inventory.md §3.3)
- [ ] [P3] **Detail PM (`PM-PLN-0104`)** — Membuka referensi Quarterly PM di feed ledger. (tag: [BARU]; dependensi: format `PM-PLN-0104` vs `PM-2025-0812` belum diputus; docs/ui-audit/inventory.md Temuan no. 4)
- [ ] [P3] **Detail transfer / adjustment (`/inventory/transfers/[id]`, `/inventory/adjustments/[id]`)** — Membuka `TRF-2026-0044` dan `ADJ-2026-0019`. (tag: [BARU]; docs/ui-audit/inventory.md §3.3)
- [ ] [P3] **Print QR / Barcode** — Mencetak label rak/bin. (tag: [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/inventory.md §3.5)
- [ ] [P3] **Export katalog (CSV/XLS)** — Mengekspor 4.218 SKU via job async. (tag: [BARU]; docs/ui-audit/inventory.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Verifikasi PIN approver nyata** — Badge `PIN Verified` (Marcus Vance) statis; butuh flow PIN/OTP nyata + kedaluwarsa + batas nilai tanpa approval. (tag: [BARU]; keamanan; docs/ui-audit/pass2/inventory.md §3.5)
- [ ] [P2] **Posting mutasi idempoten** — Pemicu Confirm & Post Mutation (saat ini `onsubmit preventDefault` demo); butuh POST + `Idempotency-Key` + optimistic update + rollback agar double-click tak menggandakan jurnal immutable. (pola ui-state-patterns 2B ErrorToast + trace; docs/ui-audit/pass2/inventory.md §7b.2)
- [ ] [P2] **Guardrail SKU CRITICAL unit terakhir** — Form mencontohkan transfer 1 ea terakhir (`Balance Post-Transfer: 0 Available in Crib-B`) sementara `WO-2026-0894` butuh seal sama; butuh blokir/approval khusus saat available ke 0. (tag: [BARU]; dependensi saldo `PART-SEAL-8821` belum diputus; docs/ui-audit/pass2/inventory.md §7b.1)
- [ ] [P2] **Validasi desk (qty, destinasi, WO)** — Qty tidak melebihi available, destinasi beda dari sumber, WO wajib untuk issue; tombol nonaktif + error inline. (pola ui-state-patterns §02; docs/ui-audit/inventory.md §1 State UI)
- [ ] [P2] **Mode Cycle Reconciliation** — Pemicu tab plus-minus; butuh form countedQty + alasan Cycle Count Variance menjadi `ADJ-2026-0020`. (tag: [BARU]; docs/ui-audit/inventory.md §1.6)
- [ ] [P3] **Dialog Receive Stock** — Pemicu + Receive Stock (PO / GRN); butuh pilih PO + lines + bin + validasi. (tag: [BARU]; docs/ui-audit/inventory.md §3.2)
- [ ] [P3] **Polling feed + filter pill** — Pil All (1.840) / Receipts / WO Out / Adjust / Transfers via `?txnType=` + polling + badge hash `sha256:d8a2..f041` / Syncing / Retry Sync. (pola ui-state-patterns §03 + 2A; docs/ui-audit/inventory.md §1.5)
- [ ] [P3] **Fokus SKU ke Mutation Desk** — Pemicu Transfer / Issue di baris; sudah set fokus inline, butuh empty state desk + stepper sinkron. (pola ui-state-patterns §01; docs/ui-audit/inventory.md §2)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik + Receive Stock (PO / GRN) | Flow penerimaan GRN / meja Dock purchasing | TAK TERDEFINISI |
| Klik Export (CSV/XLS) | Job export katalog lalu unduh | TAK TERDEFINISI |
| Klik Print QR / Barcode | Print view label rak/bin | TAK TERDEFINISI |
| Klik Draft PO (baris kritis) | `/purchasing/new?sku=PART-SEAL-8821` (prefill) | TAK TERDEFINISI |
| Klik Transfer / Issue (baris) | Fokus SKU di Mutation Desk inline | TERDEFINISI DI MOCKUP |
| Klik Details (baris optimal) | `/inventory/[sku]` | TAK TERDEFINISI |
| Ganti tab Inter-Hub Transfer / Cycle Reconciliation | Mode form desk berganti inline | TERDEFINISI DI MOCKUP |
| Ganti pill filter ledger | Feed terfilter `?txnType=` | TERDEFINISI DI MOCKUP |
| Klik Confirm & Post Mutation | `POST /api/v1/inventory/mutations` + saldo baru, tetap di halaman | TAK TERDEFINISI |
| Klik referensi `WO-2026-0894` | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik referensi `PO-2026-0298` | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik referensi `PM-PLN-0104` | `/preventive-maintenance/[id]` | TAK TERDEFINISI |
| Klik `TRF-2026-0044` / `ADJ-2026-0019` | Detail transfer / adjustment | TAK TERDEFINISI |
| Ganti search / warehouse / kategori / threshold / pagination | Katalog terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik ikon notifications | `/notifications` | TERDEFINISI DI MOCKUP |

## Purchasing & POs Management Hub (`purchasing_pos_management_hub/`)
> Sumber: docs/ui-audit/purchasing.md + docs/ui-audit/pass2/purchasing.md, readiness §2 (H1, H3, L3) + §3, navigation-audit §3 + §5. Sistem A untuk konten hub.
> Catatan anti-artifak (PINDAHKAN sebagai larangan, jangan jadikan usulan): `<title>Run Checklist`, header mobile field (`Apex Ops LIVE`, `HQ Nusantara > Chiller Plant B-204`), bottom-nav field (`Audits` / `Checklist` aktif / `Finding` / `Sync`) yang menutupi konten, font Space Grotesk sisa templat, dan tanpa `<aside>` sidebar — semuanya ARTEFAK copy-paste Stitch (docs/ui-audit/purchasing.md Temuan no. 1; navigation-audit §5). Produksi WAJIB: shell desktop + sidebar 15 item + header standar, bottom-nav dibuang, Space Grotesk dihapus.
### 1. Missing Sub-Pages
- [ ] [P1] **Detail PR/PO/GRN + 3-Way Match (`/purchasing/[id]`)** — Menampung Review, View PO, Audit, Details + tab receiving/match + riwayat signature. (tag: [SUDAH-DI-READINESS §2/H3]; docs/ui-audit/purchasing.md §3.1)
- [ ] [P1] **Detail Work Order (`/work-orders/[id]`)** — Membuka `WO-2026-0894` dari baris PR dan Sign-off Desk. (tag: [SUDAH-DI-READINESS §2/H1]; docs/ui-audit/purchasing.md §3.2)
- [ ] [P2] **Modal Create PR/PO (`#btnCreatePR` tanpa handler)** — Membuat PR/PO via form SKU, qty, vendor, WO link, budget envelope. (tag: [BARU]; docs/ui-audit/purchasing.md Temuan no. 2)
- [ ] [P2] **Flow Flag Discrepancy** — Menindaklanjuti selisih GRN via retur, klaim, atau partial-accept. (tag: [BARU]; docs/ui-audit/purchasing.md §3.4)
- [ ] [P2] **Flow Reject Justification** — Menolak PR dengan alasan menjadi REJECTED. (tag: [BARU]; docs/ui-audit/purchasing.md §3.4)
- [ ] [P2] **Flow Request OEM Quotes (RFQ)** — Mengirim RFQ menjadi RFQ_SENT. (tag: [BARU]; docs/ui-audit/purchasing.md §3.4)
- [ ] [P2] **Konten tab GRN + 3-Way Match** — Membedakan isi tab dari tabel PR via `?tab=grn` dan `?tab=match`. (tag: [BARU]; docs/ui-audit/pass2/purchasing.md §3.5)
- [ ] [P2] **Detail GRN-9941** — Melihat goods receipt hasil posting `PO-2026-0298`. (tag: [BARU]; bagian H3; docs/ui-audit/purchasing.md §2)
- [ ] [P3] **Export CSV / Audit + Print PO Batches** — Job export dan layout cetak batch PO. (tag: [SUDAH-DI-READINESS §2/L3] untuk print, [BARU] untuk export; docs/ui-audit/purchasing.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Dialog konfirmasi Authorize & Auto-Dispatch PO $2.900** — Pemicu `#btnAuthorizePO` (saat ini sekali klik simulasi EDI 1,2 dtk); butuh ringkasan PR/vendor/amount/envelope `$64.200 SUFFICIENT` + konfirmasi + `Idempotency-Key` sebelum EDI. (pola ui-state-patterns §02 guard + 2B; dependensi: `CHILL-NUSA-04` vs `AST-HVAC-004`; docs/ui-audit/pass2/purchasing.md §7b.1)
- [ ] [P2] **Idempotensi Post GRN** — Pemicu `#btnPostGRN` (simulasi 1,4 dtk menjadi `GRN-9941 Posted`); butuh POST idempoten + auto-post ledger; EDI gagal butuh toast + status PO tetap (tidak setengah-dispatch). (pola ui-state-patterns 2B; docs/ui-audit/pass2/purchasing.md §7b.2)
- [ ] [P2] **Guard mismatch qty GRN** — Expected vs Received `PART-FLTR-401` 100 pcs tidak sama menjadi MISMATCH dan wajib Flag Discrepancy sebelum posting. (pola ui-state-patterns §02 inline validation; docs/ui-audit/purchasing.md §1 State UI)
- [ ] [P2] **Guard envelope tak cukup** — Sisa envelope di bawah $2.900 membuat Authorize nonaktif + peringatan over-budget. (pola ui-state-patterns §02; docs/ui-audit/purchasing.md §1 State UI)
- [ ] [P2] **Modal Reject Justification + Request OEM Quotes** — Pemicu dua tombol tanpa handler; butuh form alasan / flow RFQ + status. (tag: [BARU]; docs/ui-audit/purchasing.md §2)
- [ ] [P2] **Validasi Create PR** — Field SKU, qty, vendor, WO link, envelope + error inline + submit disabled beralasan. (pola ui-state-patterns §02; docs/ui-audit/purchasing.md §3.3)
- [ ] [P3] **Countdown SLA + shortcut search** — `P1 SLA: 48m left` via poll 30 dtk; `Ctrl/Cmd + /` fokus search (sudah inline, pertahankan). (tag: [BARU] untuk polling; code.html script inline; docs/ui-audit/pass2/purchasing.md §1.8)
- [ ] [P3] **Skeleton triase + status transmitting/posting** — Status `Transmitting EDI...` / `Posting to Immutable Stock Ledger...` sudah disimulasi dan wajib dipertahankan sebagai pola. (pola ui-state-patterns §03; docs/ui-audit/purchasing.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Ganti tab Purchase Requests / Purchase Orders / GRN / 3-Way Match | Daftar terfilter `?tab=` inline | TERDEFINISI DI MOCKUP |
| Klik Review (`PR-2026-0314`) | Fokus Sign-off Desk inline, produksi `/purchasing/[id]` tab review | TERDEFINISI DI MOCKUP |
| Klik Receive (`PO-2026-0298`) | Fokus Dock Receiving Desk inline, produksi GRN detail | TERDEFINISI DI MOCKUP |
| Klik View PO (`PR-2026-0309` ke `PO-2026-0302`) | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik Audit (`PO-2026-0285` partial receipt) | `/purchasing/[id]` tab match | TAK TERDEFINISI |
| Klik Details (`PR-2026-0295` rejected) | Riwayat rejection read-only | TAK TERDEFINISI |
| Klik link `WO-2026-0894` (baris + sign-off) | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik + Create Purchase Request / PO | Modal create + POST | TAK TERDEFINISI |
| Klik Authorize & Auto-Dispatch PO | Dialog konfirmasi lalu `POST` menjadi `PO-2026-0315`, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Post Goods Receipt (GRN) & Sync Ledger | `POST` menjadi `GRN-9941` + auto-post ledger, tetap di halaman | TERDEFINISI DI MOCKUP |
| Klik Flag Discrepancy | Modal selisih GRN (retur/klaim/partial) | TAK TERDEFINISI |
| Klik Reject Justification / Request OEM Quotes | Aksi approval / flow RFQ | TAK TERDEFINISI |
| Klik Export CSV / Audit, Print PO Batches | Job export / print view | TAK TERDEFINISI |
| Ganti search / Priority / Status / pagination | Hasil terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik bottom-nav Audits / Checklist / Finding / Sync | Bukan navigasi hub ini (ARTEFAK, buang) | TAK TERDEFINISI |

## Vendors & Contractors Management Hub (`vendors_contractors_management_hub/`)
> Sumber: docs/ui-audit/vendors.md + docs/ui-audit/pass2/vendors.md, readiness §2 (M1, H1, H3, M5, L3) + §3, navigation-audit §3 + §5. Sistem A untuk konten hub.
> Catatan anti-artifak (PINDAHKAN sebagai larangan, jangan jadikan usulan): `<title>Run Checklist`, header mobile field, bottom-nav field 4 tab yang menutupi konten, font Space Grotesk sisa templat, tanpa `<aside>` dan tanpa script inline sama sekali (semua tombol dead click) — ARTEFAK copy-paste Stitch (docs/ui-audit/vendors.md Temuan no. 1 + no. 3; navigation-audit §5). Produksi WAJIB: shell desktop + sidebar 15 item, bottom-nav dibuang.
### 1. Missing Sub-Pages
- [ ] [P2] **Detail vendor + MSA document viewer (`/vendors/[id]`)** — Scorecard `VND-HVAC-0012` via URL + View Executed PDF + Initiate Amendment (kalibrasi: pass2 menilai HIGH, pass1/readiness M1 MEDIUM — diputuskan saat rebuild). (tag: [SUDAH-DI-READINESS §2/M1]; docs/ui-audit/pass2/vendors.md §3.1)
- [ ] [P2] **Flow onboarding vendor/MSA** — Formulir multi-langkah data perusahaan, DUNS, sertifikasi, termin MSA + approval. (tag: [BARU]; docs/ui-audit/vendors.md §3.4)
- [ ] [P2] **Flow Initiate Amendment** — Mengamandemen `MSA-2024-TRN-09` menjadi `AMD-2026-0012` IN_REVIEW. (tag: [BARU]; docs/ui-audit/vendors.md §3.4)
- [ ] [P2] **Detail Work Order + purchasing dari kartu dispatch** — Membuka `WO-2026-0894` (ETA 35 mins) dan `PO-2026-0298` (GRN RECEIVED $4.800). (tag: [SUDAH-DI-READINESS §2/H1+H3]; docs/ui-audit/vendors.md §3.3)
- [ ] [P2] **Prefill Dispatch Work Order (`/work-orders/new?vendorId=VND-HVAC-0012`)** — Dispatch WO dengan vendor terisi otomatis. (tag: [SUDAH-DI-READINESS §2/M5]; docs/ui-audit/vendors.md §3.2)
- [ ] [P3] **Keputusan Expiry Ledger (6 Expiring)** — Filter inline `?msaStatus=expiring` vs halaman ledger terpisah. (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P3] **Aksi Commendation** — Apresiasi vendor (saat ini tanpa handler). (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P3] **Dossier vendor + Export Compliance (CSV/PDF)** — Riwayat audit vendor dan job export kepatuhan. (tag: [BARU]; cetak ikut [SUDAH-DI-READINESS §2/L3]; docs/ui-audit/vendors.md §2)
### 2. Undefined Micro-Interactions
- [ ] [P1] **Kunci Dispatch saat MSA kedaluwarsa** — Vendor tanpa MSA aktif (banner No Active MSA) atau MSA kedaluwarsa membuat Dispatch Work Order terkunci + banner merah. (tag: [BARU]; kasus: `MSA-2023-ABB-02` RENEWAL DUE 28d; docs/ui-audit/vendors.md §1 State UI)
- [ ] [P2] **Modal Onboard New Vendor / MSA** — Pemicu tombol primer; butuh validasi DUNS `00-132-9481`, kontak, domain + approval. (tag: [BARU]; docs/ui-audit/vendors.md §3.4)
- [ ] [P2] **Modal Initiate Amendment** — Pemicu tombol amendment; butuh form termin/nilai + approval. (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P2] **Modal Dispatch Work Order prefill vendor** — Pemicu Dispatch; butuh form `?vendorId=` + teknisi cleared (`Badge #TEC-884`, RFID Active) + toast. (tag: [BARU]; docs/ui-audit/vendors.md §2)
- [ ] [P2] **Countdown renewal MSA tunggal** — `RENEWAL DUE (28d)`, `60D WINDOW`, dan sisa Trane dari satu API agar konflik 312d vs 288d berakhir. (tag: [BARU]; dependensi sisa MSA 312d vs 288d belum diputus; docs/ui-audit/pass2/vendors.md §3.5)
- [ ] [P3] **Direct Ring hotline** — Pemicu Direct Ring; aksi `tel:1-800-555-TRANE` + disabled saat tak terjangkau. (tag: [BARU]; dependensi: nomor `+1 (555)` vs operasi Nusantara + kontak `Robert Langdon` belum diputus; docs/ui-audit/pass2/vendors.md §7b.1)
- [ ] [P3] **Sync Oracle ERP gagal** — Footer menjadi Sync Failed + Retry. (pola ui-state-patterns 2B; docs/ui-audit/vendors.md §1 State UI)
- [ ] [P3] **PDF MSA gagal dimuat** — Viewer error + unduh langsung. (pola ui-state-patterns 2B; docs/ui-audit/vendors.md §1 State UI)
- [ ] [P3] **Empty state direktori** — Pencarian tanpa hasil menampilkan pesan + CTA Onboard. (pola ui-state-patterns §01 EmptyState; docs/ui-audit/vendors.md §1 State UI)
### 3. State Transitions
| Aksi (L0) | Target yang diharapkan | Status |
|---|---|---|
| Klik baris vendor / chevron / badge Active | `/vendors/[id]` (contoh `VND-HVAC-0012`) | TAK TERDEFINISI |
| Klik View Executed PDF | Viewer dokumen `MSA-2024-TRN-09` | TAK TERDEFINISI |
| Klik Initiate Amendment | Flow amandemen kontrak | TAK TERDEFINISI |
| Klik Dispatch Work Order | Prefill `/work-orders/new?vendorId=` | TAK TERDEFINISI |
| Klik Commendation | Aksi apresiasi vendor | TAK TERDEFINISI |
| Klik Direct Ring | `tel:1-800-555-TRANE` (aksi, bukan navigasi) | TERDEFINISI DI MOCKUP |
| Klik kartu `WO-2026-0894` | `/work-orders/[id]` | TAK TERDEFINISI |
| Klik kartu `PO-2026-0298` | `/purchasing/[id]` | TAK TERDEFINISI |
| Klik + Onboard New Vendor / MSA | Modal onboarding + approval | TAK TERDEFINISI |
| Klik Expiry Ledger (6 Expiring) | Filter inline `?msaStatus=expiring` atau halaman ledger | TERDEFINISI DI MOCKUP |
| Klik Export Compliance (CSV/PDF) | Job export kepatuhan | TAK TERDEFINISI |
| Klik print / history (kartu profil) | Dossier vendor / riwayat audit | TAK TERDEFINISI |
| Ganti search / MSA Status / Risk / chip domain / pagination | Direktori terfilter via query params | TERDEFINISI DI MOCKUP |
| Klik bottom-nav Audits / Checklist / Finding / Sync | Bukan navigasi hub ini (ARTEFAK, buang) | TAK TERDEFINISI |
