# Audit End-to-End SaaS — Apex Ops CMMS (`new-dash`)

> Tanggal: 2026-09-14 · Auditor: Senior SaaS Architect / Product Engineer / SRE / Security Engineer / Product Analyst (agent)
> Metode: read-only exploration + verifikasi runtime (install, `npm run build`, `next dev`, probe HTTP). **Tidak ada perubahan kode.**
> Source of truth: implementasi aktual di repo (bukan dokumentasi). Setiap klaim diberi evidence + label **[VERIFIED]** (dikonfirmasi eksekusi/grep), **[INFERRED]** (konsekuensi struktural dari kode), **[UNVERIFIED]**.
> Definisi PASS yang dipakai (sesuai permintaan): *user action → state backend berubah benar → data persistent → UI merefleksikan hasil → failure bisa didiagnosis → outcome bisnis tercapai.*

---

## 0. Reconnaissance — Apa Repo Ini Sebenarnya

| Aspek | Temuan | Evidence |
|---|---|---|
| Frontend app | Next.js 14.2.13 App Router + Tailwind + Radix (shadcn-style), ~10.332 baris TS/TSX, 84 file, 28 route | `package.json`, `find app components lib` **[VERIFIED]** |
| Backend/API | **TIDAK ADA.** Nol route handler (`app/api` absen), nol server action (`'use server'` absen), nol middleware | `find app -path '*api*'` → kosong; `grep -rn "use server"` → kosong; `ls middleware.ts` → tidak ada **[VERIFIED]** |
| Network call | **TIDAK ADA.** Nol `fetch()`/`axios`/`XMLHttpRequest` di seluruh `app/`, `components/`, `lib/` | grep → 0 hasil **[VERIFIED]** |
| Database | **TIDAK ADA.** Nol ORM/driver/migrasi/skema. Semua data = konstanta hardcoded (`lib/canon.ts` + array seed per komponen) | `package.json` deps; `lib/canon.ts` **[VERIFIED]** |
| Persistence browser | **TIDAK ADA.** Nol `localStorage`/`sessionStorage`/`document.cookie`/`indexedDB`/`serviceWorker` | grep → 0 hasil **[VERIFIED]** |
| Authentication | Simulasi murni client-side. Kredensial pre-filled, MFA code hardcoded `482916`, tidak ada session/token/cookie yang dibuat | `components/auth/LoginForm.tsx:13,17-18,46-50` **[VERIFIED]** |
| Authorization | Tidak ada. Semua route (termasuk `/settings`, `/organization`, `/audit-trail`, `/profile`) balas **200 tanpa login** | probe curl 11 route → semua 200 **[VERIFIED]** |
| Tenant model | String hardcoded tunggal `APX-NUSA-01`. Tidak ada kolom/model tenant (karena tidak ada DB) | `lib/canon.ts:8` **[VERIFIED]** |
| Billing/subscription/payment | **ABSEN TOTAL** — tidak ada UI, tidak ada backend, tidak ada provider | tidak ada file/route terkait **[VERIFIED]** |
| Signup / email verification / landing | **ABSEN TOTAL** — hanya `/login` (mock) | `app/(auth)/login/page.tsx` satu-satunya route auth **[VERIFIED]** |
| Notification | UI hub hardcoded; tidak ada email/push/engine | `components/notifications/NotificationsHub.tsx` (SEED array) **[VERIFIED]** |
| Background jobs / queue / cron / webhook | Tidak ada. "Webhook" di Settings = array 3 objek hardcoded; "sync queue" field = `setTimeout` terskrip | `SettingsHub.tsx` `HOOKS`; `components/field/SyncStatus.tsx:28-42` **[VERIFIED]** |
| Cache / file storage / object storage | Tidak ada. "Backup snapshot/restore" = simulasi toast + download manifest JSON palsu | `SettingsHub.tsx:185` **[VERIFIED]** |
| Analytics | **NOL** event product analytics (tidak ada GA/PostHog/Segment/custom) | grep deps & kode **[VERIFIED]** |
| Admin/internal dashboard | Tidak ada (Settings/Org adalah UI mock, bukan admin tooling nyata) | — **[VERIFIED]** |
| External integrations | Nol riil. Modbus/SCADA/Slack/PagerDuty/Incident.io/Okta/ERP semuanya teks dekoratif | `app/(ops)/page.tsx` ("Modbus 192.168.4.112:502 · synced"), `TopBar.tsx` ("HTMX Server: Connected"), `SettingsHub.tsx` `HOOKS`, `OrgHub.tsx:398` ("push to Okta") **[VERIFIED]** |
| Logging/monitoring | Tidak ada (nol logger, nol error reporting/Sentry) | grep **[VERIFIED]** |
| Feature flags | Tidak ada | — **[VERIFIED]** |
| Tests | **NOL.** Tidak ada file `*.test.*`/`*.spec.*`, tidak ada test framework di deps | find → kosong **[VERIFIED]** |
| Deployment/infra | **NOL.** Tidak ada CI (`.github` absen), Dockerfile, compose, vercel.json, IaC | ls → tidak ada **[VERIFIED]** |
| Build | Hijau. Semua route **Static/SSG** kecuali `/work-orders/[id]` (dynamic) — data literally di-bake saat build | `npm run build` exit 0 **[VERIFIED]** |
| Dependensi rentan | `next@14.2.13` → **1 critical + banyak high CVE** (auth bypass middleware, cache poisoning, DoS Server Actions/RSC, request smuggling); `postcss` high; `glob` high (dev) | `npm audit` **[VERIFIED]** |
| Artefak repo | `.headroom/ccr.sqlite` (binary 1,4 MB, provenance tak jelas) **ter-commit**; arsip `stitch_*` 13 MB + zip 13 MB di repo; mockup memuat API key plaintext (didokumentasikan "bocor→rotasi", C21) | `git ls-files`; `stitch_.../settings_system_configuration/code.html:828` **[VERIFIED]** |
| Prototipe `web/*.html` | 11 file HTML standalone dengan 36 referensi `hx-*="/api/v1/..."` → **endpoint-nya tidak ada** di app Next (tidak ikut ter-build; dead wiring bila disajikan) | grep `web/*.html` **[VERIFIED]** |

**Kesimpulan recon:** Repo ini adalah **prototipe UI high-fidelity (design prototype / demo klik-able)** dari sebuah CMMS, bukan SaaS yang berjalan. Dokumentasi repo sendiri jujur soal ini (`README.md`: "referensi visual, bukan aplikasi jadi"; `PROGRESS.md` Fase F = rebuild UI). Bahaya auditnya justru di situ: **UI-nya didesain menyerupai sistem produksi penuh** (login+MFA+SSO, RBAC, audit trail ber-hash SHA-256, API key management, backup/restore, webhook, telemetri Modbus, OLAP query runner) sehingga sepintas terlihat "selesai".

### Peta arsitektur AKTUAL vs yang diklaim UI

```
DIKLAIM OLEH UI:                          AKTUAL (verified):
User                                      User
 ↓                                         ↓
Frontend (Next.js)                        Frontend (Next.js static/SSG + client components)
 ↓                                         ↓
API /api/v1/* (HTMX)                      ✗ TIDAK ADA (semua /api/* → 404)
 ↓                                         ↓
Backend services                          ✗ TIDAK ADA
 ↓                                         ↓
DB / cache / queue                        useState() in-memory per komponen (hilang saat refresh/navigasi)
 ↓                                         ↓
Third party (SCADA/Slack/PagerDuty/Okta)  ✗ TIDAK ADA (teks dekoratif + setTimeout)
 ↓                                         ↓
Webhook / async worker                    ✗ TIDAK ADA (simulasi terskrip)
 ↓                                         ↓
DB update → UI refresh → notification     Toast sukses palsu (backend tidak pernah ada)
```

---

## A. Executive Verdict (maks 15 bullet)

1. **[VERIFIED] Ini bukan SaaS — ini prototipe UI.** Nol API route, nol server action, nol fetch, nol database, nol middleware. Seluruh 28 route adalah halaman statis/SSG + komponen client dengan data hardcoded. Probe `/api/v1/*` → 404.
2. **[VERIFIED] Tidak ada satu pun flow yang PASS** menurut definisi PASS yang diminta (action → backend state → persist → UI reflect → diagnosable → business outcome). Semua flow berhenti di langkah 1: UI.
3. **[VERIFIED] Login adalah teater.** Email/password pre-filled, MFA code `482916` hardcoded di bundle, SSO = `setTimeout(900ms)`. Tidak ada session/cookie/token yang dibuat; step "done" hanya `Link href="/"`.
4. **[VERIFIED] Semua halaman terbuka tanpa autentikasi** — `/settings` (API key management!), `/organization` (RBAC!), `/audit-trail`, `/profile` balas 200 langsung. Tidak ada authZ sama sekali.
5. **[VERIFIED] Nol persistensi di mana pun** — termasuk di browser (tidak ada localStorage/IndexedDB/cookie). Setiap aksi (hold WO, approve PO, revoke session, adjust inventory, restore backup) = perubahan `useState` lokal + toast; **refresh mengembalikan segalanya ke kondisi awal**.
6. **[VERIFIED] Keamanan "gate" adalah properti bundle JS, bukan kontrol server**: supervisor/approver PIN `2468` hardcoded di 4 komponen dan bahkan **dicetak di label UI** ("demo: 2468"); API key "live" digenerate `crypto.getRandomValues` di browser lalu "di-reveal" lewat PIN client-side.
7. **[VERIFIED] `next@14.2.13` membawa CVE critical/high** (authorization bypass middleware, cache poisoning, DoS Server Actions/RSC, HTTP request smuggling). Bila di-deploy apa adanya → terekspos.
8. **[VERIFIED] Billing/monetisasi absen 0%** — tidak ada plan, trial, checkout, subscription, entitlement, invoice. Bahkan UI-nya tidak ada. Signup juga tidak ada; funnel SaaS belum eksis dari tahap 0.
9. **[VERIFIED] Multi-tenant absen** — tenant adalah string kanon `APX-NUSA-01`; tidak ada model data untuk isolation. Ini keputusan arsitektur yang harus dibuat dari hari-1 saat backend dibangun, bukan ditambal.
10. **[VERIFIED] Observability & analytics nol total** — tidak ada log, metric, trace, request-id, error reporting, maupun product event. Halaman "Audit Trail" adalah fiksi hardcoded (6 event, hash `sha256:7f4c9a…` palsu, counter "184.9k" statis).
11. **[VERIFIED] Nol test, nol CI/CD, nol deployment config** — tidak ada jaring pengaman apa pun untuk perubahan.
12. **[VERIFIED] Indikator sistem menipu**: "HTMX Server: Connected" (TopBar), "Modbus 192.168.4.112:502 · synced" (dashboard), "SCADA Auto-Bot" (audit trail) semuanya always-on decoration — tidak ada koneksi apa pun.
13. **[INFERRED] Yang benar-benar berfungsi nyata hanya 2 mekanisme**: export CSV/print (Blob + `window.print`, data tetap palsu) dan navigasi/routing + command palette ⌘K. Keduanya PARTIAL, bukan PASS.
14. **Yang paling berbahaya bukan bug — melainkan gap persepsi.** UI ini sangat meyakinkan (state loading/empty/error/confirm lengkap, kanon data konsisten lintas 28 route). Jika didemokan ke customer/investor sebagai "produk", setiap klaim fungsional adalah false claim. Risiko kedua: CVE framework bila di-deploy.
15. **Yang sudah benar-benar bagus (nilai riil repo ini)**: disiplin kanon data (`lib/canon.ts` + `docs/CANON_DATA.md` 22 keputusan), kontrak UX (skeleton, EmptyState jujur untuk record di luar seed, ErrorToast dengan trace+retry, ConfirmDialog destruktif, guard validasi form), dua design system (desktop/field) terimplementasi konsisten, build hijau, dokumentasi audit UI 20 layar × 2 pass. **Ini adalah spesifikasi produk tervalidasi — bahan baku yang kuat untuk build backend yang sesungguhnya.**

---

## B. Architecture & Flow Map

(Lihat §0 untuk diagram aktual vs diklaim.)

Rincian lapisan:

- **Route structure**: `app/(auth)/login` (shell mandiri), `app/(ops)/*` (22 route desktop dalam `OpsShell` = SideNav 15 item + TopBar + CommandPalette), `app/(field)/*` (3 route mobile dalam `FieldShell` bottom-nav), `app/purchasing/[id]/print` (di luar shell, print-clean).
- **Pola data**: tiap page = server component tipis yang me-render satu "Hub" client component (`'use client'`); Hub memuat array seed hardcoded + puluhan `useState` (SettingsHub: 743 baris, 49 useState; NotificationsHub 29; OrgHub 27).
- **Pola aksi**: `onClick → setX(...) → setTimeout(...) → push toast`. Tidak pernah ada I/O.
- **Guard server-side yang ada** (satu-satunya logika di server): validasi format slug + `notFound()` (`purchasing/[id]/page.tsx` regex `^(PO|PR)-\d{4}-\d{4}$`) dan EmptyState "jujur" untuk record di luar seed (`work-orders/[id]` selain `WO-2026-0894`).
- **Cross-component state**: tidak ada (nol context/store/global state). Konsistensi lintas halaman dicapai lewat konstanta CANON yang di-hardcode identik di dua tempat — bukan lewat sumber data bersama. Contoh: konversi Finding→WO di `FindingDesk` tidak membuat/mengubah apa pun di `/work-orders`.

---

## C. Core Journey Matrix

| Journey | Status | Evidence | Problem | User Impact |
|---|---|---|---|---|
| Acquisition: Landing → Sign Up → Email verify | **NOT IMPLEMENTED** | Tidak ada route `/`, `(marketing)`, `/signup`; `/` langsung dashboard ops | Seluruh tahap akuisisi absen | Tidak ada cara menjadi user |
| Login (email+pass / SSO / MFA) | **MOCK** | `LoginForm.tsx` (DEMO_CODE:13, sso():33-40 setTimeout, verify():46-50 lokal) | Tidak ada kredensial diverifikasi, tidak ada session | "Login" = pintu terbuka; refresh = logout semu |
| Activation: create workspace/org, setup awal | **NOT IMPLEMENTED** | Tenant hardcoded `lib/canon.ts:8`; OrgHub = daftar orang hardcoded | Tidak ada onboarding; single-tenant fiksi | Aktivasi mustahil |
| Activation event pertama (WO pertama / inspeksi pertama / finding→WO) | **MOCK** | `FindingDesk.tsx`, `RunChecklist.tsx`, `WoDialogs.tsx` — semua transisi lokal | Tidak ada state backend yang berubah | "First value" adalah ilusi |
| Daily workflow: dashboard → list → detail → aksi | **MOCK** (browsing) / **NOT IMPLEMENTED** (mutasi) | 22 route `(ops)`; seed arrays; dialog `setDone(true)` | Data baca hardcoded; aksi tidak persist | Demo meyakinkan; kerja nyata mustahil |
| Field execution: checklist PASS/FAIL + PIN override + evidence | **MOCK** | `RunChecklist.tsx` (SUPERVISOR_PIN:18; foto/voice/IoT = state string) | Evidence tidak terupload; verdict tidak tercatat | Kepatuhan OSHA/LOTO = fiksi |
| Field offline sync (outbox + idempotency key) | **MOCK** | `SyncStatus.tsx:28-42` — retry pertama q1 **dioskrip gagal**, berikutnya sukses | Tidak ada queue/network; idempotency = teks toast | Pola yang bagus, implementasi 0% |
| Monetization: trial → limit → upgrade → checkout → renewal | **NOT IMPLEMENTED** | Tidak ada satu pun artefak billing | Seluruh revenue path absen | MRR = $0 by design |
| Retention: notifikasi/email/reminder/scheduled report | **MOCK/NOT IMPLEMENTED** | `NotificationsHub.tsx` SEED hardcoded; "schedule report" = dialog | Tidak ada delivery mechanism | Tidak ada loop yang menarik user kembali |
| Collaboration (multi-user, handover shift) | **MOCK** | `ShiftPlan.tsx` accept→toast; `ProfileSessions.tsx` revoke=filter lokal | Semua "user" adalah fiksi dalam 1 browser | Kolaborasi mustahil |
| Support/admin: audit log, user lookup, recovery | **MOCK** | `AuditTrail.tsx` SEED 6 event + hash palsu | Tidak ada data nyata untuk di-support | Supportability = 0 |

**Activation Event untuk SaaS ini (bila dibangun)** — diusulkan dari rantai kanon yang sudah didesain UI-nya: *inspeksi field pertama yang menghasilkan finding → terkonversi menjadi WO pertama → WO pertama ditutup dengan parts ledger + sign-off.* Saat ini: tidak dapat terjadi (nol persistensi). **[VERIFIED]**

---

## D. Broken / Partial Flow (audit vertikal)

Format: `Flow | UI | API | Backend | DB | Async | External | Error Handling | Status`

| Flow | UI | API | Backend | DB | Async | External | Error Handling | Status |
|---|---|---|---|---|---|---|---|---|
| Login + MFA + SSO | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ (SAML simulasi) | validasi form saja | **MOCK** |
| Operations Dashboard (KPI, dispatch, telemetri) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ (Modbus dekorasi) | — | **MOCK** (baca-hardcoded) |
| WO list + filter + CSV | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | EmptyState jujur | **MOCK**; CSV = **PARTIAL** (Blob riil, data palsu) |
| WO detail + SLA countdown + labor stopwatch | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | guard slug | **MOCK** (timer = jam client) |
| WO Hold / Escalate / Sign-off | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | reason-guard lokal | **MOCK** — badge sendiri mengaku: "pill updates **after ledger write**" (`WoDialogs.tsx:24`) padahal ledger tidak ada |
| SR triage → convert ke WO | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | guard | **MOCK** (WO tidak tercipta) |
| Preventive Maintenance schedule | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **MOCK** |
| Field audit queue (skeleton→list) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | skeleton + offline banner | **MOCK** (loading = setTimeout) |
| Run Checklist (PASS/FAIL, PIN 2468, foto/voice/IoT) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ (kamera/mic tidak dipakai) | guard baca/catatan | **MOCK** |
| Sync outbox + Idempotency-Key retry | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | toast "partial failure" terskrip | **MOCK** |
| Finding desk → auto-WO conversion (LOTO-gated) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | guard | **MOCK** |
| Asset registry + detail + BOM + ledger + QR | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | EmptyState | **MOCK**; QR/print = **PARTIAL** |
| Asset BIM viewer (SVG skematik + drawer node) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ESC/keyboard | **MOCK** (telemetri node = teks) |
| Facility hierarchy | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **MOCK** |
| Inventory adjust (PIN + WO-ref guard) / receive / issue | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | guard qty≤available lokal | **MOCK** — mutasi stok tidak transactional karena tidak ada stok |
| Purchasing: authorize EDI / GRN / 3-way match / quorum | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | guard | **MOCK** |
| Vendors: MSA, renewal, dispatch-guard, PDF viewer | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | guard | **MOCK** (PDF = 3 div) |
| Reports: OLAP builder + "SQL live" + run | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **MOCK** — SQL hanya string (`ReportsHub.tsx:132`), toast "executed in 46ms · 412 records" (`:140`) adalah fiksi |
| Audit trail (hash chain, filter, export) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **MOCK** (6 event seed, `sha256:7f4c9a…` palsu) |
| Notifications (ack, escalate, approve PO via PIN) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | confirm dialog | **MOCK** |
| Organization/RBAC (invite, role edit "push to Okta", SCIM) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ (Okta fiksi) | guard | **MOCK** |
| Settings (backup/restore, webhook register/ping, seed engine, API key rotate/reveal, numbering lock) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | PIN dialog | **MOCK** — "restore" = toast; "webhook ping" = toast; key = crypto-random client-side tak tersimpan |
| Profile sessions (revoke, impersonate, rotate key, print badge) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ConfirmDialog | **MOCK** |
| Shift handover accept | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **MOCK** |
| Command palette ⌘K | ✓ | n/a | n/a | n/a | n/a | n/a | empty result | **PARTIAL** (navigasi riil atas 7 target hardcoded; bukan search data) |
| Print dossier PO | ✓ | n/a | n/a | n/a | n/a | n/a | notFound guard | **PARTIAL** (print riil, data statis) |
| Signup / email verification / password reset | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **NOT IMPLEMENTED** |
| Billing / checkout / subscription / invoice | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **NOT IMPLEMENTED** |
| Webhook inbound / integrations | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — | **NOT IMPLEMENTED** |
| `web/*.html` hx-* → `/api/v1/*` (36 referensi) | ✓ (prototipe) | ✗ 404 | ✗ | ✗ | ✗ | ✗ | htmx tak dimuat di app | **DEAD CODE / DEAD WIRING** |

**Jumlah flow PASS: 0.**

---

## E. Security & Tenant Findings

| Severity | Finding | Attack / Failure Scenario | Evidence | Fix |
|---|---|---|---|---|
| **P0** | Tidak ada autentikasi & otorisasi; seluruh app publik | Siapa pun dengan URL mengakses "API key management", RBAC, audit trail, data vendor/PO | probe curl: `/settings`, `/organization`, `/audit-trail`, `/profile` → 200 tanpa kredensial **[VERIFIED]**; tidak ada `middleware.ts` | Bangun authN nyata (session/JWT httpOnly) + authZ per route & per aksi di **server**; middleware guard |
| **P0** | `next@14.2.13` — CVE critical/high (middleware auth bypass GHSA-f82v-jwr5-mffw, cache poisoning GHSA-qpjv-v59x-3qc4, DoS Server Actions GHSA-7m27-7ghc-44w9, RSC deserialization DoS, request smuggling GHSA-ggv3-7p47-pfv8, image optimizer) | Deploy apa adanya → DoS/bypass tanpa kode aplikasi apa pun | `npm audit` **[VERIFIED]** | Upgrade ke rilis patch terbaru 14.2.x (atau migrasi Next 15 LTS) sebelum deploy apa pun |
| **P1** | Secret gate client-side: MFA `482916`, PIN `2468` hardcoded & tercetak di label UI | Bypass trivial (baca bundle / baca layar). Bila pola ini terbawa ke produksi → approval finansial ($2.900 PO, mutation stok) tanpa kontrol server | `LoginForm.tsx:13`; `RunChecklist.tsx:18,331`; `InventoryLedger.tsx:176`; `NotificationsHub.tsx:192`; `SettingsHub.tsx:708-710` **[VERIFIED]** | Semua verifikasi pindah ke server; label demo dihapus |
| **P1** | API key "live" digenerate di browser (`crypto.getRandomValues`), reveal-once via PIN client-side, tidak pernah disimpan/divalidasi server | Key theater: tidak ada yang dilindungi; pola berbahaya bila dianggap "sudah ada key management" | `SettingsHub.tsx:57` `genKey()` **[VERIFIED]** | Secrets management nyata (KMS/vault), hash di server, audit akses |
| **P2** | Mock API key plaintext di arsip mockup (`apx_live_sec_8921a9fb…`) | Sudah diklasifikasi "bocor→rotasi" oleh kanon C21 — tetapi tetap hidup di repo publik | `stitch_.../settings_system_configuration/code.html:828`; `docs/CANON_DATA.md` C21 **[VERIFIED]** | Pertahankan status "dianggap bocor"; pastikan tidak pernah dipakai di lingkungan nyata; arsip beku sesuai aturan repo |
| **P2** | `.headroom/ccr.sqlite` (1,4 MB, provenance tak jelas) ter-commit | Binary tak teraudit di riwayat git; risiko berisi data tooling/sesi | `git ls-files | grep headroom` **[VERIFIED]** | Hapus dari tracking + `.gitignore`; cek isi sebelum memutuskan riwayat |
| **P2** | Tidak ada rate limiting/brute-force protection di mana pun (klaim "attempts are rate-limited" di UI MFA adalah fiksi) | Bila login dibangun tanpa ini → credential stuffing | `LoginForm.tsx:130` (teks klaim) vs nol implementasi **[VERIFIED]** | Rate limit server-side saat auth dibangun |
| **P3** | XSS: risiko rendah saat ini (nol `dangerouslySetInnerHTML`/`innerHTML`/`eval`; React escaping default) | — | grep **[VERIFIED]** | Pertahankan; tambahkan CSP saat produksi |
| **P3** | CORS/CSRF/cookie flags: N/A karena tidak ada API/cookie | Saat API dibangun, ini wajib dikonfigurasi eksplisit | — **[INFERRED]** | Desain sejak awal (sameSite, origin allowlist) |
| **Tenant isolation** | **Tidak dapat diaudit — tidak ada lapisan data.** Tenant = string kanon tunggal; tidak ada `tenant_id`, tidak ada query | Bila backend dibangun tanpa model tenant dari hari-1 → IDOR/cross-tenant sistemik | `lib/canon.ts:8` **[VERIFIED]** | Skema DB dengan `organization_id` di setiap tabel + scoping wajib di repository layer + test isolation |
| Upload | Tidak ada upload riil (foto evidence = state string "1 frame attached 14:20 WIB") | Saat dibangun: validasi MIME/magic bytes/size, private bucket, signed URL | `RunChecklist.tsx:31` **[VERIFIED]** | — |

---

## F. Reliability Findings

| Severity | Failure Mode | Current Behavior | Desired Behavior |
|---|---|---|---|
| P1 | Apa pun yang membutuhkan backend | Tidak ada backend → tidak ada failure mode nyata selain "fitur fiksi". App static: praktis tidak bisa gagal selain serve HTML | Sistem nyata dengan degradasi anggun |
| P2 | DB/Redis/queue/storage/payment/email/AI unavailable | N/A — tidak ada satu pun dependency runtime | Retry + circuit breaker + dead-letter + fallback UX per dependency |
| P2 | Worker mati / webhook terlambat / duplikat | "Sync" field = skrip `setTimeout`; kegagalan pertama q1 **dioskrip** (`SyncStatus.tsx:32-36`) | Outbox persisten (IndexedDB dulu, server kemudian), idempotency key nyata di server, replay webhook aman |
| P2 | State hilang | **Terjadi sekarang, selalu**: refresh/navigasi menghapus semua hasil aksi user (nol persistensi) **[INFERRED dari struktur — pasti]** | Server state sebagai sumber kebenaran; optimistic UI + rekonsiliasi |
| P3 | Race condition / double submit | Tidak mungkin terjadi (tidak ada I/O); guard `if (ssoBusy) return` hanya anti-double-click kosmetik | Idempotency + locking saat mutasi nyata dibangun |

Satu-satunya "reliability" yang terverifikasi: `npm run build` hijau dan server dev menyajikan semua route konsisten (**[VERIFIED]**).

---

## G. Observability Gaps

| Gap | Why It Matters | Required Metric / Log / Trace |
|---|---|---|
| Tidak ada logging sama sekali (nol logger) | Tidak ada satu pun pertanyaan support yang bisa dijawab | Structured log: timestamp, level, service, request_id, user_id, tenant_id, operation, duration, error_code (tanpa secret/PII) |
| Tidak ada error reporting | Kegagalan client tak terlihat (ErrorToast pun tak melaporkan ke mana pun) | Sentry/sejenis: unhandled exception, failed mutation, dengan trace id |
| Tidak ada metrics | Tidak tahu request rate/error rate/latency/DB/queue | RED metrics per endpoint + saturasi (CPU/RAM/DB conn/queue depth) |
| Tidak ada tracing | Flow browser→API→DB→worker→3rd party tak bisa ditelusuri (karena tidak ada lapisan-lapisan itu) | OpenTelemetry sejak backend pertama |
| Tidak ada product analytics | Seluruh funnel buta: signup, activation, feature adoption, churn — nol event | Event minimal: `signup_completed`, `workspace_created`, `first_wo_created`, `wo_closed`, `inspection_submitted`, `upgrade_started`, `payment_failed` (+ user_id, tenant_id, plan, timestamp, metadata) |
| "Audit Trail" palsu | Menyerupai kemampuan compliance (hash chain, IP, terminal) padahal fiksi — berbahaya bila dipercaya | Audit log DB append-only nyata dengan hash chain sungguh, saat backend ada |
| "System status"/telemetri dekoratif | "HTMX Server: Connected", "Modbus synced" memberi sinyal kesehatan palsu | Health endpoint nyata + status berbasis pemeriksaan riil |

---

## H. SaaS Funnel

```
Visitor        → tidak ada landing/marketing page          [ABSEN]
Signup         → tidak ada /signup                         [ABSEN — blocker absolut]
Verified       → tidak ada email verification              [ABSEN]
Workspace      → tidak ada pembuatan org/site              [ABSEN — tenant fiksi tunggal]
Setup          → tidak ada onboarding/import aset          [ABSEN]
First value    → activation event (WO/inspeksi pertama)    [MOCK — tak bisa persist]
Repeated value → dashboard/PM/notifikasi                   [MOCK — data beku sejak build]
Paid           → billing                                   [ABSEN 100%]
Retention      → loop notifikasi/report/collab             [ABSEN]
```

**Hypothesis drop-off terbesar:** bukan friction UX — melainkan **tidak adanya pintu masuk** (signup) dan **tidak adanya konsekuensi** (nol persistensi). Pada demo sekalipun, drop-off terjadi di momen pertama user mencoba melakukan hal kedua kalinya dan menemukan pekerjaannya hilang. Instrumen funnel: nol — tidak akan ada data untuk mendiagnosis apa pun.

---

## I. Top 20 Issues (P0 → P3)

| # | Sev | Issue | Impact (business/user/security/ops) | Evidence | Effort | Recommended Fix |
|---|---|---|---|---|---|---|
| 1 | **P0** | Tidak ada backend/API/DB — seluruh value proposition non-fungsional | Semua | §0, §D **[VERIFIED]** | XL | Bangun lapisan API + Postgres dari kanon entitas (WO/SR/Asset/Part/PO/Vendor/INS/FND/User/Org) |
| 2 | **P0** | Nol authN/authZ; semua route publik | Security total | probe 200 **[VERIFIED]** | L | Auth nyata (Auth.js/Clerk/custom) + middleware + authZ server per aksi |
| 3 | **P0** | CVE critical/high `next@14.2.13` | Security/availability | `npm audit` **[VERIFIED]** | M | Upgrade patch rilis; langganan audit deps di CI |
| 4 | **P0** | Nol persistensi (termasuk browser) — semua hasil kerja user hilang saat refresh | User/business total | grep 0 storage API **[VERIFIED]** | XL | Bagian dari #1; interim demo: state global + sessionStorage bila demo harus "menempel" |
| 5 | **P1** | Billing/monetisasi absen 0% | Revenue = 0 | **[VERIFIED]** | XL | Stripe + plan/entitlement di server; UI upgrade |
| 6 | **P1** | Multi-tenant tidak dimodelkan | Security/data saat scale | `canon.ts:8` **[VERIFIED]** | XL (desain) | `organization_id` di semua tabel + scoping repo layer + test isolation sejak skema pertama |
| 7 | **P1** | PIN/MFA/secret gate client-side tercetak di UI | Security theater | `RunChecklist.tsx:18,331` dll **[VERIFIED]** | S (hapus) / L (nyata) | Verifikasi server-side; hapus label demo sebelum stakeholder melihat |
| 8 | **P1** | Nol test (unit/integration/E2E) | Regresi tanpa deteksi | find → 0 **[VERIFIED]** | L | Playwright smoke 28 route + unit state machine WO + (nanti) API contract test |
| 9 | **P1** | Nol observability (log/metric/trace/error) | Ops buta | §G **[VERIFIED]** | M | pino + request-id + Sentry + OTel saat API lahir |
| 10 | **P1** | Nol product analytics | Growth buta | §G **[VERIFIED]** | M | PostHog/analog + event funnel minimal |
| 11 | **P1** | Signup/onboarding/activation tidak eksis | Funnel tahap 0 | §H **[VERIFIED]** | L | Landing + signup + verifikasi email + wizard setup site/aset |
| 12 | **P2** | Indikator palsu ("HTMX Server: Connected", "Modbus synced", audit-trail ber-hash) | Kepercayaan stakeholder; false claim risk | `TopBar.tsx`, `(ops)/page.tsx`, `AuditTrail.tsx` **[VERIFIED]** | S | Watermark "DEMO — simulated data" global; hapus indikator koneksi fiktif |
| 13 | **P2** | Inkonsistensi identitas: login selesai sebagai "Elena Voronova · Senior Field Tech", TopBar "Marcus Vance (SK)", profil persona lain, email pre-filled `e.lindqvist@…` tak dikenal kanon | Kebingungan demo/UX | `LoginForm.tsx:18,137` vs `TopBar.tsx:50-56` vs `ProfileSessions.tsx` **[VERIFIED]** | S | Satu persona sesi konsisten |
| 14 | **P2** | `web/*.html`: 36 `hx-*` ke `/api/v1/*` yang tidak ada (dead wiring) | Membingungkan; berisiko disajikan sebagai app | grep **[VERIFIED]** | S | Jangan serve; tandai arsip prototipe (sudah di-exclude tsconfig/build) |
| 15 | **P2** | God components (SettingsHub 743 baris/49 useState; NotificationsHub 510/29; OrgHub 568/27) | Maintainability saat integrasi nyata | wc/grep **[VERIFIED]** | M | Dekomposisi per tab/section + hook per domain sebelum wiring API |
| 16 | **P2** | Nol CI/CD/IaC; font belum self-host (system stack) | Deployment readiness | ls; `app/layout.tsx:3-6` **[VERIFIED]** | M | GitHub Actions (typecheck+build+audit+test) + Docker/Vercel + woff2 lokal |
| 17 | **P2** | Field offline sync (core CMMS) hanya skrip; tidak ada outbox persisten | Value prop field mobility | `SyncStatus.tsx` **[VERIFIED]** | L | IndexedDB outbox + background sync + idempotency key server |
| 18 | **P3** | `.headroom/ccr.sqlite` binary ter-commit | Repo hygiene | git ls-files **[VERIFIED]** | S | Untrack + gitignore |
| 19 | **P3** | Pola Next-15 (`params: Promise<>` + await) di app Next-14 — lolos karena `await` non-Promise, tapi rawan saat upgrade | Version drift | `purchasing/[id]/page.tsx`, `print/page.tsx` **[VERIFIED]** | S | Selaraskan dengan versi framework yang dipilih |
| 20 | **P3** | Arsip 13 MB (zip + ekstrak) di repo git | Repo bloat | root listing **[VERIFIED]** | S | Pindahkan ke release asset/LFS (catatan: aturan repo membekukan arsip — keputusan pemilik) |

---

## J. Production Readiness Score

Definisi: 0=absent · 1=prototype · 2=fragile · 3=usable · 4=production ready · 5=mature

| Area | Score | Dasar |
|---|---:|---|
| Core workflow | **1** | Prototipe visual lengkap & konsisten; nol eksekusi nyata |
| UX completeness | **3** | (Lapisan demo) kontrak UX matang: skeleton, empty state jujur, error toast + trace/retry, confirm destruktif, guard validasi, dua design system, a11y label — tapi terputus dari state nyata |
| Authentication | **0** | Mock; nol session |
| Authorization | **0** | Tidak ada; semua route publik |
| Tenant isolation | **0** | Tidak ada model data |
| Data integrity | **0** | Tidak ada DB; kanon/ID_FORMATS adalah *spesifikasi* integritas yang bagus, bukan implementasi |
| Billing | **0** | Absen total |
| Security | **0** | Publik + framework bercelah critical + secret gate client-side |
| Reliability | **1** | Situs statis melayani konsisten; tidak ada sistem untuk reliable |
| Performance | **1** | SSG ~107–131 KB first-load JS/route — ringan untuk demo; jalur kritis riil tak terukur (tak ada backend) — tanpa klaim throughput |
| Observability | **0** | Nol log/metric/trace |
| Analytics | **0** | Nol event |
| Supportability | **0** | Nol tooling; nol data untuk dicari |
| Test coverage | **0** | Nol test |
| Deployment readiness | **1** | Build hijau; tanpa CI/IaC; deps bercelah |

**Rata-rata tertimbang kesan keseluruhan: ± 0,6/5 sebagai SaaS produksi; ± 3/5 sebagai prototipe desain/spesifikasi produk.**

---

## K. Recommended Roadmap

### Phase 0 — Stop-the-bleeding (S–M)
1. **Jangan deploy apa adanya** (CVE critical next@14.2.13 + app 100% publik).
2. Upgrade Next ke rilis patch; kunci `npm audit` + `typecheck` + `build` di CI (GitHub Actions).
3. Pasang watermark/banner **"DEMO — data simulasi, tanpa backend"** di OpsShell/FieldShell; hapus indikator koneksi fiktif ("HTMX Server: Connected", "Modbus synced") dan label PIN demo sebelum ditunjukkan ke pihak luar.
4. Untrack `.headroom/ccr.sqlite`; putuskan satu persona sesi (fix #13).
5. Tegaskan posisi repo secara eksplisit di README: *design prototype* (sudah sebagian ada) agar tidak ada klaim "produk jadi".

### Phase 1 — Make Core Journey Reliable (L–XL) *inti pembangunan produk*
1. **Skema data dari kanon**: Postgres + migrasi (Prisma/Drizzle). Entitas: Organization/Site, User+Role, Asset(+BOM), Part/Bin/Movement, WorkOrder (+status machine CREATED→DISPATCHED→IN_PROGRESS→ON_HOLD→COMPLETED/CANCELLED, transisi valid di server), ServiceRequest, Inspection/ChecklistStep/Finding, PurchaseRequest/PO/GRN/InvoiceMatch, Vendor/MSA, Shift/Handover, AuditEvent (append-only). `organization_id` + index di setiap tabel sejak hari-1; unique constraint untuk idempotency (mis. GRN per PO, konversi Finding→WO satu kali).
2. **Auth nyata**: signup/login/verify/reset (atau Auth.js/Clerk), session httpOnly, middleware guard, RBAC server-side (6 role kanon → permission map), rate limit.
3. **API layer** untuk 5 critical path (lihat §Critical Path di bawah) dengan validasi server (Zod), error code terstruktur, transaction boundary (mutasi stok + ledger + WO dalam satu transaksi).
4. Konversi Hub hardcoded → data server (mulai dari WorkOrder, ServiceRequest, Asset, Inventory, Field Inspection); pertahankan kontrak UX yang sudah bagus (skeleton/empty/error kini menjadi nyata).
5. **Field offline**: outbox IndexedDB + Idempotency-Key dihormati server + sync engine (pola yang sudah dispesifikasikan `SyncStatus`/`RunChecklist` akhirnya diimplementasikan).
6. Evidence upload riil (foto/voice): object storage privat + signed URL + validasi MIME/size.
7. Test: Playwright E2E happy-path 5 critical flow + unit state machine + test isolation tenant.

### Phase 2 — Make SaaS Operable (M–L)
1. Structured logging (pino) + request_id/trace_id + OTel tracing browser→API→DB→worker.
2. Sentry (client+server), health/readiness endpoint, uptime monitor.
3. Metrics RED + saturasi + queue depth; alerting (Slack/PagerDuty — yang hari ini hanya dekorasi).
4. **Audit trail nyata** (append-only + hash chain) menggantikan fiksi `AuditTrail.tsx`; admin/support console: user/tenant/WO/PO lookup, job retry, event replay, entitlement debug, suspend account.
5. Backup/restore DB nyata (yang di UI sudah digambar).

### Phase 3 — Improve Growth (L)
1. Landing + signup + email verification + onboarding wizard (site → aset pertama → user pertama).
2. Activation event didefinisikan & diinstrumentasi: **WO pertama ditutup** (atau inspeksi pertama disubmit) — target TTV.
3. Product analytics (PostHog): event funnel §G; dashboard activation/adoption/churn.
4. Billing: Stripe checkout + webhook (signature verify, duplikat & out-of-order aman) + entitlement server-side + invoice/receipt + dunning (grace period, downgrade).
5. Retention loop nyata: notifikasi email SLA-at-risk, scheduled report, digest PM.

### Phase 4 — Scale (L–XL)
1. Read replica untuk reports/OLAP (menggantikan "query builder" fiksi), materialized views KPI.
2. Queue/worker nyata (BullMQ/SQS) untuk notifikasi, sync, webhook fan-out + DLQ.
3. Caching (Redis/HTTP) untuk list & KPI; pagination server-side (hari ini semua tabel client-side atas seed kecil).
4. Load test jalur kritis (login, dashboard, list WO, submit inspeksi, checkout) — **tanpa klaim throughput sebelum terukur**.
5. Multi-region/HA sesuai kebutuhan tenant (data SCADA/fasilitas sensitif terhadap latensi lokal).

### 5 Critical Path (untuk audit terdalam saat dibangun — §19)
1. **Signup → create site/org → invite user** (saat ini ABSEN).
2. **Field inspection → finding → auto-WO conversion** (rantai kanon FND-2026-0188 → SR-2026-0894 → WO-2026-0894 sudah dispesifikasikan UI-nya; backend 0%).
3. **WO execution: dispatch → parts issue (inventory transactional) → sign-off (LOTO/photo gate) → close** — jantung CMMS.
4. **Procurement: PR → authorize (approval berjenjang) → PO → GRN → 3-way match** — jantung finansial operasional.
5. **Billing/entitlement** (absen) — prasyarat revenue.

---

## State Machine, Idempotency, Data Integrity (ringkasan §4/8/9 prompt)

- **State machine**: tidak ada satu pun entity dengan state machine nyata. Status WO/SR/PO adalah **teks statis**; transisi "terjadi" hanya sebagai badge lokal di dalam dialog (`WoDialogs.tsx` `setDone(true)`) dan hilang saat dialog/route berganti. **Semua state dikontrol frontend — bahkan lebih lemah: dikontrol satu komponen.** Flag maksimal sesuai instruksi audit. **[VERIFIED]**
- **Valid/invalid transition, retry, duplikat, race, stale, rollback**: tidak dapat terjadi (nol I/O) — tetapi juga nol yang diimplementasikan untuk masa depan. Spesifikasi terbaik yang ada: skrip `SyncStatus` (partial failure + key sama saat retry) dan guard "Convert idempotent" di `requests/dialogs.tsx` — keduanya *mock* dari perilaku yang benar. **[VERIFIED]**
- **Data integrity**: tidak ada DB → tidak ada PK/FK/unique/index. Yang tersedia dan berharga: `ID_FORMATS` regex + `CANON` sebagai **cetak biru constraint** (format ID global, dua SKU bearing tak boleh digabung C9, ledger $1,765 = 1.450+195+120). Saat skema dibangun, ini langsung menjadi unique/check constraint + seed test. **[VERIFIED]**
- **Idempotency**: konsep disebut di UI (Idempotency-Key outbox, GRN idempoten, convert-once) — **nol implementasi**. Tidak ada operasi kritikal nyata untuk dilindungi hari ini. **[VERIFIED]**

## Supportability (§16)

Skenario: *"Pembayaran saya berhasil tapi account belum upgrade"* → **tidak dapat terjadi dan tidak dapat ditangani**: tidak ada pembayaran, tidak ada account, tidak ada data. Padanan CMMS: *"WO sudah saya tutup tapi stok part belum terpotong"* → support tidak punya: user lookup (nol), tenant lookup (nol), audit log nyata (fiksi), job retry (nol job), webhook replay (nol webhook), entitlement debug (nol billing). **Missing tooling: semuanya** — dicakup Phase 2 roadmap. **[VERIFIED]**

## Business Value (§17)

- **Masalah user yang disasar** (dari UI + docs): koordinasi pemeliharaan fasilitas mission-critical — dispatch WO P1, kepatuhan LOTO/OSHA, inspeksi field offline, kontrol stok part kritis, procurement dengan approval berjenjang, visibilitas SLA. Rantai nilainya **koheren dan terdokumentasi sangat baik** (kanon 22 keputusan, interaction trees 201 pohon).
- **Output hari ini**: demo klik-able 28 route yang secara meyakinkan memvisualisasikan seluruh value chain.
- **Business outcome hari ini**: **nol** — tidak ada action yang menghasilkan state, tidak ada measurable outcome, tidak ada next action yang persisten. Setiap fitur berstatus "bagus secara teknis (UI) tetapi tidak menyelesaikan masalah (belum mengeksekusi apa pun)".
- **Nilai riil repo**: *de-risked product spec* — UI/UX, kanon data, dan pohon interaksi sudah divalidasi dua pass; biaya discovery produk sudah dibayar. Yang tersisa adalah 100% engineering backend.

## Performance (§14)

Tidak ada jalur kritis backend untuk diaudit (nol query, nol I/O). Yang terukur nyata: build SSG hijau; first-load JS 106–131 KB/route — wajar. Risiko performa masa depan yang *sudah terlihat di pola UI*: semua tabel memuat seluruh seed dan memfilter di client (akan menjadi overfetching saat data riil ribuan baris), "OLAP" menjanjikan agregasi yang akan butuh replica, telemetry stream menjanjikan polling/WebSocket. **Tidak ada klaim throughput dibuat — belum ada yang bisa di-benchmark.** **[VERIFIED untuk fakta build/bundle; INFERRED untuk risiko]**

---

## Pertanyaan Final: 100 / 1.000 / 10.000 user besok — di mana gagal lebih dulu?

**Sistem ini gagal sebelum user ke-1, bukan pada skala.** Urutan kegagalan yang akan terjadi bila diluncurkan besok apa adanya:

1. **User ke-1, menit ke-0** — "signup" tidak ada; user masuk lewat login palsu (kredensial apa pun + kode `482916` yang tercetak di layar). Tidak ada akun yang terbentuk.
2. **User ke-1, menit ke-5** — aksi pertama yang bermakna (tutup WO, adjust stok, approve PO) "berhasil" (toast hijau) tetapi **refresh menghapus semuanya**. Ticket support pertama: *"pekerjaan saya hilang"* — dan support tidak punya alat apa pun (nol log, nol data, nol admin).
3. **User ke-2** — melihat tenant, aset, WO, dan "identitas" yang sama persis dengan user ke-1 (semua data hardcoded, semua orang "Marcus Vance/Elena Voronova" sekaligus). Kolaborasi mustahil; kepercayaan hilang.
4. **100 user** — bukan masalah beban (situs statis melayani fine); masalahnya 100% fungsional & reputasional: produk tidak melakukan apa yang dijanjikan UI-nya. Revenue $0 (billing absen).
5. **1.000–10.000 user** — tidak relevan; tidak ada yang bisa retention karena tidak ada nilai yang persist. Satu-satunya risiko teknis tambahan: CVE critical Next.js bila ada yang mengeksploitasinya (DoS/bypass) — ironisnya, "serangan" paling merusak adalah app-nya sendiri yang tidak berfungsi.

**Titik gagal pertama pada skala** (setelah backend nyata dibangun, sebagai proyeksi arsitektur — **[INFERRED]**): (a) ketiadaan model tenant akan memaksa redesign skema menyeluruh bila ditambal kemudian — jadi `organization_id` wajib sejak tabel pertama; (b) outbox sync field tanpa idempotency server akan menghasilkan duplikasi mutasi stok/ledger pada koneksi buruk — kasus nyata pertama di ~100 teknisi lapangan; (c) agregasi report tanpa replica akan memukul DB utama di ~1.000 aset × telemetri. Ketiganya sudah diantisipasi di roadmap Phase 1–4.

---

## Lampiran: Metode & Batasan

- **Verifikasi runtime**: `npm install` + `npm run build` (hijau, semua route Static/SSG kecuali `/work-orders/[id]`) + `next dev` di port 3000 + probe curl 11 halaman (semua 200 tanpa auth) + probe `/api/*` (semua 404) + inspeksi HTML SSR (seed data ter-bake). Working tree tetap bersih (tidak ada perubahan file ter-track; `node_modules`/`.next` ter-gitignore).
- **Batasan**: audit tidak melakukan browser-interaksi manual per halaman (state-loss disimpulkan dari ketiadaan total persistence API — konsekuensi struktural yang pasti); tidak ada benchmark performa (tidak ada backend untuk diukur); arsip `stitch_*` dan `web/*.html` diperlakukan sebagai artefak referensi beku sesuai `AGENTS.md`.
- **Label**: **[VERIFIED]** = dikonfirmasi langsung (kode/eksekusi); **[INFERRED]** = konsekuensi logis struktur kode; tidak ada klaim **[UNVERIFIED]** yang dipakai sebagai dasar temuan.
