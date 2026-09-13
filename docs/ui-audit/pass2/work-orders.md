# UI Audit Pass-2 — Work Orders (`work_order_management_execution_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/work_order_management_execution_hub/code.html` (651 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2 independen, belum membandingkan pass-1).
> Konteks global: `docs/ui-audit/navigation-audit.md` (sidebar 15 `data-path`, semua `href="#"`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Work Order Management & Execution Hub** adalah meja eksekusi WO aktif:
satu WO kritis dikerjakan step-by-step sambil antrean pipeline 7 stage tetap
terlihat. Breadcrumb menegaskan konteks
`Home / Core Operations / Work Orders / WO-2026-0894 • In Progress Execution`.
Fokus bukan daftar WO, melainkan eksekusi `WO-2026-0894`
(Liebert PAC 50kW Precision Chiller #2, `AST-HVAC-014`, Data Center Room DC-04
Grid 12B, bersumber dari `SR-2026-0894` Sarah Jenkins) dengan SLA countdown
`42m 15s remaining` yang hidup via `setInterval`.

Alur kerja: pilih view (List 42 / Kanban 7 lanes / Calendar) → pantau pipeline
→ kerjakan checklist 5 step → catat labor + parts → sign-off berantai
(Lead Tech → Facility Mgr) → tandai complete.

### Daftar elemen UI utama

1. **Breadcrumb + status pill** — `WO-2026-0894` monospace + `• In Progress
   Execution`, pill `IN PROGRESS (P1 CRITICAL)` dengan pulse, badge
   `HTMX Poll: 10s`.
2. **Title bar + view switcher + action cluster** — H1
   `Work Order Management & Execution Hub`, segmented
   `List View (42)` / `Kanban (7 Lanes)` aktif / `Calendar (Shift A/B)`,
   tombol `Export WO Log`, `Shift Handover`, `+ Create WO` (primary).
3. **Pipeline 7 stage** — grid `DRAFT 3` / `OPEN 8` / `ASSIGNED 11` /
   `IN PROGRESS 6` (kartu biru aktif) / `ON HOLD 4` / `COMPLETED 8` /
   `CANCELLED 2` + label `94.8% SLA Compliance`, hint
   `Drag lanes to reprioritize • Hotkey [Ctrl+K] Filter Active`.
4. **Active WO header (dark card)** — badge `CRITICAL SLA`, ID mono
   `WO-2026-0894`, tag `AST-HVAC-014`, nama aset, lokasi, referensi
   `SR-2026-0894`, blok `Target Resolution SLA` + ikon alarm, toolbar
   `Resume / Timer Running`, `Put On Hold`, `Escalate to Vendor`,
   `Print Work Permit`, `Mark Task Complete (Sign-off)`.
5. **Execution checklist (kiri, 7 kolom)** — header `Step 4 of 5 Active
   (60% Verified)` + progress bar; Step 01 LOTO `VERIFIED` (teks gembok #M-44,
   tag #99201, foto `loto_breaker_isolated.jpg` 2.4 MB + `View Evidence`);
   Step 02 leak `0.0 PPM NOMINAL` (sensor Inficon D-TEK); Step 03 contactor
   `PASSED` (Fluke 1587, 0.81–0.82Ω, >500 MΩ); Step 04 aktif
   `Replace Worn Primary Shaft Mechanical Seal` (`SKU: PART-SEAL-8821`,
   instruksi Daikin OEM 45 Nm, textarea torque wrench #CAL-2025-98, upload box
   foto mandatory, `Autosaved 2 min ago`, `Request Tech Assist`,
   `Save Step Progress (hx-patch)`); Step 05 `LOCKED` re-evacuation Delta-T
   10–12°F; strip telemetri 4 tile (Supply 54.2°F Elevated, Return 68.1°F
   Delta-T 13.9°F, Suction 118 PSI R-410A, Run 4,812 hrs Next PM 5,000 hrs,
   Modbus 192.168.4.112:502).
6. **Labor clock (kanan, 5 kolom)** — `ACTIVE CLOCK`, stopwatch besar
   `01:42:18` (`laborStopwatch`) Marcus Kowalski $65/hr + tombol pause,
   roster T. Chen `01:15:00 logged` Badge #TECH-409, form Quick Log
   (Duration + ACT-REPAIR/DIAGNOSTIC/TESTING + `+ Log Time`).
7. **Parts ledger** — total `$1,735.00`, 3 baris (`PART-SEAL-8821` $1,420
   dispensed -1 Bin Central, `PART-LUB-09` $195 -1 pail cart, `PART-FLTR-401`
   $120 reserved Locker 4B) + `+ Requisition Additional Part`.
8. **Compliance & Chain of Custody** — OSHA 1910.147, Lead Tech SIGNED via
   Smart Badge 14:18 UTC, Facility Mgr Marcus Vance PENDING menunggu Step 5,
   hash `SHA-256: 7f8c92a10b48...3a19 VERIFIED LEDGER`.
9. **Script live timer** — `slaCountdown` dan `laborStopwatch` via
   `setInterval` 1s (simulasi demo, bukan HTMX nyata).

### State UI

- **Empty state:** pipeline lane 0 → angka 0 + bar kosong + teks "Belum ada WO
  pada stage ini"; checklist tanpa step → pesan + tombol `+ Create WO`;
  ledger kosong → "Belum ada parts terpakai".
- **Loading state:** kartu pipeline + checklist + stopwatch memakai `Skeleton`;
  tombol `Save Step Progress` menampilkan spinner tanpa mengubah lebar;
  tile telemetri shimmer saat poll 10s.
- **Error state:** poll gagal → badge `HTMX Poll` merah + `STALE`; save gagal →
  toast destruktif + textarea tetap; SLA breach (countdown 0) → pill berubah
  `BREACHED` + picu eskalasi VP.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path`, header `+ New Dispatch / Request`
+ notifikasi). Semua `href="#"` — target adalah route usulan sesuai
`navigation-audit.md` §2.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Work Orders (badge 14 di screen, aktif logis) | `/work-orders` (halaman ini) |
| Sidebar 14 item lain | `/operations`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` |
| Breadcrumb `Home / Core Operations / Work Orders / WO-2026-0894` | `Home` → `/`; grup `Core Operations` bukan route; segmen WO → `/work-orders/[id]` (usulan) |
| `List View (42)` / `Kanban (7 Lanes)` / `Calendar (Shift A/B)` | Query `?view=list\|kanban\|calendar` di halaman ini, bukan navigasi |
| Lane pipeline (klik/drag) | Filter `?stage=IN_PROGRESS` / reorder via API (tetap di halaman) |
| `+ Create WO` | Modal `POST /api/v1/work-orders` (tetap di halaman) |
| `Export WO Log` | Async job unduh CSV/PDF (terkait `/reports`) |
| `Shift Handover` | Halaman/modal handover shift — MISSING |
| `SR-2026-0894 (Sarah Jenkins)` | `/service-requests/SR-2026-0894` — MISSING (detail SR tak ada) |
| `AST-HVAC-014` | `/assets/AST-HVAC-014` |
| `Resume / Put On Hold / Escalate / Print / Mark Complete` | Aksi API inline, tetap di halaman (print → view cetak — MISSING) |
| `View Evidence` / `Capture Camera` | Viewer/upload bukti (modal atau `/work-orders/[id]/evidence`) — MISSING |
| `Request Tech Assist` | Flow assist (assign tambahan) — MISSING |
| `+ Requisition Additional Part` | Drawer inventory `/inventory?wo=WO-2026-0894` (prefill flow) — MISSING |
| Ikon `notifications` (header global) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — halaman ini sendiri adalah detail WO
   `WO-2026-0894` tetapi tidak ada route kanonis; baris List View (42) dan
   semua referensi WO lintas hub menggantung.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Shift handover view (MEDIUM)** — tombol `Shift Handover` tanpa tujuan;
   butuh halaman/modal serah terima (checklist terbuka, timer berjalan, parts).
   `// TODO: Create shift handover flow for /work-orders/[id]/handover`
3. **Print Work Permit view (LOW)** — tombol cetak tanpa target; butuh layout
   cetak LOTO + sign-off.
   `// TODO: Create print view for /work-orders/[id]/permit`
4. **Evidence viewer (MEDIUM)** — `View Evidence` / upload box tanpa rute;
   putuskan modal vs `/work-orders/[id]/evidence`.
   `// TODO: Create evidence viewer routing for /work-orders/[id]/evidence`
5. **Target global `+ New Dispatch / Request` (MEDIUM)** — perilaku tombol
   header tak seragam lintas 16 halaman; putuskan command palette + modal
   kontekstual.
6. **Global search `Ctrl+K` (LOW)** — hint ada di pipeline tetapi tidak ada
   implementasi lintas entitas.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + `tailwind.config` inline,
  font Inter + JetBrains Mono, ikon Material Symbols Outlined.
- Satu-satunya "live" adalah `setInterval` demo untuk SLA countdown dan
  stopwatch; label `hx-patch`/`HTMX Poll` hanya teks, tidak ada request nyata.
- Tanpa framework, routing, fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/work-orders` + `/work-orders/[id]` dengan `view` via `searchParams`; typing `WorkOrder`, `WoStep`, `PartsLine`, `TimeEntry`. |
| **Tailwind CSS (build)** | Layout 12-kolom, kartu pipeline, dark card, checklist; token sistem A. |
| **shadcn/ui (Radix)** — `Button`, `Badge`, `Tabs`, `Progress`, `Table`, `Textarea`, `Input`, `Select`, `Avatar`, `Skeleton`, `Toast`, `Dialog` | View switcher, pill status, progress checklist, form quick-log, modal Create WO / evidence / handover. |
| **lucide-react** | Pengganti Material Symbols (timer, pause, printer, shield, inventory). |
| **SWR / TanStack Query** | Poll WO + telemetri tiap 10s dengan penanda `STALE`; autosave notes dengan debounce. |
| **axios / fetch + ky** | HTTP client base `/api/v1` + auth interceptor. |
| **date-fns + date-fns-tz** | Countdown SLA `42m 15s`, stopwatch `01:42:18`, timestamp `14:18 UTC`. |
| **zod + react-hook-form** | Validasi quick-log (duration, activity) dan Create WO. |
| **next-pwa / service worker** (untuk foto) | Upload bukti kamera tablet dengan retry offline. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Reverse-engineering dari UI. Response `{ data, meta }`, error
`{ error: { code, message } }`.

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/work-orders?view=kanban&stage=&page=` | List/pipeline WO (42 item, count 7 lane) | On page load + ganti view/lane/filter |
| GET | `/api/v1/work-orders/WO-2026-0894` | Detail WO aktif + SLA + relasi SR/asset | On page load (poll 10s untuk SLA/telemetri) |
| GET | `/api/v1/work-orders/WO-2026-0894/steps` | 5-step checklist + status VERIFIED/PASSED/IN_PROGRESS/LOCKED | On page load |
| PATCH | `/api/v1/work-orders/WO-2026-0894/steps/STEP-04` | Simpan notes + torque + status step (ganti `hx-patch` demo) | On click `Save Step Progress` / autosave |
| POST | `/api/v1/work-orders` | Buat WO baru | On submit `+ Create WO` |
| POST | `/api/v1/work-orders/WO-2026-0894/timer:resume` | Resume timer labor | On click `Resume / Timer Running` |
| POST | `/api/v1/work-orders/WO-2026-0894/hold` | Put on hold (alasan parts/vendor) | On click `Put On Hold` |
| POST | `/api/v1/work-orders/WO-2026-0894/escalate` | Eskalasi ke vendor + VP saat breach | On click `Escalate to Vendor` / SLA breach |
| POST | `/api/v1/work-orders/WO-2026-0894/complete` | Sign-off complete (cek Step 5 + LOTO + foto) | On click `Mark Task Complete` |
| GET | `/api/v1/work-orders/WO-2026-0894/telemetry` | Telemetri chiller live (4 tile + Modbus) | Poll 10s |
| GET | `/api/v1/work-orders/WO-2026-0894/time-entries` | Labor entries + elapsed | On page load + poll lambat |
| POST | `/api/v1/work-orders/WO-2026-0894/time-entries` | Quick log supplemental | On click `+ Log Time` |
| GET | `/api/v1/work-orders/WO-2026-0894/parts` | Ledger parts $1,735 | On page load |
| POST | `/api/v1/work-orders/WO-2026-0894/parts/requisitions` | Requisition part tambahan | On click `+ Requisition Additional Part` |
| POST | `/api/v1/work-orders/WO-2026-0894/evidence` | Upload foto QA (multipart) | On drop/capture foto |
| GET | `/api/v1/work-orders/WO-2026-0894/signoffs` | Matrix Lead SIGNED / Mgr PENDING + hash SHA-256 | On page load |
| POST | `/api/v1/work-orders/WO-2026-0894/assist-requests` | Minta bantuan teknisi | On click `Request Tech Assist` |

Contoh fetch (ganti mock):

```ts
// TODO: Replace mock with GET /api/v1/work-orders/WO-2026-0894
const res = await fetch("/api/v1/work-orders/WO-2026-0894");
const { data } = await res.json(); // { id, priority, slaDueAt, assetId, stage }
```

```ts
// TODO: Replace hx-patch demo with PATCH /api/v1/work-orders/WO-2026-0894/steps/STEP-04
await axios.patch("/api/v1/work-orders/WO-2026-0894/steps/STEP-04", {
  notes: "Torquing new Daikin OEM seal to 45 Nm ...",
  torqueNm: 45, wrenchId: "CAL-2025-98",
});
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/work-orders.mock.ts` sampai backend live. Semua blok berlabel
`// TODO`.

```ts
// TODO: Replace pipeline mock with GET /api/v1/work-orders?view=kanban
export const pipelineStages = [
  { stage: "DRAFT", count: 3, note: "Pending Scope Sign-off" },
  { stage: "OPEN", count: 8, note: "Unassigned Triage" },
  { stage: "ASSIGNED", count: 11, note: "Techs Dispatched" },
  { stage: "IN_PROGRESS", count: 6, note: "Active Floor Work (Selected)" },
  { stage: "ON_HOLD", count: 4, note: "Parts / Vendor Waiting" },
  { stage: "COMPLETED", count: 8, note: "Closed Past 24h" },
  { stage: "CANCELLED", count: 2, note: "Void / Duplicate" },
];

// TODO: Replace WO detail mock with GET /api/v1/work-orders/WO-2026-0894
export const activeWorkOrder = {
  id: "WO-2026-0894", priority: "P1-CRITICAL", status: "IN_PROGRESS",
  assetId: "AST-HVAC-014", assetName: "Liebert PAC 50kW Precision Chiller #2",
  location: "Data Center Room DC-04 (Raised Floor Grid 12B)",
  sourceRequestId: "SR-2026-0894", slaRemainingSec: 42 * 60 + 15,
  slaCompliance: 0.948,
};

// TODO: Replace steps mock with GET /api/v1/work-orders/WO-2026-0894/steps
export const executionSteps = [
  { code: "STEP-01", title: "LOTO Safety Protocol Verification & Breaker Lockout", status: "VERIFIED", evidence: "loto_breaker_isolated.jpg", meta: "Padlock #M-44 • Tag #99201" },
  { code: "STEP-02", title: "Primary Refrigerant Loop Leak Detection", status: "NOMINAL", reading: "0.0 PPM", sensor: "Inficon D-TEK Stratus" },
  { code: "STEP-03", title: "Secondary Compressor Contactor & Coil Resistance Test", status: "PASSED", reading: "0.81-0.82Ω, >500 MΩ" },
  { code: "STEP-04", title: "Replace Worn Primary Shaft Mechanical Seal", status: "IN_PROGRESS", sku: "PART-SEAL-8821", torqueNm: 45 },
  { code: "STEP-05", title: "System Re-evacuation & Final Delta-T Audit", status: "LOCKED" },
];

// TODO: Replace telemetry mock with GET /api/v1/work-orders/WO-2026-0894/telemetry (poll 10s via SWR)
export const chillerTelemetry = {
  supplyF: 54.2, returnF: 68.1, deltaT: 13.9, suctionPsi: 118,
  runHours: 4812, nextPmHours: 5000, bus: "192.168.4.112:502",
};

// TODO: Replace labor mock with GET /api/v1/work-orders/WO-2026-0894/time-entries
export const laborClock = {
  lead: { name: "Marcus Kowalski", elapsed: "01:42:18", rateUsd: 65 },
  assist: { name: "T. Chen", logged: "01:15:00", badge: "TECH-409" },
};

// TODO: Replace parts mock with GET /api/v1/work-orders/WO-2026-0894/parts
export const partsLedger = [
  { sku: "PART-SEAL-8821", desc: "Silicon Carbide Mechanical Seal 2.5\"", qty: "1 pc", amount: 1420.0 },
  { sku: "PART-LUB-09", desc: "Synthetic POE Lubricant ISO 68", qty: "1 pail (5 gal)", amount: 195.0 },
  { sku: "PART-FLTR-401", desc: "MERV 14 Chilled Water Filter", qty: "2 pcs", amount: 120.0 },
];

// TODO: Replace signoff mock with GET /api/v1/work-orders/WO-2026-0894/signoffs
export const signoffs = {
  lead: { name: "Marcus Kowalski", state: "SIGNED", at: "14:18 UTC" },
  manager: { name: "Marcus Vance", state: "PENDING" },
  hash: "SHA-256: 7f8c92a10b48...3a19",
};
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/work-orders/WO-2026-0894/steps', fetcher)
import { executionSteps } from "@/mocks/work-orders.mock";

export function ExecutionChecklist() {
  return (
    <ol>
      {executionSteps.map((s) => (
        <li key={s.code} className="font-mono">
          {s.code} — {s.title} [{s.status}]
        </li>
      ))}
    </ol>
  );
}
```

Aturan ganti mock → API: satu blok per endpoint, pakai `useSWR` + `Skeleton`
saat loading + `Toast` saat error, pertahankan field agar komponen stabil.

## 7. PERBANDINGAN PASS-1 vs PASS-2

Dibaca setelah seksi 1–6 selesai: `docs/ui-audit/work-orders.md` (pass-1).

### (a) Temuan pass-1 yang TERKONFIRMASI

- Pipeline 7 stage + hitungan (3/8/11/6/4/8/2) dan badge `94.8% SLA Compliance`,
  countdown `42m 15s` via `setInterval`, checklist 5 step (LOTO → leak → contactor
  → seal `PART-SEAL-8821` → re-evacuation), stopwatch `01:42:18`, ledger
  `$1,735.00` (3 SKU), OSHA 1910.147 + hash SHA-256 — semua cocok dengan
  `code.html` + `screen.png`.
- Verifikasi aritmetika pass-1 (3+8+11+6+4+8+2 = **42** = `List View (42)`)
  benar dan **luput saya verifikasi di pass-2** — akui sebagai kelalaian pass-2.
- Missing pages pass-1 (`/work-orders/[id]`, print permit, handover, evidence
  viewer, requisition prefill) terkonfirmasi; semuanya `href="#"` di mockup.
- Tiga inkonsistensi pass-1 terkonfirmasi via grep: pekerjaan seal ganda
  (`WO-2026-0894`/`AST-HVAC-014` vs `WO-2026-8802`/`AST-HVAC-004` hasil konversi
  findings), bus Modbus `192.168.4.112:502` vs `10.14.0.8` di layar lain,
  harga `PART-SEAL-8821` `$1,420.00` vs `$1,450.00` di findings desk.

### (b) Temuan BARU yang luput di pass-1

- **Highlight sidebar salah di mockup.** HTML menandai `Operations Dashboard`
  (`data-path="operations-dashboard"`, `aria-current="page"`, kelas aktif)
  sementara link `Work Orders` tidak aktif — padahal ini halaman WO.
  Produksi wajib mengaktifkan item sesuai route, bukan hardcode.
  `// TODO: Fix sidebar active state to follow current route`
- **Spesifikasi sensor terperinci.** Step 02 `Inficon D-TEK Stratus`, Step 03
  `Fluke 1587 FC` + bacaan `0.81–0.82Ω, >500 MΩ`, kunci torsi
  `#CAL-2025-98` 45 Nm, `Tag #99201` — pass-1 menyebut sensor sekilas tanpa
  nomor alat/bacaan yang penting untuk kalibrasi.
- **Placeholder search header spesifik WO.** `Search Work Orders (WO-#),
  Assets (AST-#), or Parts...` — bukan search global; relevan untuk desain
  `⌘K` global (LOW di kedua pass).

### (c) KOREKSI atas pass-1

- **Status link `SR-2026-0894` overstated sebagai EXISTS.** Pass-1 menulis
  referensi SR → `/service-requests?ticket=...` sebagai EXISTS, tetapi
  `navigation-audit.md` §4 item 5 menegaskan `/service-requests/[id]` MISSING
  dan riwayat per tiket belum terdefinisi. Koreksi: statusnya **parsial**
  (query-param seleksi ada, deep-link tidak) — samakan dengan rumusan
  `navigation-audit.md`, bukan EXISTS penuh.
- **Prioritas handover.** Pass-1 menaruh `Shift Handover` LOW; mengingat tombol
  yang sama menggantung di WO + PM + field hub (pola global), pass-2 menilai
  MEDIUM sebagai pola lintas-hub. Bukan kesalahan fatal, melainkan penajaman
  prioritas.
