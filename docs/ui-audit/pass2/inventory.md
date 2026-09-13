# UI Audit — Inventory (pass-2, independen)

> Sumber: `stitch_facility_maintenance_platform_ui/inventory_spare_parts_management_ledger/code.html` (726 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Dibuat: 2026-09-13 (pass-2, audit independen dari nol).
> Konteks rute global: `docs/ui-audit/navigation-audit.md` (route usulan `/inventory`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Ledger **Spare Parts & Consumables** mengelola 4.218 SKU lintas gudang: saldo
multi-lokasi (on-hand / reserved / available vs min-ROP), pemicu reorder
otomatis, jurnal mutasi audit, dan **meja eksekusi transfer/rekonsiliasi**
dengan persetujuan ber-PIN. Rantai pasok halaman ini tersambung dua arah:
menerima dari purchasing (PO→GRN) dan mengeluarkan ke work order.

### Daftar elemen UI utama

1. **Header + badge hub** — H1 `Spare Parts & Consumables Ledger` +
   `SKU-REG v4.2`; badge `HTMX Sync: Realtime`, `Hub: Central Crib (Bldg B)`;
   aksi `Export (CSV/XLS)`, `Print QR / Barcode`, `+ Receive Stock (PO / GRN)`.
2. **KPI 4 kartu** — `Catalog Valuation` $1.428.650 FIFO / 4.218 SKUs (+4,8 %);
   `Stock Availability Health` 94,2 % (38 Critical SKUs reserved);
   `Low Stock & Reorder Triggers` 14 Flags Below Min (7 PO Drafts Auto-Queued,
   2 In-Transit); `Monthly Stock Movement` 1.840 (+1.240 In / −560 Out /
   40 Trf, turnover 3,8x).
3. **Filter katalog** — search SKU/nama/OEM/bin + `Ctrl + /`; `Advanced`,
   `tune`; 3 dropdown (`Warehouse Hub`, `Part Category` — HVAC 842,
   Electrical 612, Lubricants 248, Filters 1.150 — `Inventory Threshold`).
4. **Tabel saldo (9 kolom)** — checkbox, `SKU & Part Specification`,
   `Bin / Hub`, `On Hand`, `Reserved`, `Available`, `Min / ROP`, `Status`,
   `Actions`; 6 baris: `PART-SEAL-8821` CRITICAL 1/4 (reserved 1 ea 🔒
   WO-2026-0894, Draft PO), `PART-LUB-09` BELOW ROP 4/5, `PART-FLTR-401`
   OPTIMAL 44 pcs, `PART-BRG-6205` OPTIMAL 18 pcs, `PART-VALV-GT2` 10 pcs,
   `PART-FUSE-600V` CRITICAL 1/10; footer `1 - 6 of 4,218 SKUs`, 704 halaman.
5. **Movement Ledger** — badge `Live Audit Bus`; pil `All (1,840)` /
   `Receipts (+)` / `WO Out (-)` / `Adjust (±)` / `Transfers`; 5 event:
   −1 ea `WO-2026-0894` (seal, auth:mvance), +100 pcs `PO-2026-0298` GRN
   (filter, dock:bay-02), −2 pails `PM-PLN-0104`, +5 ea `TRF-2026-0044`
   (North Depot → Central, waybill #772), −2 pcs `ADJ-2026-0019` (scrap fuse,
   VP Operations, cc:QA-SCRAP); stamp `Immutable Hash: sha256:d8a2..f041`
   `Synced`.
6. **Transfer & Mutation Desk** (`HTMX Form`) — tab `Inter-Hub Transfer` /
   `Cycle Reconciliation`; banner fokus `PART-SEAL-8821` (1 ea Avail);
   reason select; source readonly `Central Crib - Bldg B (Bin C-04)`;
   destination select; stepper qty 1 dengan peringatan
   `0 Available in Crib-B` pasca-transfer; referensi `WO-2026-0894
   (AST-HVAC-004)`; approver `Marcus Vance (VP Ops)` `PIN Verified`;
   `Cancel` / `Confirm & Post Mutation` (`onsubmit` dicegah — demo).

### State UI

- **Empty state:** SKU tanpa mutasi → ledger "Belum ada pergerakan";
  pencarian tanpa hasil → "SKU tidak ditemukan" + `Clear Filters`.
- **Loading state:** skeleton tabel + feed ledger; tombol Confirm spinner saat
  posting; badge hash jadi `Syncing…`.
- **Error state:** posting mutasi gagal → saldo tidak berubah + toast (ledger
  immutable); stok tidak cukup → stepper diblokir + pesan ketersediaan;
  PIN approver kedaluwarsa → badge `PIN Expired` + minta verifikasi ulang.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar `<aside>`). Semua `href="#"`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar (15 `data-path`) | Route §2 `navigation-audit.md`; halaman ini `/inventory` |
| `Export (CSV/XLS)` | Unduh katalog async |
| `Print QR / Barcode` | Print view label rak/bin |
| `+ Receive Stock (PO / GRN)` | Flow penerimaan (terkait `/purchasing` + GRN desk) — MISSING |
| Baris SKU / aksi Details | `/inventory/[sku]` (detail SKU) — MISSING |
| `Draft PO` (ikon cart) | `/purchasing/new?sku=PART-SEAL-8821` — MISSING (prefill) |
| `Transfer / Issue` (ikon swap) | Fokus Mutation Desk (inline) + `/work-orders/[id]` untuk issue — MISSING |
| Pil ledger (`Receipts`, `WO Out`, …) | Filter `?txnType=` inline |
| Referensi `WO-2026-0894` (ledger) | `/work-orders/[id]` — MISSING |
| Referensi `PO-2026-0298` (ledger) | `/purchasing/[id]` — MISSING |
| `TRF-2026-0044` / `ADJ-2026-0019` | Detail transfer/adjustment — MISSING |
| `Confirm & Post Mutation` | `POST /api/v1/inventory/mutations`, tetap di halaman |
| Header `+ New Dispatch / Request`, notifikasi | Pola global dan `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/inventory/[sku]` (MEDIUM)** — tidak ada detail SKU (riwayat saldo,
   lokasi alternatif, substitusi, lead time vendor) padahal 6 baris + ledger
   merujuknya.
   `// TODO: Create detail page routing for /inventory/[sku]`
2. **Flow `Receive Stock (PO/GRN)` (MEDIUM)** — tombol utama tanpa modal/halaman;
   hubungannya dengan Dock Receiving Desk di purchasing tak terdefinisi.
   `// TODO: Define receive-stock flow linking /inventory and /purchasing GRN desk`
3. **Prefill `Draft PO` per baris (MEDIUM)** — butuh `/purchasing/new?sku=`.
   `// TODO: Agree prefill convention /purchasing/new?sku= for draft PO`
4. **Detail dokumen transfer/adjustment (LOW)** — `TRF-*`, `ADJ-*` hanya label.
   `// TODO: Create transfer/adjustment document views`
5. **Otorisasi mutasi (LOW, wajib prod)** — badge `PIN Verified` statis; butuh
   flow PIN/OTP nyata + atur batas nilai tanpa approval.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, **Tailwind Play CDN**, **Inter + JetBrains Mono**, ikon
  **Material Symbols Outlined**, angka tabular via `font-feature-settings`.
- Satu-satunya logika: `onsubmit="event.preventDefault()"` pada form mutasi.
- Tanpa framework, validasi stok, atau posting nyata.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/inventory`; typing `SkuBalance`, `StockTxn`, `Mutation` |
| **Tailwind CSS (build)** | Ganti Play CDN; token sistem A |
| **shadcn/ui (Radix)** — `Table`, `Card`, `Badge`, `Input`, `Select`, `Tabs`, `Dialog`, `Skeleton`, `Toast`, `Stepper` | Katalog, ledger, Mutation Desk |
| **lucide-react** | Pengganti Material Symbols |
| **SWR / TanStack Query** | Saldo berfilter + feed ledger realtime (optimistic update mutasi) |
| **axios** | Client `/api/v1` + idempotency key untuk posting mutasi |
| **zod + react-hook-form** | Validasi mutasi (qty ≤ available, alasan wajib, approver) |
| **WebAuthn/OTP (nantinya)** | Pengganti badge PIN statis |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger | Expected Payload / Response |
|---|---|---|---|---|
| GET | `/api/v1/inventory/summary` | KPI valuasi, health, reorder, movement | On page load | `{ "data": { "valuation": 1428650, "model": "FIFO", "skus": 4218, "availability": 0.942, "lowStock": 14, "poDrafts": 7, "inTransit": 2, "movement30d": 1840 } }` |
| GET | `/api/v1/inventory/skus` | Katalog + saldo berfilter | On load, search, filter, pagination | Query `?q=&warehouse=central-crib&category=all&threshold=all&page=1`. `{ "data": [{ "sku": "PART-SEAL-8821", "onHand": 2, "reserved": 1, "available": 1, "min": 4, "status": "CRITICAL" }], "meta": { "total": 4218 } }` |
| GET | `/api/v1/inventory/ledger` | Feed mutasi berfilter tipe | On load + ganti pil | Query `?type=all&limit=20`. `{ "data": [{ "delta": -1, "sku": "PART-SEAL-8821", "ref": "WO-2026-0894", "auth": "mvance" }] }` |
| POST | `/api/v1/inventory/mutations` | Posting transfer/adjustment (idempoten) | On Confirm & Post Mutation | Body `{ "sku": "PART-SEAL-8821", "qty": 1, "from": "CRIB-B/C-04", "to": "SUB-4B", "reason": "FIELD_STAGE", "woRef": "WO-2026-0894", "idempotencyKey": "uuid" }` → `{ "data": { "mutationId": "MUT-7710", "postBalance": 0 } }` |
| POST | `/api/v1/inventory/receipts` | Penerimaan PO/GRN | On Receive Stock | Body `{ "poId": "PO-2026-0298", "lines": [{ "sku": "PART-FLTR-401", "qty": 100 }] }` |
| POST | `/api/v1/purchase-requests` | Draft PO dari baris kritis | On click Draft PO | Body `{ "sku": "PART-SEAL-8821", "qty": 3 }` |
| GET | `/api/v1/inventory/export` | Export katalog | On click Export | File async `{ "data": { "jobId": "EXP-3301" } }` |

Contoh `axios` (posting idempoten):

```ts
// TODO: Replace preventDefault demo with POST /api/v1/inventory/mutations (idempotency key required)
import axios from "axios";
export async function postMutation(input: { sku: string; qty: number; from: string; to: string; reason: string }) {
  const { data } = await axios.post("/api/v1/inventory/mutations", input, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
  return data.data as { mutationId: string; postBalance: number };
}
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/inventory.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/inventory/summary
export const inventorySummary = {
  valuation: 1428650, model: "FIFO", skus: 4218, availability: 0.942,
  reservedCritical: 38, lowStock: 14, poDrafts: 7, inTransit: 2,
  movement30d: { total: 1840, in: 1240, out: 560, transfers: 40, turnover: 3.8 },
};

// TODO: Replace catalog mock with GET /api/v1/inventory/skus?warehouse=central-crib&page=1
export const skuCatalog = [
  { sku: "PART-SEAL-8821", desc: "Silicon Carbide Shaft Seal 2.5\"", oem: "Trane EarthWise CVHE Kit • OEM #4920-11", bin: "CRIB-B / Bin C-04", onHand: 2, reserved: 1, available: 1, min: 4, status: "CRITICAL" },
  { sku: "PART-LUB-09", desc: "Synthetic POE Refrigerant Lubricant ISO 68 (5 Gal Pail)", bin: "CRIB-CHEM / Rack 02", onHand: 6, reserved: 2, available: 4, min: 5, status: "BELOW_ROP" },
  { sku: "PART-FLTR-401", desc: "MERV 14 Chilled Air Filter Cartridge 24x24x2", bin: "SUB-LCK-4B / Bay 01", onHand: 48, reserved: 4, available: 44, min: 12, status: "OPTIMAL" },
  { sku: "PART-BRG-6205", desc: "Deep Groove SKF Ceramic Ball Bearing 25x52x15mm", bin: "CRIB-B / Shelf A-12", onHand: 18, reserved: 0, available: 18, min: 6, status: "OPTIMAL" },
  { sku: "PART-VALV-GT2", desc: "2-Inch High Pressure Bronze Gate Valve", bin: "CRIB-PIPE / Bin 08", onHand: 12, reserved: 2, available: 10, min: 4, status: "OPTIMAL" },
  { sku: "PART-FUSE-600V", desc: "600V Fast-Acting Class J Fuse 30A", bin: "ELEC-VAULT / Drw 03", onHand: 3, reserved: 2, available: 1, min: 10, status: "CRITICAL" },
];

// TODO: Replace ledger mock with GET /api/v1/inventory/ledger?type=all
export const movementLedger = [
  { delta: "-1 ea", ref: "WO-2026-0894", sku: "PART-SEAL-8821", note: "Dispatched to M. Kowalski (Lead Tech)", at: "Today 14:32 UTC", auth: "mvance" },
  { delta: "+100 pcs", ref: "PO-2026-0298", sku: "PART-FLTR-401", note: "GRN Rec, Trane Supply Co, dock:bay-02", at: "Today 11:15 UTC" },
  { delta: "-2 pails", ref: "PM-PLN-0104", sku: "PART-LUB-09", note: "Recipient: HVAC Shift Team A", at: "Yest 16:40 UTC" },
  { delta: "+5 ea [TRF]", ref: "TRF-2026-0044", sku: "PART-VALV-GT2", note: "North Depot → Central, waybill:#772", at: "May 18 09:12 UTC" },
  { delta: "-2 pcs [ADJ]", ref: "ADJ-2026-0019", sku: "PART-FUSE-600V", note: "Scrap write-off, VP Operations, cc:QA-SCRAP", at: "May 17 18:00 UTC" },
];

// TODO: Replace preventDefault demo with POST /api/v1/inventory/mutations (idempotency key required)
// TODO: Create detail page routing for /inventory/[sku]
// TODO: Create detail page routing for /work-orders/[id] and /purchasing/[id] (ledger refs)
export function focusMutationDesk(sku: string) {
  return `/inventory?focus=${sku}`;
}
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/inventory/skus?page=1', fetcher)
import { skuCatalog } from "@/mocks/inventory.mock";

export function SkuTable() {
  return (
    <Table>
      <TableBody>
        {skuCatalog.map((s) => (
          <TableRow key={s.sku}>
            <TableCell className="font-mono font-bold">{s.sku}</TableCell>
            <TableCell className="font-mono">{s.available}/{s.min}</TableCell>
            <TableCell><Badge>{s.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian: posting mutasi memakai optimistic update + rollback saat
gagal; kunci idempotensi wajib agar double-click tidak menggandakan jurnal.

## 7. Perbandingan Pass-1 vs Pass-2

Dibandingkan dengan `docs/ui-audit/inventory.md` (pass-1) setelah audit
independen di atas selesai.

### (a) Temuan pass-1 yang TERKONFIRMASI

- KPI ($1.428.650 / 4.218 FIFO, 94,2 %, 14 flag, 1.840 movement 3,8x),
  6 baris saldo persis (termasuk 🔒 reserved WO-2026-0894 dan
  `CRITICAL (1/10)` fuse), 5 event ledger (`auth:mvance`, `dock:bay-02`,
  `waybill:#772`, `cc:QA-SCRAP`) + hash `d8a2`, Mutation Desk + PIN statis
  + `preventDefault` — **semua cocok**.
- `/inventory/[sku]`, flow Receive Stock, prefill Draft PO, detail
  TRF/ADJ MISSING — **semua dikonfirmasi**.
- Konflik bearing 6205 vs 6204, selisih saldo seal/lube/filter, rantai
  `PO-2026-0298` positif lintas 3 layar — **semua dikonfirmasi independen**.

### (b) Temuan BARU yang luput di pass-1

1. **Risiko pengosongan stok kritis.** Form mencontohkan transfer 1 ea
   terakhir (`Balance Post-Transfer: 0 Available in Crib-B`) sementara
   `WO-2026-0894` masih membutuhkan seal yang sama — pass-1 membahas
   validasi umum, bukan skenario pengosongan unit terakhir ini. Butuh
   guardrail (blokir/approval khusus saat available → 0 untuk SKU CRITICAL).
   `// TODO: Add guardrail for transferring last unit of CRITICAL SKUs`
2. **Idempotensi posting mutasi.** Contoh `axios` + `Idempotency-Key`
   agar double-click `Confirm & Post Mutation` tak menggandakan jurnal
   immutable — tidak disebut di pass-1.

### (c) KOREKSI / adopsi balik

Tidak ada kesalahan faktual di pass-1. Diadopsi dari pass-1 yang luput di
pass-2: (i) konflik penomoran `PM-PLN-0104` vs `PM-2025-0812` (samakan pola
`PM-YYYY-####`); (ii) hipotesis beda scope warehouse sebagai penjelasan
sementara selisih saldo (tegaskan `warehouseId`, jangan dirata-rata).
