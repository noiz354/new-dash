# UI Audit — Asset Detail (pass-2, independen)

> Sumber: `stitch_facility_maintenance_platform_ui/asset_detail_spare_parts_inventory_ledger/code.html` (986 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2, audit independen dari nol).
> Konteks rute global: `docs/ui-audit/navigation-audit.md` (route usulan `/assets/[id]`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **detail aset** untuk `AST-HVAC-004` (Centrifugal Industrial Water
Chiller 450-TR Unit 04): satu-satunya halaman detail entitas yang termockup di
ekosistem ini. Menggabungkan identitas + spesifikasi teknik, telemetri hidup,
jejak audit lifecycle, **BOM + ledger suku cadang**, dan **jurnal mutasi stok
immutable** — jembatan antara dunia aset, inventaris, WO, dan purchasing.

### Daftar elemen UI utama

1. **Breadcrumb + badge status** — `Home / Asset & Resource / Asset Registry /
   AST-HVAC-004 / Centrifugal Water Chiller Unit 4`; pil `P1 - MISSION CRITICAL
   FACILITY PLANT`, `ACTIVE / UNDER MONITORING`, `Telemetry ID: IOT-CHL-450-04`.
2. **Sub-tab navigasi** — `Asset 360° & Lifecycle` (aktif), `Spare Parts Ledger
   (18)`, `IoT Diagnostics`, `PM Schedules (12)`, `Compliance & Docs`.
3. **Hero identitas (7 kolom)** — tag `AST-HVAC-004` + tombol salin
   (`navigator.clipboard`), merek `Daikin Applied Magnitude®`, `BOM VERIFIED`,
   `REV-2024.3`; lokasi 4 tingkat hingga `Mechanical Room #B-204`; grid spek
   (450 TR / 1.582 kW, HFC-134a 620 lbs, Dual Mag-Bearing oil-free,
   480V/3Ø/60Hz FLA 512A); kartu garansi Daikin (`WAR-99214-DK`, aktif s.d.
   Nov 2026) dan commissioning (14 Okt 2019, 4,5 thn, sisa desain 77,5%);
   toolbar `Quick Dispatch WO`, `Log Inspection`, `Dossier`, kustodian
   `HVAC Central Plant Team (Ops L2)`.
4. **Klaster telemetri (5 kolom)** — dial 88% OPTIMAL (Grade A-), MTBF 1.840 jam,
   MTTR 3,2 jam; 3 gauge (vibrasi bearing 0,18 in/s, Delta-T 11,2 °F, suction
   124 PSI); runtime kumulatif 32.491,4 jam, availability 99,2%; badge
   `SAMPLING: 1 SEC`.
5. **Timeline audit** — pil filter `All Events (54)`, `Work Orders (14)`,
   `Inspections (28)`, `Parts Replaced (8)`, `Calibration (4)`; 3 event tampil:
   `PM-2025-0812` COMPLETED (deduksi `PART-SEAL-8821 (-2)`, `PART-LUB-09 (-2)`,
   downtime 3,5 jam), `WO-2025-0044` RESOLVED (vibrasi 0,32 in/s, root cause
   micro-debris, tutup 1,4 jam), `INS-2024-4401` PASS (sertifikat
   `#NBIC-990-2024`, 12 bulan).
6. **BOM + ledger suku cadang** — scope gudang (`Central Distribution Hub`
   vs `Building B Satellite Bin`) + `Add SKU to BOM`; 4 KPI (18 Parts,
   2 SKUs Alerting — `PART-SEAL-8821` par 4 net 0, valuasi $34.820 WAC,
   2 In-Transit `PO-2025-0144` ETA 20 Feb 2025); tabel 9 kolom, 5 dari 18 baris
   tampil (`PART-SEAL-8821` STOCK DEFICIT $1.450 + `+ PR Request`,
   `PART-LUB-09` BELOW PAR, `PART-FLTR-401`/`PART-VLV-102`/`PART-BRG-6204`
   OPTIMAL + `Issue to WO`/`Quick PO`); hash `SHA-256: 9e08fc…18a`.
7. **Jurnal mutasi immutable** — 5 dari 421 transaksi: `TXN-2025-88419`/`88390`
   (WO DISPATCH USAGE → `#WO-2025-0812`), `87910` (PO RECEIPT → `#PO-2025-0081`),
   `86102` (TRANSFER RECEIVED → `#TO-8891 (Sat-B)`), `84902` (AUDIT CYCLE COUNT
   → `#ADJ-2024-Q4`); tiap baris ada operator berkustodian; footer
   `Load Full Historical Ledger (CSV / HTMX Stream)`.

### State UI

- **Empty state:** BOM tanpa SKU → `+ Add SKU to BOM` sebagai CTA; ledger kosong
  → "Belum ada mutasi untuk aset ini"; tab PM tanpa jadwal → daftar kosong.
- **Loading state:** skeleton dial telemetri + gauge; tabel BOM 5 baris skeleton;
  jurnal memakai feed skeleton; badge `SAMPLING` jadi `CONNECTING…`.
- **Error state:** telemetri basi → gauge abu + `STALE`; post mutasi gagal →
  toast + saldo running tidak berubah (jurnal immutable tidak boleh
  setengah-tulis); salin tag gagal → fallback prompt manual.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar `<aside>`). Semua `href="#"`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Breadcrumb `Asset Registry` | `/assets` (induk halaman ini) |
| Sub-tab `Asset 360° & Lifecycle` | `/assets/[id]` (tab ini) |
| Sub-tab `Spare Parts Ledger` | `/assets/[id]?tab=parts` (anchor tabel BOM) |
| Sub-tab `IoT Diagnostics` | `/assets/[id]?tab=iot` — MISSING (tab tanpa konten) |
| Sub-tab `PM Schedules` | `/assets/[id]?tab=pm` — MISSING (tab tanpa konten) |
| Sub-tab `Compliance & Docs` | `/assets/[id]?tab=docs` — MISSING (tab tanpa konten) |
| `Quick Dispatch WO` | `/work-orders/new?asset=AST-HVAC-004` — MISSING (prefill) |
| `Log Inspection` | `/field-inspections/new?asset=…` — MISSING (prefill) |
| `Dossier` | Export PDF dossier aset |
| `#WO-2025-0812 open_in_new` (×2) | `/work-orders/[id]` — MISSING |
| `#PO-2025-0081 open_in_new` | `/purchasing/[id]` — MISSING |
| `#TO-8891 (Sat-B) open_in_new` | Detail transfer antar-gudang — MISSING |
| `#ADJ-2024-Q4 open_in_new` | Detail adjustment audit — MISSING |
| `+ PR Request` / `+ Quick PO` / `Issue to WO` | `/purchasing/new?sku=…` / issue parts ke WO — MISSING |
| `Add SKU to BOM` | Modal tambah SKU — MISSING |
| `Load Full Historical Ledger` | Export CSV / stream penuh |
| Header `+ New Dispatch / Request`, notifikasi | Pola global dan `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — tautan `#WO-2025-0812` ganda tanpa tujuan;
   dead-end terbesar halaman ini.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Isi 3 sub-tab (MEDIUM)** — `IoT Diagnostics`, `PM Schedules (12)`,
   `Compliance & Docs` hanya berupa tombol tanpa konten/route; putuskan tab
   inline vs route (`?tab=`).
   `// TODO: Define content and routing for iot, pm, docs sub-tabs`
3. **`/purchasing/[id]` + dokumen transfer/adjustment (MEDIUM)** —
   `#PO-2025-0081`, `#TO-8891`, `#ADJ-2024-Q4` menggantung.
   `// TODO: Create detail page routing for /purchasing/[id] (plus transfer/adjustment views)`
4. **Prefill lintas modul (MEDIUM)** — Quick Dispatch WO, Log Inspection,
   PR/PO dari baris BOM, Issue to WO: butuh konvensi query seragam.
   `// TODO: Agree prefill conventions ?asset= and ?sku= for WO, inspection, PR flows`
5. **Modal `Add SKU to BOM` (LOW)** — field dan validasi tak terdefinisi.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, **Tailwind Play CDN** + config inline, font **Inter** +
  **JetBrains Mono**, ikon **Material Symbols Outlined**.
- Satu-satunya JS nyata: `navigator.clipboard.writeText('AST-HVAC-004')`.
- Dial kesehatan digambar sebagai **SVG donat manual** (`stroke-dasharray`).
- Tanpa framework, routing, polling, atau fetch.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route dinamis `/assets/[id]` + tab via `searchParams` |
| **Tailwind CSS (build)** | Ganti Play CDN; token sistem A |
| **shadcn/ui (Radix)** — `Tabs`, `Card`, `Badge`, `Table`, `Progress`, `Avatar`, `Skeleton`, `Toast`, `Dialog`, `Tooltip` | Sub-tab, dial, tabel BOM, jurnal, modal BOM |
| **lucide-react** | Pengganti Material Symbols |
| **Recharts** (atau SVG kustom) | Ganti donat manual + gauge; sparkline telemetri |
| **SWR / TanStack Query** | Polling telemetri 1 dtk (throttlenioskus) + jurnal paginasi |
| **axios** | Client `/api/v1` + auth |
| **date-fns + date-fns-tz** | Timestamp campuran EST/UTC dinormalisasi ke WIB + UTC |
| **zod + react-hook-form** | Form Add-SKU-to-BOM, issue-to-WO |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger | Expected Payload / Response |
|---|---|---|---|---|
| GET | `/api/v1/assets/:id` | Identitas + spek + garansi + komisioning | On page load | `{ "data": { "tag": "AST-HVAC-004", "oem": "Daikin Applied Magnitude", "specs": { "capacityTR": 450, "refrigerant": "HFC-134a", "voltage": "480V/3Ø/60Hz" }, "warranty": { "code": "WAR-99214-DK", "until": "2026-11-30" } } }` |
| GET | `/api/v1/assets/:id/telemetry` | Dial + gauge + runtime (polling) | On load + poll 1 dtk | `{ "data": { "healthPct": 88, "grade": "A-", "vibrationInS": 0.18, "deltaTF": 11.2, "suctionPsi": 124, "runtimeH": 32491.4, "availability": 0.992 } }` |
| GET | `/api/v1/assets/:id/timeline` | Jejak audit berfilter | On load + ganti pil filter | Query `?type=all&page=1`. `{ "data": [{ "ref": "PM-2025-0812", "state": "COMPLETED", "parts": [{ "sku": "PART-SEAL-8821", "qty": -2 }] }], "meta": { "total": 54 } }` |
| GET | `/api/v1/assets/:id/bom` | SKU BOM + saldo + valuasi | On load + ganti scope gudang | Query `?warehouse=central`. `{ "data": [{ "sku": "PART-SEAL-8821", "onHand": 1, "allocated": 1, "par": 4, "unitPrice": 1450, "status": "DEFICIT" }], "meta": { "valuation": 34820 } }` |
| GET | `/api/v1/assets/:id/ledger` | Jurnal mutasi immutable | On load + `Load Full…` | `{ "data": [{ "txn": "TXN-2025-88419", "type": "WO_DISPATCH_USAGE", "delta": -2, "balance": 1, "source": "WO-2025-0812" }] }` |
| POST | `/api/v1/assets/:id/bom` | Tambah SKU ke BOM | Submit Add SKU | Body `{ "sku": "PART-…", "par": 4 }` → `{ "data": { "sku": "PART-…" } }` |
| POST | `/api/v1/work-orders` | Quick Dispatch WO (prefill) | On click Quick Dispatch | Body `{ "assetTag": "AST-HVAC-004" }` |
| POST | `/api/v1/purchase-requests` | PR dari baris defisit | On click + PR Request | Body `{ "sku": "PART-SEAL-8821", "qty": 4, "assetTag": "AST-HVAC-004" }` |
| POST | `/api/v1/inventory/issues` | Issue parts ke WO | On click Issue to WO | Body `{ "sku": "PART-FLTR-401", "qty": 2, "workOrderId": "WO-2025-0812" }` |

Contoh `axios` (polling telemetri):

```ts
// TODO: Replace polling mock with GET /api/v1/assets/:id/telemetry (SWR refreshInterval 1000, throttle when tab hidden)
import axios from "axios";
const api = axios.create({ baseURL: "/api/v1" });
export async function fetchTelemetry(assetId: string) {
  const { data } = await api.get(`/assets/${assetId}/telemetry`);
  return data.data as { healthPct: number; vibrationInS: number; deltaTF: number; suctionPsi: number };
}
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/asset-detail.mock.ts`.

```ts
// TODO: Replace hero mock with GET /api/v1/assets/AST-HVAC-004
export const assetHero = {
  tag: "AST-HVAC-004", name: "Centrifugal Industrial Water Chiller 450-TR - Unit 04",
  oem: "Daikin Applied Magnitude", telemetryId: "IOT-CHL-450-04",
  location: ["HQ Campus (East Wing)", "Building B (Central Utilities Plant)", "Basement L2", "Mechanical Room #B-204"],
  specs: { capacityTR: 450, thermalKW: 1582, refrigerant: "HFC-134a 620 lbs", compressor: "Dual Mag-Bearing Oil-Free", power: "480V/3Ø/60Hz FLA 512A" },
  warranty: { code: "WAR-99214-DK", until: "Nov 2026" },
  commissioned: "2019-10-14", designLifeYears: 20,
};

// TODO: Replace telemetry mock with GET /api/v1/assets/AST-HVAC-004/telemetry (poll 1s)
export const assetTelemetry = {
  healthPct: 88, grade: "A-", mtbfH: 1840, mttrH: 3.2,
  vibrationInS: 0.18, deltaTF: 11.2, suctionPsi: 124,
  runtimeH: 32491.4, availability: 0.992,
};

// TODO: Replace BOM mock with GET /api/v1/assets/AST-HVAC-004/bom?warehouse=central
export const assetBom = [
  { sku: "PART-SEAL-8821", desc: "Silicon Carbide Mechanical Shaft Seal 2.5\"", subsystem: "Compressor Core", bin: "Rack C-04 / Bin 12", par: 4, onHand: 1, allocated: 1, unitPrice: 1450, status: "DEFICIT" },
  { sku: "PART-LUB-09", desc: "Synthetic Polyolester Lubricant ISO 68 (5-Gal Pail)", subsystem: "Lubrication", bin: "Cabinet F-02", par: 5, onHand: 3, allocated: 0, unitPrice: 380, status: "BELOW_PAR" },
  { sku: "PART-FLTR-401", desc: "MERV 14 Chilled Water Loop Inline Filter Cartridge", subsystem: "Filtration", bin: "Rack A-01 / Bin 03", par: 8, onHand: 24, allocated: 2, unitPrice: 94.5, status: "OPTIMAL" },
  { sku: "PART-VLV-102", desc: "Electronic Expansion Solenoid Valve 24VAC / Pulse", subsystem: "Electrical / Metering", bin: "Rack D-02 / Bin 09", par: 2, onHand: 3, allocated: 0, unitPrice: 890, status: "OPTIMAL" },
  { sku: "PART-BRG-6204", desc: "SKF Explorer Deep Groove Hybrid Ceramic Ball Bearing 20x47x14mm C3 P6", subsystem: "Aux Drive", bin: "Rack C-01 / Bin 44", par: 4, onHand: 6, allocated: 0, unitPrice: 315, status: "OPTIMAL" },
];

// TODO: Replace ledger mock with GET /api/v1/assets/AST-HVAC-004/ledger
export const stockLedger = [
  { txn: "TXN-2025-88419", at: "2025-02-14 09:15:22", sku: "PART-SEAL-8821", type: "WO_DISPATCH_USAGE", delta: -2, balance: 1, source: "WO-2025-0812", operator: "M. Kowalski" },
  { txn: "TXN-2025-87910", at: "2025-01-29 14:40:11", sku: "PART-FLTR-401", type: "PO_RECEIPT_STOCK_IN", delta: 20, balance: 24, source: "PO-2025-0081", operator: "R. Pratama" },
  { txn: "TXN-2025-86102", at: "2025-01-15 11:05:40", sku: "PART-BRG-6204", type: "TRANSFER_RECEIVED", delta: 4, balance: 6, source: "TO-8891 (Sat-B)", operator: "R. Pratama" },
  { txn: "TXN-2025-84902", at: "2024-12-28 16:20:00", sku: "PART-VLV-102", type: "AUDIT_CYCLE_COUNT", delta: -1, balance: 3, source: "ADJ-2024-Q4", operator: "M. Vance" },
];

// TODO: Create detail page routing for /work-orders/[id] (targets of #WO-… links above)
// TODO: Create detail page routing for /purchasing/[id] (target of #PO-2025-0081 link above)
export function openSourceDocument(ref: string) {
  window.location.assign(`/work-orders/${ref.replace("#", "")}`);
}
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/assets/AST-HVAC-004/bom?warehouse=central', fetcher)
import { assetBom } from "@/mocks/asset-detail.mock";

export function BomTable() {
  return (
    <Table>
      <TableBody>
        {assetBom.map((p) => (
          <TableRow key={p.sku}>
            <TableCell className="font-mono font-bold">{p.sku}</TableCell>
            <TableCell>{p.desc}</TableCell>
            <TableCell className="font-mono">{p.onHand}/{p.par}</TableCell>
            <TableCell><Badge>{p.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian: jurnal immutable hanya di-append (tidak ada PUT/DELETE
mock); timezone respons dinormalisasi ke UTC + WIB saat render.

## 7. Perbandingan Pass-1 vs Pass-2

Dibandingkan dengan `docs/ui-audit/asset-detail.md` (pass-1) setelah audit
independen di atas selesai.

### (a) Temuan pass-1 yang TERKONFIRMASI

- Hero Daikin + tombol salin, dial 88 % Grade A-, 3 gauge (0,18 in/s,
  11,2 °F, 124 PSI), MTBF/MTTR, runtime 32.491,4 jam / 99,2 % —
  **semua cocok**.
- Timeline 3 event (`PM-2025-0812`, `WO-2025-0044`, `INS-2024-4401` +
  `#NBIC-990-2024`), BOM 5 baris + harga ($1.450/$380/$94,50/$890/$315),
  ledger 5 TXN + hash `9e08fc`, 421 transaksi — **semua cocok**.
- 3 sub-tab tanpa konten; dead-end `#WO-2025-0812` ×2, `#PO-2025-0081`,
  `#TO-8891`, `#ADJ-2024-Q4` — **semua dikonfirmasi**.
- OEM Daikin vs Trane + komisioning 2019 vs 2020, campur UTC-5/EST —
  **dikonfirmasi independen**.

### (b) Temuan BARU yang luput di pass-1

1. **Proposal routing sub-tab via query.** `/assets/[id]?tab=iot|pm|docs`
   sebagai alternatif konkret atas usulan route terpisah
   (`/assets/[id]/iot|pm|compliance`) di pass-1 — lebih murah untuk tab
   yang kontennya sehalaman.
2. **Endpoint dossier eksplisit.** `GET /api/v1/assets/:id/dossier` untuk
   tombol `Dossier` PDF — pass-1 memetakan tombolnya (MISSING) tanpa
   endpoint khusus.
3. **Kalibrasi prioritas PO detail.** `#PO-2025-0081` dinilai MEDIUM (sudah
   ter-cover missing purchasing); `/work-orders/[id]` tetap HIGH.

### (c) KOREKSI atas pass-1

Tidak ada kesalahan faktual ditemukan di pass-1. Tidak ada revisi isi;
hanya tambahan (b) di atas.
