# UI Audit Pass-2 — Audit Trail & System Logs Hub (`audit_trail_system_logs_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/audit_trail_system_logs_hub/code.html` (777 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Konsistensi rute global: `docs/ui-audit/navigation-audit.md` (§2: `/audit-logs`).

## 1. Page Overview & UI Elements (Penjelasan Halaman)

### Tujuan utama

Ledger event imutabel untuk tata kelola: setiap mutasi operasional (WO,
purchasing, aset, inventory, RBAC) tercatat dengan hash kriptografis
rantai Merkle sehingga dapat diverifikasi dan diekspor untuk kepatuhan.
Badge `AUDIT BUS: REAL-TIME SECURE`, `Tenant APX-NUSA-01`,
`Cipher SHA-256 Merkle Chain`, `Epoch 1748097318` menegaskan konteks keamanan.
Alur: pantau KPI integritas → filter event → pilih baris feed → inspeksi
diff/JSON + bukti hash → unduh proof / simulasi rollback / flag review.

### Daftar elemen UI utama

1. **Breadcrumb + header ledger** — `Home / Governance & System / Audit Trail & System Logs`;
   H1 `System Audit Trail & Immutable Event Ledger` + badge bus + meta tenant/cipher/epoch.
2. **Action cluster** — `Export CSV / JSON Log`, `Compliance PDF Report`,
   `Verify Cryptographic Root` (primary).
3. **KPI grid (4 kartu)** — `Total Audited Events (L30D)` `184,920`
   (`+14.2% MoM`, `100% Ingestion`); `Security Overrides` `3 Flagged`
   (`2 Asset Tier-1 Shifts`, `1 Off-hours Signoff`); `Tamper-Proof Integrity`
   `100% Verified` (`Block #892,104`, `0 Hash Mismatch`); `Active Telemetry Terminals`
   `42 Live Nodes` (`WS Broker: 12ms Latency`, `Healthy`).
4. **Toolbar filter** — search `Filter by Entity ID, Hash, User, IP address... (Ctrl + /)`
   + badge `⌘/`; picker `Today (24 May 2026)`; dropdown `All Entities`,
   `All Actions`, `All Principals`; quick scope pills
   (`All Logs 184.9k`, `Work Orders 42.1k`, `Purchasing & POs 18.2k`,
   `Asset State 12.4k`, `Security & RBAC 4.8k`); `Severity: All Levels` + `Reset`.
5. **Master feed `Live Activity Stream` (kiri, 7/12)** — header
   (`6 Recent Focused Events`, checkbox `Live HTMX Polling (5s)`, `Force Refetch`);
   6 baris: `PR-2026-0314 APPROVE` ($2,900 chiller seal, David Chen,
   `10.14.8.42`, `HVC-ENG-02`, aktif terpilih); `WO-2026-0894 STATE_CHANGE`
   (`CREATED→DISPATCHED`, Marcus Kowalski); `AST-HVAC-004 CREATE / ALERT`
   (refrigerant `18.4 ppm`, SCADA daemon, merah); `PART-FLTR-401 MUTATION`
   (GRN +100 via `PO-2026-0298`, Sarah Al-Mansoor); `RBAC: Sr. Field Tech POLICY_UPDATE`
   (cap `$250→$500`, Marcus Vance); `AST-ELEC-012 CALIBRATION`
   (Elena Voronova). Tiap baris: timestamp UTC ms, badge aksi, entity mono,
   kategori, hash `sha256:…` + ikon `verified`, deskripsi, aktor + terminal/IP.
   Pagination: `Showing 1-6 of 184,920`, rows 25/50/100, halaman `1 2 3 … 7396`.
6. **Inspector `State Transition & Diff Inspector` (kanan, 5/12)** — header
   `ENTITY: PR-2026-0314 Purchase Request`, `TXN: TXN-88120-NUSA`, badge `IMMUTABLE`;
   bar hash `sha256:7f4c…` + `Copy Full Hash` (inline `clipboard.writeText`);
   label `HTMX POST /api/v2/procurement/pr-0314/endorse` + `Merkle Root Confirmed`;
   tab `Formatted Diff (Field-by-Field)` / `Raw JSON Payload` + `4 Fields Mutated`;
   diff 4 field (`approval_stage`, `authorized_by USR-0042 David Chen`,
   `budget_envelope_allocated $2,900 CUP`, `next_signoff_tier Marcus Vance L3`);
   raw JSON `EVT-20260524-94812` (line `SEAL-CHILL-8821 ×1 $2900`,
   `merkle_verification index 48102 proof_chain_valid`);
   sub-card `Authentication & Session Envelope` (RFID-4180, `10.14.8.42 VPN East`,
   `Chrome 125 Enterprise / macOS`, `Bldg A Floor 4`, `Okta SCIM MFA FIDO2`);
   footer `Download Signed Proof` / `Rollback Simulation` / `Flag Review`.
7. **Widget `Merkle Forest Root Status`** — `SYNCED 100%`, bar 6 segmen,
   `Proof #48,102`, `NUSA-LEDGER-A`, `Consensus 1.42s`.
8. **Script inline** — `switchView('diff'|'raw')` (toggle class + gaya tombol),
   `highlightRow(el)` (single-select + bilah kiri `w-1 bg-primary`).

### State UI

- **Empty state:** filter tanpa hasil → feed kosong + `Reset`; inspector tanpa
  seleksi → placeholder `Pilih event untuk inspeksi` (saat ini selalu ada seleksi).
- **Loading state:** feed skeleton 6 baris; inspector skeleton diff; tombol
  `Force Refetch` spinner; polling 5s dengan indikator (sudah ada).
- **Error state:** hash mismatch → banner merah + blokir aksi; WS putus →
  badge bus `DEGRADED` + jeda polling; export gagal → toast + retry.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path`, semua `href="#"`; target usulan).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Audit Trail & Logs | `/audit-logs` (halaman ini) |
| Sidebar 14 item lain | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/notifications`, `/organization`, `/settings` |
| Breadcrumb `Home / Governance & System / Audit Trail` | `Home` → `/`; grup bukan route |
| `Export CSV / JSON Log` | `GET /api/v1/audit-logs/export?format=` (unduh; hormati filter aktif) |
| `Compliance PDF Report` | `POST /api/v1/audit-logs/compliance-report` (async job → PDF) |
| `Verify Cryptographic Root` | `POST /api/v1/audit-logs/verify-root` (tetap di halaman + hasil) |
| Baris feed (klik) | Seleksi inline → inspector (tetap di halaman; `highlightRow`) |
| Entity mono (`PR-…`, `WO-…`, `AST-…`, `PART-…`) | Detail masing-masing domain (`/purchasing/[id]`, `/work-orders/[id]`, `/assets/[id]`, `/inventory?sku=`) — MISSING |
| `Copy Full Hash` | Clipboard (bukan navigasi) |
| `Download Signed Proof` | `GET /api/v1/audit-logs/events/[id]/proof` (unduh) |
| `Rollback Simulation` | Modal simulasi rollback (dry-run; bukan navigasi) — MISSING |
| `Flag Review` | `POST /api/v1/audit-logs/events/[id]/flag` (tetap di halaman) |
| Pagination / rows-per-page | Query params (`?page=&perPage=&entity=&action=&q=`) |
| Ikon `notifications` (header) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Detail entity yang dirujuk feed (HIGH)** — `PR-2026-0314`, `WO-2026-0894`,
   `AST-HVAC-004`, `PART-FLTR-401` tidak punya tujuan; setidaknya link ke
   `/purchasing/[id]`, `/work-orders/[id]`, `/assets/[id]`.
   `// TODO: Create detail routes /purchasing/[id], /work-orders/[id], /assets/[id]`
2. **Modal `Rollback Simulation` (MEDIUM)** — tombol ada tanpa konten; butuh
   dry-run diff pembatalan (read-only, tidak benar-benar rollback ledger).
   `// TODO: Create rollback simulation modal (dry-run only)`
3. **Hasil `Verify Cryptographic Root` (LOW)** — tidak ada panel hasil
   (root hash, block height, waktu verifikasi); tambahkan inline result.
4. **Target global `+ New Dispatch / Request` (MEDIUM)** — pola lintas-hub
   tak terdefinisi (lihat navigation-audit §4.7).

**Catatan versi API (dicatat):** inspector menulis
`HTMX POST /api/v2/procurement/pr-0314/endorse` sementara seluruh kontrak lain
di repo memakai `v1` — putuskan versi kanonis sebelum produksi.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN + config inline, Inter + JetBrains Mono,
  Material Symbols. Interaksi JS vanilla (`switchView`, `highlightRow`,
  `clipboard.writeText`). Tanpa fetch nyata (label HTMX hanya teks).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/audit-logs`; typing `AuditEvent`, `EventDiff`, `MerkleStatus`. |
| **Tailwind CSS (build)** | Feed dua panel, badge aksi, diff merah/hijau. Token sistem A. |
| **shadcn/ui** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Table/List`, `Tabs`, `Pagination`, `Skeleton`, `Toast`, `Tooltip` | KPI, toolbar, feed, inspector tab, pagination, skeleton, toast, tooltip hash. |
| **lucide-react** | Pengganti Material Symbols (shield, history, hub, search, copy, flag). |
| **SWR / TanStack Query** | Feed + polling 5s (bisa dimatikan), inspector per event, status Merkle. |
| **axios** | Client `/api/v1` + param filter + unduhan blob (CSV/JSON/PDF/proof). |
| **date-fns** | Format timestamp UTC ms + relatif; picker `Today (24 May 2026)`. |
| **diff / JSON viewer** (`diff`, `react-json-view`) | Render diff field-by-field + raw JSON payload (gantikan `<pre>` statis). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/audit-logs/events` | Feed event + filter (q, entity, action, principal, severity, date) + pagination | On page load + filter/search/polling 5s |
| GET | `/api/v1/audit-logs/events/:id` | Detail event + diff 4 field + session envelope | On click baris feed |
| GET | `/api/v1/audit-logs/events/:id/proof` | Bukti bertanda tangan (hash chain + Merkle proof) | On click `Download Signed Proof` |
| POST | `/api/v1/audit-logs/verify-root` | Verifikasi root kriptografis (block height, mismatch) | On click `Verify Cryptographic Root` |
| GET | `/api/v1/audit-logs/export?format=csv\|json` | Export log sesuai filter (file) | On click `Export CSV / JSON Log` |
| POST | `/api/v1/audit-logs/compliance-report` | Generate laporan kepatuhan PDF (async job) | On click `Compliance PDF Report` |
| POST | `/api/v1/audit-logs/events/:id/flag` | Tandai event untuk review | On click `Flag Review` |
| POST | `/api/v1/audit-logs/events/:id/rollback-simulation` | Simulasi rollback dry-run (tidak mutasi ledger) | On click `Rollback Simulation` |
| GET | `/api/v1/audit-logs/stats` | 4 KPI (total, overrides, integrity, terminals) | On page load |
| GET | `/api/v1/ledger/merkle-status` | Status root (proof index, node, consensus time) | On page load (poll lambat) |

Contoh fetch:

```ts
// TODO: Replace feed mock with GET /api/v1/audit-logs/events (poll 5s via SWR)
import axios from "axios";
const { data } = await axios.get("/api/v1/audit-logs/events", {
  params: { q: "PR-2026-0314", entity: "PURCHASING", page: 1, perPage: 25 },
});
// { data: [{ id: "EVT-20260524-94812", action: "APPROVE", entityKey: "PR-2026-0314" }], meta: { total: 184920 } }
```

```ts
// TODO: Replace verify mock with POST /api/v1/audit-logs/verify-root
const res = await fetch("/api/v1/audit-logs/verify-root", { method: "POST" });
const { data } = await res.json(); // { data: { root: "9a01f7bb84...", block: 892104, mismatches: 0 } }
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace stats mock with GET /api/v1/audit-logs/stats
export const auditStats = {
  totalL30D: 184920, momPct: 14.2, ingestionPct: 1.0,
  overrides: 3, overridesNote: "2 Asset Tier-1 Shifts / 1 Off-hours Signoff",
  integrityPct: 1.0, block: 892104, mismatches: 0,
  liveNodes: 42, wsLatencyMs: 12,
};

// TODO: Replace feed mock with GET /api/v1/audit-logs/events?page=1&perPage=25 (poll 5s)
export const auditFeed = [
  { id: "EVT-20260524-94812", at: "2026-05-24 14:35:18.421 UTC", action: "APPROVE", entityKey: "PR-2026-0314", category: "Purchasing", actor: "David Chen", role: "Facilities Eng Mgr", ip: "10.14.8.42", terminal: "HVC-ENG-02", hash: "sha256:7f4c9a...", text: "Approved CapEx emergency procurement for Chiller mechanical shaft seal ($2,900.00)" },
  { id: "EVT-20260524-94811", at: "2026-05-24 14:22:04.118 UTC", action: "STATE_CHANGE", entityKey: "WO-2026-0894", category: "Work Orders", actor: "Marcus Kowalski", ip: "10.14.12.88", terminal: "HVC-TAB-04 (Mobile)", hash: "sha256:3a1b8e..." },
  { id: "EVT-20260524-94810", at: "2026-05-24 14:18:52.004 UTC", action: "CREATE / ALERT", entityKey: "AST-HVAC-004", category: "Asset Registry", actor: "System Telemetry Daemon", hash: "sha256:e92d41...", text: "refrigerant leak 18.4 ppm threshold breach" },
  { id: "EVT-20260524-94809", at: "2026-05-24 11:15:30.892 UTC", action: "MUTATION", entityKey: "PART-FLTR-401", category: "Inventory", actor: "Sarah Al-Mansoor", text: "GRN +100 pcs via PO-2026-0298" },
  { id: "EVT-20260524-94808", at: "2026-05-24 09:40:12.771 UTC", action: "POLICY_UPDATE", entityKey: "RBAC: Sr. Field Tech", category: "Governance", actor: "Marcus Vance", text: "parts cap $250 -> $500" },
  { id: "EVT-20260524-94807", at: "2026-05-24 08:02:44.310 UTC", action: "CALIBRATION", entityKey: "AST-ELEC-012", category: "Assets", actor: "Elena Voronova" },
];

// TODO: Replace inspector mock with GET /api/v1/audit-logs/events/EVT-20260524-94812
export const auditInspector = {
  entity: "PR-2026-0314", txn: "TXN-88120-NUSA",
  hash: "sha256:7f4c9a8820d88b42e47c1a93b4ff0291cc8823b199042b91024cd",
  via: "HTMX POST /api/v2/procurement/pr-0314/endorse", // TODO: picks v1 vs v2 canonical version
  diff: [
    { field: "approval_stage", old: "PENDING_DEPT_MGR", new: "ENDORSED_CAPEX_AUTHORIZED" },
    { field: "authorized_by", old: null, new: { user_id: "USR-0042", name: "David Chen" } },
    { field: "budget_envelope_allocated", old: 0, new: 2900.0 },
    { field: "next_signoff_tier", old: "David Chen (Level 2)", new: "Marcus Vance (VP Operations - Level 3)" },
  ],
  session: { badge: "RFID-4180", ip: "10.14.8.42", env: "Chrome 125.0 Enterprise / macOS", mfa: "Okta SCIM MFA Verified (FIDO2 WebAuthn Key)" },
};

// TODO: Replace merkle mock with GET /api/v1/ledger/merkle-status
export const merkleStatus = { proofIndex: 48102, node: "NUSA-LEDGER-A", consensusSec: 1.42, syncedPct: 1.0 };
```

Contoh binding:

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/audit-logs/events?page=1', fetcher) + 5s refresh
import { auditFeed } from "@/mocks/audit-trail.mock";

export function AuditFeed({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      {auditFeed.map((e) => (
        // TODO: Create detail routes /purchasing/[id], /work-orders/[id], /assets/[id]
        <button key={e.id} onClick={() => onSelect(e.id)}>
          <span className="font-mono">{e.entityKey}</span>
          <span>{e.action}</span>
        </button>
      ))}
    </div>
  );
}
```

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Jalur API `v2` menyelinap.** Pass-1 (`docs/ui-audit/audit-trail.md` §3)
  mencatat label `HTMX POST /api/v2/procurement/pr-0314/endorse` vs `v1` di
  kontrak lain. Pass-2 menemukan string yang sama persis di proof bar —
  terkonfirmasi, putuskan versi kanonis sebelum produksi.
- **Struktur 6 event + inspector 4 diff + envelope sesi** (RFID-4180,
  `10.14.8.42`, Chrome 125, FIDO2) dan **KPI 184,920 / 3 overrides /
  Block #892,104 / 42 nodes** identik di kedua pass.
- **`Rollback Simulation` tanpa desain hasil** dan **dead-end `/work-orders/[id]`
  + `/purchasing/[id]`** dikonfirmasi kedua pass.

### (b) Temuan BARU yang luput di pass-1

- **Perilaku JS presisi:** `switchView('diff'|'raw')` mengganti class tombol,
  `highlightRow(el)` single-select + menghapus bilah lama + prepend bilah baru,
  `Copy Full Hash` memakai `navigator.clipboard.writeText` inline,
  pagination `rows 25/50/100` + halaman `1 2 3 … 7396`.
- **Meta header lengkap:** `Epoch: 1748097318`, `TXN: TXN-88120-NUSA`,
  `Merkle Forest Root Status` (`Proof #48,102`, `NUSA-LEDGER-A`, `1.42s`),
  filter `Severity: All Levels` + `Reset`.
- **Line item mentah:** `SEAL-CHILL-8821 ×1 $2,900` di raw JSON — bibit
  relasi PR→SKU yang tidak dicatat pass-1.

### (c) KOREKSI atas pass-1 (dan koreksi diri pass-2)

- **Koreksi atas pass-2 sendiri (penting):** pass-2 §2 menyatakan semua entity
  feed MISSING — **terlalu luas dan salah sebagian**. Pass-1 (§2) lebih tepat:
  `AST-HVAC-004` / `AST-ELEC-012` → `/assets/[id]` **EXISTS**
  (mockup asset-detail ada), `PART-FLTR-401` → `/inventory?sku=` **EXISTS**,
  `RBAC: Sr. Field Tech` → `/organization` **EXISTS**. Yang benar-benar MISSING
  hanya `PR-2026-0314` → `/purchasing/[id]` dan `WO-2026-0894` →
  `/work-orders/[id]`. Berlaku klasifikasi pass-1.
- **Pelengkap pass-1:** temuan prefix `PR-` vs `PO-`, aritmetika `7396 halaman`,
  dan cross-match cap `$250→$500` dengan simulator org tidak diverifikasi ulang
  di pass-2 — tetap berlaku apa adanya dari pass-1.
