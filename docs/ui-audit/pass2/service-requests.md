# UI Audit Pass-2 — Service Requests (`service_requests_triage_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/service_requests_triage_hub/code.html` (650 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2 independen, belum membandingkan pass-1).
> Konteks global: `docs/ui-audit/navigation-audit.md` (sidebar 15 `data-path`, semua `href="#"`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Service Requests & Dispatch Triage Desk** adalah meja triase tiket
masuk menjadi WO: antrean 5 tiket belum di-dispatch dinilai algoritma prioritas
lalu dikonversi satu klik. Breadcrumb
`Home / Operations / Service Requests / SR-2026-0894 • Active Triage`
menegaskan tiket aktif `SR-2026-0894` (AC blowing hot air, Server Room 402,
dilaporkan Sarah Jenkins via Slack Ops Bot 8 menit lalu).

Alur kerja: filter antrean (status/category/location) → pilih tiket → verifikasi
skor AI + SCADA → routing (tipe WO, aset, teknisi, LOTO) → Convert & Dispatch
→ lanjutkan komunikasi di Triage Log.

### Daftar elemen UI utama

1. **Sub-header operasional** — breadcrumb + pill `Active Triage`, strip
   `HTMX Poll: 10s | Target SLA <15m`, tombol `Export Ticket Log`,
   `+ Submit New Request`, toggle `Preview Empty Queue View`
   (`toggleDeskState()`).
2. **Title + backlog** — H1 + pill `Queue Backlog: 5 Untriaged`.
3. **Tab status + agregator prioritas** — `ALL 142` / `NEW / UNTRIAGED 5`
   aktif / `TRIAGED 12` / `ASSIGNED 18` / `CONVERTED TO WO 98` /
   `REJECTED / CLOSED 9`; chip `P1 Critical: 2`, `P2 High: 2`, `P3 Medium: 1`.
4. **Filter rail** — omnisearch (`Ctrl + /`), dropdown Category
   (`HVAC & Environmental` terpilih), Location
   (`HQ Nusantara > Building C > Floor 4 (DC)` terpilih), `Clear`, `Sync Now`.
5. **Antrean kiri (7 kolom)** — header `Incoming Requests Queue`
   + `5 Awaiting Dispatch` + `Avg Response: 4.2m`; tabel 6 kolom
   (checkbox, Ticket ID, Requester, Issue Summary & Area, AI Score, SLA Clock)
   5 baris: `SR-2026-0894` P1 92/100 6m42s terpilih, `SR-2026-0893` P1 88
   11m15s, `SR-2026-0892` P2 74 24m00s, `SR-2026-0887` BREACHED -12m18s,
   `SR-2026-0885` P3 38 54m10s; footer batch (`Batch Triage`, `Re-Assign Zone`,
   pagination 1/2/3, `HTMX Stream: Active`); strip SCADA
   `T-RACK-04 28.4°C (+3.2°C delta) THERMAL ALERT`.
6. **Triage desk kanan (5 kolom, `<aside>`)** — header
   `Active Triage Evaluation` + `DISPATCH LEVEL 1`, ID `SR-2026-0894`,
   judul, kartu reporter (foto, Ext 4921, mobile +1 (555) 019-4921, Desk C4-12),
   matriks `SCADA Priority Algorithm 92/100 [CRITICAL]` + gauge + 3 metrik
   (Server Offline / Tier 1 Core DC / OSHA Req), form konversi (WO type
   `EMERGENCY BREAKDOWN (WO-EM-01)`, aset `AST-HVAC-014` Liebert PAC 50kW
   + `Verified SCADA Match` + `Change`, teknisi Marcus Kowalski Available +
   warning overlap PM Substation 4 16:30 ~25m, checkbox LOTO tercentang),
   tombol `Convert to Work Order & Dispatch Lead (hx-post)` + `Request Info` /
   `Reject / Duplicate`.
7. **Triage Log & Requester Comms** — timeline Sarah (26.5°C breach 14:02:11),
   SCADA Bot (`T-RACK-04` 27.8°C +0.3°C/min, Compressor Stage 2 fault 14:03:04),
   Marcus Vance (convert P1, assign Kowalski 14:06:50) + reply box + attach +
   Send; badge `Live Room`.
8. **Empty state tersembunyi** — `#emptyQueueState` (`Triage Inbox Cleared`,
   `Return to Active Desk`, `Review Converted WOs`) ditoggle JS, bukan route.

### State UI

- **Empty state:** sudah dimock (`Triage Inbox Cleared` + monitoring tetap
  aktif); tabel kosong idealnya menampilkan ilustrasi + `Reset Filter`.
- **Loading state:** skeleton 5 baris antrean + kartu triase; `Sync Now`
  spinner; tombol Convert loading `Generating WO...`.
- **Error state:** breach (`SR-2026-0887` merah + `SLA Overrun`); SCADA gagal →
  badge `THERMAL ALERT` abu + `STALE`; convert gagal → toast + tiket tetap
  NEW.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global. Semua `href="#"` — target adalah route usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Service Requests (badge 5) | `/service-requests` (halaman ini) |
| Sidebar 14 item lain | Route §2 `navigation-audit.md` (`/operations`, `/work-orders`, `/preventive-maintenance`, `/field-inspections`, …) |
| Breadcrumb `Home / Operations / Service Requests / SR-2026-0894` | `Home` → `/`; segmen tiket → `/service-requests/[id]` — MISSING |
| `+ Submit New Request` | Modal `POST /api/v1/service-requests` (tetap di halaman) |
| `Export Ticket Log` | Async job unduh log (terkait `/reports`) |
| `Preview Empty Queue View` / `Return to Active Desk` | Toggle div inline (bukan navigasi; idealnya `?view=empty` untuk deep-link) |
| Tab status / filter / pagination / checkbox batch | Query `?status=new&category=hvac&location=hq-c4&page=` (tetap di halaman) |
| Baris tiket (klik) | Seleksi inline + `?ticket=SR-2026-0894`; tidak ada navigasi detail — MISSING bila diklik dua kali |
| `Change` (aset) | Drawer lookup `/assets?search=` — MISSING (prefill flow) |
| `Convert to Work Order & Dispatch Lead` | Aksi `POST`, hasil idealnya link `/work-orders/[id]` — MISSING |
| `Review Converted WOs` (empty state) | `/work-orders?source=SR-2026-0894` — MISSING |
| `Request Info` / `Reject / Duplicate` | Aksi inline (ubah status), tetap di halaman |
| Reply `Send` | `POST` komentar (tetap di halaman) |
| Ikon `notifications` (header global) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/service-requests/[id]` (MEDIUM)** — tidak ada deep-link per tiket;
   breadcrumb dan seleksi baris hanya state inline. Butuh route agar tiket bisa
   dibagikan.
   `// TODO: Create detail page routing for /service-requests/[id]`
2. **`/work-orders/[id]` hasil konversi (HIGH)** — tombol Convert tidak punya
   tujuan pasca-sukses; empty state `Review Converted WOs` juga menggantung.
   `// TODO: Link conversion result to /work-orders/[id]`
3. **Asset lookup drawer (MEDIUM)** — `Change` tanpa tujuan; butuh drawer
   `/assets` dengan mode pilih + kembalikan `assetId`.
   `// TODO: Create asset picker drawer for ?pickAsset=1`
4. **Target global `+ New Dispatch / Request` (MEDIUM)** — sama lintas hub;
   seragamkan menjadi command palette + modal kontekstual.
5. **Batch triage flow (LOW)** — `Batch Triage` / `Re-Assign Zone` tanpa
   definisi hasil (toast vs halaman batch).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN + config inline, Inter + JetBrains Mono,
  Material Symbols. Satu interaksi nyata: `toggleDeskState()` menukar
  `#mainWorkspace` ↔ `#emptyQueueState`. Label `hx-post`/`HTMX Stream` hanya
  teks.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/service-requests` + kandidat `/service-requests/[id]`; `searchParams` untuk tab/filter/tiket aktif. |
| **Tailwind CSS (build)** | Tabel dense 6 kolom, kartu triase, chip prioritas; token sistem A. |
| **shadcn/ui** — `Tabs`, `Badge`, `Table`, `Checkbox`, `Input`, `Select`, `Card`, `Progress`, `Avatar`, `Skeleton`, `Toast`, `Dialog`, `ScrollArea` | Tab status, tabel antrean, form routing, timeline log, modal submit/reject. |
| **lucide-react** | Pengganti Material Symbols (search, refresh, alarm, sensors, send). |
| **SWR / TanStack Query** | Poll antrean 10s + SLA clock 1s (client tick dari `slaDueAt`); optimistis convert. |
| **axios** | Client `/api/v1` + interceptor auth. |
| **date-fns + date-fns-tz** | `6m 42s`, `-12m 18s`, `14:03:04 UTC`, target 15m/45m/120m. |
| **zod + react-hook-form** | Validasi Submit Request + form konversi (tipe WO, assetId, techId, LOTO wajib). |
| **next-themes / realtime (SSE/WS)** | Ganti label HTMX dengan stream nyata untuk SCADA + chat log. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/service-requests?status=new&category=hvac&location=hq-c4&search=&page=` | Antrean + count tab (142/5/12/18/98/9) + agregator P1/P2/P3 | On page load + tab/filter/search/pagination/Sync |
| GET | `/api/v1/service-requests/SR-2026-0894` | Detail tiket aktif + reporter + skor AI + SCADA link | On select row / page load dengan `?ticket=` |
| GET | `/api/v1/service-requests/SR-2026-0894/priority-score` | Hasil algoritma 92/100 + 3 metrik + gauge | On select (atau gabung ke detail) |
| GET | `/api/v1/assets/AST-HVAC-014` | Verifikasi SCADA match untuk kartu aset | On select (prefetch saat hover Change) |
| GET | `/api/v1/technicians?skill=hvac&available=1` | Opsi lead (Kowalski/Torres/Bryant) + warning overlap | On focus dropdown teknisi |
| POST | `/api/v1/service-requests` | Submit tiket baru | On submit `+ Submit New Request` |
| POST | `/api/v1/service-requests/SR-2026-0894/convert-to-wo` | Konversi + dispatch (ganti `hx-post` demo) | On click Convert |
| POST | `/api/v1/service-requests/batch-triage` | Triase massal item tercentang | On click `Batch Triage` |
| POST | `/api/v1/service-requests/SR-2026-0894/request-info` | Minta info ke requester | On click `Request Info` |
| POST | `/api/v1/service-requests/SR-2026-0894/reject` | Reject/duplicate dengan alasan | On click `Reject / Duplicate` |
| GET | `/api/v1/service-requests/SR-2026-0894/comments` | Timeline Triage Log (Sarah/Bot/VP) | On select + poll/realtime |
| POST | `/api/v1/service-requests/SR-2026-0894/comments` | Kirim instruksi ke requester | On click Send |
| GET | `/api/v1/telemetry/scada-feed?sensor=T-RACK-04` | Strip korelasi 28.4°C + THERMAL ALERT | Poll 10s |
| POST | `/api/v1/reports/ticket-log-export` | Export log tiket async | On click `Export Ticket Log` |

Contoh:

```ts
// TODO: Replace queue mock with GET /api/v1/service-requests?status=new&category=hvac
const res = await fetch("/api/v1/service-requests?status=new&category=hvac&location=hq-c4");
const { data, meta } = await res.json(); // data: tickets[], meta: { total: 142, backlog: 5 }
```

```ts
// TODO: Replace hx-post demo with POST /api/v1/service-requests/SR-2026-0894/convert-to-wo
await axios.post("/api/v1/service-requests/SR-2026-0894/convert-to-wo", {
  workOrderType: "WO-EM-01", assetId: "AST-HVAC-014",
  leadTechId: "mkowalski", lotoRequired: true,
}); // -> { data: { workOrderId: "WO-2026-0895" } }
// TODO: Navigate result to /work-orders/[id]
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace counts mock with GET /api/v1/service-requests (meta counts)
export const srTabs = [
  { key: "ALL", count: 142 }, { key: "NEW", count: 5 },
  { key: "TRIAGED", count: 12 }, { key: "ASSIGNED", count: 18 },
  { key: "CONVERTED", count: 98 }, { key: "REJECTED", count: 9 },
];

// TODO: Replace queue mock with GET /api/v1/service-requests?status=new
export const triageQueue = [
  { id: "SR-2026-0894", priority: "P1 CRITICAL", requester: "Sarah Jenkins", dept: "IT Infra • x4921", issue: "AC Unit Blowing Hot Air in Server Room", area: "Bldg C, Fl 4, Server Rm 402", tag: "HVAC", aiScore: 92, aiLabel: "High Thermal", slaText: "6m 42s", slaTarget: "15m" },
  { id: "SR-2026-0893", priority: "P1 CRITICAL", requester: "David Ross", issue: "Main Dock Overhead Hydraulic Door Jammed", aiScore: 88, slaText: "11m 15s" },
  { id: "SR-2026-0892", priority: "P2 HIGH", requester: "Amina Lee", issue: "Autoclave 3 Pressure Relief Sibilance", aiScore: 74, slaText: "24m 00s" },
  { id: "SR-2026-0887", priority: "BREACHED", requester: "Thomas Kim", issue: "Main Atrium Escort Gate Access Sensor Failure", aiScore: 62, slaText: "-12m 18s" },
  { id: "SR-2026-0885", priority: "P3 NORMAL", requester: "Elena Moreno", issue: "Flickering LED Bank in Conference Suite B", aiScore: 38, slaText: "54m 10s" },
];

// TODO: Replace triage mock with GET /api/v1/service-requests/SR-2026-0894
export const activeTriage = {
  id: "SR-2026-0894", via: "Slack Ops Bot", agoMin: 8,
  title: "AC Unit Blowing Hot Air in Data Center Backup Room",
  reporter: { name: "Sarah Jenkins", role: "IT Infrastructure Lead", ext: "4921", mobile: "+1 (555) 019-4921" },
  score: 92, level: "CRITICAL",
  impact: { business: "Server Offline", criticality: "Tier 1 (Core DC)", safety: "OSHA Req" },
  asset: { id: "AST-HVAC-014", name: "Liebert PAC 50kW Precision Chiller Unit #2", verified: true },
  tech: { id: "mkowalski", name: "Marcus Kowalski", note: "Overlap PM Substation 4 at 16:30 (~25m)" },
  lotoRequired: true,
};

// TODO: Replace feed mock with GET /api/v1/telemetry/scada-feed?sensor=T-RACK-04
export const scadaStrip = { sensor: "T-RACK-04", tempC: 28.4, deltaC: 3.2, state: "THERMAL ALERT" };

// TODO: Replace log mock with GET /api/v1/service-requests/SR-2026-0894/comments
export const triageLog = [
  { actor: "Sarah Jenkins (Requester)", at: "14:02:11 UTC", text: "Server room rack temp just breached 26.5°C ..." },
  { actor: "SCADA Telemetry Bot", at: "14:03:04 UTC", text: "T-RACK-04 reports 27.8°C ... Compressor Stage 2 fault ..." },
  { actor: "Marcus Vance (Operations VP)", at: "14:06:50 UTC", text: "Converting to P1 Emergency WO now ..." },
];
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/service-requests?status=new', fetcher)
import { triageQueue } from "@/mocks/service-requests.mock";

export function TriageQueue() {
  return (
    <table>
      <tbody>
        {triageQueue.map((t) => (
          <tr key={t.id}>
            <td className="font-mono font-bold">{t.id}</td>
            <td>{t.requester}</td>
            <td className="font-mono">{t.aiScore} / 100</td>
            <td className="font-mono">{t.slaText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Aturan ganti mock → API: hapus satu blok per endpoint live, ganti `useSWR` +
`Skeleton` + `Toast`, pertahankan shape field.

## 7. PERBANDINGAN PASS-1 vs PASS-2

Dibaca setelah seksi 1–6 selesai: `docs/ui-audit/service-requests.md` (pass-1).

### (a) Temuan pass-1 yang TERKONFIRMASI

- Antrean 5 baris + skor AI (92/88/74/62/38) + SLA clock (termasuk
  `SR-2026-0887 BREACHED -12m 18s`), strip SCADA `T-RACK-04 28.4°C`,
  matriks prioritas 92/100 (Server Offline / Tier 1 / OSHA), form konversi
  (`WO-EM-01`, `AST-HVAC-014` verified, Kowalski + warning overlap PM
  Substation 4 16:30 ~25m, LOTO), timeline 3 event + empty state toggle —
  semua cocok dengan `code.html` + `screen.png`.
- Verifikasi aritmetika pass-1 (5+12+18+98+9 = **142**; P1 2 + P2 2 + P3 1 = 5
  untriaged) benar dan **luput saya verifikasi di pass-2** — akui kelalaian.
- Missing utama (`/work-orders/[id]` hasil konversi HIGH) terkonfirmasi.

### (b) Temuan BARU yang luput di pass-1

- **Taksonomi `DISPATCH LEVEL 1` + kode WO tak dibahas.** Badge
  `DISPATCH LEVEL 1` dan opsi tipe (`WO-EM-01` / `WO-CM-02` / PM follow-up /
  inspeksi diagnostik) adalah taksonomi dispatch yang butuh definisi global
  (kapan Level 1 vs 2, pemetaan kode → SLA) — pass-1 hanya mencatat nilai
  select tanpa mengangkatnya sebagai gap definisi.
  `// TODO: Define dispatch-level taxonomy and WO type codes`
- **Endpoint batch/info/reject luput dari kontrak pass-1?** Pass-1 justru
  sudah memuatnya (`batch-triage`, `request-info`, `reject`) — jadi BUKAN
  temuan baru; saya mencatatnya agar tidak diklaim ganda. Temuan baru yang
  sah: opsi teknisi ketiga `Siddharth Bryant (Electrical Tech III) —
  Dispatched` tidak dibahas pass-1 (hanya Kowalski/Torres), padahal status
  `Dispatched` menjelaskan mengapa ia bukan kandidat.

### (c) KOREKSI atas pass-1 (eksplisit)

- **KOREKSI 1 — Temuan ejaan ganda "Kowalski vs Kowalski" TIDAK TERBUKTI.**
  Grep atas kedua `code.html` batch ini menunjukkan ejaan konsisten
  `Kowalski`: WO hub 4× (`Marcus Kowalski` 3× + `M. Kowalski` 1×),
  SR hub 3× (`Marcus Kowalski` 2× + `Assigning Kowalski` 1×). Tidak ada varian
  tanpa-i di kedua file. Temuan pass-1 §"Temuan" item 1 perlu **direvisi atau
  dihapus** (kecuali variannya ada di layar batch lain di luar 6 ini —
  sebutkan sumbernya bila dipertahankan).
- **KOREKSI 2 — Gap integrasi Slack belum terverifikasi di batch ini.**
  Pass-1 item 2 menyimpulkan tidak ada layar integrasi Slack di settings —
  itu di luar 6 layar batch inti dan belum saya audit di pass-2. Status yang
  tepat: **belum terverifikasi di batch ini**, bukan temuan layar SR.
  Usul pindahkan ke audit settings, bukan temuan SR.
