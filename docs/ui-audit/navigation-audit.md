# Navigation Audit — Apex Ops CMMS (20 Layar Stitch)

> Cakupan: seluruh `stitch_facility_maintenance_platform_ui/*/code.html` (20 file).
> Metode: pemindaian script atas `<aside>`, breadcrumb, `<a>`, `<button>`,
> `data-path`, dan referensi entitas (`WO-*`, `AST-*`, `PO-*`).
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).

## 1. Temuan Kunci

1. **Satu shell desktop global.** 16 dari 20 file menanam `<aside>` sidebar
   **identik** (`Apex Ops Enterprise CMMS`, `Live Sync Active v4.18-p3`,
   `Telemetry Bus Broker: 10.14.0.8`) dengan 15 `data-path` — inilah navigasi
   global sesungguhnya.
2. **Tidak ada routing nyata.** Semua `href="#"`; navigasi hanya berupa label +
   `data-path` + breadcrumb. Seluruh URL target pada dokumen ini adalah
   **usulan**, bukan kode yang ada.
3. **Satu shell mobile.** Bottom-nav 4 tab (`my-audits`, `run-checklist` aktif,
   `report-finding`, `sync-status`) hanya valid untuk alur field; kemunculannya
   di `vendors_*` dan `purchasing_*` adalah **artefak copy-paste Stitch**.
4. **Detail page nyaris tidak ada.** Hanya `asset_detail_*` yang menjadi halaman
   detail (`/assets/[id]`). WO/SR/PO/vendor/SKU yang dirujuk di mana-mana tidak
   punya halaman tujuan → dead-end terbesar.
5. Breadcrumb mengonfirmasi 3 grup IA: **Core Operations**, **Asset & Resource**,
   **Governance & System**.

## 2. Sitemap Usulan (Route Next.js)

Layout `(dispatch)` — shell desktop + sidebar (16 halaman ada mockup):

| # | Sidebar / data-path | Route usulan | File Stitch | Grup |
|---|---|---|---|---|
| 1 | Operations Dashboard | `/operations` | `operations_dashboard` | Core Operations |
| 2 | Work Orders (badge 14) | `/work-orders` | `work_order_management_execution_hub` | Core Operations |
| 3 | Service Requests (badge 5) | `/service-requests` | `service_requests_triage_hub` | Core Operations |
| 4 | Preventive Maintenance | `/preventive-maintenance` | `preventive_maintenance_scheduling_automation_hub` | Core Operations |
| 5 | Field Inspections | `/field-inspections` | `field_inspections_audit_queue_hub` | Core Operations |
| 6 | Asset Registry | `/assets` | `asset_registry_lifecycle_management_ledger` | Asset & Resource |
| 7 | Asset Detail (tanpa item sidebar) | `/assets/[id]` | `asset_detail_spare_parts_inventory_ledger` | Asset & Resource |
| 8 | Facility Locations | `/facilities` | `facility_locations_spatial_hierarchy_management` | Asset & Resource |
| 9 | Inventory & Parts Ledger | `/inventory` | `inventory_spare_parts_management_ledger` | Asset & Resource |
| 10 | Purchasing & POs | `/purchasing` | `purchasing_pos_management_hub` | Asset & Resource |
| 11 | Vendors & Contractors | `/vendors` | `vendors_contractors_management_hub` | Asset & Resource |
| 12 | Reports & Analytics | `/reports` | `reports_analytics_hub` | Governance & System |
| 13 | Audit Trail & Logs | `/audit-logs` | `audit_trail_system_logs_hub` | Governance & System |
| 14 | Notifications & SLA Alerts | `/notifications` | `notifications_sla_alerts_hub` | Governance & System |
| 15 | Organization & RBAC | `/organization` | `organization_rbac_governance_hub` | Governance & System |
| 16 | Settings & System Config | `/settings` | `settings_system_configuration` | Governance & System |

Layout `(field)` — shell mobile + bottom-nav (1 halaman ada mockup penuh):

| # | Tab / data-path | Route usulan | File Stitch |
|---|---|---|---|
| 1 | Audits | `/(field)/audits` | — (hanya tab; daftar audit ada di hub desktop) |
| 2 | Checklist (aktif) | `/(field)/run/[auditId]` | `mobile_field_inspection_execution_desk` |
| 3 | Finding | `/(field)/findings/new` | — (hanya tab) |
| 4 | Sync | `/(field)/sync` | — (hanya tab) |

Bukan route: `apex_ops_logo` (aset logo), `ui_state_variants_patterns`
(spesifikasi pola state untuk diacu semua halaman, bukan halaman),
`inspection_findings_auto_wo_conversion_desk` (meja kerja konversi temuan —
diusulkan sebagai tab/section di `/field-inspections` atau
`/field-inspections/findings`, bukan route top-level).

## 3. Peta Navigasi per Elemen (Sampel Lintas Halaman)

`[Elemen UI / Action] -> [Target]`. Status EXISTS = mockup tersedia,
MISSING = belum ada.

| Sumber | Elemen / Action | Target | Status |
|---|---|---|---|
| Semua (sidebar ×15) | Klik item sidebar | Route §2 sesuai `data-path` | EXISTS (mockup) |
| Semua (header) | `+ New Dispatch / Request` | Modal Quick Create (tujuan bervariasi per halaman) | MISSING (target tak terdefinisi) |
| Semua (header) | Ikon `notifications` | `/notifications` | EXISTS |
| Dashboard | Baris / aksi tabel dispatch | `/work-orders/[id]` | MISSING |
| Dashboard | `View System Diagnostic Logs` | `/audit-logs` | EXISTS |
| Dashboard | `Export Executive Report` | Job export → `/reports` (unduh dossier) | EXISTS (parsial) |
| PM hub | Link `WO-2025-0144` dkk (5 link) | `/work-orders/[id]` | MISSING |
| PM hub | `Shift Plan →` | Halaman shift plan | MISSING |
| PM hub | `Execute Dispatch Batch (4 WOs)` | Aksi batch, tetap di halaman | OK (aksi, bukan navigasi) |
| Asset registry | `Create WO` / `Schedule PM` per baris | `/work-orders/new?asset=` / `/preventive-maintenance/new?asset=` | MISSING (prefill flow) |
| Asset registry | `Open BIM 3D Model` | BIM viewer | MISSING |
| Asset detail | `#WO-2025-0812 open_in_new` (×2), `#PO-2025-0081`, `#TO-8891`, `#ADJ-2024-Q4` | `/work-orders/[id]`, `/purchasing/[id]`, transfer/adjustment detail | MISSING |
| Asset detail | Tab `Asset 360° & Lifecycle`, `IoT Diagnostics`, `Compliance & Docs` | Tab inline di halaman | EXISTS (tab) |
| Facility | `View All 8 in Asset Registry →` | `/assets?facility=` | EXISTS (dengan query) |
| Facility | `Dispatch Room Audit`, `+ Log Defect` | `/field-inspections/new?location=` | MISSING (prefill flow) |
| Purchasing | `Linked WO: WO-2026-0894` | `/work-orders/[id]` | MISSING |
| Purchasing | `View PO`, `Review 3-Way Match`, `Authorize & Auto-Dispatch PO` | `/purchasing/[id]` (+ tab match/approve) | MISSING |
| Vendors | Panel `Trane Technologies`, `View Executed PDF`, `Initiate Amendment`, `Dispatch Work Order` | `/vendors/[id]` (+ document viewer, amendment flow) | MISSING |
| Notifications | `View Work Order`, `Authorize PO`, `View Inventory Ledger`, `View Field Checklist`, `View Audit Trace Log` | Detail pages masing-masing domain | MISSING (ikut induknya) |
| SR triage | `Review Converted WOs`, hasil konversi SR-2026-0894 | `/work-orders/[id]` | MISSING |
| Findings desk | `Convert Finding to Work Order & Auto-Dispatch` | `/work-orders/[id]` hasil konversi | MISSING |
| Org/RBAC | `Audit Impersonate`, `Provision via SCIM` | Mode impersonate / flow SCIM | MISSING (kebutuhan prod) |
| Settings | `Configure` (endpoint), `Test Connection` | Drawer/modal konfigurasi integrasi | MISSING (parsial) |
| Mobile run | `Submit Audit & Auto-Dispatch WO` | Kembali ke `/(field)/audits` + WO terbuat | Tab tujuan MISSING |
| Mobile run | `Save Offline Local Draft` | `/(field)/sync` ( antrean offline) | MISSING |

## 4. Missing Pages & Flow Gaps (Daftar Audit)

Prioritas HIGH (dead-end di jalur kerja utama):

1. **`/work-orders/[id]` (WO Detail)** — dirujuk ≥10 titik (dashboard, PM hub,
   asset detail, purchasing, notifications, SR triage, findings). Wajib ada
   sebelum flow dispatch utuh: timeline, evidence, parts, time log, sign-off.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Tab mobile `my-audits`, `report-finding`, `sync-status`** — bottom-nav
   field menunjuk ke 3 layar yang tidak punya mockup. Tanpa ini alur
   `run → submit → sync` terputus di perangkat field.
   `// TODO: Create field routes /(field)/audits, /(field)/findings/new, /(field)/sync`
3. **`/purchasing/[id]` (PR/PO/GRN Detail + 3-Way Match)** — tombol `View PO`,
   `Review`, `Audit`, `Authorize` tidak punya tujuan.
   `// TODO: Create detail page routing for /purchasing/[id]`

Prioritas MEDIUM:

4. **`/vendors/[id]` + MSA document viewer** — panel vendor, `View Executed PDF`,
   `Initiate Amendment` menggantung.
5. **`/service-requests/[id]`** — triage desk inline sudah kaya, tetapi tautan
   hasil konversi SR→WO dan riwayat per tiket belum terdefinisi.
6. **Auth (login / MFA / SSO callback)** — Org hub mengatur SSO/MFA/SCIM, namun
   tidak ada layar login; wajib untuk produksi (route `(auth)/login`).
7. **Target global `+ New Dispatch / Request`** — setiap halaman punya tombol ini
   tanpa tujuan seragam; putuskan: command palette (`⌘K`) + modal kontekstual.
8. **Prefill flows**: `Create WO`/`Schedule PM` dari registry,
   `Log Defect`/`Dispatch Room Audit` dari facility — butuh konvensi query
   (`?asset=`, `?location=`) bukan halaman baru, tetapi harus disepakati.
9. **BIM 3D viewer** (`Open BIM 3D Model`) — putuskan: tab asset detail vs
   route `/assets/[id]/bim`.

Prioritas LOW (penunjang / enhancement):

10. **Shift plan view** (`Shift Plan →`), **shift handover** — tersebar di PM hub,
    WO hub, field hub tanpa tujuan.
11. **User profile & session** — avatar header, `Revoke Active Session`,
    `Audit Impersonate` (ikut Org hub).
12. **Print views** — `Print Work Permit`, `Print PO Batches`, `Print Badge QR`.
13. **Global search (`⌘K`)** — tidak ada di mockup mana pun; usulan enhancement.
14. **`ui_state_variants_patterns`** — bukan route; jadikan referensi pola
    (skeleton/toast/empty/error) di sistem desain.

## 5. Inkonsistensi Navigasi Antar-Layar (Temuan, Jangan Diam-Diam Diperbaiki)

- `vendors_contractors_management_hub` dan `purchasing_pos_management_hub`
  menanam **bottom-nav mobile field** (`my-audits/run-checklist/...`) padahal
  keduanya hub desktop — artefak copy-paste Stitch. Versi produksi: pakai
  sidebar desktop, buang bottom-nav.
- `mobile_field_inspection_execution_desk` berjudul `<title>Run Checklist</title>`
  yang dipakai ulang mentah oleh vendors & purchasing — bukti templat yang sama.
- Badge count sidebar tidak konsisten: sebagian halaman menampilkan
  `Work Orders 14` / `Service Requests 5`, sebagian tidak (mis. settings).
  Produksi: badge berasal dari `GET /api/v1/notifications/counts`, bukan hardcode.
- Breadcrumb memakai grup lama (`Operations`, `Core Operations`) yang tidak
  1:1 dengan 3 grup sidebar (`Core Operations`, `Asset & Resource`,
  `Governance & System`) — selaraskan IA saat rebuild.
- Penomoran WO campur (`WO-2024-*` di dashboard vs `WO-2025-*`/`WO-2026-*` di
  hub lain) — mockup lintas waktu; normalisasi ke satu sequence saat seeding.

## 6. Temuan Lintas Layar dari Audit Per-Halaman (20/20, 2026-09-13)

> Audit per layar selesai semua (`docs/ui-audit/*.md`, 6 seksi v2 + `// TODO`).
> Temuan baru di bawah ini melengkapi §5 — dicatat, tidak diam-diam diperbaiki.

**Identitas & data master (butuh kanonisasi saat seeding):**
- `AST-HVAC-004` ber-OEM ganda (Trane di registry vs Daikin di asset-detail);
  skor kesehatan tiga versi (68 vs 88 vs 88,4). Pekerjaan seal chiller diklaim
  dua WO (`WO-2026-0894` di `AST-HVAC-014` vs `WO-2026-8802` di `AST-HVAC-004`).
- Harga `PART-SEAL-8821` beda ($1.420 vs $1.450); SKU bearing beda
  (`PART-BRG-6205` vs `PART-BRG-6204`); saldo 3 SKU selisih antar-layar.
  Positif: rantai `PO-2026-0298` (PO→GRN→ledger) konsisten di 3 layar.
- Aset kritis ditulis `CHILL-NUSA-04` (purchasing) vs `AST-HVAC-004` (kanonis);
  ID disingkat `WO-0894` (denah facility) vs format penuh `WO-2026-0894`.
- Tenant ganda (`APX-GL-9021` vs `APX-NUSA-01`); seed `8 Roles` (settings) vs
  `6 Roles` (org hub); Shift A `07:00-15:30 WIB` vs `06:00-22:00`;
  sisa MSA Trane 312d vs 288d; progres `INS-2026-0412` 65% vs 50%.
- Nama `Elena Rostova` (ui-states) vs kanonis `Voronova`; contoh `WO-9042`
  melanggar format kanonis; prefix `PR-2026-0314` vs `PO-2026-0298` butuh
  pemisahan PR vs PO yang eksplisit.

**Geografi & media placeholder:**
- Foto bukti findings ber-EXIF `48.12°N 11.58°E` (Eropa) vs GPS mobile
  `0.7893°S, 113.9213°E` (Kalimantan) untuk temuan yang sama; peta facility
  memakai foto udara Chicago untuk kampus Nusantara; avatar org hub hotlink
  `googleusercontent` sementara; `screen.png` reports salah sorot nav
  (yang biru justru `Audit Trail & Logs`).

**Teknis & keamanan (wajib sebelum produksi):**
- **Secret API key terpapar plain di HTML settings** (`apx_live_sec_...`) —
  anggap bocor, rotasi saat seeding, prod hanya tampilkan `last4`.
- Kontrak API campur versi (`POST /api/v2/procurement/...` di audit-trail vs
  `v1` di semua kontrak lain) — putuskan versi kanonis.
- Aksi destruktif sekali klik tanpa konfirmasi (`Revoke Session`,
  `Authorize PO` $2.900); override PASS mobile masih `alert()` demo (butuh
  modal PIN); `confirm()` native untuk deactivate.
- Zona waktu campur (WIB vs UTC); telepon `+1` vs operasi Jakarta.
- Facility memakai fragment HTMX (`hx-get`) — interaksi nyata satu-satunya,
  jangan diporting 1:1 ke Next.js. Fast-link field-inspections berupa `div`
  klik tanpa anchor (tak accessible). Gembok LOTO `#4092` vs `#M-44`.
- Header tiap hub menduplikasi markup logo — wajib satu komponen `Logo`;
  varian putih/mark/favicon MISSING. Sub-tab asset-detail
  (`IoT Diagnostics`, `PM Schedules`, `Compliance & Docs`) dan tab
  `Templates & Forms` tampil tanpa konten.
