# UI Audit — Reports & Analytics Hub (`reports_analytics_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/reports_analytics_hub/code.html` (868 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/reports`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Reports & Analytics Hub** adalah pusat business intelligence operasional:
menggabungkan cost accounting (OPEX vs budget), telemetri keandalan (MTTR, availability),
kepatuhan SLA per prioritas, dossier laporan standar terjadwal, dan **custom query
builder OLAP** dalam satu layar. Badge `BI ENGINE v4.6-OLAP` dan
`READ REPLICA: SYNCED` menegaskan halaman ini membaca dari replika analitik, bukan
database transaksional — keputusan arsitektur yang tepat untuk query berat.

Alur kerja yang didukung: pantau KPI eksekutif → analisis tren/varians → telusur
kepatuhan SLA → unduh/jadwalkan dossier standar → susun query ad-hoc → preview
simulasi → generate dossier (PDF/XLSX/CSV/HTMX grid).

### Daftar elemen UI utama

1. **Breadcrumb + hub header** — `Home / Governance & System / Reports & Analytics`,
   H1 `Reports & Analytics Hub`, badge `BI ENGINE v4.6-OLAP`, badge
   `READ REPLICA: SYNCED`, deskripsi BI lintas fasilitas.
2. **Global action cluster** — `Schedule Automated Dispatch` (secondary),
   `Export Full PDF Dossier` (secondary), `+ Build Custom Query (SQL/Visual)`
   (primary, id `toggle-query-builder`).
3. **KPI grid eksekutif (4 kartu)** — `YTD Maintenance OPEX` (`$1,428,650`,
   `-4.2% Under Budget`, Cap `$1,490,000`, `Oracle ERP Sync: 4m ago`);
   `Fleet Mean Time to Repair` (`2.38 hours`, `-18m vs L30D Target`,
   `94.6% First-Time Fix Rate`); `Fleet Availability & Uptime` (`99.82% YTD`,
   `Unplanned: 14.2h / 412 assets`, `Zero fatal trips`); `Inventory Carrying
   Valuation` (`$582,340`, `1,840 Active SKUs`, `Turns: 4.8x/yr`,
   `98.9% In-Stock`).
4. **Chart `Monthly OPEX vs Budget Variance`** (7 kolom) — grouped bar SVG
   (Actual OPEX navy, CapEx terang) Jan–Mei + `JUN (Est)` proyeksi hijau,
   garis budget dashed `$305k/mo`, anotasi `May Actual $284k vs Budget $305k
   (-$21k favorable)`, badge `FY 2026`, footer `Total Tracked Runs: 4,892 WO lines`.
5. **Panel `Category Cost Allocation`** (5 kolom) — segmented meter
   (HVAC & CUP 42% `$600,033`; Electrical 24% `$342,876`; Fire & Life Safety 15%
   `$214,297`; Plumbing 11% `$157,151`; Elevators 8% `$114,293`) + tombol `tune`.
6. **Panel `Incident Resolution Velocity & SLA Compliance`** — badge
   `100% P1 COMPLIANCE`, `Sensor Telemetry Cycle: 60s`, tiga kartu gauge:
   P1 `1.4 hrs avg` / SLA 4.0h / `100% Met (42 / 42 tickets)`;
   P2 `3.2 hrs` / 8.0h / `97.8% Met (184 / 188)`;
   P3 `5.1 hrs` / 24.0h / `99.4% Met (628 / 632)`.
7. **Tabel `Standard Operational Reports & Dossiers`** — filter klasifikasi
   (Financial & OPEX, Reliability Engineering, Workforce Operations, Supply Chain),
   4 baris dossier (`RPT-OPEX-2026-M05` 42 pages GAAP/SOX;
   `RPT-REL-CHLR-004` ISO 55001; `RPT-WFM-SHIFT-02` TRIR Zero;
   `RPT-INV-FIFO-91` Reconciled Ledger) dengan kolom kategori, last generated,
   cadence, compliance badge, dan 4 aksi per baris (Preview `visibility`,
   PDF `picture_as_pdf`, XLSX `table_view`, Schedule `more_vert`).
8. **Panel `Custom Analytical Query & Report Builder`** (id `query-builder-panel`,
   badge `OLAP CUBE`, status `Ready (Est Execution: ~84ms)`) — 4 langkah:
   Temporal Scope (preset Last 7D / L30D / Q1 2026 / YTD 2026 + input range
   `2026-01-01 -> 2026-05-18`), Facility Scope (select + `412 Assets · 28 Zones`),
   Primary Aggregation Dimension (Asset Class / Failure Code ISO 14224 / Vendor
   Tier / Cost Center & GL / WO Type), Metric Telemetry Inclusion (4 checkbox:
   Labor Hours, Parts Cost, Contractor Fees, SLA Exposure); footer Output Format
   (radio PDF / XLSX / CSV-Parquet / Live HTMX Grid) + tombol
   `Run Simulation / Live Preview` (id `btn-preview-query`) dan
   `Generate & Download Dossier` (id `btn-generate-dossier`); area preview
   tersembunyi (id `query-preview-result`) menampilkan `Query Executed in 46ms ·
   412 Records Processed` + statement SQL `telemetry_mart`.
9. **Script inline** — toggle preview box, simulasi tombol generate
   (`Compiling OLAP Dossier...` → `Dossier Ready (PDF)` → restore, via `setTimeout`).

### State UI

- **Empty state:** dossier kosong → pesan "Belum ada dossier pada klasifikasi ini" +
  tombol `Build Custom Query`; chart tanpa data → sumbu + "Belum ada data pada
  rentang ini"; preview query 0 records → tampilkan SQL + "0 records — longgarkan filter".
- **Loading state:** kartu KPI memakai `Skeleton` angka; chart memakai shimmer bar;
  tabel dossier 4 baris skeleton; tombol generate menampilkan spinner
  (`Compiling OLAP Dossier...`) tanpa mengubah lebar tombol.
- **Error state:** badge replika berubah `REPLICA LAG` bila sync basi; query gagal →
  toast destruktif + tampilkan SQL yang gagal; export gagal → toast + job tetap
  `FAILED` dengan tombol `Retry`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path`, header dengan
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di bawah
adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Reports & Analytics (aktif) | `/reports` (halaman ini) |
| Sidebar: 14 item lain | Route §2 `navigation-audit.md` (`/operations`, `/work-orders`, …, `/settings`) |
| Breadcrumb `Home / Governance & System / Reports & Analytics` | `Home` → `/`; grup Governance bukan route |
| `Schedule Automated Dispatch` | Modal/drawer jadwal kirim dossier (tetap di halaman; bukan navigasi) — MISSING (target tak terdefinisi) |
| `Export Full PDF Dossier` | Async job → unduh dossier gabungan (tetap di halaman + toast sukses) |
| `+ Build Custom Query (SQL/Visual)` | Scroll/toggle ke `#query-builder-panel` (anchor inline, bukan navigasi) |
| Baris dossier / `Preview Dossier` (`visibility`) | Pratinjau PDF inline atau `/reports/[id]` — MISSING (halaman detail dossier belum ada) |
| `Export PDF / XLSX` per baris | Unduh file (aksi, bukan navigasi) |
| `Schedule Configuration` (`more_vert`) per baris | Menu konteks → editor jadwal kirim — MISSING (drawer konfigurasi jadwal) |
| `Run Simulation / Live Preview` | Panel preview inline (`#query-preview-result`) |
| `Generate & Download Dossier` | Async job → unduh file (aksi) |
| `tune` (Category Cost Allocation) | Drawer filter dimensi alokasi — MISSING (parsial, lihat §3) |
| Ikon `notifications` (header) | `/notifications` |
| `+ New Dispatch / Request` (header) | Target global tak terdefinisi — MISSING (lihat `navigation-audit.md` §4 item 7) |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/reports/[id]` — halaman detail/pratinjau dossier (MEDIUM).** Tombol
   `visibility` Preview di tiap baris tidak punya tujuan; produksi butuh viewer
   (ringkasan parameter, riwayat generasi, daftar ekspor) atau minimal modal
   preview PDF yang disepakati.
   `// TODO: Create detail page routing for /reports/[id]`
2. **Drawer schedule configuration (MEDIUM).** `Schedule Automated Dispatch`
   dan menu `more_vert` per baris menggantung tanpa editor jadwal (cron, penerima,
   format, zona waktu). Usulan: satu drawer `ReportScheduleEditor` dipakai ulang.
   `// TODO: Create schedule editor drawer for report dossiers`
3. **Drawer filter dimensi alokasi (LOW).** Tombol `tune` di Category Cost
   Allocation tidak membuka apa pun.
   `// TODO: Create allocation dimension filter drawer`
4. **Target global `+ New Dispatch / Request` (MEDIUM).** Sama seperti 15 halaman
   lain — putuskan pola global (command palette / modal kontekstual).
5. **Global search (LOW).** Hanya ada filter klasifikasi lokal; tidak ada `⌘K`
   lintas entitas (termasuk pencarian `RPT-*`).

**Temuan (jangan diam-diam diperbaiki):**

- **Screenshot salah sorot nav.** Pada `screen.png`, item sidebar yang disorot biru
  adalah `Audit Trail & Logs`, bukan `Reports & Analytics` — artefak pengambilan
  screenshot Stitch, bukan desain. Breadcrumb dan H1 sudah benar.
- **Angka konsisten lintas hub (positif).** `4,892 WO lines`, `412 assets`,
  `1,840 SKUs` sama persis dengan seed stats di `settings_system_configuration`
  dan badge lain — jadikan kontrak seed kanonis saat rebuild.
- **MTTR nyaris konsisten.** Di sini `2.38h`, di operations dashboard `2.4h` —
  selisih pembulatan, bukan bug; normalisasi ke satu sumber (`summary.mttrHours`).
- Kategori alokasi pas 100% (42+24+15+11+8) — valid.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN**
  (`https://cdn.tailwindcss.com`) + config inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/angka),
  ikon **Material Symbols Outlined**.
- Chart digambar manual sebagai **SVG inline** (gradient, bar, dashed path).
- Interaksi hanya JS vanilla (`getElementById`, `setTimeout` simulasi).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/reports` + (opsional) `/reports/[id]`; typing `ReportDossier`, `OpexTrend`, `SlaCompliance`. |
| **Tailwind CSS (build, bukan CDN)** | Styling seluruh layout; token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Tabs`, `Table`, `Skeleton`, `Toast`, `Sheet`, `DropdownMenu` | Kartu KPI, badge compliance, radio format output, tabel dossier, skeleton, toast job, drawer schedule/filter. |
| **lucide-react** | Pengganti Material Symbols (payments, speed, verified, inventory, query_stats, pdf/xlsx icons). |
| **Recharts** (atau ECharts bila data besar) | Menggantikan SVG manual: grouped bar OPEX vs budget + garis budget + anotasi; segmented allocation bisa tetap div-based. |
| **SWR atau TanStack Query** | Fetch KPI/trend/alokasi/SLA + polling ringan status replika; `useMutation` untuk generate/export dengan status job. |
| **axios** (atau `fetch` + `ky`) | HTTP client, base URL `/api/v1`, interceptor auth. |
| **date-fns** | Format `Last Generated` (`Today, 08:00 UTC`), rentang temporal, cadence. |
| **Intl.NumberFormat** | Format `$1,428,650`, `99.82%`, angka tabular. |
| **zod + react-hook-form** | Validasi form query builder (rentang tanggal valid, ≥1 metrik dipilih, format output). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Response dibungkus `{ data, meta }`,
error memakai `{ error: { code, message } }`; export/generate bersifat async
(`202 Accepted` → polling status job).

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/reports/kpi-summary` | On page load | Response: `{ "data": { "ytdOpex": 1428650, "opexCap": 1490000, "opexDeltaPct": -4.2, "erpSyncedAt": "2026-05-18T...", "mttrHours": 2.38, "mttrDeltaMin": -18, "firstTimeFixRate": 0.946, "availabilityYtd": 0.9982, "unplannedHours": 14.2, "assetCount": 412, "inventoryValue": 582340, "activeSkus": 1840, "stockTurns": 4.8, "criticalCoverage": 0.989, "replica": { "status": "SYNCED" } } }` |
| GET | `/api/v1/reports/opex-trend` | On page load | Query: `?fiscalYear=2026`. Response: `{ "data": { "months": [{ "label": "JAN", "actual": 292000, "capex": 45000 }], "budgetPerMonth": 305000, "forecast": [{ "label": "JUN (Est)", "actual": 290000 }] } }` |
| GET | `/api/v1/reports/cost-allocation` | On page load + filter `tune` | Response: `{ "data": [{ "category": "HVAC & CUP", "amount": 600033, "pct": 42.0 }, { "category": "Electrical", "amount": 342876, "pct": 24.0 }] }` |
| GET | `/api/v1/reports/sla-compliance` | On page load (poll lambat 60s) | Response: `{ "data": [{ "priority": "P1", "avgHours": 1.4, "slaHours": 4.0, "met": 42, "total": 42 }] }` |
| GET | `/api/v1/reports` | On page load + filter klasifikasi | Query: `?classification=financial&page=1`. Response: `{ "data": [{ "id": "RPT-OPEX-2026-M05", "title": "Comprehensive Maintenance Cost & Variance Ledger", "pages": 42, "category": "FINANCIAL_OPEX", "lastGeneratedAt": "...", "generatedBy": "Marcus Vance (VP Ops)", "cadence": "MONTHLY", "compliance": "GAAP_SOX" }], "meta": { "total": 4 } }` |
| GET | `/api/v1/reports/:id/preview` | On click Preview `visibility` | Response: `{ "data": { "id": "RPT-OPEX-2026-M05", "previewUrl": "/reports/RPT-OPEX-2026-M05/preview.pdf" } }` |
| POST | `/api/v1/reports/:id/export` | On click Export PDF/XLSX per baris | Body: `{ "format": "PDF" }`. Response: `{ "data": { "jobId": "EXP-5510", "status": "QUEUED" } }` |
| GET | `/api/v1/report-jobs/:jobId` | Polling status export/generate | Response: `{ "data": { "jobId": "EXP-5510", "status": "READY", "downloadUrl": "/reports/EXP-5510.pdf" } }` |
| POST | `/api/v1/reports/query/preview` | On click `Run Simulation / Live Preview` | Body: `{ "dateFrom": "2026-01-01", "dateTo": "2026-05-18", "facilityScope": "HQ-EAST", "dimension": "ASSET_CLASS", "metrics": ["LABOR_HOURS","PARTS_COST","CONTRACTOR_FEES","SLA_EXPOSURE"] }`. Response: `{ "data": { "sql": "SELECT ... FROM telemetry_mart ...", "elapsedMs": 46, "records": 412, "rows": [] } }` |
| POST | `/api/v1/reports/query/generate` | On click `Generate & Download Dossier` | Body: sama + `{ "format": "PDF" }`. Response: `{ "data": { "jobId": "RPT-9913", "status": "QUEUED" } }` |
| POST | `/api/v1/reports/schedules` | On submit `Schedule Automated Dispatch` | Body: `{ "reportId": "RPT-OPEX-2026-M05", "cron": "0 6 1 * *", "format": "PDF", "recipients": ["vp-ops@..."] }`. Response: `{ "data": { "scheduleId": "SCH-201" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/reports.mock.ts`. Setiap blok berkomentar `// TODO`
dengan endpoint penggantinya.

```ts
// TODO: Replace kpiSummary mock with GET /api/v1/reports/kpi-summary
export const kpiSummary = {
  ytdOpex: 1428650, opexCap: 1490000, opexDeltaPct: -4.2,
  mttrHours: 2.38, firstTimeFixRate: 0.946,
  availabilityYtd: 0.9982, unplannedHours: 14.2, assetCount: 412,
  inventoryValue: 582340, activeSkus: 1840, stockTurns: 4.8,
  replica: { status: "SYNCED" },
};

// TODO: Replace opexTrend mock with GET /api/v1/reports/opex-trend?fiscalYear=2026
export const opexTrend = {
  budgetPerMonth: 305000,
  months: [
    { label: "JAN", actual: 292000 }, { label: "FEB", actual: 298000 },
    { label: "MAR", actual: 275000 }, { label: "APR", actual: 280000 },
    { label: "MAY", actual: 284000 }, { label: "JUN (Est)", actual: 290000, forecast: true },
  ],
};

// TODO: Replace allocation mock with GET /api/v1/reports/cost-allocation
export const costAllocation = [
  { category: "HVAC & CUP", amount: 600033, pct: 42.0 },
  { category: "Electrical", amount: 342876, pct: 24.0 },
  { category: "Fire & Life Safety", amount: 214297, pct: 15.0 },
  { category: "Plumbing", amount: 157151, pct: 11.0 },
  { category: "Elevators", amount: 114293, pct: 8.0 },
];

// TODO: Replace slaCompliance mock with GET /api/v1/reports/sla-compliance
export const slaCompliance = [
  { priority: "P1", avgHours: 1.4, slaHours: 4.0, met: 42, total: 42 },
  { priority: "P2", avgHours: 3.2, slaHours: 8.0, met: 184, total: 188 },
  { priority: "P3", avgHours: 5.1, slaHours: 24.0, met: 628, total: 632 },
];

// TODO: Replace dossiers mock with GET /api/v1/reports
export const dossiers = [
  { id: "RPT-OPEX-2026-M05", title: "Comprehensive Maintenance Cost & Variance Ledger", category: "FINANCIAL_OPEX", compliance: "GAAP_SOX", cadence: "Monthly Automated (1st of month)" },
  { id: "RPT-REL-CHLR-004", title: "Asset Health, Telemetry & Critical Downtime Dossier", category: "RELIABILITY", compliance: "ISO_55001" },
  { id: "RPT-WFM-SHIFT-02", title: "Technician Field Productivity & Labor Utilization", category: "WORKFORCE", compliance: "TRIR_ZERO" },
  { id: "RPT-INV-FIFO-91", title: "Spare Parts Inventory Valuation & Dead Stock Audit", category: "SUPPLY_CHAIN", compliance: "RECONCILED" },
];

// TODO: Create detail page routing for /reports/[id] (preview target belum ada)
// TODO: Create schedule editor drawer for report dossiers (dipakai Schedule Automated Dispatch + menu more_vert)
```

Contoh binding (ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/reports', fetcher)
import { dossiers } from "@/mocks/reports.mock";

export function DossierTable() {
  return (
    <Table>
      <TableBody>
        {dossiers.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-mono font-bold">{r.id}</TableCell>
            <TableCell>{r.title}</TableCell>
            <TableCell><Badge>{r.compliance}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian mock → API: hapus satu blok mock per endpoint yang sudah live,
ganti dengan `useSWR` + `Skeleton` saat `isLoading` + `Toast` saat `error`;
job async (export/generate) dipoll via `GET /api/v1/report-jobs/:jobId` hingga
`READY`, lalu tampilkan tombol unduh.
