# UI Audit — Vendors (pass-2, independen)

> Sumber: `stitch_facility_maintenance_platform_ui/vendors_contractors_management_hub/code.html` (728 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**
> (dengan artefak shell field, lihat Temuan).
> Dibuat: 2026-09-13 (pass-2, audit independen dari nol).
> Konteks rute global: `docs/ui-audit/navigation-audit.md` (route usulan `/vendors`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Hub **Vendors & Contractor Performance** adalah pusat tata kelola kontraktor:
registri vendor bertier, status Master Service Agreement (MSA) + kedaluwarsa,
matriks kepatuhan (ISO/EPA/OSHA, asuransi), scorecard SLA 5 metrik, teknisi
bersertifikasi keamanan lokasi, dan tautan dispatch WO/PO aktif. Fokus mockup:
`Trane Technologies` (Tier-1 Mission Critical, Grade A+).

### Daftar elemen UI utama

1. **Strip status + header** — breadcrumb `Home / Asset & Resource / Vendors
   & Contractors Hub`; `HTMX: Connected`, `16ms`, `Sync: Realtime`,
   `SLA Engine: Active`; H1 + `Tier-1 Registry`; aksi
   `Export Compliance (CSV/PDF)`, `Expiry Ledger (6 Expiring)`,
   `+ Onboard New Vendor / MSA`.
2. **KPI 4 kartu** — `Active Approved Vendors` 42 (38 Active MSAs,
   4 Onboarding, +3 Qtr); `Contract Expiry & Renewals` 6 Expiring <60d
   (2 Critical Tier-1 Trane/ABB, `Immediate Audit`); `Fleet SLA Compliance`
   97,4 % (Goal ≥95 %, +2,4 %); `YTD Contract Commitment` $1.84M
   (14 Active Blanket POs, 88,6 % Dispatched).
3. **Filter direktori** — search terisi `Trane Technologies` + `Ctrl + /`;
   select `MSA Status: All Active`, `Risk: All Levels`; chip
   (`All Vendors (42)`, HVAC & Mechanical 12, Electrical & HV 8,
   Fire & Life Safety 6, Automation & BMS 9, Civil & Roofing 7).
4. **Tabel direktori (5 kolom)** — `Vendor & Tier`, `Domain & Primary Lead`,
   `Contract & Term`, `Performance`, `Action`; 5 baris: **Trane**
   (`VND-HVAC-0012`, Robert Langdon `+1 (555) 382-9014`,
   `MSA-2024-TRN-09` Exp 31 Dec 2026 `ACTIVE (312d left)`, 98,4 % SLA 4,9★
   Low Risk, status `Active`); **ABB** (`VND-ELEC-0004`, Elena Voronova,
   `MSA-2023-ABB-02` Exp 15 Mar 2026 `RENEWAL DUE (28d)`, 96,8 %,
   Term Review); **Siemens** (`VND-BMS-0019`, Desigo CC,
   `MSA-2025-SIE-11` Exp 30 Nov 2027 ACTIVE, 99,1 %); **Johnson Controls**
   (`VND-FIRE-0008`, FM-200 VESDA, Sarah Al-Mansoor, `MSA-2024-JCI-07`
   Exp 14 Apr 2026 `60D WINDOW`, 95,2 %); **Grainger** (`VND-SUPP-0033`,
   Tier-3, `MSA-CATALOG-BLANKET` Continuous, 94,0 %); footer `1 – 5 of 42`,
   `Auto-synced with Oracle ERP`.
5. **Tautan dispatch live** — `WO-2026-0894` DISPATCHED (seal chiller #04,
   Plant Room B-204, ETA 35 mins); `PO-2026-0298` GRN RECEIVED (100 pcs
   MERV 14, Bay 02, $4.800).
6. **Drawer scorecard Trane** — avatar TRN, `OEM Certified`,
   `VND-HVAC-0012 • DUNS: 00-132-9481`; badge ISO 9001:2015, EPA Sec 608
   Universal, OSHA VPP Star; hotline `1-800-555-TRANE (Ext. 4 Ops)` +
   `Direct Ring`; MSA `MSA-2024-TRN-09 (Chilled Water Core)`
   **`288d Left (Nominal)`** + progress 01 Jan 2024 → Current (Yr 2) →
   31 Dec 2026; matriks izin (General Liability $10M Exp Oct 2026,
   Workers' Comp $2M Dec 2026, EPA 608 Aug 2026); `View Executed PDF` /
   `Initiate Amendment`; Composite `98.4 / 100` `Grade A+` Elite
   (Emergency 99,2 % avg 1,4h; FTFR 96,5 % 38/39; OTD 98,8 %;
   TRIR 0,00 / 1.420h; 3-Way 99,6 %); teknisi cleared 4
   (Marcus Kowalski, L2 Mech Clearance Badge #TEC-884, RFID Active);
   `Dispatch Work Order` / `Commendation`.

### Temuan shell & data (dicatat, bukan diperbaiki)

- `<title>Run Checklist</title>` + header mobile field + **bottom-nav field**
  (`Audits 3`, `Checklist` aktif, `Finding`, `Sync`) di hub desktop — artefak
  copy-paste Stitch; produksi dibuang, pakai sidebar desktop.
- **Sisa MSA Trane ganda**: baris tabel `312d left` vs drawer `288d Left` —
  selisih 24 hari untuk kontrak yang sama (`MSA-2024-TRN-09`).
- Telepon `+1 (555)` di operasi Nusantara/Jakarta; kontak Trane bernama
  `Robert Langdon`.

### State UI

- **Empty state:** filter vendor tanpa hasil → "Vendor tidak ditemukan" +
  `+ Onboard New Vendor / MSA` sebagai CTA; tab domain tanpa vendor → chip
  kosong.
- **Loading state:** skeleton 5 baris + scorecard; badge MSA countdown
  skeleton; tombol Direct Ring disabled saat hotline tak terjangkau.
- **Error state:** sync Oracle ERP gagal → footer `Sync Failed • Retry`;
  PDF MSA gagal → viewer error + unduh ulang; dispatch WO gagal → toast +
  status teknisi tetap.

## 2. Navigation Flow & Routing (Alur Navigasi)

Tidak ada sidebar `<aside>` (diganti artefak field). Semua `href="#"`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Breadcrumb `Home / Asset & Resource` | `/` dan grup |
| `Export Compliance (CSV/PDF)` | Unduh compliance async |
| `Expiry Ledger (6 Expiring)` | `/vendors?filter=expiring` (drawer/table terfilter) |
| `+ Onboard New Vendor / MSA` | Flow onboarding vendor/MSA — MISSING |
| Baris vendor / chevron | `/vendors/[id]` — MISSING (scorecard inline hanya untuk Trane) |
| `WO-2026-0894` (dispatch link) | `/work-orders/[id]` — MISSING |
| `PO-2026-0298` (dispatch link) | `/purchasing/[id]` — MISSING |
| `View Executed PDF` | Document viewer MSA — MISSING |
| `Initiate Amendment` | Flow amandemen kontrak — MISSING |
| `Direct Ring` | Aksi `tel:` hotline 24/7 |
| `Dispatch Work Order` | `/work-orders/new?vendor=VND-HVAC-0012` — MISSING (prefill) |
| `Commendation` | Apresiasi vendor — MISSING |
| Bottom-nav field | ARTEFAK — buang; bukan navigasi hub ini |
| Header `+ New Dispatch / Request`, notifikasi | Pola global dan `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/vendors/[id]` + document viewer (HIGH)** — scorecard Trane inline tidak
   bisa dijangkau lewat URL; `View Executed PDF` dan `Initiate Amendment`
   menggantung; 4 vendor lain tanpa detail.
   `// TODO: Create detail page routing for /vendors/[id] (scorecard, MSA viewer, amendment flow)`
2. **Flow onboarding vendor/MSA (MEDIUM)** — tombol utama tanpa target
   (formulir, verifikasi DUNS, unggah MSA, approval).
   `// TODO: Create vendor onboarding and MSA creation flow`
3. **`/work-orders/[id]` + `/purchasing/[id]` (MEDIUM)** — tautan dispatch
   `WO-2026-0894` / `PO-2026-0298` tanpa tujuan.
   `// TODO: Create detail page routing for /work-orders/[id] and /purchasing/[id]`
4. **Prefill dispatch per vendor (LOW)** — `Dispatch Work Order` butuh
   `/work-orders/new?vendor=`.
   `// TODO: Agree prefill convention /work-orders/new?vendor= for vendor dispatch`
5. **Kanonisasi sisa MSA (LOW)** — `312d` vs `288d`: satu sumber hitung
   (`GET /api/v1/vendors/:id/msa`).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, **Tailwind Play CDN**, **Inter + JetBrains Mono**, ikon
  **Material Symbols Outlined**; skor digambar sebagai **progress bar div**.
- Shell campuran: markup desktop + header mobile + bottom-nav field.
- Tanpa framework, routing, atau fetch.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/vendors` + `/vendors/[id]`; buang shell field |
| **Tailwind CSS (build)** | Ganti Play CDN; token sistem A |
| **shadcn/ui (Radix)** — `Table`, `Card`, `Badge`, `Progress`, `Avatar`, `Dialog`, `Skeleton`, `Toast` | Direktori, scorecard, dialog onboarding/amendment |
| **lucide-react** | Pengganti Material Symbols |
| **SWR / TanStack Query** | Direktori berfilter + countdown MSA + scorecard |
| **axios** | Client `/api/v1` |
| **date-fns** | Hitung sisa MSA (`312d`/`288d` → satu fungsi) |
| **PDF viewer** | `View Executed PDF` MSA |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger | Expected Payload / Response |
|---|---|---|---|---|
| GET | `/api/v1/vendors/summary` | KPI mitra, kedaluwarsa, SLA, komitmen | On page load | `{ "data": { "partners": 42, "activeMsas": 38, "onboarding": 4, "expiring60d": 6, "fleetSla": 0.974, "commitmentYtd": 1840000 } }` |
| GET | `/api/v1/vendors` | Direktori berfilter + pagination | On load, search, filter, pagination | Query `?q=Trane&msa=all&risk=all&page=1`. `{ "data": [{ "id": "VND-HVAC-0012", "name": "Trane Technologies", "tier": "TIER_1", "msa": "MSA-2024-TRN-09", "sla": 0.984 }], "meta": { "total": 42 } }` |
| GET | `/api/v1/vendors/:id` | Profil + kontak + sertifikasi | On select vendor | `{ "data": { "id": "VND-HVAC-0012", "duns": "00-132-9481", "hotline": "1-800-555-TRANE", "certs": ["ISO 9001:2015", "EPA 608", "OSHA VPP Star"] } }` |
| GET | `/api/v1/vendors/:id/msa` | Status MSA + sisa hari (sumber tunggal) | On select vendor | `{ "data": { "code": "MSA-2024-TRN-09", "from": "2024-01-01", "to": "2026-12-31", "daysLeft": 288, "permits": [{ "name": "General Liability $10M", "exp": "2026-10-31" }] } }` |
| GET | `/api/v1/vendors/:id/scorecard` | 5 metrik composite | On select vendor | `{ "data": { "composite": 98.4, "grade": "A+", "emergencySla": 0.992, "ftfr": 0.965, "otd": 0.988, "trir": 0.0, "match3way": 0.996 } }` |
| GET | `/api/v1/vendors/:id/techs` | Teknisi cleared | On select vendor | `{ "data": [{ "name": "Marcus Kowalski", "badge": "TEC-884", "rfid": "ACTIVE" }] }` |
| POST | `/api/v1/vendors` | Onboarding vendor/MSA | Submit onboarding | Body `{ "name": "…", "tier": "TIER_2", "duns": "…" }` → `{ "data": { "id": "VND-…" } }` |
| POST | `/api/v1/work-orders` | Dispatch WO ke vendor | On Dispatch Work Order | Body `{ "vendorId": "VND-HVAC-0012", "assetTag": "AST-HVAC-004" }` |

Contoh `fetch` (sumber tunggal sisa MSA):

```ts
// TODO: Replace hardcoded 312d/288d with GET /api/v1/vendors/:id/msa (single source of daysLeft)
export async function fetchMsa(vendorId: string) {
  const res = await fetch(`/api/v1/vendors/${vendorId}/msa`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`msa ${vendorId} failed: ${res.status}`);
  const { data } = await res.json();
  return data as { code: string; from: string; to: string; daysLeft: number };
}
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/vendors.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/vendors/summary
export const vendorsSummary = {
  partners: 42, activeMsas: 38, onboarding: 4, addedQtr: 3,
  expiring60d: 6, criticalTier1: ["Trane", "ABB"],
  fleetSla: 0.974, commitmentYtd: 1840000, blanketPos: 14, dispatchedPct: 0.886,
};

// TODO: Replace directory mock with GET /api/v1/vendors?q=Trane&page=1
export const vendorDirectory = [
  { id: "VND-HVAC-0012", name: "Trane Technologies", tier: "Tier-1 Mission Critical", domain: "Centrifugal Chillers & R-134a Overhaul", lead: "Robert Langdon • Sr. Tech Lead", phone: "+1 (555) 382-9014", msa: "MSA-2024-TRN-09", msaExp: "31 Dec 2026", msaState: "ACTIVE", sla: 0.984, rating: 4.9, risk: "Low Risk", action: "Active" },
  { id: "VND-ELEC-0004", name: "ABB Grid Power & Automation", tier: "Tier-1 Electrical", domain: "13.8kV Switchgear, Transformers, SCADA", lead: "Elena Voronova • SCADA Lead", phone: "+1 (555) 721-4491", msa: "MSA-2023-ABB-02", msaExp: "15 Mar 2026", msaState: "RENEWAL DUE (28d)", sla: 0.968, rating: 4.7, risk: "Term Review" },
  { id: "VND-BMS-0019", name: "Siemens Building Technologies", tier: "Tier-2 Ops", domain: "Desigo CC BMS & Cleanroom Actuators", lead: "Marcus Gallagher", phone: "+1 (555) 902-1823", msa: "MSA-2025-SIE-11", msaExp: "30 Nov 2027", msaState: "ACTIVE", sla: 0.991, rating: 4.9, risk: "Low Risk" },
  { id: "VND-FIRE-0008", name: "Johnson Controls (Tyco Fire)", tier: "Tier-1 Safety", domain: "FM-200 Clean Agent & VESDA Aspirating", lead: "Sarah Al-Mansoor", phone: "+1 (555) 634-1188", msa: "MSA-2024-JCI-07", msaExp: "14 Apr 2026", msaState: "60D WINDOW", sla: 0.952, rating: 4.6, risk: "Low Risk" },
  { id: "VND-SUPP-0033", name: "Grainger Industrial Supply", tier: "Tier-3 Supplies", domain: "MRO Hardware, Fasteners & Electrical", lead: "B2B Corporate Account Desk", phone: "support@grainger-enterprise.com", msa: "MSA-CATALOG-BLANKET", msaExp: "Continuous Renewal", msaState: "ACTIVE", sla: 0.94, rating: 4.5, risk: "Standard" },
];

// TODO: Replace scorecard mock with GET /api/v1/vendors/VND-HVAC-0012/scorecard
export const traneScorecard = {
  composite: 98.4, grade: "A+", tier: "Elite Supplier Tier",
  emergencySla: 0.992, emergencyAvgH: 1.4, ftfr: 0.965, ftfrHits: "38 of 39",
  otd: 0.988, trir: 0.0, trirHours: 1420, match3way: 0.996,
};

// TODO: Replace msa mock with GET /api/v1/vendors/VND-HVAC-0012/msa (single source of daysLeft; mock shows 312d vs 288d conflict)
export const traneMsa = {
  code: "MSA-2024-TRN-09", scope: "Chilled Water Core",
  from: "2024-01-01", to: "2026-12-31", current: "Yr 2",
  permits: [
    { name: "General Liability ($10,000,000 Cap)", exp: "Oct 2026" },
    { name: "Workers' Comp (Statutory + $2M)", exp: "Dec 2026" },
    { name: "EPA Section 608 Hazardous Refrigerant Permit", exp: "Aug 2026" },
  ],
};

// TODO: Create detail page routing for /vendors/[id] (scorecard, MSA viewer, amendment flow)
// TODO: Create vendor onboarding and MSA creation flow
export function openVendorDetail(vendorId: string) {
  window.location.assign(`/vendors/${vendorId}`);
}
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/vendors?page=1', fetcher)
import { vendorDirectory } from "@/mocks/vendors.mock";

export function VendorTable() {
  return (
    <Table>
      <TableBody>
        {vendorDirectory.map((v) => (
          <TableRow key={v.id} onClick={() => openVendorDetail(v.id)}>
            <TableCell className="font-mono font-bold">{v.id}</TableCell>
            <TableCell>{v.name}</TableCell>
            <TableCell className="font-mono">{(v.sla * 100).toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian: `daysLeft` dihitung di server dari `to − today` (satu
sumber, mengakhiri konflik 312d/288d); nomor `+1 (555)` diganti data master
rekanan saat seeding.

## 7. Perbandingan Pass-1 vs Pass-2

Dibandingkan dengan `docs/ui-audit/vendors.md` (pass-1) setelah audit
independen di atas selesai.

### (a) Temuan pass-1 yang TERKONFIRMASI

- Artefak title + shell field + bottom-nav, tanpa `<aside>`; 4 KPI
  (42/38/4, 6 expiring, 97,4 %, $1.84M); 5 baris vendor (Trane, ABB +
  Elena Voronova, Siemens, JCI, Grainger); kartu dispatch (ETA 35 mins,
  $4.800); scorecard Trane 98,4 A+ + 5 metrik + Badge #TEC-884 —
  **semua cocok**.
- Konflik MSA `312d` vs `288d` (selisih 24 hari, kontrak sama),
  **tanpa script inline sama sekali** (dead click total),
  `/vendors/[id]` + viewer + amendment MISSING — **semua dikonfirmasi**.

### (b) Temuan BARU yang luput di pass-1

1. **Blok telepon fiktif + kontak non-lokal.** Empat baris memakai
   `+1 (555)` untuk operasi Nusantara/Jakarta dan kontak Trane bernama
   `Robert Langdon` — pass-1 mencantumkan nomornya tanpa menandainya
   sebagai temuan. Ganti numbering `+1 → +62` dan tetapkan konvensi nama
   kontak saat seeding.
   `// TODO: Replace +1 (555) fixture phones with +62 master data at seeding`
2. **Penegasan implementasi `daysLeft` tunggal.** Contoh `fetchMsa` +
   aturan `daysLeft = to − today` di server sebagai penegasan teknis atas
   usulan single-API pass-1.

### (c) KOREKSI atas pass-1

Tidak ada kesalahan faktual ditemukan di pass-1 (DUNS 00-132-9481,
TRIR 0,00/1.420 jam, FTFR 38/39 — cocok). Satu perbedaan kalibrasi
eksplisit: pass-2 menilai `/vendors/[id]` **HIGH** (drawer Trane tak
terjangkau URL + PDF/amendment menggantung), sedangkan pass-1 MEDIUM —
bukan kesalahan, dicatat agar diputuskan saat prioritisasi rebuild.
