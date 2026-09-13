# UI Audit — Facility Locations & Spatial Hierarchy (`facility_locations_spatial_hierarchy_management`)

> Sumber: `stitch_facility_maintenance_platform_ui/facility_locations_spatial_hierarchy_management/code.html` (774 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Hub topologi spasial multi-tier: menavigasi hierarki
kampus → gedung → lantai → ruangan lewat **spatial tree**, memeriksa kondisi
ruangan terpilih (`Room #B-204`, Centrifugal Chiller Plant) beserta telemetri
lingkungan dan denah CAD 2D, melihat aset terpasang dan WO aktif di ruangan
itu, lalu bertindak (`Dispatch Room Audit`, `+ Log Defect`,
`Reassign / Transfer`). Node aktif dimuat via fragment HTMX
(`hx-get="/locations/tree/node/LOC-B2-MECH-204"`).

### Daftar elemen UI utama

1. **Breadcrumb + badge spasial** — `Home / Asset & Resource /
   Facility Locations / HQ Campus (Nusantara Tower) › Building B (CUP) ›
   Basement L2 › Room #B-204` + badge `Spatial Sync: Realtime`,
   `Total Managed Area: 142,500 m²`, `Monitored Zones: 68 Active`.
2. **Toolbar aksi** — H1 `Facility Locations & Spatial Topology Hub`;
   tombol `Quick Selector` (membuka modal), `Export GeoJSON / BIM`,
   `+ Add Sub-Location / Room` (primary).
3. **Spatial tree (kiri, ~28%)** — search (`Ctrl + /`, label `BIM LOD-350`);
   hierarki: `HQ Campus (Nusantara)` (4 BLDG) → Building A (Nominal),
   Building B - CUP (`1 ALERT`, expanded) → Roof (4 Assets), Level 01
   (6 Assets), Basement L2 - Heavy Mech (6 Rooms, expanded) → `#B-201`
   (3 Ast | 1 WO), `#B-204 Centrifugal Chiller` (node aktif, `8 AST`,
   indikator merah), `#B-208` (5 Ast), `#B-212` (2 Ast), Basement L3
   (Optimal) → Building C (Nominal), Logistics & Central Warehouse;
   footer `12 Sites · 34 Bldgs · 1,420 Rooms` + link `Recalibrate GIS`.
4. **Kartu Zone Safety & Compliance** — `Fire Safety Zone FZ-09`
   (`FM-200 Active`); `OSHA Risk Rating Hazard Class 2` (`Noise: 88 dBA`).
5. **Header lokasi terpilih** — `LOC-B2-MECH-204`,
   `Zone: Nusantara-CUP-B2`, `Active Critical Alert`; H2
   `Centrifugal Chiller Plant Room #B-204` + koordinat grid `CUP-G8-X3`;
   aksi `Edit Polygon`, `Print Badge QR`, `Dispatch Room Audit`.
6. **Strip KPI telemetri (6 tile)** — Floor Area `480 m²` (clearance 5,2 m),
   Ambient Temp `22.4 °C` (setpoint), Rel Humidity `48.2 %`,
   Refrigerant R-134a `142 PPM` (Warning >100 PPM), Thermal Delta T
   `5.8 °C`, Active Assets `8 units` (1 In Service Overhaul).
7. **Denah CAD 2D SVG** — perimeter beton, grid CAD, header pipa
   (`PRIMARY CHILLED WATER RETURN DN300 / 6.2 BAR`, `SUPPLY DN300 / 7.1 BAR`),
   duct `EXH-09` 1.200 CFM; simbol aset: `CHILLER #03 AST-HVAC-003`
   (nominal 96%), `CHILLER #04 AST-HVAC-004` (`SEAL REFRIG LEAK · WO-0894`,
   glow merah + pulse), `PUMP #101 AST-PUMP-101` (75HP aktif),
   `PUMP #102 AST-PUMP-102` (standby), `MCC-B2-04`, `VALV-042`,
   pintu darurat, eyewash + `LOTO LOCKOUT #4`; kontrol layer
   (HVAC Ducts / Electrical / Fire Safety), zoom, `Heatmap`; legenda
   (Nominal 6, Critical 1, Standby 1, Scale 1:50); stempel
   `BIM REVIT 2026.2 MODEL MATCHED`.
8. **Tabel Installed Assets in Room (4 dari 8)** — `AST-HVAC-004`
   (Critical Class A, P1 Warning, 88,4%), `AST-PUMP-101` (96,8%),
   `AST-PUMP-102` (standby 99,1%), `AST-VALV-042` (94,2%);
   tombol `Reassign / Transfer`; link `View All 8 in Asset Registry →`.
9. **Panel Active Work Orders & Defects (2 Open)** — `WO-2026-0894`
   P1 CRITICAL (`SLA Breach in 42m`, `AST-HVAC-004`, M. Kowalski,
   In Progress) + tombol `+ Log Defect`; `WO-2026-0881` P3 ROUTINE
   (`AST-VALV-042`, Shift Delta Team, Scheduled, due besok 18:00);
   hasil audit `TMPL-HVAC-CHL-02` (3/4 passed, `1 Defect`).
10. **Modal Quick Selector** — 4 dropdown kaskade (Campus → Building →
    Floor → Room) + strip preview (`8 Assets`, `2 Open WOs`, `480 m²`,
    `Node: LOC-B2-MECH-204`) + `Apply Filter Across Dashboard` / Cancel.

### State UI

- **Empty state:** ruangan tanpa aset → tabel kosong + CTA transfer masuk;
  tanpa WO terbuka → "Tidak ada defect aktif di ruangan ini" + tombol
  `+ Log Defect`; hasil pencarian tree kosong → "Node tidak ditemukan".
- **Loading state:** skeleton tree + skeleton denah (grid tanpa simbol);
  tile telemetri shimmer; swap fragment HTMX memakai indikator pada
  `#location-detail-container`.
- **Error state:** `Spatial Sync` merah + denah basi (`STALE`); layer BIM
  gagal → pesan + `Retry`; kaskade modal dengan opsi gagal → select
  disabled + pesan inline.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path` identik). Semua `href="#"` —
target di bawah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar 15 item | Route §2 `navigation-audit.md`; item `facility-locations` aktif = halaman ini (`/facilities`) |
| Node tree spasial (kampus/gedung/lantai/ruangan) | Swap fragment HTMX `GET /locations/tree/node/[id]` → `#location-detail-container` (tetap di halaman; produksi: `?locationId=` + fetch JSON) |
| `View All 8 in Asset Registry →` | `/assets?locationId=LOC-B2-MECH-204` — EXISTS (dengan query) |
| Baris tabel Installed Assets (`AST-*`) | `/assets/[id]` — EXISTS |
| `Dispatch Room Audit` | `/field-inspections/new?locationId=LOC-B2-MECH-204` (prefill flow) — MISSING |
| `+ Log Defect` | Flow log defect prefill lokasi (modal atau `/field-inspections/new?locationId=`) — MISSING |
| `Reassign / Transfer` | Flow transfer aset antar-ruangan — MISSING |
| Kartu WO (`WO-2026-0894`, `WO-2026-0881`) | `/work-orders/[id]` — MISSING |
| Hasil audit `TMPL-HVAC-CHL-02` | `/field-inspections/[id]` (hasil audit) — MISSING |
| `Edit Polygon` | Editor geometri GIS/BIM — MISSING |
| `Print Badge QR` | Print view badge ruangan — MISSING |
| `+ Add Sub-Location / Room` | Modal tambah node (`POST /api/v1/locations`) — MISSING |
| `Export GeoJSON / BIM` | Async job export geospasial — MISSING (parsial) |
| `Recalibrate GIS` | Job rekalibrasi GIS — MISSING |
| `Apply Filter Across Dashboard` (modal) | Set global scope (state `locationId`, bukan navigasi) — OK (aksi) |
| Layer tab / zoom / heatmap (denah) | State view lokal — OK (bukan navigasi) |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Prefill flow lokasi (MEDIUM)** — `Dispatch Room Audit` dan `+ Log Defect`
   butuh konvensi `?locationId=` menuju form inspeksi/defect (lihat
   `navigation-audit.md` §4 no. 8).
   `// TODO: Create prefill flow for /field-inspections/new?locationId=`
2. **`/work-orders/[id]` (HIGH)** — kedua kartu WO ruangan mati (ikut
   missing global no. 1).
   `// TODO: Create detail page routing for /work-orders/[id]`
3. **Hasil audit ruangan (MEDIUM)** — `TMPL-HVAC-CHL-02` (3/4 passed,
   1 defect) tidak punya halaman tujuan; definisikan
   `/field-inspections/[id]` atau drawer hasil.
4. **Editor spasial (LOW)** — `Edit Polygon` dan `Recalibrate GIS` butuh
   keputusan build-vs-buy (editor GIS/BIM) sebelum di-route.
5. **Print badge QR (LOW)** — ikut daftar print global §4 no. 12.
6. **Kontrak fragment HTMX (MEDIUM, teknis)** — mockup memakai
   `hx-get="/locations/tree/node/…" → #location-detail-container`; produksi
   (Next.js) menggantinya dengan `GET /api/v1/locations/:id` + state
   klien — fragment HTML tidak dipertahankan.

> Konsisten dengan `navigation-audit.md`: baris facility §3
> (`View All 8` EXISTS-dengan-query; `Dispatch Room Audit`/`+ Log Defect`
> MISSING-prefill), missing §4 no. 1 dan no. 8.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + token inline; Inter + JetBrains
  Mono + Material Symbols; denah digambar **SVG inline** (±110 elemen:
  grid pattern, pipa, duct, simbol aset, animasi `<animate>` pulse);
  interaksi tree memakai atribut **HTMX** (`hx-get`, `hx-target`); modal
  Quick Selector via toggle class inline.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/facilities` (+ `?locationId=`); typing `LocationNode`, `RoomTelemetry`, `RoomAsset`. |
| **Tailwind CSS (build)** | Split-pane tree/detail, tile telemetri, tabel; token sistem A. |
| **shadcn/ui** — `Tree` (custom di atas `Collapsible`/`ScrollArea`), `Card`, `Badge`, `Table`, `Select`, `Dialog`, `Tabs`, `Skeleton`, `Toast` | Spatial tree, kartu zona, tabel aset, modal kaskade, skeleton denah. |
| **lucide-react** | Pengganti Material Symbols (map, factory, door-open, qr-code, thermostat, ruler). |
| **SVG terkomponenkan (React) / Canvas (Konva/Fabric) bila interaktif penuh** | Ganti SVG statis: simbol aset reaktif (klik → `/assets/[id]`), layer toggle, heatmap, zoom/pan. |
| **SWR / TanStack Query** | Fetch node terpilih (`GET /api/v1/locations/:id`), poll telemetri ruangan; ganti fragment HTMX. |
| **axios** | HTTP client `/api/v1`. |
| **zod + react-hook-form** | Validasi Add Sub-Location / Log Defect / Transfer. |
| **date-fns** | `SLA Breach in 42m`, `Due Tomorrow 18:00`. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/locations/tree` | On page load (spatial tree) | Query: `?q=&depth=4`. Response: `{ "data": [{ "id": "hq-campus", "name": "HQ Campus (Nusantara)", "children": [{ "id": "bldg-b", "name": "Building B - Central Plant (CUP)", "alertCount": 1 }] }] }` |
| GET | `/api/v1/locations/:id` | On klik node tree / deep-link `?locationId=` | Response: `{ "data": { "id": "LOC-B2-MECH-204", "name": "Centrifugal Chiller Plant Room #B-204", "zone": "Nusantara-CUP-B2", "grid": "CUP-G8-X3", "areaM2": 480, "telemetry": { "ambientC": 22.4, "humidityPct": 48.2, "refrigerantPpm": 142, "deltaTC": 5.8 }, "safety": { "fireZone": "FZ-09", "oshaClass": "Hazard Class 2", "noiseDba": 88 }, "assetCount": 8, "openWoCount": 2 } }` |
| GET | `/api/v1/locations/:id/assets` | On seleksi ruangan (tabel Installed Assets) | Response: `{ "data": [{ "id": "AST-HVAC-004", "name": "Centrifugal Water Chiller 450-TR", "class": "Critical Class A", "status": "P1_WARNING", "healthPct": 88.4 }] }` |
| GET | `/api/v1/locations/:id/work-orders` | On seleksi ruangan (panel WO) | Response: `{ "data": [{ "id": "WO-2026-0894", "priority": "P1", "assetId": "AST-HVAC-004", "summary": "Chiller #04 Shaft Seal Refrigerant Leak", "assignee": "M. Kowalski", "slaBreachInMin": 42, "status": "IN_PROGRESS" }] }` |
| GET | `/api/v1/locations/:id/blueprint` | On seleksi ruangan (denah CAD) | Query: `?layer=hvac&level=-2.0`. Response: `{ "data": { "scale": "1:50", "bimRev": "REVIT 2026.2", "symbols": [{ "assetId": "AST-HVAC-004", "x": 320, "y": 90, "state": "CRITICAL" }] } }` |
| POST | `/api/v1/locations` | On submit `+ Add Sub-Location / Room` | Body: `{ "parentId": "basement-l2", "name": "Room #B-216", "type": "ROOM" }`. Response: `{ "data": { "id": "LOC-B2-216" } }` |
| POST | `/api/v1/inspections` | On submit `Dispatch Room Audit` (prefill lokasi) | Body: `{ "locationId": "LOC-B2-MECH-204", "templateId": "TMPL-HVAC-CHL-02" }`. Response: `{ "data": { "id": "INS-2026-4402" } }` |
| POST | `/api/v1/defects` | On submit `+ Log Defect` | Body: `{ "locationId": "LOC-B2-MECH-204", "assetId": "AST-HVAC-004", "summary": "…" }`. Response: `{ "data": { "id": "DEF-2026-0119" } }` |
| POST | `/api/v1/assets/:id/transfer` | On submit `Reassign / Transfer` | Body: `{ "destinationLocationId": "LOC-B2-208" }`. Response: `{ "data": { "id": "AST-HVAC-004", "locationId": "LOC-B2-208" } }` |
| POST | `/api/v1/exports/locations` | On click `Export GeoJSON / BIM` | Body: `{ "format": "GEOJSON", "locationId": "LOC-B2-MECH-204" }`. Response: `{ "data": { "jobId": "EXP-5511" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/facilities.mock.ts`.

```ts
// TODO: Replace tree mock with GET /api/v1/locations/tree?depth=4
export const locationTree = [
  {
    id: "hq-campus", name: "HQ Campus (Nusantara)", badge: "4 BLDG",
    children: [
      { id: "bldg-a", name: "Building A - Corp HQ (5 Fl)", state: "NOMINAL" },
      {
        id: "bldg-b", name: "Building B - Central Plant (CUP)", alertCount: 1,
        children: [
          {
            id: "basement-l2", name: "Basement L2 - Heavy Mech", roomCount: 6,
            children: [
              { id: "LOC-B2-201", name: "#B-201 Emer Gen Vault", assets: 3, openWos: 1 },
              { id: "LOC-B2-MECH-204", name: "#B-204 Centrifugal Chiller", assets: 8, active: true },
              { id: "LOC-B2-208", name: "#B-208 Primary Pump Bay", assets: 5 },
              { id: "LOC-B2-212", name: "#B-212 Chemical Dosing", assets: 2 },
            ],
          },
        ],
      },
    ],
  },
];

// TODO: Replace room mock with GET /api/v1/locations/LOC-B2-MECH-204
export const roomDetail = {
  id: "LOC-B2-MECH-204", name: "Centrifugal Chiller Plant Room #B-204",
  grid: "CUP-G8-X3", areaM2: 480, ambientC: 22.4, humidityPct: 48.2,
  refrigerantPpm: 142, deltaTC: 5.8, assetCount: 8, openWoCount: 2,
};

// TODO: Replace room assets mock with GET /api/v1/locations/LOC-B2-MECH-204/assets
export const roomAssets = [
  { id: "AST-HVAC-004", name: "Centrifugal Water Chiller 450-TR", class: "Critical Class A", status: "P1_WARNING", healthPct: 88.4 },
  // TODO: picks — AST-PUMP-101, AST-PUMP-102, AST-VALV-042 dari code.html
];

// TODO: Replace room WOs mock with GET /api/v1/locations/LOC-B2-MECH-204/work-orders
export const roomWorkOrders = [
  { id: "WO-2026-0894", priority: "P1", assetId: "AST-HVAC-004", summary: "Chiller #04 Shaft Seal Refrigerant Leak", slaBreachInMin: 42, status: "IN_PROGRESS" },
  { id: "WO-2026-0881", priority: "P3", assetId: "AST-VALV-042", summary: "Semi-Annual Calibration of Pressure Relief Valve", status: "SCHEDULED" },
];

// TODO: Create prefill flow for /field-inspections/new?locationId=LOC-B2-MECH-204
// TODO: Replace hx-get fragment (/locations/tree/node/...) with JSON fetch + ?locationId= state
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/locations/LOC-B2-MECH-204/assets', fetcher)
import { roomAssets } from "@/mocks/facilities.mock";

export function RoomAssetTable() {
  return (
    <Table>
      <TableBody>
        {roomAssets.map((a) => (
          // TODO: picks — bungkus baris dengan <Link href={`/assets/${a.id}`}> setelah route ada
          <TableRow key={a.id}>
            <TableCell className="font-mono font-bold">{a.id}</TableCell>
            <TableCell>{a.name}</TableCell>
            <TableCell className="font-mono">{a.healthPct}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Skor `AST-HVAC-004` versi ketiga.** Tabel ruangan menulis `88.4%`;
   registry `68/100`; asset detail `88%`. Lihat Temuan
   `docs/ui-audit/asset-registry.md` no. 2.
2. **Format ID WO disingkat di denah.** Simbol chiller menulis
   `SEAL REFRIG LEAK · WO-0894` sementara semua panel memakai
   `WO-2026-0894` — samakan format penuh saat render label CAD.
3. **Hitungan aset konsisten, penyajian tidak.** Node tree, modal preview,
   dan tabel sepakat `8 AST / 2 Open WOs` untuk `#B-204`, tetapi tabel hanya
   menampilkan 4 baris tanpa pagination (`Showing 4 of 8`) — tambahkan
   pagination atau scroll yang eksplisit.
4. **`#B-201` merujuk `1 WO` tanpa tautan.** Satu-satunya WO di luar `#B-204`
   yang disebut di tree tidak diidentifikasi ID-nya — pastikan
   `GET /api/v1/locations/:id/work-orders` mencakup semua ruangan.
5. **Fragment HTMX bukan kontrak final.** `hx-get="/locations/tree/node/…"`
   mengembalikan HTML; arsitektur Next.js produksi memakai JSON
   (`GET /api/v1/locations/:id`) — jangan porting fragment 1:1.
