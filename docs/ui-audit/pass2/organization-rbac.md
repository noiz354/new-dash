# UI Audit Pass-2 — Organization & RBAC Governance Hub (`organization_rbac_governance_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/organization_rbac_governance_hub/code.html` (1052 baris)
> + `screen.png` sefolder. Design system: **A — Apex Operational Facility System**.
> Audit independen pass-2 (dari nol, tanpa membaca pass-1). Dibuat: 2026-09-13.
> Konsistensi rute global: `docs/ui-audit/navigation-audit.md` (§2: `/organization`).

## 1. Page Overview & UI Elements (Penjelasan Halaman)

### Tujuan utama

Direktori tata kelola identitas: roster personel 148 orang, matriks izin 6 role ×
15 modul, simulator akses efektif ABAC, plus provisioning SCIM/SSO. Halaman
terbagi dua: direktori (kiri, 5/12) dan matriks + simulator (kanan, 7/12).
Badge `SCIM v2.4 Active` + `Tenant: APX-NUSA-01` menegaskan sinkronisasi Okta.

### Daftar elemen UI utama

1. **Header governansi** — ikon `manage_accounts`, judul
   `Organization Governance & RBAC Directory`, badge SCIM + tenant, deskripsi
   RBAC/ABAC; aksi `Export Audit Log`, `SSO & Security Policies`, `+ Provision User`.
2. **KPI rail (4)** — `Active Personnel 148` (`96 Field · 32 Eng · 14 Proc · 6 Admin`,
   `100% Provisioned`); `Defined Roles 6` (`15 Modules`, `74 granular toggles`);
   `Compliance & MFA 100%` (`Okta SCIM: 12ms`, `L30D 0 Breaches`);
   `Field Sessions 42` (`Shift A (07:00-15:30 WIB)`).
3. **Roster `Personnel Roster`** — badge `#userCountBadge` (`6 Displayed`);
   search `#userSearchInput` (`Filter by name, badge, role, RFID, email... (Press /)`,
   badge `Ctrl + /`); 3 filter (`#teamFilter`: All/HVAC/Electrical/Safety/Leadership/Vendor;
   `#roleFilter`: All/Facility Director/Engineering Lead/Senior Field Tech/Vendor Partner;
   `#statusFilter`: All/Active/On Shift-Leave/Expiring); 6 kartu `.user-card`
   ber-`data-*` (`data-name/badge/email/role/status/team`, `onclick="selectUser(...)"`):
   Marcus Vance (`RFID-0001`, VP Ops, login 4m), David Chen (`RFID-1049`, Lead, 18m),
   Marcus Kowalski (`RFID-9021`, Senior Tech, Shift A, `2 Active WOs`,
   `WO-2026-0894 (Chiller #4)`, `HVC-TAB-04`, ring default),
   Elena Voronova (`RFID-7714`, inisial EV), Sarah Al-Mansoor (`RFID-4402`, SA),
   Robert Langdon (`VEND-TRANE-09`, Trane OEM, `EXPIRING`, `MSA: Exp 31 Dec 2026`).
   Avatar 3 pertama hotlink `lh3.googleusercontent.com`, 3 terakhir inisial.
4. **Panel `Account Diagnostics & Actions` (`#quickActionPanel`)** —
   `#selectedUserBadgeCode/Name/Role` + `Synchronized via Okta SCIM`;
   tombol `Edit Assignment` / `Reset MFA / Key` / `Audit Impersonate` (toast) /
   `Deactivate User` (`confirmDeactivation()` → `confirm()` native!).
5. **Matriks `Permission Matrix by Role`** — tab 6 role
   (Enterprise Admin / Facility Director / Eng Lead / Mgr /
   Senior Field Tech aktif / Vendor Partner / Read-Only Auditor),
   tombol `Reset` + `Deploy Rule`; indikator `#activeRoleIndicator`;
   legenda Granted/Locked/Restricted; tabel 15 modul × 6 kolom
   (View/Create/Update/Dispatch/Archive/Financial Signoff) berisi
   checkbox / `lock` / `remove`; baris terlihat: 1 Operations (View+Update+Dispatch),
   2 Work Orders (View+Create+Update+Dispatch), 3 Service Requests (4 grant),
   4 PM (Create dikunci), 5 Inspections (5 grant + Financial),
   6 Findings (4 grant), 7 Locations (View saja, sisanya lock),
   8 Asset Registry (View+Create+Update), 9 Inventory (4 grant),
   10 Transfers (4 grant), 11 PR (View+Create), 12 PO/GRN (View+receiving),
   13 Vendors (View saja), 14 Reports, 15 Org & RBAC (semua lock ke Admin).
   Scroll `max-h-[520px]`, thead sticky.
6. **Simulator `Effective Access Simulator`** — `#simulatorRoleName/SummaryText`
   (narasi kapabilitas Senior Tech: WO + inspeksi + parts ≤`$500` tanpa manajer,
   read-only BIM, dilarang rilis finansial/vendor/admin);
   constraints ABAC: Geofence `HQ Nusantara Campus / East Wing & Substation`,
   Shift `Shift A (06:00 - 22:00)` ⚠️, Override `Dual Signoff / Eng Lead PIN`;
   footer `Clone Policy as New Role` / `Discard Changes` / `Deploy Rules (HTMX Live)`.
7. **Modal** — `#inviteModal` (nama/email/role/crew/RFID → `Provision via SCIM`,
   validasi nama wajib); `#ssoModal` (IdP Okta SAML 2.0 CONNECTED, MFA ENFORCED 100%,
   timeout 30/120 mnt, SCIM Instant <50ms).
8. **Toast `#apexToast`** + script: `filterUsers()`, shortcut `Ctrl+/` atau `/`,
   `selectUser`, `switchRoleTab` (+ kamus `roleDescriptions` 6 role),
   `triggerToast`, modal helpers, `submitNewUser`, `exportAuditLogModal`,
   `savePermissions`, `resetRoleDefaults`, `cloneRolePolicy`, `confirmDeactivation`.

### State UI

- **Empty state:** filter roster 0 hasil → `0 Displayed` + saran reset
  (saat ini hanya badge count; tambahkan ilustrasi); role tanpa grant →
  baris semua `lock`.
- **Loading state:** roster skeleton 6 kartu; matriks skeleton checkbox;
  tombol Deploy spinner; modal submit spinner.
- **Error state:** SCIM gagal → toast + form tetap; Deploy gagal → toast +
  matriks tidak berubah; deaktivasi gagal → toast + user tetap aktif.

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global (sidebar 15 `data-path`, semua `href="#"`; target usulan).

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Organization & RBAC | `/organization` (halaman ini) |
| Sidebar 14 item lain | `/operations`, `/work-orders`, `/service-requests`, `/preventive-maintenance`, `/field-inspections`, `/assets`, `/facilities`, `/inventory`, `/purchasing`, `/vendors`, `/reports`, `/audit-logs`, `/notifications`, `/settings` |
| `Export Audit Log` | `GET /api/v1/rbac/audit-export` (unduh CSV L30D; saat ini hanya toast) |
| `SSO & Security Policies` | Modal `#ssoModal` (tetap di halaman; bukan navigasi) |
| `+ Provision User` | Modal `#inviteModal` → `POST /api/v1/users` via SCIM (tetap) |
| Kartu user (klik) | Seleksi inline `#quickActionPanel` (bukan navigasi; belum ada profil `/organization/users/[id]`) — MISSING |
| `Edit Assignment` | Editor assignment user (modal atau `/organization/users/[id]/edit`) — MISSING |
| `Reset MFA / Key` | `POST /api/v1/users/:id/mfa-reset` (tetap + toast) |
| `Audit Impersonate` | Mode impersonasi read-only + banner audit (flow khusus) — MISSING |
| `Deactivate User` | `POST /api/v1/users/:id/deactivate` (wajib dialog, bukan `confirm()` native) |
| Tab role matriks | State lokal (`?role=tech`), bukan navigasi |
| `Deploy Rule` / `Deploy Rules (HTMX Live)` | `PUT /api/v1/rbac/roles/:key` (tetap + toast) |
| `Clone Policy as New Role` | `POST /api/v1/rbac/roles/:key/clone` (tetap; belum ada halaman role baru) |
| Ikon `notifications` (header) | `/notifications` |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **Profil user (MEDIUM)** — klik kartu hanya mengisi panel; belum ada
   `/organization/users/[id]` (riwayat login, sesi, WO, sertifikasi).
   `// TODO: Create user profile route /organization/users/[id]`
2. **Flow impersonasi (MEDIUM)** — `Audit Impersonate` hanya toast; butuh mode
   read-only + banner + jejak audit + tombol keluar.
   `// TODO: Create impersonation mode with audit banner and exit`
3. **Halaman login/MFA/SSO-callback (HIGH, prasyarat prod)** — hub mengatur
   SSO/MFA/SCIM tetapi tidak ada route `(auth)/login`; wajib sebelum produksi.
4. **Dialog deaktivasi (HIGH)** — `confirm()` native harus diganti
   `AlertDialog` (alasan, tanggal efektif, alihkan WO aktif).
5. **Target global `+ New Dispatch / Request` (MEDIUM)** — tak terdefinisi
   lintas-hub.

**Inkonsistensi yang dicatat (bukan diperbaiki diam-diam):**
- Shift A ditulis `07:00-15:30 WIB` (KPI) vs `06:00 - 22:00` (simulator ABAC).
- Jumlah role: `6 Roles` (halaman ini) vs `8 Roles` (settings seed) — kanonisasi saat seeding.
- Avatar 3 kartu hotlink `googleusercontent` (sementara; ganti avatar lokal/inisial).
- `screen.png` benar (sorot `Organization & RBAC`).

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis, Tailwind Play CDN, Inter + JetBrains Mono, Material Symbols.
- Filter/seleksi/tab/modal/toast murni JS vanilla + `confirm()` native.
- Tanpa fetch, tanpa routing, tanpa state global.

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 + React + TypeScript** | Route `/organization`; typing `OrgUser`, `RoleKey`, `CapabilityMatrix`, `AbacContext`. |
| **Tailwind CSS (build)** | Split direktori/matriks; token sistem A. |
| **shadcn/ui** — `Card`, `Badge`, `Button`, `Input`, `Select`, `Table`, `Checkbox`, `Tabs`, `Dialog`, `AlertDialog`, `Avatar`, `Skeleton`, `Toast`, `Tooltip` | Roster, matriks, simulator, modal invite/SSO, dialog deaktivasi (ganti `confirm()`), avatar, skeleton, toast. |
| **lucide-react** | Pengganti Material Symbols (users, shield, key, sensors, search). |
| **SWR / TanStack Query** | Roster + filter server-side, matriks per role, simulator, sesi. |
| **axios** | CRUD user, role deploy/clone/reset, MFA reset, deactivate, SCIM. |
| **zod + react-hook-form** | Validasi form invite (nama, email kerja, role, crew, badge) + alasan deaktivasi. |
| **next-auth / SSO (SAML/OIDC)** | Login/MFA/SSO-callback yang belum ada di mockup (prasyarat prod). |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Deskripsi | Trigger |
|---|---|---|---|
| GET | `/api/v1/users` | Roster + filter (q, team, role, status) | On page load + filter/search |
| POST | `/api/v1/users` | Provision user via SCIM (invite modal) | On submit `Provision via SCIM` |
| GET | `/api/v1/users/:id` | Profil user + sesi + WO aktif | (MISSING) On click profil |
| PATCH | `/api/v1/users/:id/assignment` | Ubah assignment/role/crew | On click `Edit Assignment` |
| POST | `/api/v1/users/:id/mfa-reset` | Kirim link reset MFA/key | On click `Reset MFA / Key` |
| POST | `/api/v1/users/:id/deactivate` | Nonaktifkan akun (+ alihkan WO) | On confirm dialog deaktivasi |
| POST | `/api/v1/users/:id/impersonate` | Mulai mode impersonasi audit | On click `Audit Impersonate` |
| GET | `/api/v1/rbac/roles` | Daftar 6 role + metadata | On page load tab role |
| GET | `/api/v1/rbac/roles/:key/matrix` | Matriks 15 modul × 6 kapabilitas | On ganti tab role |
| PUT | `/api/v1/rbac/roles/:key` | Deploy aturan matriks | On click `Deploy Rule(s)` |
| POST | `/api/v1/rbac/roles/:key/clone` | Duplikat policy sebagai draft | On click `Clone Policy as New Role` |
| POST | `/api/v1/rbac/roles/reset` | Kembalikan ke baseline tenant | On click `Reset/Discard` |
| GET | `/api/v1/rbac/simulate?role=&context=` | Kalkulasi akses efektif ABAC | On ganti role/konteks simulator |
| GET | `/api/v1/rbac/audit-export` | Export CSV event RBAC L30D | On click `Export Audit Log` |
| GET | `/api/v1/sso/policies` | Kebijakan SSO/MFA/SCIM (viewer) | On open `#ssoModal` |
| GET | `/api/v1/org/stats` | KPI (148 personel, 6 role, MFA, 42 sesi) | On page load |

Contoh fetch:

```ts
// TODO: Replace roster mock with GET /api/v1/users?q=&team=&role=&status=
import axios from "axios";
const { data } = await axios.get("/api/v1/users", {
  params: { q: "kowalski", team: "HVAC", role: "Senior Field Tech", status: "ACTIVE" },
});
```

```ts
// TODO: Replace deploy mock with PUT /api/v1/rbac/roles/tech (with confirm + audit)
await fetch("/api/v1/rbac/roles/tech", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ matrix: { workOrders: { view: true, create: true } } }),
});
```

## 6. Data Mocking Strategy (Implementasi Sementara)

```ts
// TODO: Replace stats mock with GET /api/v1/org/stats
export const orgStats = {
  activePersonnel: 148, split: { field: 96, eng: 32, proc: 14, admin: 6 },
  definedRoles: 6, modules: 15, toggles: 74,
  mfaPct: 1.0, scimLatencyMs: 12, breachesL30D: 0,
  activeTerminals: 42, shiftA: "07:00-15:30 WIB", // TODO: canonicalize vs simulator "06:00 - 22:00"
};

// TODO: Replace roster mock with GET /api/v1/users
export const roster = [
  { id: "usr_01", name: "Marcus Vance", badge: "RFID-0001", email: "m.vance@apexops.io", role: "Facility Director", team: "Leadership", status: "ACTIVE", loginAgo: "4m ago" },
  { id: "usr_02", name: "David Chen", badge: "RFID-1049", email: "d.chen@apexops.io", role: "Engineering Lead", team: "Electrical", status: "ACTIVE", loginAgo: "18m ago" },
  { id: "usr_03", name: "Marcus Kowalski", badge: "RFID-9021", email: "m.kowalski@apexops.io", role: "Senior Field Tech", team: "HVAC", status: "ACTIVE", activeWos: ["WO-2026-0894"], terminal: "HVC-TAB-04" },
  { id: "usr_04", name: "Elena Voronova", badge: "RFID-7714", email: "e.voronova@apexops.io", role: "Senior Field Tech", team: "Electrical", status: "ACTIVE" },
  { id: "usr_05", name: "Sarah Al-Mansoor", badge: "RFID-4402", email: "s.almansoor@apexops.io", role: "Senior Field Tech", team: "Safety", status: "ACTIVE" },
  { id: "usr_06", name: "Robert Langdon", badge: "VEND-TRANE-09", email: "r.langdon@contractor.apexops.io", role: "Vendor Partner Tech", team: "Vendor", status: "EXPIRING", msaExp: "31 Dec 2026" },
];

// TODO: Replace matrix mock with GET /api/v1/rbac/roles/tech/matrix
export const roleMatrixTech = {
  role: "Senior Field Tech",
  rows: [
    { module: "Operations Dashboard & Telemetry", view: true, create: false, update: true, dispatch: true, archive: "locked", financial: "locked" },
    { module: "Work Orders (Execute & Close)", view: true, create: true, update: true, dispatch: true, archive: false, financial: "locked" },
    { module: "Vendors & Contractors Hub", view: true, create: "locked", update: "locked", dispatch: false, archive: "locked", financial: "locked" },
    { module: "Organization & System RBAC", view: "locked", create: "locked", update: "locked", dispatch: "locked", archive: "locked", financial: "locked" },
  ],
};

// TODO: Replace simulator mock with GET /api/v1/rbac/simulate?role=tech
export const accessSimulator = {
  role: "Senior Field Tech",
  summary: "WO + inspections + parts up to $500 without manager; read-only BIM; barred from financial/vendor/admin.",
  geofence: "HQ Nusantara Campus", shiftWindow: "Shift A (06:00 - 22:00)",
  override: "Dual Signoff Required (Eng Lead PIN)",
};
```

Contoh binding:

```tsx
// TODO: Replace roster mock with useSWR('/api/v1/users', fetcher)
import { roster } from "@/mocks/organization-rbac.mock";

export function RosterList({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      {roster.map((u) => (
        // TODO: Create user profile route /organization/users/[id]
        <button key={u.id} onClick={() => onSelect(u.id)}>
          <span>{u.name}</span>
          <span className="font-mono">{u.badge}</span>
        </button>
      ))}
    </div>
  );
}

// TODO: Replace confirm() with AlertDialog for Deactivate User + reassign active WOs
```

## 7. Perbandingan Pass-1 vs Pass-2

### (a) Temuan pass-1 yang TERKONFIRMASI

- **Jam Shift A ganda dalam satu layar.** Pass-1 (`docs/ui-audit/organization-rbac.md`
  §3) mencatat KPI `Shift A (07:00-15:30 WIB)` vs kartu ABAC `Shift A (06:00 - 22:00)`.
  Pass-2 menemukan pasangan yang sama persis — terkonfirmasi, samakan saat rebuild
  (kanonis notif hub: `07:00-15:30 WIB`).
- **Avatar eksternal sementara.** Pass-1 menandai 3 hotlink
  `lh3.googleusercontent.com/aida-public/...`. Pass-2 mengonfirmasi: 3 kartu
  pertama hotlink, 3 terakhir inisial (EV/SA/RL) — ganti `Avatar` internal.
- **`confirm()` native.** Pass-1 menandai `confirmDeactivation()` memakai dialog
  browser. Pass-2 mengonfirmasi string `confirm(...)` di script + pesan
  `Active field telemetry sessions will be terminated` — ganti `AlertDialog`.
- **Konsistensi baik** (cap `$500` = event `POLICY_UPDATE` audit-trail;
  Robert Langdon/Trane; `42 Active Terminals`; 6 role = 6 tab; 15 modul) —
  struktur matriks per modul yang didokumentasikan pass-1 cocok dengan
  pembacaan independen pass-2.

### (b) Temuan BARU yang luput di pass-1

- **Konflik jumlah role lintas layar:** halaman ini `6 Defined Roles` vs
  settings seed `8 Roles` — selisih 2 role tak terjelaskan (kemungkinan role
  sistem yang disembunyikan; pass-1 org tidak mencatatnya, baru muncul di
  pass-1 settings — tetap perlu kanonisasi eksplisit).
- **Detail kontrak JS/DOM:** atribut `data-*` per kartu + `filterUsers()` 4
  dimensi, shortcut `Ctrl+/` atau `/`, `id` (`userSearchInput`, `teamFilter`,
  `roleFilter`, `statusFilter`, `userCountBadge`, `quickActionPanel`,
  `selectedUserBadgeCode/Name/Role`, `simulatorRoleName/SummaryText`,
  `activeRoleIndicator`), kamus `roleDescriptions` (threshold
  direktur ≤$50,000 / lead ≤$5,000 / tech ≤$500 / vendor Trane-bounded /
  auditor read-only), timeout SSO `30/120 mnt`, SCIM `Instant (<50ms)`.
- **Data roster presisi:** badge `RFID-0001/1049/9021/7714/4402/VEND-TRANE-09`,
  login `4m/18m/32m/1h`, `MSA: Exp 31 Dec 2026` + status `EXPIRING`.

### (c) KOREKSI atas pass-1

- **Tidak ada koreksi material.** Pass-1 akurat; pass-2 hanya melengkapi.
  Satu nuansa: pass-1 §2 menautkan `Export Audit Log` ke `/audit-logs` sebagai
  "terkait" — pass-2 menegaskan tombol saat ini hanya toast
  (`exportAuditLogModal`), unduhan nyata belum ada; keduanya konsisten bahwa
  backend-nya MISSING.
