# UI Audit Pass-2 — Reports & Analytics Hub (`reports_analytics_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/reports_analytics_hub/code.html` (868 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Konsistensi rute global: `docs/ui-audit/navigation-audit.md` (§2: `/reports`).

## 1. Page Overview & UI Elements (Penjelasan Halaman)

### Tujuan utama

Hub BI operasional enterprise: akuntansi biaya maintenance (OPEX vs budget),
analisis telemetri MTTR/SLA, dan custom report builder OLAP untuk operasi
multi-fasilitas. Badge `BI ENGINE v4.6-OLAP` + `READ REPLICA: SYNCED`
menegaskan halaman ini dibaca dari replika analitik, bukan DB transaksional.
Alur: lihat KPI eksekutif → bedah tren/biaya/SLA → pilih dossier standar →
atau rakit query kustom → preview → generate & unduh.

### Daftar elemen UI utama

1. **Breadcrumb + hub header** — `Home / Governance & System / Reports & Analytics`;
   H1 `Reports & Analytics Hub`, badge `BI ENGINE v4.6-OLAP`,
   badge `READ REPLICA: SYNCED`, deskripsi BI/cost/MTTR/custom builder.
2. **Global action cluster** — `Schedule Automated Dispatch`,
   `Export Full PDF Dossier`, `+ Build Custom Query (SQL/Visual)`
   (`id="toggle-query-builder"`).
3. **KPI grid (4 kartu)** — `YTD Maintenance OPEX` `$1,428,650` (Cap
   `$1,490,000`, `-4.2% Under Budget`, `Healthy`, `Oracle ERP Sync: 4m ago`);
   `Fleet MTTR` `2.38 hours` (`-18m vs L30D Target`, `Optimal (≤3.0h)`,
   `94.6% First-Time Fix`, `+1.8% L7D`); `Fleet Availability & Uptime`
   `99.82% YTD` (`+0.14%`, `Tier-1: 100%`, `Unplanned: 14.2h / 412 assets`,
   `Zero fatal trips`); `Inventory Carrying Valuation` `$582,340`
   (`1,840 Active SKUs`, `Turns: 4.8x/yr`, `98.9% In-Stock`).
4. **Chart `Monthly OPEX vs Budget Variance` (7 kolom)** — SVG custom:
   bar OPEX (`JAN $292k`, `FEB $298k`, `MAR $275k`, `APR $280k`, `MAY $284k`),
   garis budget putus-putus `$305k/mo`, bar CapEx muda, `JUN (Est) ~$290k`
   (forecast, dashed), pill `May Actual $284k vs Budget $305k (-$21k favorable)`,
   legend 3 seri, footer `Total Tracked Runs: 4,892 WO lines`.
5. **Panel `Category Cost Allocation` (5 kolom)** — meter tersegmentasi +
   5 baris: `HVAC & CUP 42.0% $600,033`, `Electrical 24.0% $342,876`,
   `Fire & Life Safety 15.0% $214,297`, `Plumbing 11.0% $157,151`,
   `Elevators 8.0% $114,293`; tombol `tune`.
6. **Panel `Incident Resolution Velocity & SLA Compliance`** — badge
   `100% P1 COMPLIANCE`, `Sensor Telemetry Cycle: 60s`, 3 kartu gauge:
   `P1 Emergency 1.4h avg / Max 4.0h / 100% (42/42)`,
   `P2 Urgent 3.2h / Max 8.0h / 97.8% (184/188)`,
   `P3 Routine 5.1h / Max 24.0h / 99.4% (628/632)`.
7. **Tabel `Standard Operational Reports & Dossiers`** — filter klasifikasi
   (`All/Financial/Reliability/Workforce/Supply Chain`), tabel 6 kolom
   (Identifier & Title, Category, Last Generated, Cadence/Scope,
   Compliance Status, Quick Actions), 4 baris:
   `RPT-OPEX-2026-M05` (42 pages, GAAP/SOX, Monthly 1st, Marcus Vance),
   `RPT-REL-CHLR-004` (Chiller #04/Substation B/Boiler #02, ISO 55001, Weekly Mon 06:00 UTC),
   `RPT-WFM-SHIFT-02` (96 techs, 88.4% wrench, 0.00 TRIR, Bi-weekly),
   `RPT-INV-FIFO-91` (18 SKUs, FIFO, Monthly 15th, Kenji R.).
   Aksi per baris: Preview / PDF / XLSX / Schedule (`more_vert`).
8. **Panel `Custom Analytical Query & Report Builder` (`#query-builder-panel`)**
   — badge `OLAP CUBE`, status `Ready (Est ~84ms)`; 4 parameter:
   (1) Temporal (`Last 7 Days/L30D/Q1 2026/YTD 2026` + input
   `2026-01-01 -> 2026-05-18`), (2) Facility Scope
   (`HQ Campus - East Wing (Active)` + `412 Assets · 28 Zones`),
   (3) Dimension (`Asset Class / Failure ISO 14224 / Vendor / Cost Center / WO Type`),
   (4) Metric checkboxes (`Labor Hours/Parts Cost/Contractor Fees/SLA Exposure`,
   semua checked); Output radio (`PDF/XLSX/CSV-Parquet/HTMX Grid`);
   tombol `Run Simulation / Live Preview` (`#btn-preview-query`) dan
   `Generate & Download Dossier` (`#btn-generate-dossier`);
   preview tersembunyi (`#query-preview-result`, `#close-preview`) berisi
   SQL `telemetry_mart ... facility_id='HQ-EAST-NUSANTARA' ...`,
   `46ms · 412 Records`.
9. **Script inline** — toggle preview (hidden↔flex), simulasi generate
   (`Compiling OLAP Dossier...` 1200ms → `Dossier Ready (PDF)` → restore 2500ms).

### State UI

- **Empty state:** filter dossier tanpa hasil → pesan + `Reset`;
  query preview 0 records → tampilkan SQL + `0 Records` (saat ini hanya state sukses).
- **Loading state:** kartu KPI skeleton angka; chart shimmer; tabel skeleton 4 baris;
  tombol Generate spinner `sync` (sudah ada) — pertahankan tanpa ubah lebar tombol.
- **Error state:** replika lag → badge `READ REPLICA: STALE`; query gagal →
  toast destruktif + tombol `Retry`; export gagal → toast + job tetap `QUEUED`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path`, semua `href="#"`; target = rute usulan
`navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Reports & Analytics | `/reports` (halaman ini) |
| Sidebar 14 item lain | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/audit-logs`, `/notifications`, `/organization`, `/settings` |
| Breadcrumb `Home / Governance & System / Reports` | `Home` → `/`; grup bukan route |
| `Schedule Automated Dispatch` | Modal penjadwalan (job berulang; terkait `/reports/schedules`) — MISSING |
| `Export Full PDF Dossier` | `POST /api/v1/reports/executive-export` → unduh dossier (async job) |
| `+ Build Custom Query` | Scroll/toggle `#query-builder-panel` (tetap di halaman) |
| Baris dossier / Preview | Preview dossier (drawer/modal atau `/reports/[id]`) — MISSING |
| Aksi PDF / XLSX per baris | `GET /api/v1/reports/[id]/download?format=` (unduh langsung) |
| Aksi `more_vert` (Schedule) | Konfigurasi jadwal dossier — MISSING |
| `Run Simulation / Live Preview` | Inline preview (tetap di halaman) |
| `Generate & Download Dossier` | `POST /api/v1/reports/custom` → unduh (async job) |
| Ikon `notifications` (header) | `/notifications` |
| `+ New Dispatch / Request` (header) | Pola global tak terdefinisi — MISSING (lihat §3) |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Preview / detail dossier (MEDIUM)** — 4 tombol Preview per baris tidak punya
   tujuan; putuskan drawer preview vs route `/reports/[id]`.
   `// TODO: Create dossier preview (drawer) or detail route /reports/[id]`
2. **Penjadwalan dossier (MEDIUM)** — `Schedule Automated Dispatch` dan `more_vert`
   butuh halaman/modal `/reports/schedules` (cron, penerima, format).
   `// TODO: Create report schedule management for /reports/schedules`
3. **Target global `+ New Dispatch / Request` (MEDIUM)** — tombol header ada di
   semua hub tanpa tujuan seragam; sepakati command palette/modal kontekstual.
4. **Riwayat job export (LOW)** — tidak ada daftar job/dossier yang pernah
   di-generate (status, retry, kedaluwarsa unduhan).

**Temuan visual (dicatat, bukan diperbaiki diam-diam):** `screen.png` halaman ini
menyorot biru **`Audit Trail & Logs`**, bukan `Reports & Analytics` — salah sorot
nav pada screenshot referensi. Sidebar `code.html` sendiri benar
(`data-path="reports-and-analytics"` ada di 15 item identik).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + `tailwind.config` inline,
  font Inter + JetBrains Mono, ikon Material Symbols Outlined.
- Chart digambar manual sebagai SVG inline (gradient `budgetGrad`/`capexGrad`).
- Interaksi hanya JS vanilla (`getElementById`, `setTimeout`, class toggle).
- Tanpa framework/routing/fetch.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/reports`; typing `ReportDossier`, `OpexTrend`, `SlaVelocity`, `QuerySpec`. |
| **Tailwind CSS (build)** | Layout, KPI grid, tabel dossier, panel builder. Token sistem A. |
| **shadcn/ui** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Table`, `Tabs`, `Skeleton`, `Toast`, `Dialog/Drawer` | Kartu KPI, badge compliance, tabel dossier, form builder, preview drawer, skeleton, toast. |
| **lucide-react** | Pengganti Material Symbols (payments, speed, verified, inventory, tune, pdf, table). |
| **Recharts** (atau ECharts) | Gantikan SVG manual: grouped bar OPEX vs budget + garis budget + forecast JUN; tooltip + responsif. |
| **SWR / TanStack Query** | Fetch KPI/tren/alokasi/velocity/dossier + polling ringan status job export. |
| **axios** (atau fetch + ky) | HTTP client `/api/v1`, interceptor auth. |
| **date-fns** | Format `Today 08:00 UTC`, `May 14, 2026`, rentang kustom. |
| **zod + react-hook-form** | Validasi QuerySpec (rentang, facility, dimensi, metrik, format). |
| **file-saver / polling job** | Unduh dossier via `downloadUrl` + polling status job async. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Response `{ data, meta }`, error `{ error: { code, message } }`.

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/reports/kpi-summary` | Ringkasan 4 KPI (OPEX, MTTR, availability, inventory) + sinkronisasi ERP | On page load + filter scope berubah |
| GET | `/api/v1/reports/opex-trend` | Tren OPEX vs budget per bulan + forecast + total WO lines | On page load + ganti tahun/facility |
| GET | `/api/v1/reports/cost-allocation` | Alokasi biaya per kategori (5 subsistem) | On page load |
| GET | `/api/v1/reports/sla-velocity` | Rata-rata resolusi + kepatuhan per prioritas P1–P3 | On page load (poll lambat 60s) |
| GET | `/api/v1/reports/dossiers` | Daftar 4 dossier standar + filter klasifikasi | On page load + ganti filter |
| GET | `/api/v1/reports/:id/download?format=pdf\|xlsx` | Unduh dossier standar | On click aksi PDF/XLSX per baris |
| POST | `/api/v1/reports/custom/preview` | Simulasi query OLAP → SQL + row count + estimasi ms | On click `Run Simulation / Live Preview` |
| POST | `/api/v1/reports/custom` | Generate dossier kustom (async job) | On click `Generate & Download Dossier` |
| GET | `/api/v1/reports/jobs/:jobId` | Status job generate (queued/ready/failed + downloadUrl) | Polling setelah generate |
| POST | `/api/v1/reports/executive-export` | Export dossier eksekutif penuh (async job) | On click `Export Full PDF Dossier` |
| POST | `/api/v1/reports/schedules` | Buat jadwal dispatch otomatis dossier | On submit `Schedule Automated Dispatch` |
| GET | `/api/v1/facilities` | Opsi Facility Scope builder (412 assets/28 zones) | On page load (builder) |

Contoh fetch:

```ts
// TODO: Replace preview mock with POST /api/v1/reports/custom/preview
const res = await fetch("/api/v1/reports/custom", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    dateRange: { from: "2026-01-01", to: "2026-05-18" },
    facilityId: "hq-east-nusantara",
    dimension: "ASSET_CLASS",
    metrics: ["LABOR_HOURS", "PARTS_COST", "CONTRACTOR_FEES", "SLA_EXPOSURE"],
    format: "PDF",
  }),
});
const { data } = await res.json(); // { data: { jobId: "RPT-9912", status: "QUEUED" } }
```

```ts
// TODO: Replace trend mock with GET /api/v1/reports/opex-trend?fiscalYear=2026
import axios from "axios";
const { data } = await axios.get("/api/v1/reports/opex-trend", {
  params: { fiscalYear: 2026, facilityId: "hq-east-nusantara" },
});
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/reports.mock.ts`; binding via komponen; tiap blok ber-`// TODO`.

```ts
// TODO: Replace kpi mock with GET /api/v1/reports/kpi-summary
export const reportsKpi = {
  opexYtd: 1428650, opexCap: 1490000, opexDeltaPct: -4.2,
  erpSyncAgo: "4m ago", mttrHours: 2.38, mttrTarget: 3.0,
  firstTimeFix: 0.946, availabilityYtd: 0.9982, unplannedHours: 14.2,
  assetCount: 412, inventoryValue: 582340, activeSkus: 1840,
  stockTurns: 4.8, inStockPct: 0.989,
};

// TODO: Replace trend mock with GET /api/v1/reports/opex-trend?fiscalYear=2026
export const opexTrend = {
  budgetPerMonth: 305000,
  bars: [
    { month: "JAN", actual: 292000 }, { month: "FEB", actual: 298000 },
    { month: "MAR", actual: 275000 }, { month: "APR", actual: 280000 },
    { month: "MAY", actual: 284000 }, { month: "JUN", forecast: 290000 },
  ],
  totalWoLines: 4892,
};

// TODO: Replace allocation mock with GET /api/v1/reports/cost-allocation
export const costAllocation = [
  { category: "HVAC & CUP", pct: 42.0, amount: 600033 },
  { category: "Electrical", pct: 24.0, amount: 342876 },
  { category: "Fire & Safety", pct: 15.0, amount: 214297 },
  { category: "Plumbing", pct: 11.0, amount: 157151 },
  { category: "Elevators", pct: 8.0, amount: 114293 },
];

// TODO: Replace velocity mock with GET /api/v1/reports/sla-velocity
export const slaVelocity = [
  { priority: "P1", avgH: 1.4, maxH: 4.0, met: 42, total: 42 },
  { priority: "P2", avgH: 3.2, maxH: 8.0, met: 184, total: 188 },
  { priority: "P3", avgH: 5.1, maxH: 24.0, met: 628, total: 632 },
];

// TODO: Replace dossiers mock with GET /api/v1/reports/dossiers
export const dossiers = [
  { id: "RPT-OPEX-2026-M05", title: "Comprehensive Maintenance Cost & Variance Ledger", category: "Financial & OPEX", cadence: "Monthly (1st)", compliance: "GAAP / SOX Compliant", generatedBy: "Marcus Vance (VP Ops)" },
  { id: "RPT-REL-CHLR-004", title: "Asset Health, Telemetry & Critical Downtime Dossier", category: "Reliability Engineering", cadence: "Weekly Mon 06:00 UTC", compliance: "ISO 55001 Aligned" },
  { id: "RPT-WFM-SHIFT-02", title: "Technician Field Productivity & Labor Utilization", category: "Workforce Operations", cadence: "Bi-weekly", compliance: "0.00 TRIR Safety Zero" },
  { id: "RPT-INV-FIFO-91", title: "Spare Parts Inventory Valuation & Dead Stock Audit", category: "Supply Chain & Crib", cadence: "Monthly (15th)", compliance: "Reconciled Ledger" },
];

// TODO: Replace builder defaults with controlled form state validated by zod
export const queryBuilderDefaults = {
  range: "YTD_2026", from: "2026-01-01", to: "2026-05-18",
  facilityId: "hq-east-nusantara", dimension: "ASSET_CLASS",
  metrics: ["LABOR_HOURS", "PARTS_COST", "CONTRACTOR_FEES", "SLA_EXPOSURE"],
  format: "PDF" as const,
};
```

Contoh binding:

```tsx
// TODO: Replace dossiers mock with useSWR('/api/v1/reports/dossiers', fetcher)
import { dossiers } from "@/mocks/reports.mock";

export function DossierTable() {
  return (
    <Table>
      <TableBody>
        {dossiers.map((d) => (
          <TableRow key={d.id}>
            <TableCell className="font-mono font-semibold">{d.id}</TableCell>
            <TableCell>{d.title}</TableCell>
            <TableCell><Badge>{d.compliance}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// TODO: Create dossier preview (drawer) or detail route /reports/[id]
```

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Screenshot salah sorot nav.** Pass-1 (`docs/ui-audit/reports.md` §3) menyatakan
  `screen.png` menyorot `Audit Trail & Logs`, bukan `Reports & Analytics`.
  Pass-2 memverifikasi ulang dari `screen.png`: benar, item biru adalah
  `Audit Trail & Logs`. Sidebar `code.html` sendiri benar
  (`data-path="reports-and-analytics"` ada di 15 item identik).
- **Angka seed konsisten.** Pass-1 mencatat `4,892 WO lines` / `412 assets` /
  `1,840 SKUs` cocok dengan settings. Pass-2 menemukan angka yang sama di tiga
  titik independen (footer chart, kartu Inventory, panel builder
  `412 Assets · 28 Zones`) — konfirmasi kuat untuk kanonisasi seed.
- **Struktur 4 dossier + 4 aksi** (Preview/PDF/XLSX/Schedule) dan **builder
  4 langkah + SQL `telemetry_mart` + 46ms/412 records** identik di kedua pass.

### (b) Temuan BARU yang luput di pass-1

- **Detail timing simulasi JS:** status `Ready (Est ~84ms)`, generate
  `Compiling OLAP Dossier...` 1200ms → `Dossier Ready (PDF)` → restore 2500ms,
  dan `id` elemen (`toggle-query-builder`, `btn-preview-query`,
  `btn-generate-dossier`, `query-preview-result`, `close-preview`) — berguna
  sebagai selector e2e test, tidak dicatat pass-1.
- **Format output ke-4 `Live HTMX Data Grid`** dan kolom `Cadence/Scope`
  per baris (Monthly 1st / Weekly Mon 06:00 UTC / Bi-weekly / Monthly 15th)
  tidak dirinci pass-1.
- **Aktor per dossier** (Marcus Vance, Telemetry Daemon, Sarah K., Kenji R.)
  sebagai bibit relasi `generatedBy` — luput di pass-1.

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Perbedaan pemodelan API
  (pass-1: `/reports`, `/reports/:id/export`, `/report-jobs/:jobId`;
  pass-2: `/reports/dossiers`, `/reports/:id/download`, `/reports/custom/*`)
  adalah pilihan penamaan setara, bukan kesalahan — samakan salah satu saat
  kontrak final. Klaim pass-1 "MTTR 2.38 vs 2.4 selisih pembulatan" dan
  "kategori pas 100%" tidak diverifikasi ulang di pass-2, jadi tetap berlaku
  apa adanya dari pass-1.
