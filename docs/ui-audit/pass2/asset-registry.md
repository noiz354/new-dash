# UI Audit — Asset Registry (pass-2, independen)

> Sumber: `stitch_facility_maintenance_platform_ui/asset_registry_lifecycle_management_ledger/code.html` (859 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2, audit independen dari nol).
> Konteks rute global: `docs/ui-audit/navigation-audit.md` (route usulan `/assets`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Enterprise Asset Ledger** adalah direktori terpusat seluruh aset kapital
kampus (1.842 unit terkelola): mencari/menyaring aset lewat tabel densitas tinggi,
lalu memeriksa satu aset terpilih lewat **drawer detail kanan** (profil, skor
kesehatan, valuasi finansial, garansi/SLA, riwayat lifecycle, dokumen teknis) —
tanpa pindah halaman. Strip telemetri menegaskan konteks ledger
(`1,842 Managed Units`, `SCADA: Realtime Active`, depresiasi garis lurus
US GAAP / IFRS 16).

### Daftar elemen UI utama

1. **Breadcrumb + strip telemetri** — `Home / Asset & Resource / Asset Registry
   & Lifecycle Ledger` + badge `Asset Ledger: 1,842 Managed Units | SCADA:
   Realtime Active | Depreciation: Straight-Line (US GAAP / IFRS 16)`.
2. **Title bar + 3 aksi** — H1 `Enterprise Asset Ledger` + badge `CAMPUS-WIDE`;
   tombol `Export (CSV/XLS)`, `Batch QR Print`, `+ Register New Asset` (primary).
3. **KPI 4 kartu** — `Total Capital Assets` 1.842 Units (Book Value $24.8M,
   Depreciated $18.4M); `Fleet Health Composite` 91.4% (+1.2%, progress bar);
   `Critical Assets (Tier 1)` 142 Units (`2 WOs ACTIVE`, uptime 98.2%,
   `AST-HVAC-004 Alert`); `Warranty & Compliance` 8 Expiring <60d (3 Renewals,
   Pending Review).
4. **Filter rail** — search terisi `AST-HVAC-004` + hint `Ctrl+/`; pil lokasi
   `HQ Campus (All Buildings)`; pil status `Health: All Records`; carousel
   kategori (`All Categories (1,842)`, HVAC & Chillers 284, Electrical
   Switchgear 192, Fire & Safety 310, Pumps & Plumbing 415, Elevators 48).
5. **Tabel direktori (7 kolom)** — checkbox, `Asset Tag & Identification`,
   `Spatial Location`, `Criticality`, `Health Index`, `Telemetry Bus`, `Actions`;
   6 baris: `AST-HVAC-004` (terseleksi, `DEFECT FLAGGED`, Tier 1, 68% CRITICAL,
   Online TCP:502), `AST-PUMP-101` (96%), `AST-ELEC-012` (92%),
   `AST-GEN-001` (84% CAUTION, Idle Standby), `AST-ENV-108` (94%),
   `AST-VALV-042` (88%); footer `Showing 1 - 6 of 1,842`, Rows 25,
   `Page 1 of 308`.
6. **Snapshot spasial** — kartu `Building B (Central Utility Plant) - Sub-Level
   Asset Density`, `38 Connected Telemetry Nodes`, foto udara + overlay
   `CUP BASEMENT L2 • SECTOR WEST`, tombol `Open BIM 3D Model`.
7. **Drawer profil aset** — badge QR `#004`, `AST-HVAC-004` + `DEFECT ACTIVE`,
   foto chiller + banner `Seal Pressure Alert (WO-2026-0894)` +
   `Commissioned: Oct 2020`; skor komposit `68 / 100 [NEEDS OVERHAUL]` dengan
   4 vektor (Mechanical Wear 54%, Vibration Index 62%, Thermal Delta 89%,
   Runtime Stress 71%); kartu finansial (cost $285.000, book $114.200,
   -$28.500/yr Yr 6 of 10) dan garansi (Factory Warranty `EXPIRED 14 Oct 2023`,
   SLA `Trane Care Platinum #TC-8891-B` thru Nov 2026); 4 aksi cepat
   (`Create WO`, `Schedule PM`, `Transfer Loc`, `Decommission` merah).
8. **Timeline Lifecycle & Audit Trail** — 5 event: WO-2026-0894 hari ini
   (ultrasonic probe 18.4 ppm, Marcus Kowalski), overhaul 12 JAN 2026
   (`PART-LUB-09`), strainer 04 NOV 2025 ($480, 2.5 jam), relokasi
   18 AUG 2024, commissioning 14 OCT 2020.
9. **Dokumen teknis** — 4 file 30.7 MB (manual Trane CVHE 18.4 MB Rev 4.2,
   sertifikat komisioning 2.8 MB, P&ID RevC 8.1 MB, SOP LOTO OSHA 1.4 MB),
   tiap baris ada Preview + Download, plus tombol
   `+ Upload Drawing, Schematic or PDF Manual`.

### State UI

- **Empty state:** hasil filter tanpa aset → pesan "Tidak ada aset cocok filter"
  + `Reset Filter`; drawer tanpa seleksi → placeholder "Pilih baris aset";
  timeline aset baru → "Belum ada event — commissioning tercatat di sini".
- **Loading state:** skeleton 6 baris tabel + kartu KPI; drawer memakai shimmer
  blok skor/finansial; tombol Export/Register spinner inline.
- **Error state:** telemetri SCADA gagal → badge `SCADA: Degraded`; export gagal
  → toast + unduh dibatalkan; upload dokumen > batas → error inline per baris.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar `<aside>`, 15 `data-path`, item `asset-registry`
aktif via skrip sync). Semua `href="#"` — target di bawah adalah route usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Asset Registry (aktif) | `/assets` (halaman ini) |
| Sidebar: 14 item lain | Route §2 `navigation-audit.md` (`/operations`, `/work-orders`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, …) |
| Breadcrumb `Home / Asset & Resource` | `/` dan grup (bukan route entitas) |
| `Export (CSV/XLS)` | Aksi unduh async, tetap di halaman |
| `Batch QR Print` | Dialog cetak massal (print view) |
| `+ Register New Asset` | Modal `POST /api/v1/assets`, tetap di halaman |
| Baris tabel / chevron `>` | `/assets/[tag]` (halaman detail — mockupnya ADA, lihat seksi 3) |
| `Open BIM 3D Model` | BIM viewer — MISSING |
| `Create WO` (drawer) | `/work-orders/new?asset=AST-HVAC-004` (prefill) — MISSING |
| `Schedule PM` (drawer) | `/preventive-maintenance/new?asset=…` (prefill) — MISSING |
| `Transfer Loc` (drawer) | Flow transfer lokasi — MISSING |
| `Decommission` (drawer) | Flow dekomisioning + konfirmasi — MISSING |
| Ikon print QR / `more_vert` (drawer) | Print tag satuan / menu konteks, tetap di halaman |
| Preview / Download dokumen | File viewer + unduh berkas |
| `+ Upload Drawing…` | Uploader dokumen, tetap di halaman |
| Header `+ New Dispatch / Request`, ikon notifikasi | Pola global (command palette / modal) dan `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **BIM 3D viewer (MEDIUM)** — `Open BIM 3D Model` tidak punya tujuan; putuskan
   tab `/assets/[tag]/bim` vs viewer global.
   `// TODO: Define BIM viewer route for Open BIM 3D Model`
2. **Prefill `Create WO` / `Schedule PM` (MEDIUM)** — butuh konvensi query
   (`?asset=`), bukan halaman baru, tetapi belum disepakati di mockup mana pun.
   `// TODO: Agree prefill convention /work-orders/new?asset= and /preventive-maintenance/new?asset=`
3. **Flow `Transfer Loc` & `Decommission` (MEDIUM)** — tidak ada modal, halaman,
   atau konfirmasi; `Decommission` tampil sekali klik berwarna destruktif.
   `// TODO: Create transfer and decommission flows with confirmation`
4. **Modal `+ Register New Asset` (MEDIUM)** — field, validasi, dan target POST
   tak terdefinisi.
   `// TODO: Create register-asset modal spec (fields + POST /api/v1/assets)`
5. **Target global `+ New Dispatch / Request` (MEDIUM)** — perilaku seragam di
   16 halaman bersidebar belum diputuskan (lihat `navigation-audit.md` §4.7).
6. **Print views (LOW)** — `Batch QR Print` / print tag satuan butuh layout cetak.

Catatan positif: tidak seperti WO/PO/vendor, baris tabel halaman ini PUNYA
halaman tujuan yang termockup (`asset_detail_*` → `/assets/[tag]`).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, **Tailwind Play CDN** + `tailwind.config` inline
  (token warna enterprise custom, bukan palet default).
- Font **Inter** + **JetBrains Mono**, ikon **Material Symbols Outlined**.
- Gambar/foto via URL `googleusercontent` (placeholder), peta memakai foto udara.
- Satu skrip inline: penanda aktif sidebar (`data-path="asset-registry"`).
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/assets`; typing `Asset`, `HealthVector`, `LifecycleEvent`, `AssetDocument` |
| **Tailwind CSS (build)** | Ganti Play CDN; token dari `DESIGN.md` sistem A |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Table`, `Progress`, `Avatar`, `Skeleton`, `ScrollArea`, `Toast`, `Dialog`, `Tabs` | KPI, filter rail, tabel dense, drawer, timeline, dialog register/print |
| **lucide-react** | Pengganti Material Symbols |
| **SWR / TanStack Query** | Daftar aset berfilter + refresh drawer; `staleTime` untuk strip SCADA |
| **axios** (atau `fetch` + `ky`) | HTTP client `/api/v1` + interceptor auth |
| **react-hook-form + zod** | Form register aset, transfer, decommission |
| **qrcode.react** | Render QR tag `#004` + batch print |
| **PDF viewer (pdfjs / iframe)** | Preview manual/SOP; upload via `input[type=file]` + presigned URL |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Response dibungkus `{ data, meta }`; error `{ error: { code, message } }`.

| Method | Endpoint | Deskripsi | Trigger | Expected Payload / Response |
|---|---|---|---|---|
| GET | `/api/v1/assets/summary` | KPI ledger (total, health, kritis, garansi) | On page load | `{ "data": { "totalUnits": 1842, "bookValue": 24800000, "depreciatedValue": 18400000, "fleetHealth": 0.914, "criticalTier1": 142, "activeWos": 2, "warrantyExpiring60d": 8 } }` |
| GET | `/api/v1/assets` | Direktori berfilter + pagination | On load, search, filter, pagination | Query `?q=AST-HVAC-004&location=all&health=all&category=hvac&page=1&perPage=25`. `{ "data": [{ "tag": "AST-HVAC-004", "name": "Centrifugal Water Chiller 450-TR", "oem": "Trane EarthWise CVHE", "serial": "TRA-99201-B", "location": "B-204", "criticality": "TIER_1", "healthPct": 68, "telemetry": "ONLINE" }], "meta": { "total": 1842 } }` |
| GET | `/api/v1/assets/:tag` | Profil + kesehatan + finansial + garansi (drawer) | On select baris | `{ "data": { "tag": "AST-HVAC-004", "healthPct": 68, "vectors": { "wear": 54, "vibration": 62, "thermal": 89, "stress": 71 }, "purchaseCost": 285000, "bookValue": 114200 } }` |
| GET | `/api/v1/assets/:tag/timeline` | Lifecycle & audit trail | On select baris | `{ "data": [{ "type": "DEFECT", "ref": "WO-2026-0894", "at": "2026-…", "note": "Seal leak 18.4 ppm" }] }` |
| GET | `/api/v1/assets/:tag/documents` | Dokumen teknis | On select baris | `{ "data": [{ "name": "OEM_Installation_…_Rev4.2.pdf", "sizeMb": 18.4 }] }` |
| POST | `/api/v1/assets` | Registrasi aset baru | Submit modal Register | Body `{ "name": "…", "oem": "…", "serial": "…", "locationId": "LOC-B2-MECH-204", "criticality": "TIER_1" }` → `{ "data": { "tag": "AST-HVAC-099" } }` |
| POST | `/api/v1/assets/:tag/documents` | Upload dokumen | On upload PDF/gambar | Multipart → `{ "data": { "docId": "DOC-9910" } }` |
| GET | `/api/v1/assets/export` | Export CSV/XLS massal | On click Export | Query filter aktif → file async `{ "data": { "jobId": "EXP-2210" } }` |
| POST | `/api/v1/work-orders` | Create WO dari drawer (prefill asset) | On click Create WO | Body `{ "assetTag": "AST-HVAC-004", … }` → `{ "data": { "id": "WO-2026-0905" } }` |
| POST | `/api/v1/assets/:tag/transfer` | Transfer lokasi | On submit Transfer Loc | Body `{ "toLocationId": "LOC-B2-MECH-208" }` |
| POST | `/api/v1/assets/:tag/decommission` | Dekomisioning (konfirmasi wajib) | On submit Decommission | Body `{ "reason": "…", "confirm": true }` |

Contoh `fetch` (ganti mock → API):

```ts
// TODO: Replace mock fetch below with live GET /api/v1/assets (see §6)
const params = new URLSearchParams({ q: "AST-HVAC-004", location: "all", health: "all", page: "1", perPage: "25" });
const res = await fetch(`/api/v1/assets?${params}`, { headers: { Authorization: `Bearer ${token}` } });
if (!res.ok) throw new Error(`assets list failed: ${res.status}`);
const { data, meta } = await res.json(); // data: AssetRow[], meta: { total: 1842 }
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/asset-registry.mock.ts`.

```ts
// TODO: Replace assetsSummary mock with GET /api/v1/assets/summary
export const assetsSummary = {
  totalUnits: 1842, bookValue: 24800000, depreciatedValue: 18400000,
  fleetHealth: 0.914, criticalTier1: 142, activeWos: 2,
  warrantyExpiring60d: 8, renewals: 3,
};

// TODO: Replace directory mock with GET /api/v1/assets?q=&page=1&perPage=25
export const assetDirectory = [
  { tag: "AST-HVAC-004", name: "Centrifugal Water Chiller 450-TR", oem: "Trane EarthWise CVHE", serial: "TRA-99201-B", location: "Building B (CUP) • Basement L2 • Rm #B-204", criticality: "TIER_1", healthPct: 68, state: "DEFECT FLAGGED", telemetry: "ONLINE" },
  { tag: "AST-PUMP-101", name: "Primary Condenser Pump #1", oem: "Grundfos NK 125-250", location: "Building B (CUP) • Rm #B-201", criticality: "TIER_2", healthPct: 96, state: "OPERATIONAL", telemetry: "ONLINE" },
  { tag: "AST-ELEC-012", name: "Main 13.8kV Medium Voltage Switchgear", oem: "Schneider MasterPact MTZ2", location: "Substation East • Vault Rm #E-101", criticality: "TIER_1", healthPct: 92, state: "OPERATIONAL", telemetry: "ONLINE" },
  { tag: "AST-GEN-001", name: "Emergency Diesel Generator 2000kVA", oem: "Caterpillar 3516B-HD", location: "North Utility Yard • Gen Enclosure #G-1", criticality: "TIER_1", healthPct: 84, state: "STANDBY", telemetry: "IDLE" },
  { tag: "AST-ENV-108", name: "Data Center Precision CRAH Unit #4", oem: "Vertiv Liebert DSE", location: "Building C (Server Wing) • #C-302", criticality: "TIER_1", healthPct: 94, state: "OPERATIONAL", telemetry: "ONLINE" },
  { tag: "AST-VALV-042", name: "Motorized Primary Chilled Water Bypass Valve", oem: "Belimo EV-080+BACnet", location: "Building B (CUP) • Header Trench Line A", criticality: "TIER_3", healthPct: 88, state: "OPERATIONAL", telemetry: "ONLINE" },
];

// TODO: Replace drawer mock with GET /api/v1/assets/AST-HVAC-004
export const assetDrawer = {
  tag: "AST-HVAC-004", healthPct: 68, verdict: "NEEDS OVERHAUL",
  vectors: { wear: 54, vibration: 62, thermal: 89, stress: 71 },
  purchaseCost: 285000, bookValue: 114200, depreciationPerYear: 28500, year: 6, lifeYears: 10,
  warranty: "EXPIRED (14 Oct 2023)", sla: "Trane Care Platinum #TC-8891-B (thru Nov 2026)",
};

// TODO: Replace timeline mock with GET /api/v1/assets/AST-HVAC-004/timeline
export const assetTimeline = [
  { at: "TODAY 14:18 UTC", type: "DEFECT FLAGGED", ref: "WO-2026-0894", note: "Shaft seal refrigerant leak 18.4 ppm, auto-assigned Marcus Kowalski" },
  { at: "12 JAN 2026", type: "PM EXECUTION", note: "Quarterly overhaul, PART-LUB-09" },
];

// TODO: Create detail page routing for /assets/[tag] (prefetch drawer data here)
export function openAssetDetail(tag: string) {
  window.location.assign(`/assets/${tag}`);
}
```

Contoh binding (ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/assets?page=1', fetcher)
import { assetDirectory } from "@/mocks/asset-registry.mock";

export function AssetTable() {
  return (
    <Table>
      <TableBody>
        {assetDirectory.map((a) => (
          <TableRow key={a.tag} onClick={() => openAssetDetail(a.tag)}>
            <TableCell className="font-mono font-bold">{a.tag}</TableCell>
            <TableCell>{a.name}</TableCell>
            <TableCell><Badge>{a.criticality}</Badge></TableCell>
            <TableCell className="font-mono">{a.healthPct}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian: satu blok mock gugur per endpoint live (`useSWR` +
`Skeleton` saat loading + `Toast` saat error), struktur field dipertahankan.

## 7. Perbandingan Pass-1 vs Pass-2

Dibandingkan dengan `docs/ui-audit/asset-registry.md` (pass-1) setelah audit
independen di atas selesai.

### (a) Temuan pass-1 yang TERKONFIRMASI

- Inventaris UI (12 elemen), angka KPI (1.842 unit, $24.8M/$18.4M, 91,4 %,
  142 Tier-1, 8 garansi), kategori (284/192/310/415/48), 6 baris tabel
  beserta OEM/serial/lokasi, drawer 68/100 + 4 vektor, finansial
  ($285.000/$114.200/6-dari-10), garansi EXPIRED + Trane Care Platinum,
  5 event timeline, 4 dokumen/30,7 MB — **semua cocok**.
- Routing: `/assets/[id]` EXISTS; prefill WO/PM, BIM viewer, transfer,
  decommission, register modal MISSING — **semua dikonfirmasi**.
- Inkonsistensi: OEM ganda Trane vs Daikin, 3 versi skor (68/88/88,4),
  pagination `Page 1 of 308`, foto udara Chicago, WO campur tahun —
  **semua dikonfirmasi independen**.

### (b) Temuan BARU yang luput di pass-1

1. **Search hardcode via atribut `value`.** Input terisi `AST-HVAC-004`
   lewat `value="…"` statis tanpa handler — saat porting React berisiko
   jadi input terkunci (uncontrolled/controlled warning). Pass-1 hanya
   mencatat "terisi".
   `// TODO: Convert hardcoded search value to controlled state (?q=)`
2. **Klasifikasi Export/Batch-QR sebagai aksi inline.** `Export (CSV/XLS)`
   (async job) dan `Batch QR Print` (dialog cetak) adalah aksi, bukan
   halaman hilang — mempertajam §2 pass-1 yang melabelinya MISSING.

### (c) KOREKSI atas pass-1

Tidak ada kesalahan faktual ditemukan di pass-1 (seluruh angka, ID, dan
kutipan UI terverifikasi cocok dengan `code.html`). Satu-satunya kalibrasi:
label "MISSING (parsial)" untuk Export/Batch-QR direvisi menjadi aksi
inline + print view (LOW), per (b).2 di atas.
