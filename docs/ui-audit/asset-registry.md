# UI Audit — Asset Registry & Lifecycle Ledger (`asset_registry_lifecycle_management_ledger`)

> Sumber: `stitch_facility_maintenance_platform_ui/asset_registry_lifecycle_management_ledger/code.html` (859 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Enterprise Asset Ledger** adalah direktori pusat seluruh aset kapital
kampus: mencari/memfilter **1.842 unit** lewat query engine, melihat kesehatan
fleet dan valuasi buku, memilih satu aset untuk diperiksa di drawer kanan
(profil, health radar, finansial, garansi, timeline lifecycle, dokumen teknis),
lalu mengeksekusi aksi cepat (`Create WO`, `Schedule PM`, `Transfer Loc`,
`Decommission`). Aset yang sedang terpilih: `AST-HVAC-004`
(Centrifugal Water Chiller 450-TR, status `DEFECT FLAGGED`).

### Daftar elemen UI utama

1. **Breadcrumb + telemetry strip** — `Home / Asset & Resource / Asset Registry
   & Lifecycle Ledger` + strip mono `Asset Ledger: 1,842 Managed Units |
   SCADA: Realtime Active | Depreciation: Straight-Line (US GAAP / IFRS 16)`.
2. **Title bar + action cluster** — H1 `Enterprise Asset Ledger`, badge
   `CAMPUS-WIDE`, tombol `Export (CSV/XLS)` (secondary), `Batch QR Print`
   (secondary), `+ Register New Asset` (primary).
3. **KPI grid 4 kartu** — `Total Capital Assets` (1.842 Units, Book Value
   `$24.8M`, Depreciated `$18.4M`), `Fleet Health Composite` (91,4% + bar),
   `Critical Assets Tier 1` (142 Units, `2 WOs ACTIVE`, uptime 98,2%,
   peringatan `AST-HVAC-004 Alert`), `Warranty & Compliance`
   (8 Expiring <60d, `3 Renewals`, Pending Review).
4. **Filter rail + category tabs** — search (`AST-HVAC-004` terisi, hint
   `Ctrl + /`), pill lokasi `HQ Campus (All Buildings)`, filter
   `Health: All Records`, tab kategori (`All Categories (1,842)`,
   `HVAC & Chillers (284)`, `Electrical Switchgear (192)`,
   `Fire & Safety (310)`, `Pumps & Plumbing (415)`, `Elevators (48)`).
5. **Tabel direktori high-density (7 kolom)** —
   `Asset Tag & Identification`, `Spatial Location`, `Criticality`,
   `Health Index`, `Telemetry Bus`, `Actions` + checkbox seleksi massal.
   6 baris contoh: `AST-HVAC-004` (baris terseleksi, `DEFECT FLAGGED`,
   Tier 1, 68% CRITICAL, Online `TCP:502`), `AST-PUMP-101`,
   `AST-ELEC-012`, `AST-GEN-001` (STANDBY, 84% CAUTION, Idle Standby),
   `AST-ENV-108`, `AST-VALV-042`. Footer pagination
   (`Showing 1 - 6 of 1,842`, Rows 25, `Page 1 of 308`).
6. **Spatial snapshot card** — peta `Building B (Central Utility Plant) —
   Sub-Level Asset Density` (38 Connected Telemetry Nodes,
   `CUP BASEMENT L2 • SECTOR WEST`) + tombol `Open BIM 3D Model`.
7. **Drawer profil aset (kanan)** — badge QR `#004`, `AST-HVAC-004` +
   `DEFECT ACTIVE`, nama, OEM, `ID: TRN-2020-0442`, tombol print/more,
   foto operasional + overlay `Seal Pressure Alert (WO-2026-0894)` +
   `Commissioned: Oct 2020`.
8. **Health radar breakdown** — `Composite Health Score 68 / 100
   [NEEDS OVERHAUL]` (Target ≥92%): Mechanical Wear 54%, Vibration Index 62%,
   Thermal Delta 89%, Runtime Stress 71%.
9. **Kartu finansial + garansi** — Original Purchase Cost `$285,000.00`,
   Current Book Value `$114,200.00` (`-$28,500/yr`, Yr 6 of 10);
   Factory Warranty `EXPIRED (14 Oct 2023)`; SLA aktif
   `Trane Care Platinum #TC-8891-B` valid thru Nov 2026.
10. **Rapid command actions** — `Create WO` (primary), `Schedule PM`,
    `Transfer Loc`, `Decommission` (destruktif).
11. **Timeline Lifecycle & Audit Trail** — 5 event: `WO-2026-0894` defect hari
    ini (kebocoran seal, auto-assign Marcus Kowalski), PM overhaul 12 Jan 2026
    (`PART-LUB-09`), penggantian strainer 04 Nov 2025 ($480, 2,5 jam),
    relokasi 18 Agu 2024, commissioning 14 Okt 2020.
12. **Technical Docs & Schematics** — 4 file (30,7 MB: manual OEM Trane CVHE
    18,4 MB, sertifikat komisioning 2,8 MB, diagram P&ID 8,1 MB, SOP LOTO OSHA
    1,4 MB) + tombol upload drag-and-drop.

### State UI

- **Empty state:** hasil filter tanpa aset → pesan "Tidak ada aset cocok dengan
  filter" + tombol `Reset Filter`; drawer tanpa seleksi → placeholder
  "Pilih aset dari direktori"; timeline/dokumen kosong → list kosong berlabel.
- **Loading state:** skeleton baris tabel (tag mono, badge, health bar);
  skeleton kartu KPI + drawer; peta spatial memakai shimmer; tombol aksi
  menampilkan spinner inline.
- **Error state:** strip SCADA berubah merah (`Telemetry Degraded`); baris
  dengan telemetri basi menandai `STALE`; ekspor/QR gagal → toast destruktif;
  upload dokumen gagal → pesan inline + retry.

## 2. Navigation Flow & Routing (Alur Navigasi)

Halaman memakai shell desktop global (sidebar 15 `data-path`, header dengan
`+ New Dispatch / Request` + ikon notifikasi). Semua `href="#"` — target di
bawah adalah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar 15 item | Route §2 `navigation-audit.md` (`/operations`, `/work-orders`, …) — item `asset-registry` aktif = halaman ini (`/assets`) |
| Breadcrumb `Home / Asset & Resource / …` | `Home` → `/` (atau `/operations`); `Asset & Resource` → grup, bukan route |
| Baris tabel / tombol `chevron_right` / seleksi drawer | `/assets/[id]` (contoh `AST-HVAC-004`) — EXISTS (mockup `asset_detail_*`) |
| `Create WO` (rapid command) | `/work-orders/new?asset=AST-HVAC-004` (prefill flow) — MISSING |
| `Schedule PM` | `/preventive-maintenance/new?asset=AST-HVAC-004` — MISSING |
| `Transfer Loc` | Flow transfer lokasi (modal + `POST /api/v1/assets/:id/transfer`) — MISSING |
| `Decommission` | Flow dekomisioning dengan konfirmasi + alasan — MISSING |
| `Open BIM 3D Model` | BIM viewer (tab `/assets/[id]` vs route `/assets/[id]/bim`, belum diputuskan) — MISSING |
| `+ Register New Asset` | Modal registrasi (`POST /api/v1/assets`) — MISSING |
| `Export (CSV/XLS)` | Async job export → unduh berkas — MISSING (parsial, ikut pola `/reports`) |
| `Batch QR Print` | Print view QR massal — MISSING |
| Print QR tag / `more_vert` (drawer) | Menu konteks aset — MISSING |
| Preview / Download dokumen (8 tombol) | Document viewer + unduhan berkas — MISSING |
| `+ Upload Drawing, Schematic or PDF Manual` | Upload dokumen (`POST /api/v1/assets/:id/documents`) — MISSING |
| Filter rail, tab kategori, pagination, Rows | Query params (`?q=&locationId=&health=&category=&page=&perPage=`), bukan navigasi |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Prefill flow `Create WO` / `Schedule PM` (MEDIUM)** — dua tombol rapid
   command utama tidak punya tujuan; butuh konvensi query `?asset=` dan
   halaman `/work-orders/new`, `/preventive-maintenance/new` (lihat
   `navigation-audit.md` §4 no. 8).
   `// TODO: Create prefill flow for /work-orders/new?asset= and /preventive-maintenance/new?asset=`
2. **BIM 3D viewer (MEDIUM)** — `Open BIM 3D Model` menggantung; putuskan tab
   vs route sebelum menghubungkan tombol ini (lihat §4 no. 9).
   `// TODO: Decide BIM viewer placement (/assets/[id] tab vs /assets/[id]/bim)`
3. **Flow `Transfer Loc` & `Decommission` (MEDIUM)** — mutasi lokasi dan
   penonaktifan aset butuh modal konfirmasi + audit trail; belum terdefinisi.
4. **Document viewer + upload (LOW)** — 4 dokumen + tombol upload tanpa tujuan;
   butuh viewer PDF/CAD dan endpoint upload.
5. **Print views (LOW)** — `Batch QR Print` dan print tag fisik (ikut daftar
   print `navigation-audit.md` §4 no. 12).
6. **Target global `+ New Dispatch / Request` (MEDIUM)** — perilaku tombol
   header lintas 16 halaman tak seragam; putuskan pola global.

> Konsisten dengan `navigation-audit.md`: sidebar/route §2 no. 6–7, prefill
> flow §4 no. 8, BIM §4 no. 9.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + `tailwind.config` inline
  (token warna custom `surface-*`, `primary-container`, dsb).
- Font Google: **Inter** (body), **JetBrains Mono** (tag/ID/telemetri),
  ikon **Material Symbols Outlined**.
- Active-nav sync via script inline (`data-path="asset-registry"`).
- Tanpa framework, routing, atau data fetching.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/assets` (daftar + drawer) dan `/assets/[id]`; typing `Asset`, `AssetTimeline`, `AssetDocument`. |
| **Tailwind CSS (build, bukan CDN)** | Layout split-pane 7/5, tabel dense, drawer; token dari `DESIGN.md` sistem A. |
| **shadcn/ui (Radix)** — `Table`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Pagination`, `Progress`, `Card`, `Dialog`, `DropdownMenu`, `Skeleton`, `Toast`, `ScrollArea` | Tabel direktori, badge kritikalitas/health, filter rail, tab kategori, pagination, health bar, drawer profil, modal register/transfer/decommission, toast aksi. |
| **lucide-react** | Pengganti Material Symbols (domain, search, map, qr-code, history, folder, download, upload, print). |
| **SWR atau TanStack Query** | Fetch daftar + drawer dengan `keepPreviousData` saat ganti seleksi/filter; poll ringan strip SCADA. |
| **axios** (atau `fetch` + `ky`) | HTTP client, base URL `/api/v1`, interceptor auth. |
| **zod + react-hook-form** | Validasi form Register / Transfer / Decommission. |
| **File viewer (PDF.js / CAD viewer)** | Preview manual OEM, sertifikat, P&ID, SOP LOTO. |
| **date-fns + Intl.NumberFormat** | Timestamp timeline (`TODAY 14:18 UTC`), format `$285,000.00`. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

Hasil reverse-engineering dari elemen UI. Response dibungkus
`{ data, meta }`, error memakai `{ error: { code, message } }`.

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/assets` | On page load + search/filter/tab kategori/pagination berubah | Query: `?q=AST-HVAC-004&locationId=hq-campus&health=all&category=hvac&page=1&perPage=25`. Response: `{ "data": [{ "id": "AST-HVAC-004", "name": "Centrifugal Water Chiller 450-TR", "oem": "Trane EarthWise CVHE", "serialNo": "TRA-99201-B", "location": "Building B (CUP) • Basement L2 • Rm #B-204", "criticality": "TIER_1", "healthPct": 68, "healthState": "CRITICAL", "telemetry": { "state": "ONLINE", "bus": "TCP:502" } }], "meta": { "total": 1842, "page": 1 } }` |
| GET | `/api/v1/assets/summary` | On page load (4 kartu KPI) | Response: `{ "data": { "totalUnits": 1842, "bookValue": 24800000, "depreciatedValue": 18400000, "fleetHealthPct": 0.914, "tier1Count": 142, "tier1ActiveWos": 2, "tier1UptimePct": 0.982, "warrantyExpiring60d": 8, "renewalsPending": 3 } }` |
| GET | `/api/v1/assets/categories` | On page load (tab kategori + counts) | Response: `{ "data": [{ "id": "hvac", "name": "HVAC & Chillers", "count": 284 }] }` |
| GET | `/api/v1/assets/:id` | On seleksi baris/drawer | Response: `{ "data": { "id": "AST-HVAC-004", "qrNo": "QR #004", "oem": "Trane EarthWise CVHE", "specId": "TRN-2020-0442", "health": { "score": 68, "grade": "NEEDS_OVERHAUL", "vectors": { "mechanicalWear": 54, "vibration": 62, "thermalDelta": 89, "runtimeStress": 71 } }, "financial": { "purchaseCost": 285000, "bookValue": 114200, "depreciationPerYear": 28500, "year": 6, "lifeYears": 10 }, "warranty": { "factory": "EXPIRED", "factoryExpiredAt": "2023-10-14", "sla": "Trane Care Platinum #TC-8891-B", "slaValidThru": "2026-11-30" } } }` |
| GET | `/api/v1/assets/:id/timeline` | On seleksi drawer (tab Lifecycle) | Query: `?limit=20`. Response: `{ "data": [{ "type": "DEFECT", "at": "2026-09-13T14:18:00Z", "title": "Work Order Created (WO-2026-0894)", "body": "Primary shaft seal refrigerant leak …" }] }` |
| GET | `/api/v1/assets/:id/documents` | On seleksi drawer (tab Docs) | Response: `{ "data": [{ "name": "OEM_Installation_Operation_Manual_Trane_CVHE.pdf", "sizeMb": 18.4, "rev": "4.2" }] }` |
| POST | `/api/v1/assets` | On submit `+ Register New Asset` | Body: `{ "name": "...", "category": "hvac", "oem": "...", "serialNo": "...", "locationId": "loc-b2-mech-204", "criticality": "TIER_1" }`. Response: `{ "data": { "id": "AST-HVAC-843" } }` |
| POST | `/api/v1/assets/:id/transfer` | On submit `Transfer Loc` | Body: `{ "destinationLocationId": "loc-b2-208", "reason": "..." }`. Response: `{ "data": { "id": "AST-HVAC-004", "location": "Room #B-208" } }` |
| POST | `/api/v1/assets/:id/decommission` | On submit `Decommission` | Body: `{ "reason": "...", "confirmation": "DECOMMISSION" }`. Response: `{ "data": { "id": "AST-HVAC-004", "status": "DECOMMISSIONED" } }` |
| POST | `/api/v1/work-orders` | On submit `Create WO` (prefill `?asset=`) | Body: `{ "assetId": "AST-HVAC-004", "priority": "P1", "summary": "…" }`. Response: `{ "data": { "id": "WO-2026-0895", "status": "QUEUED" } }` |
| POST | `/api/v1/pm-schedules` | On submit `Schedule PM` | Body: `{ "assetId": "AST-HVAC-004", "planDate": "2026-10-01", "templateId": "TMPL-HVAC-CHL-02" }`. Response: `{ "data": { "id": "PM-2026-0144" } }` |
| POST | `/api/v1/exports/assets` | On click `Export (CSV/XLS)` | Body: `{ "format": "CSV", "filters": { "q": "AST-HVAC-004" } }`. Response: `{ "data": { "jobId": "EXP-5510", "downloadUrl": "/exports/EXP-5510.csv" } }` |
| GET | `/api/v1/facilities` | On page load (opsi pill lokasi) | Response: `{ "data": [{ "id": "hq-campus", "name": "HQ Campus (All Buildings)" }] }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/asset-registry.mock.ts` selama backend belum siap.

```ts
// TODO: Replace assets mock with GET /api/v1/assets?q=&locationId=&health=&category=&page=1&perPage=25
export const assets = [
  {
    id: "AST-HVAC-004", name: "Centrifugal Water Chiller 450-TR",
    oem: "Trane EarthWise CVHE", serialNo: "TRA-99201-B",
    location: "Building B (CUP) • Basement L2 • Rm #B-204",
    criticality: "TIER_1", healthPct: 68, healthState: "CRITICAL",
    telemetry: { state: "ONLINE", bus: "TCP:502" }, defectFlag: true,
  },
  {
    id: "AST-PUMP-101", name: "Primary Condenser Pump #1",
    oem: "Grundfos NK 125-250", serialNo: "GRU-8812",
    location: "Building B (CUP) • Basement L2 • Rm #B-201",
    criticality: "TIER_2", healthPct: 96, healthState: "HEALTHY",
    telemetry: { state: "ONLINE" },
  },
  // TODO: picks — tambah AST-ELEC-012, AST-GEN-001, AST-ENV-108, AST-VALV-042 dari code.html
];

// TODO: Replace summary mock with GET /api/v1/assets/summary
export const assetSummary = {
  totalUnits: 1842, bookValue: 24800000, depreciatedValue: 18400000,
  fleetHealthPct: 0.914, tier1Count: 142, tier1ActiveWos: 2,
  warrantyExpiring60d: 8, renewalsPending: 3,
};

// TODO: Replace drawer mock with GET /api/v1/assets/AST-HVAC-004
export const assetDrawer = {
  id: "AST-HVAC-004", qrNo: "QR #004", specId: "TRN-2020-0442",
  health: {
    score: 68, grade: "NEEDS_OVERHAUL",
    vectors: { mechanicalWear: 54, vibration: 62, thermalDelta: 89, runtimeStress: 71 },
  },
  financial: { purchaseCost: 285000, bookValue: 114200, depreciationPerYear: 28500 },
  warranty: { factory: "EXPIRED", factoryExpiredAt: "2023-10-14", sla: "Trane Care Platinum #TC-8891-B" },
};

// TODO: Replace timeline mock with GET /api/v1/assets/AST-HVAC-004/timeline
export const assetTimeline = [
  { type: "DEFECT", at: "TODAY 14:18 UTC", title: "Work Order Created (WO-2026-0894)" },
  { type: "PM", at: "12 JAN 2026", title: "Quarterly Chiller Overhaul Completed" },
];

// TODO: Create prefill flow for /work-orders/new?asset= and /preventive-maintenance/new?asset=
// TODO: Decide BIM viewer placement (/assets/[id] tab vs /assets/[id]/bim)
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/assets?q=...&page=1', fetcher)
import { assets } from "@/mocks/asset-registry.mock";

export function AssetDirectoryTable({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <Table>
      <TableBody>
        {assets.map((a) => (
          <TableRow key={a.id} onClick={() => onSelect(a.id)}>
            <TableCell className="font-mono font-bold">{a.id}</TableCell>
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

## Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **OEM `AST-HVAC-004` ganda.** Layar ini: `Trane EarthWise CVHE`
   (`S/N: TRA-99201-B`, `ID: TRN-2020-0442`, komisioning Okt 2020, garansi
   pabrik `EXPIRED 14 Oct 2023` + SLA `Trane Care Platinum #TC-8891-B`);
   `asset_detail_*`: `Daikin Applied Magnitude®` (`WAR-99214-DK` aktif s.d.
   Nov 2026, komisioning 14 Okt 2019). Produksi: tetapkan satu OEM per
   `assetId` saat seeding.
2. **Skor kesehatan tiga versi.** Registry drawer: `68/100 NEEDS OVERHAUL`;
   `asset_detail_*`: `88% OPTIMAL`; `facility_*`: `88.4%` pada tabel
   Installed Assets. Butuh satu sumber (`GET /api/v1/assets/:id`
   → `health.score`).
3. **Pagination tidak konsisten.** Footer menulis `Showing 1 - 6` dengan
   selector `Rows: 25` tetapi `Page 1 of 308` (= 1.842 ÷ 6) — angka halaman
   dihitung dari 6 baris visible, bukan `perPage` 25.
4. **Gambar peta placeholder salah lokasi.** Kartu spatial memakai foto udara
   berlabel Chicago (`data-alt="…Chicago, Illinois"`, overlay tulisan
   "Chicago") untuk kampus Nusantara — ganti dengan denah/BIM asli saat
   rebuild.
5. **Penomoran WO campur tahun** (`WO-2026-0894` di sini vs `WO-2025-0812` /
   `WO-2025-0044` di `asset_detail_*` untuk kebocoran seal yang sama) —
   konsisten dengan catatan global `navigation-audit.md` §5.
