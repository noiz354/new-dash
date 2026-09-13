# UI Audit — Inventory & Spare Parts Ledger (`inventory_spare_parts_management_ledger`)

> Sumber: `stitch_facility_maintenance_platform_ui/inventory_spare_parts_management_ledger/code.html` (726 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Buku besar inventory lintas gudang: memantau valuasi katalog **4.218 SKU**
(model FIFO), kesehatan ketersediaan, 14 flag low-stock, dan arus mutasi
bulanan — lalu mengeksekusi mutasi lewat **Transfer & Mutation Desk**
(transfer antar-hub atau rekonsiliasi cycle-count dengan persetujuan
ber-PIN). Fokus aktif: `PART-SEAL-8821` (kritis, terkait
`WO-2026-0894` / `AST-HVAC-004`).

### Daftar elemen UI utama

1. **Breadcrumb + badge hub** — `Home / Asset & Resource /
   Inventory & Spare Parts Ledger` + `HTMX Sync: Realtime`,
   `Hub: Central Crib (Bldg B)`; judul `Spare Parts & Consumables Ledger`
   + badge `SKU-REG v4.2`; aksi `Export (CSV/XLS)`, `Print QR / Barcode`,
   `+ Receive Stock (PO / GRN)` (primary).
2. **KPI 4 kartu** — `Catalog Valuation $1,428,650.00` (FIFO, 4.218 SKUs,
   +4,8% kapitalisasi kuartal); `Stock Availability Health 94.2%`
   (WO Reserved: 38 Critical SKUs); `Low Stock & Reorder Triggers 14`
   (`7 PO Drafts Auto-Queued`, 2 In-Transit); `Monthly Stock Movement 1,840`
   (+1.240 In / −560 Out / 40 Trf, turnover 3,8x L30D).
3. **Filter katalog** — search SKU/nama/OEM/bin (`Ctrl + /`), tombol
   `Advanced` + `tune`; select `Warehouse Hub` (Central Crib - Bldg B aktif,
   Substation Locker 4B, Cleanroom Cage C-04, All Consolidated),
   `Part Category` (All 4.218, HVAC 842, Electrical 612, Lubricants 248,
   Filters 1.150), `Inventory Threshold` (Critical < Safety, Below ROP,
   Optimal).
4. **Tabel stok 9 kolom (6 dari 4.218)** — SKU & spec, Bin/Hub, On Hand,
   Reserved, Available, Min/ROP, Status, Actions + checkbox. Baris:
   `PART-SEAL-8821` (CRIB-B / Bin C-04; 2 ea / reserved 1 ea 🔒 /
   available 1 ea / min 4; `CRITICAL (1/4)`); `PART-LUB-09`
   (CRIB-CHEM / Rack 02; 6 / 2 / 4 pails, min 5, `BELOW ROP (4/5)`);
   `PART-FLTR-401` (SUB-LCK-4B / Bay 01; 48 / 4 / 44 pcs, min 12, OPTIMAL);
   `PART-BRG-6205` (CRIB-B / Shelf A-12; 18 / 0 / 18, min 6, OPTIMAL);
   `PART-VALV-GT2` (CRIB-PIPE / Bin 08; 12 / 2 / 10, min 4, OPTIMAL);
   `PART-FUSE-600V` (ELEC-VAULT / Drw 03; 3 / 2 🔒 / 1 pc, min 10,
   `CRITICAL (1/10)`). Aksi baris: `Draft PO`, `Transfer / Issue`,
   `Details`. Footer (`1 - 6 of 4,218`, Rows 25, 704 halaman).
5. **Movement Ledger feed** — pill filter (`All (1,840)`, `Receipts (+)`,
   `WO Out (-)`, `Adjust (±)`, `Transfers`) + badge `Live Audit Bus`;
   5 event: `−1 ea WO-2026-0894 · AST-HVAC-004` (`PART-SEAL-8821`,
   ke M. Kowalski, `auth:mvance`); `+100 pcs PO-2026-0298 · GRN Rec`
   (`PART-FLTR-401`, Trane Supply Co, `dock:bay-02`, Barcode Verified);
   `−2 pails PM-PLN-0104 · Quarterly PM` (`PART-LUB-09`, HVAC Shift Team A);
   `+5 ea [TRF] TRF-2026-0044` (`PART-VALV-GT2`, North Depot → Central,
   waybill #772); `−2 pcs [ADJ] ADJ-2026-0019` (`PART-FUSE-600V`,
   scrap VP Ops, `cc:QA-SCRAP`); stempel `sha256:d8a2..f041 Synced`.
6. **Transfer & Mutation Desk** — badge `HTMX Form`; tab mode
   (`⇄ Inter-Hub Transfer` aktif / `± Cycle Reconciliation`); banner fokus
   (`PART-SEAL-8821 Shaft Seal 2.5"`, `1 ea Avail` Central); form:
   Mutation Reason (Transfer to Sub-Warehouse Field Stage / Scrap /
   Cycle Count Variance / Emergency Borrow), Source readonly
   (`Central Crib - Bldg B Bin C-04`), Destination select
   (Substation Locker 4B / Cleanroom Cage C-04 / Mobile Van 03 / Quarantine),
   stepper qty (1) + `Balance Post-Transfer: 0 Available in Crib-B`,
   Associated WO (`WO-2026-0894 (AST-HVAC-004)`), approver
   (Marcus Vance, `PIN Verified`); tombol `Cancel` /
   `Confirm & Post Mutation` (form `onsubmit preventDefault` — mock).

### State UI

- **Empty state:** pencarian tanpa SKU → "SKU tidak ditemukan" + `Clear`;
  feed ledger kosong → "Belum ada mutasi pada filter ini"; desk tanpa fokus
  SKU → "Pilih baris katalog untuk memulai mutasi".
- **Loading state:** skeleton baris katalog + feed; kirim mutasi memakai
  status tombol (`Posting…`) tanpa mengubah layout form.
- **Error state:** validasi qty melebihi available → error inline +
  tombol nonaktif; mutasi ditolak approver → toast + form tetap terisi;
  sync ledger gagal → badge `Live Audit Bus` merah + tombol `Retry Sync`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path` identik). Semua `href="#"` —
target di bawah route usulan (lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar 15 item | Route §2 `navigation-audit.md`; item `inventory-and-parts-ledger` aktif = halaman ini (`/inventory`) |
| Breadcrumb `Home / Asset & Resource / …` | `Home` → `/`; grup bukan route |
| `+ Receive Stock (PO / GRN)` | Flow penerimaan GRN (modal atau `/inventory/receive?po=`) — MISSING |
| `Export (CSV/XLS)` | Async job export katalog — MISSING (parsial) |
| `Print QR / Barcode` | Print view label — MISSING |
| `Draft PO` (baris kritis) | `/purchasing/new?type=PO&sku=PART-SEAL-8821` (prefill) — MISSING |
| `Transfer / Issue` (baris) | Set fokus SKU di Mutation Desk (state inline) — EXISTS (section) |
| `Details` (baris optimal) | Detail SKU `/inventory/[sku]` — MISSING (tidak ada mockup) |
| Referensi `WO-2026-0894` (reserved title, feed, associated WO) | `/work-orders/[id]` — MISSING |
| Referensi `PO-2026-0298` (feed GRN) | `/purchasing/[id]` — MISSING |
| Referensi `PM-PLN-0104` (feed PM) | `/preventive-maintenance/[id]` — MISSING |
| Referensi `TRF-2026-0044` / `ADJ-2026-0019` | Detail transfer/adjustment (`/inventory/transfers/[id]`, `/inventory/adjustments/[id]`) — MISSING |
| Tab `Cycle Reconciliation` | Mode form rekonsiliasi inline — EXISTS (tab form) |
| `Confirm & Post Mutation` | Aksi `POST /api/v1/inventory/mutations`, tetap di halaman — OK (aksi) |
| Filter warehouse/kategori/threshold, search, pagination | Query params (`?warehouseId=&category=&threshold=&q=&page=`), bukan navigasi |
| Ikon `notifications` (header) | `/notifications` — EXISTS |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Detail SKU `/inventory/[sku]` (MEDIUM)** — tombol `Details` di tiap
   baris optimal tidak punya tujuan; definisikan halaman atau drawer
   (kartu stok, riwayat mutasi, BOM linkage, vendor).
2. **Flow Receive Stock / GRN (MEDIUM)** — CTA primer `+ Receive Stock
   (PO / GRN)` menggantung; hubungkan ke meja receiving
   (`/purchasing` Dock Desk) atau route `/inventory/receive`.
3. **Detail dokumen sumber (MEDIUM)** — `WO-2026-0894`, `PO-2026-0298`,
   `PM-PLN-0104`, `TRF-2026-0044`, `ADJ-2026-0019` semuanya mati; ikut
   missing global (`/work-orders/[id]`, `/purchasing/[id]`, transfer/
   adjustment detail — lihat Temuan `asset-detail.md` no. 3).
   `// TODO: Create detail page routing for /work-orders/[id] and /purchasing/[id]`
   `// TODO: Define transfer/adjustment detail routes (/inventory/transfers/[id], /inventory/adjustments/[id])`
4. **Prefill `Draft PO` (MEDIUM)** — butuh `/purchasing/new?sku=` (ikut pola
   prefill §4 no. 8 global).
5. **Print QR/Barcode (LOW)** — ikut daftar print global §4 no. 12.

> Konsisten dengan `navigation-audit.md`: route §2 no. 9 (`/inventory`),
> missing §4 no. 1–3, prefill no. 8.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + token inline; Inter + JetBrains
  Mono + Material Symbols; badge `HTMX Sync: Realtime` hanya label
  (tidak ada request HTMX nyata kecuali klaim visual); form desk memakai
  `onsubmit="event.preventDefault()"`.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/inventory` (+ `/inventory/[sku]` bila diputuskan); typing `SkuStock`, `StockMovement`, `MutationDraft`. |
| **Tailwind CSS (build)** | Grid 7/5, tabel dense 9 kolom, feed, desk; token sistem A. |
| **shadcn/ui** — `Table`, `Badge`, `Input`, `Select`, `Tabs`, `Card`, `Dialog`, `Popover`, `Skeleton`, `Toast`, `ScrollArea` | Katalog, pill filter ledger, select warehouse/kategori, tab mode desk, stepper qty, dialog Receive/Details, toast mutasi. |
| **lucide-react** | Pengganti Material Symbols (qr-code-scanner, swap-horizontal, receipt, lock, barcode). |
| **SWR / TanStack Query** | Polling feed ledger (`refreshInterval` pendek) + invalidasi tabel setelah `Confirm & Post Mutation` (`useSWRMutation`). |
| **axios** | HTTP client `/api/v1`. |
| **zod + react-hook-form** | Validasi desk (qty ≤ available, destination ≠ source, WO wajib untuk issue, PIN approver). |
| **date-fns** | Timestamp feed (`Today 14:32 UTC`, `May 18 09:12 UTC`). |
| **Intl.NumberFormat** | `$1,428,650.00`, satuan (`ea`, `pails`, `pcs`). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/inventory/summary` | On page load (4 KPI) | Response: `{ "data": { "valuation": 1428650, "model": "FIFO", "skuCount": 4218, "availabilityPct": 0.942, "woReservedCritical": 38, "lowStockFlags": 14, "poDraftsQueued": 7, "inTransit": 2, "movements30d": { "in": 1240, "out": 560, "transfers": 40 }, "turnoverX": 3.8 } }` |
| GET | `/api/v1/inventory` | On page load + search/filter/pagination | Query: `?q=&warehouseId=central-crib&category=all&threshold=all&page=1&perPage=25`. Response: `{ "data": [{ "sku": "PART-SEAL-8821", "name": "Silicon Carbide Shaft Seal 2.5in", "bin": "CRIB-B / Bin C-04", "onHand": 2, "uom": "ea", "reserved": 1, "reservedFor": "WO-2026-0894", "available": 1, "min": 4, "status": "CRITICAL" }], "meta": { "total": 4218, "page": 1 } }` |
| GET | `/api/v1/warehouses` | On page load (select Warehouse Hub) | Response: `{ "data": [{ "id": "central-crib", "name": "Central Crib - Bldg B" }, { "id": "sub-4b", "name": "Substation Locker 4B" }] }` |
| GET | `/api/v1/inventory/movements` | On page load + polling + ganti pill filter | Query: `?type=all&limit=10`. Response: `{ "data": [{ "delta": -1, "uom": "ea", "ref": "WO-2026-0894", "assetId": "AST-HVAC-004", "at": "2026-09-13T14:32:00Z", "sku": "PART-SEAL-8821", "to": "M. Kowalski (Lead Tech)", "auth": "mvance" }], "meta": { "total": 1840, "hash": "sha256:d8a2..f041" } }` |
| POST | `/api/v1/inventory/mutations` | On submit `Confirm & Post Mutation` | Body: `{ "sku": "PART-SEAL-8821", "mode": "TRANSFER", "reason": "TRANSFER_TO_SUB_WAREHOUSE", "source": "central-crib/C-04", "destination": "sub-4b", "qty": 1, "workOrderId": "WO-2026-0894", "approverPin": "••••" }`. Response: `{ "data": { "id": "TRF-2026-0045", "balancePost": 0 } }` |
| POST | `/api/v1/inventory/reconciliations` | On submit mode `Cycle Reconciliation` | Body: `{ "sku": "PART-FUSE-600V", "countedQty": 1, "reason": "CYCLE_COUNT_VARIANCE" }`. Response: `{ "data": { "id": "ADJ-2026-0020" } }` |
| POST | `/api/v1/purchase-orders/draft` | On click `Draft PO` | Body: `{ "sku": "PART-SEAL-8821", "qty": 3 }`. Response: `{ "data": { "id": "PO-2026-0317", "status": "DRAFT" } }` |
| POST | `/api/v1/goods-receipts` | On submit flow `Receive Stock` | Body: `{ "purchaseOrderId": "PO-2026-0298", "lines": [{ "sku": "PART-FLTR-401", "qty": 100 }] }`. Response: `{ "data": { "id": "GRN-9941" } }` |
| POST | `/api/v1/exports/inventory` | On click `Export (CSV/XLS)` | Body: `{ "format": "CSV", "warehouseId": "central-crib" }`. Response: `{ "data": { "jobId": "EXP-5512" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/inventory.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/inventory/summary
export const inventorySummary = {
  valuation: 1428650, model: "FIFO", skuCount: 4218,
  availabilityPct: 0.942, woReservedCritical: 38,
  lowStockFlags: 14, poDraftsQueued: 7, inTransit: 2,
  movements30d: { in: 1240, out: 560, transfers: 40 }, turnoverX: 3.8,
};

// TODO: Replace catalog mock with GET /api/v1/inventory?warehouseId=central-crib&page=1
export const skuCatalog = [
  { sku: "PART-SEAL-8821", name: "Silicon Carbide Shaft Seal 2.5in", bin: "CRIB-B / Bin C-04", onHand: 2, uom: "ea", reserved: 1, reservedFor: "WO-2026-0894", available: 1, min: 4, status: "CRITICAL" },
  { sku: "PART-LUB-09", name: "Synthetic POE Refrigerant Lubricant ISO 68", bin: "CRIB-CHEM / Rack 02", onHand: 6, uom: "pails", reserved: 2, available: 4, min: 5, status: "BELOW_ROP" },
  { sku: "PART-FLTR-401", name: "MERV 14 Chilled Air Filter Cartridge", bin: "SUB-LCK-4B / Bay 01", onHand: 48, uom: "pcs", reserved: 4, available: 44, min: 12, status: "OPTIMAL" },
  // TODO: picks — PART-BRG-6205, PART-VALV-GT2, PART-FUSE-600V dari code.html
];

// TODO: Replace feed mock with GET /api/v1/inventory/movements?type=all (poll via SWR)
export const movementFeed = [
  { delta: -1, uom: "ea", ref: "WO-2026-0894", assetId: "AST-HVAC-004", at: "Today 14:32 UTC", sku: "PART-SEAL-8821" },
  { delta: 100, uom: "pcs", ref: "PO-2026-0298", at: "Today 11:15 UTC", sku: "PART-FLTR-401", vendor: "Trane Supply Co" },
  { delta: -2, uom: "pails", ref: "PM-PLN-0104", at: "Yest 16:40 UTC", sku: "PART-LUB-09" },
  { delta: 5, uom: "ea", ref: "TRF-2026-0044", at: "May 18 09:12 UTC", sku: "PART-VALV-GT2" },
  { delta: -2, uom: "pcs", ref: "ADJ-2026-0019", at: "May 17 18:00 UTC", sku: "PART-FUSE-600V" },
];

// TODO: Replace desk submit with POST /api/v1/inventory/mutations (mode TRANSFER) or /reconciliations (mode CYCLE)
export const mutationDeskDefault = {
  sku: "PART-SEAL-8821", mode: "TRANSFER", qty: 1,
  source: "Central Crib - Bldg B (Bin C-04)", destination: "Substation Locker 4B (Bldg B - L1)",
  workOrderId: "WO-2026-0894 (AST-HVAC-004)", approver: "Marcus Vance (VP Ops)",
};

// TODO: Create detail route /inventory/[sku] untuk tombol Details
// TODO: Define transfer/adjustment detail routes (/inventory/transfers/[id], /inventory/adjustments/[id])
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/inventory?warehouseId=central-crib&page=1', fetcher)
import { skuCatalog } from "@/mocks/inventory.mock";

export function SkuCatalogTable({ onFocus }: { onFocus: (sku: string) => void }) {
  return (
    <Table>
      <TableBody>
        {skuCatalog.map((s) => (
          <TableRow key={s.sku} onClick={() => onFocus(s.sku)}>
            <TableCell className="font-mono font-bold">{s.sku}</TableCell>
            <TableCell>{s.name}</TableCell>
            <TableCell className="font-mono">{s.available} {s.uom}</TableCell>
            <TableCell><Badge>{s.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **SKU bearing beda.** Di sini `PART-BRG-6205` (Deep Groove SKF 25×52×15mm,
   18 pcs); BOM `asset_detail_*` memakai `PART-BRG-6204` (SKF Explorer
   20×47×14mm, 6 pcs, +4 via `#TO-8891`). Samakan master SKU saat seeding.
2. **Saldo `PART-SEAL-8821` beda.** Di sini on-hand 2 ea / reserved 1 /
   available 1; BOM asset detail: on-hand 1 pc / allocated 1 (net 0).
   Lihat Temuan `asset-detail.md` no. 4.
3. **Saldo `PART-LUB-09` dan `PART-FLTR-401` beda.** Di sini 6 pails dan
   48 pcs; BOM asset detail 3 pails dan 24 pcs. Kemungkinan beda scope
   warehouse (Central Crib vs Central Distribution Hub) — tegaskan
   `warehouseId` per angka saat rebuild, jangan rata-rata diam-diam.
4. **ID rencana PM beda format.** Feed memakai `PM-PLN-0104` (Quarterly PM)
   sedangkan asset detail memakai `PM-2025-0812` — samakan pola
   penomoran (`PM-YYYY-####`).
5. **Konsistensi positif lintas layar (dicatat agar dipertahankan).**
   Penerimaan `+100 pcs PART-FLTR-401` via `PO-2026-0298` (Trane Supply Co,
   Dock Bay 02) sama persis di `purchasing_*` (Dock Receiving Desk) dan
   panel dispatch `vendors_*` — jadikan acuan konsistensi seeding
   (satu PO, satu GRN, satu mutasi ledger).
