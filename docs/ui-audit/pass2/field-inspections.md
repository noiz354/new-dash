# UI Audit Pass-2 — Field Inspections (`field_inspections_audit_queue_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/field_inspections_audit_queue_hub/code.html` (653 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2 independen, belum membandingkan pass-1).
> Konteks global: `docs/ui-audit/navigation-audit.md` (sidebar 15 `data-path`, semua `href="#"`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Inspection & Audit Engine** adalah hub antrean audit lapangan +
builder template protokol. Breadcrumb
`Home / Core Operations / Field Inspections / Audit Queue & Template Builder`.
Dua fungsi dalam satu layar: kiri menjalankan audit terjadwal (siapa, aset apa,
jatuh tempo kapan), kanan merancang langkah verifikasi teknisi
(`TMPL-HVAC-CHL-02` v2.4 Draft, 4 mandated steps dengan guardrail logika).

Alur kerja: filter antrean → buka run / force dispatch / review findings →
pantau gateway IoT → edit template → publish → lompat ke eksekusi mobile atau
meja konversi.

### Daftar elemen UI utama

1. **Header konteks** — H1 + 4 pill (`Live HTMX Poll: 15s`,
   `Audit Compliance: 98.2%`, `Pending Field Audits: 7 Queued`,
   `Engine: v4.8 Active`) + tombol `Export Audit Log`, `Shift Handover`,
   `+ Create Inspection Template`.
2. **KPI 4 kartu** — `Active Inspection Protocols 24` (100% mapped, +2 MTD),
   `Inspection Compliance SLA 98.2% PASS` (target 95.0), `Defects / Failed
   Checks (7d) 08` (6 auto-converted, 2 pending triage), `Mobile Submissions
   Today 14` (Shift A 9 / B 5, 100% synced).
3. **Antrean kiri (7 kolom)** — tab `All Audits (18)` / `Today / Imminent (6)` /
   `Overdue / SLA Risk (2)` / `Completed (10)` / `Templates & Forms` (tab
   terakhir tanpa konten — dead-end); search `Ctrl + /`, filter Zone +
   Discipline; tabel 6 kolom 5 baris: `INS-2026-0412` Chiller `AST-HVAC-004`
   Today 16:00 due 45m M. Kowalski 65% IN PROGRESS `Open Run`;
   `INS-2026-0409` Generator `AST-GEN-01` overdue 3h T. Chen `Force Dispatch`;
   `INS-2026-0415` Cleanroom `AST-ENV-108` tomorrow E. Rostova `Preview`;
   `INS-2026-0398` Substation `AST-ELEC-01` completed 10:15 2 FINDINGS
   `Review Findings`; `INS-2026-0420` Fire `ZONE-DC-04` Feb 18 R. Davies
   `Details`; footer `Showing 5 of 18`, Page 1/4.
4. **Widget telemetri** — `Substation IoT Gateway Link`, Modbus TCP/IP aktif,
   `AST-ELEC-01` Bus Bar 42.4°C Nom, `SCADA STREAMING`.
5. **Template builder kanan (5 kolom)** — header `TMPL-HVAC-CHL-02 v2.4 Draft`
   `Central Chiller Safety & Diagnostic Protocol`, bar
   `4 Mandated Verification Steps` + `Logic Guardrails Active`; Step 01 Binary
   P/F E-Stop & LOTO (PASS/FAIL + `If FAIL: Auto-Flag Critical & Force Hazard
   Photo`); Step 02 Numeric Bound suction 110–130 PSI (input 122.0,
   `Value within nominal limits`, `Out-of-bounds trigger automatic WO`);
   Step 03 Mandatory Media sight glass (macro photo + GPS geotag + `1 Shot
   Req`); Step 04 IoT Auto-Populate Modbus 40112 Delta-T (ΔT 9.8°F
   auto-attached); aksi `+ Add Checklist Step` / `Save Draft` /
   `Publish Template (v2.4)`; drag handle `drag_indicator` (visual saja).
6. **Fast-link bawah (2 kartu `div` klik)** — `Mobile Tablet Execution View`
   (`Offline PWA Ready`) dan `Findings & Auto-WO Conversion Desk`
   (`2 Action Required`); keduanya `div.cursor-pointer` tanpa `<a>` —
   tidak accessible, tanpa `href`.
7. **Script shortcut** — `Ctrl/Cmd + /` fokus ke search audit (satu-satunya JS).

### State UI

- **Empty state:** filter kosong → "Tidak ada audit pada filter ini" +
  `Reset`; tab Templates & Forms saat ini kosong tanpa pesan (harus diisi).
- **Loading state:** skeleton 5 baris + 4 kartu template; tombol Publish
  spinner.
- **Error state:** overdue merah + `Lapsed 3h ago`; gateway gagal →
  `SCADA STREAMING` abu + `STALE`; publish gagal → toast + draft tetap v2.4.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global. Semua `href="#"` — target usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Field Inspections | `/field-inspections` (halaman ini) |
| Sidebar 14 item lain | Route §2 `navigation-audit.md` |
| Breadcrumb `Home / Core Operations / Field Inspections / Audit Queue` | `Home` → `/`; tengah bukan route |
| `+ Create Inspection Template` | Modal/drawer `POST /api/v1/inspection-templates` (tetap di halaman) |
| Tab antrean / search / filter zone/discipline / pagination | Query `?tab=all&search=&zone=&discipline=&page=` (tetap di halaman) |
| `Open Run` (INS-2026-0412) | `/(field)/run/INS-2026-0412` (mobile execution) — MISSING di desktop (hanya fast-link div) |
| `Force Dispatch` (INS-2026-0409) | Aksi `POST` inline (tetap di halaman) |
| `Preview` / `Details` | Drawer detail audit — MISSING (atau modal) |
| `Review Findings` (INS-2026-0398) | `/field-inspections/findings?audit=INS-2026-0398` — MISSING sebagai route (mockup terpisah ada) |
| Tab `Templates & Forms` | Konten/tab `?tab=templates` — MISSING (konten tak terdefinisi) |
| `+ Add Checklist Step` / `Save Draft` / `Publish Template (v2.4)` | Aksi API inline (tetap di halaman) |
| Kartu `Mobile Tablet Execution View` (div) | `/(field)/run/INS-2026-0412` — MISSING (tanpa anchor) |
| Kartu `Findings & Auto-WO Conversion Desk` (div) | `/field-inspections/findings` — MISSING sebagai route |
| `Export Audit Log` | Job unduh (terkait `/reports` atau `/audit-logs`) |
| `Shift Handover` | Flow handover — MISSING |
| Ikon `notifications` (header global) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Route eksekusi mobile (HIGH)** — `Open Run` dan kartu mobile tanpa
   `<a>`; alur `queue → run → submit → sync` terputus di desktop.
   `// TODO: Link Open Run to /(field)/run/[auditId] with accessible anchor`
2. **`/field-inspections/findings` (HIGH)** — `Review Findings` + kartu
   konversi tanpa route; mockup meja konversi ada tetapi tidak terhubung.
   `// TODO: Create findings route for /field-inspections/findings?audit=INS-2026-0398`
3. **Konten `Templates & Forms` (MEDIUM)** — tab ada, konten tidak ada.
   `// TODO: Define templates tab content for ?tab=templates`
4. **Drawer detail audit (MEDIUM)** — `Preview`/`Details` tanpa tujuan.
   `// TODO: Create audit detail drawer for /field-inspections/[auditId]`
5. **Shift handover (LOW)** — tombol tanpa tujuan.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols.
  Satu JS: shortcut `Ctrl+/`. Drag handle dan `div` fast-link hanya visual.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/field-inspections` + nested `/field-inspections/findings`; `searchParams` tab/filter/page. |
| **Tailwind CSS (build)** | Grid 7/5, tabel dense, kartu builder; token A. |
| **shadcn/ui** — `Tabs`, `Table`, `Input`, `Select`, `Badge`, `Progress`, `Card`, `Button`, `Skeleton`, `Toast`, `Dialog` | Antrean, builder step, modal template, drawer detail. |
| **lucide-react** | Pengganti Material Symbols. |
| **dnd-kit** | Drag reorder step builder yang kini hanya ikon (accessible). |
| **SWR / TanStack Query** | Poll antrean 15s + telemetri gateway; autosave draft template. |
| **axios** | Client `/api/v1`. |
| **date-fns + date-fns-tz** | `Due in 45m`, `Lapsed 3h ago`, `Today 10:15 UTC`, `Feb 18, 09:00`. |
| **zod + react-hook-form** | Validasi template (4 step, bound numerik, media mandatory, channel Modbus). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/inspections/summary` | KPI 24 / 98.2% / 08 (6 converted 2 pending) / 14 | On page load |
| GET | `/api/v1/inspections?tab=all&search=&zone=&discipline=&page=` | Antrean 18 + pagination | On page load + tab/filter/page |
| POST | `/api/v1/inspections/INS-2026-0409/force-dispatch` | Force dispatch overdue | On click Force Dispatch |
| GET | `/api/v1/inspection-templates/TMPL-HVAC-CHL-02` | Template v2.4 + 4 steps + guardrails | On page load (builder) |
| POST | `/api/v1/inspection-templates` | Buat template baru | On click + Create |
| PUT | `/api/v1/inspection-templates/TMPL-HVAC-CHL-02/draft` | Save draft builder | On click Save Draft / autosave |
| POST | `/api/v1/inspection-templates/TMPL-HVAC-CHL-02/publish` | Publish v2.4 | On click Publish |
| POST | `/api/v1/inspection-templates/TMPL-HVAC-CHL-02/steps` | Tambah step checklist | On click + Add Checklist Step |
| GET | `/api/v1/inspections/INS-2026-0398/findings` | 2 findings untuk Review | On click Review Findings |
| GET | `/api/v1/telemetry/gateway?asset=AST-ELEC-01` | Bus bar 42.4°C + SCADA STREAMING | Poll 15s |
| POST | `/api/v1/reports/inspection-audit-export` | Export audit log | On click Export |

Contoh:

```ts
// TODO: Replace queue mock with GET /api/v1/inspections?tab=all&page=1
const res = await fetch("/api/v1/inspections?tab=all&page=1&zone=all");
const { data, meta } = await res.json(); // meta: { total: 18 }
```

```ts
// TODO: Replace publish demo with POST /api/v1/inspection-templates/TMPL-HVAC-CHL-02/publish
await axios.post("/api/v1/inspection-templates/TMPL-HVAC-CHL-02/publish", { version: "v2.4" });
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace summary mock with GET /api/v1/inspections/summary
export const inspectionSummary = {
  protocols: 24, compliance: 0.982,
  defects7d: 8, autoConverted: 6, pendingTriage: 2,
  mobileToday: 14, shiftA: 9, shiftB: 5, syncedPct: 1,
};

// TODO: Replace queue mock with GET /api/v1/inspections?tab=all&page=1
export const auditQueue = [
  { id: "INS-2026-0412", name: "Chiller Plant Pre-Shift Safety & Pressure Audit", asset: "AST-HVAC-004", zone: "Basement Mech Room B-204", due: "Today 16:00", sla: "Due in 45m", auditor: "M. Kowalski", status: "IN_PROGRESS", progress: 65 },
  { id: "INS-2026-0409", name: "Emergency Generator Fuel & Battery System Run Test", asset: "AST-GEN-01", zone: "Sub-Basement Vault", due: "Overdue", sla: "Lapsed 3h ago", auditor: "T. Chen", status: "OVERDUE" },
  { id: "INS-2026-0415", name: "Cleanroom ISO Class 5 HEPA Filter & Diff Pressure", asset: "AST-ENV-108", zone: "Clean Lab Annex 4", due: "Tomorrow 08:30", auditor: "E. Rostova", status: "SCHEDULED" },
  { id: "INS-2026-0398", name: "Substation HV Switchgear Infrared Thermography", asset: "AST-ELEC-01", zone: "Grid Substation Yard", due: "Completed Today 10:15 UTC", auditor: "M. Kowalski", status: "FINDINGS", findings: 2 },
  { id: "INS-2026-0420", name: "Fire Suppression FM-200 Bottle Weight & Actuator Audit", asset: "ZONE-DC-04", zone: "Raised Floor Data Center", due: "Feb 18, 09:00", auditor: "R. Davies", status: "READY" },
];

// TODO: Replace template mock with GET /api/v1/inspection-templates/TMPL-HVAC-CHL-02
export const chillerTemplate = {
  id: "TMPL-HVAC-CHL-02", version: "v2.4 Draft",
  title: "Central Chiller Safety & Diagnostic Protocol",
  steps: [
    { code: "STEP 01", type: "Binary P/F", title: "Emergency Stop & LOTO Lock Guard Integrity", rule: "If FAIL: Auto-Flag Critical & Force Hazard Photo" },
    { code: "STEP 02", type: "Numeric Bound", title: "Compressor Suction Pressure Reading", minPsi: 110, maxPsi: 130, sample: 122.0 },
    { code: "STEP 03", type: "Mandatory Media", title: "Sight Glass Bubble Check & Moisture Indicator", shots: 1 },
    { code: "STEP 04", type: "IoT Auto-Populate", title: "Operating Run Hours & Delta-T Reading", channel: "Modbus 40112", deltaT: "9.8°F" },
  ],
};

// TODO: Replace gateway mock with GET /api/v1/telemetry/gateway?asset=AST-ELEC-01 (poll 15s via SWR)
export const gatewayLink = { asset: "AST-ELEC-01", busTempC: 42.4, state: "SCADA STREAMING" };
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/inspections?tab=all', fetcher)
import { auditQueue } from "@/mocks/field-inspections.mock";

export function AuditQueueTable() {
  return (
    <table>
      <tbody>
        {auditQueue.map((a) => (
          // TODO: Link Open Run to /(field)/run/[auditId]
          <tr key={a.id}>
            <td className="font-mono font-bold">{a.id}</td>
            <td>{a.name}</td>
            <td className="font-mono">{a.asset}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Aturan ganti mock → API: satu blok per endpoint, `useSWR` + `Skeleton` +
`Toast`, ubah `div` fast-link menjadi `<a>` saat route live.

## 7. PERBANDINGAN PASS-1 vs PASS-2

Dibaca setelah seksi 1–6 selesai: `docs/ui-audit/field-inspections.md` (pass-1).

### (a) Temuan pass-1 yang TERKONFIRMASI

- KPI 24 / 98.2% / 08 (6+2) / 14 (A9/B5), 5 baris audit (`INS-2026-0412`
  65% `Open Run` → `INS-2026-0420` READY), builder `TMPL-HVAC-CHL-02` 4 step
  (Binary / 110–130 PSI + sample 122.0 / Mandatory Media / Modbus 40112
  ΔT 9.8°F), fast-link `div` tanpa anchor, shortcut `Ctrl+/` — cocok.
- Missing pass-1 (route `/(field)/run/[auditId]` HIGH, status findings,
  drawer `Preview`/`Details`, mode create template) terkonfirmasi.
- Tiga Temuan pass-1 terkonfirmasi via grep + `screen.png`: `div.group.
  cursor-pointer` tanpa `<a>` (tidak accessible), progres `INS-2026-0412`
  `65%` (hub) vs `Step 2 of 4 (50%)` (mobile) — mismatch rumus, dan tab
  `Templates & Forms` tanpa konten. Ketiganya sah; dua yang terakhir
  **hanya saya singgung tanpa ketajaman pass-1** — akui.

### (b) Temuan BARU yang luput di pass-1

- **Aritmetika antrean + defect terverifikasi.** Tab `All 18` vs
  `Today 6 + Overdue 2 + Completed 10 = 18` ✓, dan `6 auto-converted +
  2 pending = 8` defects ✓ — pass-1 tidak memverifikasi penjumlahan ini
  (padahal memverifikasi aritmetika serupa di SR/PM). Koreksi kecil ini
  menutup celah konsistensi.
- **Pola drawer+deep-link terpadu untuk `Preview`/`Details`.** Pass-1
  mendaftarkan keduanya sebagai MISSING terpisah; pass-2 mengusulkan pola
  tunggal (drawer read-only + deep-link opsional
  `/field-inspections/[auditId]`) agar dua tombol tidak menjadi dua pola.
  `// TODO: Unify Preview/Details into one audit drawer pattern`

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Satu klarifikasi: pass-1 menulis
  `Review Findings` → "EXISTS (sebagai section, bukan route)". Status tepatnya
  **parsial** — mockup section ada tetapi tidak tertaut dari hub (tanpa
  anchor), sehingga dari sudut pandang navigasi ia tetap dead-end sampai
  `?finding=` dihubungkan. Bukan kesalahan, hanya presisi status.
