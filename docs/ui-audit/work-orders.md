# UI Audit — Work Order Management & Execution Hub (`work_order_management_execution_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/work_order_management_execution_hub/code.html` (651 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/work-orders`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Work Order Management & Execution Hub** adalah meja eksekusi teknisi untuk
satu work order mission-critical yang sedang berjalan: `WO-2026-0894`
(Liebert PAC 50kW Precision Chiller #2, tag `AST-HVAC-014`, Data Center Room DC-04,
berasal dari `SR-2026-0894` pelapor Sarah Jenkins). Berbeda dari dashboard yang
memantau banyak WO, halaman ini adalah **detail eksekusi satu WO**: checklist
prosedur langkah-demi-langkah, pencatatan jam kerja, pemakaian parts, telemetri
chiller live, dan sign-off kepatuhan — semuanya dalam satu layar split-pane.

Halaman ini sekaligus menampilkan **pipeline 7 tahap** (ringkasan 42 WO) sebagai
konteks antrean, plus view switcher `List View (42)` / `Kanban (7 Lanes)` /
`Calendar (Shift A/B)` — tetapi konten yang dirender mockup adalah **mode detail
satu WO**, bukan daftar. Saat rebuild, ini sebaiknya dipecah menjadi
`/work-orders` (daftar/kanban) + `/work-orders/[id]` (layar ini).

### Daftar elemen UI utama

1. **Breadcrumb + status eksekusi** — `Home / Core Operations / Work Orders /`
   + chip mono `WO-2026-0894` + teks hijau `• In Progress Execution`.
2. **Title bar & action cluster** — H1 `Work Order Management & Execution Hub`,
   pill `IN PROGRESS (P1 CRITICAL)` dengan pulse merah, chip `HTMX Poll: 10s`,
   view switcher tersegmentasi (List 42 / Kanban 7 Lanes aktif / Calendar),
   tombol `Export WO Log`, `Shift Handover`, `+ Create WO` (primary).
3. **Pipeline 7 tahap** — kartu `DRAFT (3)` → `OPEN (8)` → `ASSIGNED (11)` →
   `IN PROGRESS (6, highlighted)` → `ON HOLD (4)` → `COMPLETED (8)` →
   `CANCELLED (2)`; total 3+8+11+6+4+8+2 = **42**, konsisten dengan
   `List View (42)`. Badge `94.8% SLA Compliance`, hint `Drag lanes to
   reprioritize • Hotkey [Ctrl + K] Filter Active`.
4. **Header eksekusi WO (panel gelap)** — badge `CRITICAL SLA`, ID mono
   `WO-2026-0894`, tag telemetri `AST-HVAC-014`, konteks aset/lokasi/SR asal,
   **SLA countdown `42m 15s remaining`** (JS `setInterval`, hitung mundur live),
   toolbar transisi state: `Resume / Timer Running`, `Put On Hold`,
   `Escalate to Vendor`, `Print Work Permit`, `Mark Task Complete (Sign-off)`.
5. **Checklist prosedur eksekusi (kiri, 7 kolom)** — header
   `Step 4 of 5 Active (60% Verified)` + progress bar; Step 01 LOTO
   (`VERIFIED`, foto bukti `loto_breaker_isolated.jpg`, 2.4 MB, tombol
   `View Evidence`); Step 02 deteksi kebocoran refrigeran (`0.0 PPM NOMINAL`,
   sensor Inficon D-TEK Stratus); Step 03 uji kontaktor (`PASSED`, Fluke 1587 FC);
   Step 04 aktif `Replace Worn Primary Shaft Mechanical Seal` (`IN PROGRESS`,
   SKU `PART-SEAL-8821`, textarea catatan teknisi + torsi 45 Nm, dropzone
   evidence wajib, tombol `Capture Camera`, `Request Tech Assist`,
   `Save Step Progress (hx-patch)`); Step 05 terkunci (`LOCKED`,
   re-evakuasi + audit Delta-T 10–12°F).
6. **Telemetri chiller live** — 4 tile: `Supply Temp 54.2°F ▲ +2.8°F (Elevated)`,
   `Return Temp 68.1°F (Delta-T 13.9°F)`, `Suction Press. 118 PSI Nominal (R-410A)`,
   `Compressor Run 4,812 hrs (Next PM: 5,000 hrs)`; label
   `Modbus Bus: 192.168.4.112:502`.
7. **Labor & time clock (kanan, 5 kolom)** — stopwatch besar `01:42:18`
   (JS live) untuk Marcus Kowalski (Lead HVAC Spec., `$65.00/hr std`),
   badge `ACTIVE CLOCK`, roster T. Chen (Apprentice, `01:15:00 logged`,
   Badge `#TECH-409`), form `Quick Log Supplemental Work`
   (duration + `ACT-REPAIR`/`ACT-DIAGNOSTIC`/`ACT-TESTING` + `+ Log Time`).
8. **Parts & consumables ledger** — total `$1,735.00`:
   `PART-SEAL-8821` Silicon Carbide Mechanical Seal 2.5" `$1,420.00` (1 pc,
   dispensed & installed), `PART-LUB-09` POE Lubricant ISO 68 `$195.00`
   (1 pail), `PART-FLTR-401` MERV 14 Filter `$120.00` (2 pcs, reserved Locker 4B);
   tombol `+ Requisition Additional Part (Inventory Drawer)`.
9. **Compliance & chain of custody** — `OSHA 1910.147`; matriks sign-off
   (Lead Tech Marcus Kowalski `SIGNED` via Smart Badge 14:18 UTC; Facility Mgr
   Marcus Vance `PENDING` menunggu Step 5); hash imutabel
   `SHA-256: 7f8c92a10b48...3a19` + `VERIFIED LEDGER`.

### State UI

- **Empty state:** pipeline lane berisi 0 WO → kartu lane kosong + teks
  "Belum ada work order pada tahap ini"; checklist tanpa step → pesan +
  tombol `+ Create WO`; ledger tanpa parts → "Belum ada parts terpakai";
  telemetri terputus → tile menampilkan `-` + badge `OFFLINE`.
- **Loading state:** skeleton untuk kartu pipeline, header WO, dan tiap step
  card; stopwatch menampilkan `--:--:--` sampai clock stream tersambung;
  tombol `Save Step Progress` menampilkan spinner inline tanpa mengubah lebar.
- **Error state:** SLA countdown basi (>10s tanpa poll) → tambahkan label
  `STALE`; save step gagal → toast destruktif + textarea mempertahankan draft
  (`Autosaved 2 min ago` tetap terlihat); eskalasi vendor gagal → tombol
  kembali ke state semula + toast retry.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path` identik dengan
4 layar batch lain, header `+ New Dispatch / Request` + ikon notifikasi).
Semua `href="#"` — target di bawah adalah route usulan
(lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: 15 item (`work-orders` aktif) | `/operations`, `/work-orders` (halaman ini), `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` — EXISTS (mockup) |
| Breadcrumb `Home / Core Operations / Work Orders / WO-2026-0894` | `Home` → `/`; segmen tengah grup, bukan route; chip WO → `/work-orders/WO-2026-0894` (halaman ini sebagai detail) |
| View switcher List / Kanban / Calendar | Query params `?view=list\|kanban\|calendar` di `/work-orders`, bukan navigasi |
| Lane pipeline (klik/drag) | Filter `?stage=in_progress` di `/work-orders`; drag antar-lane = aksi `PATCH` status, bukan navigasi |
| `+ Create WO` | Modal `POST /api/v1/work-orders` (tetap di halaman) |
| `Export WO Log` | Async job export → unduh file (terkait `/reports`) — MISSING (target tak terdefinisi) |
| `Shift Handover` | Halaman/panel shift handover — MISSING |
| `Resume / Timer Running`, `Put On Hold`, `Escalate to Vendor`, `Mark Task Complete` | Aksi API inline (`POST /api/v1/work-orders/:id/...`), tetap di halaman |
| `Print Work Permit` | Print view work permit — MISSING |
| `View Evidence` (Step 01) | Evidence/lightbox viewer — MISSING |
| `Request Tech Assist` | Flow permintaan bantuan (dispatch assist) — MISSING |
| `+ Requisition Additional Part` | Drawer inventaris (`/inventory` dengan konteks WO) — MISSING (prefill flow) |
| Chip aset `AST-HVAC-014` | `/assets/AST-HVAC-014` — EXISTS (mockup `asset_detail_*`) |
| Referensi `SR-2026-0894` | `/service-requests?ticket=SR-2026-0894` — EXISTS (halaman triage, tanpa deep-link tiket) |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` sebagai route mandiri (HIGH)** — layar ini secara
   de-facto adalah halaman detail `WO-2026-0894`, tetapi tidak ada route
   `/work-orders` (daftar/kanban) yang menaut ke sini; view switcher dan
   lane pipeline tidak punya tujuan daftar. Pecah menjadi daftar + detail.
   `// TODO: Create list route /work-orders and detail routing for /work-orders/[id]`
2. **Print view work permit (LOW)** — `Print Work Permit` tanpa tujuan cetak.
3. **`Shift Handover` (LOW)** — tersebar di WO hub, PM hub, field hub tanpa
   tujuan seragam (konsisten dengan `navigation-audit.md` §4 item 10).
4. **Evidence viewer (MEDIUM)** — `View Evidence` dan dropzone foto Step 04
   butuh lightbox/galeri bukti dengan hash verifikasi.
5. **Drawer requisition parts / prefill asset (MEDIUM)** — alur
   `+ Requisition Additional Part` butuh konvensi query (`?workOrder=`,
   `?asset=`) ke `/inventory`, bukan halaman baru.
   `// TODO: Agree prefill query convention for inventory requisition drawer`

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN** + config inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/telemetri),
  ikon **Material Symbols Outlined**.
- Interaktivitas hanya JS vanilla demo: `setInterval` countdown SLA +
  stopwatch labor, tanpa fetch (`hx-patch`/`hx-post` hanya label teks).
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/work-orders/[id]` (server component untuk header + checklist, client component untuk timer interaktif); typing `WorkOrder`, `ExecutionStep`, `TimeEntry`, `PartsLine`, `SignOff`. |
| **Tailwind CSS (build, bukan CDN)** | Styling split-pane 7/5 kolom, kartu pipeline, panel gelap eksekusi. Token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Progress`, `Textarea`, `Input`, `Select`, `Table`, `Avatar`, `Skeleton`, `Toast`, `Checkbox` | Pipeline lane, pill status/SLA, toolbar state, progress checklist, form quick-log labor, ledger parts, matriks sign-off, skeleton/toast. |
| **lucide-react** | Pengganti Material Symbols (ikon play, pause, printer, timer, inventory, shield-check). |
| **SWR atau TanStack Query** | Poll `HTMX Poll: 10s` untuk SLA clock, checklist, dan telemetri; penanda `STALE` saat poll basi; autosave textarea dengan debounce. |
| **axios** (atau `fetch` + `ky`) | HTTP client dengan interceptor auth + base URL `/api/v1`. |
| **date-fns + date-fns-tz** | Format countdown SLA (`42m 15s remaining`), stopwatch (`01:42:18`), timestamp UTC (`14:18 UTC`). |
| **react-dropzone + camera capture API** | Dropzone evidence Step 04 + `Capture Camera` via `getUserMedia` pada tablet. |
| **zod + react-hook-form** | Validasi quick-log labor dan catatan teknisi (required sebelum sign-off Step 5). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/work-orders/pipeline` | On page load (kartu 7 tahap) | Response: `{ "data": { "stages": [{ "stage": "DRAFT", "count": 3 }, { "stage": "OPEN", "count": 8 }, { "stage": "ASSIGNED", "count": 11 }, { "stage": "IN_PROGRESS", "count": 6 }, { "stage": "ON_HOLD", "count": 4 }, { "stage": "COMPLETED", "count": 8 }, { "stage": "CANCELLED", "count": 2 }], "slaCompliance": 0.948 } }` |
| GET | `/api/v1/work-orders/:id` | On page load (header eksekusi + konteks) | Response: `{ "data": { "id": "WO-2026-0894", "priority": "P1-CRITICAL", "status": "IN_PROGRESS", "assetId": "AST-HVAC-014", "assetName": "Liebert PAC 50kW Precision Chiller #2", "location": "Data Center Room DC-04 (Raised Floor Grid 12B)", "sourceRequestId": "SR-2026-0894", "slaDueAt": "2026-09-13T14:57:00Z" } }` |
| GET | `/api/v1/work-orders/:id/steps` | On page load (checklist 5 step) | Response: `{ "data": [{ "seq": 1, "title": "LOTO Safety Protocol Verification & Breaker Lockout", "state": "VERIFIED", "evidence": [{ "file": "loto_breaker_isolated.jpg", "sizeMb": 2.4, "by": "Marcus Kowalski", "at": "14:15 UTC" }] }, { "seq": 4, "title": "Replace Worn Primary Shaft Mechanical Seal", "state": "IN_PROGRESS", "sku": "PART-SEAL-8821" }] }` |
| PATCH | `/api/v1/work-orders/:id/steps/:seq` | On click `Save Step Progress (hx-patch)` + autosave textarea | Body: `{ "notes": "Old seal removed, carbon face scored...", "torqueNm": 45, "evidenceIds": ["ev-101"] }`. Response: `{ "data": { "seq": 4, "state": "IN_PROGRESS", "autosavedAt": "..." } }` |
| POST | `/api/v1/work-orders/:id/resume` | On click `Resume / Timer Running` | Body: `{}`. Response: `{ "data": { "id": "WO-2026-0894", "timerState": "RUNNING" } }` |
| POST | `/api/v1/work-orders/:id/hold` | On click `Put On Hold` | Body: `{ "reason": "PARTS_WAITING" }`. Response: `{ "data": { "id": "WO-2026-0894", "status": "ON_HOLD" } }` |
| POST | `/api/v1/work-orders/:id/escalate` | On click `Escalate to Vendor` | Body: `{ "vendorId": "...", "note": "..." }`. Response: `{ "data": { "id": "WO-2026-0894", "escalatedTo": "vendor-..." } }` |
| POST | `/api/v1/work-orders/:id/complete` | On click `Mark Task Complete (Sign-off)` | Body: `{ "signOff": { "by": "tech-...", "method": "SMART_BADGE" } }`. Response: `{ "data": { "id": "WO-2026-0894", "status": "COMPLETED" } }` |
| GET | `/api/v1/work-orders/:id/time-entries` | On page load (panel labor + poll) | Response: `{ "data": { "lead": { "name": "Marcus Kowalski", "elapsedSec": 6138, "ratePerHour": 65.0 }, "crew": [{ "name": "T. Chen", "loggedSec": 4500, "badge": "TECH-409" }] } }` |
| POST | `/api/v1/work-orders/:id/time-entries` | On submit `+ Log Time` | Body: `{ "durationHours": 0.5, "activity": "ACT-REPAIR" }`. Response: `{ "data": { "id": "te-301", "durationHours": 0.5 } }` |
| GET | `/api/v1/work-orders/:id/parts` | On page load (ledger `$1,735.00`) | Response: `{ "data": [{ "sku": "PART-SEAL-8821", "name": "Silicon Carbide Mechanical Seal 2.5\\"", "qty": 1, "unit": "pc", "amount": 1420.0, "state": "INSTALLED" }] }` |
| POST | `/api/v1/work-orders/:id/parts/requisition` | On click `+ Requisition Additional Part` | Body: `{ "sku": "PART-FLTR-401", "qty": 2 }`. Response: `{ "data": { "requisitionId": "REQ-5520", "state": "RESERVED" } }` |
| GET | `/api/v1/work-orders/:id/signoffs` | On page load (matriks compliance) | Response: `{ "data": { "standard": "OSHA 1910.147", "ledgerHash": "7f8c92a10b48...3a19", "signoffs": [{ "role": "LEAD_TECH", "by": "Marcus Kowalski", "state": "SIGNED", "at": "14:18 UTC" }, { "role": "FACILITY_MGR", "by": "Marcus Vance", "state": "PENDING" }] } }` |
| GET | `/api/v1/assets/:id/telemetry` | On page load + poll 10s (4 tile chiller) | Response: `{ "data": { "assetId": "AST-HVAC-014", "supplyTempF": 54.2, "returnTempF": 68.1, "suctionPsi": 118, "runHours": 4812, "bus": "192.168.4.112:502" } }` |
| POST | `/api/v1/evidence` | On upload/capture foto Step 04 | Body: `multipart/form-data (file, workOrderId, stepSeq)`. Response: `{ "data": { "id": "ev-101", "sha256": "7f8c..." } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/work-orders.mock.ts` selama backend belum siap.
Setiap blok wajib berkomentar `// TODO` dengan endpoint penggantinya.

```ts
// TODO: Replace pipeline mock with GET /api/v1/work-orders/pipeline
export const pipelineStages = [
  { stage: "DRAFT", count: 3, hint: "Pending Scope Sign-off" },
  { stage: "OPEN", count: 8, hint: "Unassigned Triage" },
  { stage: "ASSIGNED", count: 11, hint: "Techs Dispatched" },
  { stage: "IN_PROGRESS", count: 6, hint: "Active Floor Work (Selected)", active: true },
  { stage: "ON_HOLD", count: 4, hint: "Parts / Vendor Waiting" },
  { stage: "COMPLETED", count: 8, hint: "Closed Past 24h" },
  { stage: "CANCELLED", count: 2, hint: "Void / Duplicate" },
];

// TODO: Replace work order mock with GET /api/v1/work-orders/WO-2026-0894
export const activeWorkOrder = {
  id: "WO-2026-0894", priority: "P1-CRITICAL", status: "IN_PROGRESS",
  assetId: "AST-HVAC-014", assetName: "Liebert PAC 50kW Precision Chiller #2",
  location: "Data Center Room DC-04 (Raised Floor Grid 12B)",
  sourceRequestId: "SR-2026-0894", slaRemainingSec: 42 * 60 + 15,
};

// TODO: Replace steps mock with GET /api/v1/work-orders/WO-2026-0894/steps
export const executionSteps = [
  { seq: 1, title: "LOTO Safety Protocol Verification & Breaker Lockout", state: "VERIFIED" },
  { seq: 2, title: "Primary Refrigerant Loop Leak Detection", state: "VERIFIED", reading: "0.0 PPM NOMINAL" },
  { seq: 3, title: "Secondary Compressor Contactor & Coil Resistance Test", state: "PASSED" },
  { seq: 4, title: "Replace Worn Primary Shaft Mechanical Seal", state: "IN_PROGRESS", sku: "PART-SEAL-8821" },
  { seq: 5, title: "System Re-evacuation & Final Delta-T Thermography Audit", state: "LOCKED" },
];

// TODO: Replace labor mock with GET /api/v1/work-orders/WO-2026-0894/time-entries (poll 10s)
export const laborClock = {
  lead: { name: "Marcus Kowalski", elapsedSec: 6138, ratePerHour: 65.0 },
  crew: [{ name: "T. Chen", loggedSec: 4500, badge: "TECH-409" }],
};

// TODO: Replace parts mock with GET /api/v1/work-orders/WO-2026-0894/parts
export const partsLedger = [
  { sku: "PART-SEAL-8821", name: "Silicon Carbide Mechanical Seal 2.5\"", qty: 1, amount: 1420.0, state: "INSTALLED" },
  { sku: "PART-LUB-09", name: "Synthetic POE Lubricant ISO 68", qty: 1, amount: 195.0, state: "DEDUCTED" },
  { sku: "PART-FLTR-401", name: "MERV 14 Chilled Water Filter", qty: 2, amount: 120.0, state: "RESERVED" },
];

// TODO: Replace telemetry mock with GET /api/v1/assets/AST-HVAC-014/telemetry (poll 10s)
export const chillerTelemetry = {
  supplyTempF: 54.2, returnTempF: 68.1, suctionPsi: 118, runHours: 4812,
};

// TODO: Create list route /work-orders and detail routing for /work-orders/[id]
// TODO: Create print view for work permit (Print Work Permit button)
// TODO: Agree prefill query convention for inventory requisition drawer (?workOrder=WO-2026-0894)
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/work-orders/WO-2026-0894/steps', fetcher)
import { executionSteps } from "@/mocks/work-orders.mock";

export function ExecutionChecklist() {
  return (
    <div>
      {executionSteps.map((step) => (
        <div key={step.seq}>
          <span className="font-mono">STEP {String(step.seq).padStart(2, "0")}</span>
          <span>{step.title}</span>
          <Badge>{step.state}</Badge>
        </div>
      ))}
    </div>
  );
}
```

Aturan penggantian mock → API: hapus satu blok mock per endpoint yang sudah live,
ganti dengan `useSWR` + `Skeleton` saat `isLoading` + `Toast` saat `error`,
dan pertahankan struktur field agar komponen tidak berubah.

### Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Tag aset berbeda untuk pekerjaan seal chiller yang sama.** WO ini memakai
   `AST-HVAC-014` (Liebert PAC 50kW #2), sedangkan alur inspeksi
   (`field_inspections_audit_queue_hub`, `inspection_findings_auto_wo_conversion_desk`,
   `mobile_field_inspection_execution_desk`) memakai `AST-HVAC-004`
   (Chiller #04) untuk temuan kebocoran seal 18.4 ppm yang dikonversi menjadi
   `WO-2026-8802` — bukan `WO-2026-0894`. Putuskan mana work order hasil
   konversi yang kanonis.
2. **Bus Modbus berbeda.** Tile telemetri memakai `192.168.4.112:502`,
   sedangkan seluruh layar lain memakai gateway `10.14.0.8:502`.
3. **Harga `PART-SEAL-8821` tidak sama**: `$1,420.00` di sini vs `$1,450.00`
   di `inspection_findings_auto_wo_conversion_desk`. Normalisasi ke satu
   master price saat seeding.
