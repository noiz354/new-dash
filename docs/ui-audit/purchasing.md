# UI Audit — Purchasing & POs Management Hub (`purchasing_pos_management_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/purchasing_pos_management_hub/code.html` (720 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**
> untuk konten hub; shell halaman adalah **artefak templat mobile** (lihat Temuan no. 1).
> Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Hub lifecycle procurement: triage **Purchase Request (PR)** bertingkat,
purchase order vendor, penerimaan barang (**GRN**) yang auto-post ke ledger
inventory, plus **3-Way Match** (PO vs GRN vs Invoice). Dua meja eksekusi di
kanan — **Dock Inbound Receiving Desk** (`PO-2026-0298`, 100×
`PART-FLTR-401`) dan **Purchase Sign-off Desk** (`PR-2026-0314` darurat
chiller, menunggu tanda tangan VP Ops) — menjadikan halaman ini meja kerja
approval, bukan sekadar daftar.

### Daftar elemen UI utama

1. **Breadcrumb + telemetry strip** — `Home / Asset & Resource /
   Purchasing & PO Management Hub` + `HTMX CONNECTED | LATENCY: 18ms`,
   `SYNC: REALTIME`, `M. Vance (VP Ops)`.
2. **Title + action cluster** — H1 `Purchasing & Procurement Operations Hub`
   + badge `MOD-PO-882`; tombol `Export CSV / Audit`, `Print PO Batches`,
   `+ Create Purchase Request / PO` (primary, `id="btnCreatePR"`).
3. **KPI 4 kartu** — `Active Commitment Value $342,850.00`
   (18 Active POs, FIFO Cap, +12,4% MoM); `PR Approval Triage 5`
   (`3 Urgent P1`, SLA <4h, avg velocity 2,1h); `Inbound Pending Dock 8`
   (4 Due Today, 3 Expedited Carrier, Dock Bays 01–04);
   `Inventory Auto-Post 99.8%` (`GRN MATCH`, 1.240 lines auto-reconciled).
4. **Ledger bertab + toolbar** — tab `Purchase Requests (12)` aktif,
   `Purchase Orders (18)`, `Goods Receipts (GRN) (24)`, `3-Way Match` +
   label `Live HTMX Triage Queue`; search PR#/PO#/Vendor/SKU (`⌘ /`),
   select Priority / Status, tombol `Filters`.
5. **Tabel procurement 8 kolom (5 baris)** — Doc Identifier, Item Scope/SKU,
   Vendor, Valuation, Requester, Workflow Progress, Action + checkbox.
   Baris: `PR-2026-0314` (`CRITICAL P1 · 48m SLA`, Shaft Seal 2.5" Kit
   `PART-SEAL-8821` + link `WO-2026-0894`, Trane EarthWise Direct,
   `$2,900.00`, M. Kowalski, stepper 2/4 `Pending VP Approval`) [Review];
   `PO-2026-0298` (`DISPATCHED DOCK 2`, 100× `PART-FLTR-401`,
   Trane Supply Co, `$4,800.00`, S. Al-Mansoor, FedEx, Arriving Today)
   [Receive]; `PR-2026-0309` → `PO-2026-0302 CREATED` (10 pails
   `PART-LUB-09`, Mobil Aero Fluids, `$1,950.00`, J. Thorne,
   `PO Auto-Transmitted`) [View PO]; `PO-2026-0285` (`PARTIAL RECEIPT`,
   Transformer Bushing `ELEC-TR-880`, ABB, `$28,400.00`, E. Vance,
   `1 of 2 Recv at Bay 04`, backorder 2d) [Audit];
   `PR-2026-0295` (`REJECTED BY VP`, Grainger, `$850.00`, R. Gomez,
   `Workflow Closed`) [Details]. Footer
   (`1 - 5 of 48 active procurement lines`, halaman 1–3 + Next).
6. **Micro-bento supplier** — Trane Supply SLA 98,4% (+1,2%, lead 1,4 hari),
   Emergency P1 SLA 1,8h (threshold 4h, 100% dari 42 dispatch),
   3-Way Match 99,2% Zero Fraud (AI auto-match).
7. **Dock Inbound Receiving Desk** — badge `Scanner Active`; header
   `PO-2026-0298 · Trane Supply Co`, waybill `FX-9920148-US`
   (FedEx Freight Priority), `Dock Bay 02`; checklist item
   `PART-FLTR-401` (Expected 100 pcs / Received 100 `MATCH ✓`,
   bin `CRIB-B / Bay 01 Auto-filled`); preview mutasi ledger
   (`+100 pcs … SHA-256 Hash … 48 to 148 pcs`); tombol
   `Flag Discrepancy` + `⚡ Post Goods Receipt (GRN) & Sync Ledger`
   (`id="btnPostGRN"`, mock sukses → `GRN-9941 Posted`).
8. **Purchase Sign-off Desk (VP Tier)** — badge `P1 SLA: 48m left`; header
   `PR-2026-0314` (`CHILLER PLANT EMERGENCY`, `$2,900.00`,
   `Linked WO: WO-2026-0894`, `Critical Asset: CHILL-NUSA-04`);
   rantai tanda tangan 3 tier (1. Marcus Kowalski SIGNED 14:22,
   2. David Chen SIGNED 14:35 Capex Authorized,
   3. Marcus Vance/YOU PENDING, limit s.d. $50.000); envelope
   `CUP Maintenance Capex Q1` (Remaining `$64,200.00 SUFFICIENT`); tombol
   `Reject Justification`, `Request OEM Quotes`,
   `✓ Authorize & Auto-Dispatch PO to Trane Co`
   (`id="btnAuthorizePO"`, mock sukses → `PO-2026-0315 Dispatched`).

### State UI

- **Empty state:** triase kosong → "Tidak ada PR menunggu" + CTA Create;
  dock tanpa inbound → "Tidak ada pengiriman terjadwal"; tab GRN/3-Way
  Match memakai tabel yang sama dengan filter status.
- **Loading state:** skeleton baris ledger + kartu KPI; tombol Authorize /
  Post GRN memakai status perantara (`Transmitting EDI…` /
  `Posting to Immutable Stock Ledger…`) — perilakunya sudah dimock di
  script inline dan wajib dipertahankan sebagai pola umpan balik.
- **Error state:** mismatch qty (Expected ≠ Received) → status `MISMATCH` +
  wajib `Flag Discrepancy` sebelum posting; envelope tidak cukup →
  Authorize nonaktif + peringatan; EDI gagal → toast + status PO tetap.

## 2. Navigation Flow & Routing (Alur Navigasi)

Tidak ada sidebar desktop — hanya bottom-nav mobile 4 tab (artefak, lihat
Temuan no. 1). Semua `href="#"` — target di bawah route usulan
(lihat `navigation-audit.md` §2).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Bottom-nav `Audits / Checklist / Finding / Sync` | Route field `/(field)/…` — **ARTEFAK copy-paste**, bukan navigasi halaman ini (MISSING/tidak berlaku; produksi: buang, pakai sidebar desktop) |
| Breadcrumb `Home / Asset & Resource / …` | `Home` → `/`; grup bukan route |
| Tab `Purchase Requests / Purchase Orders / GRN / 3-Way Match` | State tab inline (`?tab=pr\|po\|grn\|match`) — EXISTS (tab) |
| `Review` (`PR-2026-0314`) | Drawer approval `/purchasing/[id]` (tab review) — MISSING |
| `Receive` (`PO-2026-0298`) | Fokus Dock Receiving Desk inline — EXISTS (parsial); halaman `GRN-9941` — MISSING |
| `View PO` (`PR-2026-0309`) | `/purchasing/[id]` — MISSING |
| `Audit` (`PO-2026-0285`) | `/purchasing/[id]` (tab audit/match) — MISSING |
| `Details` (`PR-2026-0295`) | `/purchasing/[id]` (read-only, workflow closed) — MISSING |
| Link `WO-2026-0894` (baris PR + sign-off desk) | `/work-orders/[id]` — MISSING |
| `+ Create Purchase Request / PO` (`btnCreatePR`) | Modal create — MISSING (bahkan tanpa handler JS di mockup) |
| `Authorize & Auto-Dispatch PO` | Aksi `POST /api/v1/purchase-requests/:id/authorize` → `PO-2026-0315`, tetap di halaman — OK (aksi) |
| `Post Goods Receipt (GRN) & Sync Ledger` | Aksi `POST /api/v1/goods-receipts` → `GRN-9941`, tetap di halaman — OK (aksi) |
| `Flag Discrepancy` | Flow discrepancy (modal) — MISSING |
| `Reject Justification` / `Request OEM Quotes` | Aksi alur approval — MISSING (parsial, tanpa handler) |
| `Export CSV / Audit`, `Print PO Batches` | Export job / print view — MISSING |
| Search, select Priority/Status, pagination | Query params (`?tab=pr&q=&priority=&status=&page=`), bukan navigasi |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/purchasing/[id]` — PR/PO/GRN Detail + 3-Way Match (HIGH)** — empat
   tombol baris (`Review`, `View PO`, `Audit`, `Details`) tidak punya
   tujuan; halaman detail wajib menampung tab review, receiving, match,
   dan riwayat signature (lihat `navigation-audit.md` §4 no. 3).
   `// TODO: Create detail page routing for /purchasing/[id]`
2. **`/work-orders/[id]` (HIGH)** — link `WO-2026-0894` (2 titik) mati
   (ikut missing global no. 1).
3. **Flow Create PR/PO (MEDIUM)** — `btnCreatePR` tanpa handler maupun
   target; definisikan modal + `POST /api/v1/purchase-requests`.
4. **Flow discrepancy & RFQ (MEDIUM)** — `Flag Discrepancy`,
   `Reject Justification`, `Request OEM Quotes` butuh endpoint + status
   (`DISPUTED`, `REJECTED`, `RFQ_SENT`).
5. **Shell desktop (HIGH, struktural)** — halaman ini butuh sidebar 15 item
   + header standar, bukan bottom-nav field (lihat Temuan no. 1).

> Konsisten dengan `navigation-audit.md`: baris purchasing §3
> (`Linked WO` MISSING; `View PO`/`Review`/`Authorize` → `/purchasing/[id]`
> MISSING), missing §4 no. 3, artefak bottom-nav §5.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis satu file, Tailwind Play CDN + token inline; font Inter +
  JetBrains Mono + **Space Grotesk** (sisa templat mobile) + Material
  Symbols; script inline tanpa dependensi untuk dua tombol
  (`btnAuthorizePO`, `btnPostGRN`) + shortcut `Ctrl/Cmd + /`;
  `btnCreatePR` **tanpa handler**; bottom-nav + header mobile menempel.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/purchasing` (`?tab=`) + `/purchasing/[id]`; typing `PurchaseRequest`, `PurchaseOrder`, `GoodsReceipt`, `SignatureChain`. |
| **Tailwind CSS (build)** | Grid 7/5, tabel 8 kolom, dua meja kanan; token sistem A; **hapus** Space Grotesk (milik sistem B/mobile). |
| **shadcn/ui** — `Tabs`, `Table`, `Badge`, `Card`, `Dialog`, `Input`, `Select`, `Progress`, `Avatar`, `Skeleton`, `Toast`, `Stepper` (custom) | Tab ledger, stepper workflow 4 titik, rantai signature 3 tier, dialog create/discrepancy, skeleton. |
| **lucide-react** | Pengganti Material Symbols (gavel, local-shipping→truck, barcode-scanner, shield). |
| **SWR / TanStack Query** | Refresh triase + countdown SLA (`P1 SLA: 48m left` poll 30s); mutasi authorize/post-GRN via `useSWRMutation`. |
| **axios** | HTTP client `/api/v1`. |
| **zod + react-hook-form** | Validasi Create PR (SKU, qty, vendor, WO link, budget envelope), GRN count, rejection reason. |
| **date-fns** | SLA countdown, `Arriving Today`, `Backorder ETA: 2d`. |
| **Intl.NumberFormat** | `$342,850.00`, `$2,900.00`. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/procurement/summary` | On page load (4 KPI + micro-bento) | Response: `{ "data": { "commitmentValue": 342850, "activePos": 18, "prQueue": 5, "urgentP1": 3, "avgVelocityH": 2.1, "inboundDock": 8, "dueToday": 4, "expedited": 3, "autoPostPct": 0.998, "traneSlaPct": 0.984, "matchPct": 0.992 } }` |
| GET | `/api/v1/purchase-requests` | On page load + tab PR + search/filter/pagination | Query: `?q=&priority=&status=PENDING_VP_OPS&page=1`. Response: `{ "data": [{ "id": "PR-2026-0314", "priority": "P1", "slaMinLeft": 48, "sku": "PART-SEAL-8821", "qty": 2, "vendor": "Trane EarthWise Direct", "valuation": 2900, "requester": "M. Kowalski", "workOrderId": "WO-2026-0894", "workflowStep": 3, "workflowTotal": 4 }], "meta": { "total": 12 } }` |
| GET | `/api/v1/purchase-orders` | On ganti tab PO | Query: `?status=`. Response: `{ "data": [{ "id": "PO-2026-0298", "vendor": "Trane Supply Co", "valuation": 4800, "status": "DISPATCHED", "dock": "Dock Bay 02", "carrier": "FedEx Freight" }] }` |
| GET | `/api/v1/goods-receipts` | On ganti tab GRN | Response: `{ "data": [{ "id": "GRN-9941", "purchaseOrderId": "PO-2026-0298", "status": "POSTED" }] }` |
| GET | `/api/v1/procurement/match-status` | On ganti tab 3-Way Match | Response: `{ "data": { "matchedPct": 0.992, "openDisputes": 1 } }` |
| POST | `/api/v1/purchase-requests` | On submit `+ Create Purchase Request / PO` | Body: `{ "sku": "PART-SEAL-8821", "qty": 2, "vendorId": "VND-HVAC-0012", "workOrderId": "WO-2026-0894", "priority": "P1" }`. Response: `{ "data": { "id": "PR-2026-0315" } }` |
| POST | `/api/v1/purchase-requests/:id/authorize` | On click `Authorize & Auto-Dispatch PO` | Body: `{ "signerId": "m-vance", "envelopeId": "CUP-CAPEX-Q1" }`. Response: `{ "data": { "purchaseOrderId": "PO-2026-0315", "status": "DISPATCHED" } }` |
| POST | `/api/v1/purchase-requests/:id/reject` | On submit `Reject Justification` | Body: `{ "reason": "Exceeds crib discretionary cap" }`. Response: `{ "data": { "id": "PR-2026-0295", "status": "REJECTED" } }` |
| POST | `/api/v1/goods-receipts` | On click `Post Goods Receipt (GRN)` | Body: `{ "purchaseOrderId": "PO-2026-0298", "dock": "Bay 02", "lines": [{ "sku": "PART-FLTR-401", "expected": 100, "received": 100, "bin": "CRIB-B / Bay 01" }] }`. Response: `{ "data": { "id": "GRN-9941", "posted": true } }` |
| POST | `/api/v1/goods-receipts/:id/flag` | On click `Flag Discrepancy` | Body: `{ "sku": "PART-FLTR-401", "expected": 100, "received": 96, "note": "…" }`. Response: `{ "data": { "id": "GRN-9941", "status": "DISPUTED" } }` |
| GET | `/api/v1/purchase-requests/:id/signatures` | On buka Sign-off Desk | Response: `{ "data": { "id": "PR-2026-0314", "chain": [{ "by": "Marcus Kowalski", "state": "SIGNED" }, { "by": "David Chen", "state": "SIGNED" }, { "by": "Marcus Vance", "state": "PENDING", "limit": 50000 }], "envelope": { "id": "CUP-CAPEX-Q1", "remaining": 64200 } } }` |
| POST | `/api/v1/exports/procurement` | On click `Export CSV / Audit` | Body: `{ "format": "CSV", "tab": "pr" }`. Response: `{ "data": { "jobId": "EXP-5513" } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock tinggal di `mocks/purchasing.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/procurement/summary
export const procurementSummary = {
  commitmentValue: 342850, activePos: 18, prQueue: 5, urgentP1: 3,
  avgVelocityH: 2.1, inboundDock: 8, dueToday: 4, autoPostPct: 0.998,
};

// TODO: Replace ledger mock with GET /api/v1/purchase-requests?status=PENDING_VP_OPS&page=1
export const procurementLines = [
  { id: "PR-2026-0314", priority: "P1", slaMinLeft: 48, sku: "PART-SEAL-8821", vendor: "Trane EarthWise Direct", valuation: 2900, requester: "M. Kowalski", workOrderId: "WO-2026-0894", workflowStep: 3 },
  { id: "PO-2026-0298", status: "DISPATCHED", sku: "PART-FLTR-401", qty: 100, vendor: "Trane Supply Co", valuation: 4800, dock: "Dock Bay 02" },
  // TODO: picks — PR-2026-0309/PO-2026-0302, PO-2026-0285, PR-2026-0295 dari code.html
];

// TODO: Replace receiving mock with GET /api/v1/purchase-orders/PO-2026-0298 (include lines + waybill)
export const receivingDesk = {
  purchaseOrderId: "PO-2026-0298", waybill: "FX-9920148-US", dock: "Dock Bay 02",
  lines: [{ sku: "PART-FLTR-401", expected: 100, received: 100, bin: "CRIB-B / Bay 01" }],
};

// TODO: Replace sign-off mock with GET /api/v1/purchase-requests/PR-2026-0314/signatures
export const signOffDesk = {
  id: "PR-2026-0314", valuation: 2900, workOrderId: "WO-2026-0894",
  assetRef: "CHILL-NUSA-04", envelopeRemaining: 64200,
  chain: [
    { by: "Marcus Kowalski", state: "SIGNED" },
    { by: "David Chen", state: "SIGNED" },
    { by: "Marcus Vance", state: "PENDING" },
  ],
};

// TODO: Hapus bottom-nav mobile + header mobile, ganti shell desktop + sidebar (artefak Stitch, bukan desain)
// TODO: Tambahkan handler + route modal untuk btnCreatePR (saat ini tanpa handler JS)
// TODO: Create detail page routing for /purchasing/[id]
// TODO: Create detail page routing for /work-orders/[id] (link WO-2026-0894)
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/purchase-requests?status=PENDING_VP_OPS', fetcher)
import { procurementLines } from "@/mocks/purchasing.mock";

export function ProcurementTable() {
  return (
    <Table>
      <TableBody>
        {procurementLines.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="font-mono font-bold">{l.id}</TableCell>
            <TableCell className="font-mono">{l.sku}</TableCell>
            <TableCell className="font-mono">{l.valuation}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Temuan (inkonsistensi antar-layar, jangan diam-diam diperbaiki)

1. **Bottom-nav mobile + header mobile adalah artefak copy-paste Stitch
   (bukan desain).** File memakai `<title>Run Checklist</title>`, header
   gaya field (`Apex Ops • LIVE • HQ Nusantara > Chiller Plant B-204`),
   **tanpa** `<aside>` sidebar desktop, dan bottom-nav
   (`my-audits` / `run-checklist` aktif / `report-finding` / `sync-status`)
   yang menutupi konten tabel saat render mobile (terlihat di `screen.png`).
   Versi produksi: shell desktop + sidebar 15 item, bottom-nav dibuang.
   Konsisten dengan `navigation-audit.md` §1 no. 3 dan §5.
2. **Tombol primer tanpa handler.** `+ Create Purchase Request / PO`
   (`#btnCreatePR`) tidak memiliki listener di script inline (hanya
   `#btnAuthorizePO` dan `#btnPostGRN` yang di-mock) — dead click.
3. **ID aset kritis beda format.** Sign-off desk menulis
   `Critical Asset: CHILL-NUSA-04` sementara 5 layar lain memakai
   `AST-HVAC-004` untuk chiller yang sama — samakan ke `AST-*`.
4. **Bin + baseline stok receiving vs inventory.** Preview mutasi menulis
   bin `CRIB-B / Bay 01` dan baseline `48 to 148 pcs`, sedangkan
   `inventory_*` menempatkan `PART-FLTR-401` di `SUB-LCK-4B / Bay 01`
   (48 pcs). Selaraskan master bin sebelum GRN auto-post diuji.
5. **Font Space Grotesk sisa templat.** Config Tailwind file ini memuat
   Space Grotesk (font headline sistem B/mobile) yang tidak dipakai
   konten hub desktop — jangan terbawa ke build produksi sistem A.
