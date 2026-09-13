# UI Audit — Facilities (pass-2, independen)

> Sumber: `stitch_facility_maintenance_platform_ui/facility_locations_spatial_hierarchy_management/code.html` (774 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2, audit independen dari nol).
> Konteks rute global: `docs/ui-audit/navigation-audit.md` (route usulan `/facilities`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Hub **Facility Locations & Spatial Topology** memetakan hierarki geospasial
aset (Site → Building → Floor → Room) dan menyajikan kondisi satu ruangan
terpilih (`Room #B-204`, chiller plant Basement L2) sebagai pusat operasi:
telemetri lingkungan, denah CAD 2D interaktif, aset terpasang, WO/defect aktif,
dan audit ruangan. Satu-satunya layar dengan interaksi nyata (`hx-get` +
modal selector).

### Daftar elemen UI utama

1. **Breadcrumb + badge spasial** — `Home / Asset & Resource / Facility
   Locations / HQ Campus (Nusantara Tower) › Building B (CUP) › Basement L2 ›
   Room #B-204`; pil `Spatial Sync: Realtime`, `Total Managed Area: 142.500 m²`,
   `Monitored Zones: 68 Active`.
2. **Toolbar aksi** — `Quick Selector` (membuka modal), `Export GeoJSON / BIM`,
   `+ Add Sub-Location / Room` (primary).
3. **Pohon spasial kiri** — root `HQ Campus (Nusantara)` 4 BLDG; Building A
   Nominal; Building B expanded (`1 ALERT`); Roof 4 aset; Level 01 6 aset;
   Basement L2 6 Rooms (`#B-201` 3 Ast 1 WO, **`#B-204` aktif 8 AST** via
   `hx-get="/locations/tree/node/LOC-B2-MECH-204"` → `#location-detail-container`,
   `#B-208` 5 Ast, `#B-212` 2 Ast); Basement L3 Optimal; Building C dan
   Logistics Warehouse Nominal; footer `12 Sites · 34 Bldgs · 1.420 Rooms` +
   `Recalibrate GIS`; kartu `Zone Safety & Compliance` (FZ-09 FM-200 Active,
   OSHA Hazard Class 2, Noise 88 dBA).
4. **Header ruangan** — `LOC-B2-MECH-204`, `Zone: Nusantara-CUP-B2`,
   `Active Critical Alert`; H2 `Centrifugal Chiller Plant Room #B-204`;
   aksi `Edit Polygon`, `Print Badge QR`, `Dispatch Room Audit`.
5. **Strip KPI lingkungan (6)** — Floor Area 480 m² (clearance 5,2 m), Ambient
   22,4 °C (setpoint), RH 48,2 % (nominal 35–65 %), Refrigerant R-134a
   **142 PPM Warning (>100)**, Delta-T 5,8 °C, Active Assets 8 (1 overhaul).
6. **Denah CAD SVG** — grid + dinding + 6 pilar; header pipa chilled water
   DN300 (return 6,2 BAR / supply 7,1 BAR); duct EXH-09 1.200 CFM;
   `CHILLER #03` nominal 96 %, **`CHILLER #04 [CRITICAL]`** (pulse animasi,
   `SEAL REFRIG LEAK · WO-0894`), `PUMP #101` aktif, `PUMP #102` standby,
   `MCC-B2-04`, `VALV-042`, `FIRE EXIT`, `EYEWASH / LOTO LOCKOUT #4`,
   `MAIN ACCESS DOOR`; tab layer (HVAC Ducts/Electrical/Fire Safety), zoom,
   `Heatmap`; legenda Nominal (6) / Critical (1) / Standby (1), skala 1:50;
   stamp `BIM REVIT 2026.2 MODEL MATCHED`.
7. **Tabel aset ruangan** — 4 dari 8 baris tampil (`AST-HVAC-004` P1 Warning
   88,4 %, `AST-PUMP-101` 96,8 %, `AST-PUMP-102` 99,1 %, `AST-VALV-042` 94,2 %);
   footer `View All 8 in Asset Registry →`; tombol `Reassign / Transfer`.
8. **Panel WO & defect** — `WO-2026-0894` P1 CRITICAL (`SLA Breach in 42m`,
   M. Kowalski, In Progress), `WO-2026-0881` P3 (`Due Tomorrow 18:00`,
   Shift Delta Team, Scheduled), hasil audit `TMPL-HVAC-CHL-02` (3/4 passed,
   1 Defect); tombol `+ Log Defect`.
9. **Modal Quick Selector** (hidden) — 4 dropdown kaskade
   (Campus → Building → Floor → Room) + pratinjau (`8 Assets`, `2 Open WOs`,
   `480 m²`, Node LOC-B2-MECH-204) + `Cancel` / `Apply Filter Across Dashboard`.

### State UI

- **Empty state:** node tanpa aset → tabel "Belum ada aset di ruangan ini" +
  `Reassign / Transfer` sebagai CTA; ruangan tanpa WO → "Tidak ada WO terbuka".
- **Loading state:** klik node tree → `#location-detail-container` memakai
  pola HTMX (indikator request) — skeleton denah + panel; modal selector
  memakai opsi disabled saat memuat anak tangga.
- **Error state:** `hx-get` gagal → container menampilkan pesan + `Retry`;
   sensor lingkungan basi → KPI abu + `STALE`; GIS mismatch → stamp BIM jadi
   `MODEL MISMATCH` + tautan `Recalibrate GIS`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar `<aside>`). Interaksi nyata: `hx-get` node tree
dan toggle modal; sisanya `href="#"`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar (15 `data-path`) | Route §2 `navigation-audit.md`; halaman ini `/facilities` |
| Node pohon (`#B-201`, `#B-208`, …) | `hx-get /locations/tree/node/[nodeId]` → ganti `#location-detail-container` (produksi: `/facilities/[locationId]`) |
| `Quick Selector` → `Apply Filter Across Dashboard` | Terapkan `?location=` lintas dashboard (konvensi query) |
| `Export GeoJSON / BIM` | Unduh geospasial, tetap di halaman |
| `+ Add Sub-Location / Room` | Modal/drawer tambah node — MISSING |
| `Edit Polygon` | Editor geometri ruangan — MISSING |
| `Print Badge QR` | Print view badge ruangan |
| `Dispatch Room Audit` | `/field-inspections/new?location=LOC-B2-MECH-204` — MISSING (prefill) |
| `+ Log Defect` | `/field-inspections/findings/new?location=…` — MISSING (prefill) |
| Baris aset (`AST-*`) | `/assets/[tag]` (mockup ADA) |
| `View All 8 in Asset Registry →` | `/assets?facility=LOC-B2-MECH-204` (query, mockup registry ADA) |
| `Reassign / Transfer` | Flow pindah aset antar-ruangan — MISSING |
| `WO-2026-0894` / `WO-2026-0881` | `/work-orders/[id]` — MISSING |
| `Recalibrate GIS` | Job kalibrasi GIS — MISSING |
| Tab layer / zoom / Heatmap | State kanvas lokal, bukan navigasi |
| Header `+ New Dispatch / Request`, notifikasi | Pola global dan `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — dua WO ruangan + referensi `WO-0894` di
   denah tanpa tujuan.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Prefill audit/defect dari ruangan (MEDIUM)** — `Dispatch Room Audit` dan
   `+ Log Defect` butuh route + konvensi `?location=`.
   `// TODO: Create /field-inspections/new?location= and findings/new?location= prefill flows`
3. **Manajemen node spasial (MEDIUM)** — tambah ruangan, edit poligon,
   reassign/transfer aset, recalibrate GIS: semuanya aksi tanpa target.
   `// TODO: Define spatial node CRUD, polygon editor, asset transfer, and GIS recalibration flows`
4. **BIM 3D viewer (MEDIUM)** — stamp `MODEL MATCHED` menyiratkan model Revit
   tetapi tidak ada jalan masuknya (kaitkan dengan temuan registry).
   `// TODO: Define BIM viewer entry from facility blueprint`
5. **Target global `+ New Dispatch / Request` (MEDIUM)** — sama seperti
   layar lain, belum diputuskan.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, **Tailwind Play CDN**, font **Inter + JetBrains Mono**, ikon
  **Material Symbols Outlined**.
- Denah digambar sebagai **SVG inline** (±110 node: grid pattern, pipa,
  duct gradient, glow alert, animasi `<animate>` pulse).
- **HTMX fragment**: `hx-get="/locations/tree/node/LOC-B2-MECH-204"`
  `hx-target="#location-detail-container"` — satu-satunya interaksi data nyata.
- Modal selector memakai toggle kelas `hidden` via `onclick` inline.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/facilities` + `/facilities/[locationId]`; ganti fragment HTMX dengan Server Component + `loading.tsx` |
| **Tailwind CSS (build)** | Ganti Play CDN; token sistem A |
| **shadcn/ui (Radix)** — `Tree` (kustom), `Card`, `Badge`, `Button`, `Table`, `Dialog`, `Select`, `Skeleton`, `Toast` | Pohon, KPI, tabel, modal selector |
| **lucide-react** | Pengganti Material Symbols |
| **SVG React (kustom) / React-Konva** | Port denah: node aset berstatus, layer HVAC/Electrical/Fire, heatmap, zoom/pan |
| **SWR / TanStack Query** | Telemetri ruangan (polling) + anak tree malas-muat |
| **axios** | Client `/api/v1` |
| **zod + react-hook-form** | Form tambah ruangan, log defect, audit ruangan |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger | Expected Payload / Response |
|---|---|---|---|---|
| GET | `/api/v1/facilities/tree` | Pohon spasial (anak per node) | On load + expand node | Query `?parentId=root`. `{ "data": [{ "id": "LOC-B2-MECH-204", "code": "#B-204", "name": "Centrifugal Chiller", "assetCount": 8, "alert": true }] }` |
| GET | `/api/v1/facilities/:id` | Header + KPI lingkungan ruangan | On select node | `{ "data": { "id": "LOC-B2-MECH-204", "areaM2": 480, "ambientC": 22.4, "humidityPct": 48.2, "refrigerantPpm": 142, "deltaTC": 5.8, "activeAssets": 8 } }` |
| GET | `/api/v1/facilities/:id/blueprint` | Geometri denah + node aset | On select node + ganti layer | Query `?layer=hvac`. `{ "data": { "scale": "1:50", "assets": [{ "tag": "AST-HVAC-004", "x": 320, "y": 90, "state": "CRITICAL" }], "bimMatch": "REVIT 2026.2" } }` |
| GET | `/api/v1/facilities/:id/assets` | Aset terpasang | On select node | `{ "data": [{ "tag": "AST-HVAC-004", "class": "Critical Class A", "status": "P1_WARNING", "healthPct": 88.4 }] }` |
| GET | `/api/v1/facilities/:id/work-orders` | WO & defect ruangan | On select node | `{ "data": [{ "id": "WO-2026-0894", "priority": "P1_CRITICAL", "slaBreachInMin": 42 }] }` |
| POST | `/api/v1/facilities` | Tambah sub-lokasi/ruangan | Submit + Add Sub-Location | Body `{ "parentId": "LOC-B2", "code": "#B-216", "name": "…", "areaM2": 120 }` |
| PUT | `/api/v1/facilities/:id/polygon` | Simpan geometri edit | On save Edit Polygon | Body `{ "polygon": [[0,0],[10,0]] }` |
| POST | `/api/v1/assets/transfers` | Reassign antar-ruangan | On submit Reassign | Body `{ "tags": ["AST-PUMP-102"], "toLocationId": "LOC-B2-MECH-208" }` |
| GET | `/api/v1/facilities/export` | Export GeoJSON/BIM | On click Export | File async `{ "data": { "jobId": "GIS-5510" } }` |

Contoh `fetch` (pengganti `hx-get` fragment):

```ts
// TODO: Replace hx-get fragment with GET /api/v1/facilities/:id + Next.js loading state
export async function fetchLocationDetail(locationId: string) {
  const res = await fetch(`/api/v1/facilities/${locationId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`location ${locationId} failed: ${res.status}`);
  const { data } = await res.json();
  return data as { id: string; ambientC: number; refrigerantPpm: number; activeAssets: number };
}
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/facilities.mock.ts`.

```ts
// TODO: Replace tree mock with GET /api/v1/facilities/tree?parentId=root
export const spatialTree = [
  { id: "LOC-CAMPUS-HQ", code: "HQ Campus (Nusantara)", meta: "4 BLDG", children: [
    { id: "LOC-BLDG-A", code: "Building A - Corp HQ (5 Fl)", state: "NOMINAL" },
    { id: "LOC-BLDG-B", code: "Building B - Central Plant (CUP)", alert: true, children: [
      { id: "LOC-B2", code: "Basement L2 - Heavy Mech", meta: "6 Rooms", children: [
        { id: "LOC-B2-MECH-201", code: "#B-201 Emer Gen Vault", meta: "3 Ast | 1 WO" },
        { id: "LOC-B2-MECH-204", code: "#B-204 Centrifugal Chiller", meta: "8 AST", active: true },
        { id: "LOC-B2-MECH-208", code: "#B-208 Primary Pump Bay", meta: "5 Ast" },
        { id: "LOC-B2-MECH-212", code: "#B-212 Chemical Dosing", meta: "2 Ast" },
      ]},
    ]},
  ]},
];

// TODO: Replace room mock with GET /api/v1/facilities/LOC-B2-MECH-204
export const roomDetail = {
  id: "LOC-B2-MECH-204", name: "Centrifugal Chiller Plant Room #B-204",
  areaM2: 480, clearanceM: 5.2, ambientC: 22.4, humidityPct: 48.2,
  refrigerantPpm: 142, deltaTC: 5.8, activeAssets: 8, overhaul: 1,
  safety: { fireZone: "FZ-09", fm200: "Active", osha: "Hazard Class 2", noiseDba: 88 },
};

// TODO: Replace blueprint mock with GET /api/v1/facilities/LOC-B2-MECH-204/blueprint?layer=hvac
export const blueprintNodes = [
  { tag: "AST-HVAC-003", label: "CHILLER #03", x: 100, y: 90, state: "NOMINAL", note: "RUNNING NOMINAL · 96%" },
  { tag: "AST-HVAC-004", label: "CHILLER #04 [CRITICAL]", x: 320, y: 90, state: "CRITICAL", note: "SEAL REFRIG LEAK · WO-0894" },
  { tag: "AST-PUMP-101", label: "PUMP #101", x: 100, y: 240, state: "NOMINAL", note: "75HP · ACTIVE" },
  { tag: "AST-PUMP-102", label: "PUMP #102", x: 240, y: 240, state: "STANDBY", note: "STANDBY READY" },
];

// TODO: Replace room assets mock with GET /api/v1/facilities/LOC-B2-MECH-204/assets
export const roomAssets = [
  { tag: "AST-HVAC-004", name: "Centrifugal Water Chiller 450-TR", class: "Critical Class A", status: "P1_WARNING", healthPct: 88.4 },
  { tag: "AST-PUMP-101", name: "Primary Chilled Water Pump 75HP", class: "Standard Class B", status: "RUNNING_NOMINAL", healthPct: 96.8 },
  { tag: "AST-PUMP-102", name: "Primary Chilled Water Standby Pump", class: "Standard Class B", status: "STANDBY_READY", healthPct: 99.1 },
  { tag: "AST-VALV-042", name: "Main Header Motorized Butterfly Valve", class: "Safety Critical", status: "OPERATIONAL", healthPct: 94.2 },
];

// TODO: Create detail page routing for /work-orders/[id] (WO-2026-0894, WO-2026-0881 above)
// TODO: Define spatial node CRUD, polygon editor, asset transfer, and GIS recalibration flows
export function openRoomLocation(locationId: string) {
  window.location.assign(`/facilities/${locationId}`);
}
```

Contoh binding:

```tsx
// TODO: Replace hx-get with Next.js route /facilities/[locationId] + loading.tsx skeleton
import { roomAssets } from "@/mocks/facilities.mock";

export function RoomAssetsTable() {
  return (
    <Table>
      <TableBody>
        {roomAssets.map((a) => (
          <TableRow key={a.tag}>
            <TableCell className="font-mono font-bold">{a.tag}</TableCell>
            <TableCell><Badge>{a.status}</Badge></TableCell>
            <TableCell className="font-mono">{a.healthPct}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian: fragment HTMX tidak diporting 1:1 — ganti route
`/facilities/[locationId]` + prefetch node sibling untuk navigasi pohon instan.

## 7. Perbandingan Pass-1 vs Pass-2

Dibandingkan dengan `docs/ui-audit/facilities.md` (pass-1) setelah audit
independen di atas selesai.

### (a) Temuan pass-1 yang TERKONFIRMASI

- Pohon spasial + `hx-get` fragment, 6 KPI (termasuk R-134a 142 PPM
  Warning), denah SVG + `WO-0894` singkat, tabel 4-dari-8
  (88,4/96,8/99,1/94,2 %), kartu `WO-2026-0894` (42m) + `WO-2026-0881`,
  modal kaskade 4 level, zona FZ-09 / OSHA Class 2 — **semua cocok**.
- Prefill audit/defect, `/work-orders/[id]`, editor spasial, BIM viewer —
  **semua dikonfirmasi MISSING**; larangan porting HTMX 1:1 **disepakati**.

### (b) Temuan BARU yang luput di pass-1

1. **Konflik label hitungan ruangan.** Badge node `8 AST` vs pil tabel
   `4 Linked` vs footer `Showing 4 of 8` — tiga angka satu ruangan tanpa
   pagination eksplisit. Pass-1 mencatat 4-of-8 tanpa pagination; konflik
   label `4 Linked` luput.
   `// TODO: Unify room asset count labels (8 AST vs 4 Linked vs Showing 4 of 8)`

### (c) KOREKSI / adopsi balik

Tidak ada kesalahan faktual di pass-1. Sebaliknya pass-1 menangkap dua hal
yang luput di pass-2 dan kini **diadopsi**: (i) tautan hasil audit
`TMPL-HVAC-CHL-02` → `/field-inspections/[id]` MISSING; (ii) `#B-201
(3 Ast | 1 WO)` merujuk WO tak ber-ID (pastikan tercakup
`GET /api/v1/facilities/:id/work-orders`). Koreksi terhadap audit pass-2
sendiri, bukan terhadap pass-1.
