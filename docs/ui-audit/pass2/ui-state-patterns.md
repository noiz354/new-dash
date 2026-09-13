# UI Audit Pass-2 — UI State Variants & Patterns (`ui_state_variants_patterns`)

> Sumber: `stitch_facility_maintenance_platform_ui/ui_state_variants_patterns/code.html` (451 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> **Bukan route** — ini kontrak komponen/pola state untuk dipakai semua halaman.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Diacu global: `docs/ui-audit/navigation-audit.md` (§2, §4.14).

## 1. Page Overview & UI Elements (Kontrak Komponen)

### Tujuan

Spesifikasi state interaktif lintas-halaman: empty/zero-state, validasi form +
banner offline + toast error, lifecycle async HTMX (skeleton, hover, fokus,
kanban). Header `Design System Spec / Workspace Runtime` + H1
`Interactive UI State Matrix & Pattern Spec` + badge `HTMX v1.9.12 Active` +
tombol `Toggle Error Toast` (`#state-toast`) menegaskan ini lab pola, bukan
halaman operasional.

### Inventaris pola (3 grup bernomor)

**01 — Zero-State & Empty Queue Patterns (2 kartu):**
- `STATUS: CLEAN QUEUE • SLA RISK 0.0%` / `POLL: 30s INTERVAL`:
  `All Caught Up! No Pending Service Requests` (semua request occupant/telemetri/BMS
  sudah triase/konversi WO); footer `Auto-syncing via HTMX worker` +
  `View Archived Requests` + `Submit New Request`.
- `WAREHOUSE HEALTH: 100% NOMINAL` / `SKU INDEX: 1,420 ACTIVE`:
  `Optimal Stock Levels • No Critical Low-Stock SKUs` (1,420 SKU: filter MERV,
  bearing, seal, lubricant di atas par); footer `Safety buffers enforced` +
  `Review Par Levels` + `Create Requisition`.

**02 — Validation Architecture & Alert Topography:**
- Form `Work Order Dispatch Validation Payload` (`2 ERRORS DETECTED`):
  teknisi `Marcus Kowalski (ID: TECH-094)` ⚠️ + error
  `already allocated to P1 Chiller Breakdown during Shift A`;
  aset `AST-CHILLER-03 (Central Chiller #03 - Basement Plant)` ⚠️
  (`Lock Verified (SCADA)`, LOTO pre-authorized);
  `Estimated Downtime` kosong (required, `warning`) vs `Job Scope`
  (`Replacing primary impeller mechanical seal`, `38 / 250`);
  checkbox `Safety Isolation Protocol Acknowledged [Mandatory]`
  (480V, OSHA lockout) belum dicentang → tombol `Dispatch Work Order`
  disabled (`opacity-60 cursor-not-allowed`, ikon `lock`) + `Discard Changes`.
- `Pattern 2A: Persistent Offline Banner (CRITICALITY: HIGH)`:
  `Network Connection Severed [OFFLINE]` (`wifi_off` pulse),
  `Reconnecting in 4s... Local mutations safely stored in indexedDB`,
  `Force Ping Now` + `Buffer: 4 Work Orders queued`.
- `Pattern 2B: HTTP 500 Operational Toast` (`#state-toast`, toggle via header):
  `Internal Server Error (500)` (`crisis_alert`),
  `Dispatch Transaction Aborted • Rollback Active`,
  `Postgres row deadlock on cluster Node-01A ... Shift overlapping matrix`,
  `Trace: #ERR-8921b-TXN`, tombol `Retry Request` / `Copy Log`, close.

**03 — HTMX Async Lifecycle & Interaction States:**
- Tabel skeleton `GET /api/v1/work-orders/live-queue?filter=active`
  (`Status: 200 Processing`, `240ms elapsed`): thead
  (WO Identifier/Asset Node/Priority/Assigned Tech) + 4 baris `animate-pulse`;
  footer `Target container: #hx-work-orders-table`,
  `Trigger attribute: hx-trigger="every 15s"`.
- `State: Row Hover State [HOVER ACTIVE]`: `WO-9042` ⚠️ + `P1 CRITICAL`
  (`Primary Glycol Feed Pump Leaking`) + aksi view/edit.
- `State: Keyboard Focus Geometry [TAB INDEX 0]`: input
  `Filter tags: 'chiller', 'zone-3'` dengan `ring-2 ring-primary
  ring-offset-2` (klaim WCAG AA 2px offset).
- `State: Draggable Kanban Hover [ELEVATED]`: kartu `AST-HVAC-12 [ROUTINE PM]`
  (`Clean Condenser Coils & Check Delta-T`), avatar `Elena Rostova` ⚠️ +
  `drag_indicator`, (`-translate-y-1 shadow-xl cursor-grab`).

### State UI (definisi yang disyaratkan file ini sendiri)

- Empty: 01 (clean queue + nominal stock) — pola acuan semua daftar.
- Loading: 03 skeleton + `240ms elapsed` + poll 15s/30s.
- Error: 02 (inline field error + offline banner + toast 500 + rollback).
- Interaksi: hover/focus/drag-kanban — Geometri fokus 2px + offset.

## 2. Navigation Flow & Routing (Kontrak Navigasi Pola)

File ini **bukan route** — tidak ada tujuan navigasi sendiri. Sidebar 15
`data-path` identik tetap dirender; `screen.png` menyorot
`Operations Dashboard` (fallback default, wajar untuk halaman non-route).
Setiap pola memetakan ke aksi generik berikut saat dipakai halaman nyata:

| Elemen pola / Action | Target / Perilaku generik |
|---|---|
| `Submit New Request` (01) | Modal create atau `/service-requests/new` — MISSING (ikut SR hub) |
| `View Archived Requests` (01) | `/service-requests?state=archived` — MISSING |
| `Review Par Levels` / `Create Requisition` (01) | `/inventory?view=par` / `/purchasing/new?sku=` — MISSING (prefill flow) |
| `Dispatch Work Order` (02, saat valid) | `POST /api/v1/work-orders` → `/work-orders/[id]` — MISSING |
| `Discard Changes` (02) | Reset form (tetap di halaman) |
| `Force Ping Now` (2A) | `POST /api/v1/telemetry/ping` + flush antrean indexedDB (tetap) |
| `Retry Request` (2B) | Ulangi request gagal dengan idempotency-key (tetap) |
| `Copy Log` (2B) | Clipboard trace (bukan navigasi) |
| Baris skeleton → baris nyata (03) | `/work-orders/[id]` per baris — MISSING |
| Aksi hover view/edit (03) | Preview drawer / form edit (tetap atau `/work-orders/[id]/edit`) |
| Kartu kanban drag (03) | `PATCH` status kolom (tetap; bukan navigasi) |

## 3. Missing Pages & Flow Gaps (Implikasi ke Ekosistem)

1. **`/work-orders/[id]` (HIGH)** — pola 02/03 mengasumsikan detail WO ada;
   tanpa itu tombol dispatch/hover tidak punya tujuan.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Prefill flow inventory→purchasing (MEDIUM)** — `Create Requisition`
   butuh konvensi `/purchasing/new?sku=` bukan halaman baru; sepakati global.
3. **Antrean offline/sync (MEDIUM)** — banner 2A menyebut indexedDB + 4 WO
   queued tetapi tidak ada layar antrean (`/(field)/sync` MISSING di alur field).
   `// TODO: Create field routes /(field)/audits, /(field)/findings/new, /(field)/sync`
4. **Halaman arsip (LOW)** — `View Archived Requests` butuh query
   `?state=archived`, bukan route baru.

**Inkonsistensi ID/nama dalam file ini (dicatat, pakai kanonis saat seeding):**
- `WO-9042` melanggar format kanonis (`WO-2026-####` per settings).
- `AST-CHILLER-03` vs kanonis `AST-HVAC-004`; `TECH-094` vs skema `RFID-*`.
- `Elena Rostova` vs kanonis `Elena Voronova` (dipakai hub lain + file ini di bagian lain).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols.
- Skeleton via `animate-pulse` + blok div; toggle toast via `classList`;
  form `onsubmit="event.preventDefault()"` (tidak benar-benar submit).
- Label HTMX (`hx-trigger`, `#hx-work-orders-table`, `HTMX v1.9.12`) hanya teks —
  tidak ada atribut `hx-get/hx-swap` nyata di file ini.

### Stack produksi yang diharapkan (kontrak untuk semua halaman)

| Library / Framework | Peran pola ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Pola diimplementasi sebagai komponen bersama (`components/states/*`). |
| **Tailwind CSS (build)** | Skeleton, banner, toast, ring fokus, kartu kambar. Token sistem A. |
| **shadcn/ui** — `Skeleton`, `Alert`, `Toast`, `Button`, `Input`, `Checkbox`, `Table`, `Tooltip`, `Dialog` | Primitif semua pola 01–03; `AlertDialog` untuk konfirmasi destruktif. |
| **lucide-react** | Ikon wifi-off, crisis-alert, error, check, drag. |
| **SWR / TanStack Query** | Lifecycle 03: `isLoading`→skeleton, `error`→toast 2B, `refetchInterval` 15s/30s, penanda `STALE`. |
| **zod + react-hook-form** | Aturan validasi 02 (required, konflik alokasi, LOTO wajib) + counter 38/250. |
| **idb-keyval / localForage** | Antrean offline 2A (gantikan klaim indexedDB dengan implementasi nyata). |
| **sonner / shadcn Toast** | Toast 2B + aksi Retry/Copy dengan `traceId`. |

## 5. Expected Backend APIs (Kontrak API Pola Generik)

Pola ini tidak memanggil API sendiri kecuali contoh yang ditampilkannya:

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/work-orders/live-queue?filter=active` | Contoh antrean untuk skeleton 03 (poll 15s) | Poll `hx-trigger="every 15s"` / `refetchInterval` |
| GET | `/api/v1/service-requests?state=open` | Contoh empty-state 01 (0 hasil → clean queue) | On page load daftar SR |
| GET | `/api/v1/inventory?belowPar=true` | Contoh empty-state 01 (0 SKU → nominal) | On page load ledger |
| POST | `/api/v1/work-orders` | Contoh submit form 02 (valid → dispatch) | On submit form valid + LOTO dicentang |
| GET | `/api/v1/technicians/:id/allocation?shift=` | Cek konflik alokasi 02 (P1 Chiller Shift A) | On change teknisi/shift (async validation) |
| POST | `/api/v1/telemetry/ping` | Contoh `Force Ping Now` 2A | On click Force Ping |
| POST | `/api/v1/work-orders/queue/flush` | Flush 4 WO antrean offline 2A | On reconnect online |
| POST | `/api/v1/work-orders/:id/retry` | Contoh `Retry Request` 2B (idempotent) | On click Retry (dengan `Idempotency-Key`) |

Contoh fetch:

```ts
// TODO: Replace skeleton mock with GET /api/v1/work-orders/live-queue?filter=active (refetch 15s)
import axios from "axios";
const { data } = await axios.get("/api/v1/work-orders/live-queue", {
  params: { filter: "active" },
});
```

```ts
// TODO: Replace allocation mock with GET /api/v1/technicians/TECH-094/allocation?shift=A
const res = await fetch("/api/v1/technicians/TECH-094/allocation?shift=A");
const { data } = await res.json(); // { data: { conflict: true, job: "P1 Chiller Breakdown" } }
```

## 6. Data Mocking Strategy (Kontrak Mock Bersama)

Simpan di `mocks/ui-states.mock.ts` sebagai acuan semua halaman.

```ts
// TODO: Replace empty-queue mock with GET /api/v1/service-requests?state=open (expect [])
export const emptyQueue = {
  status: "CLEAN QUEUE", slaRiskPct: 0.0, pollSec: 30,
  title: "All Caught Up! No Pending Service Requests",
  actions: ["View Archived Requests", "Submit New Request"],
};

// TODO: Replace nominal-stock mock with GET /api/v1/inventory?belowPar=true (expect [])
export const nominalStock = {
  health: "100% NOMINAL", skuIndex: 1420,
  title: "Optimal Stock Levels • No Critical Low-Stock SKUs",
  actions: ["Review Par Levels", "Create Requisition"],
};

// TODO: Replace validation mock with async GET /api/v1/technicians/:id/allocation?shift=
export const dispatchValidation = {
  tech: "Marcus Kowalski (ID: TECH-094)", // TODO: canonicalize to RFID-* scheme
  techError: "already allocated to P1 Chiller Breakdown during Shift A",
  asset: "AST-CHILLER-03 (Central Chiller #03 - Basement Plant)", // TODO: canonicalize to AST-HVAC-004
  assetState: "Lock Verified (SCADA)",
  downtime: "", // required missing
  scope: "Replacing primary impeller mechanical seal", scopeCount: "38 / 250",
  lotoChecked: false, errors: 2, dispatchDisabled: true,
};

// TODO: Replace offline mock with real indexedDB queue + POST /api/v1/telemetry/ping
export const offlineBanner = {
  state: "OFFLINE", reconnectSec: 4, queuedWorkOrders: 4, store: "indexedDB",
};

// TODO: Replace 500 mock with real error envelope { error: { code, message }, traceId }
export const serverError500 = {
  code: 500, trace: "#ERR-8921b-TXN", tx: "Dispatch Transaction Aborted • Rollback Active",
  detail: "Postgres row deadlock on Node-01A (Shift overlapping matrix)",
};

// TODO: Replace skeleton mock with GET /api/v1/work-orders/live-queue?filter=active
export const liveQueueSkeleton = {
  endpoint: "/api/v1/work-orders/live-queue?filter=active",
  status: "200 Processing", elapsedMs: 240, rows: 4,
  target: "#hx-work-orders-table", trigger: "every 15s",
};

// TODO: Canonicalize WO-9042 to WO-2026-#### format (see settings sequences)
export const hoverRow = { id: "WO-9042", priority: "P1 CRITICAL", title: "Primary Glycol Feed Pump Leaking" };

// TODO: Canonicalize Elena Rostova to Elena Voronova
export const kanbanCard = { asset: "AST-HVAC-12", tag: "ROUTINE PM", title: "Clean Condenser Coils & Check Delta-T", assignee: "Elena Rostova" };
```

Contoh binding generik:

```tsx
// TODO: Replace skeleton mock with useSWR('/api/v1/work-orders/live-queue?filter=active', fetcher, { refreshInterval: 15000 })
import { liveQueueSkeleton } from "@/mocks/ui-states.mock";

export function LiveQueue() {
  // const { data, isLoading, error } = useSWR(...);
  // if (isLoading) return <QueueSkeleton rows={liveQueueSkeleton.rows} />;
  // if (error) return <ServerErrorToast trace={serverError500.trace} />; // TODO: wire Retry with Idempotency-Key
  return null;
}

// TODO: Create detail page routing for /work-orders/[id]
```

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Tiga inkonsistensi contoh dalam file:** `Elena Rostova` vs kanonis
  `Voronova`, `WO-9042` vs format `WO-2026-####`, `TECH-094` vs skema `RFID-*` —
  pass-1 (`docs/ui-audit/ui-state-patterns.md` §3) mencatat ketiganya; pass-2
  menemukan ketiganya di lokasi yang sama (kartu kanban, hover row, form
  validasi) — terkonfirmasi penuh, pakai kanonis saat seeding.
- **Peran file sebagai kontrak komponen** (bukan route) + daftar adopsi
  (EmptyState/FormField/OfflineBanner/ErrorToast/TableSkeleton) — kedua pass
  sepakat; tidak ada yang memperlakukannya sebagai halaman.

### (b) Temuan BARU yang luput di pass-1

- **Detail pola yang tidak dirinci pass-1:** counter `38 / 250`, copy OSHA
  480V + LOTO, `Reconnecting in 4s` + `indexedDB` + `Buffer: 4 Work Orders`,
  deadlock `Node-01A` + `Trace: #ERR-8921b-TXN`, `240ms elapsed` +
  `hx-trigger="every 15s"` + target `#hx-work-orders-table`,
  klaim `WCAG AA 2px offset` (`ring-2 ring-offset-2`), kanban
  `-translate-y-1 shadow-xl cursor-grab` + `AST-HVAC-12`, toggle
  `#state-toast` via tombol header.
- **Aset contoh `AST-CHILLER-03`** (form validasi) vs kanonis `AST-HVAC-004` —
  varian keempat yang belum dipetakan pass-1 (pass-1 hanya mencatat 3 varian).

### (c) KOREKSI atas pass-1 — KESALAHAN FAKTUAL PASS-1

- **Pass-1 §2 salah menyatakan file ini "tidak ada sidebar `data-path`"**
  ("tidak ada sidebar `data-path`, breadcrumb operasional, link").
  **Verifikasi independen pass-2 (script + `screen.png`): file ini MEMILIKI
  sidebar global identik — `<aside>` = 1, `data-path` = 15 item yang sama
  persis dengan 5 hub governance** (`operations-dashboard` … `settings-and-system-config`),
  dan `screen.png` menampilkan sidebar penuh dengan sorotan
  `Operations Dashboard` (fallback default karena pola ini bukan route).
  Koreksi: §2 pass-1 harus direvisi — sidebar ADA, yang tidak ada hanyalah
  item nav milik pola itu sendiri.
- **Perbedaan metodologi (bukan kesalahan):** pass-1 menetapkan seksi 5 N/A
  dengan rujukan silang; pass-2 menyusun tabel API pola generik
  (live-queue poll 15s, cek alokasi, ping/flush, retry idempoten) sebagai
  kontrak yang dapat diuji — pelengkap, bukan koreksi.
