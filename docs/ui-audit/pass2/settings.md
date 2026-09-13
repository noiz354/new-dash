# UI Audit Pass-2 — Settings & System Configuration (`settings_system_configuration`)

> Sumber: `stitch_facility_maintenance_platform_ui/settings_system_configuration/code.html` (920 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Konsistensi rute global: `docs/ui-audit/navigation-audit.md` (§2: `/settings`).

## 1. Page Overview & UI Elements (Penjelasan Halaman)

### Tujuan utama

Konsol konfigurasi sistem: profil organisasi/lokal, engine telemetri dispatcher,
urutan penomoran dokumen, seed/backup database, integrasi + webhook, unit
teknik, dan kunci API/mTLS. Tab `General Configuration` tampil default;
4 tab lain (`Data & Seed`, `Integrations & Webhooks`, `Localization & Units`,
`Security & Auth Keys`) tersembunyi via `switchTab()`. Alur: ubah parameter →
`Save System Parameters` (banner `TX-904128 · 14ms`) → kelola seed/backup/
integrasi/kunci di tab masing-masing.

### Daftar elemen UI utama

1. **Breadcrumb + meta bar** — `Home / Governance & System / Settings & System Config`;
   H1 + badge `ENGINE v4.18-p3 • ENV: PROD (US-EAST-1)`;
   toolbar: switch `Maint Mode OFFLINE (ARMED)` (`#maintToggle/#maintKnob/#maintStatusLabel`),
   `Export Bundle (JSON/YAML)`, `Save System Parameters` (`#saveSystemParamsBtn`);
   banner `#saveFeedback` (`persisted to KV-store & 3 node clusters`).
2. **Tab nav (5)** — `#tab-btn-general/data/integrations/localization/security`
   + badge `Phase 3`, dot pulse integrasi, `mTLS Enforced`.
3. **Tab General:** kartu `Enterprise Organization & Localization Profile`
   (`TENANT-ID: APX-GL-9021` ⚠️): legal `Apex Facility Management Global Pte Ltd`,
   brand `Apex Ops - Nusantara East Campus`, currency `USD ($)` + `Live FX: Fixer.io`
   (`Updated 14 mins ago`), timezone `UTC+07:00 Asia/Jakarta - WIB`,
   fiscal `January - December`, work week `Monday - Saturday | 07:00 - 22:00
   (Two 8h Rotations)` ⚠️; footer `bound to Shift Roster` + `Re-index Facilities`.
   Kartu `Dispatcher Telemetry Engine` (`ONLINE`): P1 SLA `15 MIN THRESHOLD` 25%,
   throttle `64 WORKERS / ZONE` 68%, SCADA buffer `HEALTHY (12%)`
   (`3.4ms • 250,000 msg ring`), `Flush Ingest Buffer`.
   Tabel `Ticket & Document Numbering Sequences` (`Lock Sequence Policy` ON,
   `Reset Counters`): WO `WO-`/`[YYYY]-`/4-digit/`0894`→`WO-2026-0894`;
   SR `SR-`/5-digit/`00142`→`SR-2026-00142`; PO `PO-`/`0298`→`PO-2026-0298`;
   AST `AST-`/`[HVAC|ELEC|FIRE]-`/`004`→`AST-HVAC-004`; INSP `INSP-`/`[FL]-`/
   `1092`→`INSP-FL-1092`; aksi `Configure` ×5.
4. **Tab Data (`#tab-content-data`, hidden):** `Database Lifecycle & Demo Seed`
   (`Demo Seed: ACTIVE Phase 3 Loaded`); tiles `148 users (8 Roles · 12 Shift Leads)` ⚠️,
   `412 assets (98.4%)`, `1,840 SKUs (4 warehouses)`, `4,892 WO (18mo)`;
   aksi `Reload Clean Baseline Seed` / `Purge Test Transactions (>30 Days)` /
   `Generate Synthetic Sensor Telemetry (1hr Batch)` (`triggerSeedAction`);
   kartu backup (`Hourly Diff + Daily Full 02:00 UTC`,
   `s3://apex-backup-us-east-prod-wal/`, snapshot `2026-05-24 02:00:14 UTC · 842.6 MB SHA-256`,
   `Create Ad-hoc Snapshot Now`); tabel 3 snapshot (Verified, `30-day Lock`,
   `Download TAR.GZ` / `Trigger Restore Simulation`).
5. **Tab Integrations (hidden):** 3 kartu status — SCADA
   (`mqtt://10.14.0.8:1883`, MQTT/BACnet/OPC-UA, `1,420 msgs/min 12ms`,
   `Configure Endpoints`/`Test Connection`); Email
   (`smtp.sendgrid.net:587`, TLS 1.3, `alerts@apexops.io`, `99.94%`,
   `Send Test Email`, `DKIM/SPF Valid`); ERP Oracle
   (`15 mins cron`, POs/Invoices/Capex, `apex-erp-bridge-prod`, `48h`,
   `Re-sync Ledgers`). Tabel `Active Webhook Dispatchers` + `Register New Webhook`:
   Slack `hooks.slack.com/...` (`wo.critical_sla`, HMAC, 200 OK, 68ms);
   incident.io (`asset.tier1_failure`, Bearer, 114ms);
   pagerduty (`scada.refrigerant_leak`, Routing Key, 92ms); aksi `Ping`/`Edit`.
6. **Tab Localization (hidden):** Thermal `Celsius (°C) [ASHRAE]` 2dp;
   Pressure `Bar/kPa`; Power `kW/MWh`.
7. **Tab Security (hidden):** `API Gateway Keys & SCADA mTLS` +
   `Issue New API Credential`; kartu `Internal Field Scanner Key
   (Nusantara Plant Barcode Dispatch)` (`ACTIVE • Expires in 182d`),
   **input `type="password"` berisi `value="apx_live_sec_8921a9fb014e41b99a8039c381cbb401"`** ⚠️
   + `Reveal`/`Rotate`; scopes `` `work_orders:write`, `assets:read`, `telemetry:ingest` ``.
8. **Script inline** — `switchTab()` (hidden↔flex + gaya tombol),
   toggle maintenance (merah `bg-error` + label `ONLINE (ACTIVE LOCK)`),
   simulasi save (600ms → banner 4000ms), `triggerSeedAction()`.

### State UI

- **Empty state:** webhook 0 → `Register New Webhook`; snapshot 0 → `Create Ad-hoc Snapshot`;
  daftar kunci 0 → `Issue New API Credential`.
- **Loading state:** save spinner `sync`; seed/backup aksi spinner; test koneksi
  spinner; tabel snapshot skeleton.
- **Error state:** save gagal → banner merah + retry; seed purge butuh konfirmasi
  destruktif (saat ini sekali klik!); kunci terekspos → anggap bocor (lihat §3).

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path`, semua `href="#"`; target usulan).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Settings & System Config | `/settings` (halaman ini; tab via `?tab=`) |
| Sidebar 14 item lain | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/organization` |
| 5 tab konfigurasi | Query param (`/settings?tab=general\|data\|integrations\|localization\|security`), bukan navigasi |
| `Save System Parameters` | `PUT /api/v1/settings/system` (tetap + banner) |
| `Export Bundle (JSON/YAML)` | `GET /api/v1/settings/export?format=` (unduh) |
| `Re-index Facilities` | `POST /api/v1/facilities/reindex` (tetap) |
| `Flush Ingest Buffer` | `POST /api/v1/telemetry/buffer/flush` (tetap; wajib konfirmasi) |
| `Configure` (5 penomoran) | Drawer konfigurasi pola per entitas — MISSING (parsial) |
| `Reset Counters` | `POST /api/v1/settings/sequences/reset` (wajib konfirmasi + audit) |
| Seed: Reload / Purge / Synthetic | `POST /api/v1/admin/seed/*` (tetap; purge wajib konfirmasi destruktif) |
| Backup: Snapshot / Download / Restore Simulation | `POST /api/v1/admin/backups`, `GET .../download`, `POST .../restore-simulation` |
| `Configure Endpoints` / `Test Connection` | Drawer konfigurasi + `POST .../test` (tetap) |
| `Register New Webhook` / `Ping` / `Edit` | Modal webhook + `POST/PATCH /api/v1/webhooks` + `POST .../ping` — MISSING (parsial) |
| `Issue New API Credential` / `Reveal` / `Rotate` | `POST /api/v1/api-keys`, `POST .../:id/reveal` (sekali saja!), `POST .../:id/rotate` |
| Ikon `notifications` (header) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Drawer konfigurasi (MEDIUM)** — 5 tombol `Configure` penomoran +
   `Configure Endpoints`/`Edit` webhook tanpa konten; butuh drawer per entitas.
   `// TODO: Create config drawers for sequences, endpoints, webhooks`
2. **Konfirmasi destruktif (HIGH)** — `Purge Test Transactions`, `Reset Counters`,
   `Flush Ingest Buffer`, `Trigger Restore Simulation` sekali klik; wajib dialog
   + ketik konfirmasi + jejak audit.
3. **Rahasia terpapar (CRITICAL, keamanan)** — kunci `apx_live_sec_...`
   tertulis plain di HTML (`type="password"` hanya menyamarkan tampilan,
   nilai tetap di source); anggap bocor, rotasi saat seeding, produksi hanya
   tampilkan `last4` + aksi reveal sekali saja.
   `// TODO: Never render full API secret in HTML; show last4 + one-time reveal`
4. **Target global `+ New Dispatch / Request` (MEDIUM)** — tak terdefinisi.

**Inkonsistensi yang dicatat:**
- Tenant `APX-GL-9021` (settings) vs `APX-NUSA-01` (audit-trail/org) — kanonisasi.
- Seed `8 Roles` vs org hub `6 Roles`; work week `Mon–Sat 07:00–22:00` vs
  varian Shift A (`07:00–15:30` / `06:00–22:00`).
- `screen.png` benar (sorot `Settings & System Config`); hanya tab General
  yang terlihat (4 tab lain hidden — wajar).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols.
- Tab/switch/banner murni JS vanilla (`classList`, `setTimeout`).
- Nilai rahasia hardcode di atribut `value`; endpoint/MQTT/SMTP/S3/webhook
  hardcode sebagai teks.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/settings?tab=`; typing `SystemSettings`, `NumberingSeq`, `Webhook`, `ApiKeyMeta`. |
| **Tailwind CSS (build)** | Tab, kartu, tabel sequence/backup/webhook; token sistem A. |
| **shadcn/ui** — `Tabs`, `Card`, `Button`, `Input`, `Select`, `Switch`, `Table`, `Badge`, `Skeleton`, `Toast`, `Dialog/AlertDialog`, `Tooltip` | 5 tab, switch maint/lock, tabel, dialog konfirmasi destruktif, toast, tooltip secret. |
| **lucide-react** | Pengganti Material Symbols (tune, database, hub, language, shield, key). |
| **SWR / TanStack Query** | Settings per tab, seed status, backup list, webhook health, key metadata (tanpa secret!). |
| **axios** | PUT settings, seed/backup admin, webhook CRUD/ping, key issue/rotate. |
| **zod + react-hook-form** | Validasi profil org, threshold telemetri, pola penomoran (regex prefix/mask), URL webhook (https saja). |
| **secrets manager (Vault/KMS)** | Penyimpanan kunci; UI hanya `last4` + waktu kedaluwarsa. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/settings/system` | Seluruh parameter General + telemetri | On page load tab General |
| PUT | `/api/v1/settings/system` | Simpan parameter sistem | On click `Save System Parameters` |
| GET | `/api/v1/settings/export?format=json\|yaml` | Export bundle konfigurasi | On click `Export Bundle` |
| POST | `/api/v1/settings/maintenance` | Toggle maintenance mode | On toggle Maint Mode |
| GET | `/api/v1/settings/sequences` | 5 pola penomoran + index | On page load (tabel) |
| PATCH | `/api/v1/settings/sequences/:entity` | Ubah pola per entitas | On submit drawer `Configure` |
| POST | `/api/v1/settings/sequences/reset` | Reset counter (audit) | On click `Reset Counters` |
| POST | `/api/v1/facilities/reindex` | Re-index fasilitas | On click `Re-index Facilities` |
| POST | `/api/v1/telemetry/buffer/flush` | Kosongkan buffer ingest | On click `Flush Ingest Buffer` |
| GET | `/api/v1/admin/seed/status` | Status seed Phase 3 + counts | On page load tab Data |
| POST | `/api/v1/admin/seed/reload` | Reload baseline bersih | On click Reload |
| POST | `/api/v1/admin/seed/purge` | Hapus transaksi >30 hari | On click Purge (konfirmasi!) |
| POST | `/api/v1/admin/seed/synthetic-telemetry` | Generate 1 jam telemetri sintetik | On click Generate |
| GET | `/api/v1/admin/backups` | Riwayat 3 snapshot | On page load backup |
| POST | `/api/v1/admin/backups` | Snapshot ad-hoc | On click `Create Ad-hoc Snapshot` |
| GET | `/api/v1/admin/backups/:id/download` | Unduh TAR.GZ | On click Download |
| POST | `/api/v1/admin/backups/:id/restore-simulation` | Simulasi restore (dry-run) | On click Restore Simulation |
| GET | `/api/v1/integrations/status` | Status SCADA/SMTP/ERP | On page load tab Integrations |
| POST | `/api/v1/integrations/:key/test` | Uji koneksi endpoint | On click `Test Connection` / Test Email |
| GET | `/api/v1/webhooks` | 3 dispatcher + health/latency | On page load webhook |
| POST | `/api/v1/webhooks` | Daftarkan webhook (URL https + topik + auth) | On submit Register |
| POST | `/api/v1/webhooks/:id/ping` | Ping health dispatcher | On click Ping |
| GET | `/api/v1/settings/units` | Preferensi unit (C/Bar/kW) | On page load Localization |
| GET | `/api/v1/api-keys` | Metadata kunci (tanpa secret; hanya last4) | On page load Security |
| POST | `/api/v1/api-keys` | Terbitkan kredensial (secret sekali tampil!) | On click Issue |
| POST | `/api/v1/api-keys/:id/rotate` | Rotasi kunci | On click Rotate |

Contoh fetch:

```ts
// TODO: Replace save mock with PUT /api/v1/settings/system
await fetch("/api/v1/settings/system", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ timezone: "Asia/Jakarta", currency: "USD", p1SlaMin: 15 }),
});
```

```ts
// TODO: Never render full API secret in HTML; show last4 + one-time reveal
import axios from "axios";
const { data } = await axios.post("/api/v1/api-keys/rotate", { keyId: "field-scanner-nusantara" });
// { data: { last4: "bb401", expiresInDays: 182 } } — full secret hanya di respons issue, sekali saja
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace settings mock with GET /api/v1/settings/system
export const systemSettings = {
  tenantId: "APX-GL-9021", // TODO: canonicalize vs APX-NUSA-01 elsewhere
  legalName: "Apex Facility Management Global Pte Ltd",
  brand: "Apex Ops - Nusantara East Campus",
  currency: "USD", fx: "Fixer.io", timezone: "Asia/Jakarta",
  fiscal: "January - December", workWeek: "Monday - Saturday | 07:00 - 22:00",
  p1SlaMin: 15, dispatchThrottle: 64, scadaBufferPct: 12,
};

// TODO: Replace sequences mock with GET /api/v1/settings/sequences
export const sequences = [
  { entity: "Work Orders", prefix: "WO-", mask: "[YYYY]-", pad: 4, index: "0894", preview: "WO-2026-0894" },
  { entity: "Service Requests", prefix: "SR-", mask: "[YYYY]-", pad: 5, index: "00142", preview: "SR-2026-00142" },
  { entity: "Purchase Orders", prefix: "PO-", mask: "[YYYY]-", pad: 4, index: "0298", preview: "PO-2026-0298" },
  { entity: "Asset Identifier", prefix: "AST-", mask: "[HVAC|ELEC|FIRE]-", pad: 3, index: "004", preview: "AST-HVAC-004" },
  { entity: "Field Inspection Reports", prefix: "INSP-", mask: "[FL]-", pad: 4, index: "1092", preview: "INSP-FL-1092" },
];

// TODO: Replace seed mock with GET /api/v1/admin/seed/status
export const seedStatus = {
  phase: "Phase 3", users: 148, roles: 8, assets: 412, skus: 1840, woHistory: 4892,
  backupLatest: "2026-05-24 02:00:14 UTC", sizeMB: 842.6, store: "s3://apex-backup-us-east-prod-wal/",
};

// TODO: Replace webhooks mock with GET /api/v1/webhooks
export const webhooks = [
  { url: "https://hooks.slack.com/services/T04/B08/x91...", topics: ["wo.critical_sla"], auth: "HMAC-SHA256", health: "200 OK", latencyMs: 68 },
  { url: "https://api.incident.io/v1/escalations", topics: ["asset.tier1_failure"], auth: "Bearer", health: "200 OK", latencyMs: 114 },
  { url: "https://pagerduty.com/integrations/v2/enqueue", topics: ["scada.refrigerant_leak"], auth: "Routing Key", health: "200 OK", latencyMs: 92 },
];

// TODO: Never render full API secret in HTML; show last4 + one-time reveal
export const apiKeyMeta = {
  name: "Internal Field Scanner Key", last4: "bb401",
  scopes: ["work_orders:write", "assets:read", "telemetry:ingest"],
  status: "ACTIVE", expiresInDays: 182,
};
```

Contoh binding:

```tsx
// TODO: Replace sequences mock with useSWR('/api/v1/settings/sequences', fetcher)
import { sequences } from "@/mocks/settings.mock";

export function SequenceTable() {
  return (
    <Table>
      <TableBody>
        {sequences.map((s) => (
          <TableRow key={s.entity}>
            <TableCell>{s.entity}</TableCell>
            {/* TODO: Create config drawers for sequences, endpoints, webhooks */}
            <TableCell className="font-mono font-bold">{s.preview}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Secret terpapar di HTML (KRITIS).** Pass-1 (`docs/ui-audit/settings.md` §3)
  mencatat kunci `apx_live_sec_...` plain di `value=` input. Pass-2 menemukan
  string yang sama persis
  (`value="apx_live_sec_8921a9fb014e41b99a8039c381cbb401"`, `type="password"`)
  + tombol `Reveal`/`Rotate` + scopes
  `work_orders:write, assets:read, telemetry:ingest` — terkonfirmasi penuh:
  anggap bocor, rotasi saat seeding, prod hanya `last4`.
- **Tenant ganda** (`APX-GL-9021` vs `APX-NUSA-01`) dan **`8 Roles` vs `6 Roles`** —
  keduanya ditemukan independen di pass-2 pada lokasi yang sama (badge
  TENANT-ID, tile seed). Hipotesis pass-1 (global-vs-site, role sistem
  tersembunyi) dicatat sebagai hipotesis, belum fakta.
- **Struktur 5 tab + sequence kanonis** (`WO-2026-0894`, `PO-2026-0298`,
  `AST-HVAC-004`, SR 5-digit sadar-desain) dan **seed stats 148/412/1840/4892**
  cocok di kedua pass.

### (b) Temuan BARU yang luput di pass-1

- **Perilaku JS presisi:** `switchTab()` (hidden↔flex), toggle maintenance
  (`bg-error` + label `ONLINE (ACTIVE LOCK)`), simulasi save (600ms → banner
  `TX-904128 · 14ms` 4000ms), `triggerSeedAction()` 3 varian teks feedback.
- **Detail backup/integrasi:** retensi `Glacier Deep` vs `S3 Standard`,
  snapshot ad-hoc pre-deploy `2026-05-22 18:45`, `DKIM/SPF Valid`,
  OAuth `apex-erp-bridge-prod` (48h), latensi webhook 68/114/92ms,
  `Fixer.io` sync 14m, ring buffer `250,000 msg / 3.4ms`, unit
  (Celsius ASHRAE 2dp, Bar/kPa, kW/MWh).
- **Work week vs shift:** `Monday - Saturday | 07:00 - 22:00 (Two 8h)` di
  settings vs varian Shift A (`07:00–15:30` / `06:00–22:00`) di org/notif —
  konflik ketiga yang belum dipetakan pass-1.
- **Hanya tab General yang terlihat di `screen.png`** (4 tab lain hidden) —
  verifikasi visual yang tidak dicatat pass-1.

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Temuan "ENV paradoks" pass-1
  (`PROD US-EAST-1` vs operasi Jakarta/broker privat) tidak diverifikasi ulang
  di pass-2 — tetap berlaku apa adanya dari pass-1.
