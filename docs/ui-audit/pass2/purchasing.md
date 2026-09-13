# UI Audit — Purchasing (pass-2, independen)

> Sumber: `stitch_facility_maintenance_platform_ui/purchasing_pos_management_hub/code.html` (720 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**
> (dengan artefak shell field/sistem B, lihat Temuan).
> Dibuat: 2026-09-13 (pass-2, audit independen dari nol).
> Konteks rute global: `docs/ui-audit/navigation-audit.md` (route usulan `/purchasing`).

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Hub **Purchasing & Procurement Operations** mengelola lifecycle pengadaan
ujung-ke-ujung: triase PR multi-tier approval (Requester → Facility Mgr →
VP Ops → PO), pemantauan PO inbound di dock, penerimaan GRN yang auto-post ke
ledger inventaris, dan verifikasi 3-way match (PO vs GRN vs Invoice). Fokus
mockup adalah satu rantai darurat utuh: `PR-2026-0314` (seal chiller $2.900,
menunggu tanda VP) + `PO-2026-0298` (100 filter tiba di Dock Bay 02).

### Daftar elemen UI utama

1. **Breadcrumb + badge konektivitas** — `Home / Asset & Resource / Purchasing
   & PO Management Hub`; `HTMX CONNECTED | LATENCY: 18ms`, `SYNC: REALTIME`,
   `M. Vance (VP Ops)`.
2. **Title + aksi** — H1 `Purchasing & Procurement Operations Hub` +
   `MOD-PO-882`; `Export CSV / Audit`, `Print PO Batches`,
   `+ Create Purchase Request / PO` (`#btnCreatePR`).
3. **KPI 4 kartu** — `Active Commitment Value` $342.850 (18 Active POs,
   FIFO Cap, +12,4 % MoM); `PR Approval Triage` 5 (3 Urgent P1, SLA <4h,
   avg 2,1h); `Inbound Pending Dock` 8 (4 Due Today, 3 Expedited, Bay 01–04);
   `Inventory Auto-Post` 99,8 % GRN MATCH (1.240 lines, L30D hash).
4. **Ledger bertab** — `Purchase Requests (12)` aktif / `Purchase Orders (18)`
   / `Goods Receipts (GRN) (24)` / `3-Way Match`; `Live HTMX Triage Queue`;
   search + select Priority/Status + `Filters`; tabel 8 kolom, 5 baris:
   `PR-2026-0314` CRITICAL P1 48m SLA (seal kit `PART-SEAL-8821`,
   `WO-2026-0894`, Trane EarthWise Direct, $2.900, M. Kowalski, progres 2/4
   `Pending VP Approval`, `Review`); `PO-2026-0298` DISPATCHED DOCK 2
   (100 pcs `PART-FLTR-401`, $4.800, `Receive`); `PR-2026-0309` →
   `PO-2026-0302` CREATED ($1.950, `View PO`); `PO-2026-0285` PARTIAL RECEIPT
   (`ELEC-TR-880`, ABB, $28.400, 1 of 2 Bay 04, `Audit`); `PR-2026-0295`
   REJECTED BY VP ($850, Grainger, `Workflow Closed`, checkbox disabled);
   footer `1 - 5 of 48`, 3 halaman.
5. **Micro-bento supplier** — Trane Supply SLA 98,4 % (lead 1,4 hari);
   Emergency P1 SLA 1,8h (threshold 4h, 100 % / 42 dispatch);
   3-Way Match 99,2 % Zero Fraud (AI auto-matched).
6. **Dock Inbound Receiving Desk** (`Scanner Active`) — `PO-2026-0298`
   Trane Supply Co, waybill `FX-9920148-US`, `Dock Bay 02`; item
   `PART-FLTR-401` MERV 14 (610×610×50mm), expected 100 vs input received 100
   `MATCH ✓`; bin `CRIB-B / Bay 01 (Auto-filled)`; pratinjau mutasi
   (+100 pcs, 48 → 148 pcs, SHA-256); `Flag Discrepancy` /
   `Post Goods Receipt (GRN) & Sync Ledger` (`#btnPostGRN` → `GRN-9941 Posted`).
7. **Purchase Sign-off Desk (VP Tier)** (`P1 SLA: 48m left`) — fokus
   `PR-2026-0314` CHILLER PLANT EMERGENCY $2.900, Linked WO `WO-2026-0894`,
   Critical Asset `CHILL-NUSA-04`; rantai tanda 3 tier (Kowalski SIGNED →
   D. Chen SIGNED → **M. Vance PENDING**, limit $50.000); envelope
   `CUP Maintenance Capex Q1` remaining $64.200 SUFFICIENT; `Reject
   Justification` / `Request OEM Quotes` /
   `Authorize & Auto-Dispatch PO` (`#btnAuthorizePO` → EDI → `PO-2026-0315`).
8. **Skrip mikro-interaksi** — simulasi EDI authorize (1,2 dtk), simulasi post
   GRN (1,4 dtk), shortcut `Ctrl/Cmd + /` fokus search.

### Temuan shell (dicatat, bukan diperbaiki)

- `<title>Run Checklist</title>` — judul milik layar field, bukan purchasing.
- Header mobile field (`Apex Ops LIVE`, `HQ Nusantara > Chiller Plant B-204`,
  `cloud_done`, avatar) menempel di atas hub desktop.
- **Bottom-nav field** (`Audits 3`, `Checklist` aktif, `Finding`, `Sync`)
  tampil di hub desktop — artefak copy-paste Stitch; produksi dibuang,
  pakai sidebar desktop.
- Config Tailwind memuat **Space Grotesk** (font sistem B) walau halaman ini
  hub desktop.

### State UI

- **Empty state:** antrean triase kosong → "Tidak ada PR menunggu"; dock tanpa
  inbound → "Tidak ada pengiriman terjadwal"; tab GRN/3-Way Match memakai
  tabel yang sama (konten per tab belum dibedakan — mirip empty semu).
- **Loading state:** skeleton 5 baris + KPI; tombol Authorize/Post GRN
  berstatus transmitting/posting (sudah disimulasikan skrip); badge scanner
  `Linking…` saat handshake.
- **Error state:** EDI gagal → tombol kembali + toast + PR tetap PENDING
  (tidak boleh setengah-dispatch); qty GRN ≠ expected → wajib
  `Flag Discrepancy` sebelum posting; envelope tidak cukup → Authorize
  disabled + pesan over-budget.

## 2. Navigation Flow & Routing (Alur Navigasi)

Tidak ada sidebar `<aside>` (diganti artefak field). Semua `href="#"`.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Breadcrumb `Home / Asset & Resource` | `/` dan grup |
| `Export CSV / Audit` | Unduh audit async |
| `Print PO Batches` | Print view batch PO |
| `+ Create Purchase Request / PO` | Modal/drawer PR — MISSING (tombol ada, target tak terdefinisi) |
| Tab `Purchase Orders` / `Goods Receipts` / `3-Way Match` | `/purchasing?tab=pos|grn|match` (konten tab belum dibedakan) |
| `WO-2026-0894` (baris PR + sign-off) | `/work-orders/[id]` — MISSING |
| `Review` (PR-2026-0314) | Fokus Sign-off Desk (inline) |
| `Receive` (PO-2026-0298) | Fokus Dock Receiving Desk (inline) |
| `View PO` (PR-2026-0309) | `/purchasing/[id]` — MISSING |
| `Audit` (PO-2026-0285) | `/purchasing/[id]?tab=match` — MISSING |
| `Details` (PR-2026-0295) | Riwayat rejection — MISSING |
| `Flag Discrepancy` | Flow selisih GRN — MISSING |
| `Post Goods Receipt (GRN)` | `POST /api/v1/grn`, tetap di halaman |
| `Authorize & Auto-Dispatch PO` | `POST /api/v1/purchase-requests/:id/authorize`, tetap di halaman |
| `Request OEM Quotes` | Flow RFQ — MISSING |
| Bottom-nav field (Audits/Checklist/Finding/Sync) | ARTEFAK — buang; bukan navigasi hub ini |
| Header `+ New Dispatch / Request`, notifikasi | Pola global dan `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/purchasing/[id]` (HIGH)** — `View PO`, `Receive`, `Audit`, riwayat
   `PO-2026-0302`, GRN detail, dan tab 3-Way Match per dokumen tanpa tujuan.
   `// TODO: Create detail page routing for /purchasing/[id] (PR/PO/GRN + 3-way match tabs)`
2. **`/work-orders/[id]` (HIGH)** — `WO-2026-0894` dirujuk dua kali.
   `// TODO: Create detail page routing for /work-orders/[id]`
3. **Modal Create PR/PO + flow RFQ (MEDIUM)** — `#btnCreatePR` tidak di-wire ke
   skrip mana pun; `Request OEM Quotes` tanpa target.
   `// TODO: Create PR/PO creation modal and RFQ flow (wire #btnCreatePR)`
4. **Flow selisih GRN (MEDIUM)** — `Flag Discrepancy` tanpa halaman/tindak
   lanjut (retur, klaim, partial-accept).
   `// TODO: Define GRN discrepancy flow (return, claim, partial accept)`
5. **Konten tab GRN & 3-Way Match (MEDIUM)** — tab ada, isi belum dibedakan
   dari tabel PR.
   `// TODO: Define GRN and 3-Way Match tab content and routes`
6. **Pengaman otorisasi (MEDIUM, wajib prod)** — Authorize $2.900 sekali klik
   tanpa konfirmasi/PIN; tambahkan dialog ringkasan + budget sebelum EDI.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, **Tailwind Play CDN**, font **Inter + JetBrains Mono +
  Space Grotesk**, ikon **Material Symbols Outlined**.
- Skrip vanilla: status¿Cuasi-EDI authorize, post GRN, shortcut search.
- Shell campuran: markup desktop + header mobile + bottom-nav field.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Route `/purchasing` + `/purchasing/[id]`; buang shell field |
| **Tailwind CSS (build)** | Ganti Play CDN; token sistem A |
| **shadcn/ui (Radix)** — `Tabs`, `Table`, `Card`, `Badge`, `Stepper`, `Dialog`, `Input`, `Skeleton`, `Toast` | Ledger bertab, stepper tanda tangan, dialog authorize/GRN |
| **lucide-react** | Pengganti Material Symbols |
| **SWR / TanStack Query** | Triase realtime + status dock + countdown SLA |
| **axios** | Client `/api/v1` + idempotency untuk authorize/post |
| **date-fns** | Countdown `48m left`, ETA dock, SLA 1,8h |
| **zod + react-hook-form** | Form PR, GRN count, rejection justification |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger | Expected Payload / Response |
|---|---|---|---|---|
| GET | `/api/v1/procurement/summary` | KPI komitmen, triase, dock, auto-post | On page load | `{ "data": { "commitment": 342850, "activePos": 18, "prPending": 5, "urgentP1": 3, "inboundDock": 8, "grnMatch": 0.998 } }` |
| GET | `/api/v1/purchase-requests` | Antrean triase berfilter | On load, search, filter, pagination | Query `?status=pending_vp&priority=P1&page=1`. `{ "data": [{ "id": "PR-2026-0314", "sku": "PART-SEAL-8821", "amount": 2900, "stage": "VP_PENDING" }], "meta": { "total": 12 } }` |
| GET | `/api/v1/purchase-orders` | Daftar PO + status dock | On tab PO | `{ "data": [{ "id": "PO-2026-0298", "vendor": "Trane Supply Co", "amount": 4800, "dock": "Bay 02" }] }` |
| GET | `/api/v1/purchase-requests/:id/approvals` | Rantai tanda tangan | On fokus sign-off | `{ "data": { "chain": [{ "by": "M. Kowalski", "state": "SIGNED" }, { "by": "D. Chen", "state": "SIGNED" }, { "by": "M. Vance", "state": "PENDING", "limit": 50000 }] } }` |
| POST | `/api/v1/purchase-requests/:id/authorize` | Otorisasi VP + dispatch EDI (idempoten) | On Authorize | Body `{ "idempotencyKey": "uuid" }` → `{ "data": { "poId": "PO-2026-0315", "vendor": "Trane Co" } }` |
| POST | `/api/v1/purchase-requests/:id/reject` | Tolak + justifikasi | On Reject Justification | Body `{ "reason": "Exceeds crib discretionary cap" }` |
| POST | `/api/v1/grn` | Posting penerimaan + auto-post ledger | On Post GRN | Body `{ "poId": "PO-2026-0298", "lines": [{ "sku": "PART-FLTR-401", "received": 100, "bin": "CRIB-B/Bay 01" }] }` → `{ "data": { "grnId": "GRN-9941" } }` |
| POST | `/api/v1/grn/:id/discrepancy` | Flag selisih | On Flag Discrepancy | Body `{ "sku": "PART-FLTR-401", "expected": 100, "received": 96 }` |
| GET | `/api/v1/vendors/trane-supply/sla` | Mikro-bento SLA vendor | On page load | `{ "data": { "sla": 0.984, "leadDays": 1.4 } }` |

Contoh `axios` (authorize idempoten):

```ts
// TODO: Replace EDI simulation with POST /api/v1/purchase-requests/:id/authorize (confirm dialog + idempotency key)
import axios from "axios";
export async function authorizePR(prId: string) {
  const { data } = await axios.post(`/api/v1/purchase-requests/${prId}/authorize`, {}, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
  return data.data as { poId: string; vendor: string }; // e.g. PO-2026-0315
}
```

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/purchasing.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/procurement/summary
export const procurementSummary = {
  commitment: 342850, activePos: 18, prPending: 5, urgentP1: 3,
  approvalVelocityH: 2.1, inboundDock: 8, dueToday: 4, expedited: 3,
  grnMatch: 0.998, grnLines30d: 1240,
};

// TODO: Replace triage mock with GET /api/v1/purchase-requests?status=pending_vp
export const triageQueue = [
  { id: "PR-2026-0314", priority: "P1", sla: "48m SLA", item: "Silicon Carbide Shaft Seal 2.5\" Kit", sku: "PART-SEAL-8821", woRef: "WO-2026-0894", vendor: "Trane EarthWise Direct", amount: 2900, requester: "M. Kowalski (HVAC Lead)", stage: "VP_PENDING", action: "Review" },
  { id: "PO-2026-0298", state: "DISPATCHED DOCK 2", item: "100 pcs MERV 14 Chilled Filters", sku: "PART-FLTR-401", vendor: "Trane Supply Co", amount: 4800, requester: "S. Al-Mansoor (Crib Master)", note: "Arriving Today, FedEx Freight", action: "Receive" },
  { id: "PR-2026-0309", state: "PO-2026-0302 CREATED", item: "10 Pails POE Synthetic Lubricant", sku: "PART-LUB-09", vendor: "Mobil Aero Fluids", amount: 1950, requester: "J. Thorne", stage: "PO_AUTO_TRANSMITTED", action: "View PO" },
  { id: "PO-2026-0285", state: "PARTIAL RECEIPT", item: "2000kVA Transformer Bushing Kits", sku: "ELEC-TR-880", vendor: "ABB Grid Power Services", amount: 28400, requester: "E. Vance", note: "1 of 2 Recv at Bay 04, Backorder ETA 2d", action: "Audit" },
  { id: "PR-2026-0295", state: "REJECTED BY VP", item: "Non-standard cordless power tool accessories", vendor: "Grainger Industrial", amount: 850, requester: "R. Gomez", note: "Reason: Exceeds crib discretionary cap", action: "Details" },
];

// TODO: Replace dock mock with GET /api/v1/purchase-orders/PO-2026-0298/receiving
export const dockReceiving = {
  poId: "PO-2026-0298", vendor: "Trane Supply Co", waybill: "FX-9920148-US (FedEx Freight Priority)",
  dockBay: "02", sku: "PART-FLTR-401", expected: 100, received: 100,
  bin: "CRIB-B / Bay 01 (Auto-filled)", postBalance: { from: 48, to: 148 },
};

// TODO: Replace signoff mock with GET /api/v1/purchase-requests/PR-2026-0314/approvals
export const signoffDesk = {
  prId: "PR-2026-0314", amount: 2900, slaLeft: "48m", asset: "CHILL-NUSA-04",
  chain: [
    { by: "Marcus Kowalski (HVAC Lead)", at: "Today 14:22 UTC", note: "Verified Failure", state: "SIGNED" },
    { by: "David Chen (Engineering Mgr)", at: "Today 14:35 UTC", note: "Capex Authorized", state: "SIGNED" },
    { by: "Marcus Vance (VP Operations - YOU)", note: "Threshold Limit: Up to $50,000", state: "PENDING" },
  ],
  envelope: { name: "CUP Maintenance Capex Q1", remaining: 64200 },
};

// TODO: Create detail page routing for /purchasing/[id] (View PO, Audit targets above)
// TODO: Create detail page routing for /work-orders/[id] (WO-2026-0894 above)
// TODO: Create PR/PO creation modal and RFQ flow (wire #btnCreatePR)
export function authorizePr(prId: string) {
  return `/purchasing?authorize=${prId}`;
}
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/purchase-requests?status=pending_vp', fetcher)
import { triageQueue } from "@/mocks/purchasing.mock";

export function TriageTable() {
  return (
    <Table>
      <TableBody>
        {triageQueue.map((pr) => (
          <TableRow key={pr.id}>
            <TableCell className="font-mono font-bold">{pr.id}</TableCell>
            <TableCell>{pr.item}</TableCell>
            <TableCell className="font-mono">${pr.amount.toLocaleString()}</TableCell>
            <TableCell><Badge>{pr.stage ?? pr.state}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian: hapus skrip simulasi EDI/GRN bersama mock-nya; ganti
dialog konfirmasi + kunci idempotensi; angka rantai (`48 → 148 pcs`,
`PO-2026-0315`, `GRN-9941`) jadi respons API, bukan hardcode.

## 7. Perbandingan Pass-1 vs Pass-2

Dibandingkan dengan `docs/ui-audit/purchasing.md` (pass-1) setelah audit
independen di atas selesai.

### (a) Temuan pass-1 yang TERKONFIRMASI

- Artefak `<title>Run Checklist</title>` + header mobile + bottom-nav,
  tanpa `<aside>`; 4 KPI ($342.850/18 PO, triase 5/3 P1, dock 8/4-due,
  99,8 % GRN); 5 baris ledger ($2.900 + stepper 2/4, $4.800, $1.950,
  $28.400 partial, $850 rejected); micro-bento (98,4 % / 1,8h / 99,2 %) —
  **semua cocok**.
- Dock desk (waybill `FX-9920148-US`, 100 MATCH, pratinjau 48→148,
  `GRN-9941`), sign-off 3-tier + envelope $64.200 (`PO-2026-0315`),
  `btnCreatePR` tanpa handler, alias `CHILL-NUSA-04`, Space Grotesk —
  **semua dikonfirmasi**.
- `/purchasing/[id]` HIGH, `/work-orders/[id]` HIGH, shell desktop
  struktural HIGH — **disepakati**.

### (b) Temuan BARU yang luput di pass-1

1. **Wajib dialog konfirmasi otorisasi.** `Authorize & Auto-Dispatch PO`
   $2.900 sekali klik tanpa konfirmasi/PIN — pass-1 memetakannya "OK
   (aksi)". Produksi wajib dialog ringkasan (PR, vendor, amount, envelope
   tersisa) + kunci idempotensi sebelum EDI.
   `// TODO: Add authorize confirmation dialog (summary + budget + idempotency key)`
2. **Idempotensi eksplisit.** Contoh `axios` + `Idempotency-Key` untuk
   authorize dan post-GRN (mencegah PO/GRN ganda saat double-click atau
   retry EDI) — tidak disebut di pass-1.

### (c) KOREKSI / adopsi balik

Tidak ada kesalahan faktual di pass-1. Diadopsi dari pass-1 yang luput di
pass-2: konflik bin/baseline receiving (`CRIB-B / Bay 01`, `48 → 148 pcs`)
vs master inventory (`SUB-LCK-4B / Bay 01`) — selaraskan master bin sebelum
GRN auto-post diuji.
