# UI Audit — Inspection Findings Auto-WO Conversion Desk (`inspection_findings_auto_wo_conversion_desk`)

> Sumber: `stitch_facility_maintenance_platform_ui/inspection_findings_auto_wo_conversion_desk/code.html` (543 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: **bagian dari `/field-inspections`** (tab/section, bukan route
> top-level — lihat `navigation-audit.md` §2). Dibuat: 2026-09-13.
> Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Defect Ledger & Auto-WO Dispatch** (disebut juga Findings &
Auto-WO Conversion Desk) adalah meja triase untuk **temuan gagal inspeksi**:
mengubah defect (`FND-*`) yang dicatat teknisi lapangan menjadi Work Order
prioritas dengan BOM parts yang sudah di-stage otomatis. Temuan aktif adalah
`FND-2026-0188` — kebocoran seal poros chiller 18.4 ppm pada `AST-HVAC-004`
(via `INS-2026-0412`), yang oleh rule `#HVAC-LEAK-R134A` dipromosikan menjadi
Emergency P1 dan siap dikonversi menjadi `WO-2026-8802`.

Halaman ini adalah **ujung hilir** dari rantai inspeksi: audit dijalankan di
tablet (`mobile-execution.md`) → dijadwalkan di hub (`field-inspections.md`)
→ temuan gagal ditriase di sini → WO dieksekusi di (`work-orders.md`).
Breadcrumb `Home / Core Operations / Field Inspections / Findings & Auto-WO
Conversion Desk` menegaskan posisinya sebagai anak dari Field Inspections.

### Daftar elemen UI utama

1. **Sub-header + kontrol kanan** — H1 `Defect Ledger & Auto-WO Dispatch`;
   badge (`Active Ledger`, `5 Unresolved`, `SLA: <30m Triage`,
   `Auto-WO Engine: Online`); tombol `Export CSV`, `Audit Integrity Report`,
   `Batch Convert to Work Orders (3)` (primary).
2. **Matriks metrik (3 tile)** — `Total Audit Failures (Month) 32`
   (88% Converted to WO, 12% Dismissed w/ Justification, progress bar);
   `Critical Safety / OSHA Breach Findings 03` (`CRITICAL FAIL`,
   100% Requires Mandatory LOTO WO, SLA IMMEDIATE); `Mean Time to Repair
   (MTTR) 3.4 Hours avg.` (-18% faster via Auto-WO Pipeline).
3. **Aliran defect (kiri, 5 kolom)** — tab filter (`All 12`,
   `CRITICAL FAIL 5`, `OUT-OF-SPEC 4`, `CONVERTED 3`; 5+4+3 = 12 ✓);
   search terisi `FND-2026` + tombol tune; 3 kartu:
   `FND-2026-0188` CRITICAL FAIL + OSHA Mandatory (seal poros refrigeran,
   `AST-HVAC-004` Centrifugal Chiller Unit 04 Basement Mech B-204,
   telemetri `Ultrasonic leak probe: 18.4 ppm` vs `Threshold: 0.0 ppm`,
   thumbnail + M. Kowalski via `INS-2026-0412`, badge `Active Triage →`,
   22m ago, kartu terpilih dengan strip merah);
   `FND-2026-0185` CRITICAL FAIL (starter battery `AST-GEN-01`,
   `Measured: 21.4 VDC` vs `Nominal: 24.0 VDC`, T. Chen via
   `INS-2026-0409`, tombol `Select >`, 2h ago);
   `FND-2026-0182` OUT-OF-SPEC METER (Delta-P filter `AST-ENV-108`,
   `340 Pa` vs `Max limit: 280 Pa`, E. Rostova via `INS-2026-0415`,
   tombol `Select >`, 4h ago). Teaser rule engine:
   `Triage Rule: #HVAC-LEAK-R134A` (`Auto-promotes leaks >10ppm to
   Emergency P1 Breakdown`, `ENFORCED`).
4. **Konsol konversi (kanan, 7 kolom)** — header finding (`FND-2026-0188`,
   source `INS-2026-0412 Weekly Chiller Run-Check`, judul, badge
   `Priority: Emergency P1`); bar metadata 4 kolom (Recorded Today 14:15 UTC,
   Auditor M. Kowalski Cert #882, Asset Tier `Tier 1 Critical Mission`,
   Location Mech Room B-204 / Pad 4); perbandingan Nominal
   (`0.0 ppm R-134a`, flange 45 Nm) vs Actual
   (`18.4 ppm R-134a`, oil emulsion, bearing chirping); foto bukti
   `PHOTO_CHILLER4_SEAL.RAW` (EXIF 48.12°N 11.58°E ±1m, `SHA-256 Verified`,
   `Full Specimen View`).
5. **Form Auto-WO Dispatch Profile** — badge
   `PRE-COMPILED VIA TEMPLATE #WO-HVAC-LEAK`; select tipe WO
   (`EMERGENCY BREAKDOWN (WO-EM-01)`); prioritas
   `P1 - IMMEDIATE CALLOUT (<1 HOUR)` Score 94/100; input judul WO
   ter-generate (`Corrective Repair & Seal Replacement: Chiller #4...`);
   lead tech Marcus Kowalski (HVAC Master Shift A Lead, `AVAILABLE`);
   SLA `Today 18:15 UTC (4h Window)` (OSHA Clean Air Containment Mandate);
   tabel BOM 2 baris (`PART-SEAL-8821` 1 ea `CRIB-B / Bin C-04` `$1,450.00`;
   `PART-LUB-09` 1 pail `CRIB-CHEM / Rack 02` `$195.00`;
   `All Line Items in Central Crib`); banner LOTO 480V 3-phase (checked,
   WO tak bisa ditutup tanpa lock voucher + purge certificate).
6. **Action bar** — `Dismiss Finding (Requires Justification)` (danger),
   `Schedule Routine PM`, dan primer
   `Convert Finding to Work Order & Auto-Dispatch Lead` (JS: spinner
   `Generating WO-2026-8802 & Dispatching...` → sukses
   `WO-2026-8802 Dispatched to M. Kowalski`, tombol berubah hijau).

### State UI

- **Empty state:** filter `FND-` tanpa hasil → kartu kosong + "Tidak ada
  temuan cocok" + tombol reset filter (belum dimockup, wajib ditambah);
  semua temuan terkonversi → varian cleared mirip triage hub
  + tombol `Review Converted WOs`.
- **Loading state:** skeleton 3 tile metrik + kartu defect + konsol konversi;
  tombol convert menampilkan spinner + disabled + label progres
  (`Generating WO-...`); tabel BOM skeleton 2 baris.
- **Error state:** konversi gagal → toast destruktif + finding tetap
  `CRITICAL FAIL` (tidak pindah ke CONVERTED); BOM tidak tersedia →
  badge `All Line Items...` berubah `SHORTAGE` + tombol convert disabled
  dengan alasan; dismiss tanpa justifikasi → error inline pada modal
  justifikasi.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path` identik — tanpa
item aktif khusus findings, karena ia bagian dari Field Inspections; header
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di
bawah adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: 15 item (tidak ada item findings; induk `field-inspections`) | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections` (induk halaman ini), `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization`, `/settings` — EXISTS (mockup) |
| Breadcrumb `Home / Core Operations / Field Inspections / Findings...` | `Findings...` → tab/section di `/field-inspections` (atau `/field-inspections/findings`) — EXISTS sebagai mockup section |
| `Batch Convert to Work Orders (3)` | Aksi batch `POST` 3 temuan terpilih → daftar WO hasil — MISSING (halaman hasil batch) |
| `Export CSV` | Unduh CSV ledger defect — MISSING (target tak terdefinisi; samakan pola export global) |
| `Audit Integrity Report` | Laporan integritas ledger (hash chain) — MISSING |
| Tab filter + search | Query params (`?severity=critical&search=FND-2026`), bukan navigasi |
| Kartu defect / `Select >` | Seleksi inline (konsol kanan berganti), bukan navigasi |
| `Full Specimen View` (foto bukti) | Evidence viewer penuh — MISSING |
| `Schedule Routine PM` | Prefill ke `/preventive-maintenance` (konvensi `?asset=`/`?finding=`) — MISSING (prefill flow) |
| `Dismiss Finding` | Modal justifikasi + aksi `POST`, tetap di halaman |
| `Convert Finding to Work Order & Auto-Dispatch Lead` | Aksi `POST` → `WO-2026-8802` → `/work-orders/[id]` — MISSING |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` hasil konversi (HIGH)** — tombol konversi (dan hasil
   simulasi `WO-2026-8802 Dispatched`) tidak punya halaman tujuan; konsisten
   dengan `navigation-audit.md` §3 (baris Findings desk).
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Keputusan permukaan findings (MEDIUM)** — mockup ini tidak punya item
   sidebar; pastikan ia hidup sebagai tab/section `/field-inspections`
   (atau `/field-inspections/findings`) dan tombol `Review Findings` dari hub
   menaut ke sana dengan finding terpilih (`?finding=FND-2026-0188`).
   `// TODO: Decide findings surface (tab vs /field-inspections/findings) and deep-link ?finding=`
3. **Evidence viewer + integrity report (MEDIUM)** — `Full Specimen View` dan
   `Audit Integrity Report` butuh viewer bukti + halaman/ekspor rantai hash.
4. **Hasil batch convert + export CSV (LOW)** — `Batch Convert (3)` dan
   `Export CSV` tanpa tujuan; samakan pola export dengan `/reports`.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- File HTML statis satu file, styling via **Tailwind Play CDN** + config inline.
- Font Google: **Inter** (body), **JetBrains Mono** (ID/telemetri/BOM),
  ikon **Material Symbols Outlined**.
- Satu-satunya JS: handler `btn-convert` (disabled + spinner SVG +
  `setTimeout` 900ms → label sukses `WO-2026-8802` + ganti warna tombol) —
  murni simulasi, tanpa fetch.
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Section/tab di `/field-inspections` (atau route `/field-inspections/findings`); typing `Finding`, `ConversionProfile`, `BomLine`. |
| **Tailwind CSS (build, bukan CDN)** | Styling split 5/7 kolom, kartu defect, konsol konversi, tabel BOM. Token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Table`, `Checkbox`, `Progress`, `Skeleton`, `Toast`, `Dialog` | Tile metrik, tab filter, kartu defect, form dispatch profile, tabel BOM, modal justifikasi dismiss, skeleton/toast. |
| **lucide-react** | Pengganti Material Symbols (ikon bolt, lock, camera, shield). |
| **SWR atau TanStack Query** | Fetch defect stream + profil konversi; mutasi convert/dismiss dengan optimistis update tab counts; poll `Auto-WO Engine` ringan. |
| **axios** (atau `fetch` + `ky`) | HTTP client dengan interceptor auth + base URL `/api/v1`. |
| **date-fns + date-fns-tz** | Format `22m ago`/`2h ago`, `Today 14:15 UTC`, SLA `Today 18:15 UTC (4h Window)`. |
| **zod + react-hook-form** | Validasi profil konversi (tipe WO, judul, teknisi, LOTO checked) + justifikasi dismiss (required, min length). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Semua response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/inspections/findings` | On page load + tab filter/search | Query: `?severity=critical&search=FND-2026`. Response: `{ "data": [{ "id": "FND-2026-0188", "severity": "CRITICAL_FAIL", "osha": true, "title": "Refrigerant Line Primary Mechanical Shaft Seal", "assetId": "AST-HVAC-004", "auditId": "INS-2026-0412", "telemetry": { "reading": "18.4 ppm", "threshold": "0.0 ppm" }, "recordedAgo": "22m ago" }], "meta": { "total": 12, "counts": { "critical": 5, "outOfSpec": 4, "converted": 3 }, "unresolved": 5 } }` |
| GET | `/api/v1/inspections/findings/:id` | On select kartu defect (konsol kanan) | Response: `{ "data": { "id": "FND-2026-0188", "source": "INS-2026-0412 (Weekly Chiller Run-Check)", "priority": "P1", "recordedAt": "Today 14:15 UTC", "auditor": "M. Kowalski (Cert #882)", "tier": "Tier 1 Critical Mission", "nominal": "Hermetic seal integrity, 0.0 ppm R-134a...", "actual": "Ultrasonic sniffer alarmed at 18.4 ppm R-134a...", "evidence": [{ "file": "PHOTO_CHILLER4_SEAL.RAW", "exif": "48.12°N 11.58°E ±1m", "sha256": "verified" }] } }` |
| GET | `/api/v1/inspections/findings/:id/conversion-preview` | On select defect (form pre-compiled) | Response: `{ "data": { "template": "WO-HVAC-LEAK", "workOrderType": "WO-EM-01", "priority": "P1", "score": 94, "title": "Corrective Repair & Seal Replacement: Chiller #4 Mechanical Shaft Leak (AST-HVAC-004)", "assignee": "Marcus Kowalski", "slaAt": "Today 18:15 UTC", "bom": [{ "sku": "PART-SEAL-8821", "qty": 1, "bin": "CRIB-B / Bin C-04", "estCost": 1450.0 }, { "sku": "PART-LUB-09", "qty": 1, "bin": "CRIB-CHEM / Rack 02", "estCost": 195.0 }], "lotoRequired": true } }` |
| POST | `/api/v1/inspections/findings/:id/convert` | On click `Convert Finding to Work Order & Auto-Dispatch Lead` | Body: `{ "workOrderType": "WO-EM-01", "title": "...", "assigneeId": "tech-kowalski", "lotoAccepted": true }`. Response: `{ "data": { "workOrderId": "WO-2026-8802", "assignee": "M. Kowalski", "status": "DISPATCHED" } }` |
| POST | `/api/v1/inspections/findings/batch-convert` | On click `Batch Convert to Work Orders (3)` | Body: `{ "ids": ["FND-2026-0188", "FND-2026-0185", "FND-2026-0182"] }`. Response: `{ "data": { "created": [{ "findingId": "FND-2026-0188", "workOrderId": "WO-2026-8802" }] } }` |
| POST | `/api/v1/inspections/findings/:id/dismiss` | On click `Dismiss Finding (Requires Justification)` | Body: `{ "justification": "..." }`. Response: `{ "data": { "id": "FND-2026-0188", "state": "DISMISSED" } }` |
| POST | `/api/v1/pm-plans/from-finding` | On click `Schedule Routine PM` | Body: `{ "findingId": "FND-2026-0188", "assetId": "AST-HVAC-004" }`. Response: `{ "data": { "planId": "PM-PLN-0113", "state": "DRAFT" } }` |
| GET | `/api/v1/inspections/triage-rules` | On page load (teaser rule) | Response: `{ "data": [{ "id": "HVAC-LEAK-R134A", "condition": "leaks >10ppm", "action": "PROMOTE_P1_EMERGENCY", "state": "ENFORCED" }] }` |
| GET | `/api/v1/inspections/metrics` | On page load (3 tile) | Response: `{ "data": { "failuresMonth": 32, "convertedPct": 0.88, "dismissedPct": 0.12, "criticalOsha": 3, "mttrHours": 3.4, "mttrDeltaPct": -0.18 } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Seluruh mock tinggal di `mocks/findings-conversion.mock.ts` selama backend
belum siap. Setiap blok wajib berkomentar `// TODO` dengan endpoint penggantinya.

```ts
// TODO: Replace metrics mock with GET /api/v1/inspections/metrics
export const findingsMetrics = {
  failuresMonth: 32, convertedPct: 0.88, dismissedPct: 0.12,
  criticalOsha: 3, mttrHours: 3.4, mttrDeltaPct: -0.18,
};

// TODO: Replace findings mock with GET /api/v1/inspections/findings?severity=critical&search=FND-2026
export const defectStream = [
  { id: "FND-2026-0188", severity: "CRITICAL_FAIL", osha: true, assetId: "AST-HVAC-004", auditId: "INS-2026-0412", reading: "18.4 ppm", threshold: "0.0 ppm", ago: "22m ago", active: true },
  { id: "FND-2026-0185", severity: "CRITICAL_FAIL", assetId: "AST-GEN-01", auditId: "INS-2026-0409", reading: "21.4 VDC", threshold: "24.0 VDC", ago: "2h ago" },
  { id: "FND-2026-0182", severity: "OUT_OF_SPEC", assetId: "AST-ENV-108", auditId: "INS-2026-0415", reading: "340 Pa", threshold: "280 Pa", ago: "4h ago" },
];

// TODO: Replace preview mock with GET /api/v1/inspections/findings/FND-2026-0188/conversion-preview
export const conversionPreview = {
  template: "WO-HVAC-LEAK", workOrderType: "WO-EM-01",
  priority: "P1 - IMMEDIATE CALLOUT (<1 HOUR)", score: 94,
  title: "Corrective Repair & Seal Replacement: Chiller #4 Mechanical Shaft Leak (AST-HVAC-004)",
  assignee: "Marcus Kowalski", slaAt: "Today 18:15 UTC (4h Window)",
  bom: [
    { sku: "PART-SEAL-8821", qty: "1 ea", bin: "CRIB-B / Bin C-04", estCost: 1450.0 },
    { sku: "PART-LUB-09", qty: "1 pail (5 gal)", bin: "CRIB-CHEM / Rack 02", estCost: 195.0 },
  ],
  lotoRequired: true,
};

// TODO: Replace convert simulation (btn-convert timeout) with POST /api/v1/inspections/findings/FND-2026-0188/convert
// TODO: Create detail page routing for /work-orders/[id] (conversion result WO-2026-8802)
// TODO: Decide findings surface (tab vs /field-inspections/findings) and deep-link ?finding=
```

Contoh binding ke komponen (Next.js + shadcn, ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/inspections/findings?severity=critical', fetcher)
import { defectStream } from "@/mocks/findings-conversion.mock";

export function DefectStream({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      {defectStream.map((fnd) => (
        <button key={fnd.id} onClick={() => onSelect(fnd.id)}>
          <span className="font-mono font-bold">{fnd.id}</span>
          <span className="font-mono">{fnd.reading} / {fnd.threshold}</span>
          <Badge>{fnd.severity}</Badge>
        </button>
      ))}
    </div>
  );
}
```

Aturan penggantian mock → API: hapus satu blok mock per endpoint yang sudah live,
ganti dengan `useSWR` + `Skeleton` saat `isLoading` + `Toast` saat `error`,
dan pertahankan struktur field agar komponen tidak berubah.

### Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Hasil konversi ganda untuk insiden seal yang sama.** Alur ini menghasilkan
   `WO-2026-8802` dari `FND-2026-0188` (`AST-HVAC-004`, 18.4 ppm), sedangkan
   `work_order_management_execution_hub` mengeksekusi `WO-2026-0894` untuk
   pekerjaan seal yang sama pada `AST-HVAC-014`. Dua nomor WO + dua tag aset
   untuk satu cerita kebocoran — putuskan mana yang kanonis sebelum seeding.
2. **Harga `PART-SEAL-8821` berbeda**: `$1,450.00` di sini vs `$1,420.00` di
   WO hub. Normalisasi ke satu master price.
3. **Koordinat EXIF foto tak selaras dengan lapangan.** `PHOTO_CHILLER4_SEAL.RAW`
   ber-EXIF `48.12°N 11.58°E` (Eropa Tengah), sedangkan layar mobile untuk
   audit yang sama menampilkan GPS `0.7893° S, 113.9213° E` (Kalimantan).
   Samakan lokasi kanonis (kawasan HQ Nusantara).
