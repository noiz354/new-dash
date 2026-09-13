# UI Audit — Service Requests Triage Hub (`service_requests_triage_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/service_requests_triage_hub/code.html` (650 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/service-requests`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Service Requests & Dispatch Triage Desk** adalah meja triase tempat
laporan non-teknis dari penghuni/requester (via Slack Ops Bot, telepon, dsb.)
dinilai, diprioritaskan oleh algoritma SCADA, lalu **dikonversi menjadi
Work Order** dan di-dispatch ke lead technician. Tiket aktif yang dievaluasi
adalah `SR-2026-0894` — "AC Unit Blowing Hot Air in Server Room" dari
Sarah Jenkins (IT Infra, x4921), dengan skor prioritas `92 / 100 [CRITICAL]`.

Alur kerja yang didukung: pindai antrean tak-tertriase → pilih tiket → tinjau
skor AI + telemetri SCADA korelasi → pilih tipe WO + teknisi + LOTO → konversi
& dispatch satu-klik → lanjutkan komunikasi dengan requester di live room.

### Daftar elemen UI utama

1. **Breadcrumb + status triase** — `Home / Operations / Service Requests /`
   + chip mono `SR-2026-0894` + pill `Active Triage` (pulse merah); strip meta
   `HTMX Poll: 10s`, `Target SLA <15m`; tombol `Export Ticket Log`,
   `+ Submit New Request` (primary).
2. **Title + backlog + preview toggle** — H1
   `Service Requests & Dispatch Triage Desk`, pill `Queue Backlog: 5 Untriaged`,
   tombol `Preview Empty Queue View` (JS `toggleDeskState()`, demo semata).
3. **Tab status + agregator prioritas** — `ALL (142)` / `NEW / UNTRIAGED (5)` /
   `TRIAGED (12)` / `ASSIGNED (18)` / `CONVERTED TO WO (98)` /
   `REJECTED / CLOSED (9)`; aritmetika konsisten: 5+12+18+98+9 = **142** ✓.
   Agregator: `P1 Critical: 2`, `P2 High: 2`, `P3 Medium: 1` (= 5 untriaged ✓).
4. **Filter rail** — omnisearch (`Ctrl + /`), dropdown Category
   (HVAC & Environmental terpilih), dropdown Location
   (HQ Nusantara > Building C > Floor 4 terpilih), tombol `Clear`, `Sync Now`.
5. **Tabel antrean (kiri, 7 kolom)** — 6 kolom + checkbox:
   `Ticket ID` (`SR-2026-0894` P1 terpilih s/d `SR-2026-0885` P3),
   `Requester` (avatar inisial + dept + ext), `Issue Summary & Area`
   (+ lokasi + tag kategori), `AI Score` (92/88/74/62/38 + label alasan),
   `SLA Clock` (`6m 42s` s/d `-12m 18s SLA Overrun` pada `SR-2026-0887`
   BREACHED). Footer: `Selected: 1 item`, `Batch Triage`, `Re-Assign Zone`,
   `HTMX Stream: Active`, pagination 1/2/3. Strip SCADA:
   `Telemetry Sensor T-RACK-04 reading 28.4°C (+3.2°C ambient delta)` +
   badge `THERMAL ALERT`.
6. **Kartu evaluasi triase (kanan, 5 kolom)** — header
   `Active Triage Evaluation` + `DISPATCH LEVEL 1`; ID mono `SR-2026-0894`
   + `Submitted 8 mins ago via Slack Ops Bot`; judul tiket; kartu reporter
   (foto, nama, ext/mobile/desk); matriks algoritma SCADA
   (`92 / 100 [CRITICAL]`, gauge bar, grid Business Impact `Server Offline` /
   Asset Criticality `Tier 1 (Core DC)` / Safety `OSHA Req`).
7. **Form konversi & dispatch routing** — select `Target Work Order Type`
   (`EMERGENCY BREAKDOWN (WO-EM-01)` terpilih; opsi `WO-CM-02`, PM follow-up,
   inspeksi diagnostik); `Linked Asset Registry` (`AST-HVAC-014`,
   Liebert PAC 50kW #2, badge `Verified SCADA Match`, tombol `Change`);
   select `Assigned Lead Technician` (Marcus Kowalski available / Victor Torres
   in transit 15m / Siddharth Bryant dispatched); warning overlap PM
   (Kowalski ada PM Substation 4 pk 16:30, overlap ~25 menit); checkbox
   `Mandate Safety Lockout / Tagout (LOTO)` (checked); tombol primer
   `Convert to Work Order & Dispatch Lead (hx-post)` + sekunder
   `Request Info`, `Reject / Duplicate`.
8. **Triage log & requester comms** — feed live room 3 event (Sarah 14:02:11:
   rack 26.5°C; SCADA bot 14:03:04: `T-RACK-04` 27.8°C naik 0.3°C/min +
   Compressor Stage 2 fault di `AST-HVAC-014`; Marcus Vance 14:06:50:
   konversi ke P1 Emergency WO) + quick reply box (input + attach + `Send`).
9. **Empty state tersembunyi** — ilustrasi `Triage Inbox Cleared`, tombol
   `Return to Active Desk` + `Review Converted WOs` (toggle via JS, bukan route).

### State UI

- **Empty state:** SUDAH dimockup (hidden `div#emptyQueueState`) — judul
  `Triage Inbox Cleared`, deskripsi monitoring tetap aktif, dua tombol aksi.
  Filter tanpa hasil → tampilkan varian ringkas empty state + `Clear`.
- **Loading state:** skeleton baris tabel (5 baris: checkbox, ID, requester,
  summary, skor, SLA); kartu evaluasi memakai skeleton + gauge shimmer;
  tombol `Convert...` menampilkan spinner (`hx-post`-style) dan disabled
  selama request; `Sync Now` berputar.
- **Error state:** konversi gagal → toast destruktif + tiket tetap
  `NEW / UNTRIAGED` (tidak hilang dari antrean); SCADA feed basi →
  strip berubah abu + label `STALE`; kirim chat gagal → bubble merah + tombol
  `Retry`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path` identik, header
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di
bawah adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: 15 item (`service-requests` aktif) | `/operations`, `/work-orders`, `/service-requests` (halaman ini), `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` — EXISTS (mockup) |
| Breadcrumb `Home / Operations / Service Requests / SR-2026-0894` | `Home` → `/`; segmen tengah grup; chip tiket → query `?ticket=SR-2026-0894` di halaman ini (tanpa route detail per tiket) |
| `+ Submit New Request` | Modal submit request (`POST /api/v1/service-requests`), tetap di halaman |
| `Export Ticket Log` | Async job export log tiket — MISSING (target tak terdefinisi) |
| Tab status + pagination + filter rail | Query params (`?status=new&category=hvac&location=hq-c4&page=`), bukan navigasi |
| Baris tabel tiket (klik) | Seleksi inline (panel kanan berganti), bukan navigasi — deep-link tiket opsional `?ticket=` |
| `Change` (linked asset) | Asset lookup modal/drawer (`/assets` dengan konteks) — MISSING (prefill flow) |
| `Convert to Work Order & Dispatch Lead` | Aksi `POST` → hasil konversi `WO-...` baru → `/work-orders/[id]` — MISSING |
| `Request Info` / `Reject / Duplicate` | Aksi API inline, tetap di halaman |
| `Batch Triage`, `Re-Assign Zone` | Aksi batch atas item ter-checklist — MISSING (perilaku tak terdefinisi) |
| Quick reply `Send` | Aksi `POST` komentar, tetap di halaman |
| `Preview Empty Queue View` / `Return to Active Desk` | Toggle JS demo, bukan navigasi |
| `Review Converted WOs` (empty state) | `/work-orders` (hasil konversi) — MISSING (dead-end dari empty state) |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` hasil konversi (HIGH)** — seluruh tujuan tombol
   `Convert to Work Order & Dispatch Lead` tidak punya halaman; ini dead-end
   terbesar halaman ini (konsisten dengan `navigation-audit.md` §4 item 1).
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **`/service-requests/[id]` (MEDIUM)** — triase inline sudah kaya, tetapi
   riwayat per tiket dan tautan hasil konversi SR→WO belum terdefinisi
   (konsisten dengan `navigation-audit.md` §4 item 5). Putuskan: tetap
   query-param `?ticket=` atau route detail penuh.
3. **Perilaku batch bar (MEDIUM)** — `Batch Triage` dan `Re-Assign Zone`
   tidak terdefinisi (modal? aksi langsung?).
4. **Target `Export Ticket Log` (LOW)** — samakan pola dengan export global
   (`Export Executive Report` → job → `/reports`).
   `// TODO: Define export job target for ticket log (reuse /reports export pipeline)`

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN** + config inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/SLA),
  ikon **Material Symbols Outlined**.
- Satu-satunya JS adalah `toggleDeskState()` untuk preview empty state —
  murni demo, tanpa fetch (`hx-post` hanya label teks).
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/service-requests` (daftar + panel evaluasi sebagai parallel route atau state query `?ticket=`); typing `ServiceRequest`, `PriorityScore`, `TriageMessage`. |
| **Tailwind CSS (build, bukan CDN)** | Styling split-pane 7/5 kolom, tabel dense, kartu evaluasi. Token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Table`, `Checkbox`, `Progress`, `Avatar`, `Skeleton`, `ScrollArea`, `Toast` | Tab status, tabel antrean + checkbox batch, gauge skor AI, form konversi, feed chat, skeleton/toast. |
| **lucide-react** | Pengganti Material Symbols (ikon search, refresh, send, sensor, alarm). |
| **SWR atau TanStack Query** | Poll antrean + SLA clock tiap 10s (`HTMX Poll`/`HTMX Stream`); optimistis update saat konversi; penanda `STALE`. |
| **axios** (atau `fetch` + `ky`) | HTTP client dengan interceptor auth + base URL `/api/v1`. |
| **date-fns + date-fns-tz** | Format SLA clock (`6m 42s` / `-12m 18s Overrun`), timestamp chat (`14:02:11 UTC`), `Submitted 8 mins ago`. |
| **zod + react-hook-form** | Validasi form konversi (tipe WO required, asset required, teknisi required, LOTO wajib checked untuk P1). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/service-requests` | On page load + tab/filter/search/pagination | Query: `?status=new&category=hvac&location=hq-c4&search=&page=1&perPage=10`. Response: `{ "data": [{ "id": "SR-2026-0894", "priority": "P1-CRITICAL", "requester": "Sarah Jenkins", "dept": "IT Infra", "ext": "x4921", "summary": "AC Unit Blowing Hot Air in Server Room", "location": "Bldg C, Fl 4, Server Rm 402", "category": "HVAC", "aiScore": 92, "aiReason": "High Thermal", "slaTargetSec": 900, "slaRemainingSec": 402 }], "meta": { "total": 142, "counts": { "new": 5, "triaged": 12, "assigned": 18, "converted": 98, "rejected": 9 } } }` |
| GET | `/api/v1/service-requests/:id` | On select baris tiket (panel kanan) | Response: `{ "data": { "id": "SR-2026-0894", "title": "AC Unit Blowing Hot Air in Data Center Backup Room", "channel": "SLACK_OPS_BOT", "submittedAt": "...", "reporter": { "name": "Sarah Jenkins", "role": "IT Infrastructure Lead", "ext": "x4921" }, "priorityScore": 92, "impact": { "business": "Server Offline", "criticality": "Tier 1 (Core DC)", "safety": "OSHA Req" }, "linkedAssetId": "AST-HVAC-014" } }` |
| GET | `/api/v1/service-requests/:id/messages` | On select tiket + poll live room | Response: `{ "data": [{ "actor": "Sarah Jenkins", "role": "REQUESTER", "text": "Server room rack temp just breached 26.5°C...", "at": "14:02:11 UTC" }, { "actor": "SCADA Telemetry Bot", "text": "Linked Sensor T-RACK-04 reports 27.8°C...", "at": "14:03:04 UTC" }] }` |
| POST | `/api/v1/service-requests/:id/messages` | On click `Send` di quick reply | Body: `{ "text": "..." }`. Response: `{ "data": { "id": "msg-77", "at": "..." } }` |
| POST | `/api/v1/service-requests` | On submit `+ Submit New Request` | Body: `{ "summary": "...", "location": "...", "category": "HVAC", "requesterId": "..." }`. Response: `{ "data": { "id": "SR-2026-0895", "status": "NEW" } }` |
| POST | `/api/v1/service-requests/:id/convert` | On click `Convert to Work Order & Dispatch Lead (hx-post)` | Body: `{ "workOrderType": "WO-EM-01", "assetId": "AST-HVAC-014", "assigneeId": "tech-kowalski", "lotoMandated": true }`. Response: `{ "data": { "workOrderId": "WO-2026-0895", "status": "DISPATCHED" } }` |
| POST | `/api/v1/service-requests/:id/request-info` | On click `Request Info` | Body: `{ "question": "..." }`. Response: `{ "data": { "id": "SR-2026-0894", "status": "TRIAGED" } }` |
| POST | `/api/v1/service-requests/:id/reject` | On click `Reject / Duplicate` | Body: `{ "reason": "DUPLICATE", "duplicateOf": "SR-2026-0890" }`. Response: `{ "data": { "id": "SR-2026-0894", "status": "REJECTED" } }` |
| POST | `/api/v1/service-requests/batch-triage` | On click `Batch Triage` (item ter-checklist) | Body: `{ "ids": ["SR-2026-0894"], "action": "TRIAGE", "assigneeId": null }`. Response: `{ "data": { "updated": 1 } }` |
| GET | `/api/v1/facilities/scada-feed` | On page load + poll (strip telemetri) | Response: `{ "data": { "sensor": "T-RACK-04", "readingC": 28.4, "deltaC": 3.2, "alert": "THERMAL ALERT" } }` |
| GET | `/api/v1/technicians/availability` | On open form konversi (opsi select teknisi) | Response: `{ "data": [{ "id": "tech-kowalski", "name": "Marcus Kowalski", "skill": "HVAC Master, Shift A", "state": "AVAILABLE" }, { "id": "tech-torres", "name": "Victor Torres", "state": "IN_TRANSIT", "etaMin": 15 }] }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/service-requests.mock.ts` selama backend belum
siap. Setiap blok wajib berkomentar `// TODO` dengan endpoint penggantinya.

```ts
// TODO: Replace queue mock with GET /api/v1/service-requests?status=new&category=hvac&location=hq-c4
export const triageQueue = [
  { id: "SR-2026-0894", priority: "P1-CRITICAL", requester: "Sarah Jenkins", dept: "IT Infra", ext: "x4921", summary: "AC Unit Blowing Hot Air in Server Room", location: "Bldg C, Fl 4, Server Rm 402", category: "HVAC", aiScore: 92, aiReason: "High Thermal", slaText: "6m 42s", slaTarget: "Target: 15m" },
  { id: "SR-2026-0893", priority: "P1-CRITICAL", requester: "David Ross", summary: "Main Dock Overhead Hydraulic Door Jammed", aiScore: 88, slaText: "11m 15s" },
  { id: "SR-2026-0892", priority: "P2-HIGH", requester: "Amina Lee", summary: "Autoclave 3 Pressure Relief Sibilance", aiScore: 74, slaText: "24m 00s" },
  { id: "SR-2026-0887", priority: "BREACHED", requester: "Thomas Kim", summary: "Main Atrium Escort Gate Access Sensor Failure", aiScore: 62, slaText: "-12m 18s" },
  { id: "SR-2026-0885", priority: "P3-NORMAL", requester: "Elena Moreno", summary: "Flickering LED Bank in Conference Suite B", aiScore: 38, slaText: "54m 10s" },
];

// TODO: Replace counts mock with meta.counts from GET /api/v1/service-requests
export const statusCounts = { all: 142, new: 5, triaged: 12, assigned: 18, converted: 98, rejected: 9 };

// TODO: Replace evaluation mock with GET /api/v1/service-requests/SR-2026-0894
export const activeEvaluation = {
  id: "SR-2026-0894", channel: "SLACK_OPS_BOT", submittedAgo: "8 mins ago",
  score: 92, level: "CRITICAL",
  impact: { business: "Server Offline", criticality: "Tier 1 (Core DC)", safety: "OSHA Req" },
  linkedAsset: { id: "AST-HVAC-014", name: "Liebert PAC 50kW Precision Chiller Unit #2", verified: true },
};

// TODO: Replace tech options mock with GET /api/v1/technicians/availability
export const technicianOptions = [
  { id: "tech-kowalski", label: "Marcus Kowalski (HVAC Master, Shift A) — Available On-Site" },
  { id: "tech-torres", label: "Victor Torres (Refrigeration Tech II) — In Transit (15m)" },
];

// TODO: Replace messages mock with GET /api/v1/service-requests/SR-2026-0894/messages (poll 10s)
export const triageMessages = [
  { actor: "Sarah Jenkins (Requester)", at: "14:02:11 UTC", text: "Server room rack temp just breached 26.5°C warning threshold." },
  { actor: "SCADA Telemetry Bot", at: "14:03:04 UTC", text: "Linked Sensor T-RACK-04 reports 27.8°C (rising at +0.3°C/min)." },
];

// TODO: Create detail page routing for /work-orders/[id] (conversion result target)
// TODO: Decide ticket deep-link: query ?ticket= vs route /service-requests/[id]
// TODO: Define export job target for ticket log (reuse /reports export pipeline)
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/service-requests?status=new', fetcher)
import { triageQueue } from "@/mocks/service-requests.mock";

export function TriageQueueTable({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Table>
      <TableBody>
        {triageQueue.map((sr) => (
          <TableRow key={sr.id} onClick={() => onSelect(sr.id)}>
            <TableCell className="font-mono font-bold">{sr.id}</TableCell>
            <TableCell>{sr.summary}</TableCell>
            <TableCell><Badge>{sr.aiScore} / 100</Badge></TableCell>
            <TableCell className="font-mono">{sr.slaText}</TableCell>
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

1. **Dua teknisi bernama Schmidt.** Opsi select menampilkan
   `Marcus Kowalski (HVAC Master, Shift A)` dan warning overlap menyebut
   `Marcus Kowalski has a scheduled PM task on Substation 4 at 16:30` —
   konsisten di halaman ini, tetapi `work_order_management_execution_hub`
   memakai `Marcus Kowalski` (tanpa "i") sebagai lead tech yang sama.
   Normalisasi ejaan nama saat seeding (`Kowalski` vs `Kowalski`).
2. **Kanal submit tak konsisten.** Tiket aktif `Submitted ... via Slack Ops Bot`,
   tetapi tidak ada layar/文档 integrasi Slack di `settings_system_configuration`
   (perlu diverifikasi saat audit settings). Catat sebagai gap integrasi.
