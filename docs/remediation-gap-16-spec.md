# GAP-16 — Spec (F2 signup tenant UI — TASK 1 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F2 + `docs/audit-full-app-truth-map.md` baris "Signup / provisioning tenant".
Keputusan produk (final): **bangun UI signup** — backend TIDAK diubah kecuali
terbukti kurang (lihat §3, dua perubahan minimal terjustifikasi).

## 1. Fakta backend (dibaca langsung, kontrak MATCH dengan PROMPT)

- `app/api/auth/signup/route.ts` (44 baris): POST public via `withRoute`
  (`op: 'auth.signup'`, `public: true`). Zod `SignupSchema`:
  `orgName` 3–100 · `adminEmail` `z.string().email()` · `adminName` 2–100 ·
  `adminPassword` 8–100 · `adminTitle` ≤100 opsional. Sukses → **201**
  `{organizationId, orgName, adminUserId, adminEmail}` + cookie `apex_session`
  (`sessionCookieOptions`, httpOnly).
- `lib/services/onboarding-service.ts` (123 baris): transaksional atomik —
  409 `EMAIL_EXISTS` (cek email global, lowercase-trim), org `APX-{SLUG}-{10-99}`,
  8 sequence rows (`WO,SR,PO,PR,INS,FND,GRN,PM`), admin `Enterprise Admin`
  (scrypt hash), `createSession`, audit `ORG_PROVISION` (entityType
  `organization`) — semua dalam satu `db.transaction`.
- ZodError → 400 `VALIDATION_ERROR` envelope ditangani generik oleh
  `withRoute` (`lib/api/http.ts`). Signup route TANPA rate-limit (beda dengan
  login — tidak memakan budget 8/10menit).

## 2. Fakta FE (gap yang ditutup)

- Nol pemanggil signup: grep `signup` di `app/`, `components/`, `lib/` hanya
  menemukan route ts + enum `signup_completed` di `lib/telemetry/analytics.ts`
  (tak terpakai client-side). Tak ada `app/(auth)/signup/`, tak ada
  `components/auth/SignupForm.tsx`.
- Pola yang ditiru: `app/(auth)/login/page.tsx` (17 baris: `getSessionContext()`
  → `redirect('/')`; sanitize `next` → `redirectTo`) dan
  `components/auth/LoginForm.tsx` (kartu `bg-card border border-border-subtle
  rounded-lg shadow-card p-8 w-full max-w-sm`, `apiFetch` POST body objek,
  `ApiError` → pesan jujur + kode, fallback `NETWORK`, sukses →
  `window.location.assign`).

## 3. Perubahan backend/routing minimal (terbukti kurang)

1. **`proxy.ts`** — `PUBLIC_PREFIXES = ['/login', '/api']`. Tanpa cookie,
  `/signup` di-redirect ke `/login` → halaman signup TAK PERNAH terjangkau
  calon tenant. Fix 1 kata: tambah `'/signup'`. (Tanpa ini Langkah-5 runtime
  mustahil — inilah definisi "terbukti kurang".)
2. **Tidak ada perubahan lain di route/service/DB.** Test 400 zod diuji dengan
  memanggil POST handler langsung via `NextRequest` badan invalid — zod throw
  SEBELUM `getDb()` tersentuh (`SignupSchema.parse` duluan di handler), jadi
  test tak menyentuh DB dev. Bila import chain terbukti bermasalah di
  `node --import tsx --test`, fallback: tambah `export` pada `SignupSchema`
  (additive, tanpa perubahan perilaku) lalu uji `.parse` — didokumentasikan
  di laporan task bila terpakai.

## 4. File baru

- `app/(auth)/signup/page.tsx` — mirror login page: cek sesi → `redirect('/')`;
  sanitize `next` (prefix `/`, bukan `//`) → `<SignupForm redirectTo={safeNext} />`.
- `components/auth/SignupForm.tsx` — client form 1 langkah, 5 field:
  nama organisasi, nama admin, email admin, password (min 8), jabatan opsional.
  Validasi klien mirror batas zod server (regex email sama dengan LoginForm;
  min-length orgName 3, adminName 2, password 8, title ≤100). POST
  `/api/auth/signup` via `apiFetch`; sukses → step `done` →
  `window.location.assign(redirectTo)` (default `/`); gagal → pesan `ApiError`
  apa adanya + `(code)` — termasuk 409 `EMAIL_EXISTS` — fallback `NETWORK`
  bila server tak terjangkau. TANPA tombol SSO/passkey. Footer link "Sudah
  punya tenant? Sign in" → `/login`. Kartu tengah mirror LoginForm (shell
  `(auth)/layout.tsx` sudah centered).

## 5. Test (`tests/integration.test.ts` — pola service-level, tanpa login HTTP)

- `signup (GAP-16/F2): provision happy → 201 contract + sesi verify + tenant terisolasi`:
  - `provisionOrganization(db, …)` email unik probe → hasil `{organizationId
    match ^APX-, orgName, adminUserId, adminEmail lowercased, sessionToken}`.
  - `verifySession(db, sessionToken)` → ctx orgId org baru, role `Enterprise Admin`.
  - Isolasi: ctx org baru `listWorkOrders` = 0 (tak melihat 7 WO kanon); ctx
    kanon `admin` dan decoy tak melihat data org baru; `auditEvents` org baru
    memuat `ORG_PROVISION`; tabel `sequences` org baru = 8 baris nextVal 1.
  - (Itu setara kontrak "201 + cookie": sessionToken = nilai cookie yang
    diset route; verifySession = jalur cookie layout.)
- `signup (GAP-16/F2): duplicate email → 409 EMAIL_EXISTS (global, termasuk seed admin)`:
  replay email probe → 409; email `m.vance@apexops.io` → 409.
- `signup (GAP-16/F2): 400 VALIDATION_ERROR via POST handler (zod)`:
  panggil `POST` dari `app/api/auth/signup/route.ts` dengan `NextRequest`
  berbadan password pendek → 400 `VALIDATION_ERROR`; email invalid → 400.
  Tidak ada DB yang tersentuh (zod throw sebelum `getDb()`); involid artinya
  handler tak pernah membuka `.data/pg`.

## 6. Runtime (dev :3157 — port bebas, diverifikasi kosong)

1. `npm run db:setup` (dev server mati — PGlite single-writer), lalu dev :3157.
2. `GET /signup` tanpa cookie → 200 HTML (bukan redirect `/login` — bukti
   perbaikan proxy); HTML memuat field-field form.
3. Happy: `POST /api/auth/signup` body valid → 201 + `set-cookie
   apex_session=…`; dengan cookie itu `GET /` → 200 dashboard authed (bukan
   redirect `/login`). Daftar org kedua via alur yang sama → cookie baru,
   `GET /api/work-orders` dengan cookie baru = list kosong (tenant terisolasi
   dari kanon hidup).
4. Negatif: replay email sama → 409 `EMAIL_EXISTS`; password pendek → 400;
   email invalid → 400.
5. Konsol browser: tak tersedia browser MCP di sandbox ini — diverifikasi
   via HTTP+HTML; dicatat jujur di laporan, checker dapat mengulang di browser.

## 7. Docs yang diupdate (dalam commit yang sama)

- `docs/audit-non-e2e-remediation-map.md` F2 → `[CLOSED GAP-16 2026-09-16]`
  + baris ke-2 Master Table (#2) decision/target.
- `docs/audit-full-app-truth-map.md` baris signup → UI FOUND.
- `TODO.md` (F2/GAP-16 batch: signup-UI dicoret) + `PROGRESS.md` (entri GAP-16
  TASK 1).
- Tabel Pelacakan status di `2026-09-16-PROMPT.md` → TASK 1 DONE + hash commit.

## Non-goals

- SSO, verifikasi email, halaman invite (out-of-scope PROMPT).
- Rate-limit signup, captcha, idempotency server-side untuk signup (route
  public+transaksional; retry 409 jujur). Perubahan struktural backend lain.
- Halaman/layout ops lain; desain tombol tier Enterprise.
