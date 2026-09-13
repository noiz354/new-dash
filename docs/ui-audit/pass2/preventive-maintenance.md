# UI Audit Pass-2 — Preventive Maintenance (`preventive_maintenance_scheduling_automation_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/preventive_maintenance_scheduling_automation_hub/code.html` (957 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2 independen, belum membandingkan pass-1).
> Konteks global: `docs/ui-audit/navigation-audit.md` (sidebar 15 `data-path`, semua `href="#"`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Preventive Maintenance Scheduling & Automation Engine** mengatur
jadwal PM berulang dan mengubah trigger kalender/telemetri menjadi batch WO
otomatis. Breadcrumb
`Home / Operations / Preventive Maintenance / PM Master & Automation Engine`.
Script `syncActiveNav()` menegaskan item sidebar `preventive-maintenance`
aktif secara visual.

Alur kerja: pantau KPI → inspeksi matriks trigger hybrid → kelola 38 plan →
jalankan dispatch batch (4 Ready) → seimbangkan beban shift 14 hari → verifikasi
chart 30 hari.

### Daftar elemen UI utama

1. **Header + aksi primer** — H1 + pill `SYS-RUNNING`, tombol
   `Shift Calendar View`, `Generate Work Orders Now (4 Ready)`, `New PM Plan
   Definition`.
2. **KPI strip (5 kartu)** — `Total Active PM Plans 38`, `PM Compliance Rate
   96.4%` (target 95.0), `Upcoming Cycles (14d) 19`, `Overdue / SLA Breach 03`,
   `Auto-Dispatch Engine HTMX-CRON ACTIVE` + countdown `24m 15s` + Modbus OK
   PID 8841-pm.
3. **Trigger matrix (Zone 1)** — kartu `Hybrid Trigger Matrix` untuk
   `PLN-INSPECT: PM-PLN-0104` + tab `Hybrid Dual-Trigger` / `Calendar Fixed` /
   `Pure Telemetry Delta`; 3 kolom: Time `Every 90 Calendar Days` (due 14 May
   2025, 81/90 90%, buffer 07 May Pre-Dispatch), Meter `Every 2,500 Operating
   Hrs` (4,812/5,000, 188 hrs ~4.2d, vibe 0.14 in/s, `MODBUS_REG_40112`),
   Logic gelap `IF (NOW() >= LAST_DATE + 90d) OR (RUN_HOURS >= 5000) ->
   DISPATCH_WO(PRIORITY=P2_HIGH, CHECKLIST=CL-HVAC-Q)` + assignee HVAC Shift A
   + parts `PART-FLTR-401 (x2), LUB-09 (x1)` (status `EXPR-TRUE`).
4. **Master plan table (Zone 2, 8 kolom)** — tab kategori All 38 / HVAC 14 /
   Elevators 8 / Generators 10 / Life Safety 6 + search `Ctrl+/` + export;
   kolom Plan ID, Target Asset & Zone, Cadence, Trigger Type, Last Executed
   (+ link WO), Next Scheduled, SLA Health, Dispatch Actions; 5 baris:
   `PM-PLN-0082` Elevator `AST-ELEV-02` 30d Floating overdue 3d `WO-2025-0144`
   OVERDUE Dispatch; `PM-PLN-0056` Generator `AST-GEN-01` 14d Calendar due
   today `WO-2025-0421` DUE SOON; `PM-PLN-0104` Chiller `AST-HVAC-004`
   90d/2,500h Hybrid in 2d `WO-2024-8902` READY; `PM-PLN-0112` Cleanroom
   `AST-ENV-108` 180d in 12d `WO-2024-6101` SCHEDULED; `PM-PLN-0041`
   Substation `AST-ELEC-01` 365d in 32d `WO-2024-2209` SCHEDULED;
   pagination `Showing 5 of 38`.
5. **Chart 30 hari** — SVG manual `Dispatched` (putus-putus) vs
   `Completed In SLA` (area) + milestone, sumbu Week 1–Today (15 Feb).
6. **Dispatch queue (Zone 3, kanan)** — `Generation Dispatch Queue 4 Ready`
   (0082 OVERDUE 3d LATE Kowalski Stall; 0056 DUE TODAY T. Chen Fuel OK; 0104
   DUE IN 2D HVAC Shift A Bin 4A; 0099 TELEMETRY Plant Mech >1,000h) +
   `Execute Dispatch Batch (4 WOs)` + `Simulate Generation Run` + estimasi
   16.5 Man-Hrs; sukses JS mengosongkan `#queue-items-container` + toast.
7. **Shift workload 14d** — bar Gantt Feb 15–17 92%, Feb 18–21 64%,
   Feb 22–28 78% (Shift A vs B) + link `Shift Plan →`.
8. **Modbus status + toast container** — gateway 10.14.0.8:502 CUP-01,
   1,000ms, 99.98% + utilitas `showToast()` 4s; timer engine
   `initEngineTimer()` reset 30m saat nol.

### State UI

- **Empty state:** queue kosong → ilustrasi `All Queued PM Items Dispatched`
  (sudah dimock pasca-batch); tabel tanpa hasil → "Tidak ada plan pada filter"
  + `Reset`.
- **Loading state:** skeleton KPI + baris tabel + queue; tombol batch
  `Processing Telemetry & Generating Orders...` (disabled, sudah dimock).
- **Error state:** overdue merah berdenyut + `Requires Forced Dispatch`;
  simulasi gagal → toast error; Modbus drop → `ACTIVE` jadi merah + `STALE`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global. Semua `href="#"` (termasuk 5 link `WO-2025-*`) —
target usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Preventive Maintenance (aktif) | `/preventive-maintenance` (halaman ini) |
| Sidebar 14 item lain | Route §2 `navigation-audit.md` |
| Breadcrumb `Home / Operations / Preventive Maintenance / PM Master` | `Home` → `/`; segmen tengah bukan route |
| `Shift Calendar View` | `?view=calendar` atau `/preventive-maintenance/calendar` (usulan tab) |
| `New PM Plan Definition` | Modal/drawer `POST /api/v1/pm-plans` (tetap di halaman) |
| Tab trigger `Hybrid / Calendar / Telemetry` | `?trigger=hybrid\|calendar\|telemetry` (tetap di halaman) |
| Tab kategori + search + pagination | Query `?category=hvac&search=&page=` (tetap di halaman) |
| Link `WO-2025-0144`, `WO-2025-0421`, `WO-2024-8902`, `WO-2024-6101`, `WO-2024-2209` (5 link) | `/work-orders/[id]` — MISSING (dead-end terbesar halaman ini) |
| Tombol `Dispatch` per baris | Aksi `POST` inline (tetap di halaman) |
| Ikon `checklist` / `edit` per baris | Drawer checklist/template `PM-PLN-*` — MISSING |
| `Generate Work Orders Now` / `Execute Dispatch Batch (4 WOs)` | Aksi batch inline (tetap di halaman) |
| `Simulate Generation Run` | Aksi simulasi inline (toast) |
| `Shift Plan →` | Halaman shift plan — MISSING |
| Export CSV ikon | Job unduh (terkait `/reports`) |
| Ikon `notifications` (header global) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — 5 link WO history tanpa tujuan; wajib agar
   audit Last Executed bisa diverifikasi.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Shift plan view (MEDIUM)** — `Shift Plan →` dan `Shift Calendar View`
   tanpa route; putuskan tab `?view=calendar` vs halaman `/shifts`.
   `// TODO: Create shift plan view for /preventive-maintenance?view=calendar`
3. **PM plan detail / checklist drawer (MEDIUM)** — ikon edit/checklist tanpa
   tujuan; butuh drawer `/preventive-maintenance/PM-PLN-0082`.
   `// TODO: Create PM plan detail drawer for /preventive-maintenance/[planId]`
4. **Target global `+ New Dispatch / Request` (MEDIUM)** — seragamkan pola
   global.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols,
  chart SVG inline manual. Interaksi nyata satu-satunya: countdown engine,
  `executeBatchDispatch()` (1200ms → toast + kosongkan queue),
  `singleDispatchToast()`, `simulateRunAlert()`, `showToast()`.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/preventive-maintenance` (`view`, `category`, `page` via `searchParams`); typing `PmPlan`, `TriggerMatrix`, `DispatchBatch`. |
| **Tailwind CSS (build)** | KPI grid 5, matriks 3 kolom, tabel 8 kolom, drawer kanan; token A. |
| **shadcn/ui** — `Card`, `Badge`, `Tabs`, `Table`, `Input`, `Select`, `Progress`, `Skeleton`, `Toast`, `Dialog`, `Tooltip` | Tab trigger/kategori, tabel plan, queue, modal New Plan, toast batch. |
| **lucide-react** | Pengganti Material Symbols (bolt, calendar, sensors, code). |
| **Recharts / ECharts** | Ganti SVG manual untuk kurva dispatch vs SLA + tooltip. |
| **SWR / TanStack Query** | Poll engine countdown + queue; mutasi batch dengan optimistis + rollback. |
| **axios** | Client `/api/v1`. |
| **date-fns + date-fns-tz** | `14 May 2025`, `In 2 Days`, `3d OVERDUE`, countdown `24m 15s`. |
| **zod + react-hook-form** | Validasi New PM Plan (cadence, threshold meter, assignee, BOM). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/pm-plans/summary` | KPI 38 / 96.4% / 19 / 03 + engine status | On page load |
| GET | `/api/v1/pm-plans?category=all&search=&page=1&perPage=10` | Tabel 38 plan + pagination | On page load + tab/search/page |
| GET | `/api/v1/pm-plans/PM-PLN-0104/trigger-matrix` | Matriks hybrid time+meter+logic EXPR-TRUE | On page load (plan terpilih PLN-INSPECT) |
| GET | `/api/v1/pm-plans/dispatch-queue` | 4 item Ready + estimasi 16.5 man-hrs | On page load + poll engine |
| POST | `/api/v1/pm-plans/dispatch-batch` | Eksekusi batch 4 WO (ganti simulasi 1200ms) | On click Execute/Generate |
| POST | `/api/v1/pm-plans/PM-PLN-0082/dispatch` | Dispatch tunggal overdue | On click Dispatch per baris |
| POST | `/api/v1/pm-plans` | Buat plan baru | On submit New PM Plan Definition |
| GET | `/api/v1/pm-plans/dispatch-stats?days=30` | Kurva dispatched vs completed SLA | On page load (chart) |
| GET | `/api/v1/shifts/workload?days=14` | Beban Shift A/B 92/64/78% | On page load |
| POST | `/api/v1/pm-plans/simulate-run` | Simulasi tanpa dispatch (0 false-positive) | On click Simulate |
| GET | `/api/v1/telemetry/modbus-status` | Gateway 10.14.0.8:502, 1000ms, 99.98% | Poll lambat |
| POST | `/api/v1/reports/pm-export` | Export CSV plan | On click export |

Contoh:

```ts
// TODO: Replace queue mock with GET /api/v1/pm-plans/dispatch-queue
const res = await fetch("/api/v1/pm-plans/dispatch-queue");
const { data } = await res.json(); // { items: [{ planId: "PM-PLN-0082", state: "OVERDUE" }], estManHours: 16.5 }
```

```ts
// TODO: Replace executeBatchDispatch demo with POST /api/v1/pm-plans/dispatch-batch
await axios.post("/api/v1/pm-plans/dispatch-batch", { planIds: ["PM-PLN-0082", "PM-PLN-0056", "PM-PLN-0104", "PM-PLN-0099"] });
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace summary mock with GET /api/v1/pm-plans/summary
export const pmSummary = {
  activePlans: 38, compliance: 0.964, target: 0.95,
  upcoming14d: 19, overdue: 3,
  engine: { mode: "HTMX-CRON ACTIVE", evalInSec: 24 * 60 + 15, pid: "8841-pm", modbus: "OK" },
};

// TODO: Replace matrix mock with GET /api/v1/pm-plans/PM-PLN-0104/trigger-matrix
export const triggerMatrix = {
  planId: "PM-PLN-0104", mode: "Hybrid Dual-Trigger", expr: "EXPR-TRUE",
  time: { everyDays: 90, elapsed: 81, next: "14 May 2025", bufferStart: "07 May 2025" },
  meter: { everyHours: 2500, current: 4812, limit: 5000, vibeIns: 0.14, channel: "MODBUS_REG_40112" },
  logic: "IF (NOW() >= LAST_DATE + 90d) OR (RUN_HOURS >= 5000) -> DISPATCH_WO(P2_HIGH, CL-HVAC-Q)",
  assignee: "HVAC Shift Team A", parts: ["PART-FLTR-401 (x2)", "LUB-09 (x1)"],
};

// TODO: Replace table mock with GET /api/v1/pm-plans?category=all&page=1
export const pmPlans = [
  { id: "PM-PLN-0082", asset: "AST-ELEV-02", cadence: "Every 30 Days", trigger: "Floating Interval", last: "12 Jan 2025", lastWo: "WO-2025-0144", next: "11 Feb 2025", health: "OVERDUE" },
  { id: "PM-PLN-0056", asset: "AST-GEN-01", cadence: "Every 14 Days", trigger: "Calendar (Fixed)", last: "01 Feb 2025", lastWo: "WO-2025-0421", next: "Today 17:00", health: "DUE SOON" },
  { id: "PM-PLN-0104", asset: "AST-HVAC-004", cadence: "90d / 2,500 hrs", trigger: "Hybrid Dual", last: "14 Nov 2024", lastWo: "WO-2024-8902", next: "In 2 Days", health: "READY" },
  { id: "PM-PLN-0112", asset: "AST-ENV-108", cadence: "Every 180 Days", trigger: "Calendar (Fixed)", last: "28 Aug 2024", lastWo: "WO-2024-6101", next: "In 12 Days", health: "SCHEDULED" },
  { id: "PM-PLN-0041", asset: "AST-ELEC-01", cadence: "Every 365 Days", trigger: "Calendar (Fixed)", last: "19 Mar 2024", lastWo: "WO-2024-2209", next: "In 32 Days", health: "SCHEDULED" },
];

// TODO: Replace dispatch queue mock with GET /api/v1/pm-plans/dispatch-queue
export const dispatchQueue = [
  { planId: "PM-PLN-0082", state: "OVERDUE", assignee: "M. Kowalski" },
  { planId: "PM-PLN-0056", state: "DUE TODAY", assignee: "T. Chen" },
  { planId: "PM-PLN-0104", state: "DUE IN 2D", assignee: "HVAC Shift A" },
  { planId: "PM-PLN-0099", state: "TELEMETRY", assignee: "Plant Mech Shift" },
];

// TODO: Replace workload mock with GET /api/v1/shifts/workload?days=14
export const shiftWorkload = [
  { label: "Feb 15 - 17 (Weekend / Critical)", capacity: 0.92, shiftA: 14.5, shiftB: 9.8 },
  { label: "Feb 18 - 21 (Mid-Week Maintenance)", capacity: 0.64, shiftA: 10.0, shiftB: 7.2 },
  { label: "Feb 22 - 28 (Planned Shutdown Window)", capacity: 0.78, shiftA: 18.2, shiftB: 11.5 },
];
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/pm-plans?category=all&page=1', fetcher)
import { pmPlans } from "@/mocks/preventive-maintenance.mock";

export function PmPlanTable() {
  return (
    <table>
      <tbody>
        {pmPlans.map((p) => (
          <tr key={p.id}>
            <td className="font-mono font-bold">{p.id}</td>
            <td className="font-mono">{p.asset}</td>
            <td>{p.health}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Aturan ganti mock → API: satu blok per endpoint, `useSWR` + `Skeleton` +
`Toast`, pertahankan shape.

## 7. PERBANDINGAN PASS-1 vs PASS-2

Dibaca setelah seksi 1–6 selesai: `docs/ui-audit/preventive-maintenance.md` (pass-1).

### (a) Temuan pass-1 yang TERKONFIRMASI

- KPI 38 / 96.4% / 19 / 03 + engine `HTMX-CRON ACTIVE 24m 15s PID 8841-pm`,
  matriks hybrid (`Every 90 Calendar Days` + `Every 2,500 Operating Hrs` +
  snippet `IF (NOW() >= LAST_DATE + 90d)...`), 5 baris plan + 5 link WO,
  queue 4 Ready + batch 1200ms + toast, chart SVG, workload 92/64/78%,
  Modbus `10.14.0.8:502` — semua cocok.
- Missing pass-1 (`/work-orders/[id]` HIGH, form New/edit plan, checklist
  `CL-HVAC-Q`, shift plan) terkonfirmasi.
- Tiga Temuan pass-1 terkonfirmasi: ambang meter `2,500` vs `5,000` dalam satu
  matriks, `PM-PLN-0099` hanya di queue (tidak di 5 baris tabel halaman 1),
  nomor WO era campur (`WO-2024-*`/`WO-2025-*` vs `WO-2026-*` di hub lain) —
  ketiganya **luput dari pass-2 saya** dan diakui sebagai kelalaian.

### (b) Temuan BARU yang luput di pass-1

- **Endpoint simulasi + drawer plan eksplisit.** Pass-1 tidak mengkontrakkan
  `POST /api/v1/pm-plans/simulate-run` (simulasi tanpa dispatch) dan bentuk
  route drawer `/preventive-maintenance/[planId]` untuk ikon edit/checklist —
  pass-2 menambah keduanya agar aksi `Simulate Generation Run` dan ikon baris
  punya kontrak.
  `// TODO: Contract simulate-run endpoint and PM plan drawer route`
- **Detail buffer pra-dispatch.** Label `Buffer Start: 07 May 2025` +
  `Stage: Pre-Dispatch` dan catatan kapasitas per item (`Shift Capacity
  Stall`, `Fuel Reservoir OK`, `Parts Staged (Bin 4A)`) adalah sinyal
  kesiapan dispatch yang tidak dibahas pass-1; berguna untuk sorting
  `ready-first` yang pass-1 usulkan.

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Jumlah kategori pass-1 (14+8+10+6 = 38 ✓)
  konsisten dengan total. Satu penajaman: pass-1 menaruh shift plan LOW;
  pass-2 menilai MEDIUM karena `Shift Plan →` + `Shift Calendar View`
  menggantung di 3 hub (pola global, bukan satu tombol). Bukan kesalahan,
  hanya usulan prioritas.
