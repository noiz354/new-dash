# 00-Product — Existing Features (Canonical Inventory)

> Status per 2026-09-19, HEAD `d69d793`. Legenda: ✅ VERIFIED COMPLETE ·
> 🔶 IMPLEMENTED UNVERIFIED · ◐ PARTIAL · 📋 PLANNED · 🚫 BLOCKED.
> Baris ini ringkasan; detail per domain di `02-features/`.
> REVISI P2 (2026-09-19): kolom Rute/API = hasil `find`/`ls` langsung di `app/`.
> Ref `GAP-xx`/`P1Sx`/`runtime TASK-xx`/`audit-map` = klaim `docs/sdd` (REPORTED,
> isi file klaim tidak dibaca ulang sesi ini) — BUKAN bukti sesi ini.
> KOREKSI vs versi lama: beberapa rute/API yang dikutip sebelumnya TIDAK ADA
> (dicatat per baris sebagai "TANPA ..."); tidak ada baris yang naik ke ✅ —
> VERIFIED COMPLETE butuh implementasi + uji yang mencakupnya (aturan user).

## Ops desktop (`app/(ops)`)

| Fitur | Rute | API | Status | Evidence |
|---|---|---|---|---|
| Dashboard + Ops Cockpit | `app/(ops)/page.tsx` ✅ (ops home) | — (TANPA `dashboard-*` API) | 🔶 | halaman ada; API agregat khusus belum |
| Work Orders | `app/(ops)/work-orders` + `[id]` + `new` ✅ (+print) | `work-orders`, `[id]`, `[id]/transitions`, `[id]/tasks`, `[id]/evidence` (+upload); TANPA `sla` | 🔶 | unit 182/182 ✅ · smoke render ✅ · GAP-08/P1S2/runtime-23 = REPORTED (docs) |
| Service Requests | `app/(ops)/service-requests` + `[id]` ✅; TANPA halaman `new` | `service-requests`, `[id]/transitions` (approve/convert via transitions; TANPA rute approve/convert terpisah) | 🔶 | journey: create+convert 200 ✅, assertion FAIL = drift test↔API `sr-service.ts:301` (fix = commit app terpisah) · GAP-09/P1S2/runtime-24 = REPORTED |
| Findings & Inspections | `app/(ops)/field/findings` + `[id]` ✅; `(field)/field/findings/new` ✅ | `findings` ✅, `inspections` ✅; TANPA `inspection-templates` | 🔶 | GAP-10/P1S3 = REPORTED (string `P1S3` nol di `docs/`) |
| Inventory & Parts | `/inventory`, `/inventory/[sku]` | `parts`, `parts/movements` (TANPA `inventory*`, subrute adjust/transactions/stock-take tak terverifikasi) | 🔶 | smoke render ✅ · GAP-11/P1S3 = REPORTED; GAP-11 = force-dispatch (bukan inventory — lihat karantina) |
| Purchasing & GRN | `(ops)/purchasing` + `[id]` + `invoices/[id]` ✅ (+print); TANPA halaman `/grn` | `purchasing`, `[number]`, `[number]/decision`, `/grn`, `/invoices` (TANPA `purchase-orders*`, TANPA `/receive`) | 🔶 | GAP-12/P1S3 = REPORTED |
| Vendors | `/vendors` + `[id]` ✅; TANPA halaman `/vendors/new` | `vendors`, `[slug]` | 🔶 | GAP-13/T4-32 = REPORTED |
| Preventive Maintenance | `preventive-maintenance` + `[id]` ✅ | `preventive-maintenance`, `[id]`, `[id]/generate`, `[id]/toggle` (TANPA `pm-*`) | 🔶 | endpoint generate ADA (perilaku auto-WO belum dibuktikan — lihat G6) · GAP-14 = REPORTED |
| Facilities & Locations | `/facilities` + `[id]` ✅; TANPA halaman `/locations` | `facilities`, `[id]` (TANPA `locations`) | 🔶 | GAP-15/T4-27-28 = REPORTED |
| Reports & Analytics | `/reports` + `[id]` ✅ (klaim jumlah "8/5" tak terverifikasi — dihapus) | `reports`, `reports/aggregates` | 🔶 | GAP-16 = REPORTED |
| Audit Trail | `audit-trail` + `[id]` ✅ (+halaman `audit-logs`) | `audit-trail` (TANPA `audit-logs` API) | 🔶 | GAP-17 = REPORTED |
| Notifications | `/notifications` ✅ (smoke) | `notifications`, `notifications/stream` (SSE; TANPA `[id]`) | 🔶 | smoke render ✅ · klaim "truth map" = REPORTED |
| Organization & Settings | `/organization` (+`users/[id]`) ✅, `/settings` (+`jobs`) ✅ | `organization`, `organization/users/[id]`, `settings` | 🔶 | klaim "truth map" = REPORTED |
| Shifts | TANPA root `/shifts`; ADA `/shifts/plan` (halaman) | `shifts` (+`handovers`...) | ◐ PARTIAL | API ada; halaman root belum; T4-10..13 = REPORTED |
| Auth & Sessions | `(auth)/login` ✅, `(auth)/signup` ✅; TANPA `/mfa-setup`, TANPA `/sessions` (halaman) | `auth/login, logout, mfa, passkeys, session, sessions, signup` | 🔶 | login lolos di E2E journey · Tier-0 = REPORTED |

## Field mobile (`app/(field)`, System B)

| Fitur | Rute | API | Status | Evidence |
|---|---|---|---|---|
| Field work execution | TANPA field home, TANPA `/field/work/[id]` — halaman field aktual: `audits` + `[id]/run`, `findings/new`, `sync` | reuse WO + sync bundle (klaim; TANPA `field/*` API) | 🔶 | GAP-19/runtime-26 = REPORTED |
| Field inspections | `(field)/field/findings/new` ✅, `(ops)/field/findings` + `[id]` ✅; klaim `/field/inspections*` SALAH | `findings`, `inspections` | 🔶 | "audit-map" = REPORTED |
| Offline sync + conflicts | `(field)/field/sync/page.tsx` ✅; klaim `/field/sync` + API `field/sync-bundle`/`pending-ops` TAK TERVERIFIKASI (TANPA `field/*` API) | — | 🔶 | T4-9/runtime-26 = REPORTED |

## Cross-cutting

| Fitur | Status | Evidence |
|---|---|---|
| RBAC 6 role + guards | 🔶 | `lib/auth/rbac.ts` ✅ (KOREKSI: `lib/permissions.ts` TIDAK ADA); UNIT-08 = REPORTED (pemetaan klaim→test belum dipetakan) |
| Audit logging konsisten | 🔶 | GAP-06 = REPORTED (klaim docs; "audit-map" tak terverifikasi) |
| ID display + detail links | 🔶 | GAP-07 = REPORTED (klaim docs) |
| Files/photos upload | 🔶 | TASK-20 = REPORTED (`docs/runtime-verification-task20.md` ada, isi belum dibaca ulang); local→R2 swap = roadmap |
| Billing/subscription | 🔶 | `billing` API ✅ (detail tak dipetakan); "truth map" = REPORTED |
| Telemetry/Logs/Audit-API | 🔶 | `telemetry` ✅, `queue` ✅; TANPA `logs` API; "truth map" = REPORTED |
| Job queue + scheduler | 🔶 | `queue` API ✅ (detail tak dipetakan); "truth map" = REPORTED |
| Print routes | 🔶 | 4 print pages TANPA grup `(print)`: `work-orders/[id]/print`, `purchasing/[id]/print`, `permits/[id]/print`, `badges/[id]/print` (KOREKSI: klaim `(print)` 3 rute SALAH; "truth map" = REPORTED) |

## Kanon data (jangan diubah)

Tenant `APX-NUSA-01`; WO-2026-0894 seal @ AST-HVAC-004; WO-2026-0895 belt @
AST-AHU-012; PART-SEAL-8821 $1,450; 12 SR (4 pending); 9 findings (3 critical).
Sumber: `docs/CANON_DATA.md`, `lib/canon.ts`.
