# UI Audit — Operations Dashboard (`operations_dashboard`)

> Sumber: `stitch_facility_maintenance_platform_ui/operations_dashboard/code.html` (750 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13; dimigrasi ke template v2 (Architect) 2026-09-13.
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Operations & Facility Control Center** adalah command center dispatch:
memantau telemetri fasilitas real-time, kepatuhan SLA maintenance, dan antrean
dispatch teknisi lintas **4 regional site** dalam satu layar. Judul memakai badge
`LIVE DISPATCH` dan indikator `Telemetry Ingestion: 99.98% Healthy, Latency 18ms`,
sehingga halaman ini dibaca sebagai "layar yang selalu hidup", bukan laporan statis.

Alur kerja yang didukung: lihat KPI → deteksi anomali (overdue, chiller trip,
stok kritis) → filter/scope → aksi cepat (buat WO, dispatch specialist,
auto-assign, expedite SKU) → pantau log hidup dan roster shift.

### Daftar elemen UI utama

1. **Breadcrumb + telemetry badge** — `Home / Operations / Operations Dashboard`
   + status ingestion (dot ping hijau, `% healthy`, latency).
2. **Title & action cluster** (card) — H1 `Operations & Facility Control Center`,
   sub-deskripsi 4 site, badge `LIVE DISPATCH`, tombol `Export Executive Report
   (PDF/XLSX)` (secondary) dan `+ Quick Create Work Order` (primary).
3. **Quick filter & scope rail** — pill rentang waktu (`Today`, `Last 7 Days`,
   `Month-to-Date`, `Quarter`), dropdown `Facility` (All Sites + 4 hub:
   Tower A, Plant 2, Logistics Yard, Data Center Delta), dropdown `Shift`
   (A/B/C), tombol refresh.
4. **KPI metric grid (8 kartu)** — `Open Work Orders` (42), `Overdue Work Orders`
   (5, aksen merah + `SLA Breached`), `Mean Time to Repair` (2.4h),
   `PM Compliance` (94.2% + progress bar), `Stock Reorder Alerts` (14 SKU),
   `Monthly Opex Spend` ($84.25k / budget $105k), `Fleet Downtime` (0.82%,
   MTBF 420h), `Vendor SLA Adherence` (96.8%). Tiap kartu: label caps, ikon,
   angka metric-display tabular, strip delta/konteks.
5. **Chart card `Facility Downtime & Operational Cost Trend`** — tab view
   (`Cost vs Budget`, `Downtime Incidents`, `Energy Consumption`), chart area+line
   SVG custom (garis spend biru, garis downtime merah putus-putus, anotasi
   `Chiller Trip: $4.2k`), label sumbu-X mingguan Okt, breakdown 4 kategori
   (HVAC $38.4k, Electrical $24.15k, Plumbing $12.3k, Conveyors $9.4k).
6. **Tabel `Priority & Critical Dispatch Queue`** — toolbar (pulse merah,
   badge `5 SLA Breaches`, search, tombol Filter), tabel 8 kolom
   (`WO Code`, `Priority`, `Asset & Facility Location`, `Issue Summary`,
   `Lead Tech / Vendor`, `SLA Clock`, `Status`, `Quick Action`), 4 baris contoh
   (2× P1-CRITICAL breach, 2× P2-HIGH aktif), footer pagination
   (`Showing 4 of 42`, Previous/1/Next). Aksi per baris: `Dispatch Specialist`,
   `Expedite SKU`, `Reassign`, `Auto-Assign`.
7. **Panel `Asset Health Index`** — 4 unit (Central Chiller #03 48% CRITICAL,
   Backup Generator 2B 62% ATTENTION, Substation TX-1 99% OPTIMAL,
   Cleanroom AHU-04 98% OPTIMAL), masing-masing: ikon status, deskripsi,
   progress bar berwarna.
8. **Panel `Operational Live Log`** — feed vertikal (rail + node), badge
   `Poll: 5s`, 4 event (konsumsi parts, alarm SCADA IoT, approval PO-8821,
   audit vendor Passed) dengan aktor, timestamp relatif, referensi mono
   (`[WO-...]`, `[AST-...]`, `PO-8821`).
9. **Panel `Active Shift Roster`** — badge `Shift A`, ringkasan
   (9 Dispatched, 3 Ready), chip teknisi (T. Chen on WO-0901, M. Kowalski standby,
   A. Wijaya break).
10. **Footer banner operasional** — countdown PM dispatch (`48 minutes, 14:00`),
    status infra (`Node-01A Primary`, `1,420 msgs/sec`), link
    `View System Diagnostic Logs`.

### State UI

- **Empty state:** hasil filter queue kosong → tampilkan ilustrasi + teks
  "Tidak ada work order pada filter ini" + tombol `Reset Filter`; chart tanpa
  data → sumbu + pesan "Belum ada data pada rentang ini"; live log kosong →
  "Menunggu event pertama"; roster shift tanpa teknisi → "Belum ada teknisi terjadwal".
- **Loading state:** kartu KPI memakai `Skeleton` angka + bar; chart memakai
  shimmer area; tabel memakai 4–6 baris skeleton (kode WO, badge, avatar);
  panel health/log/roster memakai skeleton list. Tombol refresh dan
  `Quick Create` menampilkan spinner inline (`htmx-request`-style) tanpa
  mengubah lebar tombol.
- **Error state:** badge ingestion berubah merah (`Telemetry Degraded`,
  latency `-`); chart gagal → pesan + tombol `Retry`; SLA clock basi
  (>60s tanpa poll) → tampilkan `STALE` di samping waktu; aksi dispatch gagal →
  toast destruktif + baris tetap pada status semula.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman ini memakai shell desktop global (sidebar 15 `data-path`, header dengan
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di bawah
adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Operations Dashboard (aktif) | `/operations` (halaman ini) |
| Sidebar: Work Orders / Service Requests / PM / Inspections / … (14 item) | `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` |
| Breadcrumb `Home / Operations / Operations Dashboard` | `Home` → `/` (landing atau `/operations`); `Operations` → grup, bukan route |
| `+ Quick Create Work Order` | Modal `POST /api/v1/work-orders` (tetap di halaman; bukan navigasi) |
| `Export Executive Report (PDF/XLSX)` | Async job → unduh dossier (terkait `/reports`) |
| Baris tabel dispatch / WO Code | `/work-orders/[id]` — MISSING (dead-end utama) |
| Aksi baris: Dispatch / Reassign / Auto-Assign / Expedite | Aksi API inline, tetap di halaman |
| `View System Diagnostic Logs` | `/audit-logs` |
| Filter rail (time range, Facility, Shift) + pagination | Query params (`?timeRange=&facilityId=&shift=&page=`), bukan navigasi |
| Ikon `notifications` (header) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — seluruh baris antrean dispatch tidak punya
   halaman tujuan; target wajib pertama.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Target global `+ New Dispatch / Request` (MEDIUM)** — di halaman ini
   tombol membuka modal Quick Create WO, tetapi perilaku tombol yang sama di
   15 halaman lain tak terdefinisi; putuskan pola global (command palette /
   modal kontekstual).
3. **Global search (LOW)** — hanya ada search lokal di toolbar tabel; tidak ada
   `⌘K` lintas entitas (WO/AST/SKU/PO).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN**
  (`https://cdn.tailwindcss.com`) + `tailwind.config` inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/telemetri),
  ikon **Material Symbols Outlined**.
- Chart digambar manual sebagai **SVG inline** (polygon/polyline/circle/text).
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Satu route `/operations` merender komposisi server/client component; typing untuk `WorkOrder`, `AssetHealth`, `KpiSummary`. |
| **Tailwind CSS (build, bukan CDN)** | Styling seluruh layout, grid 12 kolom, kartu, tabel dense. Token warna diambil dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Table`, `Progress`, `Avatar`, `Skeleton`, `ScrollArea`, `Toast` | Komponen dasar: kartu KPI, badge prioritas/status, toolbar filter, tab chart, tabel dispatch, progress health/PM, avatar teknisi, skeleton loading, toast aksi. |
| **lucide-react** | Pengganti Material Symbols agar tree-shakeable dan konsisten (ikon assignment, timer, payments, search, tune, health, rss, engineering). |
| **Recharts** (atau ECharts bila data besar) | Menggantikan SVG manual untuk line/area chart spend vs downtime + anotasi; mendukung tooltip, responsif, dan tab view. |
| **SWR atau TanStack Query** | Polling `Live Log` tiap 5s, refresh KPI/table dengan `staleTime` + penanda `STALE`; deduplikasi request filter. |
| **axios** (atau `fetch` + `ky`) | HTTP client dengan interceptor auth + base URL `/api/v1`. |
| **date-fns + date-fns-tz** | Format `SLA Clock` (`-01:42:15 BREACH` / `01:14:30 LEFT`), timestamp relatif (`2m ago`), countdown PM (`48 minutes`). |
| **numeral / Intl.NumberFormat** | Format `$84,250`, `94.2%`, angka tabular (`tabular-nums`). |
| **zod + react-hook-form** (untuk modal Quick Create) | Validasi form WO cepat (facility, asset, priority, summary, assignee). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/dashboard/summary` | On page load + setiap filter rail berubah | Query: `?timeRange=today&facilityId=all&shift=A`. Response: `{ "data": { "openWorkOrders": 42, "openHigh": 18, "unassigned": 4, "overdue": 5, "mttrHours": 2.4, "mttrDeltaMin": -18, "pmCompliance": 0.942, "pmDone": 128, "pmTotal": 136, "reorderSkus": 14, "opexSpend": 84250, "opexBudget": 105000, "downtimePct": 0.0082, "mtbfHours": 420, "vendorSla": 0.968, "ingestion": { "healthyPct": 0.9998, "latencyMs": 18 } } }` |
| GET | `/api/v1/dashboard/cost-downtime-trend` | On page load + ganti tab view / filter | Query: `?view=cost&timeRange=mtd`. Response: `{ "data": { "points": [{ "label": "Oct 01", "spend": 12000, "downtimeMin": 45 }], "anomalies": [{ "label": "Oct 16", "note": "Chiller Trip: $4.2k" }], "breakdown": [{ "category": "HVAC", "amount": 38400 }] } }` |
| GET | `/api/v1/work-orders` | On page load + search/filter/pagination tabel | Query: `?minPriority=P2&search=&page=1&perPage=10&facilityId=all`. Response: `{ "data": [{ "id": "WO-2024-0892", "priority": "P1-CRITICAL", "asset": "Chiller Unit #03", "location": "Basement Energy Hub • Plant 2", "summary": "Compressor bearing vibration anomaly", "assignee": "Danial Adnan", "slaDueAt": "2026-09-13T10:00:00Z", "status": "ESCALATED" }], "meta": { "total": 42, "page": 1 } }` |
| POST | `/api/v1/work-orders` | On submit modal `+ Quick Create Work Order` | Body: `{ "assetId": "AST-CHILLER-03", "facilityId": "plant-2", "priority": "P2-HIGH", "summary": "...", "assigneeId": null }`. Response: `{ "data": { "id": "WO-2024-0905", "status": "QUEUED" } }` |
| POST | `/api/v1/work-orders/:id/dispatch` | On click `Dispatch Specialist` pada baris breach | Body: `{ "specialistId": "tech-007" }`. Response: `{ "data": { "id": "WO-2024-0892", "status": "DISPATCHED" } }` |
| POST | `/api/v1/work-orders/:id/reassign` | On click `Reassign` | Body: `{ "assigneeId": "tech-012" }`. Response: `{ "data": { "id": "WO-2024-0901", "assignee": "M. Kowalski" } }` |
| POST | `/api/v1/work-orders/:id/auto-assign` | On click `Auto-Assign` (WO unassigned) | Body: `{}`. Response: `{ "data": { "id": "WO-2024-0904", "assignee": "T. Chen", "status": "QUEUED" } }` |
| POST | `/api/v1/work-orders/:id/expedite-parts` | On click `Expedite SKU` (WO on-hold karena parts) | Body: `{ "sku": "BRG-6204RS" }`. Response: `{ "data": { "purchaseRequestId": "PR-3310" } }` |
| GET | `/api/v1/assets/health` | On page load (panel Asset Health Index) | Response: `{ "data": [{ "assetId": "AST-CHILLER-03", "name": "Central Chiller #03", "healthPct": 48, "state": "CRITICAL", "note": "Bearing vibration 7.8mm/s" }] }` |
| GET | `/api/v1/activity-feed` | On page load + polling tiap 5s (panel Live Log) | Query: `?limit=10&since=...`. Response: `{ "data": [{ "actor": "Tech R. Pratama", "type": "PARTS_CONSUMPTION", "ref": "WO-2024-0889", "text": "Logged parts consumption: 2x 6204RS", "at": "2026-09-13T14:00:00Z" }], "meta": { "pollIntervalSec": 5 } }` |
| GET | `/api/v1/shifts/roster` | On page load + ganti dropdown Shift | Query: `?shift=A`. Response: `{ "data": { "shift": "A", "dispatched": 9, "ready": 3, "members": [{ "name": "T. Chen", "skill": "HVAC Specialist", "state": "ON_JOB", "workOrderId": "WO-2024-0901" }] } }` |
| GET | `/api/v1/facilities` | On page load (opsi dropdown Facility) | Response: `{ "data": [{ "id": "all", "name": "All Sites (4 Hubs)" }, { "id": "tower-a", "name": "Tower A - Nusantara HQ" }] }` |
| POST | `/api/v1/reports/executive-export` | On click `Export Executive Report` (async job) | Body: `{ "format": "PDF", "timeRange": "today", "facilityId": "all" }`. Response: `{ "data": { "jobId": "RPT-9912", "downloadUrl": "/reports/RPT-9912.pdf" } }` |
| GET | `/api/v1/system/status` | On page load (footer banner; poll lambat) | Response: `{ "data": { "db": "Node-01A (Primary)", "brokerMsgsPerSec": 1420, "nextPmCycleAt": "2026-09-13T14:00:00+07:00" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/operations-dashboard.mock.ts` dan diimpor halaman
selama backend belum siap. Setiap blok wajib berkomentar `// TODO` dengan endpoint
penggantinya.

```ts
// TODO: Replace dashboardSummary mock with GET /api/v1/dashboard/summary?timeRange=today&facilityId=all&shift=A
export const dashboardSummary = {
  openWorkOrders: 42, openHigh: 18, unassigned: 4,
  overdue: 5, mttrHours: 2.4, pmCompliance: 0.942,
  reorderSkus: 14, opexSpend: 84250, opexBudget: 105000,
  downtimePct: 0.0082, vendorSla: 0.968,
  ingestion: { healthyPct: 0.9998, latencyMs: 18 },
};

// TODO: Replace trend mock with GET /api/v1/dashboard/cost-downtime-trend?view=cost
export const costTrend = {
  points: [
    { label: "Oct 01", spend: 12000, downtimeMin: 45 },
    { label: "Oct 16", spend: 18500, downtimeMin: 210 },
    { label: "Oct 31", spend: 24500, downtimeMin: 60 },
  ],
  anomalies: [{ label: "Oct 16", note: "Chiller Trip: $4.2k" }],
  breakdown: [
    { category: "HVAC", amount: 38400 },
    { category: "Electrical", amount: 24150 },
    { category: "Plumbing", amount: 12300 },
    { category: "Conveyors", amount: 9400 },
  ],
};

// TODO: Replace queue mock with GET /api/v1/work-orders?minPriority=P2&page=1
export const dispatchQueue = [
  {
    id: "WO-2024-0892", priority: "P1-CRITICAL",
    asset: "Chiller Unit #03", location: "Basement Energy Hub • Plant 2",
    summary: "Compressor bearing vibration anomaly above 7.8mm/s safety trip",
    assignee: "Danial Adnan", slaText: "-01:42:15 BREACH", status: "ESCALATED",
  },
  {
    id: "WO-2024-0888", priority: "P1-CRITICAL",
    asset: "Generator 2B", location: "Outdoor Power Vault • Tower A",
    summary: "Common-rail fuel pump pressure loss during automated test fire",
    assignee: "R. Pratama", slaText: "-00:24:10 BREACH", status: "ON HOLD (PARTS)",
  },
  {
    id: "WO-2024-0901", priority: "P2-HIGH",
    asset: "Conveyor Sorter #4", location: "Logistics Bay 12 • East Yard",
    summary: "Secondary optical barcode scanner misalignment and belt drift",
    assignee: "T. Chen", slaText: "01:14:30 LEFT", status: "IN PROGRESS",
  },
  {
    id: "WO-2024-0904", priority: "P2-HIGH",
    asset: "AHU Cleanroom B", location: "Level 3 Pharma Lab • Tower A",
    summary: "Static air pressure differential dropped below 25 Pa threshold",
    assignee: null, slaText: "02:40:00 LEFT", status: "QUEUED",
  },
];

// TODO: Replace health mock with GET /api/v1/assets/health
export const assetHealth = [
  { assetId: "AST-CHILLER-03", name: "Central Chiller #03", healthPct: 48, state: "CRITICAL" },
  { assetId: "AST-GEN-2B", name: "Backup Generator 2B", healthPct: 62, state: "ATTENTION" },
  { assetId: "AST-TX-1", name: "Substation Transformer TX-1", healthPct: 99, state: "OPTIMAL" },
  { assetId: "AST-AHU-04", name: "Cleanroom AHU-04", healthPct: 98, state: "OPTIMAL" },
];

// TODO: Replace feed mock with GET /api/v1/activity-feed?limit=10 (poll 5s via SWR)
export const liveLog = [
  { actor: "Tech R. Pratama", at: "2m ago", text: "Logged parts consumption on [WO-2024-0889]: 2x 6204RS." },
  { actor: "IoT SCADA Alarm", at: "14m ago", text: "High temp alert on [AST-CHILLER-03]: Exceeded 84°C." },
];

// TODO: Replace roster mock with GET /api/v1/shifts/roster?shift=A
export const shiftRoster = {
  shift: "A", dispatched: 9, ready: 3,
  members: [
    { name: "T. Chen (HVAC Specialist)", state: "On WO-0901" },
    { name: "M. Kowalski (Master Electrician)", state: "Standby Hub B" },
  ],
};
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/work-orders?minPriority=P2', fetcher)
import { dispatchQueue } from "@/mocks/operations-dashboard.mock";

export function DispatchQueueTable() {
  return (
    <Table>
      <TableBody>
        {dispatchQueue.map((wo) => (
          <TableRow key={wo.id}>
            <TableCell className="font-mono font-bold">{wo.id}</TableCell>
            <TableCell><Badge>{wo.priority}</Badge></TableCell>
            <TableCell>{wo.asset}</TableCell>
            <TableCell>{wo.summary}</TableCell>
            <TableCell className="font-mono">{wo.slaText}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian mock → API: hapus satu blok mock per endpoint yang sudah live,
ganti dengan `useSWR` + `Skeleton` saat `isLoading` + `Toast` saat `error`,
dan pertahankan struktur field agar komponen tidak berubah.
