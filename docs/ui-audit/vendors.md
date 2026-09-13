# UI Audit — Vendors & Contractors Hub (`vendors_contractors_management_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/vendors_contractors_management_hub/code.html` (728 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**
> untuk konten hub; shell halaman adalah **artefak templat mobile** (lihat Temuan no. 1).
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Hub tata kelola kontraktor: direktori **42 vendor** tersertifikasi,
kontrak **MSA** aktif beserta tenggat renewal, matriks kepatuhan
(asuransi/sertifikasi), scorecard SLA per vendor, teknisi yang lolos
keamanan site, dan dispatch WO terkait vendor. Fokus aktif:
**Trane Technologies** (`VND-HVAC-0012`, `MSA-2024-TRN-09`, Grade A+).

### Daftar elemen UI utama

1. **Status strip + header** — breadcrumb `Home / Asset & Resource /
   Vendors & Contractors Hub` + badge `HTMX: Connected`, `16ms`,
   `Sync: Realtime`, `SLA Engine: Active`; H1
   `Vendors & Contractor Performance Hub` + badge `Tier-1 Registry`;
   aksi `Export Compliance (CSV/PDF)`, `Expiry Ledger (6 Expiring)`,
   `+ Onboard New Vendor / MSA` (primary).
2. **KPI 4 kartu** — `Active Approved Vendors 42`
   (38 Active MSAs • 4 Onboarding, `+3 Qtr`); `Contract Expiry & Renewals 6`
   (`Expiring <60d`, 2 Critical Tier-1 Trane/ABB, `Immediate Audit`);
   `Fleet SLA Compliance 97.4%` (Goal ≥95%, `+2.4% vs baseline`);
   `YTD Contract Commitment $1.84M` (14 Active Blanket POs,
   `88.6% Dispatched`).
3. **Filter direktori** — search (`Trane Technologies` terisi, `Ctrl + /`),
   select `MSA Status` / `Risk`; chip domain (`All Vendors (42)`,
   `HVAC & Mechanical (12)`, `Electrical & HV (8)`,
   `Fire & Life Safety (6)`, `Automation & BMS (9)`, `Civil & Roofing (7)`).
4. **Tabel direktori 5 kolom (5 dari 42)** — Vendor & Tier, Domain & Lead,
   Contract & Term, Performance, Action. Baris: **Trane Technologies**
   (`VND-HVAC-0012`, Tier-1 Mission Critical, verified; Robert Langdon;
   `MSA-2024-TRN-09` Exp 31 Dec 2026 `ACTIVE (312d left)`; 98,4% SLA 4,9★
   Low Risk) [Active]; **ABB Grid Power** (`VND-ELEC-0004`, Elena Voronova,
   `MSA-2023-ABB-02` Exp 15 Mar 2026 `RENEWAL DUE (28d)`, 96,8%)
   [chevron]; **Siemens** (`VND-BMS-0019`, `MSA-2025-SIE-11` s.d. Nov 2027,
   99,1%); **Johnson Controls** (`VND-FIRE-0008`, `MSA-2024-JCI-07`
   s.d. Apr 2026 `60D WINDOW`, 95,2%); **Grainger** (`VND-SUPP-0033`,
   `MSA-CATALOG-BLANKET` continuous, 94,0%). Footer
   (`1 – 5 of 42`, `Auto-synced with Oracle ERP`, halaman 1–3 + Next).
5. **Panel Active Field WOs & Blanket POs** — `WO-2026-0894` DISPATCHED
   (Chiller #04 seal overhaul, Plant Room B-204, `ETA: 35 mins`);
   `PO-2026-0298` GRN RECEIVED (100× MERV 14, Bay 02, `$4,800.00 USD`);
   label `Real-time Telemetry Dispatch Link`.
6. **Kartu profil vendor** — avatar `TRN`, `Trane Technologies`,
   `OEM Certified`, `Code: VND-HVAC-0012 • DUNS: 00-132-9481`;
   tombol print/history; badge `ISO 9001:2015`, `EPA Sec 608 Universal`,
   `OSHA VPP Star`; bar hotline 24/7 `1-800-555-TRANE (Ext. 4 Ops)` +
   `Direct Ring`.
7. **MSA lifecycle + matriks asuransi** — `MSA-2024-TRN-09
   (Chilled Water Core)`, `288d Left (Nominal)`; progress
   (65% elapsed / 20% buffer / 15% renewal; 01 Jan 2024 → Current Yr 2 →
   31 Dec 2026); verifikasi General Liability ($10M, exp Okt 2026),
   Workers' Comp (statutory + $2M, Des 2026), EPA 608 (Agu 2026);
   tombol `View Executed PDF` + `Initiate Amendment`.
8. **Scorecard SLA** — `98.4 / 100`, `Grade A+ Elite Supplier Tier`;
   5 metrik ber-bar: Emergency Response 99,2% (avg 1,4h),
   FTFR 96,5% (38 of 39), OTD 98,8%, TRIR 0,00 (1.420 jam),
   Invoice 3-Way Match 99,6%.
9. **Teknisi cleared + aksi** — `4 Cleared`; Marcus Kowalski
   (Lead Field Engineer, L2 Mech Clearance, `Badge #TEC-884`,
   `RFID Active`); tombol `Dispatch Work Order` (primary) + `Commendation`.

### State UI

- **Empty state:** pencarian vendor kosong → "Vendor tidak ditemukan" +
  CTA Onboard; vendor tanpa MSA aktif → banner `No Active MSA` +
  `Initiate Amendment`; tanpa teknisi cleared → toolchain dispatch
  dinonaktifkan dengan penjelasan.
- **Loading state:** skeleton baris direktori + kartu scorecard; progress
  MSA shimmer; tombol dispatch memakai spinner saat assign.
- **Error state:** sync Oracle ERP gagal → footer `Sync Failed` + `Retry`;
  dokumen PDF gagal dimuat → pesan viewer + unduh langsung; MSA kedaluwarsa
  → banner merah + kunci tombol `Dispatch Work Order` untuk vendor itu.

## 2. Navigation Flow & Routing (Alur Navigasi)

Tidak ada sidebar desktop — hanya bottom-nav mobile 4 tab (artefak, lihat
Temuan no. 1). Semua `href="#"` — target di bawah route usulan
(lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Bottom-nav `Audits / Checklist / Finding / Sync` | Route field `/(field)/…` — **ARTEFAK copy-paste**, bukan navigasi halaman ini (produksi: buang, pakai sidebar desktop) |
| Breadcrumb `Home / Asset & Resource / …` | `Home` → `/`; grup bukan route |
| Baris vendor / `chevron_right` / badge `Active` (Trane) | `/vendors/[id]` (contoh `VND-HVAC-0012`) — MISSING |
| `View Executed PDF` | Document viewer MSA (`MSA-2024-TRN-09`) — MISSING |
| `Initiate Amendment` | Flow amandemen kontrak — MISSING |
| `Dispatch Work Order` | `/work-orders/new?vendorId=VND-HVAC-0012` (prefill) — MISSING |
| `Commendation` | Aksi apresiasi vendor — MISSING (tanpa handler) |
| `Direct Ring` | Aksi `tel:1-800-555-TRANE` — OK (aksi, bukan navigasi) |
| Kartu `WO-2026-0894` | `/work-orders/[id]` — MISSING |
| Kartu `PO-2026-0298` | `/purchasing/[id]` — MISSING |
| `+ Onboard New Vendor / MSA` | Modal onboarding (`POST /api/v1/vendors`) — MISSING |
| `Expiry Ledger (6 Expiring)` | Filter inline `?msaStatus=expiring` — EXISTS (sebagai filter) atau halaman ledger — MISSING (parsial, belum diputuskan) |
| `Export Compliance (CSV/PDF)` | Export job compliance — MISSING |
| Print / history (kartu profil) | Dossier vendor / riwayat audit — MISSING |
| Search, select MSA/Risk, chip domain, pagination | Query params (`?q=Trane&msaStatus=&risk=&domain=&page=`), bukan navigasi |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/vendors/[id]` + MSA document viewer (MEDIUM)** — panel vendor,
   `View Executed PDF`, dan `Initiate Amendment` menggantung
   (lihat `navigation-audit.md` §4 no. 4).
   `// TODO: Create detail page routing for /vendors/[id] (include MSA document viewer)`
2. **Prefill `Dispatch Work Order` (MEDIUM)** — butuh
   `/work-orders/new?vendorId=` (ikut pola prefill §4 no. 8 global).
3. **`/work-orders/[id]` + `/purchasing/[id]` (HIGH)** — kartu
   `WO-2026-0894` dan `PO-2026-0298` mati (ikut missing global no. 1–3).
4. **Flow onboarding + amendment (MEDIUM)** — `+ Onboard New Vendor / MSA`
   dan `Initiate Amendment` butuh form multi-langkah (data perusahaan,
   DUNS, sertifikasi, termin MSA) + approval.
5. **Shell desktop (HIGH, struktural)** — sama seperti purchasing: buang
   bottom-nav, pasang sidebar 15 item + header standar.

> Konsisten dengan `navigation-audit.md`: baris vendors §3 (panel Trane,
> PDF, amendment, dispatch → `/vendors/[id]` MISSING), missing §4 no. 4,
> artefak bottom-nav §5.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + token inline; Inter +
  JetBrains Mono + Space Grotesk (sisa templat) + Material Symbols;
  **tanpa** `<aside>` dan **tanpa** script inline sama sekali (semua tombol
  dead click); `<title>Run Checklist</title>`.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/vendors` + `/vendors/[id]`; typing `Vendor`, `MsaContract`, `VendorScorecard`, `ClearedTech`. |
| **Tailwind CSS (build)** | Grid 7/5, tabel direktori, scorecard; token sistem A; hapus Space Grotesk. |
| **shadcn/ui** — `Table`, `Badge`, `Card`, `Avatar`, `Progress`, `Dialog`, `Input`, `Select`, `Tabs`, `Skeleton`, `Toast` | Direktori, badge tier/risk, progress MSA + metrik, dialog onboard/amendment/dispatch, viewer PDF. |
| **lucide-react** | Pengganti Material Symbols (handshake, badge-check, phone-call, file-text, shield-check). |
| **SWR / TanStack Query** | Fetch direktori + scorecard vendor terpilih (`keepPreviousData`); countdown renewal (`28d`). |
| **axios** | HTTP client `/api/v1`. |
| **zod + react-hook-form** | Validasi Onboard Vendor (DUNS, kontak, domain) dan Amendment (termin, nilai). |
| **PDF viewer (PDF.js)** | `View Executed PDF` MSA. |
| **date-fns** | `Exp: 31 Dec 2026 (312d left)`, `RENEWAL DUE (28d)`. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/vendors/summary` | On page load (4 KPI) | Response: `{ "data": { "activePartners": 42, "activeMsas": 38, "onboarding": 4, "expiring60d": 6, "criticalExpiring": ["VND-HVAC-0012", "VND-ELEC-0004"], "fleetSlaPct": 0.974, "commitmentYtd": 1840000, "blanketPos": 14, "dispatchedPct": 0.886 } }` |
| GET | `/api/v1/vendors` | On page load + search/filter/chip/pagination | Query: `?q=Trane&msaStatus=active&risk=all&domain=hvac&page=1`. Response: `{ "data": [{ "id": "VND-HVAC-0012", "name": "Trane Technologies", "tier": "TIER_1", "domain": "Centrifugal Chillers & R-134a Overhaul", "lead": "Robert Langdon", "phone": "+1 (555) 382-9014", "msa": { "code": "MSA-2024-TRN-09", "expiresAt": "2026-12-31", "daysLeft": 312 }, "slaPct": 0.984, "rating": 4.9, "risk": "LOW" }], "meta": { "total": 42 } }` |
| GET | `/api/v1/vendors/:id` | On seleksi baris (panel scorecard) | Response: `{ "data": { "id": "VND-HVAC-0012", "duns": "00-132-9481", "certifications": ["ISO 9001:2015", "EPA Sec 608", "OSHA VPP Star"], "hotline": "1-800-555-TRANE", "score": 98.4, "grade": "A+", "metrics": { "emergencySlaPct": 0.992, "emergencyAvgH": 1.4, "ftfrPct": 0.965, "otdPct": 0.988, "trir": 0.0, "matchPct": 0.996 } } }` |
| GET | `/api/v1/vendors/:id/msa` | On seleksi vendor (lifecycle + asuransi) | Response: `{ "data": { "code": "MSA-2024-TRN-09", "effectiveFrom": "2024-01-01", "expiresAt": "2026-12-31", "daysLeft": 288, "insurance": [{ "type": "GL", "cap": 10000000, "expiresAt": "2026-10-31" }], "documentUrl": "/vendors/VND-HVAC-0012/msa.pdf" } }` |
| GET | `/api/v1/vendors/:id/techs` | On seleksi vendor (teknisi cleared) | Response: `{ "data": [{ "name": "Marcus Kowalski", "role": "Lead Field Engineer", "clearance": "L2", "badge": "TEC-884", "rfid": "ACTIVE" }] }` |
| GET | `/api/v1/vendors/:id/dispatches` | On seleksi vendor (panel WO/PO) | Response: `{ "data": { "workOrders": [{ "id": "WO-2026-0894", "status": "DISPATCHED", "etaMin": 35 }], "purchaseOrders": [{ "id": "PO-2026-0298", "status": "GRN_RECEIVED", "valuation": 4800 }] } }` |
| POST | `/api/v1/vendors` | On submit `+ Onboard New Vendor / MSA` | Body: `{ "name": "…", "duns": "…", "domain": "hvac", "tier": "TIER_2" }`. Response: `{ "data": { "id": "VND-HVAC-0043", "status": "ONBOARDING" } }` |
| POST | `/api/v1/vendors/:id/amendments` | On submit `Initiate Amendment` | Body: `{ "msaCode": "MSA-2024-TRN-09", "changes": { "expiresAt": "2027-12-31" } }`. Response: `{ "data": { "id": "AMD-2026-0012", "status": "IN_REVIEW" } }` |
| POST | `/api/v1/work-orders` | On submit `Dispatch Work Order` (prefill vendor) | Body: `{ "vendorId": "VND-HVAC-0012", "assetId": "AST-HVAC-004", "priority": "P1" }`. Response: `{ "data": { "id": "WO-2026-0895" } }` |
| POST | `/api/v1/exports/vendors` | On click `Export Compliance` | Body: `{ "format": "PDF" }`. Response: `{ "data": { "jobId": "EXP-5514" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/vendors.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/vendors/summary
export const vendorSummary = {
  activePartners: 42, activeMsas: 38, onboarding: 4,
  expiring60d: 6, fleetSlaPct: 0.974, commitmentYtd: 1840000,
  blanketPos: 14, dispatchedPct: 0.886,
};

// TODO: Replace directory mock with GET /api/v1/vendors?q=Trane&page=1
export const vendorDirectory = [
  { id: "VND-HVAC-0012", name: "Trane Technologies", tier: "TIER_1", lead: "Robert Langdon", msa: "MSA-2024-TRN-09", expiresAt: "2026-12-31", daysLeft: 312, slaPct: 0.984, rating: 4.9, risk: "LOW" },
  { id: "VND-ELEC-0004", name: "ABB Grid Power & Automation", tier: "TIER_1", lead: "Elena Voronova", msa: "MSA-2023-ABB-02", expiresAt: "2026-03-15", slaPct: 0.968, risk: "TERM_REVIEW" },
  // TODO: picks — VND-BMS-0019, VND-FIRE-0008, VND-SUPP-0033 dari code.html
];

// TODO: Replace scorecard mock with GET /api/v1/vendors/VND-HVAC-0012 (+ /msa, /techs, /dispatches)
export const vendorScorecard = {
  id: "VND-HVAC-0012", duns: "00-132-9481", score: 98.4, grade: "A+",
  metrics: { emergencySlaPct: 0.992, emergencyAvgH: 1.4, ftfrPct: 0.965, otdPct: 0.988, trir: 0.0, matchPct: 0.996 },
  techs: [{ name: "Marcus Kowalski", badge: "TEC-884", rfid: "ACTIVE" }],
  dispatches: { workOrders: [{ id: "WO-2026-0894", status: "DISPATCHED" }], purchaseOrders: [{ id: "PO-2026-0298", status: "GRN_RECEIVED" }] },
};

// TODO: Hapus bottom-nav mobile + header mobile, ganti shell desktop + sidebar (artefak Stitch, bukan desain)
// TODO: Create detail page routing for /vendors/[id] (include MSA document viewer)
// TODO: Create detail page routing for /work-orders/[id] and /purchasing/[id] (kartu dispatch mati)
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/vendors?q=Trane&page=1', fetcher)
import { vendorDirectory } from "@/mocks/vendors.mock";

export function VendorDirectoryTable({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Table>
      <TableBody>
        {vendorDirectory.map((v) => (
          <TableRow key={v.id} onClick={() => onSelect(v.id)}>
            <TableCell className="font-bold">{v.name}</TableCell>
            <TableCell className="font-mono">{v.id}</TableCell>
            <TableCell className="font-mono">{v.msa}</TableCell>
            <TableCell className="font-mono">{(v.slaPct * 100).toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Bottom-nav mobile + header mobile adalah artefak copy-paste Stitch
   (bukan desain).** Sama seperti purchasing: `<title>Run Checklist</title>`,
   tanpa `<aside>`, bottom-nav 4 tab field menutupi konten (terlihat di
   `screen.png`). Produksi: shell desktop + sidebar 15 item.
   Konsisten dengan `navigation-audit.md` §1 no. 3 dan §5.
2. **Sisa MSA Trane beda: 312d vs 288d.** Baris direktori menulis
   `ACTIVE (312d left)` untuk `MSA-2024-TRN-09` (exp 31 Des 2026),
   sedangkan kartu lifecycle menulis `288d Left (Nominal)` untuk kontrak
   yang sama — selisih 24 hari. Tetapkan `daysLeft` dari satu API
   (`GET /api/v1/vendors/:id/msa`).
3. **Semua tombol dead click.** Tidak seperti purchasing yang punya 2 handler
   mock, file ini **tanpa script inline sama sekali** — `Dispatch Work Order`,
   `Direct Ring`, `View Executed PDF`, pagination, semuanya `href="#"`
   tanpa listener. Prioritaskan wiring saat rebuild.
4. **Konsistensi positif lintas layar (dicatat agar dipertahankan).**
   Kartu dispatch `WO-2026-0894` (ETA 35 mins, Plant Room B-204) dan
   `PO-2026-0298` (GRN RECEIVED, Bay 02, $4.800) cocok dengan facility,
   inventory, dan purchasing — pola "satu entitas, satu angka" ini yang
   harus direplikasi ke entitas lain (WO detail, MSA daysLeft, skor aset).
