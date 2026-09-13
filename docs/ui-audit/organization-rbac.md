# UI Audit — Organization Governance & RBAC Directory (`organization_rbac_governance_hub`)

> Sumber: `stitch_facility_maintenance_platform_ui/organization_rbac_governance_hub/code.html` (1052 baris —
> file terbesar batch ini) + `screen.png` sefolder. Design system: **A**.
> Route usulan: `/organization`. Dibuat: 2026-09-13. Template v2 Architect.
> Konteks global: `docs/ui-audit/navigation-audit.md`.

## 1. Page Overview (Penjelasan Halaman)

### Tujuan utama

Halaman **Organization Governance & RBAC Directory** adalah pusat tata kelola
identitas: direktori personel, matriks kapabilitas RBAC 15 modul × 6 kapabilitas,
simulator akses efektif ABAC, provisioning SCIM, dan kebijakan SSO/MFA. Badge
`SCIM v2.4 Active` dan `Tenant: APX-NUSA-01` menegaskan sinkronisasi direktori
per-tenant (Okta), sementara KPI `100% MFA Enforced` dan `L30D 0 Breaches`
menjadikannya layar bukti kepatuhan keamanan.

Alur kerja yang didukung: pantau KPI governance → cari/filter personel → pilih
user untuk diagnostik akun (edit, reset MFA, impersonate, deactivate) → pilih
role template → review/ubah matriks kapabilitas → simulasikan akses efektif +
constraint ABAC → deploy rules / clone / discard → provision user baru via SCIM →
tinjau kebijakan SSO.

### Daftar elemen UI utama

1. **Hub header + aksi** — judul + badge `SCIM v2.4 Active` + `Tenant:
   APX-NUSA-01` + deskripsi RBAC/ABAC; tombol `Export Audit Log`
   (`exportAuditLogModal()`), `SSO & Security Policies` (`openSsoModal()`),
   `+ Provision User` (primary, `openInviteUserModal()`).
2. **KPI rail (4 kartu)** — `Active Personnel` (`148`: 96 Field / 32 Eng /
   14 Proc / 6 Admin, `100% Provisioned`); `Defined Roles` (`6 RBAC Matrix`,
   `15 Modules`, `74 granular capability toggles`); `Compliance & MFA`
   (`100% MFA Enforced`, `Okta SCIM: 12ms`, `L30D 0 Breaches`); `Field Sessions
   Telemetry` (`42 Active Terminals`, `Shift A (07:00-15:30 WIB)`).
3. **Personnel Roster** (kiri, 5/12) — badge `6 Displayed` (id
   `userCountBadge`), `Live Filtering`, search (`userSearchInput`,
   shortcut `Ctrl + /`, `onkeyup="filterUsers()"`), 3 select (Team, Role,
   Status), 6 kartu user (`selectUser('usr_0x', this)`, atribut
   `data-name/role/team/badge/email/status`): Marcus Vance (Facility Director,
   `RFID-0001`, VP Ops, login 4m), David Chen (Engineering Lead, `RFID-1049`,
   18m), Marcus Kowalski (Senior Field Tech, `RFID-9021`, ring terpilih,
   `2 Active WOs`, `WO-2026-0894 (Chiller #4)`, `HVC-TAB-04`), Elena Voronova
   (Senior Field Tech, `RFID-7714`, inisial `EV`), Sarah Al-Mansoor (Senior
   Field Tech, `RFID-4402`, `SA`), Robert Langdon (Vendor Partner Tech,
   `VEND-TRANE-09`, Trane OEM, `MSA: Exp 31 Dec 2026`, `External Tenant`,
   status `EXPIRING`). Tiap kartu: avatar, nama + chip, peran, badge MFA,
   email + login terakhir.
4. **Account Diagnostics & Actions** (id `quickActionPanel`) — `Focused User`
   (Marcus Kowalski), `Assigned Role` (mono), `Directory Sync: Synchronized via
   Okta SCIM`; 4 tombol: `Edit Assignment`, `Reset MFA / Key`,
   `Audit Impersonate` (read-only), `Deactivate User` (destruktif,
   `confirmDeactivation()` memakai `confirm()` native).
5. **Permission Matrix by Role** (kanan, 7/12) — tombol `Reset` + `Deploy Rule`;
   6 tab role (`switchRoleTab`: Enterprise Admin, Facility Director,
   Eng Lead / Mgr, **Senior Field Tech aktif**, Vendor Partner Tech, Read-Only
   Auditor); tabel 15 modul × 6 kolom (`View / Create / Update / Dispatch /
   Archive / Financial Signoff`) dengan tiga glyph sel: checkbox granted,
   `lock` System Locked, `remove` non-applicable. Isi per modul (untuk role
   Senior Field Tech): (1) Dashboard view/update/dispatch ya, create/archive/
   financial tidak; (2) WO penuh kecuali archive off + financial lock;
   (3) SR penuh kecuali archive off; (4) PM view/update/dispatch, create off;
   (5) Inspections penuh + financial ya; (6) Findings view/create/update/
   dispatch; (7) Locations view saja; (8) Asset Registry view (+create/update
   parsial); (9) Inventory view + batas `$500`; (10) Transfers view/create;
   (11) PR view/create; (12) PO view + receiving check; (13) Vendors view saja;
   (14) Reports view; (15) Organization & System RBAC full-lock Admin.
6. **Effective Access Simulator** — judul role aktif (id `simulatorRoleName`),
   badge `ABAC Policy Engine Active`, ringkasan `Calculated Live Permissions`
   (id `simulatorSummaryText`: WO create/execute/dispatch, inspeksi + temuan,
   konsumsi parts ≤ `$500.00` tanpa otorisasi manajer, GIS/BIM read-only,
   **dilarang** release finansial final, approval kontrak vendor, administrasi
   user); 3 kartu constraint ABAC (Geofence `HQ Nusantara Campus / East Wing &
   Substation`; Shift Window `Shift A (06:00 - 22:00)`, off-hours lockout;
   Critical Override `Dual Signoff Required`, PIN Eng Lead); footer
   (`Clone Policy as New Role`, `Discard Changes`, `Deploy Rules (HTMX Live)`).
7. **Modal Provision Enterprise User** (id `inviteModal`) — nama, email,
   role (6 opsi), department/crew (5 opsi), RFID/badge (auto bila kosong),
   `Cancel` + `Provision via SCIM` (`submitNewUser()`, validasi nama).
8. **Modal SSO & SCIM Configuration** (id `ssoModal`, view-only) — IdP
   `Okta SAML 2.0 / SCIM API` CONNECTED; MFA `FIDO2 WebAuthn or TOTP`
   ENFORCED 100%; timeout `30 / 120 MIN` (mobile/desktop); SCIM `Instant
   (<50ms)` webhook push.
9. **Toast system** (`apexToast`, `triggerToast`, auto-hide 3.2s) + data JS
   `roleDescriptions` (6 ringkasan: admin unrestricted; director ≤ `$50,000` +
   decommission; lead ≤ `$5,000`; tech ≤ `$500`; vendor contract-bounded Trane;
   auditor read-only).

### State UI

- **Empty state:** filter roster 0 hasil → "Tidak ada personel cocok" + reset
  filter; role tanpa user → simulator tetap tampil dengan catatan "0 users
  assigned".
- **Loading state:** roster memakai skeleton kartu (avatar + 2 baris); matriks
  memakai skeleton grid; deploy memakai spinner `Deploying...` + toast sukses.
- **Error state:** deploy gagal → toast destruktif + matriks kembali ke baseline
  (rollback optimistis); SCIM provision gagal → modal tetap terbuka dengan pesan
  field; impersonate selalu read-only + banner sesi (pola 2B `ui-state-patterns`).

## 2. Navigation Flow & Routing (Alur Navigasi)

Shell desktop global; semua `href="#"` — target adalah route usulan.

| Elemen UI / Action | Target URL / Destination Page |
|---|---|
| Sidebar: Organization & RBAC (aktif) | `/organization` (halaman ini) |
| Sidebar: 14 item lain | Route §2 `navigation-audit.md` |
| `Export Audit Log` | Unduh CSV L30D RBAC (aksi + toast), terkait `/audit-logs` |
| `SSO & Security Policies` | Modal viewer (tetap di halaman) — kebijakan edit di IdP, bukan di app |
| `+ Provision User` / `Provision via SCIM` | Modal → `POST` SCIM (tetap di halaman) |
| Kartu user: `WO-2026-0894 (Chiller #4)` | `/work-orders/[id]` — MISSING |
| `Edit Assignment` | Modal editor assignment — MISSING (desain modal belum ada) |
| `Reset MFA / Key` | Aksi kirim link reset (tetap di halaman + toast) |
| `Audit Impersonate` | Mode impersonasi read-only + banner — MISSING (kebutuhan prod; ikut `navigation-audit.md` §4 item 11) |
| `Deactivate User` | Aksi suspend + terminasi sesi (tetap di halaman; ganti `confirm()` dengan dialog) |
| Tab role / checkbox matriks | State lokal (produksi: draft per `?role=` + dirty flag) |
| `Deploy Rule(s)` | `PUT` rules (tetap di halaman + toast HTMX) |
| `Clone Policy as New Role` | Draft role baru (tetap di halaman; list role bertambah) |
| `Revoke Active Session` (implisit via notif hub) | `/notifications` → aksi; user profile/session — MISSING (lihat §3) |
| Ikon `notifications` (header) | `/notifications` |
| `+ New Dispatch / Request` (header) | Target global tak terdefinisi — MISSING |

## 3. Missing Pages & Flow Gaps (Audit Halaman Hilang)

1. **`/work-orders/[id]` (HIGH).** Kartu Marcus Kowalski menautkan konteks
   `WO-2026-0894` tanpa tujuan.
   `// TODO: Create detail page routing for /work-orders/[id]`
2. **Auth prod: `(auth)/login` + MFA/SSO callback (HIGH untuk produksi).**
   Seluruh hub mengatur SSO/MFA/SCIM tetapi tidak ada layar login; callback
   Okta SAML dan enroll FIDO2 wajib sebelum go-live.
   `// TODO: Create auth routes (auth)/login + SSO callback + MFA enroll`
3. **Mode Audit Impersonate + User profile/session (MEDIUM).** Tombol
   `Audit Impersonate` hanya toast; butuh: banner sesi persisten, audit trail
   otomatis (`actor: admin AS user`), tombol keluar impersonasi; serta halaman
   profil/`Revoke Active Session` (dirujuk notifications hub).
   `// TODO: Create impersonation session mode + user profile page`
4. **Modal Edit Assignment (MEDIUM).** Tombol ada tanpa desain form (role, crew,
   shift, geofence, efektif-tanggal).
   `// TODO: Create edit assignment modal`
5. **SCIM provisioning flow lengkap (MEDIUM).** Modal invite hanya nama/email/
   role; butuh status sync per user, retry, dan webhook log (terkait modal SSO
   yang view-only).
   `// TODO: Create SCIM sync status + retry flow`
6. **Target global `+ New Dispatch / Request` (MEDIUM)** — pola global belum diputuskan.

**Temuan (jangan diam-diam diperbaiki):**

- **Jam Shift A ganda.** KPI menulis `Shift A (07:00-15:30 WIB)` tetapi kartu
  ABAC menulis `Shift A (06:00 - 22:00)` — inkonsistensi dalam satu layar;
  kanonis yang dipakai notif hub (`07:00-15:30 WIB`). Samakan saat rebuild.
- **Avatar eksternal.** 3 foto memakai `lh3.googleusercontent.com/aida-public/...`
  (URL sementara Stitch) — produksi wajib ganti `Avatar` inisial/upload internal;
  jangan hotlink.
- **`confirm()` native.** `confirmDeactivation()` memakai dialog browser —
  ganti `AlertDialog` dengan redaksi dampak (sesi aktif dihentikan) + ketik nama
  untuk suspend direktur ke atas.
- **Konsistensi baik yang patut dicatat:** cap `$500` cocok dengan event
  `POLICY_UPDATE` di audit-trail; Robert Langdon (Trane) cocok dengan vendor
  `Trane Technologies` dan `PR-2026-0314` (Trane EarthWise Supply); `42 Active
  Terminals` cocok dengan audit-trail; 6 role = 6 tab ✓; 15 modul = klaim 15 ✓.

## 4. Tech Stack & External Libraries

### Kondisi saat ini (mockup Stitch)

- HTML statis + **Tailwind Play CDN**, **Inter** + **JetBrains Mono**,
  **Material Symbols Outlined** (fill penuh untuk ikon governance), avatar
  `<img>` eksternal + inisial fallback, JS vanilla (filter, select, tab,
  modal show/hide, toast, `confirm()`).

### Stack produksi yang diharapkan

| Library / Framework | Peran di halaman ini |
|---|---|
| **Next.js 14 (App Router) + React + TypeScript** | Framework utama. Route `/organization` (+ `(auth)/login`); typing `User`, `Role`, `CapabilityMatrix`, `AbacConstraints`. |
| **Tailwind CSS (build)** | Layout 5/7 kolom, kartu roster, tabel matriks dense; token sistem A. |
| **shadcn/ui (Radix)** — `Card`, `Badge`, `Avatar`, `Input`, `Select`, `Tabs`, `Table`, `Checkbox`, `Switch`, `Dialog`, `AlertDialog`, `Toast`, `Tooltip`, `Skeleton`, `ScrollArea` | Roster + filter, tab role, matriks 15×6, modal invite/SSO/edit, dialog deactivate, toast. |
| **lucide-react** | Pengganti Material Symbols (manage_accounts, shield, groups, sensors, policy). |
| **SWR atau TanStack Query** | Roster (search debounce), matriks per role, simulator; mutation deploy/provision dengan rollback optimistis. |
| **axios** (atau `fetch` + `ky`) | HTTP client `/api/v1` + header tenant `APX-NUSA-01`. |
| **zod + react-hook-form** | Validasi modal provision (nama, email domain, role, badge unik) dan edit assignment. |
| **next-auth / Auth.js (Okta provider) + WebAuthn (`@simplewebauthn`)** | Login SSO/MFA prod; halaman ini hanya menampilkan status, bukan kredensial. |

## 5. Expected Backend APIs (Kontrak API yang Diharapkan)

| Method | Endpoint | Trigger | Expected Payload / Response |
|---|---|---|---|
| GET | `/api/v1/users` | On page load + search/filter roster | Query: `?q=kowalski&team=HVAC&role=Senior+Field+Tech&status=ACTIVE`. Response: `{ "data": [{ "id": "usr_03", "name": "Marcus Kowalski", "email": "m.kowalski@apexops.io", "role": "Senior Field Tech", "team": "HVAC", "badge": "RFID-9021", "status": "ACTIVE", "mfa": "ACTIVE", "lastLoginAt": "...", "activeWos": ["WO-2026-0894"] }], "meta": { "total": 148, "displayed": 6 } }` |
| POST | `/api/v1/users` | On submit `Provision via SCIM` | Body: `{ "name": "Liam Sterling", "email": "l.sterling@apexops.io", "role": "Senior Field Tech", "department": "HVAC Mechanical Shift A", "badge": "RFID-XXXX" }`. Response: `{ "data": { "id": "usr_149", "scimSync": "QUEUED" } }` |
| PATCH | `/api/v1/users/:id` | On submit `Edit Assignment` | Body: `{ "role": "...", "team": "...", "shift": "A" }`. Response: `{ "data": { "id": "usr_03", "role": "..." } }` |
| POST | `/api/v1/users/:id/deactivate` | On confirm `Deactivate User` | Body: `{ "terminateSessions": true }`. Response: `{ "data": { "id": "usr_03", "status": "SUSPENDED" } }` |
| POST | `/api/v1/users/:id/reset-mfa` | On click `Reset MFA / Key` | Response: `{ "data": { "resetLinkSent": true } }` |
| POST | `/api/v1/users/:id/impersonate` | On click `Audit Impersonate` | Body: `{ "readOnly": true }`. Response: `{ "data": { "impersonationToken": "…", "expiresInMin": 30 } }` |
| GET | `/api/v1/roles` | On page load (tab + KPI) | Response: `{ "data": [{ "key": "tech", "name": "Senior Field Tech", "scopes": 15, "toggles": 74 }] }` |
| GET | `/api/v1/roles/:key/permissions` | On ganti tab role | Response: `{ "data": { "role": "tech", "matrix": [{ "module": "work-orders", "view": true, "create": true, "update": true, "dispatch": true, "archive": false, "financialSignoff": false }] } }` |
| PUT | `/api/v1/roles/:key/permissions` | On click `Deploy Rule(s)` | Body: `{ "matrix": [...] }`. Response: `{ "data": { "role": "tech", "deployedAt": "..." } }` |
| POST | `/api/v1/roles/:key/clone` | On click `Clone Policy as New Role` | Body: `{ "name": "Senior Field Tech — Night Shift" }`. Response: `{ "data": { "key": "tech-night", "draft": true } }` |
| GET | `/api/v1/roles/:key/effective-access` | On ganti tab / pilih user (simulator) | Query: `?userId=usr_03`. Response: `{ "data": { "summary": "...", "spendCap": 500.0, "geofence": ["HQ-NUSANTARA"], "shiftWindow": "07:00-15:30", "dualSignoff": true } }` |
| GET | `/api/v1/sso/config` | On open modal SSO | Response: `{ "data": { "idp": "Okta SAML 2.0", "status": "CONNECTED", "mfa": "FIDO2_WEBAUTHN_OR_TOTP", "mfaCoverage": 1.0, "timeouts": { "mobileMin": 30, "desktopMin": 120 }, "scimLatencyMs": 12 } }` |
| GET | `/api/v1/audit-logs` | On click `Export Audit Log` (filter RBAC L30D) | Query: `?category=Governance&from=-30d&format=CSV`. Response: file/attachment. |
| DELETE | `/api/v1/sessions/:sessionId` | Dari flow revoke sesi | Response: `{ "data": { "revoked": true } }` |

## 6. Data Mocking Strategy (Implementasi Sementara)

Mock di `mocks/organization.mock.ts`.

```ts
// TODO: Replace roster mock with GET /api/v1/users?q=&team=ALL&role=ALL&status=ALL
export const roster = [
  { id: "usr_01", name: "Marcus Vance", email: "m.vance@apexops.io", role: "Facility Director", team: "Leadership", badge: "RFID-0001", status: "ACTIVE", mfa: "ACTIVE", lastLogin: "4m ago" },
  { id: "usr_02", name: "David Chen", email: "d.chen@apexops.io", role: "Engineering Lead", team: "Electrical", badge: "RFID-1049", status: "ACTIVE", mfa: "ACTIVE", lastLogin: "18m ago" },
  { id: "usr_03", name: "Marcus Kowalski", email: "m.kowalski@apexops.io", role: "Senior Field Tech", team: "HVAC", badge: "RFID-9021", status: "ACTIVE", mfa: "ACTIVE", activeWos: ["WO-2026-0894"], terminal: "HVC-TAB-04" },
  { id: "usr_04", name: "Elena Voronova", email: "e.voronova@apexops.io", role: "Senior Field Tech", team: "Electrical", badge: "RFID-7714", status: "ACTIVE", mfa: "ACTIVE", lastLogin: "32m ago" },
  { id: "usr_05", name: "Sarah Al-Mansoor", email: "s.almansoor@apexops.io", role: "Senior Field Tech", team: "Safety", badge: "RFID-4402", status: "ACTIVE", mfa: "ACTIVE", lastLogin: "1h ago" },
  { id: "usr_06", name: "Robert Langdon", email: "r.langdon@contractor.apexops.io", role: "Vendor Partner Tech", team: "Vendor", badge: "VEND-TRANE-09", status: "EXPIRING", mfa: "ENFORCED", msaExp: "31 Dec 2026" },
];

// TODO: Replace matrix mock with GET /api/v1/roles/tech/permissions (15 modules x 6 capabilities)
export const capabilityMatrix = [
  { module: "work-orders", view: true, create: true, update: true, dispatch: true, archive: false, financialSignoff: false },
  { module: "service-requests", view: true, create: true, update: true, dispatch: true, archive: false, financialSignoff: null },
  { module: "pm", view: true, create: false, update: true, dispatch: true, financialSignoff: null },
  { module: "organization-rbac", view: false, create: false, update: false, dispatch: false, archive: false, financialSignoff: false },
];

// TODO: Replace simulator mock with GET /api/v1/roles/tech/effective-access?userId=usr_03
export const effectiveAccess = {
  role: "tech", spendCap: 500.0,
  summary: "Can create, execute, and dispatch Work Orders; ... Strictly barred from final financial procurement release ...",
  geofence: ["HQ Nusantara Campus"], shiftWindow: "07:00-15:30", dualSignoff: true,
};

// TODO: Replace sso mock with GET /api/v1/sso/config
export const ssoConfig = { idp: "Okta SAML 2.0", status: "CONNECTED", mfa: "FIDO2_WEBAUTHN_OR_TOTP", mobileTimeoutMin: 30, desktopTimeoutMin: 120, scimLatencyMs: 12 };

// TODO: Create auth routes (auth)/login + SSO callback + MFA enroll (SSO/MFA diatur di sini tanpa layar login)
// TODO: Create impersonation session mode + user profile page (Audit Impersonate hanya toast)
// TODO: Create edit assignment modal (tombol Edit Assignment tanpa desain form)
// TODO: Create detail page routing for /work-orders/[id] (konteks WO-2026-0894 di kartu user)
```

Contoh binding (ringkas):

```tsx
// TODO: Replace useState(mock) with useSWR('/api/v1/users?team=ALL', fetcher)
import { roster } from "@/mocks/organization.mock";

export function RosterList({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div>
      {roster.map((u) => (
        <button key={u.id} onClick={() => onSelect(u.id)}>
          <span>{u.name}</span>
          <span className="font-mono">{u.badge}</span>
          <Badge>{u.mfa}</Badge>
        </button>
      ))}
    </div>
  );
}
```

Aturan penggantian mock → API: matriks memakai draft lokal + dirty flag
(`Discard Changes` mengembalikan baseline); deploy memakai `PUT` + rollback
optimistis + toast; avatar eksternal diganti komponen `Avatar` internal sejak
hari pertama (tanpa hotlink).
