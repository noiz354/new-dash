# UI Audit Pass-2 — Notifications & SLA Alerts Hub (`notifications_sla_alerts_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/notifications_sla_alerts_hub/code.html` (701 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Konsistensi rute global: `docs/ui-audit/navigation-audit.md` (§2: `/notifications`).

## 1. Page Overview & UI Elements (Penjelasan Halaman)

### Tujuan utama

Pusat notifikasi real-time + ancaman breach SLA: triase 38 alert belum dibaca,
3 ancaman <60 menit, 5 sign-off VP, dan matriks preferensi channel. Kartu
kritis (chiller, PO, stok, dispatch, keamanan) masing-masing membawa aksi
langsung sehingga operator tidak perlu pindah halaman untuk eskalasi/otorisasi.
Alur: lihat KPI → filter/tab/cari → aksi kartu (view/eskalasi/otorisasi) →
atur routing channel + eskalasi → uji bus via debugger.

### Daftar elemen UI utama

1. **Breadcrumb + header** — `Home / Governance & System / Notifications & SLA Alerts`;
   H1 + badge `Station AST-ENG-HUB-04`; utilitas `Mark All Read`
   (`onclick="markAllRead()"`), `Quiet Hours: 00:00 - 06:00`, `Export Log (CSV)`.
2. **KPI grid (4 kartu)** — `Active Unread Alerts` `38` (`id="kpi-unread-count"`,
   `8 P1 Critical / 14 Ops / 16 Info`); `SLA Breach Threats` `3`
   (`Under 60m`, `Highest WO-2026-0894`, `-42m Margin`, `IMMEDIATE`);
   `Pending Sign-Offs` `5` (`Requires VP Auth`, `PR-2026-0314 + Hot Work Permit`);
   `Channel Telemetry` `99.98%` (`In-App 100%`, `Email Operational`,
   `Push Standby 0q`, bar 96%).
3. **Tab + toolbar filter** — pills `#category-filter-bar`
   (`data-filter="all/critical/wo/inventory/approvals/security"` dengan count
   `38/8/12/6/5/7`); search `#alert-search-input`
   (`Quick search alert body, tags, codes... [Ctrl + /]`);
   select `Severity: All/P1/P2/P3`; tombol compact view.
4. **Feed 5 kartu (`#notification-feed-list`, `data-category`)**:
   - `critical` — `WO-2026-0894 Chiller #04 Compressor Seal Repair`
     (`42m remaining` s.d. breach 4h, Marcus Kowalski, `Plant Room B-204 (CUP)`,
     `18.4 ppm` vs threshold 10.0, `AST-HVAC-004`, node `10.14.8.22`,
     `FLIR-TG550`); aksi `View Work Order` / `Escalate to Eng Mgr` /
     `Dispatch Backup Tech`; `Auto-escalation in 08:34`.
   - `approvals` — `PR-2026-0314 Silicon Carbide Shaft Seal Kit ($2,900)`
     (Trane, CUP `$64.2k remaining`, `3-Way Match Verified`,
     menunggu Marcus Vance); aksi `One-Click Authorize PO`
     (inline `onclick` rewrite label!) / `Review 3-Way Match` / `Reject Justification`.
   - `inventory` — `PART-SEAL-8821 PTFE Gasket` (on-hand 2, reserved 1,
     net 1, min 4, `CRIB-B / Bin C-04`; draft `PR-2026-0315` 10 units `$185`);
     aksi `Auto-Approve Reorder (10 ea)` / `View Inventory Ledger` / `Transfer from Central Crib`.
   - `wo` — `WO-2026-0898 AHU-02 VAV Damper Calibration`
     (Elena Voronova, Substation East Roof, `Today 15:30 UTC`, JSA pending);
     aksi `View Field Checklist` / `Reassign Tech`.
   - `security` — `AUDIT-EVT-9042 Physical & SCADA Access Bypass`
     (David Chen, `HVC-ENG-02`, 90 mnt); aksi `View Audit Trace Log` /
     `Revoke Active Session` (merah).
5. **Rail kanan `Preferences & Routing` (`Matrix v4`)** — 5 kelas channel:
   Critical P1 Locked (App ON/Email Instant/SMS Forced ON);
   WO (Live/Shift Digest/Muted); Inventory (Live/Daily 08:00/Off);
   PO (Push/Instant/Push URGENT); Security (Live/Weekly/Off) — masing-masing
   dengan toggle kecuali P1.
6. **Rule engine** — `15-Minute Unread Escalation` →
   `Marcus Vance (+1 415-555-0192)`; `Shift Auto-Mute Policy`
   (hening di luar `Shift A (07:00 - 15:30 WIB)` kecuali P1).
7. **Debugger `Active Bus`** — `WS-PUSH: 12ms`, tombol
   `Trigger Test P1 Alert (HTMX)` (`onclick="triggerSimulationAlert()"`)
   menyuntik kartu `TEST-ALARM-998 Chilled Water Return 14.2°C` di puncak feed.
8. **Widget `24-Hour SLA Compliance`** — sparkline SVG (`slaGradient`),
   `98.4% Target`, `Shift A 100% / B 97.2% / C 98.0%`.
9. **Script inline** — filter tab (toggle class + `display:flex/none`),
   live search (`innerText.includes`), `markAllRead()` (KPI→`0` + `opacity-75`),
   `triggerSimulationAlert()` (prepend + hapus `animate-pulse` 1500ms).

### State UI

- **Empty state:** hasil tab/search kosong → ilustrasi + `Reset Filter`
  (saat ini kartu hanya `display:none`, tanpa pesan kosong — tambahkan).
- **Loading state:** feed skeleton 5 kartu; KPI skeleton; toggle channel skeleton;
  tombol uji bus spinner saat inject.
- **Error state:** WS putus → debugger `Disconnected` + jeda inject;
  otorisasi gagal → toast + kartu tetap; `markAllRead` gagal → rollback count.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path`, semua `href="#"`; target usulan).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Notifications & SLA Alerts | `/notifications` (halaman ini) |
| Sidebar 14 item lain | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/organization`, `/settings` |
| Breadcrumb `Home / Governance & System / Notifications` | `Home` → `/`; grup bukan route |
| `Mark All Read` | `POST /api/v1/notifications/read-all` (tetap di halaman) |
| `Export Log (CSV)` | `GET /api/v1/notifications/export?format=csv` (unduh) |
| Tab pills + search + severity | Filter lokal (`?category=&severity=&q=`), bukan navigasi |
| `View Work Order` (kartu kritis) | `/work-orders/[id]` (`WO-2026-0894`) — MISSING |
| `Escalate to Eng Mgr` / `Dispatch Backup Tech` | Aksi API inline, tetap di halaman |
| `One-Click Authorize PO` | `POST /api/v1/purchasing/[id]/authorize` (tetap; butuh konfirmasi!) |
| `Review 3-Way Match` | `/purchasing/[id]` (tab match) — MISSING |
| `Auto-Approve Reorder` | `POST /api/v1/inventory/reorders` (tetap) |
| `View Inventory Ledger` | `/inventory?sku=PART-SEAL-8821` |
| `Transfer from Central Crib` | Flow transfer (`/inventory/transfers/new?sku=`) — MISSING |
| `View Field Checklist` | `/(field)/run/[auditId]` (alur field) — tab tujuan MISSING |
| `View Audit Trace Log` | `/audit-logs?entity=AUDIT-EVT-9042` |
| `Revoke Active Session` | `POST /api/v1/auth/sessions/[id]/revoke` (tetap; butuh konfirmasi!) |
| Toggle channel / rule engine | `PATCH /api/v1/notifications/preferences` (tetap) |
| `Trigger Test P1 Alert` | Sintetik lokal (debug; bukan navigasi) |
| Ikon `notifications` (header) | `/notifications` (halaman ini) |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH)** — `View Work Order` untuk `WO-2026-0894`
   menggantung; sama dengan dead-end global terbesar.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **`/purchasing/[id]` + tab 3-Way Match (HIGH)** — `Review 3-Way Match`
   dan konteks `PR-2026-0314` butuh halaman PR/PO + alur approve/reject.
   `// TODO: Create detail page routing for /purchasing/[id]`
3. **Flow transfer crib (MEDIUM)** — `Transfer from Central Crib` tanpa tujuan;
   putuskan modal vs `/inventory/transfers/new?sku=`.
4. **Tujuan field `View Field Checklist` (MEDIUM)** — tab `run/checklist`
   ada di bottom-nav field tetapi daftar `audits`/`findings`/`sync` MISSING.
   `// TODO: Create field routes /(field)/audits, /(field)/findings/new, /(field)/sync`
5. **Konfirmasi aksi destruktif (HIGH, keamanan)** — `One-Click Authorize PO`
   ($2,900) dan `Revoke Active Session` sekali klik tanpa dialog; wajib modal
   konfirmasi + jejak audit sebelum produksi.

**Temuan visual (dicatat):** `screen.png` halaman ini menyorot biru
**`Audit Trail & Logs`**, bukan `Notifications & SLA Alerts` — pola salah sorot
yang sama dengan `reports` (kemungkinan templat screenshot belum diperbarui).
`code.html` sendiri memuat sidebar 15 `data-path` identik yang benar.

**Inkonsistensi kecil:** `Quiet Hours 00:00 - 06:00` (header) vs
`Shift Auto-Mute di luar Shift A 07:00-15:30 WIB` (rule engine) — selaraskan
definisi jam hening vs jam shift saat rebuild.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols.
- Filter/search/tab + simulasi WS murni DOM vanilla (`display`, `prepend`).
- Tanpa WebSocket nyata, tanpa fetch, tanpa routing.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/notifications`; typing `Alert`, `ChannelPrefs`, `EscalationRule`. |
| **Tailwind CSS (build)** | Feed kartu + rail preferensi; token sistem A. |
| **shadcn/ui** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Tabs`, `Switch`, `Skeleton`, `Toast`, `AlertDialog` | Kartu alert, pill tab, toggle channel, dialog konfirmasi otorisasi/revoke, skeleton, toast. |
| **lucide-react** | Ikon warning, order-approve, inventory, build, admin-panel, bell. |
| **SWR / TanStack Query** | Feed (polling/WebSocket), KPI counts, preferensi channel. |
| **WebSocket (socket.io / native WS)** | Gantikan `triggerSimulationAlert` demo dengan bus nyata (`WS-PUSH`). |
| **axios** | `POST /notifications/read-all`, otorisasi PO, revoke sesi, preferensi. |
| **date-fns** | `6 mins ago`, `42m remaining`, `Auto-escalation in 08:34`, countdown breach. |
| **zod + react-hook-form** | Validasi form preferensi/eskalasi (target, jam hening, threshold 15 mnt). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/notifications` | Feed alert + filter category/severity/q | On page load + tab/search/polling |
| GET | `/api/v1/notifications/counts` | KPI (38 unread, 8/14/16, 3 threats, 5 sign-offs) | On page load + polling |
| POST | `/api/v1/notifications/read-all` | Tandai semua dibaca | On click `Mark All Read` |
| PATCH | `/api/v1/notifications/:id/read` | Tandai satu alert (dismiss) | On click dismiss per kartu |
| GET | `/api/v1/notifications/export?format=csv` | Export log notifikasi | On click `Export Log (CSV)` |
| POST | `/api/v1/work-orders/:id/escalate` | Eskalasi ke Eng Mgr | On click `Escalate to Eng Mgr` |
| POST | `/api/v1/work-orders/:id/dispatch-backup` | Dispatch teknisi cadangan | On click `Dispatch Backup Tech` |
| POST | `/api/v1/purchasing/:id/authorize` | Otorisasi PO satu klik (wajib konfirmasi + audit) | On click `One-Click Authorize PO` |
| POST | `/api/v1/purchasing/:id/reject` | Tolak PO + justifikasi | On click `Reject Justification` |
| POST | `/api/v1/inventory/reorders` | Setujui reorder otomatis 10 ea | On click `Auto-Approve Reorder` |
| POST | `/api/v1/inventory/transfers` | Transfer antar crib | On click `Transfer from Central Crib` |
| POST | `/api/v1/auth/sessions/:id/revoke` | Cabut sesi aktif (wajib konfirmasi) | On click `Revoke Active Session` |
| GET | `/api/v1/notifications/preferences` | Matriks routing channel per kelas | On page load rail kanan |
| PATCH | `/api/v1/notifications/preferences` | Ubah toggle channel / quiet hours | On toggle / save preferensi |
| GET | `/api/v1/notifications/sla-compliance?window=24h` | Sparkline kepatuhan per shift | On page load widget |

Contoh fetch:

```ts
// TODO: Replace markAllRead mock with POST /api/v1/notifications/read-all
await fetch("/api/v1/notifications/read-all", { method: "POST" });
```

```ts
// TODO: Replace authorize mock with POST /api/v1/purchasing/PR-2026-0314/authorize (with confirm dialog)
import axios from "axios";
const { data } = await axios.post("/api/v1/purchasing/PR-2026-0314/authorize", {
  amount: 2900, currency: "USD",
});
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace counts mock with GET /api/v1/notifications/counts
export const notifCounts = {
  unread: 38, p1: 8, ops: 14, info: 16,
  slaThreats: 3, highestWo: "WO-2026-0894", marginMin: -42,
  pendingSignoffs: 5, pendingRef: "PR-2026-0314",
  channelHealthPct: 0.9998,
};

// TODO: Replace feed mock with GET /api/v1/notifications?category=all
export const notifFeed = [
  { id: "WO-2026-0894", category: "critical", title: "Chiller #04 Compressor Seal Repair", slaMinLeft: 42, assignee: "Marcus Kowalski", zone: "Plant Room B-204 (CUP)", ppm: 18.4, sensor: "AST-HVAC-004" },
  { id: "PR-2026-0314", category: "approvals", title: "Silicon Carbide Shaft Seal Kit (Pack of 2)", amount: 2900, vendor: "Trane EarthWise Supply", waiter: "Marcus Vance (VP Operations)" },
  { id: "PART-SEAL-8821", category: "inventory", title: "PTFE Gasket Flange Kit (ANSI Class 300)", onHand: 2, reserved: 1, min: 4, bin: "CRIB-B / Bin C-04", draftPr: "PR-2026-0315" },
  { id: "WO-2026-0898", category: "wo", title: "AHU-02 VAV Box Damper Actuator Calibration", tech: "Elena Voronova", at: "Today 15:30 UTC" },
  { id: "AUDIT-EVT-9042", category: "security", title: "Physical & SCADA Access Bypass Granted", actor: "David Chen", terminal: "HVC-ENG-02", capMin: 90 },
];

// TODO: Replace prefs mock with GET /api/v1/notifications/preferences
export const channelPrefs = [
  { klass: "Critical SLA & Safety", locked: true, app: "ON", email: "Instant", sms: "Forced ON" },
  { klass: "WO Dispatches & Status", app: "Live", email: "Shift Digest", sms: "Muted" },
  { klass: "Inventory & Stock Triggers", app: "Live", email: "Daily 08:00", sms: "Off" },
  { klass: "PO Approvals & Capex", app: "Push", email: "Instant", sms: "Push (URGENT)" },
  { klass: "Security & RBAC Overrides", app: "Live", email: "Weekly Summary", sms: "Off" },
];

// TODO: Replace escalation mock with GET /api/v1/notifications/escalation-rules
export const escalationRules = {
  unreadEscalationMin: 15, target: "Marcus Vance (+1 415-555-0192)",
  quietHours: "00:00 - 06:00", shiftAMute: "Shift A (07:00 - 15:30 WIB)",
};
```

Contoh binding + konfirmasi wajib:

```tsx
// TODO: Replace feed mock with useSWR('/api/v1/notifications', fetcher)
import { notifFeed } from "@/mocks/notifications.mock";

export function AlertFeed() {
  return (
    <div>
      {notifFeed.map((a) => (
        // TODO: Create detail page routing for /work-orders/[id]
        <div key={a.id} className="font-mono">{a.id} — {a.title}</div>
      ))}
    </div>
  );
}

// TODO: Wrap One-Click Authorize + Revoke Session in AlertDialog confirm before POST
```

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Screenshot salah sorot nav (lagi).** Pass-1 (`docs/ui-audit/notifications.md`
  §3) menyatakan `screen.png` menyorot `Audit Trail & Logs`. Pass-2
  memverifikasi ulang: benar — pola salah sorot yang sama dengan reports,
  kemungkinan templat screenshot belum diperbarui. `code.html` memuat 15
  `data-path` identik yang benar.
- **Aksi destruktif tanpa konfirmasi.** Pass-1 menandai `Revoke Active Session`
  dan `One-Click Authorize PO` ($2,900) sekali klik sebagai risiko. Pass-2
  mengonfirmasi: otorisasi memakai inline `onclick` rewrite label tanpa dialog,
  revoke tanpa konfirmasi — wajib `AlertDialog` + idempotency key.
- **Telepon AS vs operasi Jakarta** (`+1 415-555-0192`), **campur zona waktu**
  (Quiet Hours tanpa zona vs WIB vs `15:30 UTC`), dan **kontinuitas lintas hub**
  (`WO-2026-0894`, `PR-2026-0314`, `18.4 ppm`, `PART-SEAL-8821`) — semua
  terkonfirmasi di pass-2.
- **Struktur 5 kartu + rail Matrix v4 + debugger sintetis** identik kedua pass.

### (b) Temuan BARU yang luput di pass-1

- **Perilaku JS presisi:** `markAllRead()` hanya set KPI→`0` + `opacity-75`
  (tanpa persistensi — rollback wajib bila POST gagal);
  `triggerSimulationAlert()` menyuntik `TEST-ALARM-998
  (14.2°C threshold)` + hapus `animate-pulse` setelah 1500ms;
  filter tab + live search via `display:flex/none` + `innerText.includes`
  (tanpa pesan empty-state — tambahkan).
- **Inkonsistensi jam hening ganda:** header `Quiet Hours: 00:00 - 06:00`
  vs rule engine `Shift Auto-Mute di luar Shift A 07:00-15:30 WIB` — dua
  definisi hening yang belum diselaraskan (pass-1 mencatat campur zona, tetapi
  bukan konflik definisi ini).
- **Detail sensor & draft:** `FLIR-TG550`, node `10.14.8.22`,
  draft `PR-2026-0315` (10 units × $185), `Auto-escalation in 08:34`,
  sparkline `98.4%` (A 100% / B 97.2% / C 98.0%) — tidak dirinci pass-1.

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Verifikasi aritmetika tab pass-1
  (8+12+6+5+7 = 38) tidak dihitung ulang di pass-2 — tetap berlaku dari
  pass-1. Perbedaan nama endpoint (`mark-all-read` vs `mark-all-read`,
  `purchase-requests` vs `purchasing`) adalah varian penamaan setara.
