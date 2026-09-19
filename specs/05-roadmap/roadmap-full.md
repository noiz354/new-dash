# Roadmap Full (Detail Tier)

> Sumber: `docs/sdd/` + TODO.md + PROGRESS.md. Status per unit mengikuti file sumber (bukan klaim baru).
> KOREKSI PATH (sesi ini): awalan `src/` di bawah TIDAK ADA di repo —
> struktur aktual: `db/` (schema/seed/migrations), `lib/` (services/auth/api),
> `components/`, `app/`. Jalur `src/...` = REPORTED-dari-docs historis.

## Tier 0 — Bootstrap ✅

- Struktur Next.js + Tailwind + shadcn-style `components/ui/` (KOREKSI: `src/components/ui/` TIDAK ADA)
- `globals.css`, layout root, AppShell awal

## Tier 1 — Foundation ✅

- Drizzle schema + PGlite (`db/` — KOREKSI: `src/db/` TIDAK ADA)
- Auth (`lib/auth/*` — KOREKSI: `src/lib/auth.ts` mock TIDAK ADA), login/signup pages
- Seed data (`db/seed.ts` — KOREKSI: `src/db/seed*.ts` TIDAK ADA)

## Tier 2 — Core Ops ✅

- Work orders CRUD + state machine + tests
- Service requests CRUD + conversion + tests
- Inspections + checklist + PASS/FAIL + tests
- Inventory CRUD + stock service + tests

## Tier 3 — Extended ✅ (dengan catatan)

- T3-12 vendors + scorecard (parsial)
- T3-13 PO + print (done)
- T3-14 GRN receive (done, klaim stok auto-update 🔶)
- T3-15 Closure audit (klaim besar, sebagian 🔶)
- PM, reports, facilities, audit-log pages (skeleton 🔶)

## Tier 4 — Field + Quality 🔶 4/14

- T4-11 field inspection execution desk (done, diklaim)
- T4-13 packaging & PWA (done, diklaim)
- T4-14 shortfall analysis (done, diklaim)
- T4-15 truthfulness tests (done, diklaim)
- T4-16 field QA + inventory verification (done, diklaim)
- T4-17..T4-26 — belum dikerjakan

## Tier 5 — Hardening ❌ backlog

## Tier 6 — Expansion ❌ backlog
