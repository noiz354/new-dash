# Triase Batch 2 — Tema Aset & Resource (Step 2)

> Sumber: `docs/exp-check/part-aset.md` (106 checkbox, 6 layar). Metode: grep per item + peta rute (batch-1 style).
> Legenda: DONE = ada & bekerja · PROMOTE = backlog Phase 2+ · (U) = kedalaman belum terverifikasi.
> Dependensi kanon tak diputus (WO seal ganda, OEM Trane vs Daikin, skor 68/88/88,4, harga seal, bin, MSA 312d vs 288d, WO-0894 vs WO-2026-0894).

## Rute terpetakan
`assets/page` (wrapper) · `assets/[id]` (dossier LIVE) · `assets/[id]/bim` + `AssetBim.tsx` · `assets/[id]/documents/[docId]` (233 baris)
`inventory/page` (`InventoryLedger.tsx`) · `inventory/[sku]` · `purchasing/page` (wrapper) · `purchasing/[id]` (33) + `PurchaseDetail/List/dialogs/PrintButton` · `purchasing/invoices/[id]` (324)
`vendors/page` · `vendors/[id]` (`VendorDetail`) · `vendors/contracts/[id]` · `facilities/page` + `[id]` (`FacilityHub.tsx`; rute bernama facilities)

## 1. Asset Registry (14) — DONE 5 / PROMOTE 7 / (U) 2
- DONE: BIM viewer (`AssetBim` + route `/bim`); document viewer+upload route (`documents/[docId]`); search/filter state + data Postgres live + workload counts nyata + export CSV nyata via worker; palette ⌘K (batch 1); ikon notifications (shell).
- PROMOTE: Flow + Konfirmasi Decommission (tak ada di kode); Flow + Modal Transfer Loc (tak ada); Modal Register New Asset + POST (tak ada); Batch QR Print massal/satuan (tak ada); Export async job (CSV sinkron ada); sinkronisasi filter/pagination ke query params (`?q=`, `Page 1 of 308` klaim vs 6 baris).
- (U): prefill Create WO / Schedule PM dari drawer registry (link prefill ADA di halaman detail, pemakaian drawer belum dicek); search terkontrol penuh.

## 2. Asset Detail (21) — DONE 8 / PROMOTE 10 / (U) 3
- DONE: dossier LIVE per aset (`getAssetDossier`, 404 lintas-tenant); link WO per baris + SR + finding (nyata); link prefill `/work-orders/new?asset=&location=` + `/field-inspections/new?asset=`; link BIM; breadcrumb `/assets`; deferral jujur (edits/decommission "arrive with inventory slice").
- PROMOTE: sub-tab IoT Diagnostics / PM Schedules (12) / Compliance & Docs (tak ada — `?tab=` kosong); Dossier PDF 360°; export full ledger 421 + hash; guardrail Issue-to-WO saat SKU DEFICIT; Modal (bukan link) Quick Dispatch + Log Inspection; Modal Add SKU to BOM; Flow +PR Request baris kritis; Flow +Quick PO; warehouse scope toggle + refresh BOM; pill filter timeline + empty state; badge telemetri STALE/reconnect.
- (U): tombol copy tag + fallback; referensi gantung `#WO-2025-0812`/`#PO-2025-0081`/`#TO-8891`/`#ADJ-2024-Q4` (mekanisme link DONE, ID kanon inkonsisten — catat, jangan diperbaiki diam-diam).

## 3. Facility Locations (20) — DONE 11 / PROMOTE 7 / (U) 2
- DONE: Export GeoJSON/BIM (download nyata + catatan jujur "geometries unseeded"); dialog Add Sub-Location + validasi inline; dialog Reassign/Transfer + Stage Transfer; dialog Log Defect; Modal Quick Selector kaskade; dialog Edit Polygon + Recalibrate GIS; countdown `SLA Breach in 42m`; state layer/zoom/heatmap inline; link kartu WO seal; `Showing 4 of 8` + link View All; simbol CHILLER di denah SVG.
- PROMOTE: kontrak JSON `GET /api/v1/locations/:id` + `?locationId=` pengganti fragment HTMX; prefill Dispatch Room Audit / Log Defect via `?locationId=`; tampilan hasil `TMPL-HVAC-CHL-02`; persist polygon/rekalibrasi (dialog ada, backend belum); Print Badge QR ruangan; link `WO-2026-0881` (masih teks); pesan gagal hx-get + Retry + tile STALE + MODEL MISMATCH; unifikasi label hitungan (`8 AST` vs `4 Linked` vs `Showing 4 of 8`).
- (U): link simbol CHILLER #04 → `/assets/AST-HVAC-004`; klik node tree spasial (perilaku runtime).

## 4. Inventory Ledger (17) — DONE 10 / PROMOTE 5 / (U) 2
- DONE: detail SKU (`inventory/[sku]`); dialog Receive Stock tervalidasi (dipakai runtime TASK-21); detail purchasing (route ada); export katalog CSV; fokus SKU ke Mutation Desk inline; pill filter ledger + search/warehouse/kategori/threshold; validasi desk (`mutOk`: qty ≤ avail, PIN, WO wajib); flow Cycle Count → `ADJ-2026-0020` (client-side); mutation desk tab mode inline.
- PROMOTE: POST mutasi idempoten (`Idempotency-Key`, kini `setRows/setMovs` lokal); verifikasi PIN approver nyata (kini hardcoded `2468`); approval khusus saat available → 0; rute detail transfer/adjustment (`TRF-2026-0044`, `ADJ-2026-0019` sebagai teks); prefill Draft PO (`?sku=`); link PM-PLN-0104.
- (U): polling feed + badge hash/Syncing/Retry; Print QR/Barcode rak-bin.

## 5. Purchasing Hub (17) — DONE 9 / PROMOTE 8 / (U) 0
- DONE: detail PR/PO/GRN + tab 3-Way Match (`?tab=` router); link WO dari baris + sign-off; fokus Review/Receive inline; dialog Authorize (ringkasan envelope $64.200 + `Idempotency-Key` + fase Transmitting); dialog Reject/RFQ/Dispute; countdown SLA live (`sla` state); search/filter/pagination; skeleton + status transmitting/posting; artefak bottom-nav field (buang saat rebuild).
- PROMOTE: POST nyata authorize/GRN (simulasi fase); modal + validasi Create PR/PO; backend Flag Discrepancy / Reject / RFQ; guard mismatch qty + envelope tak cukup (server-side); rute detail GRN-9941; job export CSV/Audit + print batch.

## 6. Vendors Hub (17) — DONE 7 / PROMOTE 8 / (U) 2
- DONE: detail vendor + `contracts/[id]`; kunci dispatch saat MSA kedaluwarsa (banner + label `Renewal Overdue · Dispatches Locked`); kartu dispatch → WO/PO (route ada); DUNS tampil; search/MSA Status/Risk/pagination; label expiry per vendor.
- PROMOTE: flow + modal Onboard vendor/MSA + approval; flow + modal Initiate Amendment; modal Dispatch prefill `?vendorId=`; countdown renewal single-source (akhiri 312d vs 288d); aksi Commendation; dossier + export compliance; footer Sync Oracle ERP gagal + Retry; viewer MSA PDF gagal + unduh langsung.
- (U): Expiry Ledger inline vs halaman (`?msaStatus=expiring`); empty state direktori + CTA; `tel:` Direct Ring (tombol toast saja).

## Ringkasan: DONE 50 / PROMOTE 45 / (U) 11 = 106
Pola berulang: dialog/dokumen/validasi client-side KAYA (banyak DONE), persist backend + guard server-side + rute detail bernomor (GRN/TRF/ADJ) = PROMOTE. Tidak ada USANG — semua item masih relevan sebagai backlog.
