# UI Audit — Audit Trail & System Logs Hub (`audit_trail_system_logs_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/audit_trail_system_logs_hub/code.html` (777 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/audit-logs`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **System Audit Trail & Immutable Event Ledger** adalah ledger forensik
perusahaan: setiap mutasi lintas domain (purchasing, WO, aset, inventory, RBAC,
kalibrasi) dicatat sebagai event ber-hash `SHA-256` yang dirantai Merkle
(`SHA-256 Merkle Chain`, `Block #892,104`, `0 Hash Mismatch`), sehingga cocok
untuk audit kepatuhan dan investigasi insiden. Badge `AUDIT BUS: REAL-TIME SECURE`
plus konteks `Tenant ID: APX-NUSA-01` dan `Epoch: 1748097318` menegaskan sifat
multi-tenant dan append-only.

Alur kerja yang didukung: pantau KPI governance → cari/filter event (entity, hash,
user, IP) → pilih scope cepat → klik baris feed untuk inspeksi diff before/after
+ bukti kriptografis + envelope sesi → unduh bukti bertanda tangan / simulasi
rollback / flag review → verifikasi root Merkle / ekspor kepatuhan.

### Daftar elemen UI utama

1. **Breadcrumb + hub header** — `Home / Governance & System / Audit Trail &
   System Logs`, H1 + badge audit bus, meta tenant/cipher/epoch (monospace).
2. **Action cluster** — `Export CSV / JSON Log`, `Compliance PDF Report`,
   `Verify Cryptographic Root` (primary).
3. **KPI governance (4 kartu)** — `Total Audited Events (L30D)` (`184,920`,
   `+14.2% MoM`, `100% Ingestion Rate`); `Security Overrides` (`3 Flagged`:
   2 Asset Tier-1 Shifts + 1 Off-hours Signoff); `Tamper-Proof Integrity`
   (`100% Verified`, `Block #892,104`, `0 Hash Mismatch`); `Active Telemetry
   Terminals` (`42 Live Nodes`, `WS Broker: 12ms Latency`, `Healthy`).
4. **Toolbar filter lanjutan** — search global (`Filter by Entity ID, Hash, User,
   IP address...`, shortcut `⌘/`), dropdown tanggal (`Today (24 May 2026)`),
   Entity (`All Entities`), Action (`All Actions`), Principal (`All Principals`);
   baris `Quick Scope` pills (`All Logs 184.9k`, `Work Orders 42.1k`,
   `Purchasing & POs 18.2k`, `Asset State 12.4k`, `Security & RBAC 4.8k`) +
   `Severity: All Levels` + `Reset`.
5. **Live Activity Stream** (kiri, 7/12 kolom) — header (pulse hijau, `6 Recent
   Focused Events`, checkbox `Live HTMX Polling (5s)`, tombol `Force Refetch`
   `sync`); 6 baris event kronologis: `APPROVE` `PR-2026-0314` (David Chen,
   CapEx `$2,900.00`, `10.14.8.42`, `HVC-ENG-02`); `STATE_CHANGE` `WO-2026-0894`
   (`CREATED` → `DISPATCHED`, Marcus Kowalski, `HVC-TAB-04 Mobile`);
   `CREATE / ALERT` `AST-HVAC-004` kritis (refrigerant leak 18.4 ppm,
   SCADA Auto-Bot, broker `10.14.0.8`); `MUTATION` `PART-FLTR-401`
   (`+100 pcs` via `PO-2026-0298`, Sarah Al-Mansoor, `DCK-SCN-02`);
   `POLICY_UPDATE` `RBAC: Sr. Field Tech` (cap `$250.00` → `$500.00`,
   Marcus Vance); `CALIBRATION` `AST-ELEC-012` (Elena Voronova, `SUB-STN-01`).
   Tiap baris: timestamp UTC presisi ms, badge aksi, entity mono, kategori,
   hash terpotong + ikon `verified`, deskripsi, aktor + peran, IP + terminal.
   Baris 1 terpilih (highlight + indikator kiri); klik baris memanggil
   `highlightRow(this)`. Footer pagination (`Showing 1-6 of 184,920`,
   rows-per-page 25/50/100, halaman 1/2/3/.../7396).
6. **State Transition & Diff Inspector** (kanan, 5/12 kolom) — header
   (`IMMUTABLE`, Entity `PR-2026-0314` Purchase Request, `TXN: TXN-88120-NUSA`);
   proof bar (hash penuh + `Copy Full Hash`, `HTMX POST
   /api/v2/procurement/pr-0314/endorse`, `Merkle Root Confirmed`); toggle
   `Formatted Diff (Field-by-Field)` / `Raw JSON Payload` (`switchView`);
   4 diff item (`approval_stage`, `authorized_by` `USR-0042`, `budget_envelope_
   allocated` `$2,900.00 [CUP Maintenance Capex]`, `next_signoff_tier`
   Marcus Vance Level 3); raw JSON (`EVT-20260524-94812`, delta, `merkle_
   verification` proof valid); sub-card `Authentication & Session Envelope`
   (David Chen `RFID-4180`, `10.14.8.42 Internal VPN East`,
   `Chrome 125.0 Enterprise / macOS`, `Bldg A Floor 4`, `Okta SCIM MFA Verified
   (FIDO2 WebAuthn Key)`); footer aksi (`Download Signed Proof`,
   `Rollback Simulation`, `Flag Review` destruktif).
7. **Widget `Merkle Forest Root Status`** — `SYNCED 100%`, representasi segmen
   visual, `Proof Index #48,102`, `Sync Node NUSA-LEDGER-A`,
   `Consensus Time 1.42s`.

### State UI

- **Empty state:** hasil filter kosong → ilustrasi + "Tidak ada event cocok —
  longgarkan filter" + tombol `Reset`; entity tanpa riwayat → inspector
  menampilkan "Belum ada mutasi tercatat".
- **Loading state:** feed memakai 6 baris skeleton (timestamp, badge, baris teks);
  inspector memakai skeleton diff; tombol `Verify Cryptographic Root` spinner;
  polling 5s memakai indikator halus, bukan full reload.
- **Error state:** verifikasi root gagal → banner merah `HASH MISMATCH` + blok
  terdampak; stream terputus → badge `STALE` + tombol `Force Refetch`;
  `Copy Full Hash` gagal → fallback textarea selektabel.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global; semua `href="#"` — target adalah route usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Audit Trail & Logs (aktif) | `/audit-logs` (halaman ini) |
| Sidebar: 14 item lain | Route §2 `navigation-audit.md` |
| Breadcrumb `Home / Governance & System / Audit Trail & System Logs` | `Home` → `/`; grup bukan route |
| `Export CSV / JSON Log` | Unduh file (aksi async, tetap di halaman) |
| `Compliance PDF Report` | Async job → unduh PDF (aksi) |
| `Verify Cryptographic Root` | Aksi verifikasi inline (hasil di widget Merkle), bukan navigasi |
| Baris feed: entity `PR-2026-0314` | `/purchasing/[id]` — MISSING |
| Baris feed: entity `WO-2026-0894` | `/work-orders/[id]` — MISSING |
| Baris feed: entity `AST-HVAC-004`, `AST-ELEC-012` | `/assets/[id]` (`/assets/AST-HVAC-004`) — EXISTS (halaman detail aset ada) |
| Baris feed: entity `PART-FLTR-401` | `/inventory?sku=PART-FLTR-401` — EXISTS (dengan query) |
| Baris feed: `RBAC: Sr. Field Tech` | `/organization` (tab role) — EXISTS |
| `Download Signed Proof` | Unduh bukti (aksi) |
| `Rollback Simulation` | Modal hasil simulasi (tetap di halaman) — MISSING (desain modal belum ada) |
| `Flag Review` | Aksi flag inline + toast (tetap di halaman) |
| Pagination / rows-per-page / filter pills | Query params (`?scope=&entity=&page=`), bukan navigasi |
| Ikon `notifications` (header) | `/notifications` |
| `+ New Dispatch / Request` (header) | Target global tak terdefinisi — MISSING |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH).** Event `STATE_CHANGE` `WO-2026-0894` tidak bisa
   diklik-ke-mana — dead-end yang sama dirujuk ≥10 titik lintas hub.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **`/purchasing/[id]` (HIGH).** Entity `PR-2026-0314` (perhatian: mockup memakai
   prefix `PR-`, lihat Temuan) tidak punya halaman PR/PO/GRN + 3-Way Match.
   `// TODO: Create detail page routing for /purchasing/[id]`
3. **Modal Rollback Simulation (MEDIUM).** Tombol ada, desain hasil simulasi
   (dampak, dry-run diff, konfirmasi) tidak ada di mockup.
   `// TODO: Create rollback simulation modal for audit inspector`
4. **Target global `+ New Dispatch / Request` (MEDIUM)** — pola global belum diputuskan.
5. **Ekspor terjadwal (LOW).** Hanya ada ekspor ad-hoc; tidak ada penjadwalan
   ekspor log berkala (bandingkan reports hub yang punya scheduler).

**Temuan (jangan diam-diam diperbaiki):**

- **Prefix `PR-2026-0314` vs `PO-2026-0298`.** Mockup memakai `PR-` untuk purchase
  request yang di-approve, sementara purchasing hub memakai `PO-`. Produksi harus
  memutuskan pemisahan `PR-*` (requisition) vs `PO-*` (order) dan menautkannya
  (`PR-2026-0314` → PO turunan), bukan menyamakan diam-diam.
- **Jalur API `v2` menyelinap.** Proof bar menulis `HTMX POST
  /api/v2/procurement/pr-0314/endorse` sementara seluruh kontrak lain `v1`.
  Putuskan: tetap `v1` konsisten, atau dokumentasikan `v2` sebagai migrasi —
  jangan biarkan dua versi tanpa catatan.
- **Quick scope 184.9k ≈ KPI 184,920** ✓ konsisten; pagination `7396` halaman
  (≈184920/25) ✓ aritmetika benar.
- **Cap `$250 → $500`** pada event `POLICY_UPDATE` cocok dengan simulator ABAC
  di organization hub (`$500.00 per work order`) — konsistensi lintas layar yang
  baik, jadikan policy kanonis.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis + **Tailwind Play CDN**, font **Inter** + **JetBrains Mono**,
  ikon **Material Symbols Outlined**, JS vanilla (`switchView`, `highlightRow`,
  `navigator.clipboard.writeText`).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/audit-logs`; typing `AuditEvent`, `EventDiff`, `SessionEnvelope`, `MerkleStatus`. |
| **Tailwind CSS (build)** | Styling feed padat, diff before/after, badge aksi; token sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Table`/`ScrollArea`, `Tabs`, `Skeleton`, `Toast`, `Dialog`, `Pagination`, `Tooltip` | KPI, toolbar filter, feed scroll, toggle diff/raw, pagination, modal rollback, tooltip hash. |
| **lucide-react** | Pengganti Material Symbols (verified_user, history_edu, shield, hub, policy, lock). |
| **SWR atau TanStack Query** | Feed dengan polling 5s (`refreshInterval`), filter ter-debounce, `keepPreviousData` saat ganti halaman. |
| **axios** (atau `fetch` + `ky`) | HTTP client `/api/v1`, interceptor auth + `x-tenant-id: APX-NUSA-01`. |
| **date-fns + date-fns-tz** | Timestamp UTC presisi + format relatif; epoch display. |
| **Perf/keamanan** | Virtualisasi feed bila halaman besar (mis. `@tanstack/react-virtual`); hash tidak pernah dihitung di klien — hanya display + copy. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/audit-logs/summary` | On page load | Response: `{ "data": { "totalL30d": 184920, "momPct": 14.2, "ingestionRate": 1.0, "securityOverrides": 3, "integrityPct": 1.0, "headBlock": 892104, "hashMismatch": 0, "liveNodes": 42, "brokerLatencyMs": 12 } }` |
| GET | `/api/v1/audit-logs` | On page load + search/filter/scope/pagination | Query: `?q=PR-2026-0314&entity=PURCHASING&action=APPROVE&principal=&severity=&from=&to=&page=1&perPage=25`. Response: `{ "data": [{ "eventId": "EVT-20260524-94812", "at": "2026-05-24T14:35:18.421Z", "action": "APPROVE", "entityType": "PURCHASE_REQUEST", "entityKey": "PR-2026-0314", "category": "Purchasing", "summary": "Approved CapEx emergency procurement ... ($2,900.00)", "actor": { "name": "David Chen", "role": "Facilities Eng Mgr" }, "ip": "10.14.8.42", "terminal": "HVC-ENG-02", "hash": "sha256:7f4c9a..." }], "meta": { "total": 184920, "page": 1, "perPage": 25 } }` |
| GET | `/api/v1/audit-logs/:eventId` | On click baris feed (inspector) | Response: `{ "data": { "eventId": "...", "entity": {...}, "delta": [{ "field": "approval_stage", "old": "PENDING_DEPT_MGR", "new": "ENDORSED_CAPEX_AUTHORIZED" }], "session": { "badge": "RFID-4180", "ip": "10.14.8.42", "userAgent": "Chrome 125.0 ...", "mfa": "FIDO2_WEBAUTHN" }, "merkle": { "root": "9a01f7bb84...", "index": 48102, "proofValid": true } } }` |
| GET | `/api/v1/audit-logs/:eventId/proof` | On click `Download Signed Proof` | Response: file/dokumen bukti bertanda tangan (attachment). |
| POST | `/api/v1/audit-logs/verify-root` | On click `Verify Cryptographic Root` | Body: `{}`. Response: `{ "data": { "valid": true, "headBlock": 892104, "consensusMs": 1420 } }` |
| POST | `/api/v1/audit-logs/:eventId/flag` | On click `Flag Review` | Body: `{ "reason": "..." }`. Response: `{ "data": { "eventId": "...", "flagged": true } }` |
| POST | `/api/v1/audit-logs/:eventId/rollback-simulation` | On click `Rollback Simulation` | Response: `{ "data": { "dryRun": true, "impactedFields": 4, "reversible": false } }` |
| POST | `/api/v1/audit-logs/export` | On click Export CSV/JSON / Compliance PDF | Body: `{ "format": "CSV", "filters": {...} }`. Response: `{ "data": { "jobId": "AUD-EXP-77", "status": "QUEUED" } }` |
| GET | `/api/v1/ledger/merkle-status` | On page load widget (poll lambat) | Response: `{ "data": { "syncedPct": 1.0, "proofIndex": 48102, "syncNode": "NUSA-LEDGER-A", "consensusSec": 1.42 } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/audit-trail.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/audit-logs/summary
export const auditSummary = {
  totalL30d: 184920, momPct: 14.2, ingestionRate: 1.0,
  securityOverrides: 3, integrityPct: 1.0, headBlock: 892104,
  hashMismatch: 0, liveNodes: 42, brokerLatencyMs: 12,
};

// TODO: Replace feed mock with GET /api/v1/audit-logs?scope=all&page=1&perPage=25
export const auditFeed = [
  { eventId: "EVT-20260524-94812", at: "2026-05-24T14:35:18.421Z", action: "APPROVE", entityKey: "PR-2026-0314", category: "Purchasing", actor: "David Chen", ip: "10.14.8.42", hash: "sha256:7f4c9a..." },
  { eventId: "EVT-20260524-94802", at: "2026-05-24T14:22:04.118Z", action: "STATE_CHANGE", entityKey: "WO-2026-0894", category: "Work Orders", actor: "Marcus Kowalski", ip: "10.14.12.88", hash: "sha256:3a1b8e..." },
  { eventId: "EVT-20260524-94791", at: "2026-05-24T14:18:52.004Z", action: "CREATE / ALERT", entityKey: "AST-HVAC-004", category: "Asset Registry", actor: "System Telemetry Daemon", ip: "10.14.0.8", hash: "sha256:e92d41..." },
  { eventId: "EVT-20260524-94710", at: "2026-05-24T11:15:30.892Z", action: "MUTATION", entityKey: "PART-FLTR-401", category: "Inventory", actor: "Sarah Al-Mansoor", ip: "10.14.22.15", hash: "sha256:88a10c..." },
  { eventId: "EVT-20260524-94655", at: "2026-05-24T09:40:12.771Z", action: "POLICY_UPDATE", entityKey: "RBAC: Sr. Field Tech", category: "Governance", actor: "Marcus Vance", ip: "10.14.1.2", hash: "sha256:bb401f..." },
  { eventId: "EVT-20260524-94601", at: "2026-05-24T08:02:44.310Z", action: "CALIBRATION", entityKey: "AST-ELEC-012", category: "Assets", actor: "Elena Voronova", ip: "10.14.18.55", hash: "sha256:44dc92..." },
];

// TODO: Replace inspector mock with GET /api/v1/audit-logs/:eventId
export const inspectorDetail = {
  eventId: "EVT-20260524-94812", entityKey: "PR-2026-0314", txn: "TXN-88120-NUSA",
  hashFull: "sha256:7f4c9a8820d88b42e47c1a93b4ff0291cc8823b199042b91024cd",
  delta: [
    { field: "approval_stage", old: "PENDING_DEPT_MGR", new: "ENDORSED_CAPEX_AUTHORIZED" },
    { field: "authorized_by", old: null, new: { user_id: "USR-0042", name: "David Chen" } },
    { field: "budget_envelope_allocated", old: 0.0, new: 2900.0 },
    { field: "next_signoff_tier", old: "David Chen (Level 2)", new: "Marcus Vance (VP Operations - Level 3)" },
  ],
  session: { badge: "RFID-4180", ip: "10.14.8.42", mfa: "FIDO2_WEBAUTHN" },
};

// TODO: Create detail page routing for /work-orders/[id] (target klik entity WO-2026-0894)
// TODO: Create detail page routing for /purchasing/[id] (target klik entity PR-2026-0314)
// TODO: Create rollback simulation modal for audit inspector
```

Contoh binding (ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/audit-logs?scope=all&page=1', fetcher, { refreshInterval: 5000 })
import { auditFeed } from "@/mocks/audit-trail.mock";

export function AuditFeed() {
  return (
    <div>
      {auditFeed.map((e) => (
        <div key={e.eventId}>
          <span className="font-mono">{e.at}</span>
          <Badge>{e.action}</Badge>
          <span className="font-mono font-bold">{e.entityKey}</span>
        </div>
      ))}
    </div>
  );
}
```

Aturan penggantian mock → API: feed memakai `refreshInterval: 5000` yang
dimatikan saat checkbox polling off; inspector di-fetch per `eventId` terpilih;
tombol `Copy Full Hash` memakai `navigator.clipboard` dengan fallback select.
