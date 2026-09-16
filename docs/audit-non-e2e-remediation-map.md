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

**F3 — Org provision refetch.** Current: PARTIAL. Yang nyata: roster live GET,
POST provision persist + audit. Yang lokal: append tanpa revalidate (server
defaults bisa divergen). Break: request revalidation. Canon: DB users.
Persist: PERSISTED. Contract: MATCH. Tests: PRESENT. **Decision: COMPLETE
PARTIAL** (`QUICK CLOSE`). Target: END-TO-END. Reason: 1 baris `refresh()`
setelah POST. P1/S/LOCAL.

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

**F6 — Evidence serve.** Current: PARTIAL. Nyata: POST upload → magic-byte
+sha256 → writeFile `.data/evidence` + row DB. Belum: serving (header route:
"TODO slice berikutnya"), viewer UI, FindingCapture tak pakai route (JSON
only). Break: serving layer. Canon: FS+DB evidence. Persist: PERSISTED.
Contract: PARTIAL (POST MATCH, GET NOT FOUND). Tests: NONE. **Decision:
COMPLETE PARTIAL** (GET ter-otentikasi + viewer). Target: END-TO-END.
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

**F11 — Export CSV.** Current: PARTIAL (local rows only; toast provenance
jujur; label "CSV/XLS" tapi hanya CSV). Gap: no server export + label
overclaim. Canon: loaded rows. Persist: file-download. Tests: NONE.
**Decision: COMPLETE PARTIAL** (label→"CSV (loaded rows)" = QUICK CLOSE;
server export DEFER). Target: PARTIAL-honest. Reason: scope penuh
(full-catalog export) = M; label fix = S. P2/S/LOCAL.

**F12 — Transfer/adjust refs.** Current: DEAD-END (rute TAK ADA; ledger kini
render teks, bukan link). Gap: MISSING ROUTE + PRODUCT DECISION MISSING.
Break: UI→route. Tests: NONE. **Decision: NEED PRODUCT DECISION** (buat rute
vs hapus refs; sementara biarkan teks — tak ada link menggantung). Target:
TBD. P3/S/LOCAL.

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

**F15 — Facilities hub.** Current: FRONTEND-ONLY + klaim infra fiktif
("Spatial Sync Realtime · HEALTHY", "BIM MATCHED"). Gap: BACKEND MISSING +
MISLEADING SUCCESS. Break: handler→backend. Persist: NOT PERSISTED. Tests:
NONE. **Decision: HONEST PLACEHOLDER sekarang + NEED PRODUCT DECISION**
(facilities backend vs hapus klaim). Target: FRONTEND-honest. Reason: klaim
realtime tanpa broker = harus turun dulu. P2/S/MODULE.

**F16 — Field queue/run checklist.** Current: FRONTEND-ONLY + fake
("Submitted — WO auto-dispatched" tanpa WO, "audit-chained" tanpa write, PIN
2468, autosave bohong). Gap: MISSING PERSISTENCE + FAKE SUCCESS. Backing
tersedia: inspections API (F20). Break: handler→API. Canon: INITIAL_*
consts. Persist: NOT PERSISTED. Tests: NONE. **Decision: MUST INTEGRATE**
(queue ← inspections list; run ← updateProgress; hapus PIN/fake-toasts).
Target: END-TO-END. Reason: inti field-flow; fiksi dispatch = P1.
P1/M-L/CROSS-MODULE (dep: F20-fix).

**F17 — Outbox auto-flush.** Current: PARTIAL (store+enqueue+flush+retry+
idempotency NYATA; delivery findings kini persist GAP-1). Gap: MISSING
REFRESH — auto-flush hanya mount di `/field/sync`; FieldShell refresh-only;
produser 1 op; badge AppBadge no-op. Break: coverage (mount scope). Canon:
IDB apex-outbox. Persist: PERSISTED (IDB+server). Tests: NONE. **Decision:
COMPLETE PARTIAL** (`QUICK CLOSE`: flush-on-online di FieldShell + daftarkan
produser WO-evidence). Target: END-TO-END. Reason: S-effort, reliability core
offline. P1/S/MODULE.

**F18 — Runs INS-0415/0418 TODO Fase 2.** Current: DEAD-END (200 →
EmptyState, tanpa affordance di kartu). Gap: MISSING UI honesty. Break:
`run/page.tsx:15` gate. Tests: NONE. **Decision: HONEST PLACEHOLDER**
(`QUICK CLOSE`: badge "Fase 2" di kartu queue). Target: DEAD-END-honest.
Reason: 1 baris; hentikan tap-kecewa. P3/S/LOCAL.

**F19 — PM hub dispatch/batch.** Current: FRONTEND-ONLY + fake ("Batch
dispatched · WOs created · leads paged", ID WO-0906+ fabrikasi) sementara
`pm-service` (tx+idempotency+audit) + routes nganggur. Break:
component→API. Canon: SEED lokal. Persist: NOT PERSISTED (UI). Tests: NONE.
**Decision: MUST INTEGRATE** (list+generate nyata; FindingDesk sudah
buktikan POST create bisa). Target: END-TO-END. Reason: dispatch fiktif =
fake mutation inti. P1/M/MODULE.

**F20 — Inspections + force-dispatch.** Current: BACKEND-ONLY + route
PARTIAL/BROKEN (force-dispatch inline update, tanpa zod/audit/idempotency,
divergen dari service; list punya fallback 3-row CANON saat tabel kosong =
MOCKED-inside-real). Gap: MISSING UI + service-bypass. Break: route→service.
Canon: inspection-service (route-nya shadow). Persist: PERSISTED (unused
paths). Tests: NONE. **Decision: MUST FIX dulu (route → service + audit),
lalu MUST INTEGRATE (F16 caller)**. Target: END-TO-END. Reason: prerequisite
F16; inline-write tanpa audit = compliance hole. P1/M/MODULE.

**F21 — Reports hub.** Current: FRONTEND-ONLY + fiksi ("46ms · 412 records",
`telemetry_mart` tak ada di schema, "READ REPLICA SYNCED"). Gap: FRONTEND
NOT WIRED (aggregates nyata nol caller). Break: `runQuery` terminal. Canon:
consts lokal. Persist: NOT PERSISTED. Tests: NONE. **Decision: MUST
INTEGRATE** (KPI←aggregates = QUICK CLOSE; builder-SQL vs tabel nyata =
follow-up). Target: END-TO-END. Reason: angka BI tanpa sumber. P2/M/MODULE.

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

**F30 — Rotate Key.** Current: MOCKED ("Rotation started" toast-only; full
secret tak pernah ada). Gap: BACKEND MISSING + FAKE SUCCESS. Break: UI→API.
Tests: NONE. **Decision: MUST FIX** (endpoint rotate nyata atau ubah jadi
honest placeholder "managed externally"). Target: END-TO-END atau
PLACEHOLDER. Reason: key-rotation fiktif = security theater. P1/S/MODULE.

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
| 2 | Auth | Signup tenant | BACKEND-ONLY | MISSING UI | NEED DECISION | TBD | P3 | M | MODULE |
| 3 | Org | Provision refetch | PARTIAL | MISSING REFRESH | COMPLETE PARTIAL ⭐ | E2E | P1 | S | LOCAL |
| 4 | Org | Clone-policy/deploy | FRONTEND-ONLY | PRODUCT DECISION MISSING | PLACEHOLDER+DEFER | FE by design | P3 | S | LOCAL |
| 5 | WO | Tasks checklist | BACKEND-ONLY | FRONTEND NOT WIRED | MUST INTEGRATE ⭐ | E2E | P1 | S | MODULE |
| 6 | WO | Evidence serving | PARTIAL | MISSING ROUTE (GET) | COMPLETE PARTIAL | E2E | P1 | M | MODULE |
| 7 | Print | 4 template CANON | FRONTEND-ONLY | — (artifact) | KEEP BY DESIGN | FE by design | P3 | S | LOCAL |
| 8 | Asset | BIM live | MOCKED | FRONTEND NOT WIRED | MUST INTEGRATE | E2E | P2 | M | MODULE |
| 9 | Inventory | Ledger fallback | PARTIAL | — (honest) | KEEP BY DESIGN | PARTIAL-honest | P3 | S | LOCAL |
| 10 | Inventory | KPI cards | PARTIAL | FRONTEND NOT WIRED | MUST INTEGRATE ⭐ | E2E | P1 | S | MODULE |
| 11 | Inventory | Export CSV | PARTIAL | MISSING BACKEND + label | COMPLETE PARTIAL ⭐ | PARTIAL-honest | P2 | S | LOCAL |
| 12 | Inventory | Transfer/adjust refs | DEAD-END | MISSING ROUTE | NEED DECISION | TBD | P3 | S | LOCAL |
| 13 | Purchasing | PO/GRN/authorize | BROKEN | FAKE SUCCESS + NOT WIRED | MUST INTEGRATE 🪨 | E2E | P1 | M/L | X-MOD |
| 14 | Vendors | Onboard/amend/MSA | DEAD-END | BACKEND MISSING | MUST INTEGRATE | E2E | P2 | M | MODULE |
| 15 | Facilities | Hub actions | FRONTEND-ONLY | BACKEND MISSING + fake | PLACEHOLDER+DECISION | FE-honest | P2 | S | MODULE |
| 16 | Field | Queue/run checklist | FRONTEND-ONLY | FAKE SUCCESS + NOT WIRED | MUST INTEGRATE 🪨 | E2E | P1 | M/L | X-MOD |
| 17 | Field | Outbox auto-flush | PARTIAL | MISSING COVERAGE | COMPLETE PARTIAL ⭐ | E2E | P1 | S | MODULE |
| 18 | Field | Runs Fase-2 cards | DEAD-END | MISSING UI honesty | HONEST PLACEHOLDER ⭐ | honest | P3 | S | LOCAL |
| 19 | PM | Hub dispatch/batch | FRONTEND-ONLY | FAKE SUCCESS + NOT WIRED | MUST INTEGRATE | E2E | P1 | M | MODULE |
| 20 | Insp | CRUD+force-dispatch | BACKEND-ONLY | SERVICE BYPASS + no UI | MUST FIX+INTEGRATE 🪨 | E2E | P1 | M | MODULE |
| 21 | Reports | Hub+builder | FRONTEND-ONLY | FRONTEND NOT WIRED | MUST INTEGRATE ⭐ | E2E | P2 | M | MODULE |
| 22 | Telemetry | Ingest/metrics | BACKEND-ONLY | — (infra) | KEEP BY DESIGN | BE by design | P3 | S | LOCAL |
| 23 | Jobs | Dua dunia | FE-ONLY+BE-ONLY | DUAL SOURCE | NEED DECISION + FIX links | TBD | P2 | M | MODULE |
| 24 | Billing | HMAC/checkout | BACKEND-ONLY | AUTH BYPASS (catch) | MUST FIX | BE-hardened | P0 | M | MODULE |
| 25 | Retention | Digest orphan | BACKEND-ONLY | NO TRIGGER | NEED DECISION | TBD | P3 | S | LOCAL |
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
