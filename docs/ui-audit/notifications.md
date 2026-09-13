# UI Audit — Notifications & SLA Alerts Hub (`notifications_sla_alerts_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/notifications_sla_alerts_hub/code.html` (701 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/notifications`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Notifications & SLA Alerts Hub** adalah pusat triase peringatan
real-time: menggabungkan feed notifikasi lintas domain (SLA kritis, approval PO,
stok, dispatch WO, keamanan) dengan **matriks preferensi routing kanal** dan
**rule engine eskalasi** dalam satu layar dua kolom. Badge `Station
AST-ENG-HUB-04` menandakan preferensi bersifat per-stasiun/terminal, bukan global.

Alur kerja yang didukung: pantau KPI (unread, ancaman breach, sign-off, kanal) →
filter/tab + cari peringatan → baca snippet telemetri → eksekusi aksi inline
(otorisasi PO, approve reorder, dispatch backup, revoke sesi) → atur routing kanal
dan eskalasi → uji bus via debugger sintetis.

### Daftar elemen UI utama

1. **Breadcrumb + header** — `Home / Governance & System / Notifications & SLA
   Alerts`, H1 + badge stasiun mono, utilitas global: `Mark All Read`
   (`onclick="markAllRead()"`), indikator `Quiet Hours: 00:00 - 06:00`,
   `Export Log (CSV)`.
2. **KPI bento (4 kartu)** — `Active Unread Alerts` (`38`, id
   `kpi-unread-count`: `8 P1 Critical`, `14 Ops`, `16 Info`); `SLA Breach
   Threats` (`3 Under 60m to Breach`, `IMMEDIATE`, `Highest: WO-2026-0894`,
   `-42m Margin`); `Pending Sign-Offs` (`5 Requires VP Auth`,
   `PR-2026-0314 + Hot Work Permit Plant B`); `Channel Telemetry` (`99.98%`:
   In-App 100% Active, SMTP Operational, Push/SMS Standby, progress 96%).
3. **Tab filter kategori** (id `category-filter-bar`, `data-filter`) —
   `All Alerts 38`, `Critical Breaches 8`, `Work Orders 12`, `Stock & Crib 6`,
   `PO Approvals 5`, `System & Security 7`; toolbar: search (`alert-search-input`,
   `Ctrl + /`), select Severity (P1/P2/P3), tombol compact view.
4. **Feed 5 kartu** (id `notification-feed-list`, masing-masing `data-category`
   + tombol dismiss):
   - **CRITICAL SLA AT RISK** `WO-2026-0894` P1 (Chiller #04 Compressor Seal
     Repair, `42m remaining` s.d. breach 4h, Marcus Kowalski, `Plant Room B-204
     (CUP)`; snippet: refrigerant `18.4 ppm` vs threshold 10.0, sensor
     `AST-HVAC-004`, node `10.14.8.22`, `FLIR-TG550`; aksi `View Work Order`,
     `Escalate to Eng Mgr`, `Dispatch Backup Tech`; `Auto-escalation in 08:34`).
   - **PO APPROVAL REQUIRED** `PR-2026-0314` `$2,900.00` (Silicon Carbide Shaft
     Seal Kit, Trane EarthWise Supply, requester Marcus Kowalski, CUP Capex
     `$64.2k remaining`, `3-Way Match Verified`; aksi `One-Click Authorize PO`
     (inline `onclick` ubah label jadi `Authorized`), `Review 3-Way Match`,
     `Reject Justification`).
   - **STOCK DEPLETION WARNING** `PART-SEAL-8821` (PTFE Gasket Flange Kit,
     On-Hand 2 / Reserved 1 / Net 1 vs Min 4, `CRIB-B / Bin C-04`; draft
     `PR-2026-0315` 10 units × $185.00; aksi `Auto-Approve Reorder (10 ea)`,
     `View Inventory Ledger`, `Transfer from Central Crib`).
   - **WORK ORDER DISPATCHED** `WO-2026-0898` P2 (AHU-02 VAV Box Damper Actuator
     Calibration, Elena Voronova, Roof Level, `Today 15:30 UTC`, JSA pending;
     aksi `View Field Checklist`, `Reassign Tech`).
   - **SECURITY POLICY OVERRIDE** `AUDIT-EVT-9042` (Physical & SCADA Access
     Bypass, David Chen, `HVC-ENG-02`, 90 menit; aksi `View Audit Trace Log`,
     `Revoke Active Session` destruktif).
5. **Kolom kanan sticky** — panel `Preferences & Routing` (`Matrix v4`):
   5 kelas routing kanal (Critical SLA P1 Locked App ON/Email Instant/SMS Forced;
   WO Dispatches; Inventory & Stock Triggers; PO Approvals & Capex; Security &
   RBAC Overrides — masing-masing App/Email/SMS + toggle); `Escalation Rule
   Engine` (15-Minute Unread Escalation → `Marcus Vance (+1 415-555-0192)`;
   Shift Auto-Mute Policy, `Shift A Mode`); `Active Bus Debugger`
   (`WS-PUSH: 12ms`, tombol `Trigger Test P1 Alert (HTMX)` →
   `triggerSimulationAlert()` menyisipkan kartu `TEST-ALARM-998`
   `SYNTHETIC P1 TELEMETRY` di puncak feed); widget `24-Hour SLA Compliance
   Rate` (sparkline SVG, `98.4% Target`, Shift A 100% / B 97.2% / C 98.0%).
6. **Script inline** — tab filter (`data-filter` show/hide kartu), live search
   client-side, `markAllRead()` (KPI → `0`, kartu `opacity-75`),
   `triggerSimulationAlert()` (sisip kartu sintetis + hapus `animate-pulse`).

### State UI

- **Empty state:** tab/kata kunci tanpa hasil → "Tidak ada peringatan pada filter
  ini" + tombol reset; feed 0 unread → hero "All clear" ala pola
  `ui_state_variants_patterns` §01.
- **Loading state:** kartu KPI `Skeleton`; feed 5 skeleton kartu; toggle preferensi
  optimistis dengan rollback bila PUT gagal.
- **Error state:** aksi inline gagal (authorize/revoke) → toast destruktif +
  kartu tetap unread; WebSocket putus → debugger menampilkan `Disconnected` +
  tombol `Reconnect`; auto-escalation countdown basi → tampilkan `STALE`.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global; semua `href="#"` — target adalah route usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Notifications & SLA Alerts (aktif) | `/notifications` (halaman ini) |
| Sidebar: 14 item lain | Route §2 `navigation-audit.md` |
| Breadcrumb `Home / Governance & System / Notifications & SLA Alerts` | `Home` → `/`; grup bukan route |
| `Mark All Read` | Aksi `PATCH` massal (tetap di halaman) |
| `Export Log (CSV)` | Unduh file (aksi) |
| `View Work Order` (kartu 1) | `/work-orders/[id]` (`WO-2026-0894`) — MISSING |
| `Escalate to Eng Mgr` / `Dispatch Backup Tech` | Aksi API inline (tetap di halaman) |
| `One-Click Authorize PO` (kartu 2) | Aksi `POST` otorisasi (tetap di halaman; label → `Authorized`) |
| `Review 3-Way Match` | `/purchasing/[id]` (tab match) — MISSING |
| `Auto-Approve Reorder (10 ea)` (kartu 3) | Aksi approve `PR-2026-0315` (tetap di halaman) |
| `View Inventory Ledger` | `/inventory?sku=PART-SEAL-8821` — EXISTS (dengan query) |
| `Transfer from Central Crib` | Flow transfer stok — MISSING (flow, bukan halaman; ikut inventory) |
| `View Field Checklist` (kartu 4) | `/(field)/run/[auditId]` — MISSING (tab field `run-checklist` tanpa mockup daftar) |
| `Reassign Tech` | Aksi/modal reassign (tetap di halaman) — MISSING (modal belum didesain) |
| `View Audit Trace Log` (kartu 5) | `/audit-logs?q=AUDIT-EVT-9042` — EXISTS (dengan query) |
| `Revoke Active Session` | Aksi `DELETE` sesi (tetap di halaman + konfirmasi) |
| Toggle kanal / kebijakan eskalasi | `PUT` preferensi (tetap di halaman) |
| `Trigger Test P1 Alert (HTMX)` | Sisip kartu sintetis inline (aksi debug, bukan navigasi) |
| Tab kategori / search / severity | Filter client-side (produksi: query params `?category=&q=&severity=`) |
| Ikon `notifications` (header) | `/notifications` (halaman ini) |
| `+ New Dispatch / Request` (header) | Target global tak terdefinisi — MISSING |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH).** `View Work Order` adalah CTA primer kartu
   kritis — tanpa tujuan, jalur triase→eksekusi terputus.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **`/purchasing/[id]` + tab 3-Way Match (HIGH).** `Review 3-Way Match` dan
   konteks `PR-2026-0314` menggantung (lihat juga audit-trail §3).
   `// TODO: Create detail page routing for /purchasing/[id]`
3. **Tab field `run-checklist` (MEDIUM).** `View Field Checklist` menunjuk ke alur
   mobile yang tidak punya mockup daftar (`/(field)/audits` MISSING).
   `// TODO: Create field routes /(field)/audits, /(field)/run/[auditId]`
4. **Modal Reassign Tech + flow Transfer Crib (MEDIUM).** Dua aksi sekunder tanpa
   desain tujuan; usulan: modal generik dipakai ulang WO/inventory.
   `// TODO: Create reassign tech modal + crib transfer flow`
5. **Target global `+ New Dispatch / Request` (MEDIUM)** — pola global belum diputuskan.

**Temuan (jangan diam-diam diperbaiki):**

- **Screenshot salah sorot nav (lagi).** `screen.png` menyorot `Audit Trail &
  Logs`, bukan `Notifications & SLA Alerts` — artefak Stitch yang sama seperti
  reports; breadcrumb/H1 sudah benar.
- **Aritmetika tab pas.** 8+12+6+5+7 = 38 = KPI unread ✓; P1 8 konsisten dengan
  badge `Critical Breaches 8` ✓.
- **Nomor telepon AS vs operasi Jakarta.** Eskalasi menunjuk
  `Marcus Vance (+1 415-555-0192)` sementara shift memakai WIB dan nomor lain
  memakai format ID — normalisasi direktori kontak saat seeding.
- **Zona waktu campur.** `Quiet Hours 00:00-06:00` tanpa zona; shift tertulis WIB
  tetapi execution window `Today 15:30 UTC` — sepakati "tampil lokal (WIB),
  simpan UTC" saat rebuild.
- **Aksi destruktif tanpa konfirmasi.** `Revoke Active Session` dan
  `One-Click Authorize PO` ($2,900) dieksekusi sekali klik; produksi wajib
  dialog konfirmasi + idempotency key (catat sebagai risiko, bukan desain).
- Kontinu lintas hub baik: `WO-2026-0894`, `PR-2026-0314`, `AST-HVAC-004`
  18.4 ppm, `PART-SEAL-8821` konsisten dengan audit-trail dan purchasing.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis + **Tailwind Play CDN**, font **Inter** + **JetBrains Mono**,
  ikon **Material Symbols Outlined**, JS vanilla (filter tab, search,
  `markAllRead`, injeksi DOM kartu sintetis).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/notifications`; typing `Alert`, `ChannelPreference`, `EscalationRule`. |
| **Tailwind CSS (build)** | Layout 8/4 kolom, kartu berwarna per kategori, rail kanan sticky; token sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Switch`, `Skeleton`, `Toast`, `AlertDialog`, `Tooltip`, `ScrollArea` | KPI, tab kategori, toggle kanal, dialog konfirmasi authorize/revoke, toast aksi. |
| **lucide-react** | Pengganti Material Symbols (bell, timer, order_approve, inventory, shield). |
| **SWR atau TanStack Query** | Feed + unread count (polling 15–30s atau WebSocket), preferensi (`PUT` optimistis), mutation aksi inline. |
| **WebSocket client (native / `socket.io-client` / SSE)** | Menggantikan label `WS-PUSH`: stream peringatan real-time + debugger (di mockup hanya simulasi DOM). |
| **axios** (atau `fetch` + `ky`) | HTTP client `/api/v1` + idempotency key untuk aksi otorisasi. |
| **date-fns + date-fns-tz** | Countdown SLA (`42m remaining`), `Auto-escalation in 08:34`, timestamp relatif, konversi UTC↔WIB. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/notifications/summary` | On page load | Response: `{ "data": { "unread": 38, "p1": 8, "ops": 14, "info": 16, "slaThreats": 3, "highestThreat": { "id": "WO-2026-0894", "marginMin": -42 }, "pendingSignoffs": 5, "channels": { "inApp": "ACTIVE", "smtp": "OPERATIONAL", "sms": "STANDBY" }, "deliveryRate": 0.9998 } }` |
| GET | `/api/v1/notifications` | On page load + tab/search/severity | Query: `?category=critical&q=chiller&severity=P1&page=1`. Response: `{ "data": [{ "id": "ALR-9001", "category": "CRITICAL_SLA", "refType": "WORK_ORDER", "refId": "WO-2026-0894", "title": "Chiller #04 Compressor Seal Repair", "slaRemainMin": 42, "assignee": "Marcus Kowalski", "read": false, "createdAt": "..." }], "meta": { "total": 38 } }` |
| PATCH | `/api/v1/notifications/:id/read` | On dismiss per kartu | Body: `{ "read": true }`. Response: `{ "data": { "id": "ALR-9001", "read": true } }` |
| POST | `/api/v1/notifications/mark-all-read` | On click `Mark All Read` | Response: `{ "data": { "marked": 38, "unread": 0 } }` |
| POST | `/api/v1/work-orders/:id/escalate` | On click `Escalate to Eng Mgr` | Body: `{ "to": "eng-mgr-on-duty" }`. Response: `{ "data": { "id": "WO-2026-0894", "escalated": true } }` |
| POST | `/api/v1/work-orders/:id/dispatch-backup` | On click `Dispatch Backup Tech` | Body: `{}`. Response: `{ "data": { "id": "WO-2026-0894", "backupDispatched": true } }` |
| POST | `/api/v1/purchase-requests/:id/authorize` | On click `One-Click Authorize PO` | Body: `{ "idempotencyKey": "uuid" }`. Response: `{ "data": { "id": "PR-2026-0314", "status": "AUTHORIZED" } }` |
| POST | `/api/v1/purchase-requests/:id/reject` | On click `Reject Justification` | Body: `{ "reason": "..." }`. Response: `{ "data": { "id": "PR-2026-0314", "status": "REJECTED" } }` |
| POST | `/api/v1/purchase-requests/:id/approve-reorder` | On click `Auto-Approve Reorder` | Body: `{ "qty": 10 }`. Response: `{ "data": { "id": "PR-2026-0315", "status": "APPROVED" } }` |
| POST | `/api/v1/work-orders/:id/reassign` | On click `Reassign Tech` | Body: `{ "assigneeId": "tech-xxx" }`. Response: `{ "data": { "id": "WO-2026-0898", "assignee": "..." } }` |
| DELETE | `/api/v1/sessions/:sessionId` | On click `Revoke Active Session` | Response: `{ "data": { "revoked": true } }` |
| GET | `/api/v1/notification-preferences` | On page load (rail kanan) | Response: `{ "data": { "station": "AST-ENG-HUB-04", "channels": [{ "class": "CRITICAL_SLA", "app": "ON", "email": "INSTANT", "sms": "FORCED_ON", "locked": true }], "quietHours": { "from": "00:00", "to": "06:00", "tz": "Asia/Jakarta" }, "escalation": { "unreadMin": 15, "target": "Marcus Vance" } } }` |
| PUT | `/api/v1/notification-preferences` | On toggle kanal / ubah kebijakan | Body: parsial preferensi. Response: `{ "data": { "updated": true } }` |
| POST | `/api/v1/notifications/test-alert` | On click `Trigger Test P1 Alert` (debug) | Body: `{ "severity": "P1", "synthetic": true }`. Response: `{ "data": { "id": "TEST-ALARM-998" } }` |
| GET | `/api/v1/notifications/export` | On click `Export Log (CSV)` | Query: filter aktif. Response: file CSV (attachment). |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/notifications.mock.ts`.

```ts
// TODO: Replace summary mock with GET /api/v1/notifications/summary
export const notifSummary = {
  unread: 38, p1: 8, ops: 14, info: 16, slaThreats: 3,
  highestThreat: { id: "WO-2026-0894", marginMin: -42 },
  pendingSignoffs: 5, deliveryRate: 0.9998,
};

// TODO: Replace feed mock with GET /api/v1/notifications?category=all
export const alertFeed = [
  { id: "ALR-9001", category: "critical", refId: "WO-2026-0894", title: "Chiller #04 Compressor Seal Repair", slaRemainMin: 42, assignee: "Marcus Kowalski", read: false },
  { id: "ALR-9002", category: "approvals", refId: "PR-2026-0314", title: "Silicon Carbide Shaft Seal Kit (Pack of 2)", amount: 2900.0, read: false },
  { id: "ALR-9003", category: "inventory", refId: "PART-SEAL-8821", title: "PTFE Gasket Flange Kit (ANSI Class 300)", onHand: 2, minThreshold: 4, read: false },
  { id: "ALR-9004", category: "wo", refId: "WO-2026-0898", title: "AHU-02 VAV Box Damper Actuator Calibration", assignee: "Elena Voronova", read: false },
  { id: "ALR-9005", category: "security", refId: "AUDIT-EVT-9042", title: "Physical & SCADA Access Bypass Granted", actor: "David Chen", read: false },
];

// TODO: Replace preferences mock with GET /api/v1/notification-preferences
export const channelPrefs = {
  station: "AST-ENG-HUB-04",
  quietHours: { from: "00:00", to: "06:00", tz: "Asia/Jakarta" },
  channels: [
    { class: "CRITICAL_SLA", app: "ON", email: "INSTANT", sms: "FORCED_ON", locked: true },
    { class: "WO_DISPATCH", app: "LIVE", email: "SHIFT_DIGEST", sms: "MUTED" },
    { class: "INVENTORY", app: "LIVE", email: "DAILY_08:00", sms: "OFF" },
    { class: "PO_APPROVAL", app: "PUSH", email: "INSTANT", sms: "PUSH_URGENT" },
    { class: "SECURITY_RBAC", app: "LIVE", email: "WEEKLY", sms: "OFF" },
  ],
};

// TODO: Create detail page routing for /work-orders/[id] (target View Work Order)
// TODO: Create detail page routing for /purchasing/[id] (target Review 3-Way Match)
// TODO: Create field routes /(field)/audits, /(field)/run/[auditId] (target View Field Checklist)
// TODO: Create reassign tech modal + crib transfer flow
```

Contoh binding (ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/notifications?category=all', fetcher)
import { alertFeed } from "@/mocks/notifications.mock";

export function AlertFeed() {
  return (
    <div>
      {alertFeed.map((a) => (
        <div key={a.id}>
          <Badge>{a.category}</Badge>
          <span className="font-mono font-bold">{a.refId}</span>
          <span>{a.title}</span>
        </div>
      ))}
    </div>
  );
}
```

Aturan penggantian mock → API: feed memakai polling/WebSocket dengan filter
sebagai query params (bukan filter DOM); aksi inline memakai `useMutation` +
`AlertDialog` konfirmasi untuk authorize/revoke; kartu sintetis debugger hanya
ada di `development` (gated by env).
