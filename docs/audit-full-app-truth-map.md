# TRUTH MAP LENGKAP FRONTEND ↔ BACKEND — Full-App End-to-End Audit

> Baseline: `docs/audit-fe-be-truth-map.md` (G1–G12) + triase batch 1–4 + runtime Wave 3–4.
> Metode: statik per-feature (51 page, 43 API route, 57 komponen, 54 lib) + runtime-baca
> (`GET /login` 200, `GET /api/health` 200, dev :3145 UP, tanpa mutasi) + bukti runtime Wave 3–4.
> Status layer: FOUND / NOT FOUND / MOCKED / BYPASSED / PARTIAL / BROKEN.
> Status final: END-TO-END / PARTIAL / MOCKED / DEAD-END / FRONTEND-ONLY / BACKEND-ONLY / BROKEN / UNKNOWN.
> Tanpa perbaikan code. Klaim tanpa bukti → (U).

## MATRIX UTAMA

| Domain | Feature | FE | API | Backend | Persistence/External | Final UI | Status |
|---|---|---|---|---|---|---|---|
| Auth | Login password + TOTP MFA + sesi httpOnly | LoginForm FOUND | POST login/mfa/session FOUND | auth-service FOUND | DB sessions FOUND | Dashboard authed | END-TO-END |
| Auth | Passkey register/login/revoke | PasskeySettings + LoginForm FOUND | passkeys/register+login FOUND | webauthn FOUND | DB credentials FOUND | Settings + login btn | END-TO-END |
| Auth | Logout + purge sesi/SW/cache | TopBar FOUND | POST logout FOUND | session revoke FOUND | DB + SW purge FOUND | Redirect /login | END-TO-END |
| Auth | SSO | Tombol disabled jujur FOUND | NOT FOUND | NOT FOUND | — | "not configured (Phase 1b)" | FRONTEND-ONLY |
| Auth | Signup / provisioning tenant | SignupForm + page `/signup` FOUND [GAP-16-T1] | POST signup FOUND | org provision FOUND | DB organizations (U) | Kartu tengah + redirect authed | END-TO-END |
| Auth | Revoke semua sesi | ProfileSessions SEED MOCKED | GET+POST sessions FOUND | list+revoke FOUND | DB sessions FOUND | Daftar statis | BROKEN |
| Org | Provision user | OrgHub POST FOUND | POST users FOUND | org.users.create FOUND | DB users (U) | Toast + row lokal | PARTIAL |
| Org | Deactivate user | setActive → PATCH isActive (fix GAP-2) | PATCH users/[id] CALLED | updateUser + revoke sessions + audit FOUND | DB users FOUND | Toast + status valid | END-TO-END |
| Org | Edit role / reset MFA / clone policy | saveEdit → PATCH role; resetMfa → POST reset-mfa (fix GAP-2; clone policy tetap lokal = PROMOTE) | PATCH + reset-mfa CALLED | updateUser + resetUserMfa + audit FOUND | DB users FOUND | Toast + note valid | END-TO-END |
| WO | CRUD + transisi status | WorkOrderList apiFetch FOUND | wo/* + transitions FOUND | wo-service + audit FOUND | DB FOUND | List/detail/dialog | END-TO-END |
| WO | Tasks per WO | NOT FOUND | wo/[id]/tasks FOUND | (U) FOUND | DB (U) | — | BACKEND-ONLY |
| WO | Evidence upload | RunChecklist apiFetch FOUND | evidence/upload FOUND | writeFile + auth FOUND | FS FOUND, ref publik (U) | Status upload | PARTIAL |
| WO | Print travel pack | Template CANON statis | NOT FOUND | NOT FOUND | — | Halaman print | FRONTEND-ONLY |
| SR | CRUD + transisi + convert WO | SRList/Detail apiFetch FOUND | sr/* + transitions FOUND | sr-service + audit FOUND | DB FOUND | List/detail | END-TO-END |
| Asset | Registry list | Server-fed rows FOUND | — (server comp) | asset-service FOUND | DB Postgres FOUND | Tabel + export | END-TO-END |
| Asset | Dossier detail + BIM link | Server-fed FOUND | — (server comp) | getAssetDossier FOUND | DB FOUND | Dossier | END-TO-END |
| Asset | BIM viewer refresh | setTimeout lokal MOCKED | NOT FOUND | NOT FOUND | — | "live" + timestamp | MOCKED |
| Inventory | Ledger read (seed) | MOV_SEED tanpa badge MOCKED | — | — | Seed, bukan DB | Feed + KPI | MOCKED |
| Inventory | Receive/mutasi + step-up TOTP (fix GAP-3, PIN '2468' dihapus) | apiFetch POST + stepUpCode; rows live GET; demo fallback jujur | POST /api/parts/movements CALLED | mutate + verifyStepUpCode + audit STEP_UP + stepUpAt FOUND | DB parts + audit PART_* FOUND | Toast server + refetch valid | END-TO-END |
[CLOSED GAP-3]
| Inventory | KPI cards + valuasi | Konstanta hardcoded MOCKED | NOT FOUND | NOT FOUND | — | 4.218 SKU, $1,4jt | MOCKED |
| Inventory | Export CSV | Worker CSV dari rows FOUND | NOT FOUND | NOT FOUND | — | File terunduh | PARTIAL |
| Inventory | Transfer/adjustment refs | Link TO-8891/ADJ-… | Rute TAK ADA | NOT FOUND | — | Klik buntu | DEAD-END |
| Purchasing | PO list/detail/authorize/GRN | Dialog simulasi, nol fetch BYPASSED | po.list/create/receive ADA tak dipanggil | po-service + queue FOUND | DB (tak tersentuh) | Toast EDI sukses | BROKEN |
| Purchasing | Print PO | Template statis | NOT FOUND | NOT FOUND | — | Halaman print | FRONTEND-ONLY |
| Vendors | Onboard/amend/MSA/dispatch | Dialog lokal BYPASSED | Rute TAK ADA | NOT FOUND | — | Toast/sukses lokal | DEAD-END |
| Facilities | Directory + hub actions (add/reassign/defect/export) | apiFetch → GET/POST /api/facilities, PATCH …/[code] [GAP-16-T5] | Routes FOUND + facilities-service FOUND | `facilities` table FOUND (migrasi 0005) | — | Wire + fallback offline ber-label | END-TO-END wired |
| Field | Audit queue + run checklist | State lokal + INITIAL_* | NOT FOUND | NOT FOUND | — | Checklist lokal | FRONTEND-ONLY |
| Field | Finding create (online/offline) | FindingCapture POST FOUND | POST /api/findings PERSISTED (fix GAP-1) | createFinding + canon FND seq + audit FOUND | DB findings FOUND | Toast + SYNCED valid | END-TO-END |
| Field | Finding convert → WO | [CLOSED GAP-4] POST convert + Idempotency-Key, badge WO server | finding.convert DIPANGGIL | convert FOUND | WO + FINDING_CONVERT_WO | toast WO server | END-TO-END |
| Field | Finding dismiss | [CLOSED GAP-4] POST dismiss nyata + audit FINDING_DISMISS | dismissal endpoint BARU | dismiss FOUND | DISMISSED + audit | toast server | END-TO-END |
| Field | Sync outbox (enqueue/retry) | IDB outbox + key FOUND | (via findings/WO API) | outbox klien FOUND | IDB FOUND | Badge + halaman sync | PARTIAL |
| Field | field/runs hasil audit | Link INS-… | Rute TAK ADA | NOT FOUND | — | Buntu | DEAD-END |
| PM | Plans/dispatch/batch | PmHub nol fetch | pm/* + generate ADA tak dipanggil | pm-service FOUND | DB (tak tersentuh) | UI lokal | FRONTEND-ONLY |
| Inspections | CRUD + force-dispatch | NOT FOUND | inspections/* + force-dispatch FOUND | FOUND | DB (U) | — | BACKEND-ONLY |
| Notif | SSE stream + snapshot + fallback | useSlaStream EventSource FOUND | stream + GET FOUND | poll-10s jujur FOUND | DB notif/sla FOUND | Label transport jujur | END-TO-END |
| Notif | Push subscribe | PushOptIn FOUND | push/subscribe FOUND | push-service FOUND | DB subs FOUND | Opt-in state | END-TO-END |
| Reports | Hub + query builder + export | Nol fetch | reports/aggregates ADA tak dipanggil | aggregates FOUND | DB (tak tersentuh) | Grafik/data lokal (U) | FRONTEND-ONLY |
| Search | Global ⌘K | CommandPalette apiFetch FOUND | /api/search FOUND | search.query FOUND | DB FOUND | Hasil dropdown | END-TO-END |
| Telemetry | RUM beacon | rum.ts sendBeacon FOUND | rum FOUND | ingest FOUND | Store/DB (U) | — (infra) | END-TO-END |
| Telemetry | ingest + metrics | rum-store/http internal | ingest + metrics FOUND | FOUND | (U) | — (infra) | BACKEND-ONLY |
| Security | CSP report pipeline | Header report-uri | csp-report FOUND | 204 FOUND | Log/pipeline | — (infra, proven T19) | END-TO-END |
| Jobs | Queue monitor + dispatch | Jobs page SEED, nol fetch MOCKED | queue/jobs GET+POST ADA tak dipanggil | worker FOUND | Queue FOUND | Daftar statis | FRONTEND-ONLY |
| Billing | Plans/invoice + webhook | NOT FOUND | billing + webhook FOUND | FOUND | Stripe external (U) | — | BACKEND-ONLY hardened [CLOSED GAP-06 2026-09-16: HMAC raw-body fail-closed, event-id dedup, checkout Stripe asli/503] |
| Retention | Digest | NOT FOUND (by design) | retention/digest FOUND — DEPRECATED [GAP-16-T4, sunset 2026-12-15] | FOUND | (U) | deprecated+note di respons | BACKEND-ONLY deprecated |
| Audit | Trail + verify-chain + widget | AuditTrail POST FOUND | audit-trail + verify-chain FOUND | recompute FOUND | DB audit_events FOUND | Ledger + badge | END-TO-END |
| Settings | Keys/rotate/maint/webhook/KV reads | apiFetch /api/settings(+[key,+…/rotate) FOUND [GAP-16-T6] | settings-service hash-only/PUT/rotate FOUND | settings_kv table FOUND (0006) | — | wire semua handler + fallback berlabel | END-TO-END [GAP-16-T6 CLOSED 2026-09-16] |
| Dashboard | Ops dashboard | Server comp FOUND | — (server comp) | getDashboard FOUND | DB FOUND | Kartu + antrean live | END-TO-END |
| Shifts | Shift plan accept/reject | State lokal, nol fetch | NOT FOUND | NOT FOUND | — | Toast lokal | FRONTEND-ONLY |
| Profile | Sessions list | SEED statis MOCKED | sessions ADA tak dipanggil | FOUND | DB (tak tersentuh) | Daftar statis | FRONTEND-ONLY |
| Print | Badge/permit print | Template CANON statis | NOT FOUND | NOT FOUND | — | Halaman print | FRONTEND-ONLY |
| PWA | Manifest + SW + offline /offline | SwRegister + shell FOUND | — (statis + SW) | SW strategi FOUND | Cache API FOUND | Install + /offline | END-TO-END |
| Import | CSV import | NOT FOUND di semua domain | NOT FOUND | NOT FOUND | — | — (hanya export) | UNKNOWN |

## TRACE RANTAI PENUH (contoh beban-bukti; pola berulang untuk sisanya)

1. **Login+MFA (END-TO-END):** LoginForm → POST /api/auth/login (scrypt) → `mfa_required`+devHint → TOTP → POST /mfa → cookie httpOnly → GET /session → TopBar/RBAC → logout → 401 + purge. Tak ada layer MOCKED/BYPASSED.
2. **Deactivate user (BROKEN):** OrgHub ConfirmDialog → `onConfirm: setPeople(...)` + toast "audit-chained" → **PUTUS di layer Handler** (PATCH users/[id] BYPASSED; audit event NOT FOUND). User tampak dicabut, sesi DB tetap hidup.
3. **Finding create (BROKEN):** FindingCapture → POST /api/findings → route kembalikan 201 + id acak **tanpa insert** → outbox tandai SYNCED → **PUTUS di layer Service/DB**. Data hilang berwajah sukses.
4. **Inventory receive (BROKEN):** InventoryLedger → setRows/setMovs + PIN `2468` → toast sukses → **PUTUS di layer Request** (inventory.mutate BYPASSED). Stok fiktif.
5. **Finding convert (BROKEN):** FindingDesk doConvert → setTimeout 1200ms → badge CONVERTED → **PUTUS di layer Handler** (finding.convert BYPASSED).
6. **Sessions revoke-all (BROKEN):** ProfileSessions SEED statis → **PUTUS di layer Request** (GET/POST /api/auth/sessions BYPASSED); revoke butuh konfirmasi tapi tak memanggil apa pun. [CLOSED GAP-5]
7. **Inspections (BACKEND-ONLY):** POST /api/inspections + force-dispatch FOUND → **PUTUS di layer FE** (nol caller UI). Kemampuan nyata yang tak terjangkau user.
8. **Reports (FRONTEND-ONLY):** ReportsHub interaktif → **PUTUS di layer Request** (reports/aggregates BYPASSED). Angka di layar bukan dari server.
9. **Signup (BACKEND-ONLY):** POST /api/auth/signup FOUND → **PUTUS di layer FE** (nol form pemanggil). Provisioning tenant hanya via API langsung.
10. **CSP/RUM/SSE (END-TO-END infra):** header/beacon/EventSource → route → 204/202/stream → terbukti runtime Wave 3–4 (TASK-19/26).

## 1. SEMUA MOCKED/FAKE/STATIC FUNCTIONALITY

- Finding create/list server (hardcode 3 baris + POST tanpa insert). [CLOSED GAP-1]
- FindingDesk convert (setTimeout) + dismiss (setState + klaim audit).
- OrgHub deactivate/edit-role/reset-MFA (setState + toast "audit-chained"/"revoked"). [CLOSED GAP-2]
- Inventory receive/mutasi (setRows/setMovs + PIN `2468`).
- Purchasing authorize/GRN (fase EDI simulasi + toast sukses).
- Inventory KPI + valuasi + counts (konstanta).
- Seed ledger MOV_SEED sebagai movement feed tanpa badge.
- BIM refresh ("live" + timestamp via setTimeout).
- Klaim copy: `Live Sync Active`, `WS-PUSH: 12ms`, `SYNCED · sha256:…`, badge CONVERTED, `EVT-<acak>` fallback.
- Jobs page (JOBS const), ProfileSessions (SESSIONS const [CLOSED GAP-5 — kini live GET + revoke-others/all]), PM/audit-queue/shifts/reports/facilities/vendors state lokal.

## 2. SEMUA DEAD-END USER FLOW

- Klik referensi TO-8891 / ADJ-… → rute `/inventory/transfers`, `/inventory/adjustments` TAK ADA.
- Buka hasil run INS-… → rute `/field/runs` TAK ADA.
- Vendor onboard/amend/submit → backend TAK ADA (aksi menggantung).
- Deactivate/convert/mutasi/authorize → tampak sukses, efek server nol (dead-end semantik). [Deactivate CLOSED GAP-2; sisanya OPEN]
- PDF compliance audit → disabled jujur (HONEST PLACEHOLDER, bukan dead-end menipu).
- Flag/rollback audit → dinyatakan tanpa endpoint (HONEST PLACEHOLDER).

## 3. SEMUA FRONTEND TANPA BACKEND INTEGRATION

SSO · jobs page · reports hub · PM hub · shifts plan · profile sessions [CLOSED GAP-5 — END-TO-END] · facilities hub [CLOSED GAP-16-T5 — END-TO-END] · vendors flows · PO dialogs · print pages (WO/PO/badge/permit) · field audit queue/run (kecuali evidence upload) · settings hub · inventory ledger UI · dashboard? TIDAK (dashboard server-fed, END-TO-END).

## 4. SEMUA BACKEND TANPA FRONTEND CONSUMER

signup · sessions list/revoke-all · users PATCH (parsial: FE memalsukan via setState) · wo tasks · inspections + force-dispatch · parts + movements · purchasing + grn · queue/jobs · retention/digest · reports/aggregates · telemetry ingest/metrics · billing + webhook (konsumen: Stripe external) · health (infra, wajar) · finding.convert (ada pemicu palsu di FE).

## 5. SEMUA BROKEN CONTRACT/PATH/METHOD/SCHEMA

- `POST /api/findings`: permission `assets.read` untuk tulis + respons 201 tanpa persist (kontrak sukses palsu).
- `GET /api/findings`: SEEDED hardcode 3 baris (skema benar, isi fiksi).
- Rute hilang tapi direferensikan: `/inventory/transfers`, `/inventory/adjustments`, `/field/runs` (broken path).
- `verify-root` SUDAH dihapus (commit 7bcc1c5) — dulunya fabricated endpoint; test penegak penghapusan ada.
- (U): skema GRN/PO vs dialog simulasi tak bisa dibandingkan (FE tak memanggil).

## 6. SEMUA LOCAL-ONLY BUSINESS MUTATION

Deactivate [CLOSED GAP-2] · edit role [CLOSED GAP-2] · MFA rotate [CLOSED GAP-2] · provision display [CLOSED GAP-2] · inventory receive/mutasi · PO authorize/reject/RFQ/dispute/GRN · vendor onboard/amend · finding convert/dismiss · shift accept/reject · settings rotate/maint · PM dispatch/batch · report builder run · facility reassign/defect.

## 7. SEMUA MISLEADING SUCCESS/LIVE/VERIFIED/SAVED CLAIMS

"access revoked · audit-chained" · "WO auto-dispatched … paged" · "dismissed … audit-chained" · "SYNCED" (outbox atas finding fiksi) · "Live Sync Active" · "WS-PUSH: 12ms" · "SYNCED · sha256:d8a2..f041" · "SHA-256 verified locally" (benar lokal, menyesatkan konteks) · "MFA key rotated … re-enroll pending" · KPI/valuasi · "live" BIM · EVT-fallback menyembunyikan audit gagal.

## 8. SEMUA DUPLICATE/DUAL SOURCE OF TRUTH

- Roster: SEED OrgHub vs POST provision vs DB users (3 sumber).
- Inventory: MOV_SEED vs DB parts vs tampilan "4.218 SKU".
- Findings: hardcode route vs IDB outbox vs tampilan SYNCED.
- Sessions: SESSIONS const vs DB sessions.
- Jobs: JOBS const vs queue worker.
- Reports: state lokal vs reports/aggregates.
- Nomor dokumen: sekuens kanon vs generator acak (`INS-`, `PM-`, `GRN-`, `EVT-`) — (U) persistensi.

## 9. SEMUA ORPHAN/DEAD CODE CANDIDATE (bukan vonis hapus)

- Backend: retention/digest · reports/aggregates · telemetry ingest/metrics · wo tasks · inspections set (bila memang tak direncanakan di FE) · billing routes (konsumen eksternal — bukan orphan).
- Frontend: ui-patterns demo · print templates statis (fungsional sebagai cetakan) · berdasarkan audit: NOL onClick kosong, NOL MSW-leak, NOL mock-auth.
- Mati beneran: referensi TO-8891/ADJ/INS-… ke rute yang tak ada (link menggantung).

## 10. DAFTAR FEATURE YANG BENAR-BENAR END-TO-END

Auth password+TOTP+MFA+sesi · passkey · logout+purge · WO CRUD+transisi · SR CRUD+transisi · asset registry+dossier · audit trail+verify-chain · SSE+notifications+fallback · push subscribe · dashboard server · global search · RUM beacon · CSP pipeline · PWA manifest+SW+offline · evidence upload (PARTIAL-leaning-E2E: tersimpan, belum diserve) · outbox klien (PARTIAL: antrean nyata, delivery finding putus di server).

> **Dari seluruh aplikasi, mana yang benar-benar production-integrated end-to-end, mana yang hanya terlihat selesai, dan tepat di layer mana setiap flow yang belum selesai terputus?**
>
> **Production-integrated:** auth (login/MFA/passkey/logout+purge), WO/SR penuh + audit-chain, asset read server, audit verify-chain, SSE jujur + recovery, push subscribe, dashboard server, search, RUM/CSP infra, PWA/SW/offline. Seluruh layer FOUND dari entry hingga persistence.
>
> **Terlihat selesai tapi putus:** temuan G1/G2 + 4 BROKEN baru (convert/dismiss finding, edit-role/MFA, inventory receive, purchasing authorize/GRN, sessions revoke) — semuanya **PUTUS di layer Handler/Request** (FE tak memanggil endpoint yang ADA) atau **di layer Service/DB** (findings: endpoint ADA tapi fabrikasi). Pola dominan sesi ini: **backend-nya sudah ada, frontend-nya mensimulasikan hasil secara lokal lalu toast sukses.**
>
> **Peta putus per layer:** Handler (FindingDesk convert/dismiss, OrgHub deactivate/edit, BIM refresh, inventory receive, PO dialogs, shifts, settings) · Request (sessions revoke, reports, jobs, PM, parts, queue — endpoint ADA, caller NOL) · Service/DB (findings GET/POST fiksi) · Route (transfers/adjustments/field-runs TAK ADA) · FE (inspections, signup, billing, retention, wo-tasks, telemetry ingest — kemampuan nyata tanpa wajah).
