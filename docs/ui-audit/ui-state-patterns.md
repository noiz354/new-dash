# UI Audit — UI State Variants & Patterns (`ui_state_variants_patterns`)

> Sumber: `stitch_facility_maintenance_platform_ui/ui_state_variants_patterns/code.html` (451 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> **BUKAN route** — dokumen pola reusable (skeleton/toast/empty/error) untuk
> sistem desain; diacu semua halaman. Dibuat: 2026-09-13. Template v2 Architect
> (seksi 2–3 disesuaikan: navigasi N/A, missing = adopsi pola per halaman).
> Konteks global: `docs/ui-audit/navigation-audit.md` (§4 item 14).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Interactive UI State Matrix & Pattern Spec** bukan halaman operasional,
melainkan **spesifikasi pola state** untuk micro-frontend asinkron: bagaimana
setiap layar harus tampil saat antrean kosong, validasi gagal, koneksi putus,
server error, data loading, hover, fokus keyboard, dan drag kanban. Badge
`HTMX v1.9.12 Active` dan label `Design System Spec / Workspace Runtime`
menegaskan ini adalah kontrak perilaku, bukan data. Saat rebuild, file ini
diterjemahkan menjadi komponen sistem desain (`EmptyState`, `FormField`,
`OfflineBanner`, `ErrorToast`, `TableSkeleton`, …), bukan menjadi route.

### Daftar elemen UI utama

1. **Header spec** — breadcrumb `Design System Spec / Workspace Runtime`,
   H1, deskripsi async micro-frontend/HTMX/validasi/triage; utilitas: badge
   `HTMX v1.9.12 Active` (pulse) + tombol `Toggle Error Toast`
   (`onclick` toggle `#state-toast`).
2. **§01 Zero-State & Empty Queue Patterns** — dua kartu:
   - SR kosong (`STATUS: CLEAN QUEUE • SLA RISK 0.0%`, `POLL: 30s INTERVAL`):
     ilustrasi SVG clipboard-check, H3 `All Caught Up! No Pending Service
     Requests`, copy triase/BMS, footer (`Auto-syncing via HTMX worker`,
     `View Archived Requests`, `Submit New Request` primary).
   - Stok nominal (`WAREHOUSE HEALTH: 100% NOMINAL`, `SKU INDEX: 1,420 ACTIVE`):
     ilustrasi SVG box-check, H3 `Optimal Stock Levels • No Critical Low-Stock
     SKUs`, copy 1,420 parts, footer (`Safety buffers enforced automatically`,
     `Review Par Levels`, `Create Requisition` primary).
3. **§02 Validation Architecture & Alert Topography** — form `Work Order
   Dispatch Validation Payload` (`2 ERRORS DETECTED`): field `Assigned Lead
   Technician` error (`Marcus Kowalski (ID: TECH-094)`, `Over-allocation
   Conflict`, merah + ikon `error`); field `Target Asset ID / Tag` sukses
   (`AST-CHILLER-03 (Central Chiller #03 - Basement Plant)`, readonly,
   `Lock Verified (SCADA)` + `check_circle`); `Estimated Downtime Duration`
   error required kosong (`warning`); `Job Scope Description`
   (`38 / 250`, `Replacing primary impeller mechanical seal`); checkbox
   `Safety Isolation Protocol Acknowledged` (`Mandatory`, copy OSHA 480V);
   footer (`Discard Changes`, `Dispatch Work Order` disabled `opacity-60`
   + `lock`). **Pattern 2A** Persistent Offline Banner (`CRITICALITY: HIGH`):
   `Network Connection Severed` + `OFFLINE`, `Reconnecting in 4s`,
   `indexedDB`, `Force Ping Now`, `Buffer: 4 Work Orders queued`.
   **Pattern 2B** HTTP 500 Operational Toast (id `state-toast`): `Internal
   Server Error (500)`, `Dispatch Transaction Aborted • Rollback Active`,
   copy deadlock `Node-01A` shift matrix, `Trace: #ERR-8921b-TXN`,
   `Retry Request` + `Copy Log`.
4. **§03 HTMX Async Lifecycle & Interaction States** — panel skeleton tabel
   (`GET /api/v1/work-orders/live-queue?filter=active`, `Status: 200
   Processing`, `240ms elapsed`, header WO/Asset/Priority/Tech/Action,
   4 baris `animate-pulse`, footer `Target container: #hx-work-orders-table`,
   `hx-trigger="every 15s"`); kartu `Row Hover State` (`HOVER ACTIVE`:
   `WO-9042` `P1 CRITICAL` `Primary Glycol Feed Pump Leaking`, aksi
   `visibility`/`edit`); kartu `Keyboard Focus Geometry` (`TAB INDEX 0`:
   input `Filter tags: 'chiller', 'zone-3'`, ring `ring-2 ring-primary
   ring-offset-2`, catatan `WCAG AA 2px offset`); kartu `Draggable Kanban
   Hover` (`ELEVATED`: `AST-HVAC-12` `ROUTINE PM`, `Clean Condenser Coils &
   Check Delta-T`, avatar Elena Rostova, `drag_indicator`).

### State UI

Halaman ini **adalah** katalog state — ringkasan adopsi per halaman target:

- **Empty:** §01 → pakai di `/service-requests` (queue kosong),
  `/inventory` (stok nominal), `/reports` (dossier kosong), `/notifications`
  (0 unread), `/audit-logs` (filter tanpa hasil).
- **Loading:** §03 skeleton → tabel WO/live-queue di `/operations`,
  `/work-orders`, `/audit-logs`; `hx-trigger="every 15s"` dipadankan polling
  SWR + penanda `STALE`.
- **Error:** 2A offline banner → shell global + `/(field)` offline (indexedDB
  buffer); 2B toast 500 + trace → semua mutation + tombol `Retry`/`Copy Log`.
- **Form:** §02 → form dispatch WO, provision user, query builder (error
  merah + ikon, sukses hijau + lock SCADA, submit disabled + alasan).
- **A11y/interaksi:** focus ring 2px offset + `TAB INDEX` → semua input;
  hover-reveal aksi baris → semua tabel; kanban elevated → board bila ada.

## 2. Navigation Flow & Routing (Alur Navigasi) — N/A (Dokumen Pola)

Dokumen ini **bukan route dan tidak memiliki navigasi**: tidak ada sidebar
`data-path`, breadcrumb operasional, link, atau tombol yang keluar dari halaman.
Satu-satunya "navigasi" adalah CTA contoh di dalam pola (`View Archived
Requests`, `Submit New Request`, `Review Par Levels`, `Create Requisition`,
aksi baris hover) — semuanya placeholder ilustratif tanpa target, dan TIDAK
boleh dibaca sebagai kontrak routing.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Semua CTA contoh di §01–§03 | N/A — ilustrasi pola, bukan navigasi |
| `Toggle Error Toast` | Toggle `#state-toast` inline (demo interaksi) |
| Tombol close pada Pattern 2B | `hidden` pada `#state-toast` (demo) |

Implikasi produksi: pola di sini menjadi komponen di sistem desain
(`@/components/states/...`), diimpor oleh route nyata — bukan dikunjungi.

## 3. Missing Pages & Flow Gaps — Adopsi Pola per Halaman (bukan dead-end)

Tidak ada missing page dalam arti routing; gap-nya adalah **adopsi**: setiap
halaman audit lain saat ini mendefinisikan state-nya sendiri di §"State UI"
masing-masing. Daftar adopsi wajib saat rebuild (konsisten dengan
`navigation-audit.md` §4 item 14):

1. `EmptyState` (§01) → `/service-requests`, `/inventory`, `/reports`,
   `/notifications`, `/audit-logs`, `/(field)/sync`.
2. `FormField` + guard submit (§02) → dispatch WO, provision user
   (`/organization`), query builder (`/reports`), konfigurasi (`/settings`).
3. `OfflineBanner` (2A) → shell `(dispatch)` + `(field)` (buffer indexedDB,
   `Force Ping`/reconnect, counter antrean).
4. `ErrorToast` + trace (2B) → semua mutation (`Retry`/`Copy Log`,
   format `Trace: #ERR-xxxx`).
5. `TableSkeleton` + polling meta (§03) → `/operations`, `/work-orders`,
   `/audit-logs` (tampilkan `hx-trigger`/interval + target container).
6. Hover-reveal aksi + focus ring + kanban drag → standar tabel/kanban global.
   `// TODO: Build shared state components from ui-state-patterns spec
   (EmptyState, FormField, OfflineBanner, ErrorToast, TableSkeleton)`

**Temuan (jangan diam-diam diperbaiki):**

- **Nama teknisi ganda.** Kartu kanban menulis `Elena Rostova`, seluruh hub lain
  memakai `Elena Voronova` — kemungkinan typo Stitch; kanonis: `Voronova`.
- **Format WO pendek.** Hover memakai `WO-9042` sementara standar global
  `WO-2026-0894` (4-digit + tahun, dari settings sekuens). Pola harus memakai
  format kanonis agar contoh tidak menyesatkan.
- **`TECH-094` vs `RFID-*`.** Form validasi memakai ID `TECH-094` sementara
  direktori memakai `RFID-9021`/email — sepakati satu identitas teknisi
  (`userId` + badge) untuk pesan error prod.
- `screen.png` menyorot `Operations Dashboard` di sidebar — halaman pola ini
  memang tidak punya item nav sendiri; sorotan itu artefak template, bukan klaim.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis + **Tailwind Play CDN**, **Inter** + **JetBrains Mono**,
  **Material Symbols Outlined**, SVG ilustrasi inline, `animate-pulse` untuk
  skeleton, toggle class vanilla.

### Stack produksi yang diharapkan (komponen, bukan halaman)

| Library / Framework | Peran pola ini |
|---|---|
| **Next.js + React + TypeScript** | Komponen di `@/components/states/` + `forms/`; `HTMX v1.9.12`/`hx-trigger` **tidak** dibawa ke prod (diganti SWR polling) — catat sebagai keputusan migrasi. |
| **Tailwind CSS (build)** | Token skeleton (`animate-pulse`), banner error, toast, focus ring; token sistem A. |
| **shadcn/ui (Radix)** — `Skeleton`, `Toast`/`Sonner`, `Alert`, `Button`, `Input`, `Checkbox`, `Tooltip`, `Avatar` | Basis semua komponen state; `Sonner` untuk toast + action `Retry`/`Copy Log`. |
| **lucide-react** | Ikon pola (clipboard-check, wifi_off, crisis_alert, lock, drag). |
| **react-hook-form + zod** | Pola validasi §02 (error per-field, submit disabled beralasan, counter 38/250). |
| **idb-keyval / Workbox** (untuk `/(field)`) | Buffer offline pola 2A (ganti `indexedDB` mentah). |

## 5. Expected Backend APIs — N/A dengan Alasan

Pola ini **tidak memanggil API sendiri** — ia menspesifikasikan *bagaimana*
komponen bereaksi terhadap API milik halaman lain. Satu-satunya endpoint yang
muncul (`GET /api/v1/work-orders/live-queue?filter=active`) adalah **teks contoh**
di header panel skeleton, merujuk kontrak milik operations/queue, bukan kontrak
baru. Tidak ada tabel endpoint; rujukan silang:

- Skeleton tabel → `GET /api/v1/work-orders` (lihat audit operations-dashboard).
- Offline buffer flush → `POST` antrean masing-masing domain saat online kembali.
- Toast 500 + `Trace: #ERR-8921b-TXN` → format `{ error: { code, message } }`
  global + `traceId` di semua respons API.

## 6. Data Mocking Strategy (Implementasi Sementara + Komentar TODO)

Pola ini tidak punya mock data domain; mock-nya adalah **props contoh**
komponen di Storybook/sandbox. Setiap contoh diberi `// TODO` adopsi:

```tsx
// TODO: Adopt EmptyState pattern (§01) in /service-requests empty queue
<EmptyState
  title="All Caught Up! No Pending Service Requests"
  description="All incoming requests ... have been triaged or converted to Work Orders."
  primaryAction={{ label: "Submit New Request" }}
  secondaryAction={{ label: "View Archived Requests" }}
/>

// TODO: Adopt FormField validation pattern (§02) in WO dispatch form
<FormField
  label="Assigned Lead Technician"
  error="Technician Marcus Kowalski is already allocated to P1 Chiller Breakdown during Shift A."
/>

// TODO: Adopt OfflineBanner pattern (2A) in (dispatch) + (field) shells
<OfflineBanner
  retryInSec={4}
  queuedCount={4}
  onForcePing={() => {/* TODO: Replace demo with reconnect() */}
  }
/>

// TODO: Adopt ErrorToast pattern (2B) for all mutations (traceId required)
<ErrorToast
  title="Internal Server Error (500)"
  traceId="ERR-8921b-TXN"
  onRetry={() => {/* TODO: Replace demo with mutation.retry() */}}
  onCopyLog={() => navigator.clipboard.writeText("Trace: #ERR-8921b-TXN")}
/>

// TODO: Adopt TableSkeleton pattern (§03) in /operations, /work-orders, /audit-logs
<TableSkeleton rows={4} columns={["WO Identifier", "Asset Node", "Priority", "Assigned Tech"]} />
```

Aturan adopsi: tidak ada halaman mengarang state sendiri — semua empty/loading/
error memakai komponen ini; contoh memakai ID kanonis (`WO-2026-0894`,
`AST-HVAC-004`, `Elena Voronova`) bukan varian pola (`WO-9042`, `Rostova`,
`TECH-094`).
