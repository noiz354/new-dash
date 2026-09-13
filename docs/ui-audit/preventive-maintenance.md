# UI Audit — Preventive Maintenance Scheduling & Automation Hub (`preventive_maintenance_scheduling_automation_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/preventive_maintenance_scheduling_automation_hub/code.html` (957 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/preventive-maintenance`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Preventive Maintenance Scheduling & Automation Engine** adalah pusat
penjadwalan perawatan berkala: mendefinisikan rencana PM berulang, mengevaluasi
pemicu ganda (kalender vs telemetri SCADA), dan **mendispatch batch Work Order
otomatis** ke shift yang bertugas. Badge `SYS-RUNNING` dan kartu engine
`HTMX-CRON ACTIVE` menegaskan halaman ini dibaca sebagai "mesin yang selalu
mengevaluasi", bukan sekadar daftar jadwal.

Alur kerja yang didukung: pantau KPI kepatuhan → inspeksi matriks pemicu
hybrid → kelola master plan (38 rencana) → tinjau antrean dispatch (4 ready) →
eksekusi batch → pantau beban shift + kurva kepatuhan 30 hari.

### Daftar elemen UI utama

1. **Breadcrumb + header aksi** — `Home / Operations / Preventive Maintenance /
   PM Master & Automation Engine`; H1 + badge `SYS-RUNNING`; tombol
   `Shift Calendar View`, `Generate Work Orders Now (4 Ready)`, dan
   `New PM Plan Definition` (primary).
2. **Strip KPI (5 kartu)** — `Total Active PM Plans 38` (100% Asset Bound);
   `PM Compliance Rate 96.4%` (+1.4% vs target 95.0%, progress bar);
   `Upcoming Cycles (14d) 19` (lead window 7 hari); `Overdue / SLA Breach 03`
   (Requires Forced Dispatch, kartu merah); `Auto-Dispatch Engine`
   (`HTMX-CRON ACTIVE`, countdown evaluasi `24m 15s` via JS, `Modbus OK`,
   `PID: 8841-pm`).
3. **Matriks pemicu hybrid (Zone 1)** — inspeksi plan `PM-PLN-0104`
   (`PLN-INSPECT`): tab `Hybrid Dual-Trigger` / `Calendar Fixed` /
   `Pure Telemetry Delta`; 3 kolom: Time Cadence (`Every 90 Calendar Days`,
   due 14 May 2025, elapsed 81/90 = 90%, buffer 07 May 2025);
   IoT Meter (`Every 2,500 Operating Hrs`, current 4,812/5,000 hrs,
   188 hrs left ~4.2d, vibe 0.14 in/s, `MODBUS_REG_40112`, `10.14.0.8:502`);
   Evaluation Logic Engine (snippet mono `IF (NOW() >= LAST_DATE + 90d) OR
   (ASSET.RUN_HOURS >= 5000) -> DISPATCH_WO(PRIORITY=P2_HIGH,
   CHECKLIST=CL-HVAC-Q)`, `EXPR-TRUE`, auto-assignee HVAC Shift Team A,
   alokasi parts `PART-FLTR-401 (x2), LUB-09 (x1)`).
4. **Master plan table (Zone 2, 8 kolom)** — tab kategori
   (All 38 / HVAC & Chillers 14 / Elevators 8 / Generators 10 / Life Safety 6),
   search (`Ctrl+/`), 5 baris: `PM-PLN-0082` Elevator `AST-ELEV-02`
   (OVERDUE 3d, last `WO-2025-0144`); `PM-PLN-0056` Generator `AST-GEN-01`
   (DUE TODAY 17:00 Shift B, last `WO-2025-0421`); `PM-PLN-0104` Chiller
   `AST-HVAC-004` (READY, 90d/2,500hrs Hybrid, last `WO-2024-8902`);
   `PM-PLN-0112` Cleanroom `AST-ENV-108` (SCHEDULED, last `WO-2024-6101`);
   `PM-PLN-0041` Trafo `AST-ELEC-01` (SCHEDULED, last `WO-2024-2209`);
   kolom aksi `Dispatch` / checklist / edit. Footer
   `Showing 5 of 38`, pagination 1/2/3.
5. **Kurva dispatch & kepatuhan 30 hari** — chart SVG inline (area hijau
   Completed-in-SLA + garis putus biru Dispatched, milestone dots),
   sumbu Week 1 (20 Jan) → Today (15 Feb).
6. **Generation Dispatch Queue (Zone 3)** — badge `4 Ready`; 4 item:
   `PM-PLN-0082` OVERDUE 3d LATE (M. Kowalski, Shift Capacity Stall),
   `PM-PLN-0056` DUE TODAY (T. Chen, Fuel Reservoir OK),
   `PM-PLN-0104` DUE IN 2D (HVAC Shift A, Parts Staged Bin 4A),
   `PM-PLN-0099` TELEMETRY Air Compressor (>1,000 run-hrs, Plant Mech Shift);
   tombol `Execute Dispatch Batch (4 WOs)` (JS `executeBatchDispatch()`:
   simulasi 1.2s → toast sukses → antrean dikosongkan visual) +
   `Simulate Generation Run`, estimasi `16.5 Man-Hrs`.
7. **Shift Workload Balancing (14d)** — bar Gantt 3 periode kapasitas
   (92% / 64% / 78%, split Shift A HVAC/Elec vs Shift B Mech/Plumb),
   link `Shift Plan →`.
8. **Modbus SCADA Connection card** — `ACTIVE`, gateway `10.14.0.8:502
   (CUP-01)`, poll 1,000ms, `99.98% Zero Packet Drop`; container toast
   fixed bottom-right.

### State UI

- **Empty state:** SUDAH dimockup sebagian — setelah batch dispatch sukses,
  antrean menampilkan `All Queued PM Items Dispatched` + siklus evaluasi
  background. Tabel tanpa hasil filter → pesan + tombol reset (belum
  dimockup, wajib ditambah). Chart tanpa data → sumbu + "Belum ada data".
- **Loading state:** skeleton kartu KPI + baris tabel (5 baris) + kartu
  antrean; tombol batch menampilkan `Processing Telemetry & Generating
  Orders...` + disabled; countdown engine memakai shimmer saat reconnect.
- **Error state:** dispatch batch gagal → toast destruktif + antrean tetap
  4 item (tidak dikosongkan); Modbus terputus → badge `ACTIVE` berubah merah
  `OFFLINE` + pemicu meter memakai nilai terakhir + label `STALE`;
  single dispatch gagal → toast per `planId` + baris tetap.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path` identik — item
`preventive-maintenance` diaktifkan via JS `syncActiveNav()` — header
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di
bawah adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: 15 item (`preventive-maintenance` aktif) | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance` (halaman ini), `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` — EXISTS (mockup) |
| Breadcrumb `Home / Operations / Preventive Maintenance / PM Master...` | `Home` → `/`; segmen tengah grup, bukan route |
| `New PM Plan Definition` | Form definisi plan baru (`/preventive-maintenance/new` atau modal) — MISSING |
| `Shift Calendar View` | Tampilan kalender shift (view alternatif) — MISSING (sebagai view; `Shift Plan →` juga MISSING sebagai halaman) |
| `Generate Work Orders Now` / `Execute Dispatch Batch (4 WOs)` | Aksi batch `POST`, tetap di halaman (bukan navigasi) |
| `Simulate Generation Run` | Aksi simulasi demo (toast), tetap di halaman |
| Tab kategori + search + pagination | Query params (`?category=hvac&search=&page=`), bukan navigasi |
| Link `WO-2025-0144`, `WO-2025-0421`, `WO-2024-8902`, `WO-2024-6101`, `WO-2024-2209` (5 link, kolom Last Executed) | `/work-orders/[id]` — MISSING |
| Tombol `Dispatch` per baris | Aksi `POST` single dispatch (toast), tetap di halaman |
| Ikon checklist per baris | Detail checklist plan (`CL-HVAC-Q` dkk) — MISSING |
| Ikon edit per baris | Form edit plan — MISSING |
| `Shift Plan →` | Halaman shift plan — MISSING |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — 5 link histori eksekusi (`WO-2025-0144`
   dkk) menggantung; konsisten dengan `navigation-audit.md` §3 (baris PM hub).
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Form `New PM Plan Definition` + edit plan (MEDIUM)** — tidak ada tujuan
   untuk tombol primer header maupun ikon edit; putuskan modal vs route
   `/preventive-maintenance/new`.
   `// TODO: Define PM plan create/edit target (modal vs /preventive-maintenance/new)`
3. **Checklist detail plan (MEDIUM)** — ikon checklist per baris dan referensi
   `CHECKLIST=CL-HVAC-Q` butuh viewer/editor checklist (berbagi dengan
   template builder di `/field-inspections`? putuskan).
4. **Shift plan view (LOW)** — `Shift Calendar View` + `Shift Plan →`
   tersebar tanpa tujuan (konsisten dengan `navigation-audit.md` §4 item 10).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN** + config inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/ekspresi logic),
  ikon **Material Symbols Outlined**.
- Chart digambar manual sebagai **SVG inline** (path area + garis + circle).
- JS vanilla demo: countdown engine (`initEngineTimer`, reset ke 30m),
  `executeBatchDispatch()` (timeout 1.2s + toast + kosongkan antrean DOM),
  `singleDispatchToast(planId)`, `simulateRunAlert()`, util `showToast()`,
  `syncActiveNav()` untuk highlight sidebar.
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/preventive-maintenance` (+ opsional `/new`); typing `PmPlan`, `TriggerMatrix`, `DispatchQueueItem`, `WorkloadBand`. |
| **Tailwind CSS (build, bukan CDN)** | Styling KPI strip, matriks 3 kolom, tabel dense 8 kolom, workspace 8/4. Token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Table`, `Progress`, `Skeleton`, `Toast` | Kartu KPI, tab trigger + kategori, tabel plan, progress compliance/trigger, antrean dispatch, skeleton/toast. |
| **lucide-react** | Pengganti Material Symbols (ikon bolt, calendar, sensor, sync). |
| **Recharts** (atau ECharts bila data besar) | Menggantikan SVG manual untuk kurva dispatch vs completed-in-SLA + bar workload shift. |
| **SWR atau TanStack Query** | Poll countdown engine + antrean dispatch; invalidasi optimistis setelah batch/single dispatch; penanda `STALE`. |
| **axios** (atau `fetch` + `ky`) | HTTP client dengan interceptor auth + base URL `/api/v1`. |
| **date-fns + date-fns-tz** | Format due date (`14 May 2025`), countdown (`24m 15s`), window shift, sumbu chart mingguan. |
| **zod + react-hook-form** | Validasi form definisi plan baru (cadence, threshold meter, assignee, checklist). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/pm-dashboard/summary` | On page load (strip 5 KPI) | Response: `{ "data": { "activePlans": 38, "compliance": 0.964, "target": 0.95, "upcomingCycles14d": 19, "leadWindowDays": 7, "overdue": 3, "engine": { "state": "ACTIVE", "pid": "8841-pm", "nextEvalSec": 1455, "modbus": "OK" } } }` |
| GET | `/api/v1/pm-plans` | On page load + tab kategori/search/pagination | Query: `?category=all&search=&page=1&perPage=10`. Response: `{ "data": [{ "id": "PM-PLN-0082", "name": "Monthly High-Speed Elevator Overhaul & Brake Test", "assetId": "AST-ELEV-02", "zone": "East Shaft Core (L1-42)", "cadence": "Every 30 Days", "triggerType": "FLOATING", "lastExecutedAt": "2025-01-12", "lastWorkOrderId": "WO-2025-0144", "nextDueAt": "2025-02-11", "sla": "OVERDUE" }], "meta": { "total": 38, "categories": { "hvac": 14, "elevators": 8, "generators": 10, "safety": 6 } } }` |
| GET | `/api/v1/pm-plans/:id/triggers` | On page load / select plan (matriks hybrid Zone 1) | Response: `{ "data": { "planId": "PM-PLN-0104", "time": { "everyDays": 90, "nextDue": "2025-05-14", "elapsedDays": 81, "bufferStart": "2025-05-07" }, "meter": { "everyHours": 2500, "current": 4812, "limit": 5000, "leftHours": 188, "vibrationIps": 0.14, "channel": "MODBUS_REG_40112" }, "logic": "IF (NOW() >= LAST_DATE + 90d) OR (ASSET.RUN_HOURS >= 5000) -> DISPATCH_WO(PRIORITY=P2_HIGH, CHECKLIST=CL-HVAC-Q)", "result": "EXPR-TRUE", "assignee": "HVAC Shift Team A", "parts": [{ "sku": "PART-FLTR-401", "qty": 2 }] } }` |
| GET | `/api/v1/pm-plans/dispatch-queue` | On page load + poll engine (4 item Zone 3) | Response: `{ "data": [{ "planId": "PM-PLN-0082", "state": "OVERDUE", "lateDays": 3, "assignee": "M. Kowalski", "note": "Shift Capacity Stall" }, { "planId": "PM-PLN-0099", "state": "TELEMETRY", "note": ">1,000 Operating hrs" }], "meta": { "ready": 4, "estManHours": 16.5 } }` |
| POST | `/api/v1/pm-plans/dispatch-batch` | On click `Execute Dispatch Batch (4 WOs)` | Body: `{ "planIds": ["PM-PLN-0082", "PM-PLN-0056", "PM-PLN-0104", "PM-PLN-0099"] }`. Response: `{ "data": { "created": [{ "planId": "PM-PLN-0082", "workOrderId": "WO-2026-0901" }], "cleared": 4 } }` |
| POST | `/api/v1/pm-plans/:id/dispatch` | On click `Dispatch` per baris | Body: `{}`. Response: `{ "data": { "planId": "PM-PLN-0082", "workOrderId": "WO-2026-0901" } }` |
| POST | `/api/v1/pm-plans` | On submit `New PM Plan Definition` | Body: `{ "name": "...", "assetId": "AST-ELEV-02", "cadenceDays": 30, "triggerType": "FLOATING", "meterThreshold": null, "checklistId": "CL-ELEV-M" }`. Response: `{ "data": { "id": "PM-PLN-0113" } }` |
| GET | `/api/v1/pm-dashboard/dispatch-trend` | On page load (chart 30 hari) | Response: `{ "data": { "points": [{ "week": "Week 1 (20 Jan)", "dispatched": 12, "completedInSla": 11 }] } }` |
| GET | `/api/v1/shifts/workload` | On page load (Gantt 14 hari) | Response: `{ "data": { "window": "14d", "bands": [{ "label": "Feb 15 - 17 (Weekend / Critical)", "capacityPct": 92, "shiftA hours": 14.5, "shiftB hours": 9.8 }] } }` |
| GET | `/api/v1/system/scada-status` | On page load + poll lambat (kartu Modbus) | Response: `{ "data": { "gateway": "10.14.0.8:502", "name": "CUP-01", "pollMs": 1000, "healthPct": 0.9998, "state": "ACTIVE" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/preventive-maintenance.mock.ts` selama backend
belum siap. Setiap blok wajib berkomentar `// TODO` dengan endpoint penggantinya.

```ts
// TODO: Replace summary mock with GET /api/v1/pm-dashboard/summary
export const pmSummary = {
  activePlans: 38, compliance: 0.964, target: 0.95,
  upcomingCycles14d: 19, overdue: 3,
  engine: { state: "ACTIVE", pid: "8841-pm", nextEvalSec: 24 * 60 + 15 },
};

// TODO: Replace plans mock with GET /api/v1/pm-plans?category=all&page=1
export const pmPlans = [
  { id: "PM-PLN-0082", assetId: "AST-ELEV-02", cadence: "Every 30 Days", triggerType: "FLOATING", lastWorkOrderId: "WO-2025-0144", next: "11 Feb 2025", sla: "OVERDUE" },
  { id: "PM-PLN-0056", assetId: "AST-GEN-01", cadence: "Every 14 Days", triggerType: "FIXED", lastWorkOrderId: "WO-2025-0421", next: "Today 17:00", sla: "DUE_SOON" },
  { id: "PM-PLN-0104", assetId: "AST-HVAC-004", cadence: "90d / 2,500 hrs", triggerType: "HYBRID", lastWorkOrderId: "WO-2024-8902", next: "In 2 Days", sla: "READY" },
  { id: "PM-PLN-0112", assetId: "AST-ENV-108", cadence: "Every 180 Days", triggerType: "FIXED", lastWorkOrderId: "WO-2024-6101", next: "In 12 Days", sla: "SCHEDULED" },
  { id: "PM-PLN-0041", assetId: "AST-ELEC-01", cadence: "Every 365 Days", triggerType: "FIXED", lastWorkOrderId: "WO-2024-2209", next: "In 32 Days", sla: "SCHEDULED" },
];

// TODO: Replace trigger mock with GET /api/v1/pm-plans/PM-PLN-0104/triggers
export const triggerMatrix = {
  planId: "PM-PLN-0104",
  time: { everyDays: 90, nextDue: "2025-05-14", elapsedDays: 81 },
  meter: { everyHours: 2500, current: 4812, limit: 5000, leftHours: 188, channel: "MODBUS_REG_40112" },
  logic: "IF (NOW() >= LAST_DATE + 90d) OR (ASSET.RUN_HOURS >= 5000) -> DISPATCH_WO(P2_HIGH, CL-HVAC-Q)",
  result: "EXPR-TRUE",
};

// TODO: Replace queue mock with GET /api/v1/pm-plans/dispatch-queue
export const dispatchQueue = [
  { planId: "PM-PLN-0082", state: "OVERDUE", assignee: "M. Kowalski" },
  { planId: "PM-PLN-0056", state: "DUE_TODAY", assignee: "T. Chen" },
  { planId: "PM-PLN-0104", state: "DUE_IN_2D", assignee: "HVAC Shift A" },
  { planId: "PM-PLN-0099", state: "TELEMETRY", assignee: "Plant Mech Shift" },
];

// TODO: Replace batch simulation (executeBatchDispatch timeout) with POST /api/v1/pm-plans/dispatch-batch
// TODO: Create detail page routing for /work-orders/[id] (5 history links)
// TODO: Define PM plan create/edit target (modal vs /preventive-maintenance/new)
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/pm-plans?category=all&page=1', fetcher)
import { pmPlans } from "@/mocks/preventive-maintenance.mock";

export function PmPlanTable() {
  return (
    <Table>
      <TableBody>
        {pmPlans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-mono font-bold">{plan.id}</TableCell>
            <TableCell className="font-mono">{plan.assetId}</TableCell>
            <TableCell>{plan.cadence}</TableCell>
            <TableCell><Badge>{plan.sla}</Badge></TableCell>
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

### Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Ambang meter tidak konsisten dalam satu matriks.** Kartu IoT menulis
   `Every 2,500 Operating Hrs` tetapi progres memakai `4,812 / 5,000 hrs`
   dan ekspresi logic memakai `ASSET.RUN_HOURS >= 5000`. Tiga angka dasar
   (2.500 vs 5.000) untuk satu pemicu — selaraskan definisi threshold.
2. **`PM-PLN-0099` ada di antrean dispatch tetapi tidak di tabel master.**
   Tabel menampilkan `Showing 5 of 38` dengan pagination — kemungkinan ia di
   halaman 2+, tetapi item TELEMETRY yang siap dispatch idealnya terlihat di
   halaman 1. Pertimbangkan sort `ready first` saat rebuild.
3. **Penomoran WO campur era.** Kolom Last Executed memakai `WO-2025-*` dan
   `WO-2024-*`, sedangkan hub WO/SR memakai `WO-2026-*` — mockup lintas waktu
   (konsisten dengan catatan `navigation-audit.md` §5); normalisasi ke satu
   sequence saat seeding.
