# AUDIT 37 FITUR NON-E2E — REMEDIATION MAP

> Sumber: trace statik read-only 4 batch paralel (2026-09-16) terhadap baseline
> `docs/audit-full-app-truth-map.md`. Plan mode — nihil code diubah.
> Perintah: "kerjakan semua 37 fitur non-E2E satu-per-satu secara spec-driven …
> Jangan memperbaiki code, jangan menulis/mengedit file kode sumber."

## Rekonsiliasi count (§22)

Matrix truth-map punya **31 baris non-E2E**. Verifikasi kode menyusutkan itu:
**2 drifted → END-TO-END** (sessions/GAP-5, ledger-read/GAP-3),
**3 baris print merge → 1** (WO/badge/permit/PO sama-sama template CANON statis).
Lalu audit ini menemukan **5 split baru**
(clone-policy, impersonate, rotate-key, copy-cluster, EVT-fallback).
Hasil terverifikasi: **32 fitur** — bukan 37. Selisih 5 = 2 closed GAP +
2 print-merge + 1 UNKNOWN-import yang ternyata NOT FOUND (bukan fitur, tak ada
klaim). Tabel di bawah tepat **32 baris**.

Status drift bertanda `DRIFT→E2E`: sessions, ledger-read. `DRIFT-minor`:
transfer-refs (teks, bukan link mati), OrgHub roster (live sejak GAP-2;
TODO:98 stale).

---

## §19 — DECISION PER FEATURE (32 blok, ringkas)

**F1 — SSO.** Current: FRONTEND-ONLY. Gap: backend NOT FOUND (nol `sso/*`
route/service/IdP). Break: route layer. Canon: LoginForm:168 (honest
disabled). Persist: n/a. AuthZ: n/a. Contract: n/a. Runtime: none. Tests:
NONE. **Decision: HONEST PLACEHOLDER** (sudah jujur — pertahankan). Target:
FRONTEND-ONLY by design. Reason: tak ada klaim palsu, tak ada user harm.
P3/S/LOCAL.

**F2 — Signup/provisioning tenant.** Current: BACKEND-ONLY. Gap: MISSING UI
(route+`onboarding-service` transaksional+DB FOUND, nol caller). Break: FE.
Canon: DB organizations. Persist: PERSISTED (atomic). Contract:
`POST {…}→201+cookie` (MATCH, uncalled). Tests: NONE. **Decision: NEED
PRODUCT DECISION** (admin-UI vs API-only vs hapus). Target: TBD. Reason:
tenant-provisioning tanpa wajah = risiko orphan tenant. P3/M/MODULE.
**[CLOSED GAP-16 TASK 1 2026-09-16]:** DECISION bangun-UI dieksekusi —
`app/(auth)/signup/page.tsx` + `components/auth/SignupForm.tsx` baru (5 field,
validasi klien mirror zod server, POST `/api/auth/signup` via apiFetch, error
409/400 ditampilkan apa adanya); `proxy.ts` `PUBLIC_PREFIXES` +`/signup`
(routing terbukti kurang: tanpa cookie, `/signup` 307→`/login` — tanpa fix
ini halaman tak pernah terjangkau calon tenant). Backend route/service/DB
TAK berubah. Spec: `docs/remediation-gap-16-spec.md`. 3 test (happy+session
verify+isolasi tenant+sequences, 409 EMAIL_EXISTS global+tanpa-artefak, 400
zod via POST handler pre-DB; npm test 141/141; tsc exit 0). Runtime curl dev
:3157: GET /signup 200; happy 201+cookie→GET `/` 200 authed; org kedua 201 +
roster terisolasi; 409/400×2/401 jujur; log server bersih (hanya structured
request log). Target: END-TO-END tercapai.

**F3 — Org provision refetch.** Current: PARTIAL. Yang nyata: roster live GET,
POST provision persist + audit. Yang lokal: append tanpa revalidate (server
defaults bisa divergen). Break: request revalidation. Canon: DB users.
Persist: PERSISTED. Contract: MATCH. Tests: PRESENT. **Decision: COMPLETE
PARTIAL** (`QUICK CLOSE`). Target: END-TO-END. Reason: 1 baris `refresh()`
setelah POST. P1/S/LOCAL.
**[CLOSED GAP-12 2026-09-16]** — OrgHub provision kini GET ulang
`/api/organization/users` pasca-POST (RFID line ditempel ulang, local-display-only);
refetch-gagal → fallback append + toast jujur. Runtime MCP: roster 6→7 + RFID-1212.

**F4 — Clone-policy/deploy/matrix.** Current: FRONTEND-ONLY. Gap: no
roles/policy table, `deploy` toast "simulated" (jujur). Break: PRODUCT
DECISION MISSING. Canon: OrgHub state. Persist: NOT PERSISTED (refresh
hilang). Tests: NONE. **Decision: HONEST PLACEHOLDER + DEFER** backend (sudah
berlabel simulated). Target: FRONTEND-ONLY by design. Reason: RBAC `can()`
gates sudah nyata; policy-editor backend = L. P3/S/LOCAL.

**F5 — WO tasks.** Current: BACKEND-ONLY. Gap: FRONTEND NOT WIRED
(route+`task-service`+DB `wo_tasks` FOUND, nol caller). Break: missing UI
caller. Canon: DB wo_tasks. Persist: PERSISTED (unused). Contract: MATCH
(uncalled). Tests: NONE. **Decision: MUST INTEGRATE** (`QUICK CLOSE` — wire
WO detail checklist ke GET/POST tasks). Target: END-TO-END. Reason:
capability DB-driven nganggur di domain inti. P1/S/MODULE.
**[CLOSED GAP-12 2026-09-16]** — seed 7 `wo_tasks` canon (DONE×4/IN_PROGRESS/PENDING/LOCKED,
photo-gate di T01+T04); WO detail render `WoChecklist` live (ganti `<ol>` statis +
header "4/7" hardcode → hitung server); advance via POST + pesan 422 jujur
(SEQUENCE_VIOLATION/PHOTO_REQUIRED); 1 test service-level (sequence + photo + audit);
130/130; runtime MCP: advance 05→DONE + unlock 06 + Start 06→IN_PROGRESS tanpa crash,
console bersih. Bug envelope `updated.data` tertangkap runtime → diperbaiki.

**F6 — Evidence serve. [CLOSED GAP-13 2026-09-16]** — GET
`/api/work-orders/[id]/evidence/[evidenceId]` ter-otentikasi (401/403, 404
tenant-scoped, traversal→404, file-hilang→410, sha-mismatch→500) +
WoChecklist viewer (thumbnail + download + sha short) di kedua branch page;
runtime: upload 201 → download 200 byte-identik, cross-WO 404, unauth 401.
Reason: bukti tersimpan tapi tak tersaji = setengah rantai. P1/M/MODULE.

**F7 — Print templates (WO/badge/permit/PO).** Current: FRONTEND-ONLY. Gap:
none intended (statis, `window.print`, ID echo dari URL). Canon: static
artifact. Persist: n/a. Tests: NONE. **Decision: KEEP BY DESIGN** (paper
artifact). Target: FRONTEND-ONLY. Reason: cetakan tak butuh backend;
satu-satunya catatan = QR/simulated-barcode jujur apa adanya. P3/S/LOCAL.

**F8 — BIM live refresh.** Current: MOCKED (`setTimeout` 600ms + `· live` +
`38 nodes`). Gap: BACKEND MISSING? **Tidak** — `GET /api/telemetry/ingest`
NYATA (sensorReadings). Real source: YES → **WIRE EXISTING SOURCE**. Break:
handler→service (tak ada fetch). Canon kini: const NODES. Persist: NOT
PERSISTED. Tests: NONE. **Decision: MUST INTEGRATE** (poll ingest asli atau
relabel). Target: END-TO-END. Reason: label "live" di atas literal =
misinformation; backend sudah ada. P2/M/MODULE.
**[CLOSED GAP-14 2026-09-16]:** END-TO-END — Refresh Reading kini GET
`/api/telemetry/ingest?assetCode=` + map 5 tipe sensor ke node + updated =
recordedAt nyata; kosong → honest empty ("no live readings — showing design
reference values"); 4 test (136/136) + runtime MCP: ingest TEMPERATURE 77.5 →
WARNING → refresh → drawer "77.5 C · Live reading · recordedAt server" +
"1 live node via Refresh".

**F9 — Ledger demo fallback.** Current: PARTIAL (live saat server UP + badge
jujur; MOV_SEED hanya saat down). Gap: fallback quarter-fiction tapi
**berlabel**. Canon: DB parts. Persist: PERSISTED (live path). Tests:
PRESENT (GAP-3). **Decision: KEEP BY DESIGN** (offline fallback jujur =
fitur, bukan bug). Target: PARTIAL-honest. Reason: pola sudah honest;
menghapus fallback merusak field-use. P3/S/LOCAL.

**F10 — Inventory KPI.** Current: PARTIAL (live branch client-computed + demo
constants). Gap: FRONTEND NOT WIRED — `GET /api/reports/aggregates`
(valuation/low-stock nyata) nol caller. Real source: YES. Break:
component→API. Canon: seharusnya aggregates. Persist: n/a (derive). Tests:
NONE. **Decision: MUST INTEGRATE** (`QUICK CLOSE`). Target: END-TO-END.
Reason: agregat server nganggur; angka tampil tanpa sumber. P1/S/MODULE.
**[CLOSED GAP-12 2026-09-16]** — `runQuery` kini GET `/api/reports/aggregates` +
tampilkan hitungan nyata + latensi terukur (hanya field count; 3 field derivasi
fiktif endpoint tak ditampilkan); gagal → banner jujur tanpa angka; builder SQL
diberi label local-preview; bug envelope `res.data` tertangkap runtime → diperbaiki.
Runtime MCP: "Live aggregates in 29ms · WO 8 · assets 5 · SKUs 5 · SR 5".

**F11 — Export CSV.** Current: PARTIAL (local rows only; toast provenance
jujur; label "CSV/XLS" tapi hanya CSV). Gap: no server export + label
overclaim. Canon: loaded rows. Persist: file-download. Tests: NONE.
**Decision: COMPLETE PARTIAL** (label→"CSV (loaded rows)" = QUICK CLOSE;
server export DEFER). Target: PARTIAL-honest. Reason: scope penuh
(full-catalog export) = M; label fix = S. P2/S/LOCAL.
**[CLOSED GAP-15 2026-09-16]:** tombol ledger kini `Export CSV (loaded rows)`
(1 baris); situs lain terverifikasi jujur dan tak diubah (PurchaseList sudah
`Export (CSV)`, PurchaseDetail `Export lines` → Blob CSV nyata, AuditTrail
`Export CSV / JSON Log` → kedua format benar dihasilkan). Guard-test:
`CSV/XLS` absent + label presence. Runtime MCP: tombol tampil live.

**F12 — Transfer/adjust refs.** Current: DEAD-END (rute TAK ADA; ledger kini
render teks, bukan link). Gap: MISSING ROUTE + PRODUCT DECISION MISSING.
Break: UI→route. Tests: NONE. **Decision: NEED PRODUCT DECISION** (buat rute
vs hapus refs; sementara biarkan teks — tak ada link menggantung). Target:
TBD. P3/S/LOCAL.
**[CLOSED GAP-16 TASK 2 2026-09-16]:** DECISION hapus-refs dieksekusi (tanpa
backend transfer) — 2 entri fiktif `MOV_SEED` dihapus dari
`InventoryLedger.tsx` (`TRF-2026-0044` kurir/waybill + `ADJ-2026-0019`
scrap/cc-QA) beserta baris statis `ADJ-2026-Q1` (situs ke-2:
`app/(ops)/inventory/[sku]/page.tsx` TXN-811). Fallback feed kini 3 entri
kanon WO/PO/PM yang semuanya resolvable sebagai link; cabang teks-biasa
dipertahankan untuk ADJ/TRF sah dari server. Grep components/+app/+lib:
nol `TRF-`/`ADJ-`. Guard-test absence di audit-truthfulness (2 test;
143/143; tsc exit 0). Runtime curl :3157: `/inventory` SSR nol fiksi + canon
link live; `/inventory/PART-SEAL-8821` nol ADJ-; feed server honest (kosong)
; unauth → 307/401. Out-of-scope eksplisit: tabel transfers + rute
transfers/adjustments.

**F13 — Purchasing authorize/GRN.** Current: BROKEN. Gap: FAKE SUCCESS penuh
(endorse/GRN-9941/match/RFQ toast tanpa 1 request) sementara `po-service`+
routes+DB+idempotency nganggur. Break: component→API (fetch never issued).
Canon: SEED lokal (UI) vs procurement-service (nyata). Persist: NOT
PERSISTED (UI) / capable (BE). Contract: BROKEN (unused). Tests: NONE.
Observability: nol (tanpa audit). **Decision: MUST INTEGRATE**
**[CLOSED GAP-09 2026-09-16]: kini END-TO-END** — decidePurchase + POST decision + GET ?number= + GRN step-up + UI live + 8 test (124/124) + runtime MCP (GRN-2026-0001 VERIFIED, stok 2→4).
(`BIG ROCK`-lite M/L). Target: END-TO-END. Reason: EDI-sukses fiktif di
procurement = correctness risk tertinggi sisa. P1/M/CROSS-MODULE.

**F14 — Vendors.** Current: DEAD-END. Gap: BACKEND MISSING total (nol
route/service; schema+seed vendors orphan). Fake: DUNS-verified, WO-0905
drafted, SHA-anchored. Break: handler→API (nothing exists). Canon:
KNOWN_VENDORS. Persist: NOT PERSISTED. Tests: NONE. **Decision: MUST
INTEGRATE** (service+routes dari schema yang ADA; M) — atau product putuskan
DEFER. Target: END-TO-END. Reason: schema+seed sudah ada = separuh jalan;
klaim DUNS/SHA menyesatkan. P2/M/MODULE.
**[CLOSED GAP-14 2026-09-16]:** END-TO-END — `vendor-service` baru
(list/get/relatedPOs/create/amend/renew/commend + audit VENDOR_* + idempoten
scope vendor.*) + migrasi 0004 (scope/contact/phone/duns nullable) + RBAC
`vendors.manage` + routes GET/POST/PATCH + VendorList/Detail/dialogs live
(+ demo fallback ber-badge, DUNS format-only jujur, PDF honest-excerpt,
dispatch → POST /api/work-orders nyata); 4 test (136/136) + runtime MCP:
onboard via UI 5→6 + dispatch WO-2026-0911 nyata.

**F15 — Facilities hub.** Current: FRONTEND-ONLY + klaim infra fiktif
("Spatial Sync Realtime · HEALTHY", "BIM MATCHED"). Gap: BACKEND MISSING +
MISLEADING SUCCESS. Break: handler→backend. Persist: NOT PERSISTED. Tests:
NONE. **Decision: HONEST PLACEHOLDER sekarang + NEED PRODUCT DECISION**
(facilities backend vs hapus klaim). Target: FRONTEND-honest. Reason: klaim
realtime tanpa broker = harus turun dulu. P2/S/MODULE. **[CLOSED GAP-16
(F15=TASK 5) 2026-09-16 — backend dibangun 2 fase: tabel `facilities`
(org+code PK, code turunan nama di server, geojson nullable, meta JSON
staged defects/transfers); `facility-service.ts` (zod-validated list/get/
create/update, audit FACILITY_CREATE/UPDATE transaksional, idempotency scopes
facility.create/update, 404 FACILITY_NOT_FOUND + 409 FACILITY_CODE_EXISTS +
400 empty patch); routes GET/POST /api/facilities + GET/PATCH
/api/facilities/[id] dengan izin baru facilities.read/manage (read untuk semua
role; manage = Facility Director / Engineering Lead / Enterprise Admin —
pola vendors); FacilityHub di-wire: Server locations panel LIVE, POST add,
PATCH defect/transfer, export GeoJSON dari rows server (null geometry →
unmapped jujur), fallback offline berlabel `local staging — not persisted`/API
unreachable, ID server di-noted di toast; test 3 integration + 2 guard
truthfulness; runtime isolasi :3158 (dev :3157 PGlite pra-migrasi): create
201·reload persist·PATCH meta 200·{}→400·409 dup·404 unknown·401 unauth·
audit 2C+2U·/facilities 200 tanpa MODEL MATCHED/10.14.0.8 · tests 157/157 ·
tsc bersih]**

> **CLOSED GAP-16 TASK 5 (2026-09-16)** — keputusan produk: **bangun backend
> facilities**, dua fase dalam satu task (spec `docs/remediation-gap-20-spec.md`;
> r@a: PM/Eng Lead). FASE 1 copy honest: Recalibrate → "local demo — no GIS
> write"; "BIM … MODEL MATCHED" → "BIM reference (design only — not connected)";
> dispatchAudit AUD id label "local counter — not persisted"; prefix/labels
> nomor staging tetap. FASE 2 backend nyata: tabel `facilities` (migrasi 0005;
> PK org+code, `id` uuid opaque, `code` turunan slug UPPER dari nama TANPA
> nomor canon, `geojson` TEXT NULL = unmapped, `meta` JSON staged
> defective/transfer — PILIHAN: defect+transfer di-update facility/meta, BUKAN
> tabel defect kecil) + seed idempoten (canon `B2-MECH-204` + decoy) +
> `lib/services/facility-service.ts` (list/get/create/update; zod-validasi di
> service; audit `FACILITY_CREATE`/`FACILITY_UPDATE` transaksional; idempoten
> `facility.create`/`facility.update`; 409 `FACILITY_CODE_EXISTS`; 404
> `FACILITY_NOT_FOUND`; patch kosong 400) + routes `app/api/facilities` +
> `[id]` (GET/POST/PATCH; izin facilities.read/manage di RBAC — read untuk
> semua, manage = peran vendors.manage) + UI `FacilityHub`: daftar lokasi
> "Server locations" LIVE + provenance badge + wire addSub-location
> (POST)/reassign (PATCH transfer)/logDefect (PATCH defect)/exportGeo (fitur
> dari rows server, mapped/unmapped jujur) dengan fallback offline ber-label
> `local staging — not persisted` + toast sukses memuat ID server; tree
> struktural tetap demo ber-label. Test: 3 integrasi service-level (create
> +replay+409+guard decoy+audit CREATE; update defect/transfer idempotent-no-
> double-append+rename+map/unmap+400+404+audit UPDATE; RBAC) + 2 guard
> truthfulness (fiction absent + backend honest markers) → 157/157; tsc → 0.
> Runtime diverifikasi di instance dev ISOLASI :3158 (PGlite singleton dev
> utama :3157 pra-migrasi — rute baru menunggu restart dev user; route lama
> tetap 200): GET seed 1 → POST 201 → GET 2 → PATCH defect+transfer 200 →
> PATCH kosong 400 → POST dup-nama 409 → GET unknown 404 → unauth 401 →
> FACILITY_CREATE×2+UPDATE×2 di audit → /facilities 200 dengan copy honest.
> [ASUMSI OTOMATIS-USER-ACTION: restart dev :3157 untuk memuat kode rute baru]

**F16 — Field queue/run checklist.** Current: FRONTEND-ONLY + fake
("Submitted — WO auto-dispatched" tanpa WO, "audit-chained" tanpa write, PIN
2468, autosave bohong). Gap: MISSING PERSISTENCE + FAKE SUCCESS. Backing
tersedia: inspections API (F20). Break: handler→API. Canon: INITIAL_*
consts. Persist: NOT PERSISTED. Tests: NONE. **Decision: MUST INTEGRATE**
(queue ← inspections list; run ← updateProgress; hapus PIN/fake-toasts).
Target: END-TO-END. Reason: inti field-flow; fiksi dispatch = P1.
P1/M-L/CROSS-MODULE (dep: F20-fix).
**[CLOSED GAP-11 2026-09-16]:** END-TO-END — AuditQueue + hub live GET
(list server + demo fallback ber-badge + sync-count nyata + Last Completed
turunan server); RunChecklist submit → POST progress 100/COMPLETED +
prefill server; PIN 2468 + modal + toast fiksi + autosave timer dihapus;
3 test (129/129) + runtime MCP terverifikasi.

**F17 — Outbox auto-flush.** Current: PARTIAL (store+enqueue+flush+retry+
idempotency NYATA; delivery findings kini persist GAP-1). Gap: MISSING
REFRESH — auto-flush hanya mount di `/field/sync`; FieldShell refresh-only;
produser 1 op; badge AppBadge no-op. Break: coverage (mount scope). Canon:
IDB apex-outbox. Persist: PERSISTED (IDB+server). Tests: NONE. **Decision:
COMPLETE PARTIAL** (`QUICK CLOSE`: flush-on-online di FieldShell + daftarkan
produser WO-evidence). Target: END-TO-END. Reason: S-effort, reliability core
offline. P1/S/MODULE.
**[CLOSED GAP-12 2026-09-16]** — FieldShell handler `online` kini
`flushOutbox({})` silent + refresh badge (toast tetap milik Sync tab);
verified-by-construction (import langsung + try/catch; tanpa test baru).

**F18 — Runs INS-0415/0418 TODO Fase 2.** Current: DEAD-END (200 →
EmptyState, tanpa affordance di kartu). Gap: MISSING UI honesty. Break:
`run/page.tsx:15` gate. Tests: NONE. **Decision: HONEST PLACEHOLDER**
(`QUICK CLOSE`: badge "Fase 2" di kartu queue). Target: DEAD-END-honest.
Reason: 1 baris; hentikan tap-kecewa. P3/S/LOCAL.
**[CLOSED GAP-15 2026-09-16]:** kartu non-kanon (`a.id !== CANON.inspection`)
kini memuat badge `Phase 2 · run checklist not available yet` (berlaku untuk
baris demo maupun live; link dipertahankan menuju EmptyState jujur di route).
Guard-test: presence `Phase 2` + gate `CANON.inspection`. Runtime MCP: badge
tampil pada kartu LIVE non-kanon INS-2026-1093 (artefak GAP-11) — gate terbukti
bekerja di data live, bukan hanya demo; console 0 error.

**F19 — PM hub dispatch/batch.** Current: FRONTEND-ONLY + fake ("Batch
dispatched · WOs created · leads paged", ID WO-0906+ fabrikasi) sementara
`pm-service` (tx+idempotency+audit) + routes nganggur. Break:
component→API. Canon: SEED lokal. Persist: NOT PERSISTED (UI). Tests: NONE.
**Decision: MUST INTEGRATE** (list+generate nyata; FindingDesk sudah
buktikan POST create bisa). Target: END-TO-END. Reason: dispatch fiktif =
fake mutation inti. P1/M/MODULE.
**[CLOSED GAP-10 2026-09-16]:** END-TO-END — sequence PM via nextNumber, route toggle baru, PmHub live + demo fallback, 126/126 test, runtime MCP terverifikasi.

**F20 — Inspections + force-dispatch.** Current: BACKEND-ONLY + route
PARTIAL/BROKEN (force-dispatch inline update, tanpa zod/audit/idempotency,
divergen dari service; list punya fallback 3-row CANON saat tabel kosong =
MOCKED-inside-real). Gap: MISSING UI + service-bypass. Break: route→service.
Canon: inspection-service (route-nya shadow). Persist: PERSISTED (unused
paths). Tests: NONE. **Decision: MUST FIX dulu (route → service + audit),
lalu MUST INTEGRATE (F16 caller)**. Target: END-TO-END. Reason: prerequisite
F16; inline-write tanpa audit = compliance hole. P1/M/MODULE.
**[CLOSED GAP-11 2026-09-16]:** END-TO-END — `forceDispatchInspection`
(audit transaksional + idempoten + guard 409 + progress preserved),
POST→`createInspection` (nomor canon), GET tanpa fallback CANON, route
progress baru, `INSPECTION_PROGRESS` diaudit; 3 test + runtime MCP.

**F21 — Reports hub.** Current: FRONTEND-ONLY + fiksi ("46ms · 412 records",
`telemetry_mart` tak ada di schema, "READ REPLICA SYNCED"). Gap: FRONTEND
NOT WIRED (aggregates nyata nol caller). Break: `runQuery` terminal. Canon:
consts lokal. Persist: NOT PERSISTED. Tests: NONE. **Decision: MUST
INTEGRATE** (KPI←aggregates = QUICK CLOSE; builder-SQL vs tabel nyata =
follow-up). Target: END-TO-END. Reason: angka BI tanpa sumber. P2/M/MODULE.
**[CLOSED GAP-14 2026-09-16]:** END-TO-END — KPI cards live GET
`/api/reports/aggregates` on-mount + Refresh (badge Live/Demo, gagal →
tanpa angka); katalog di bawah berlabel design reference / metadata only;
runtime MCP: "OPEN 9 · assets 5 · $9019.00 · SR 5", konsisten dengan API
(aggregates total 9 = /api/work-orders rows 9 incl. WO-2026-0911 dispatch
baru; nav badge "14" stale — observasi follow-up SideNav).

**F22 — Telemetry ingest/metrics.** Current: BACKEND-ONLY (+RUM E2E). Gap: no
product consumer; cold-preseed baseline tersaji sebagai measured (minor).
Canon: telemetry-service + in-memory RED/RUM (ephemeral, restart hilang).
Persist: sensorRows PERSISTED; RED/RUM ephemeral. Tests: NONE. **Decision:
KEEP BY DESIGN** (infra APM sah) + label preseed (S). Target: BACKEND-ONLY.
Reason: bukan product-SCADA; F8 yang wire ke sini. P3/S/LOCAL.

**F23 — Jobs dua dunia.** Current: FRONTEND-ONLY (JOBS const
maintenance-fiksi + "DAEMON OPERATIONAL/SOC2" + link auditHash ke ledger yang
tak pernah ditulis) + BACKEND-ONLY (worker in-memory, preseed 3 jobs, tanpa
scheduler). Gap: DUAL SOURCE + domain mismatch (JOB-* vs job_*). Break:
page→API + no cron. Persist: NOT PERSISTED (keduanya). Tests: NONE.
**Decision: NEED PRODUCT DECISION** (monitor beneran vs hapus) + **MUST FIX**
link auditHash fiktif sementara. Target: TBD. Reason: klaim SOC2/audit-hash
tanpa write = compliance-adjacent. P2/M/MODULE.
**[CLOSED GAP-16 TASK 3 2026-09-16]:** DECISION jujur+wire dieksekusi — page
ditulis ulang sebagai klien atas `GET /api/queue/jobs` (kolom yang didukung
API saja); JOBS const + `DAEMON OPERATIONAL`/`SOC2 AUDIT READY` + 4 KPI +
auditHash/link Inspect Chain + narasi snapshot DIHAPUS; banner ephemeral
in-memory + tombol nyata Run cycle (confirm)/Retry/Enqueue (izin org.manage;
403 tampil apa adanya). Worker preseed 3 job: **PILIHAN = HAPUS** (bukan
label) — preseed lama bocorkan baris APX-NUSA-01 ke semua tenant+filter;
komentar pilhan di kode. Route fix terbukti-kurang: retry jobId tak ada → 404
`JOB_NOT_FOUND` (dulu 200 data:null). CommandPalette hint dijujurkan. Test:
4 unit worker (empty-store/no-preseed, tenant+filter, run_cycle, retry/null)
+ 2 guard-test fiksi (149/149; tsc exit 0). Runtime curl :3157: GET [], enqueue
201, filter jujur (webhook_fanout kosong bukan preseed), run_cycle
{processed:1,completed:1}, retry-unknown 404, topic-invalid 400, unauth 401;
page HTML 200 tanpa SOC2/DAEMON/482.

**F24 — Billing.** Current: BACKEND-ONLY. Gap: `catch{}` telan BAD_SIGNATURE
(**auth/security BROKEN**), checkout stub `cs_${Date.now()}` tanpa Stripe SDK,
"duplicate guard" tanpa dedup. Canon: billing-service. Persist: PERSISTED.
Contract: PARTIAL. Tests: NONE. **Decision: MUST FIX** (HMAC-fail-closed +
dedup + Stripe call / hapus stub) + **KEEP BY DESIGN** (Stripe-operated,
tanpa UI). Target: BACKEND-ONLY-hardened. Reason: satu-satunya P0 keamanan
sisa. P0/M/MODULE.

**F25 — Retention digest.** Current: BACKEND-ONLY orphan (tanpa
trigger/scheduler/consumer). Gap: no trigger. Canon: retention-service
(read-only compute). Tests: NONE. **Decision: NEED PRODUCT DECISION**
(cron+consumer notif vs DEPRECATE). Target: TBD. Reason: dead code hidup =
keputusan produk, bukan bug. P3/S/LOCAL.

**F26 — Settings.** Current: FRONTEND-ONLY + klaim berat ("persisted ·
production KV-store", "SCADA healthy · 1,420 msgs/min", PIN 2468 reveal).
Gap: BACKEND MISSING + FAKE SUCCESS. Break: handler→API. Persist: NOT
PERSISTED (refresh hilang). Tests: NONE. **Decision: MUST FIX copy dulu (S)
+ NEED PRODUCT DECISION** (KV backend vs local). Target: FRONTEND-honest.
Reason: "persisted production" tanpa write = klaim compliance. P2/S-then-L/
MODULE.

**F27 — Shifts.** Current: FRONTEND-ONLY + badge "AUDIT COMPLIANT" tanpa
ledger, HND-* historis tanpa DB. Gap: BACKEND MISSING + MISLEADING badge.
Break: component→API. Persist: NOT PERSISTED. Tests: NONE. **Decision: MUST
FIX badge (S) + NEED PRODUCT DECISION** (handover backend — serah-terima
shift = inti ops). Target: TBD. P2/S-then-M/MODULE.

**F28 — Import CSV.** Current: NOT FOUND (koreksi UNKNOWN→absent; hanya
export). Gap: none claimed. **Decision: DEFER** (tak ada klaim, tak ada harm;
butuh product ask). Target: NONE. P3/—/—.

**F29 — Impersonate.** Current: MOCKED ("bannered + audit-chained", "reason
logged") — nol write, nol session change, PIN 2468 di OrgHub. Gap: FAKE
SUCCESS di fitur security-sensitif. Break: UI→API. Canon: useState. Persist:
NOT PERSISTED. Tests: NONE. Observability: REQUIRED (klaim audit tanpa
audit). **Decision: MUST FIX** (tulis audit event beneran + session-flag
server, atau cabut klaim & batasi). Target: END-TO-END atau HONEST. Reason:
"audit-chained" fiktif = P0-adjacent. P0/S-M/MODULE.

**F30 — Rotate Key. [CLOSED GAP-13 2026-09-16]** — tabel `api_keys`
(hash-only) + service issue/list/revoke + audit API_KEY_CREATE/REVOKE +
routes `/api/settings/api-keys` + UI ProfileSessions live (issue show-once +
revoke + copy gateway-follow-up jujur); runtime: AK-2026-0001 issue→revoke→list
kosong. Bearer enforcement = follow-up eksplisit. P1/S/MODULE.

**F31 — Misleading copy cluster. [CLOSED GAP-08]** Item: `Live Sync Active`+`Broker HEALTHY`
(SideNav/FacilityHub), `WS-PUSH: 12ms` (NotificationsHub — SSE-nya nyata,
prefix `WS-` salah; test truthfulness tak cover file ini), `READ REPLICA:
SYNCED`, `paged` (4 file, tanpa pager API), `DISPATCHED` toasts
(Facility/PmHub/PO — enum-nya sah, konteks toast fiktif). Gap: SEED/MOCK
LEAK + TEST GAP (guard grep hanya AuditTrail). **Decision: MUST FIX** (copy +
perluas `audit-truthfulness.test.ts` ke file-file ini). Target: honest copy.
Reason: S-effort, memengaruhi kepercayaan seluruh app. P1/S/LOCAL.

**F32 — EVT-fallback. [CLOSED GAP-08]** Current: `critical-action-dialog` fabrikasi
`EVT-${random}` tak ter-link saat `auditId` absen. Gap: SEED/MOCK LEAK
menyembunyikan audit gagal. **Decision: MUST FIX** (wajibkan auditId / gagal
tertutup, jangan fallback acak). Target: END-TO-END-honest. Reason: ID audit
acak = compliance hole kecil tapi tajam. P1/S/LOCAL.

---

## §22 — MASTER TABLE (32 baris)

| # | Domain | Feature | Current | Root Cause | Decision | Target | Pri | Eff | Blast |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Auth | SSO | FRONTEND-ONLY | BACKEND MISSING | HONEST PLACEHOLDER | FE by design | P3 | S | LOCAL |
| 2 | Auth | Signup tenant | END-TO-END [CLOSED GAP-16-T1] | UI BUILT (was MISSING UI) | NEED DECISION (decided: build UI) | E2E | P3 | M | MODULE |
| 3 | Org | Provision refetch | PARTIAL | MISSING REFRESH | COMPLETE PARTIAL ⭐ | E2E | P1 | S | LOCAL |
| 4 | Org | Clone-policy/deploy | FRONTEND-ONLY | PRODUCT DECISION MISSING | PLACEHOLDER+DEFER | FE by design | P3 | S | LOCAL |
| 5 | WO | Tasks checklist | BACKEND-ONLY | FRONTEND NOT WIRED | MUST INTEGRATE ⭐ | E2E | P1 | S | MODULE |
| 6 | WO | Evidence serving | PARTIAL | MISSING ROUTE (GET) | COMPLETE PARTIAL | E2E | P1 | M | MODULE |
| 7 | Print | 4 template CANON | FRONTEND-ONLY | — (artifact) | KEEP BY DESIGN | FE by design | P3 | S | LOCAL |
| 8 | Asset | BIM live | MOCKED | FRONTEND NOT WIRED | MUST INTEGRATE | E2E | P2 | M | MODULE |
| 9 | Inventory | Ledger fallback | PARTIAL | — (honest) | KEEP BY DESIGN | PARTIAL-honest | P3 | S | LOCAL |
| 10 | Inventory | KPI cards | PARTIAL | FRONTEND NOT WIRED | MUST INTEGRATE ⭐ | E2E | P1 | S | MODULE |
| 11 | Inventory | Export CSV | PARTIAL | MISSING BACKEND + label | COMPLETE PARTIAL ⭐ | PARTIAL-honest | P2 | S | LOCAL |
| 12 | Inventory | Transfer/adjust refs | REMOVED [CLOSED GAP-16-T2] | REFS DIHAPUS (was MISSING ROUTE) | NEED DECISION (decided: remove) | no-refs honest | P3 | S | LOCAL |
| 13 | Purchasing | PO/GRN/authorize | BROKEN | FAKE SUCCESS + NOT WIRED | MUST INTEGRATE 🪨 | E2E | P1 | M/L | X-MOD |
| 14 | Vendors | Onboard/amend/MSA | DEAD-END | BACKEND MISSING | MUST INTEGRATE | E2E | P2 | M | MODULE |
| 15 | Facilities | Hub actions | CLOSED [GAP-16-T5] | RESOLVED (backend built, 2 fase) | DECIDED: bangun backend facilities | END-TO-END | P2 | S | MODULE |
| 16 | Field | Queue/run checklist | END-TO-END [CLOSED GAP-11] | WIRED (was FAKE+NOT WIRED) | MUST INTEGRATE 🪨 | E2E | P1 | M/L | X-MOD |
| 17 | Field | Outbox auto-flush | PARTIAL | MISSING COVERAGE | COMPLETE PARTIAL ⭐ | E2E | P1 | S | MODULE |
| 18 | Field | Runs Fase-2 cards | DEAD-END | MISSING UI honesty | HONEST PLACEHOLDER ⭐ | honest | P3 | S | LOCAL |
| 19 | PM | Hub dispatch/batch | FRONTEND-ONLY | FAKE SUCCESS + NOT WIRED | MUST INTEGRATE | E2E | P1 | M | MODULE |
| 20 | Insp | CRUD+force-dispatch | END-TO-END [CLOSED GAP-11] | FIXED (was SERVICE BYPASS + no UI) | MUST FIX+INTEGRATE 🪨 | E2E | P1 | M | MODULE |
| 21 | Reports | Hub+builder | FRONTEND-ONLY | FRONTEND NOT WIRED | MUST INTEGRATE ⭐ | E2E | P2 | M | MODULE |
| 22 | Telemetry | Ingest/metrics | BACKEND-ONLY | — (infra) | KEEP BY DESIGN | BE by design | P3 | S | LOCAL |
| 23 | Jobs | Dua dunia | END-TO-END [CLOSED GAP-16-T3] | WIRED (was DUAL SOURCE) | NEED DECISION (decided: honest+wire) | E2E-ephemeral | P2 | M | MODULE |
| 24 | Billing | HMAC/checkout | BACKEND-ONLY | AUTH BYPASS (catch) | MUST FIX | BE-hardened | P0 | M | MODULE |
| 25 | Retention | Digest orphan | DEPRECATED [CLOSED GAP-16-T4] | FLAGGED (was NO TRIGGER) | NEED DECISION (decided: deprecate, sunset 2026-12-15) | deprecated-honest | P3 | S | LOCAL |
| 26 | Settings | Keys/rotate/maint | FRONTEND-ONLY | BACKEND MISSING + fake | FIX copy + DECISION | FE-honest | P2 | S→L | MODULE |
| 27 | Shifts | Accept/reject | FRONTEND-ONLY | BACKEND MISSING + fake badge | FIX badge + DECISION | TBD | P2 | S→M | MODULE |
| 28 | Import | CSV import | NOT FOUND | — | DEFER | NONE | P3 | — | — |
| 29 | AuthZ | Impersonate | MOCKED | FAKE SUCCESS (audit) | MUST FIX | E2E/honest | P0 | S/M | MODULE |
| 30 | Profile | Rotate Key | MOCKED | BACKEND MISSING + fake | MUST FIX | E2E/placeholder | P1 | S | MODULE |
| 31 | Copy | Live/WS-/paged/DISP. | HONEST COPY [CLOSED GAP-08] | SEED LEAK + TEST GAP | MUST FIX ⭐ | honest | P1 | S | LOCAL |
| 32 | Audit | EVT-fallback | FAIL-CLOSED [CLOSED GAP-08] | SEED LEAK | MUST FIX ⭐ | honest | P1 | S | LOCAL |

⭐ = QUICK CLOSE · 🪨 = BIG ROCK

## §23 — BY DECISION

- **MUST FIX (8):** F20-sebagian, F24, F26-sebagian, F27-sebagian, F29, F30,
  F31, F32
- **MUST INTEGRATE (8):** F5, F8, F10, F13, F14, F16, F19, F21 (+F20-sebagian)
- **COMPLETE PARTIAL (4):** F3, F6, F11, F17
- **KEEP BY DESIGN (3):** F7, F9, F22
- **HONEST PLACEHOLDER (4):** F1, F4, F15-sebagian, F18
- **DEFER (1):** F28
- **REMOVE (0):** nihil — tak ada yang layak hapus; yang mati pun (F12/F25)
  butuh keputusan produk dulu
- **NEED PRODUCT DECISION (4 primer):** F2, F12, F23, F25 (+F15/F26/F27
  sekunder)

## §24 — BY TECHNICAL GAP

Frontend wiring gaps **8** (F3,5,8,10,13,16,19,21) · Backend missing **7→8**
(F1,4,12,14,15,26,27,30) · Backend mocked **3** (F20-fallback-row,
F22-preseed, F24-stub) · Persistence gaps **13** (semua NOT PERSISTED: F4,8,
13,14,15,16,23,26,27,29,30 + F6-serve + F12) · Contract gaps **5**
(F6,13-unused,20,24,31-WS) · Route gaps **4** (F6-GET, F12, F1-sso, F18-gate)
· Auth/security gaps **4** (F24-HMAC, F29, F30, F20-tanpa-audit) ·
Dual-source **5** (roster-append F3, ledger F9-resolved, findings-resolved,
jobs F23, KPI F10-resolved) · Fake-success **12** (F8,13,14,15,16,19,21,23,
26,27,29,30 + cluster F31) · Observability gaps **4** (F13,16,29,32 — klaim
audit tanpa audit)

## §25 — REMEDIATION ORDER (actionable)

```text
GAP-06 · Billing HMAC+stub · Why first: satu-satunya P0 keamanan (signature
ditelan) · Fix: fail-closed + dedup + Stripe/dihapus · Dep: nihil · Target:
BE-hardened
GAP-07 · Impersonate audit · Why: klaim "audit-chained" fiktif di fitur
sensitif · Fix: audit event nyata / cabut klaim · Dep: nihil · Target:
E2E/honest
GAP-08 · Copy cluster + EVT (F31+F32) · Why: S-effort, baseline kejujuran +
perluas grep-test · Fix: copy + guard test · Dep: nihil · Target: honest
GAP-09 · Purchasing wire (F13) · Why: fake EDI-sukses inti · Fix:
list/detail/GRN→po-service · Dep: nihil · Target: E2E
GAP-10 · PM hub wire (F19) · Why: fake dispatch · Fix: list+generate nyata ·
Dep: nihil · Target: E2E
GAP-11 · Force-dispatch fix + field queue wire (F20→F16) · Why: prerequisite;
inline-write tanpa audit · Fix: route→service+audit, queue←inspections ·
Dep: GAP-08 (copy) · Target: E2E
GAP-12 · WO tasks + KPI + provision-refetch + outbox-flush (F5+F10+F3+F17) ·
Why: 4 QUICK CLOSE independen, S-effort · Fix: wiring · Dep: nihil · Target:
E2E
GAP-13 · Evidence serve + rotate-key (F6+F30) · Why: rantai setengah +
security theater · Fix: GET auth + endpoint/honest · Dep: nihil · Target:
E2E/honest
GAP-14 · Reports + vendors + BIM (F21+F14+F8) · Why: backend sudah ada semua,
M-effort · Fix: wiring · Dep: GAP-08 · Target: E2E
GAP-15 · Export-label + runs-affordance (F11+F18) · Why: S, honest-labels ·
Fix: label + badge · Dep: nihil · Target: honest
GAP-16 · NEED DECISION batch (F2+F12+F23+F25+F15+F26+F27) · Why: butuh jawaban
produk sebelum kode · Fix: 7 pertanyaan (signup-UI? transfer-routes?
jobs-satu-dunia? digest-cron? facilities-KV? settings-KV? handover-backend?)
· Dep: — · Target: TBD
GAP-17 · KEEP batch (F1+F4+F7+F9+F22+F28) · Why: no-op/sudah-jujur/defer ·
Fix: nihil (verifikasi berkala) · Target: by-design
```

## §26 — QUICK CLOSE (FE+BE ada + wiring sederhana)

F3, F5, F10, F11-label, F17, F18, F21-KPI, F31, F32 = **9**

## §27 — BIG ROCK

F13 (procurement M/L), F16 (field-backing M/L), F20-service-repair (M),
F14-vendor-backend (M), F27-handover (L, domain baru), F26-KV (L), SSO-real
(XL, eksternal — hanya bila diminta)

## §28 — DEPENDENCY MAP

```text
F20 force-dispatch→service+audit
↓
F16 field queue/run ← inspections
↓
WO creation visibility (sudah E2E — penerima)

telemetry ingest (KEEP F22, sudah nyata)
↓
F8 BIM live + RunChecklist IoT (ganti setTimeout)

reports.aggregates (nyata, nganggur)
↓
F10 inventory KPI + F21 reports hub

org roster live (DONE GAP-2)
↓
F3 provision refetch (1 baris)

findings E2E (DONE GAP-1)
↓
F17 outbox completion (delivery sudah tutup)

GAP-08 copy-honesty
↓
F15/F21/F23/F26/F27 (semua klaim turun dulu sebelum wire)
```

## §29 — FINAL COUNTS

```text
Total audited non-E2E: 32 (bukan 37 — selisih dijelaskan di atas)
Must fix: 8 · Must integrate: 8 · Complete partial: 4 · Keep by design: 3
Honest placeholder: 4 · Defer: 1 · Remove: 0 · Need decision: 4 primer
(+3 sekunder)
Current END-TO-END: 21 (19 lama + sessions + ledger-read via GAP-5/3)
Potential E2E after 9 quick closes: 21 + 8 = 29
Potential E2E after P0/P1 penuh: ~35 (semua kecuali F2/F12/F23/F25/F28 + keeps)
Remaining strategic/deferred: ~7
```

## §30 — FINAL ANSWER

> Dari **32 fitur non-E2E terverifikasi**: **bug/integration gap benar-benar
> = 20** (8 must-fix + 8 must-integrate + 4 complete-partial); **valid by
> design = 3** (print, ledger-fallback, telemetry-infra) + **4
> honest-placeholder** (SSO, clone-policy, facilities-sementara,
> runs-Fase2); **wiring sederhana (quick close) = 9**; **pekerjaan
> architecture besar = 7 big rocks** (tapi 3 di antaranya — vendors, shifts,
> settings-KV — alternatifnya NEED DECISION, bukan wajib bangun).

> **10 gap pertama satu-per-satu + alasan:** (1) **Billing HMAC** — P0
> keamanan, fail-closed S/M; (2) **Impersonate** — klaim audit fiktif di
> fitur sensitif; (3) **Copy cluster + EVT** — S-effort, fondasi kejujuran +
> guard-test; (4) **Purchasing** — fake-sukses procurement inti; (5) **PM
> hub** — fake-dispatch; (6) **Force-dispatch fix → field queue** —
> dependency berantai + audit-hole; (7) **WO tasks + KPI + provision-refetch
> + outbox-flush** — 4 quick-close paralel; (8) **Evidence serve +
> rotate-key** — tutup rantai + security theater; (9) **Reports + vendors +
> BIM** — backend sudah ada semua; (10) **Export-label + runs-affordance** —
> S honest-labels. Setelah itu: batch NEED DECISION (7 pertanyaan produk)
> lalu KEEP-batch no-op.

**Catatan metodologi:** semua temuan di atas berbasis trace statik 4 batch
paralel + bukti baris; klaim runtime ("live") hanya untuk yang sudah terbukti
Wave 3–4/GAP-1–5. Perintah "jangan memperbaiki code" dipatuhi — nihil file
kode diubah.
