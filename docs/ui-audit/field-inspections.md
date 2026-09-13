# UI Audit — Field Inspections Audit Queue Hub (`field_inspections_audit_queue_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/field_inspections_audit_queue_hub/code.html` (653 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/field-inspections`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Inspection & Audit Engine** adalah hub dua-sisi untuk inspeksi
lapangan: sisi kiri mengelola **antrean audit terjadwal** (siapa mengaudit apa,
di mana, kapan, statusnya), sisi kanan adalah **template builder** untuk
merancang protokol checklist yang dijalankan teknisi di tablet. Dua kartu
fast-link di bawah menjembatani ke eksekusi mobile dan meja konversi temuan —
halaman ini adalah simpul yang mengikat ketiga layar batch inspeksi lainnya.

Alur kerja yang didukung: pantau kepatuhan audit → kelola antrean terjadwal
(dispatch paksa yang overdue) → rancang/publish template protokol → lempar ke
eksekusi tablet → triase temuan menjadi WO.

### Daftar elemen UI utama

1. **Breadcrumb + aksi konteks** — `Home / Core Operations / Field Inspections /
   Audit Queue & Template Builder`; pill live (`Live HTMX Poll: 15s`,
   `Audit Compliance: 98.2%`, `Pending Field Audits: 7 Queued`,
   `Engine: v4.8 Active`); tombol `Export Audit Log`, `Shift Handover`,
   `+ Create Inspection Template` (primary).
2. **KPI bento (4 kartu)** — `Active Inspection Protocols 24`
   (100% Asset & Zone Mapped, +2 New M-T-D); `Inspection Compliance SLA 98.2%
   PASS` (target 95.0%, +3.2%); `Defects / Failed Checks (7d) 08`
   (6 Auto-Converted to WO, `2 Pending Triage`); `Mobile Submissions Today 14`
   (Shift A 9 / Shift B 5, 100% Synced).
3. **Antrean audit (kiri, 7 kolom)** — tab filter (`All Audits 18`,
   `Today / Imminent 6`, `Overdue / SLA Risk 2`, `Completed 10`,
   `Templates & Forms`); search (`Ctrl + /`) + dropdown Zone + Discipline;
   tabel 5 baris: `INS-2026-0412` Chiller `AST-HVAC-004` (IN PROGRESS 65%,
   M. Kowalski, due 16:00 45m, aksi `Open Run`); `INS-2026-0409` Generator
   `AST-GEN-01` (OVERDUE 3h, T. Chen, aksi `Force Dispatch`);
   `INS-2026-0415` Cleanroom `AST-ENV-108` (SCHEDULED, E. Rostova, `Preview`);
   `INS-2026-0398` Switchgear `AST-ELEC-01` (Completed + `2 FINDINGS`,
   `Review Findings`); `INS-2026-0420` Fire Suppression `ZONE-DC-04`
   (READY, R. Davies, `Details`). Footer `Showing 5 of 18`, `Page 1 / 4`.
4. **Widget telemetri IoT** — `Substation IoT Gateway Link`
   (`Modbus TCP/IP: Active`, auto-validasi `AST-ELEC-01` bus bar 42.4°C Nom,
   badge `SCADA STREAMING`).
5. **Template builder (kanan, 5 kolom)** — header template
   `TMPL-HVAC-CHL-02` `v2.4 Draft`, `Central Chiller Safety & Diagnostic
   Protocol`; bar instruksi (`4 Mandated Verification Steps`,
   `Logic Guardrails Active`); 4 kriteria reorderable (drag handle):
   Step 01 Binary P/F (E-Stop & LOTO, tombol PASS/FAIL, aturan
   `If FAIL: Auto-Flag Critical & Force Hazard Photo`); Step 02 Numeric Bound
   (suction 110–130 PSI, input `122.0`, `Value within nominal limits`,
   `Out-of-bounds trigger automatic WO Creation`); Step 03 Mandatory Media
   (sight glass, `1 Shot Req`, GPS+timestamp watermark); Step 04 IoT
   Auto-Populate (Modbus 40112 Delta-T, `ΔT = 9.8°F`, Auto-Attached).
   Aksi: `+ Add Checklist Step`, `Save Draft`, `Publish Template (v2.4)`.
6. **Fast-link bawah (2 kartu)** — `Mobile Tablet Execution View`
   (`Offline PWA Ready`, barcode scanning + photo logging) dan
   `Findings & Auto-WO Conversion Desk` (`2 Action Required`) —
   masing-masing dengan panah hover, berupa `div` klik (tanpa `<a href>`).

### State UI

- **Empty state:** antrean kosong → ilustrasi + "Tidak ada audit terjadwal
  pada filter ini" + `Reset Filter` (belum dimockup, wajib ditambah);
  template tanpa step → dropzone "Tarik step ke sini / + Add Checklist Step";
  tab Completed kosong → pesan + `Schedule New Audit`.
- **Loading state:** skeleton 4 kartu KPI + 5 baris tabel + 4 kartu kriteria;
  tombol `Publish Template` spinner + disabled; badge `SCADA STREAMING`
  menjadi `CONNECTING...` saat reconnect.
- **Error state:** `Force Dispatch` gagal → toast + baris tetap OVERDUE;
  publish template gagal validasi (mis. step tanpa guardrail) → error inline
  per kriteria + tombol tetap Draft; IoT gateway putus → widget merah
  `OFFLINE` + nilai terakhir + `STALE`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path` identik, header
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di
bawah adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: 15 item (`field-inspections` aktif) | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections` (halaman ini), `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` — EXISTS (mockup) |
| Breadcrumb `Home / Core Operations / Field Inspections / Audit Queue...` | `Home` → `/`; segmen tengah grup, bukan route |
| `+ Create Inspection Template` | Form/builder template baru (panel kanan dalam mode create, atau `/field-inspections/templates/new`) — MISSING |
| `Export Audit Log` | Async job export — MISSING (target tak terdefinisi) |
| `Shift Handover` | Halaman/panel shift handover — MISSING |
| Tab antrean + search + dropdown + pagination | Query params (`?tab=today&zone=&discipline=&page=`), bukan navigasi |
| `Open Run` (`INS-2026-0412`) | `/(field)/run/INS-2026-0412` — mockup mobile EXISTS (`mobile_field_inspection_execution_desk`), route MISSING |
| `Force Dispatch` (`INS-2026-0409`) | Aksi `POST` dispatch paksa, tetap di halaman |
| `Preview` (`INS-2026-0415`) | Pratinjau read-only audit (modal/drawer) — MISSING |
| `Review Findings` (`INS-2026-0398`) | Meja konversi temuan (section di `/field-inspections`, lihat `findings-conversion.md`) — EXISTS (sebagai section, bukan route) |
| `Details` (`INS-2026-0420`) | Detail audit — MISSING (putuskan: drawer vs `/field-inspections/[auditId]`) |
| `+ Add Checklist Step` / `Save Draft` / `Publish Template (v2.4)` | Aksi builder inline (POST/DRAFT/PUBLISH), tetap di halaman |
| Fast-link `Mobile Tablet Execution View` | `/(field)/run/[auditId]` — mockup EXISTS, route MISSING |
| Fast-link `Findings & Auto-WO Conversion Desk` | Section/tab di `/field-inspections` (atau `/field-inspections/findings`) — EXISTS sebagai mockup section |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Route eksekusi mobile `/(field)/run/[auditId]` (HIGH)** — `Open Run` dan
   fast-link mobile menunjuk ke mockup yang ada tetapi tanpa route; tanpa ini
   alur `queue → run → submit → sync` terputus (konsisten dengan
   `navigation-audit.md` §4 item 2, termasuk tab `my-audits` /
   `report-finding` / `sync-status` yang juga MISSING).
   `// TODO: Create field routes /(field)/audits, /(field)/run/[auditId], /(field)/findings/new, /(field)/sync`
2. **Status tab findings sebagai route (MEDIUM)** — `Review Findings`
   mengarah ke `inspection_findings_auto_wo_conversion_desk` yang diusulkan
   sebagai tab/section `/field-inspections`, bukan route top-level
   (lihat `navigation-audit.md` §2); putuskan dan tautkan eksplisit.
   `// TODO: Decide findings surface (tab vs /field-inspections/findings) and link Review Findings`
3. **Detail audit + preview (MEDIUM)** — `Preview` dan `Details` butuh pola
   seragam (drawer read-only + deep-link opsional `/field-inspections/[auditId]`).
4. **Create template flow (LOW)** — `+ Create Inspection Template` tanpa
   mode create yang terdefinisi (builder kanan saat ini mengedit draft v2.4).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN** + config inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/telemetri),
  ikon **Material Symbols Outlined**.
- Satu-satunya JS: shortcut `Ctrl/Cmd + /` fokus ke search — fungsional dan
  layak dipertahankan.
- Tanpa framework, routing, data fetching, atau drag-and-drop nyata
  (handle `drag_indicator` hanya visual).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/field-inspections` (antrean + builder sebagai tab/section); typing `Audit`, `AuditTemplate`, `ChecklistCriterion`. |
| **Tailwind CSS (build, bukan CDN)** | Styling workspace 7/5 kolom, tabel antrean, kartu kriteria. Token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Table`, `Progress`, `Avatar`, `Skeleton`, `Toast`, `Tooltip` | KPI bento, tab filter, tabel antrean, builder kriteria, fast-link, skeleton/toast. |
| **lucide-react** | Pengganti Material Symbols (ikon rule, verified, report, phonelink, drag handle). |
| **dnd-kit** (atau `@hello-pangea/dnd`) | Drag-and-drop reorder step builder (handle saat ini hanya visual). |
| **SWR atau TanStack Query** | Poll antrean + KPI tiap 15s (`Live HTMX Poll`); invalidasi setelah force dispatch/publish; penanda `STALE`. |
| **axios** (atau `fetch` + `ky`) | HTTP client dengan interceptor auth + base URL `/api/v1`. |
| **date-fns + date-fns-tz** | Format due (`Today 16:00`, `Due in 45m`, `Lapsed 3h ago`, `Feb 18, 09:00`). |
| **zod + react-hook-form** | Validasi builder (setiap kriteria wajib punya guardrail + tipe; numeric wajib min/max). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/inspections/dashboard` | On page load (4 KPI + pill) | Response: `{ "data": { "activeProtocols": 24, "mappedPct": 1.0, "newMtd": 2, "compliance": 0.982, "target": 0.95, "failed7d": 8, "autoConverted": 6, "pendingTriage": 2, "mobileToday": 14, "shiftA": 9, "shiftB": 5, "pending": 7, "engine": "v4.8" } }` |
| GET | `/api/v1/inspections/audits` | On page load + tab/search/dropdown/pagination | Query: `?tab=all&zone=&discipline=&search=&page=1&perPage=10`. Response: `{ "data": [{ "id": "INS-2026-0412", "name": "Chiller Plant Pre-Shift Safety & Pressure Audit", "assetId": "AST-HVAC-004", "zone": "Basement Mech Room B-204", "dueAt": "Today 16:00", "assignee": "M. Kowalski", "role": "Lead Tech", "status": "IN_PROGRESS", "progressPct": 65 }, { "id": "INS-2026-0409", "status": "OVERDUE", "lapsedHrs": 3 }], "meta": { "total": 18, "tabs": { "all": 18, "today": 6, "overdue": 2, "completed": 10 } } }` |
| POST | `/api/v1/inspections/audits/:id/force-dispatch` | On click `Force Dispatch` (audit overdue) | Body: `{}`. Response: `{ "data": { "id": "INS-2026-0409", "status": "DISPATCHED" } }` |
| GET | `/api/v1/inspections/templates/:id` | On page load (builder kanan) | Response: `{ "data": { "id": "TMPL-HVAC-CHL-02", "version": "v2.4", "state": "DRAFT", "name": "Central Chiller Safety & Diagnostic Protocol", "steps": [{ "seq": 1, "type": "BINARY", "title": "Emergency Stop & LOTO Lock Guard Integrity", "onFail": "AUTO_FLAG_CRITICAL" }, { "seq": 2, "type": "NUMERIC", "min": 110, "max": 130, "unit": "PSI", "value": 122.0 }] } }` |
| POST | `/api/v1/inspections/templates/:id/steps` | On click `+ Add Checklist Step` | Body: `{ "type": "BINARY", "title": "..." }`. Response: `{ "data": { "seq": 5 } }` |
| PATCH | `/api/v1/inspections/templates/:id` | On click `Save Draft` (reorder + edit) | Body: `{ "steps": [{ "seq": 1, "title": "...", "type": "BINARY" }] }`. Response: `{ "data": { "id": "TMPL-HVAC-CHL-02", "version": "v2.4", "state": "DRAFT" } }` |
| POST | `/api/v1/inspections/templates/:id/publish` | On click `Publish Template (v2.4)` | Body: `{}`. Response: `{ "data": { "id": "TMPL-HVAC-CHL-02", "version": "v2.4", "state": "PUBLISHED" } }` |
| GET | `/api/v1/assets/:id/telemetry` | On page load + poll (widget IoT) | Response: `{ "data": { "assetId": "AST-ELEC-01", "busBarTempC": 42.4, "state": "NOMINAL", "stream": "ACTIVE" } }` |
| POST | `/api/v1/reports/inspection-export` | On click `Export Audit Log` | Body: `{ "format": "CSV", "tab": "all" }`. Response: `{ "data": { "jobId": "RPT-9930", "downloadUrl": "/reports/RPT-9930.csv" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/field-inspections.mock.ts` selama backend belum
siap. Setiap blok wajib berkomentar `// TODO` dengan endpoint penggantinya.

```ts
// TODO: Replace dashboard mock with GET /api/v1/inspections/dashboard
export const inspectionDashboard = {
  activeProtocols: 24, compliance: 0.982, target: 0.95,
  failed7d: 8, autoConverted: 6, pendingTriage: 2,
  mobileToday: 14, shiftA: 9, shiftB: 5, pending: 7, engine: "v4.8",
};

// TODO: Replace audits mock with GET /api/v1/inspections/audits?tab=all&page=1
export const auditQueue = [
  { id: "INS-2026-0412", assetId: "AST-HVAC-004", status: "IN_PROGRESS", progressPct: 65, assignee: "M. Kowalski", due: "Today 16:00" },
  { id: "INS-2026-0409", assetId: "AST-GEN-01", status: "OVERDUE", assignee: "T. Chen" },
  { id: "INS-2026-0415", assetId: "AST-ENV-108", status: "SCHEDULED", assignee: "E. Rostova" },
  { id: "INS-2026-0398", assetId: "AST-ELEC-01", status: "COMPLETED", findings: 2 },
  { id: "INS-2026-0420", assetId: "ZONE-DC-04", status: "READY", assignee: "R. Davies" },
];

// TODO: Replace template mock with GET /api/v1/inspections/templates/TMPL-HVAC-CHL-02
export const chillerTemplate = {
  id: "TMPL-HVAC-CHL-02", version: "v2.4", state: "DRAFT",
  name: "Central Chiller Safety & Diagnostic Protocol",
  steps: [
    { seq: 1, type: "BINARY", title: "Emergency Stop & LOTO Lock Guard Integrity" },
    { seq: 2, type: "NUMERIC", title: "Compressor Suction Pressure Reading", min: 110, max: 130, unit: "PSI", value: 122.0 },
    { seq: 3, type: "MEDIA", title: "Sight Glass Bubble Check & Moisture Indicator", shotsRequired: 1 },
    { seq: 4, type: "IOT", title: "Operating Run Hours & Delta-T Reading", channel: "Modbus 40112", value: "ΔT = 9.8°F" },
  ],
};

// TODO: Create field routes /(field)/audits, /(field)/run/[auditId], /(field)/findings/new, /(field)/sync
// TODO: Decide findings surface (tab vs /field-inspections/findings) and link Review Findings
// TODO: Decide audit detail pattern (drawer vs /field-inspections/[auditId]) for Preview/Details
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/inspections/audits?tab=all', fetcher)
import { auditQueue } from "@/mocks/field-inspections.mock";

export function AuditQueueTable() {
  return (
    <Table>
      <TableBody>
        {auditQueue.map((audit) => (
          <TableRow key={audit.id}>
            <TableCell className="font-mono font-bold">{audit.id}</TableCell>
            <TableCell className="font-mono">{audit.assetId}</TableCell>
            <TableCell><Badge>{audit.status}</Badge></TableCell>
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

1. **Fast-link berupa `div` klik tanpa anchor.** Kedua kartu bawah
   (Mobile Execution, Findings Desk) adalah `div.group.cursor-pointer` tanpa
   `<a href>` — tidak ada affordance navigasi nyata dan tidak accessible via
   keyboard. Saat rebuild gunakan `Link` Next.js.
2. **Progres `INS-2026-0412` beda basis.** Antrean menampilkan `IN PROGRESS
   65%`, sedangkan layar eksekusi mobile (`mobile_field_inspection_execution_desk`)
   untuk audit yang sama menampilkan `Step 2 of 4 (50%)`. Selaraskan rumus
   progres (berbasis step vs berbasis bobot kriteria).
3. **Tab `Templates & Forms` tidak punya konten.** Tab kelima di filter
   antrean tidak menampilkan apa pun (builder kanan selalu menampilkan
   `TMPL-HVAC-CHL-02` terlepas dari tab). Putuskan: tab memfilter tabel atau
   mengalihkan panel kanan ke daftar template.
