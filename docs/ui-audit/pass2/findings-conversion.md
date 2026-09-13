# UI Audit Pass-2 — Findings Conversion (`inspection_findings_auto_wo_conversion_desk`)

> Sumber: `stitch_facility_maintenance_platform_ui/inspection_findings_auto_wo_conversion_desk/code.html` (543 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2 independen, belum membandingkan pass-1).
> Konteks global: `docs/ui-audit/navigation-audit.md` (diusulkan sebagai
> tab/section `/field-inspections/findings`, bukan route top-level; semua `href="#"`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Defect Ledger & Auto-WO Dispatch** mengubah temuan inspeksi gagal
menjadi WO darurat yang terisi otomatis (tipe, prioritas, judul, teknisi, SLA,
BOM, LOTO). Breadcrumb
`Home / Core Operations / Field Inspections / Findings & Auto-WO Conversion Desk`.
Temuan aktif `FND-2026-0188` (kebocoran seal poros chiller `AST-HVAC-004`,
18.4 ppm vs threshold 0.0, dari `INS-2026-0412`) dikonversi satu klik menjadi
`WO-2026-8802` via simulasi JS 900ms.

Alur kerja: filter defect stream → pilih temuan → verifikasi nominal vs aktual
+ foto → periksa profil WO otomatis + BOM → enforce LOTO → Convert / Dismiss /
Schedule PM.

### Daftar elemen UI utama

1. **Header + aksi batch** — H1 + pill `Active Ledger`, `5 Unresolved`,
   `SLA: <30m Triage`, `Auto-WO Engine: Online`; tombol `Export CSV`,
   `Audit Integrity Report`, `Batch Convert to Work Orders (3)`.
2. **Metrik 3 tile** — `Total Audit Failures (Month) 32` (88% converted, 12%
   dismissed), `Critical Safety / OSHA Breach 03 CRITICAL FAIL`
   (100% Requires Mandatory LOTO WO, SLA IMMEDIATE), `MTTR 3.4 Hours avg.`
   (-18% via Auto-WO Pipeline).
3. **Defect stream kiri (5 kolom)** — tab `All (12)` / `CRITICAL FAIL (5)`
   aktif / `OUT-OF-SPEC (4)` / `CONVERTED (3)`; search terisi `FND-2026`;
   3 kartu: `FND-2026-0188` CRITICAL OSHA `AST-HVAC-004` chiller seal 18.4 ppm
   22m M. Kowalski `INS-2026-0412` + foto + `Active Triage →` (terpilih, strip
   merah); `FND-2026-0185` CRITICAL `AST-GEN-01` baterai 21.4 vs 24.0 VDC 2h
   T. Chen `INS-2026-0409` + `Select >`; `FND-2026-0182` OUT-OF-SPEC
   `AST-ENV-108` Delta-P 340 vs 280 Pa 4h E. Rostova `INS-2026-0415` +
   `Select >`; teaser rule `#HVAC-LEAK-R134A` (`leaks >10ppm → Emergency P1`)
   `ENFORCED`.
4. **Konsol konversi kanan (7 kolom)** — banner `FND-2026-0188` +
   `Source: INS-2026-0412` + judul `Primary Shaft Seal Refrigerant Leak &
   Bearing Contamination` + `Priority: Emergency P1`; metadata 4 kolom
   (Recorded Today 14:15 UTC, Auditor M. Kowalski Cert #882, Tier 1 Critical
   Mission, Mech Room B-204 / Pad 4); perbandingan Nominal (0.0 ppm R-134a,
   45 Nm) vs Actual (18.4 ppm, weeping, chirping); foto
   `PHOTO_CHILLER4_SEAL.RAW` + `SHA-256 Verified` + EXIF `48.12°N 11.58°E ±1m`
   + `Full Specimen View`.
5. **Form Auto-WO Dispatch Profile** — badge `PRE-COMPILED VIA TEMPLATE
   #WO-HVAC-LEAK`; tipe `EMERGENCY BREAKDOWN (WO-EM-01)`; prioritas
   `P1 - IMMEDIATE CALLOUT (<1 HOUR)` Score 94/100; judul terisi
   `Corrective Repair & Seal Replacement: Chiller #4 ... (AST-HVAC-004)`;
   lead Marcus Kowalski HVAC Master Shift A `AVAILABLE`; SLA `Today 18:15 UTC
   (4h Window)` OSHA; tabel BOM (`PART-SEAL-8821` 1 ea Bin CRIB-B/C-04
   $1,450.00; `PART-LUB-09` 1 pail Rack 02 $195.00) + `All Line Items in
   Central Crib`; banner LOTO 480V tercentang (WO tak bisa close tanpa voucher
   dual-key + sertifikat purge); aksi `Dismiss Finding (Requires
   Justification)` / `Schedule Routine PM` / `Convert Finding to Work Order &
   Auto-Dispatch Lead` (`#btn-convert`).
6. **Micro-interaction** — klik Convert → spinner
   `Generating WO-2026-8802 & Dispatching...` 900ms → sukses
   `WO-2026-8802 Dispatched to M. Kowalski` (ganti kelas ke hijau).

### State UI

- **Empty state:** filter tanpa hasil → "Tidak ada temuan pada filter" +
  `Reset`; semua terkonversi → pesan + `Review Converted WOs` (belum ada
  tautan).
- **Loading state:** skeleton kartu defect + konsol; tombol Convert spinner
  (sudah dimock); Batch Convert loading per 3 item.
- **Error state:** dismiss tanpa justifikasi → validasi inline; BOM kosong →
  warning `Parts Shortage`; LOTO tak dicentang → tombol Convert disabled +
  tooltip; convert gagal → toast + temuan tetap `Active Triage`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Bukan route top-level (usulan: section `/field-inspections` atau
`/field-inspections/findings`). Semua `href="#"`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Field Inspections (induk logis) | `/field-inspections` |
| Sidebar 14 item lain | Route §2 `navigation-audit.md` |
| Breadcrumb `... / Field Inspections / Findings & Auto-WO Conversion Desk` | Induk → `/field-inspections`; segmen akhir → `/field-inspections/findings` (usulan) |
| Tab defect / search `FND-2026` / filter tune | Query `?severity=critical&search=FND-2026` (tetap di halaman) |
| Kartu defect (`Select >` / klik) | Seleksi inline `?finding=FND-2026-0185` (tetap di halaman) |
| `Full Specimen View` | Viewer foto `/field-inspections/findings/FND-2026-0188/photo` atau modal — MISSING |
| `Export CSV` | Job unduh CSV defect |
| `Audit Integrity Report` | Laporan integritas (terkait `/audit-logs`) — MISSING |
| `Batch Convert to Work Orders (3)` | Aksi batch inline (tetap di halaman) |
| `Dismiss Finding` | Aksi inline + modal justifikasi (tetap di halaman) |
| `Schedule Routine PM` | Flow PM `/preventive-maintenance/new?finding=FND-2026-0188` — MISSING (prefill) |
| `Convert Finding to Work Order & Auto-Dispatch Lead` | Aksi `POST`; hasil `WO-2026-8802` idealnya link `/work-orders/[id]` — MISSING |
| Ikon `notifications` (header global) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` hasil konversi (HIGH)** — sukses `WO-2026-8802`
   hanya teks tombol; tidak bisa dibuka. Sama untuk batch (3).
   `// TODO: Link conversion result WO-2026-8802 to /work-orders/[id]`
2. **Route `findings` sendiri (MEDIUM)** — halaman ini tidak terhubung dari
   hub inspeksi (`Review Findings` / kartu fast-link berupa `div`).
   `// TODO: Create findings route for /field-inspections/findings?finding=FND-2026-0188`
3. **Photo specimen viewer (LOW)** — `Full Specimen View` tanpa tujuan.
   `// TODO: Create photo viewer for /field-inspections/findings/[id]/photo`
4. **Prefill PM dari temuan (MEDIUM)** — `Schedule Routine PM` tanpa tujuan;
   butuh konvensi `?finding=`.
   `// TODO: Create prefill flow for /preventive-maintenance/new?finding=FND-2026-0188`
5. **Audit Integrity Report target (LOW)** — tombol tanpa tujuan jelas.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols.
  Satu interaksi: listener `#btn-convert` (spinner → sukses 900ms). Aturan
  `#HVAC-LEAK-R134A` hanya teks `ENFORCED`.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Section `/field-inspections/findings` (`severity`, `finding` via `searchParams`); typing `Finding`, `WoDraft`, `BomLine`. |
| **Tailwind CSS (build)** | Stream 5 kolom + konsol 7 kolom, banner merah, tabel BOM; token A. |
| **shadcn/ui** — `Tabs`, `Input`, `Card`, `Badge`, `Table`, `Select`, `Checkbox`, `Button`, `Skeleton`, `Toast`, `Dialog` | Filter, kartu defect, form WO, modal dismiss/PM, toast hasil. |
| **lucide-react** | Pengganti Material Symbols (bolt, gavel, lock, camera). |
| **SWR / TanStack Query** | Fetch defect + draft WO; mutasi convert/batch dengan optimistis. |
| **axios** | Client `/api/v1` (multipart untuk foto bila upload ulang). |
| **date-fns + date-fns-tz** | `22m ago`, `Today 14:15 UTC`, `Today 18:15 UTC (4h Window)`. |
| **zod + react-hook-form** | Validasi dismiss (justifikasi wajib) + draft WO (tipe, prioritas, SLA, BOM, LOTO). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/inspection-findings?severity=critical&search=FND-2026` | Stream 12 (5/4/3) + pagination | On page load + tab/search |
| GET | `/api/v1/inspection-findings/FND-2026-0188` | Detail temuan + nominal vs aktual + EXIF | On select / page load `?finding=` |
| GET | `/api/v1/inspection-findings/FND-2026-0188/wo-draft` | Draft WO pre-compiled (#WO-HVAC-LEAK, P1 94/100, BOM) | On select (atau gabung detail) |
| POST | `/api/v1/inspection-findings/FND-2026-0188/convert-to-wo` | Convert + auto-dispatch (ganti simulasi 900ms) | On click Convert |
| POST | `/api/v1/inspection-findings/batch-convert` | Batch 3 temuan | On click Batch Convert (3) |
| POST | `/api/v1/inspection-findings/FND-2026-0188/dismiss` | Dismiss + justifikasi wajib | On click Dismiss |
| POST | `/api/v1/pm-plans/from-finding` | Schedule routine PM prefill dari temuan | On click Schedule Routine PM |
| GET | `/api/v1/triage-rules/HVAC-LEAK-R134A` | Aturan enforced >10ppm → P1 | On page load (badge) |
| GET | `/api/v1/inventory/availability?skus=PART-SEAL-8821,PART-LUB-09` | Status `All Line Items in Central Crib` | On draft load |
| POST | `/api/v1/reports/findings-export` | Export CSV | On click Export CSV |
| GET | `/api/v1/audit/integrity-report?scope=findings` | Laporan integritas | On click Audit Integrity Report |

Contoh:

```ts
// TODO: Replace draft mock with GET /api/v1/inspection-findings/FND-2026-0188/wo-draft
const res = await fetch("/api/v1/inspection-findings/FND-2026-0188/wo-draft");
const { data } = await res.json(); // { type: "WO-EM-01", priority: "P1", score: 94, bom: [...] }
```

```ts
// TODO: Replace convert demo with POST /api/v1/inspection-findings/FND-2026-0188/convert-to-wo
const { data } = await axios.post("/api/v1/inspection-findings/FND-2026-0188/convert-to-wo", {
  type: "WO-EM-01", title: "Corrective Repair & Seal Replacement ...",
  leadTechId: "mkowalski", slaAt: "2026-09-13T18:15:00Z", lotoEnforced: true,
}); // -> { data: { workOrderId: "WO-2026-8802" } }
// TODO: Link result to /work-orders/WO-2026-8802
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace stream mock with GET /api/v1/inspection-findings?severity=critical
export const defectStream = [
  { id: "FND-2026-0188", severity: "CRITICAL FAIL", osha: true, asset: "AST-HVAC-004", title: "Refrigerant Line Primary Mechanical Shaft Seal", reading: "18.4 ppm", threshold: "0.0 ppm", ago: "22m ago", tech: "M. Kowalski", audit: "INS-2026-0412" },
  { id: "FND-2026-0185", severity: "CRITICAL FAIL", asset: "AST-GEN-01", title: "Emergency Starter Battery Bank Float Voltage", reading: "21.4 VDC", nominal: "24.0 VDC", ago: "2h ago", tech: "T. Chen", audit: "INS-2026-0409" },
  { id: "FND-2026-0182", severity: "OUT-OF-SPEC METER", asset: "AST-ENV-108", title: "Static Differential Pressure Across Stage 2 Filter", reading: "340 Pa", limit: "280 Pa", ago: "4h ago", tech: "E. Rostova", audit: "INS-2026-0415" },
];

// TODO: Replace finding mock with GET /api/v1/inspection-findings/FND-2026-0188
export const activeFinding = {
  id: "FND-2026-0188", audit: "INS-2026-0412",
  title: "Primary Shaft Seal Refrigerant Leak & Bearing Contamination",
  priority: "Emergency P1", recordedAt: "Today 14:15 UTC",
  auditor: "M. Kowalski (Cert #882)", tier: "Tier 1 Critical Mission",
  location: "Mech Room B-204 / Pad 4",
  nominal: "Hermetic seal integrity, 0.0 ppm R-134a, flange 45 Nm",
  actual: "18.4 ppm R-134a, oil emulsion weeping, bearing chirping",
  photo: { file: "PHOTO_CHILLER4_SEAL.RAW", exif: "48.12°N 11.58°E ±1m", hash: "SHA-256 Verified" },
};

// TODO: Replace WO draft mock with GET /api/v1/inspection-findings/FND-2026-0188/wo-draft
export const woDraft = {
  template: "#WO-HVAC-LEAK", type: "EMERGENCY BREAKDOWN (WO-EM-01)",
  priority: "P1 - IMMEDIATE CALLOUT (<1 HOUR)", score: 94,
  title: "Corrective Repair & Seal Replacement: Chiller #4 Mechanical Shaft Leak (AST-HVAC-004)",
  lead: { name: "Marcus Kowalski", state: "AVAILABLE" },
  sla: "Today 18:15 UTC (4h Window)",
  bom: [
    { sku: "PART-SEAL-8821", desc: "Silicon Carbide Shaft Seal Assembly 2.5\"", qty: "1 ea", bin: "CRIB-B / Bin C-04", cost: 1450.0 },
    { sku: "PART-LUB-09", desc: "Synthetic POE Refrigeration Lubricant ISO 68", qty: "1 pail (5 gal)", bin: "CRIB-CHEM / Rack 02", cost: 195.0 },
  ],
  lotoEnforced: true, mttrH: 3.4, monthFailures: 32, convertedPct: 0.88,
};
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/inspection-findings?severity=critical', fetcher)
import { defectStream } from "@/mocks/findings-conversion.mock";

export function DefectStream() {
  return (
    <ul>
      {defectStream.map((f) => (
        <li key={f.id} className="font-mono">
          {f.id} — {f.title} [{f.reading}]
        </li>
      ))}
    </ul>
  );
}
```

Aturan ganti mock → API: satu blok per endpoint, `useSWR` + `Skeleton` +
`Toast`, tampilkan link `/work-orders/[id]` segera setelah convert live.

## 7. PERBANDINGAN PASS-1 vs PASS-2

Dibaca setelah seksi 1–6 selesai: `docs/ui-audit/findings-conversion.md` (pass-1).

### (a) Temuan pass-1 yang TERKONFIRMASI

- Metrik 32 / 88% / 03 OSHA / MTTR 3.4h (-18%), tab 12 (5/4/3), 3 kartu
  (`FND-2026-0188` 18.4 ppm → `FND-2026-0185` 21.4 VDC → `FND-2026-0182`
  340 Pa), rule `#HVAC-LEAK-R134A >10ppm → P1 ENFORCED`, nominal vs aktual,
  foto `PHOTO_CHILLER4_SEAL.RAW` + EXIF, BOM (`$1,450.00` + `$195.00`),
  LOTO, simulasi `WO-2026-8802` 900ms — cocok.
- Verifikasi aritmetika pass-1 (5+4+3 = 12 ✓) benar dan **luput di pass-2**.
- Missing pass-1 (hasil konversi `/work-orders/[id]` HIGH, permukaan findings,
  evidence viewer + integrity report, batch/export) terkonfirmasi.
- Tiga Temuan pass-1 terkonfirmasi via grep: WO ganda seal
  (`WO-2026-8802`/`AST-HVAC-004` vs `WO-2026-0894`/`AST-HVAC-014`), harga seal
  `$1,450` vs `$1,420`, EXIF `48.12°N 11.58°E` (Eropa) vs GPS mobile
  `0.7893°S, 113.9213°E` (Kalimantan).

### (b) Temuan BARU yang luput di pass-1

- **Ketegangan angka `5 Unresolved` vs tab.** Pill header mengklaim
  `5 Unresolved`, tetapi tab menunjukkan `CONVERTED (3)` dari `All (12)` →
  sisa 9, bukan 5. Satu-satunya bacaan yang konsisten: `Unresolved =
  CRITICAL FAIL (5)` — artinya pill menghitung subset, bukan sisa. Label ini
  menyesatkan dan luput di pass-1.
  `// TODO: Redefine Unresolved pill as CRITICAL-count or remaining-count and sync with tabs`
- **Makna `Batch Convert (3)`.** Angka 3 tidak dijelaskan (3 terpilih? 3
  kritis siap?). Dari konteks kemungkinan = 3 kritis non-aktif, tetapi mockup
  tidak mendefinisikan seleksi batch (tanpa checkbox terlihat). Pass-1
  mendaftarkannya sebagai MISSING tanpa mempertanyakan semantik angka.
- **Jendela SLA 4h terderivasi.** `Today 18:15 UTC (4h Window)` = tepat 4 jam
  setelah `Recorded 14:15 UTC` — aturan derivasi SLA yang tidak dibahas
  pass-1; penting untuk kontrak API (`slaAt = recordedAt + 4h` untuk P1 OSHA).

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Satu presisi: pass-1 menempatkan halaman ini
  "bagian dari `/field-inspections` (bukan top-level)" — pass-2 setuju penuh
  (didukung breadcrumb + tidak ada item sidebar). Tidak ada revisi yang
  diminta atas pass-1 findings.
