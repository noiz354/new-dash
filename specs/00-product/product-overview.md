# 00-Product — Product Overview (Observed)

> Fakta dari `README.md`, `docs/AUDIT_SAAS_E2E.md`, `docs/INVENTORY.md`, code `app/`.

## Apa itu Aligner / Apex Ops

Platform **Facility Maintenance / CMMS "Apex Ops"**: rebuild UI dari 20 mockup
Stitch (HTML statis + 2 design system) menjadi **app Next.js produksi bertahap**.

- Stack de facto: **Next.js 16 (App Router) + React 18 + Tailwind 3 + Radix +
  lucide-react**, DB **PGlite (Postgres 18 WASM, repo-lokal)** + **Drizzle ORM**,
  validasi **Zod**, auth **scrypt + sesi DB + TOTP MFA RFC 6238 + RBAC 6 role**.
- Rute: 41 pages ops desktop (`app/(ops)`, terhitung) + field mobile
  (`app/(field)`) + `(auth)` login/signup + print routes +
  **61 op backend** (`app/api/**/route.ts`, terhitung sesi ini).
  KOREKSI: grup `(print)` TIDAK ADA; klaim "~28 ops" usang.
- Kanon data: `lib/canon.ts` (keberadaan ADA, isi REPORTED-dari-docs) —
  tenant `APX-NUSA-01`, seal WO-2026-0894 @ AST-HVAC-004 Trane,
  PART-SEAL-8821 $1,450, dsb. (detail REPORTED: `docs/CANON_DATA.md` — ADA).
- DemoBanner global (`components/ops/DemoBanner.tsx` ADA): klaim
  "simulated/demo" eksplisit di bagian yang belum nyata.

## Dua design system (wajib)

- **A (desktop/dispatch)**: canvas `#F8FAFC`, cobalt `#2563EB`, Inter +
  JetBrains Mono, radius 4/8px. Sumber:
  `stitch_facility_maintenance_platform_ui/apex_operational_facility_system/DESIGN.md`.
- **B (field/rugged)**: border tebal, hard shadow, touch 48px, Space Grotesk,
  tombol PASS `#059669` / FAIL `#DC2626`. Sumber: `.../apex_ops_cmms/DESIGN.md`.
- Aturan: A untuk desktop, B untuk `/field/*`. Jangan campur.

## Kondisi aktual (2026-09-19, HEAD d69d793)

- Status per fitur: lihat `00-product/existing-features.md` (ditulis ulang dari
  `find`/`ls` sesi ini — tidak ada baris ✅; semua 🔶/◐ REPORTED-dengan-bukti).
- Wave 3–4 runtime verification: TASK-19 PARTIAL, 20/21/23/24/26 PASS, 25 FAIL
  (REPORTED dari `docs/runtime-verification-*.md`; file ADA, isi belum dibaca
  ulang sesi ini).
- GAP-06..GAP-17 + Tier 0–3 selesai; Tier 4 parsial (4/14); Tier 5–6 backlog
  (REPORTED dari `docs/sdd/` + TODO/PROGRESS).
- Menunggu user/maintainer: aktivasi CI (`.github/workflows`), aset woff2,
  keputusan produk (retention sunset, transfer routes, dsb.).
