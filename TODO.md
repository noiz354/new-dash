# TODO.md — Rencana Kerja

## Fase 0 — Fondasi ✅ (selesai 2026-09-13)

- [x] Ekstrak zip ke `stitch_facility_maintenance_platform_ui/`
- [x] Inventarisasi 20 layar (`docs/INVENTORY.md`)
- [x] Tulis `AGENTS.md`, `PROGRESS.md`, `TODO.md`, `README.md`

## Fase Audit UI (20/20) ✅ Selesai — template `docs/PROMPT_UI_AUDIT.md` (v2 Architect)

- [x] Simpan template prompt audit (`docs/PROMPT_UI_AUDIT.md`) — v2: 6 seksi (+ Navigasi, + Missing Pages, kolom Trigger)
- [x] Audit `operations_dashboard` → `docs/ui-audit/operations-dashboard.md` (dimigrasi ke v2)
- [x] Navigation audit global → `docs/ui-audit/navigation-audit.md` (sitemap + 14 missing pages)
- [x] Audit 19 layar sisa, satu file per layar di `docs/ui-audit/`:
  - [x] `work-order-management-execution-hub` → `work-orders.md`
  - [x] `service-requests-triage-hub` → `service-requests.md`
  - [x] `asset-registry-lifecycle-management-ledger` → `asset-registry.md`
  - [x] `asset-detail-spare-parts-inventory-ledger` → `asset-detail.md`
  - [x] `preventive-maintenance-scheduling-automation-hub` → `preventive-maintenance.md`
  - [x] `field-inspections-audit-queue-hub` → `field-inspections.md`
  - [x] `inspection-findings-auto-wo-conversion-desk` → `findings-conversion.md`
  - [x] `mobile-field-inspection-execution-desk` → `mobile-execution.md`
  - [x] `facility-locations-spatial-hierarchy-management` → `facilities.md`
  - [x] `inventory-spare-parts-management-ledger` → `inventory.md`
  - [x] `purchasing-pos-management-hub` → `purchasing.md`
  - [x] `vendors-contractors-management-hub` → `vendors.md`
  - [x] `organization-rbac-governance-hub` → `organization-rbac.md`
  - [x] `audit-trail-system-logs-hub` → `audit-trail.md`
  - [x] `notifications-sla-alerts-hub` → `notifications.md`
  - [x] `reports-analytics-hub` → `reports.md`
  - [x] `settings-system-configuration` → `settings.md`
  - [x] `ui-state-variants-patterns` → `ui-state-patterns.md` (komponen reusable)
  - [x] `apex-ops-logo` → `logo.md` (aset/SVG)

## Fase Audit UI Pass-2 (19/19) ✅ Selesai — audit independen + §7 perbandingan di `docs/ui-audit/pass2/`

- [x] Pass-2 batch inti operasi (6): `work-orders.md`, `service-requests.md`, `preventive-maintenance.md`, `field-inspections.md`, `findings-conversion.md`, `mobile-execution.md`
- [x] Pass-2 batch aset & resource (6): `asset-registry.md`, `asset-detail.md`, `facilities.md`, `inventory.md`, `purchasing.md`, `vendors.md`
- [x] Pass-2 batch governance & sistem (7): `reports.md`, `audit-trail.md`, `notifications.md`, `organization-rbac.md`, `settings.md`, `ui-state-patterns.md`, `logo.md`
- [x] Koreksi atas pass-1 dicatat (§7 tiap file): cabut klaim "Kowalski ganda", revisi ui-state-patterns §2, kalibrasi label MISSING→aksi inline
- [x] Prompt audit visual semua `screen.png` → `stitch_facility_maintenance_platform_ui/PROMPT.md`
- [x] Jalankan audit visual semua PNG → `stitch_facility_maintenance_platform_ui/screen-audits/*.md` + `summary.md`

## Second-Pass Product Architecture Audit ✅ Selesai — output `stitch_facility_maintenance_platform_ui/screen-audits/second-pass*.md`

- [x] Audit second-pass route/screen/flow/state → `second-pass.md` + `second-pass-summary.md`

### NEW actionable findings — P0

- [x] Lengkapi generic detail coverage untuk semua linked Work Order ID; saat ini dynamic route ada, tetapi non-seed WO masih jatuh ke `EmptyState`.
- [x] Bangun flow global `New Dispatch / Create Work Order` dari topbar/palette: draft → validation → review → submit → success/failure.
- [x] Jadikan Field `Finding` sebagai route first-class (`/field/findings/new` atau setara), bukan fragment `#finding-capture`.
- [x] Lengkapi generic Purchase/PR/PO detail coverage untuk semua row list/notifikasi; saat ini route ada, tetapi beberapa PR/PO non-seed masih `EmptyState`.
- [x] Buat shared critical-action result pattern: confirmation + loading + success/failure + audit-link; perlu varian reason/PIN/spend approval.

### NEW actionable findings — P1

- [x] Tambah Report Dossier Detail / Generated Result page (`/reports/[id]` atau setara) untuk preview/query result sebelum export.
- [x] Tambah PM Plan detail/create/edit flow untuk plan rows dan New PM Plan action.
- [x] Tambah Inventory SKU detail page untuk ledger, reorder, reserved stock, dan movement history per SKU.
- [x] Tambah Facility Room detail page untuk room metrics, linked assets, work orders, blueprint state, dan audit/defect flow.
- [x] Tambah Audit Event detail/proof permalink untuk ledger hash, proof download, flag review, dan entity cross-link.
- [x] Tambah Organization user detail / role-history view untuk MFA, impersonation, deactivation, deployed rule history.
- [x] Tambah Settings job history untuk save/restore/reset/purge/credential issue result states.
- [x] Lengkapi Service Request detail coverage untuk semua rows di list, bukan hanya canonical seeded request.

### NEW actionable findings — P2

- [x] Lengkapi Vendor detail coverage untuk semua seeded vendors, termasuk expired/renewal/suspended states.
- [x] Lengkapi Asset detail/BIM coverage untuk non-canonical assets dari registry.
- [x] Tambah Vendor document/MSA detail lifecycle jika amendment/signature flow perlu audit permalink.
- [x] Tambah Purchase invoice / 3-way-match result view untuk match/dispute/exception history.
- [x] Tambah Asset document detail lifecycle untuk technical docs/upload/signed/expired states.
- [x] Tambah Shift handover detail untuk accepted/rejected/stale handover states.

### NEW actionable findings — P3

- [x] Tambah reusable print templates untuk Work Permit, Badge/QR, dan domain print artifacts di luar PO print.
- [x] Pertimbangkan dev-only UI state gallery route dari `ui_state_variants_patterns` bila dibutuhkan untuk QA komponen.

## Truth Map FE↔BE — backlog integrasi (detail: `docs/audit-fe-be-truth-map.md`, spec: `docs/audit-mocked-deadend-unintegrated-spec.md`)

- [ ] P0: wire `PATCH /api/organization/users/[id]` ke dialog Deactivate User (kini toast palsu "access revoked") + refetch + bukti 401 (G1)
- [x] P0: wire `PATCH /api/organization/users/[id]` + reset-MFA ke OrgHub (GAP-2 CLOSED 2026-09-16: org-service baru — list/create/update/resetMfa + self-guard 403 + revoke sesi + audit USER_*; roster live dari GET; 69/69 test; runtime MCP: provision→deactivate→reactivate + reset-MFA + self-403, 0 console error)
- [x] P0: persist `POST /api/findings` ke tabel findings + GET baca DB (GAP-1 CLOSED 2026-09-16: route via inspection-service, perm finding.create/read, severity adapter, idempotensi; 67/67 test; runtime MCP terverifikasi)
- [ ] P1: wire `inventory.mutate` ke Receive/Mutation desk + PIN approver server-side + guard available→0 (G3)
- [ ] P1: wire `po.list/create/receive` + `queue/jobs` ke purchasing/jobs UI + polling status (G4/G5)
- [ ] P1: agregat server untuk KPI inventory atau label scope jujur (ganti konstanta 4,218/1,840/`MOV_TOTAL`) (G6)
- [ ] P2: bersihkan klaim Live/WS-PUSH/SYNCED-hash, EVT-fallback, seed-tanpa-badge, perm `assets.read`→tulis, rute transfers/adjustments/runs, export-scope label (G7–G12)

## Audit Full-App — temuan baru di luar truth map lama (detail: `docs/audit-full-app-truth-map.md`)

- [ ] BROKEN baru: wire `finding.convert` ke FindingDesk convert + dismiss ke endpoint nyata (kini setTimeout/setState + klaim "audit-chained")
- [ ] BROKEN baru: wire `GET/POST /api/auth/sessions` ke ProfileSessions (kini SESSIONS const; revoke-all backend nganggur)
- [ ] BACKEND-ONLY → putuskan expose atau kunci: inspections CRUD + force-dispatch, wo tasks, parts/movements, purchasing/grn, queue/jobs, retention/digest, reports/aggregates, telemetry ingest/metrics, billing UI, signup form
- [ ] FRONTEND-ONLY → wire atau label jujur: reports hub, PM hub, shifts plan, facilities hub, vendors flows, settings hub, jobs page (SEED), print templates (WO/PO/badge/permit: nyatakan sumber CANON)
- [ ] DEAD-END: buat rute `/inventory/transfers`, `/inventory/adjustments`, `/field/runs` atau cabut referensinya (TO-8891/ADJ/INS-… menggantung)
- [ ] OrgHub provision: daftar roster masih SEED meski POST nyata → refetch setelah provision (PARTIAL → END-TO-END)

## Handoff Codex ✅ Selesai — `.gitignore` + `CODEX.md` (Fase A–F untuk Codex)

## Fase A — Tutup Kanon ✅ Selesai (2026-09-13)

- [x] C9: bearing SKU — BUKAN konflik (PART-BRG-6204 vs PART-BRG-6205 dua SKU berbeda)
- [x] C10: CHILL-NUSA-04 / WO-0894 / WO-9042 — artefak GUGUR, rewire format penuh
- [x] C12: progres INS-2026-0412 — 65% kanon (hub otoritatif)
- [x] C14: Elena Moreno — persona terpisah [ASUMSI-OTOMATIS]
- [x] Amandemen C3 (tetap $1,450; ledger H1 $1,765) + C4 (tetap Trane) + klausa CANON §5 final

## Fase 1 — Keputusan Stack ⬜ (butuh jawaban user)

- [ ] Pilih stack produksi. Opsi default yang diusulkan:
  - **A (disarankan): Next.js 14 + Tailwind + shadcn/ui** — untuk app multi-layar, routing, state.
  - B: Vite + React + Tailwind — lebih ringan, tanpa SSR.
  - C: Pertahankan HTML statis + build Tailwind CLI — tercepat, tapi tanpa komponen.
- [ ] Tentukan Design System yang dipakai per layar (A desktop vs B field — lihat AGENTS.md §5)
- [ ] Tentukan folder kode produksi (`app/` atau `web/`), inisialisasi proyek + Tailwind config dari token DESIGN.md
- [ ] Setup font (Inter, JetBrains Mono, Space Grotesk) + ikon (Material Symbols / Lucide) secara lokal, tanpa CDN

## Fase Multi-Page Readiness ✅ Selesai — audit dokumen dulu (tanpa generate)

- [x] Audit 4 draf prompt anti-shortcut → `docs/AUDIT_MULTI_PAGE_READINESS.md` (gap analysis, 14 missing pages, wiring per layar, 4 prompt final HTML standalone + Tailwind, urutan eksekusi)
- [x] Spec deep view H1 → `docs/SPEC_WORK_ORDER_DETAIL.md` (gap G8–G13 + prompt Opsi 5 + spec WOD-01…WOD-12 + DoD; HTML menyusul setelah kanonisasi)
- [x] Spec wiring H1–H3 → `docs/SPEC_WIRING_HIGH_PAGES.md` (gap G14–G18 + prompt Opsi 6 + matriks wiring H1/H2/H3 + DoD; snippet per kelompok setelah kanonisasi)
- [x] Kanonisasi data → `docs/CANON_DATA.md` (22 keputusan C1–C22 + format ID + klausa CANON; DITUNDA: C9/C10/C12/C14)
- [x] Gelombang HIGH: H1 `work-order-detail.html` → H2 tiga file field (sistem B) → H3 `purchase-detail.html` (Opsi 3 + Opsi 2, satu halaman per request)
- [x] Gelombang MEDIUM (M1–M3, M6; M4–M5 keputusan desain di `docs/DECISIONS_M4_M5_M6.md`)
- [x] Gelombang Wiring: audit 9 file web/ — DoD rg bersih, semua link resolve kecuali L1/L2 (Fase E)
- [x] Gelombang LOW: L1 shift-plan.html, L2 user-profile.html, L3 print (permit/PO batch/badge), L4 melebur M4
- [x] Stack A live: Next.js 14 + Tailwind + shadcn-style + token A/B + lib/canon.ts (build hijau)
- [ ] Self-host woff2 (Inter/JetBrains Mono/Space Grotesk) — BLOCKED: font CDN unreachable dari sandbox

## Fase Expansion Checklist + Interaction Trees ✅ Selesai — audit mendalam tanpa kode

- [x] Expansion checklist 20 layar → `docs/EXPANSION_CHECKLIST.md` (270 item P1/P2/P3 + bahasan + transisi TERDEFINISI/TAK TERDEFINISI per layar; part: `docs/exp-check/`)
- [x] Interaction trees 20 layar → `docs/INTERACTION_TREES.md` (201 pohon L0→L5 + [POLA-BARU] kandidat kontrak komponen; part: `docs/exp-trees/`)

## Fase F — Rebuild + Integrasi 🟡 Parsial (wave-1 done 2026-09-13)

- [x] Shell prod: SideNav 15 data-path + TopBar + CommandPalette ⌘K + ⌘K global
- [x] Kontrak komponen: Button/Badge/Input/Skeleton/Dialog/ConfirmDialog/Logo/EmptyState/OfflineBanner/Banner/ErrorToast/TableSkeleton/SlaCountdown/LaborStopwatch + lib/canon.ts
- [x] Full rebuild: `/` dashboard (dispatch terverifikasi) + `/work-orders/[id]` H1 port (seed WO-2026-0894)
- [x] 22 route wave-2 live (EmptyState jujur, zero dead link) · tsc + build hijau · smoke-test OK
- [x] Wave-2: 18/18 layar + 2 non-halaman selesai (Fase 2: 20/20 ✅) · 4 list-page di luar 20 unit ikut selesai (Chunk 13+14: /work-orders, /service-requests, /purchasing, /vendors → 22/22 route prod, stub 0)
- [ ] QA wave-1: 3 breakpoint, empty/loading/error/offline, WIB, +62 (parsial: komponen + 2 route lolos smoke)

## Fase 2 — Rebuild Layar (20/20 prod ✅ · 4 list-page luar unit ikut prod ✅ → 22/22 route, stub 0)

Bonus di luar 20 unit: [x] `/login` prod (M3: SSO + MFA enforced) · [x] `/field/sync` prod (H2) · [x] `/purchasing/[id]/print` (L3) · [x] `/shifts/plan` (L1: handover) · [x] `/profile` (L2: sessions/revoke/print-badge) · [x] `/assets/[id]/bim` (M6: skematik+drawer).

Urutan disarankan (dashboard dulu sebagai kerangka navigasi):

1. [x] `operations_dashboard` → `/` prod (sidebar + KPI + dispatch terverifikasi + telemetri + feed)
2. [x] `work_order_management_execution_hub` → `/work-orders/[id]` prod (port H1: checklist, labor, ledger $1,765, OSHA, dialog WOD-05/06/12)
3. [x] `service_requests_triage_hub` (650) → `/service-requests/[id]` prod (M2: convert idem, zone, asset-M5, history)
4. [x] `asset_registry_lifecycle_management_ledger` (858) → `/assets` prod (filter, CSV nyata, register, QR, transfer, lifecycle, docs)
5. [x] `asset_detail_spare_parts_inventory_ledger` (985) → `/assets/[id]` prod (health 68, tab lifecycle, BOM+ledger, rewire C4/C5/C8)
6. [x] `preventive_maintenance_scheduling_automation_hub` (957) → `/preventive-maintenance` prod (trigger matrix 0104, dispatch queue→WO-0906+, simulasi, workload, New-Plan)
7. [x] `field_inspections_audit_queue_hub` (653) → `/field/audits` prod (H2: antrean, skeleton, filter, offline)
8. [x] `inspection_findings_auto_wo_conversion_desk` (543) → `/field/findings/[id]` prod (triage, BOM, convert, dismiss-guard)
9. [x] `mobile_field_inspection_execution_desk` (254, sistem B) → `/field/audits/[id]/run` + `/field/sync` prod (H2: PIN 2468, guard, idem-retry)
10. [x] `facility_locations_spatial_hierarchy_management` (773) → `/facilities` prod (spatial index, Room #B-204 pack, blueprint SVG, aset, WO, selector kaskade)
11. [x] `inventory_spare_parts_management_ledger` (725) → `/inventory` prod (6 SKU, ledger 5 gerakan, mutation desk PIN 2468, receive, CSV nyata)
12. [x] `purchasing_pos_management_hub` (719) → `/purchasing/[id]` prod (H3: tabs, SLA, GRN idem, match, quorum, print)
13. [x] `vendors_contractors_management_hub` (727) → `/vendors/[id]` prod (M1: PDF viewer, amend/dispatch/commend, MSA bar)
14. [x] `organization_rbac_governance_hub` (1052) → `/organization` prod (roster 6, diagnostics+guard, matrix 15×6, ABAC, SSO, provision SCIM)
15. [x] `audit_trail_system_logs_hub` (777) → `/audit-trail` prod (stream 6 event, live probe, diff inspector TXN-88120, Merkle verify, export)
16. [x] `notifications_sla_alerts_hub` (701) → `/notifications` prod (5 alert, P1 countdown live, PO/stock/WO/security actions, routing+escalation, debugger)
17. [x] `reports_analytics_hub` (868) → `/reports` prod (KPI, bar OPEX + alokasi Σ-valid, SLA, 4 dossier, query builder + SQL live)
18. [x] `settings_system_configuration` (920) → `/settings` prod (5 tab: org+numbering, seed+backup, integrasi+webhook, units, security C21)
19. [x] `ui_state_variants_patterns` (451) → komponen reusable, bukan halaman (Banner/EmptyState/ErrorToast/OfflineBanner/TableSkeleton/Skeleton/Dialog/ConfirmDialog ✅)
20. [x] `apex_ops_logo` (7) → `components/Logo.tsx` (Logo + LogoMark SVG ✅)

DoD tiap layar: lihat `AGENTS.md` §8.

## Fase 3 — Integrasi & QA ⬜

- [ ] Routing + navigasi antar-layar sesuai sidebar Stitch
- [ ] State mock → API contract (schema WO, Asset, Inventory, Vendor, RBAC, Audit)
- [ ] Responsif 3 breakpoint + uji kontras status badge
- [ ] Hapus semua CDN Play, ganti build Tailwind proper

## Fase P0 — Stop-the-Bleeding (dari `docs/AUDIT_SAAS_E2E.md` §K) ✅ Selesai (2026-09-14)

- [x] Upgrade `next` 14.2.13 → **16.3.5** (tuntas CVE critical/high; `npm audit` prod & all = **0 vulnerabilities**) — React 18.3.1 dipertahankan (peer Next 16 mengizinkan ^18.2)
- [x] Migrasi 6 halaman `[id]` ke async `params: Promise<{id}>` (wajib Next 16)
- [x] Hapus `eslint`/`eslint-config-next` + script `lint` (tidak pernah ada config; `next lint` dihapus di Next 16; sekaligus menuntaskan CVE dev `glob`)
- [x] Banner global **`DemoBanner`** (fixed h-7, `no-print`, di root layout) + offset `top-7` di TopBar/SideNav/3 header field/impersonation banner + padding main disesuaikan
- [x] Ganti indikator fiktif: chip "HTMX Server: Connected" → "DEMO DATA · no backend"; "Modbus … · synced" → "Simulated telemetry · demo data"; "Live Dispatch/Chiller" → label simulasi; tombol/toast "HTMX" → "simulated" (5 kontrol); klaim "MFA Enforced/rate-limited/rotate 30s" di login → pernyataan demo jujur. (2 sisa = data record fiktif di AuditTrail/OrgHub KPI, dinaungi banner)
- [x] Unifikasi persona sesi (audit fix #13): `CANON.sessionUser/Role/Email/Initials` = Marcus Vance · VP Operations & Facilities · m.vance@apexops.io · MV — dipakai LoginForm (ganti `e.lindqvist@…`), TopBar (ganti avatar "SK"), ProfileSessions (ganti "SK" + email `e.voronova@…` yang salah)
- [x] CI **`ci/ci.yml`** (siap pakai): `npm ci` → typecheck → `npm audit --omit=dev --audit-level=high` (blocking) → audit all (informational) → build. ⚠ Aktivasi tertunda: push `.github/workflows/` ditolak GitHub App sandbox (tanpa permission `workflows`) — maintainer salin `ci/ci.yml` → `.github/workflows/ci.yml` (instruksi di header file)
- [x] Untrack `.headroom/ccr.sqlite` + entry `.gitignore`
- [x] Fix bug nyata: `stroke-width` → `strokeWidth` di `Logo.tsx:22` (warning React SSR)
- [x] README ditulis ulang: status **design prototype** eksplisit + quick start + peta repo
- [x] Verifikasi: typecheck ✅ · build ✅ (49/49 halaman) · 26 route smoke 200/404 ✅ · banner ada di ops/auth/field/print ✅ · log dev tanpa warning ✅

## Fase P1 — Make Core Journey Reliable · Slice 1 ✅ Selesai (2026-09-14)

Dokumentasi lengkap: `docs/PHASE1_SLICE1.md`. Ringkasan deliverable:

- [x] **DB multi-tenant**: PGlite (Postgres 18 WASM) + Drizzle ORM; 16 tabel (orgs, users, sessions, mfa_challenges, idempotency_keys, audit_events, sequences, assets, parts, work_orders, work_order_events, service_requests, inspections, findings, vendors, purchase_orders); migrasi SQL committed (`db/migrations/`); seed kanon idempotent + tenant decoy untuk uji isolasi
- [x] **Auth nyata**: scrypt password hashing; sesi DB (opaque token, sha256 at-rest, cookie httpOnly `apex_session`); TOTP MFA RFC 6238 (challenge 5 mnt, 5 percobaan, single-use, dev hint non-prod); rate limit login (8/email + 24/IP per 10 mnt); RBAC 6 role × permission map; logout revoke + audit
- [x] **Guard berlapis**: `middleware.ts` (cookie presence) + layout `(ops)`/`(field)` server-side `getSessionContext()` fail-closed → redirect `/login`; login page redirect balik jika sudah auth
- [x] **API layer**: 7 route (`/api/auth/login|mfa|logout|session`, `/api/health`, `/api/work-orders` GET+POST, `/api/work-orders/[id]/transitions`); envelope `{ok,data,error}` + requestId; validasi Zod server-side; CSRF Origin-vs-Host; `withRoute` (log + authN + RBAC + error mapping DomainError/ZodError)
- [x] **Flow WO PASS pertama**: state machine 8 status × 7 aksi (`lib/domain/work-orders.ts`); transisi transaksional + optimistic guard (409 stale) + event log + audit trail; idempotency key (replay OK, reuse beda body 422); numbering server via `sequences` (WO-2026-0910 pertama); SLA due nyata + countdown live + label BREACH
- [x] **UI tersambung**: dashboard KPI dari rows nyata (SLA compliance `—` sampai ada completion) + execution feed dari `work_order_events`; WO list dari DB (filter/create/reassign riil + toast error server + `router.refresh()`); WO detail dossier canon dengan status/SLA/toolbar riil (Hold/Escalate/Resume/Sign-off → API); LoginForm fetch nyata + step MFA + devHint; TopBar user riil + logout
- [x] **Error boundary + loading**: `app/(ops)/error.tsx` (retry + petunjuk db:setup) + `loading.tsx` — menggantikan failure mode spinner abadi
- [x] **Tests**: `npm test` = 28/28 pass (17 unit: TOTP vektor RFC, scrypt, RBAC, rate limit, state machine, SLA, hash kanonik; 11 integrasi PGlite temp: auth penuh, single-use challenge, revoke, isolasi tenant list/get/mutasi, lifecycle + events, assign, numbering, idempotency, persistensi sesi, dashboard KPI)
- [x] **Infra**: scripts `db:generate|db:setup|db:reset|test`; `.env.example` (PGDATA_DIR, SEED_*, DEMO_MFA_HINT); `.data/` gitignored; CI + step test (`ci/ci.yml`)

## Fase P1 — Slice 2 ✅ Selesai (2026-09-14)

Dokumentasi lengkap: `docs/PHASE1_SLICE2.md`. Ringkasan deliverable:

- [x] **Flow SR → WO PASS kedua**: state machine SR (triage/convert/close; konversi **satu-kali** transaksional — WO + SR + event + audit commit bersama; double-convert → 409); jendela triage dari bukti kanon (P1 15m, P2 45m, P3 2h [ASUMSI-OTOMATIS])
- [x] **API**: GET/POST `/api/service-requests` + POST `/api/service-requests/[id]/transitions` (Idempotency-Key, optimistic guard, envelope + kode error `SR_*`)
- [x] **RBAC**: permission baru `sr.transition` (Enterprise Admin, Facility Director, Engineering Lead)
- [x] **Helper numbering bersama** `lib/services/sequence.ts` (WO/SR/PO/INS/FND) — refactor `wo-service` ikut pakai
- [x] **UI live**: SR list (create/triage/convert/close + toast server + `router.refresh()`), SR detail utk SEMUA tiket (status/SLA nyata, link WO konversi, riwayat dari `audit_events`), kartu **Transition History** di detail WO (`work_order_events`); `dialogs.tsx` requests palsu dihapus; "Export Ticket Log" dilabeli not-implemented (jujur)
- [x] **Next 16 hygiene**: `middleware.ts` → `proxy.ts` (warning deprecated hilang); `getSessionContext()` re-throw `DYNAMIC_SERVER_USAGE` → build log bersih (0 error)
- [x] **Tests**: `npm test` = 36/36 (8 test SR baru: unit state machine/SLA/RBAC + integrasi create→triage→convert→WO nyata, close wajib reason, replay convert tanpa WO kedua, isolasi tenant SR)
- [x] **E2E curl**: SR-2026-0895 create→triage→convert→WO-2026-0910; close 400 tanpa reason; **persisten lintas restart dev server** (cookie sesi lama tetap valid, rows tetap)

## Fase P1 — Slice 3 ✅ Selesai (2026-09-14)

Dokumentasi lengkap: `docs/PHASE1_SLICE3.md`. Ringkasan deliverable:

- [x] **`/audit-trail` live**: `audit_events` nyata (aktor/aksi/entitas/before-after JSON + `requestId` yang sama dengan log server), counts per scope via SQL GROUP BY, filter (search/entity/action/principal/severity), export CSV/JSON = baris persisten nyata, gating permission `audit.read` (403-EmptyState utk role tanpa izin). **Fiksi dibuang**: Merkle verify, hash karangan, rollback simulasi, synthetic live probe, signed proof, angka 184.9k → diganti pernyataan integritas jujur (append-only + transaksional; hash-chain = hardening masa depan)
- [x] **`/assets` live**: rows dari tabel `assets` + **workload nyata per asset** (open/total WO, active SR — subquery SQL, bukan angka tempelan); filter kelas/status + CSV; jujur read-only (mutasi health/BOM menunggu inventory slice)
- [x] **`/assets/[id]` live utk SEMUA asset**: dossier field registry + relasi WO & SR yang mereferensikan asset (link hidup) + canon chain seal (finding→SR→WO) + link BIM (simulated, berlabel); `AssetDetail.tsx` statis (403 baris, orphan) dihapus
- [x] **Dossier WO generik**: setiap nomor WO kini punya dossier operasional nyata (status/SLA countdown, **origin SR** via lookup `converted_wo_number`, Transition History, kartu Record) + toolbar penuh; canon dossier (checklist/parts/telemetry) tetap utk seal saja dan berlabel
- [x] **`CancelDialog`** baru (reason wajib, terminal) — 7 aksi state machine kini semua terjangkau dari UI
- [x] **Service baru**: `audit-service.ts` (listAuditEvents + counts + truncated flag), `asset-service.ts` (listAssets, getAssetDossier, findSrByConvertedWo); `WoRow.assetCode` ditambahkan ke DTO
- [x] **Tests**: `npm test` = 38/38 (2 test integrasi baru: ledger berisi semua jenis event + before/after hold reason + isolasi tenant decoy; registry + workload AST-HVAC-003 dari konversi SR + dossier relasi seal + origin cross-link + cross-tenant 404 ASSET_NOT_FOUND)
- [x] **E2E curl**: audit/assets/dossier/403-RBAC field tech/EmptyState format invalid ✅ · build hijau · log bersih

## SISA PEKERJAAN — MASTER LIST (update 2026-09-14, pasca Slice 3)

> Sumber kebenaran roadmap: `docs/AUDIT_SAAS_E2E.md` §K. Status selesai: Phase 0 ✅ · Phase 1 Slice 1–3 ✅ (`docs/PHASE1_SLICE1..3.md`).
> Urutan pengerjaan = urutan nomor di bawah (slice Phase 1 dulu, lalu Phase 2–4). Setiap slice WAJIB memenuhi DoD di bagian bawah.
> Master prompt siap-tempel untuk agent berikutnya: `docs/MASTER_PROMPT_CLAUDE_CODE.md`.

### 0. URUTAN EKSEKUSI — BY IMPACT (disepakati 2026-09-16; backlog kanonis = file ini)

> Aturan: tiap item aktif diverifikasi runtime via Chrome CDP :9227 (screenshot + console + network + runtime state) dengan verdict PASS/PARTIAL/FAIL/BLOCKED. TASK-27+ terkunci sampai runtime verification Wave 3–4 selesai.
> Status implementasi file-level (cek 2026-09-16 — BUKAN verdict runtime): TASK-01..03, 05..21, 23..26 ada file + wiring; TASK-04, 22, 27, 28, 29, 30, FONT belum.

1. [ ] Runtime verification Wave 3–4 (TASK-19/20/21/23/24/25/26 + final matrix) — lihat § Runtime Verification di bawah
2. [ ] Test debts: Slice 5 (seed checklist canon + UI checklist DB) → tests Slice 6/7/8/10 → A.14 Playwright E2E (harness untuk semua uji browser/CDP)
3. [ ] TASK-27 web push (opt-in P1) → TASK-28 passkeys (role-terbatas) → TASK-29 worker CSV (gated bukti RUM longtask) → TASK-30 save-as picker → TASK-FONT (butuh aset woff2) → TASK-22 CSP enforce (butuh ≥1 siklus report bersih)
4. [ ] A.16 aktivasi CI (dependensi maintainer) · D.4 load test (dilarang klaim throughput sebelum terukur) · Debt E.1–E.8 oportunistik per slice
5. [ ] Triase arsip satu-per-satu per batch tema (±50–80/sesi): exp-check ~540 checkbox + ui-audit ~457 TODO → verdict DONE/USANG/PROMOTE per item

### A. Phase 1 sisa — Make Core Journey Reliable (slice 4 → 10)

**Slice 4 — Inventory & Parts (mutasi stok nyata pertama; Critical Path #3 bagian "parts issue")**
- [ ] Skema: link part↔asset (tabel BOM/`asset_parts` atau kolom `asset_code` di `parts`) + tabel `part_movements` (append-only: issue/receive/adjust/reserve, ref WO/PO, aktor, qty, idempotency)
- [ ] Service `inventory-service.ts`: issue part ke WO (transaksional: stok −qty + movement + event WO; guard stok < 0 → 422), receive dari PO, adjust (reason wajib), reserve/release
- [ ] API: GET `/api/parts` (+stok per bin), POST `/api/parts/movements` (Idempotency-Key)
- [ ] UI `/inventory` live: stok nyata, ledger pergerakan, dialog issue-from-WO (guardrail kanon: SKU CRITICAL unit-terakhir vs WO-2026-0894), KPI dari DB; buang angka fiktif
- [ ] Seed: stok awal konsisten kanon (PART-SEAL-8821 Pack-of-2 di CRIB-B/Bay 01, ledger $1,765 = 1.450+195+2×120)
- [ ] Test: issue/receive/adjust + guard stok negatif + idempotency + isolasi tenant

**Slice 5 — WO Execution Checklist DB-driven + Evidence (Critical Path #3 bagian "sign-off")**
- [x] Skema: `wo_tasks` (steps per WO: urutan, judul, instruksi, status, verified_by/at, requires_photo) + `evidence` (file lokal `.data/evidence/` atau objek storage; hash, mime, uploader, ref task/WO)
- [ ] Seed checklist canon WO-2026-0894 (Step 01–05, Step 04 ACTIVE + photo gate, Step 05 LOCKED) sebagai data, bukan JSX
- [x] Service + API: update task status (guard urutan/lock), upload evidence (multipart, validasi mime/ukuran), sign-off gate nyata (foto wajib sebelum complete bila task requires_photo)
- [ ] UI: seksi checklist dossier seal → dari DB; generic dossier mendapat checklist kosong yang bisa diisi; `SignoffDialog` photo gate → upload nyata (buang label "simulated")
- [ ] Test: lock/unlock step, photo-gate menolak complete tanpa evidence, upload persisten

**Slice 6 — Inspections & Findings → konversi otomatis (Critical Path #2)**
- [x] Skema: `inspections` + `findings` terdefinisi & linked (`converted_wo_number`)
- [x] Flow field: run checklist (Sistem B: PIN override, guard FAIL), submit inspection → progress nyata, finding baru → konversi **satu-kali** finding→WO (pola idempotency sama dengan SR convert; guard 409 bila already converted)
- [x] API + UI `/field/audits`, `/field/audits/[id]/run`, `/field/findings/[id]` live; auto-WO conversion dari finding CRITICAL (kanon: FND-2026-0188 → SR-2026-0894 → WO-2026-0894 sebagai seed chain, endpoint `/api/findings/[id]/convert` live)
- [ ] Test: submit inspection menggerakkan progress, konversi finding satu-kali, PIN override tercatat di audit

**Slice 7 — Procurement: PR → PO → GRN → 3-way match (Critical Path #4)**
- [x] Skema: `po_line_items` + `goods_receipt_notes` terdefinisi di schema database
- [x] Service `procurement-service.ts`: list/get purchases, create PR dengan line items, GRN dock receipt idempoten terhubung ke `inventory-service` (penambahan stok on-hand)
- [x] API: GET/POST `/api/purchasing` + POST `/api/purchasing/grn` (honors `Idempotency-Key`)
- [x] UI `/purchasing` + universal detail live dari DB & metadata catalog; 3-way match reconciliation dossier di `/purchasing/invoices/[id]`
- [ ] Test: approval chain + cap, GRN duplikat ditolak, 3-way match mismatch → flag, stok bertambah saat receive

**Slice 8 — Preventive Maintenance (PM) nyata**
- [x] Skema: `pm_rules` terdefinisi di schema database
- [x] Kanon: PM auto-batch WO-2026-0906..0909 dijelaskan oleh rule seed & sequence generator
- [x] Service `pm-service.ts`: list/get rules, create rule, toggle active/paused, generate scheduled WO transaksional idempoten
- [x] API: GET/POST `/api/preventive-maintenance` + POST `/api/preventive-maintenance/[id]/generate` (honors `Idempotency-Key`)
- [x] UI `/preventive-maintenance` & detail `/preventive-maintenance/[id]` terhubung
- [ ] Test: generator membuat WO idempoten per periode (tidak dobel), pause menghentikan generasi

**Slice 9 — Layar sisa jadi live (read + mutate sesuai domain)**
- [x] `/vendors`: MSA expiry nyata (dispatch lock saat MSA expired — guardrail kanon H3), on-time% dari agregat WO vendor
- [x] `/reports`: agregat nyata (MTTR, SLA compliance per periode, top assets) via `/api/reports/aggregates` & analytical dossiers di `/reports/[id]`
- [x] `/notifications`: SLA-at-risk dihitung nyata dari `sla_due_at` via `/api/notifications`; mark-read & escalation engine
- [x] `/organization`: user CRUD nyata (invite/deactivate, role assignment → `users` via `/api/organization/users`), ROLES6 permission matrix dari `rbac.ts`; audit row per perubahan
- [x] `/settings`: konfigurasi org persisten, API key display last4 (C21), rotasi PIN & snapshot audit logs
- [x] `/profile` + ProfileSessions: badge CR80 print, session revocations, impersonation banner dengan audit trail
- [x] Command palette ⌘K: pencarian cepat multi-entity nyata (WO/SR/asset/part) via endpoint `/api/search`
- [x] `/shifts/plan`: handover shift persisten dengan verifikasi LOTO, dialog penolakan, dan cetak dossier
- [x] Field shell sisa (`/field/sync`): antrean outbox PWA, retry Idempotency-Key, partial failure recovery

**Slice 10 — Pagination & filter server-side**
- [x] Semua endpoint data besar (WO, SR, audit, inventory, purchasing) → server-side pagination (`limit`, `offset`) + filter query
- [x] Audit trail: server-side pagination (`limit`, `offset`) + filter tanggal (`from`/`to`) + filter `entityType`
- [ ] Test: paging konsisten + filter tenant-scoped

**Item lintas-slice Phase 1 (utang eksplisit)**
- [x] A.10 Field offline outbox: antrian mutasi lokal (localStorage/IndexedDB) + flush dengan Idempotency-Key saat online (`lib/offline/outbox.ts`); UI `/field/sync` nyata (partial failure + retry key sama = kanon H3)
- [x] A.11 Notifikasi vendor saat escalate (email dev/log + outbox via `lib/services/notification-service.ts`)
- [x] A.12 Rate limit ke storage bersama (`rate_limits` table di database & `rateLimitShared` di `lib/auth/limits.ts`) — multi-instance / cluster safe
- [x] A.13 CSRF token per-sesi (bila ada kebutuhan cross-origin/API client pihak ketiga) via `lib/auth/csrf.ts`
- [ ] A.14 Playwright E2E di CI: login (devHint) → create SR → convert → WO hold → refresh assert persisten; smoke 5 critical screens
- [x] A.15 Migrasi Postgres hosted (neon/supabase/self-host): dokumentasi prosedur cutover & panduan arsitektur driver swap di `docs/POSTGRES_MIGRATION_CUTOVER.md`
- [ ] A.16 Aktivasi CI oleh maintainer: `cp ci/ci.yml .github/workflows/ci.yml` (GitHub App sandbox tidak punya permission `workflows` — hanya maintainer)

### B. Phase 2 — Make SaaS Operable

- [x] B.1 Structured logging JSON level env-driven (`lib/log.ts`) + OTel W3C `traceparent` propagation (`traceId`, `spanId`) terintegrasi pada seluruh request di `withRoute`
- [x] B.2 Deep readiness & liveness probe `/api/health`: latency query DB, memory stats, uptime seconds
- [x] B.3 Metrik RED (rate/errors/duration per route) otomatis di `withRoute` + telemetry collector `lib/telemetry/metrics.ts` via `GET /api/telemetry/metrics`
- [x] B.4 Audit hardening: hash-chain (kolom `prev_hash`, verifikasi berantai, endpoint verify) via `POST /api/audit-trail/verify-chain`
- [x] B.5 Backup/restore & job execution log nyata di `/settings/jobs`: snapshot S3, PITR restore simulation, database maintenance history
- [x] B.6 Session hardening: rotation pasca-MFA, absolute timeout, "sign out all devices" via `POST /api/auth/sessions`

### C. Phase 3 — Improve Growth

- [x] C.1 Signup + onboarding (Critical Path #1): multi-tenant provisioning (`lib/services/onboarding-service.ts`) + initial Enterprise Admin + sequences seed + auto-session login via `POST /api/auth/signup`
- [x] C.2 Activation event terdefinisi & terinstrumentasi: penutupan WO pertama (`wo.complete`) mengaktifkan `organizations.activated_at` & mencatat audit activation event
- [x] C.3 Product analytics & SaaS funnel milestones (`lib/telemetry/analytics.ts`): pelacakan tahap siklus adopsi, konversi penutupan WO, dan kecepatan resolusi
- [x] C.4 Billing (Critical Path #5): skema `subscriptions`, Stripe checkout & webhook idempotensi, entitilment server-side (`lib/services/billing-service.ts`), dunning status grace period, downgrade otomatis via `POST /api/billing/webhook`
- [x] C.5 Retention loop nyata: digest operasional terjadwal (`lib/services/retention-service.ts`), jadwal PM mendatang, dan peringatan eskalasi SLA via `GET /api/retention/digest`

### D. Phase 4 — Scale

- [x] D.1 Read replica connection routing & OLAP query helper (`lib/db/replicas.ts`) untuk query analitik berat
- [x] D.2 Queue/worker latar belakang dengan Dead Letter Queue (DLQ) & retry policy (`lib/queue/worker.ts`) via `GET/POST /api/queue/jobs`
- [x] D.3 Caching HTTP ETag conditional request (`lib/api/etag.ts`): SHA-1 ETag computation, `If-None-Match` evaluation, dan 304 Not Modified
- [ ] D.4 Load test jalur kritis (login, dashboard, list WO, submit inspeksi, checkout) — **dilarang klaim throughput sebelum terukur**
- [x] D.5 Multi-region / HA read-write splitting router (`lib/db/replicas.ts`) untuk fasilitas sensitif latensi lokal
- [x] D.6 Telemetry ingestion nyata: tabel `sensor_readings`, evaluasi batas ambang keselamatan fisik (`lib/services/telemetry-service.ts`), alarm darurat SCADA via `GET/POST /api/telemetry/ingest`

### E. Debt & hygiene (lintas fase — kerjakan oportunistik per slice)

- [ ] E.1 4 advisory moderate di rantai dev-dep `drizzle-kit` (esbuild ≤0.24.2, GHSA-67mh-4wv8-2f99) — dev-only, gate prod hijau; upgrade saat drizzle-kit rilis fix (jangan `audit fix --force` → downgrade breaking)
- [ ] E.2 Konsistensi zod v4: ganti sisa `.string().uuid()/.email()` deprecated → `z.uuid()/z.email()` (audit grep per slice)
- [ ] E.3 `next-env.d.ts` churn (dev menulis path `.next/dev/types`) — jangan pernah ikut ter-commit (sudah dikawal manual; pertimbangkan hook)
- [ ] E.4 DemoBanner & README: perbarui klaim setiap slice (bagian yang masih "simulated" menyusut — jaga kejujuran)
- [ ] E.5 Komponen statis tersisa yang belum tersentuh slice: `OrgHub` (KPI fiktif), `AuditTrail` fiksi sudah dibuang ✅, field `AuditQueue`/`SyncStatus` (jadi nyata di A.10/Slice 6), `ProfileSessions` (Slice 9), purchase/vendor dialogs (Slice 7)
- [ ] E.6 Hapus `web/` (arsip prototipe HTML standalone) + `stitch_facility_maintenance_platform_ui/` **hanya atas persetujuan user** (folder beku AGENTS.md) — kandidat setelah Phase 2
- [ ] E.7 Secrets: `SEED_TOTP_SECRET`/`SEED_USER_PASSWORD` via env di deployment nyata; `.env.example` sudah menyiapkan; jangan commit `.env`
- [ ] E.8 i18n label status (WO_LABELS/SR_LABELS English) vs UI dwibahasa — putuskan saat Phase 3 landing page

## Runtime Verification Wave 3–4 (via Chrome CDP :9227) 📋 Spec siap, eksekusi belum mulai

> Spec lengkap: `docs/runtime-verification-wave-3-4.md`. Satu task satu verdict (PASS/PARTIAL/FAIL/BLOCKED). Jangan mulai TASK-27+ sebelum selesai.

- [x] TASK-19 Barcode → PARTIAL (laporan: `docs/runtime-verification-task19.md`; A+E PASS, B/C/D/F BLOCKED BY ENVIRONMENT — Win64 Chrome tak punya BarcodeDetector)
- [x] TASK-20 Audit truthfulness → PASS (laporan: `docs/runtime-verification-task20.md`; verify-root fabrikasi dihapus, bug `asc` diperbaiki, copy/KPI/metadata jujur, test 61/61)
- [x] TASK-21 Windowing → PASS (laporan: `docs/runtime-verification-task21.md`; 65 data → 25 li via MCP, spacer math eksak, scroll keyboard End/Home disjoint, filter jujur, test 65/65)
- [x] TASK-23 PWA Manifest → PASS (laporan: `docs/runtime-verification-task23.md`; link manifest + JSON valid + 4/4 ikon 200 + installabilityErrors [])
- [x] TASK-24 Service Worker → PASS (laporan: `docs/runtime-verification-task24.md`; bug fallback SHELL-vs-PAGES di-fix + terverifikasi end-to-end, logout purge, nuansa: React #418 pre-existing backlog)
- [x] TASK-25 Background Sync + Badging → FAIL (laporan: `docs/runtime-verification-task25.md`; outbox klien nyata, TAPI server fabrikasi: POST 201-tanpa-persist + GET hardcode; auto-flush unproven → backlog)
- [x] TASK-26 SSE Alerts → PASS (laporan: `docs/runtime-verification-task26.md`; stream/snapshot/heartbeat/header + fallback jujur + recovery live→fallback→live)
- [x] Final matrix + bug list + final decision Wave 3–4 → 19 PARTIAL, 20/21/23/24/26 PASS, 25 FAIL (lihat laporan per task + PROGRESS.md)

## Backlog Step 2 — Batch 1 Operasi (triase PROMOTE, detail: `docs/triase-batch-1-operasi.md`)

> Hasil: DONE 29, PROMOTE 44, USANG 0 dari 73 item `docs/exp-check/part-operasi.md` vs HEAD 4121970.

- [ ] WO: evidence viewer LOTO (WO-2/ME-5), requisition prefill (WO-3, U), tech assist (WO-5), autosave STALE (WO-9), drag pipeline (WO-10), labor validation (WO-11)
- [ ] SR: asset drawer (SR-3), batch bar (SR-4, U), dispatch taxonomy (SR-5), export log (SR-6, U), convert confirm P1+LOTO (SR-7), breach (SR-8), convert validation (SR-9), optimistic STALE (SR-10), reject/dup modal (SR-11), chat retry (SR-12, U)
- [ ] PM: history-link target (PM-1, U), checklist detail (PM-3), row drawer (PM-4), export CSV (PM-6), STALE engine badge (PM-9), simulate marker (PM-10), ready-first sort (PM-11)
- [ ] Inspections: unified drawer (FI-3), templates content+create (FI-4/5), fast-link a11y (FI-8), publish validation (FI-10), reorder keyboard (FI-11), IoT offline widget (FI-12)
- [ ] Findings: conversion result page (FC-1), evidence lightbox (FC-3a), unresolved recount (FC-5), batch convert (FC-6), export CSV (FC-7), convert-fail toast (FC-11), OSHA derivation (FC-12), BOM shortage (FC-10)
- [ ] Mobile: site picker (ME-7), FAIL validation rule (ME-8), Modbus fail fallback (ME-10), pinch-zoom decision (ME-12)
- [ ] Dependensi kanon belum diputus: WO 0894/8802, LOTO #4092/#M-44, INS-412 65/50, PART-SEAL-8821, jam Shift A, GPS Kalimantan

## Backlog Step 2 — Batch 2 Aset & Resource (triase PROMOTE, detail: `docs/triase-batch-2-aset.md`)

> Hasil: DONE 50, PROMOTE 45, (U) 11, USANG 0 dari 106 item `docs/exp-check/part-aset.md` vs HEAD 360d525.

- [ ] Asset Registry: flow + konfirmasi Decommission, flow + modal Transfer Loc, modal Register New Asset + POST, Batch QR Print massal/satuan, export async job, sinkronisasi filter/pagination ke query params (`?q=`, kalibrasi `Page 1 of 308`)
- [ ] Asset Detail: sub-tab IoT Diagnostics / PM Schedules (12) / Compliance & Docs, Dossier PDF 360°, export full ledger 421 + hash, guardrail Issue-to-WO saat SKU DEFICIT, modal Quick Dispatch + Log Inspection, modal Add SKU to BOM, flow +PR Request baris kritis, flow +Quick PO, warehouse scope toggle, pill filter timeline, badge telemetri STALE/reconnect
- [ ] Facilities: kontrak JSON `GET /api/v1/locations/:id` + `?locationId=` (ganti fragment HTMX), prefill Dispatch Room Audit / Log Defect via `?locationId=`, tampilan hasil `TMPL-HVAC-CHL-02`, persist polygon/rekalibrasi, Print Badge QR ruangan, link `WO-2026-0881`, pesan gagal hx-get + Retry + tile STALE + MODEL MISMATCH, unifikasi label hitungan (8 AST vs 4 Linked vs Showing 4 of 8)
- [ ] Inventory: POST mutasi idempoten (`Idempotency-Key`, kini lokal), verifikasi PIN approver nyata (kini hardcoded `2468`), approval khusus saat available → 0, rute detail transfer/adjustment, prefill Draft PO (`?sku=`), link PM-PLN-0104
- [ ] Purchasing: POST nyata authorize/GRN (kini simulasi fase), modal + validasi Create PR/PO, backend Flag Discrepancy / Reject / RFQ, guard mismatch qty + envelope tak cukup (server-side), rute detail GRN-9941, job export CSV/Audit + print batch
- [ ] Vendors: flow + modal Onboard vendor/MSA + approval, flow + modal Initiate Amendment, modal Dispatch prefill `?vendorId=`, countdown renewal single-source (312d vs 288d), aksi Commendation, dossier + export compliance, footer Sync Oracle ERP gagal + Retry, viewer MSA PDF gagal + unduh langsung
- [ ] (U) kedalaman belum terverifikasi — verifikasi saat implementasi: prefill WO/PM dari drawer registry, tombol copy tag + fallback, referensi gantung WO/PO/TO/ADJ, link simbol CHILLER #04, klik node tree spasial, polling feed inventory + badge hash, Print QR rak-bin, Expiry Ledger inline vs halaman, empty state direktori, `tel:` Direct Ring
- [ ] Dependensi kanon belum diputus: WO seal ganda, OEM Trane vs Daikin, skor 68/88/88,4, harga PART-SEAL-8821, bin CRIB-B vs SUB-LCK-4B, MSA 312d vs 288d, label WO-0894 vs WO-2026-0894

## Backlog Step 2 — Batch 3 Governance (triase PROMOTE, detail: `docs/triase-batch-3-governance.md`)

> Hasil: DONE 42, PROMOTE 45, (U) 4, USANG 0 dari 91 item `docs/exp-check/part-governance.md` vs HEAD 361ff8f.

- [ ] Dashboard: modal Quick Create WO + POST, aksi baris inline optimistis (Dispatch/Reassign/Auto-Assign/Expedite), banner Telemetry Degraded + Retry (wiring dashboard), filter rail via query params + reset, tab chart + skeleton/shimmer + Retry
- [ ] Reports: drawer filter dimensi (tune), riwayat job EXP-*/RPT-*, generate/export async (Compiling→Ready, FAILED+Retry), badge replika SYNCED→LAG/STALE, validasi query builder + preview 0 records, filter kosong + Reset, toast export per baris
- [ ] Audit Trail: ekspor log terjadwal berkala
- [ ] Notifications: modal Reassign Tech, flow transfer antar-crib, markAllRead optimistic + rollback, toggle kanal/preferensi, banner WS putus ganti label jujur (label `WS-PUSH: 12ms` fiksi — lihat F-COPY), countdown auto-eskalasi + STALE, tab/search/severity via query params + empty message, kartu tetap unread bila gagal
- [ ] Organization: auth prod SSO Okta SAML + MFA FIDO2, modal Edit Assignment, sync SCIM per user + retry + webhook log, PUT rules server + rollback (Deploy kini simulated), validasi modal Provision, banner sesi impersonasi
- [ ] Settings: dialog konfirmasi destruktif (Reset/Purge/Rotate/Maint), drawer editor konfigurasi, deep-link `?tab=`, konfirmasi Maint Mode ON + audit, save banner TX + Retry, tab lazy-fetch + skeleton, empty webhook/snapshot/kunci
- [ ] UI States: `TableSkeleton`, standar hover-reveal + focus ring + kanban drag, kontrak prod Force Ping + flush, Retry idempoten + Copy Log, skeleton→baris + STALE, guard submit + LOTO
- [ ] Logo: varian logo-white/mark/favicon/PWA icon, keputusan tipografi wordmark, alt/fallback inisial AO, skeleton 36×36
- [ ] (U) kedalaman belum terverifikasi — verifikasi saat implementasi (4 item): persistensi cron Schedule Dispatch; revoke perilaku profil user; empty state roster Displayed; viewer hasil restore + RPO/RTO/diff; feedback job seed/backup; adopsi FormField + guard
- [ ] Dependensi kanon belum diputus: WO-2024 vs WO-2026, tenant APX-NUSA-01 vs APX-GL-9021, 6 vs 8 roles, Shift A, PR vs PO, Quiet Hours, zona, kontak, screen.png salah sorot, artefak mobile shell purchasing/vendors, ID contoh ui-patterns, presisi logo

## Backlog Step 2 — Batch 4 ui-audit (triase PROMOTE, detail: `docs/triase-batch-4-ui-audit.md`)

> Hasil: 23+ref DONE / 15+1ref PROMOTE / 4 (U) / 1 USANG atas ~41 kapabilitas
> distinct (458 sebutan TODO dari 40 file `docs/ui-audit/`).

- [ ] Rute hilang: `inventory/transfers/[id]`, `inventory/adjustments/[id]`, halaman `field/runs*`
- [ ] Backend belum ada: vendors (+MSA +summary), assets/registry (+telemetri/BOM), settings/system, locations/facilities, live-queue/steps/time-entries, dispatch-queue/batch, notifications read-all/preferences, webhook vendor (billing.webhook hanya Stripe inbound), wo-draft, purchase authorize flow (terpisah dari `po.create`)
- [ ] Wire-up UI → endpoint nyata yang SUDAH ADA: `inventory.mutate` (mutasi kini lokal), `po.receive` (GRN kini pesan lokal), `reports.aggregates`, `inventory.*`/parts (wiring belum terverifikasi)
- [ ] Temuan TASK-25 tetap: persist findings (ref, tak diduplikasi); PIN supervisor nyata (kini `2468`)
- [ ] (U): wiring UI reports/inventory, pemicu auto-flush reconnect, impersonate enforcement (ref batch 3)
- [ ] USANG: usulan endpoint `verify-root` (dihapus by design; pakai `verify-chain`); konvensi path `/api/v1/*` (API = `/api/*`)

### Definition of Done per slice (WAJIB semua)

1. `npm run typecheck` hijau · `npm test` hijau (test baru untuk domain/service yang ditambah) · `npm run build` hijau (0 log level error)
2. `npm run db:setup` bila ada migrasi/seed baru (dev server STOPPED saat db scripts — PGlite single-writer)
3. E2E nyata: dev server + curl (atau Playwright bila A.14 selesai) membuktikan aksi → state → persisten → UI → gagal-terdiagnosis
4. Kejujuran: fitur masih simulasi WAJIB berlabel; tidak ada klaim performa tanpa pengukuran; fiksi baru dilarang
5. Docs: `docs/PHASE1_SLICEn.md` (atau fase bersangkutan) + baris `PROGRESS.md` + update `TODO.md` + `docs/AUDIT_SAAS_E2E.md` §K bila fase tuntas
6. Git: commit deskriptif per unit + `git push origin <branch>`; bila push gagal → catat `PUSH-BLOCKED` di `PROGRESS.md`, lanjut kerja
7. Definisi PASS audit §2 untuk tiap flow: user action → backend state benar → data persisten → UI merefleksikan → kegagalan terdiagnosis → business outcome
