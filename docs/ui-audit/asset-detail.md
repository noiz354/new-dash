# UI Audit — Asset Detail & Spare Parts Ledger (`asset_detail_spare_parts_inventory_ledger`)

> Sumber: `stitch_facility_maintenance_platform_ui/asset_detail_spare_parts_inventory_ledger/code.html` (986 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman detail 360° satu aset — `AST-HVAC-004`
(Centrifugal Industrial Water Chiller 450-TR, Unit 04). Ini **satu-satunya
halaman detail** di antara 20 mockup: menggabungkan identitas + spesifikasi,
telemetri hidup, audit trail lifecycle, Bill of Materials (BOM) beserta ledger
spare parts, dan jurnal pergerakan stok immutable — semuanya ter-scoped ke
satu `assetId`.

### Daftar elemen UI utama

1. **Breadcrumb + status + sub-tabs** — `Home / Asset & Resource /
   Asset Registry / AST-HVAC-004 / Centrifugal Water Chiller Unit 4`;
   badge `P1 - Mission Critical Facility Plant`, `Active / Under Monitoring`,
   `Telemetry ID: IOT-CHL-450-04`; tab `Asset 360° & Lifecycle` (aktif),
   `Spare Parts Ledger (18)`, `IoT Diagnostics`, `PM Schedules (12)`,
   `Compliance & Docs`.
2. **Hero identitas aset (7 kolom)** — tag `AST-HVAC-004` + tombol copy,
   merek `Daikin Applied Magnitude®`, `BOM VERIFIED`, `REV-2024.3`; path
   lokasi `HQ Campus (East Wing) › Building B (Central Utilities Plant) ›
   Basement L2 › Mechanical Room #B-204`; grid spesifikasi
   (450 Tons/1.582 kW, `HFC-134a` 620 lbs, Dual Mag-Bearing oil-free,
   `480V / 3Ø / 60Hz` FLA 512 A); kartu garansi
   (`WAR-99214-DK` aktif s.d. Nov 2026 Tier 1 2h) dan komisioning
   (14 Okt 2019, 4,5 tahun, sisa umur 77,5%); toolbar aksi
   (`Quick Dispatch WO`, `Log Inspection`, `Dossier` PDF) + kustodian
   (HVAC Central Plant Team Ops L2).
3. **Panel Health & Telemetry (5 kolom)** — dial `88% OPTIMAL`
   (`Grade A-`, MTBF 1.840 jam, MTTR 3,2 jam, efisiensi 96,4%);
   3 gauge live (`Bearing Vibration 0.18 in/s`, `Evap Delta-T 11.2 °F`,
   `Suction Pressure 124 PSI`, sampling 1 detik); strip runtime
   (`32,491.4 Operating Hours`, `99.2% Uptime`, outage 18,5 jam).
4. **Audit trail lifecycle** — filter pill (`All Events (54)`,
   `Work Orders (14)`, `Inspections (28)`, `Parts Replaced (8)`,
   `Calibration (4)`); 3 event: `PM-2025-0812` overhaul (parts
   `PART-SEAL-8821 (-2)`, `PART-LUB-09 (-2)`, downtime 3,5 jam,
   teknisi M. Kowalski), `WO-2025-0044` spike vibrasi (resolved 1,4 jam,
   J. Chen), `INS-2024-4401` hydrostatic test
   (lulus, sertifikat `#NBIC-990-2024`, R. Davies).
5. **Header BOM + 4 KPI parts** — warehouse scope toggle
   (`Central Distribution Hub (Primary)` / `Building B Satellite Bin`) +
   `Add SKU to BOM`; `Linked BOM SKUs 18`, `Low-Stock 2 SKUs Alerting`
   (`PART-SEAL-8821` deficit), `Stored BOM Valuation $34,820.00` (WAC),
   `Replenishment POs 2 In-Transit` (`PO-2025-0144` ETA 20 Feb 2025).
6. **Tabel BOM (9 kolom, 5 dari 18)** — SKU, subsystem, bin, par, on-hand,
   allocated, unit/value, status, aksi. Baris: `PART-SEAL-8821`
   (CRITICAL, par 4 / on-hand 1 / allocated 1 `WO-0812`, `$1,450.00`,
   `STOCK DEFICIT (0 NET)`, `PO-2025-0144 +4 In-Transit`, aksi
   `+ PR Request`), `PART-LUB-09` (BELOW PAR, 5/3/0, `$380.00`,
   `+ Quick PO`), `PART-FLTR-401` (OPTIMAL 8/24/2, `$94.50`),
   `PART-VLV-102` (OPTIMAL 2/3/0, `$890.00`), `PART-BRG-6204` (OPTIMAL
   4/6/0, `$315.00`); footer hash `SHA-256: 9e08fc...18a` + pagination.
7. **Immutable Stock Movement Ledger** — badge `Auto-Reconciliation Active`;
   8 kolom (Transaction ID, Timestamp UTC-5, SKU, Type, Qty Delta, Running
   Balance, Source Document, Operator). 5 entri dari total 421:
   `TXN-2025-88419` (`PART-SEAL-8821` −2, `WO DISPATCH USAGE`,
   → `#WO-2025-0812`, M. Kowalski), `TXN-2025-88390` (`PART-LUB-09` −2 pails,
   → `#WO-2025-0812`), `TXN-2025-87910` (`PART-FLTR-401` +20,
   `PO RECEIPT STOCK-IN`, → `#PO-2025-0081`, R. Pratama),
   `TXN-2025-86102` (`PART-BRG-6204` +4, `TRANSFER RECEIVED`,
   → `#TO-8891 (Sat-B)`), `TXN-2025-84902` (`PART-VLV-102` −1,
   `AUDIT CYCLE COUNT`, → `#ADJ-2024-Q4`, M. Vance);
   tombol `Load Full Historical Ledger (CSV / HTMX Stream)`.

### State UI

- **Empty state:** timeline kosong → "Belum ada event lifecycle"; BOM tanpa
  SKU → CTA `Add SKU to BOM`; movement ledger kosong → hash tetap tampil
  dengan pesan "Belum ada transaksi".
- **Loading state:** skeleton hero (dial + gauge), skeleton baris BOM dan
  ledger; badge `SAMPLING` menunjukkan `CONNECTING…` saat telemetri
  reconnect.
- **Error state:** gauge basi menandai `STALE`; aksi `Issue to WO` /
  `+ PR Request` gagal → toast + stok tidak berubah; warehouse scope gagal
  dimuat → fallback ke hub primer + banner.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path` identik). Semua `href="#"` —
target di bawah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar 15 item | Route §2 `navigation-audit.md`; halaman ini `/assets/[id]` (tanpa item sidebar sendiri, dibuka dari registry) |
| Breadcrumb `Asset Registry` | `/assets` (kembali ke daftar) — EXISTS |
| Sub-tab `Asset 360° & Lifecycle` | Tab inline aktif — EXISTS |
| Sub-tab `Spare Parts Ledger` | Scroll ke section BOM di halaman ini (atau `?tab=bom`) — EXISTS (parsial) |
| Sub-tab `IoT Diagnostics` | Konten/tab diagnostik khusus — MISSING (tab tanpa isi) |
| Sub-tab `PM Schedules (12)` | Daftar 12 jadwal PM aset ini — MISSING (tab tanpa isi) |
| Sub-tab `Compliance & Docs` | Dokumen kepatuhan/sertifikat — MISSING (tab tanpa isi) |
| `Quick Dispatch WO` | Modal WO prefill `?asset=AST-HVAC-004` (`POST /api/v1/work-orders`) — MISSING |
| `Log Inspection` | Form inspeksi prefill aset — MISSING |
| `Dossier` (PDF) | Unduh dossier aset — MISSING |
| Tombol copy tag | Aksi clipboard (bukan navigasi) — OK |
| `#WO-2025-0812` + `open_in_new` (×2, TXN 1–2) | `/work-orders/[id]` — MISSING (dead-end utama) |
| `#PO-2025-0081` (TXN 3) | `/purchasing/[id]` — MISSING |
| `#TO-8891 (Sat-B)` (TXN 4) | Detail transfer antar-gudang — MISSING |
| `#ADJ-2024-Q4` (TXN 5) | Detail adjustment cycle-count — MISSING |
| `+ PR Request` / `+ Quick PO` (baris BOM) | Flow PR/PO prefill SKU (`/purchasing/new?sku=`) — MISSING |
| `Issue to WO` (baris optimal) | Modal issue parts ke WO — MISSING |
| `Add SKU to BOM` | Modal tambah SKU (`POST /api/v1/assets/:id/bom`) — MISSING |
| `Load Full Historical Ledger` | Export CSV / stream penuh — MISSING (parsial) |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — link `#WO-2025-0812` muncul 2× di ledger
   tanpa tujuan; sama dengan dead-end global no. 1.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **`/purchasing/[id]` (HIGH)** — `#PO-2025-0081` menggantung (ikut
   `navigation-audit.md` §4 no. 3).
   `// TODO: Create detail page routing for /purchasing/[id]`
3. **Detail Transfer & Adjustment (MEDIUM)** — `#TO-8891` dan `#ADJ-2024-Q4`
   butuh halaman/ drawer detail (`/inventory/transfers/[id]`,
   `/inventory/adjustments/[id]`) atau tab di `/inventory`.
4. **Isi 3 sub-tab (MEDIUM)** — `IoT Diagnostics`, `PM Schedules (12)`,
   `Compliance & Docs` tampil sebagai tab tetapi kontennya tidak ada di
   mockup; definisikan apakah tab inline, section scroll, atau route
   (`/assets/[id]/iot`, `/assets/[id]/pm`, `/assets/[id]/compliance`).
5. **Modal aksi BOM (MEDIUM)** — `Add SKU to BOM`, `Issue to WO`,
   `+ PR Request` / `+ Quick PO` butuh endpoint + flow persetujuan.
6. **Modal `Quick Dispatch WO` / `Log Inspection` (MEDIUM)** — prefill flow
   `?asset=` (ikut §4 no. 8 global).

> Konsisten dengan `navigation-audit.md`: baris asset-detail §3
> (`#WO-2025-0812 ×2`, `#PO-2025-0081`, `#TO-8891`, `#ADJ-2024-Q4`),
> missing §4 no. 1–3 dan prefill no. 8.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + token inline; font Inter +
  JetBrains Mono + Material Symbols Outlined; dial/gauge digambar SVG inline;
  satu handler `onclick="navigator.clipboard.writeText(...)"`; tanpa routing.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/assets/[id]`; typing `AssetDetail`, `BomLine`, `StockMovement`. |
| **Tailwind CSS (build)** | Hero 7/5, timeline, tabel BOM 9 kolom, ledger; token sistem A. |
| **shadcn/ui** — `Tabs`, `Card`, `Badge`, `Table`, `Progress`, `Avatar`, `Input`, `Select`, `Dialog`, `Skeleton`, `Toast`, `ScrollArea` | Sub-tabs, kartu hero/health, tabel BOM + ledger, avatar operator, modal aksi, skeleton gauge. |
| **lucide-react** | Pengganti Material Symbols (visibility, inventory, monitoring, history, warehouse, receipt). |
| **Recharts** (opsional) | Riwayat telemetri bila tab IoT dibangun (ganti gauge statis). |
| **SWR / TanStack Query** | Polling gauge 1 detik (throttlenioskus) + refresh ledger; `useSWRMutation` untuk issue/PR/PO. |
| **axios** | HTTP client `/api/v1` + interceptor auth. |
| **date-fns + date-fns-tz** | Timestamp `UTC-5` ledger vs `UTC` timeline — normalisasi ke satu zona. |
| **zod + react-hook-form** | Validasi Add SKU / Issue / PR / Quick PO. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/assets/:id` | On page load (hero + garansi + komisioning) | Response: `{ "data": { "id": "AST-HVAC-004", "name": "Centrifugal Industrial Water Chiller 450-TR - Unit 04", "brand": "Daikin Applied Magnitude", "bomRev": "REV-2024.3", "locationId": "LOC-B2-MECH-204", "telemetryId": "IOT-CHL-450-04", "specs": { "capacityTr": 450, "refrigerant": "HFC-134a", "chargeLbs": 620, "supply": "480V/3P/60Hz", "flaAmps": 512 }, "warranty": { "code": "WAR-99214-DK", "activeThru": "2026-11-30" }, "commissionedAt": "2019-10-14", "custodian": "HVAC Central Plant Team (Ops L2)" } }` |
| GET | `/api/v1/assets/:id/telemetry` | On page load + polling 1s (panel health) | Response: `{ "data": { "healthPct": 88, "grade": "A-", "mtbfHours": 1840, "mttrHours": 3.2, "vibrationInS": 0.18, "deltaTF": 11.2, "suctionPsi": 124, "runtimeHours": 32491.4, "uptimePct": 0.992 } }` |
| GET | `/api/v1/assets/:id/timeline` | On page load + ganti filter pill | Query: `?type=all&page=1`. Response: `{ "data": [{ "ref": "PM-2025-0812", "at": "2025-02-14T08:30:00-05:00", "title": "Scheduled Preventive Maintenance", "status": "COMPLETED", "partsUsed": [{ "sku": "PART-SEAL-8821", "qty": -2 }] }], "meta": { "total": 54 } }` |
| GET | `/api/v1/assets/:id/bom` | On page load + ganti warehouse scope/search | Query: `?warehouseId=central-hub&q=&subsystem=`. Response: `{ "data": [{ "sku": "PART-SEAL-8821", "desc": "Silicon Carbide Mechanical Shaft Seal 2.5in", "subsystem": "COMPRESSOR_CORE", "bin": "Rack C-04 / Bin 12", "par": 4, "onHand": 1, "allocated": 1, "unitPrice": 1450 }], "meta": { "total": 18, "valuation": 34820, "alerts": 2 } }` |
| GET | `/api/v1/assets/:id/movements` | On page load + `Load Full Historical Ledger` | Query: `?limit=5&cursor=`. Response: `{ "data": [{ "id": "TXN-2025-88419", "at": "2025-02-14T09:15:22-05:00", "sku": "PART-SEAL-8821", "type": "WO_DISPATCH_USAGE", "qtyDelta": -2, "balance": 1, "sourceDoc": "WO-2025-0812", "operator": "M. Kowalski" }], "meta": { "total": 421, "hash": "sha256:9e08fc…18a" } }` |
| POST | `/api/v1/work-orders` | On submit `Quick Dispatch WO` | Body: `{ "assetId": "AST-HVAC-004", "priority": "P1", "summary": "…" }`. Response: `{ "data": { "id": "WO-2026-0895" } }` |
| POST | `/api/v1/inspections` | On submit `Log Inspection` | Body: `{ "assetId": "AST-HVAC-004", "templateId": "TMPL-HVAC-CHL-02", "result": "PASS" }`. Response: `{ "data": { "id": "INS-2026-4402" } }` |
| GET | `/api/v1/assets/:id/dossier` | On click `Dossier` (unduh PDF) | Response: berkas PDF (`content-type: application/pdf`). |
| POST | `/api/v1/assets/:id/bom` | On submit `Add SKU to BOM` | Body: `{ "sku": "PART-SEAL-8821", "par": 4, "bin": "Rack C-04 / Bin 12" }`. Response: `{ "data": { "sku": "PART-SEAL-8821", "linked": true } }` |
| POST | `/api/v1/inventory/:sku/issue` | On click `Issue to WO` | Body: `{ "qty": 2, "workOrderId": "WO-2025-0812" }`. Response: `{ "data": { "sku": "PART-FLTR-401", "balance": 22 } }` |
| POST | `/api/v1/purchase-requests` | On click `+ PR Request` (baris kritis) | Body: `{ "sku": "PART-SEAL-8821", "qty": 4, "assetId": "AST-HVAC-004" }`. Response: `{ "data": { "id": "PR-2026-0315" } }` |
| POST | `/api/v1/purchase-orders/quick` | On click `+ Quick PO` | Body: `{ "sku": "PART-LUB-09", "qty": 5 }`. Response: `{ "data": { "id": "PO-2026-0316" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/asset-detail.mock.ts`.

```ts
// TODO: Replace hero mock with GET /api/v1/assets/AST-HVAC-004
export const assetHero = {
  id: "AST-HVAC-004", name: "Centrifugal Industrial Water Chiller 450-TR - Unit 04",
  brand: "Daikin Applied Magnitude", bomRev: "REV-2024.3",
  telemetryId: "IOT-CHL-450-04",
  locationPath: ["HQ Campus (East Wing)", "Building B (Central Utilities Plant)", "Basement L2", "Mechanical Room #B-204"],
  warranty: { code: "WAR-99214-DK", activeThru: "Nov 2026" },
};

// TODO: Replace telemetry mock with GET /api/v1/assets/AST-HVAC-004/telemetry (poll 1s)
export const assetTelemetry = {
  healthPct: 88, grade: "A-", vibrationInS: 0.18, deltaTF: 11.2, suctionPsi: 124,
  runtimeHours: 32491.4, uptimePct: 0.992,
};

// TODO: Replace timeline mock with GET /api/v1/assets/AST-HVAC-004/timeline?type=all
export const assetTimeline = [
  { ref: "PM-2025-0812", at: "14 Feb 2025", title: "Scheduled Preventive Maintenance (Semi-Annual Overhaul)", status: "COMPLETED" },
  { ref: "WO-2025-0044", at: "03 Jan 2025", title: "IoT Telemetry Spike Alert & Corrective Bearing Lube", status: "RESOLVED" },
  { ref: "INS-2024-4401", at: "18 Nov 2024", title: "Annual Statutory Pressure Vessel Shell Hydrostatic Test", status: "PASS" },
];

// TODO: Replace BOM mock with GET /api/v1/assets/AST-HVAC-004/bom?warehouseId=central-hub
export const assetBom = [
  { sku: "PART-SEAL-8821", desc: "Silicon Carbide Mechanical Shaft Seal 2.5in", par: 4, onHand: 1, allocated: 1, unitPrice: 1450, status: "DEFICIT" },
  { sku: "PART-LUB-09", desc: "Synthetic Polyolester Lubricant ISO 68 (5-Gal Pail)", par: 5, onHand: 3, allocated: 0, unitPrice: 380, status: "BELOW_PAR" },
  // TODO: picks — PART-FLTR-401, PART-VLV-102, PART-BRG-6204 dari code.html
];

// TODO: Replace movements mock with GET /api/v1/assets/AST-HVAC-004/movements?limit=5
export const stockMovements = [
  { id: "TXN-2025-88419", sku: "PART-SEAL-8821", type: "WO_DISPATCH_USAGE", qtyDelta: -2, balance: 1, sourceDoc: "WO-2025-0812" },
  { id: "TXN-2025-87910", sku: "PART-FLTR-401", type: "PO_RECEIPT_STOCK_IN", qtyDelta: 20, balance: 24, sourceDoc: "PO-2025-0081" },
  { id: "TXN-2025-86102", sku: "PART-BRG-6204", type: "TRANSFER_RECEIVED", qtyDelta: 4, balance: 6, sourceDoc: "TO-8891" },
  { id: "TXN-2025-84902", sku: "PART-VLV-102", type: "AUDIT_CYCLE_COUNT", qtyDelta: -1, balance: 3, sourceDoc: "ADJ-2024-Q4" },
];

// TODO: Create detail page routing for /work-orders/[id] (link #WO-2025-0812 ×2 mati)
// TODO: Create detail page routing for /purchasing/[id] (link #PO-2025-0081 mati)
// TODO: Define transfer/adjustment detail for #TO-8891 and #ADJ-2024-Q4
// TODO: Define content for tabs IoT Diagnostics, PM Schedules, Compliance & Docs
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/assets/AST-HVAC-004/movements?limit=5', fetcher)
import { stockMovements } from "@/mocks/asset-detail.mock";

export function MovementLedger() {
  return (
    <Table>
      <TableBody>
        {stockMovements.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="font-mono font-bold">{t.id}</TableCell>
            <TableCell className="font-mono">{t.sku}</TableCell>
            <TableCell className="font-mono">{t.qtyDelta > 0 ? `+${t.qtyDelta}` : t.qtyDelta}</TableCell>
            {/* TODO: link sourceDoc ke /work-orders/[id] setelah route ada */}
            <TableCell className="font-mono text-muted-foreground">{t.sourceDoc}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **OEM ganda untuk `AST-HVAC-004`.** Di sini `Daikin Applied Magnitude®`
   (`WAR-99214-DK`, komisioning 14 Okt 2019); di `asset_registry_*`
   `Trane EarthWise CVHE` (`ID: TRN-2020-0442`, komisioning Okt 2020,
   garansi `EXPIRED 14 Oct 2023`). Lihat Temuan no. 1
   `docs/ui-audit/asset-registry.md`.
2. **Skor kesehatan beda.** Di sini `88% OPTIMAL Grade A-`; registry menulis
   `68/100 NEEDS OVERHAUL`; `facility_*` menulis `88.4%`. Satu sumber
   `health.score` wajib disepakati.
3. **Dua WO berbeda untuk kebocoran seal yang sama.** Ledger di sini memakai
   `#WO-2025-0812` (×2) dan `#WO-2025-0044`; registry + facility + inventory
   + purchasing + vendors memakai `WO-2026-0894` untuk "Chiller #04 Shaft
   Seal Refrigerant Leak". Normalisasi ke satu sequence WO saat seeding.
4. **Stok `PART-SEAL-8821` beda antar-layar.** BOM di sini: on-hand 1,
   allocated 1 (net 0), par 4; `inventory_*`: on-hand 2 ea, reserved 1,
   available 1, min 4. Selisih 1 unit + satuan (`pc` vs `ea`).
5. **Zona waktu campur.** Ledger memakai `Timestamp (UTC-5)` sedangkan
   timeline memakai `EST`/UTC tanpa konversi eksplisit — samakan ke UTC +
   format lokal di klien.
6. **Tab tanpa konten.** `IoT Diagnostics`, `PM Schedules (12)`,
   `Compliance & Docs` tampil tetapi isinya tidak dimockupkan sama sekali.
