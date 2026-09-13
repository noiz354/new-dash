# UI Audit — Settings & System Configuration (`settings_system_configuration`)

> Sumber: `stitch_facility_maintenance_platform_ui/settings_system_configuration/code.html` (920 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Route usulan: `/settings`. Dibuat: 2026-09-13. Template: `docs/PROMPT_UI_AUDIT.md` (v2 Architect).
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Settings & System Configuration** adalah panel kontrol env produksi:
profil organisasi/lokalitas, mesin telemetri dispatcher, sekuens penomoran
dokumen, lifecycle database & seed demo, backup/restore, integrasi & webhook,
satuan engineering, dan kunci API/mTLS — diorganisasi dalam **5 tab**.
Badge `ENGINE v4.18-p3 • ENV: PROD (US-EAST-1)` menegaskan setiap perubahan di
sini berdampak produksi, sehingga aksi destruktif (purge, reset counter, rotate
key, maintenance mode) wajib dijaga konfirmasi + audit trail.

Alur kerja yang didukung: edit parameter umum → simpan (feedback `TX-904128 •
14ms`) → kelola seed/backup di tab Data → pantau integrasi & webhook →
sesuaikan satuan → rotasi kredensial → ekspor bundle konfigurasi.

### Daftar elemen UI utama

1. **Breadcrumb + meta bar** — `Home / Governance & System / Settings & System
   Config`, H1, badge engine/env; toolbar: switch `Maint Mode`
   (`maintToggle`, label `OFFLINE (ARMED)` → `ONLINE (ACTIVE LOCK)`),
   `Export Bundle (JSON/YAML)`, `Save System Parameters` (primary,
   id `saveSystemParamsBtn`, feedback id `saveFeedback`).
2. **Tab nav 5** (`switchTab`): `General Configuration` (aktif),
   `Data & Seed Controls` (badge `Phase 3`), `Integrations & Webhooks` (dot
   live), `Localization & Units`, `Security & Auth Keys` (badge `mTLS Enforced`).
3. **Tab General** — kartu `Enterprise Organization & Localization Profile`
   (`TENANT-ID: APX-GL-9021`): legal entity `Apex Facility Management Global
   Pte Ltd`, brand `Apex Ops - Nusantara East Campus`, currency USD + `Live FX:
   Fixer.io` + sync 14m, timezone `UTC+07:00 (Asia/Jakarta - WIB)`, fiscal
   Jan–Dec, work week `Monday - Saturday | 07:00 - 22:00 (Two 8h Rotations)`,
   footer shift-roster binding + `Re-index Facilities`; kartu `Dispatcher
   Telemetry Engine` (`ONLINE`): P1 SLA `15 MIN THRESHOLD` (bar 25%), throttle
   `64 WORKERS / ZONE` (68%), SCADA buffer `HEALTHY (12%)`, `3.4ms`, ring
   `250,000 msg`, tombol `Flush Ingest Buffer`; tabel `Ticket & Document
   Numbering Sequences` (switch `Lock Sequence Policy` ON + `Reset Counters`):
   WO `WO-` `[YYYY]-` 4-digit idx `0894` → `WO-2026-0894`; SR `SR-` 5-digit
   `00142` → `SR-2026-00142`; PO `PO-` `0298` → `PO-2026-0298`; AST `AST-`
   `[HVAC|ELEC|FIRE]-` 3-digit `004` → `AST-HVAC-004`; INSP `INSP-` `[FL]-`
   `1092` → `INSP-FL-1092`; aksi `Configure` per baris.
4. **Tab Data & Seed** — kartu `Database Lifecycle & Demo Seed Engine`
   (`Demo Seed: ACTIVE (Phase 3 Loaded)`): 4 stat (Users `148` 8 Roles 12 Shift
   Leads; Assets `412` 98.4% telemetry; SKUs `1,840` 4 warehouses; WO History
   `4,892` 18-month); aksi `Reload Clean Baseline Seed`,
   `Purge Test Transactions (>30 Days)` destruktif,
   `Generate Synthetic Sensor Telemetry (1hr Batch)`; kartu backup
   (`SOC2 Type II`, `Create Ad-hoc Snapshot Now`): strip jadwal
   (Hourly Diff + Daily Full 02:00 UTC, `s3://apex-backup-us-east-prod-wal/`,
   snapshot `2026-05-24 02:00:14 UTC • 842.6 MB (SHA-256)`); tabel riwayat
   3 snapshot (Full 24th 842.6 MB Glacier Deep; Full 23rd 839.1 MB; Ad-hoc
   pre-deploy 22nd 834.0 MB — semua `Verified`) + aksi `Download TAR.GZ` dan
   `Trigger Restore Simulation`.
5. **Tab Integrations** — 3 kartu status: `SCADA / IoT Gateway` (Connected:
   `mqtt://10.14.0.8:1883`, MQTT/BACnet/OPC-UA, `1,420 msgs/min (12ms ping)`,
   tombol `Configure Endpoints` + `Test Connection`); `Enterprise Email
   Gateway` (Operational: `smtp.sendgrid.net:587`, TLS 1.3,
   `alerts@apexops.io`, `99.94% (0 Bounces)`, `Send Test Email Diagnostic`,
   `DKIM / SPF Valid`); `ERP & Financial GL Sync` (Oracle ERP: synced 4m,
   15-min cron, scope POs/Invoices/Capex, OAuth2 `apex-erp-bridge-prod`,
   `Re-sync Ledgers`, token 48h); seksi `Active Webhook Dispatchers` +
   `Register New Webhook URL`: 3 baris (Slack `#ops-critical-dispatch`
   `wo.critical_sla`+`alert.p1` HMAC 200 OK 68ms; incident.io
   `asset.tier1_failure` Bearer 200 OK 114ms; PagerDuty
   `scada.refrigerant_leak` Routing Key 200 OK 92ms; aksi `Ping`/`Edit`).
6. **Tab Localization** — kartu `Engineering Units`: Thermal `Celsius (°C)
   [ASHRAE]` (presisi 2 desimal); Pressure `Bar / Pascal`; Power
   `Kilowatts / Megawatt-hours`.
7. **Tab Security** — kartu `API Gateway Keys & SCADA mTLS`: tombol
   `Issue New API Credential`; blok `Internal Field Scanner Key` (`ACTIVE •
   Expires in 182d`): input password readonly berisi secret
   `apx_live_sec_8921a9fb014e41b99a8039c381cbb401` + `Reveal`/`Rotate`,
   scopes `` `work_orders:write`, `assets:read`, `telemetry:ingest` ``.
8. **Script inline** — `switchTab`, toggle maintenance, simulasi save
   (`Saving...` → restore + banner 4s), `triggerSeedAction` (clean/purge/
   telemetry mengubah teks feedback).

### State UI

- **Empty state:** riwayat backup kosong → "Belum ada snapshot — buat ad-hoc";
  webhook kosong → CTA `Register New Webhook URL`; tabel sekuens selalu terisi
  (seed) — tidak ada empty state.
- **Loading state:** tiap tab memakai `Skeleton` kartu/tabel saat fetch;
  tombol save/test/ping memakai spinner inline + disable; banner feedback
  menggantikan toast global di halaman ini.
- **Error state:** save gagal → banner merah + tombol `Retry`, nilai form tidak
  hilang; test koneksi gagal → badge kartu `DEGRADED` + detail error;
  purge/reset/rotate selalu lewat dialog konfirmasi + hasilnya dicatat ke
  `/audit-logs` (audit otomatis, bukan opsional).

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global; semua `href="#"` — target adalah route usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Settings & System Config (aktif) | `/settings` (halaman ini) |
| Sidebar: 14 item lain | Route §2 `navigation-audit.md` |
| Maint Mode switch | Aksi env (`POST` maint on/off), bukan navigasi |
| `Export Bundle (JSON/YAML)` | Unduh file (aksi) |
| `Save System Parameters` | `PUT` + banner `TX-904128` (tetap di halaman) |
| 5 tab (`general/data/integrations/localization/security`) | State tab (produksi: query `?tab=data` agar deep-linkable) |
| `Re-index Facilities` | Job reindex (aksi + toast); hasil terlihat di `/facilities` |
| `Configure` per baris sekuens | Drawer/modal editor pola nomor — MISSING (parsial, lihat §3) |
| `Reset Counters` | Aksi destruktif + dialog — MISSING (konfirmasi belum didesain) |
| Seed actions (reload/purge/telemetry) | Job async + banner (tetap di halaman) |
| `Create Ad-hoc Snapshot Now` | `POST` snapshot (baris baru di tabel) |
| `Download TAR.GZ` | Unduh arsip (aksi) |
| `Trigger Restore Simulation` | Hasil simulasi restore — MISSING (viewer hasil belum ada) |
| `Configure Endpoints` / `Send Test Email` / `Re-sync Ledgers` | Drawer konfigurasi integrasi — MISSING (parsial, ikut `navigation-audit.md` §3 baris Settings) |
| `Test Connection` / `Ping` / `Edit` webhook | Aksi inline / drawer editor — MISSING (drawer, parsial) |
| `Register New Webhook URL` | Drawer editor webhook — MISSING |
| `Issue New API Credential` / `Reveal` / `Rotate` | Aksi kredensial + dialog — MISSING (flow konfirmasi belum ada) |
| Ikon `notifications` (header) | `/notifications` |
| `+ New Dispatch / Request` (header) | Target global tak terdefinisi — MISSING |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Drawer editor konfigurasi (MEDIUM, gabungan).** `Configure` (sekuens ×5),
   `Configure Endpoints`, `Edit` webhook, `Register New Webhook URL` semuanya
   tanpa tujuan. Usulan: satu pola `Sheet` + form `zod` dipakai ulang.
   `// TODO: Create settings config drawers (sequences, endpoints, webhooks)`
2. **Viewer hasil restore simulation (MEDIUM).** `Trigger Restore Simulation`
   tanpa desain output (RPO/RTO, checksum, dry-run diff).
   `// TODO: Create restore simulation result viewer`
3. **Flow konfirmasi destruktif (MEDIUM).** `Reset Counters`, `Purge`,
   `Rotate`, `Maint Mode ON` tanpa dialog konfirmasi di mockup — wajib sebelum
   produksi (bukan sekadar navigasi).
   `// TODO: Create destructive confirm dialogs for settings actions`
4. **Deep-link tab (LOW).** 5 tab tidak punya URL sendiri; usulkan
   `/settings?tab=data` agar log audit dan link notifikasi bisa menunjuk tab.
5. **Target global `+ New Dispatch / Request` (MEDIUM)** — pola global belum diputuskan.

**Temuan (jangan diam-diam diperbaiki):**

- **Tenant ganda.** Di sini `TENANT-ID: APX-GL-9021`, di audit/org hub
  `APX-NUSA-01`. Putuskan kanonis (kemungkinan `APX-GL` = global,
  `APX-NUSA-01` = site) dan tampilkan keduanya konsisten (`Tenant: X / Site: Y`).
- **8 Roles vs 6 Roles.** Stat seed menulis `8 Roles` tetapi organization hub
  `6 RBAC Matrix` + 6 tab. Selidiki 2 role selisih (kemungkinan role sistem
  `System`/`Integration` yang disembunyikan) — jangan samakan diam-diam.
- **ENV paradoks.** Badge `ENV: PROD (US-EAST-1)` tetapi operasi di
  `Asia/Jakarta`, broker `10.14.0.8` privat, dan S3 `us-east` — untuk demo wajar,
  untuk prod tentukan region + data residency sebelum go-live.
- **Secret terpapar di HTML.** Kunci `apx_live_sec_...` tertulis plain di
  `value=` input (walau `type="password"`). Produksi: JANGAN render secret ke
  klien; hanya tampilkan 4 karakter terakhir + tombol rotate; anggap secret
  mockup ini bocor dan rotasi saat seeding.
- **Konsistensi baik:** indeks sekuens cocok dengan entitas lintas hub
  (`WO-2026-0894`, `PO-2026-0298`, `AST-HVAC-004`); seed stats (148/412/1840/
  4892) cocok dengan reports; P1 15-min cocok dengan notif rule engine;
  `1,420 msgs` cocok dengan dashboard footer; SR 5-digit vs WO/PO 4-digit
  adalah desain sadar (volume SR lebih besar) — pertahankan + dokumentasikan.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis + **Tailwind Play CDN**, **Inter** + **JetBrains Mono**,
  **Material Symbols Outlined**, switch/toggle CSS, JS vanilla (tab, toggle,
  simulasi save/seed).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/settings` + `?tab=`; typing per domain (`OrgProfile`, `NumberingSequence`, `BackupSnapshot`, `Webhook`). |
| **Tailwind CSS (build)** | Layout tab + kartu + tabel dense; token sistem A. |
| **shadcn/ui (Radix)** — `Tabs`, `Card`, `Input`, `Select`, `Switch`, `Table`, `Button`, `Badge`, `Skeleton`, `Toast`, `Sheet`, `AlertDialog`, `Progress`, `Tooltip` | 5 tab, switch maint/lock, tabel sekuens/backup/webhook, drawer editor, dialog destruktif, banner feedback. |
| **lucide-react** | Pengganti Material Symbols (tune, database, hub, language, shield, key). |
| **SWR atau TanStack Query** | Fetch per tab (lazy: hanya tab aktif) + mutation save/test/rotate dengan status. |
| **axios** (atau `fetch` + `ky`) | HTTP client `/api/v1` + konfirmasi CSRF untuk aksi tulis. |
| **zod + react-hook-form** | Validasi semua form (profil, pola sekuens regex, URL webhook https, cron jadwal). |
| **Keamanan** | Secret tidak pernah ke klien (display mask `••••ab12`); audit otomatis tiap aksi tulis ke `/api/v1/audit-logs`. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/settings/organization` | On open tab General | Response: `{ "data": { "legalName": "Apex Facility Management Global Pte Ltd", "brand": "Apex Ops - Nusantara East Campus", "currency": "USD", "timezone": "Asia/Jakarta", "fiscalYear": "JAN_DEC", "workWeek": "Mon-Sat 07:00-22:00", "tenantId": "APX-GL-9021" } }` |
| PUT | `/api/v1/settings/organization` | On click `Save System Parameters` | Body: profil di atas. Response: `{ "data": { "saved": true, "tx": "TX-904128", "latencyMs": 14 } }` |
| GET/PUT | `/api/v1/settings/telemetry` | On open tab / ubah threshold | Body: `{ "p1SlaMin": 15, "workersPerZone": 64 }`. Response: `{ "data": { "p1SlaMin": 15, "workersPerZone": 64, "bufferHealthPct": 12 } }` |
| POST | `/api/v1/settings/telemetry/flush-buffer` | On click `Flush Ingest Buffer` | Response: `{ "data": { "flushed": true } }` |
| GET | `/api/v1/settings/numbering` | On open tab General (seksi sekuens) | Response: `{ "data": [{ "entity": "WORK_ORDER", "prefix": "WO-", "dateMask": "[YYYY]-", "padding": 4, "currentIndex": 894, "preview": "WO-2026-0894" }] }` |
| PUT | `/api/v1/settings/numbering/:entity` | On submit drawer `Configure` | Body: `{ "prefix": "WO-", "padding": 4 }`. Response: `{ "data": { "entity": "WORK_ORDER", "preview": "WO-2026-0895" } }` |
| POST | `/api/v1/settings/numbering/reset` | On click `Reset Counters` | Body: `{ "confirm": true }`. Response: `{ "data": { "reset": true } }` |
| GET | `/api/v1/settings/seed/stats` | On open tab Data | Response: `{ "data": { "users": 148, "roles": 8, "assets": 412, "skus": 1840, "woHistory": 4892, "phase": "Phase 3" } }` |
| POST | `/api/v1/settings/seed/reload` | On click `Reload Clean Baseline Seed` | Response: `{ "data": { "jobId": "SEED-31", "restored": 4892 } }` |
| POST | `/api/v1/settings/seed/purge` | On click `Purge Test Transactions` | Body: `{ "olderThanDays": 30, "confirm": true }`. Response: `{ "data": { "purged": true } }` |
| POST | `/api/v1/settings/seed/synthetic-telemetry` | On click `Generate Synthetic ...` | Body: `{ "batchHours": 1 }`. Response: `{ "data": { "queued": 1420 } }` |
| GET | `/api/v1/settings/backups` | On open tab Data (tabel) | Response: `{ "data": [{ "at": "2026-05-24T02:00:14Z", "mode": "FULL", "sizeMb": 842.6, "checksum": "SHA-256", "retention": "30-day Lock • Glacier Deep" }] }` |
| POST | `/api/v1/settings/backups` | On click `Create Ad-hoc Snapshot Now` | Response: `{ "data": { "snapshotId": "SNP-20260524", "status": "QUEUED" } }` |
| POST | `/api/v1/settings/backups/:id/restore-simulation` | On click `Trigger Restore Simulation` | Response: `{ "data": { "dryRun": true, "rpoMin": 60, "rtoMin": 15 } }` |
| GET | `/api/v1/settings/integrations` | On open tab Integrations | Response: `{ "data": [{ "key": "scada", "status": "CONNECTED", "broker": "mqtt://10.14.0.8:1883" }, { "key": "smtp", "status": "OPERATIONAL" }, { "key": "erp", "status": "SYNCED" }] }` |
| POST | `/api/v1/settings/integrations/:key/test` | On click `Test Connection` / `Send Test Email` / `Re-sync` | Response: `{ "data": { "key": "scada", "ok": true, "latencyMs": 12 } }` |
| GET/POST/PUT | `/api/v1/settings/webhooks` (+ `/:id/ping`) | CRUD + Ping tabel webhook | Body: `{ "url": "https://hooks.slack.com/...", "topics": ["wo.critical_sla"], "auth": "HMAC_SHA256" }`. Response: `{ "data": { "id": "WH-01", "health": "200 OK", "latencyMs": 68 } }` |
| GET/PUT | `/api/v1/settings/units` | Tab Localization | Body: `{ "thermal": "CELSIUS", "pressure": "BAR_KPA", "power": "KW_MWH" }`. Response: `{ "data": { "updated": true } }` |
| GET | `/api/v1/settings/api-keys` | On open tab Security (mask!) | Response: `{ "data": [{ "name": "Field Scanner Key", "last4": "b401", "status": "ACTIVE", "expiresInDays": 182, "scopes": ["work_orders:write","assets:read","telemetry:ingest"] }] }` |
| POST | `/api/v1/settings/api-keys` | On click `Issue New API Credential` | Response: `{ "data": { "secret": "<sekali-tampil>", "last4": "9f22" } }` |
| POST | `/api/v1/settings/api-keys/:id/rotate` | On click `Rotate` | Response: `{ "data": { "secret": "<sekali-tampil>" } }` |
| POST | `/api/v1/settings/maintenance` | On toggle Maint Mode | Body: `{ "enabled": true }`. Response: `{ "data": { "maintenance": true } }` |
| GET | `/api/v1/settings/export-bundle` | On click `Export Bundle` | Response: bundle JSON/YAML (attachment). |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/settings.mock.ts`. **Jangan pernah mock secret asli** —
hanya `last4` + status.

```ts
// TODO: Replace org mock with GET /api/v1/settings/organization
export const orgProfile = {
  legalName: "Apex Facility Management Global Pte Ltd",
  brand: "Apex Ops - Nusantara East Campus",
  currency: "USD", timezone: "Asia/Jakarta", fiscalYear: "JAN_DEC",
  workWeek: "Mon-Sat 07:00-22:00", tenantId: "APX-GL-9021",
};

// TODO: Replace numbering mock with GET /api/v1/settings/numbering
export const numbering = [
  { entity: "WORK_ORDER", prefix: "WO-", dateMask: "[YYYY]-", padding: 4, currentIndex: 894, preview: "WO-2026-0894" },
  { entity: "SERVICE_REQUEST", prefix: "SR-", dateMask: "[YYYY]-", padding: 5, currentIndex: 142, preview: "SR-2026-00142" },
  { entity: "PURCHASE_ORDER", prefix: "PO-", dateMask: "[YYYY]-", padding: 4, currentIndex: 298, preview: "PO-2026-0298" },
  { entity: "ASSET", prefix: "AST-", dateMask: "[HVAC|ELEC|FIRE]-", padding: 3, currentIndex: 4, preview: "AST-HVAC-004" },
  { entity: "INSPECTION", prefix: "INSP-", dateMask: "[FL]-", padding: 4, currentIndex: 1092, preview: "INSP-FL-1092" },
];

// TODO: Replace seed mock with GET /api/v1/settings/seed/stats
export const seedStats = { users: 148, roles: 8, assets: 412, skus: 1840, woHistory: 4892, phase: "Phase 3" };

// TODO: Replace backups mock with GET /api/v1/settings/backups
export const backups = [
  { at: "2026-05-24T02:00:14Z", mode: "FULL", sizeMb: 842.6, retention: "30-day Lock • Glacier Deep" },
  { at: "2026-05-23T02:00:11Z", mode: "FULL", sizeMb: 839.1, retention: "30-day Lock • S3 Standard" },
  { at: "2026-05-22T18:45:00Z", mode: "ADHOC_PREDEPLOY", sizeMb: 834.0, retention: "Manual Flag • S3 Standard" },
];

// TODO: Replace webhooks mock with GET /api/v1/settings/webhooks
export const webhooks = [
  { id: "WH-01", url: "https://hooks.slack.com/services/T04/B08/x91...", topics: ["wo.critical_sla", "alert.p1"], auth: "HMAC_SHA256", health: "200 OK", latencyMs: 68 },
  { id: "WH-02", url: "https://api.incident.io/v1/escalations", topics: ["asset.tier1_failure"], auth: "BEARER", health: "200 OK", latencyMs: 114 },
  { id: "WH-03", url: "https://pagerduty.com/integrations/v2/enqueue", topics: ["scada.refrigerant_leak"], auth: "ROUTING_KEY", health: "200 OK", latencyMs: 92 },
];

// TODO: Never render real secrets — apiKeys mock exposes last4 only (GET /api/v1/settings/api-keys)
export const apiKeys = [
  { id: "key-01", name: "Field Scanner Key", last4: "b401", status: "ACTIVE", expiresInDays: 182, scopes: ["work_orders:write", "assets:read", "telemetry:ingest"] },
];

// TODO: Create settings config drawers (sequences, endpoints, webhooks) — tombol Configure/Edit/Register tanpa tujuan
// TODO: Create destructive confirm dialogs for settings actions (Reset Counters, Purge, Rotate, Maint Mode ON)
// TODO: Create restore simulation result viewer
```

Contoh binding (ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/settings/numbering', fetcher)
import { numbering } from "@/mocks/settings.mock";

export function NumberingTable() {
  return (
    <Table>
      <TableBody>
        {numbering.map((n) => (
          <TableRow key={n.entity}>
            <TableCell>{n.entity}</TableCell>
            <TableCell className="font-mono font-bold">{n.preview}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Aturan penggantian mock → API: fetch per tab secara lazy (tab tak aktif tidak
fetch); semua aksi tulis memakai `AlertDialog` + mencatat ke audit trail;
secret hanya `last4` di klien, nilai penuh hanya dari respons sekali-tampil
saat issue/rotate.
