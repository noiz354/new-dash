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

Sisa Phase 1 (slice 4+): inventory & parts (link part↔asset/BOM, pergerakan stok, requisition dari WO) · checklist/tasks WO DB-driven utk semua WO · evidence storage (foto sign-off) · observability (server-side pagination audit, metrik) · notifikasi vendor · Playwright E2E di CI · rate limit storage bersama · migrasi Postgres hosted. Roadmap penuh: `docs/AUDIT_SAAS_E2E.md` §K Phase 1–4.
