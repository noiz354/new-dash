# new-dash — Apex Ops CMMS (design prototype)

> **Status: PROTOTIPE UI / DEMO — bukan SaaS produksi.**
> Tidak ada backend, API, database, auth, billing, worker, maupun integrasi apa pun.
> Semua data **simulasi hardcoded** dan **tidak ada yang persisten** (refresh = kembali ke awal).
> Banner "DEMO PROTOTYPE" tampil global di aplikasi. Audit end-to-end lengkap (verdict,
> scorecard readiness, roadmap Phase 0–4): **[`docs/AUDIT_SAAS_E2E.md`](docs/AUDIT_SAAS_E2E.md)**.

Platform **Facility Maintenance / CMMS "Apex Ops"** — rebuild UI dari mockup Stitch
(20 layar, 2 design system) menjadi app Next.js: 28 route demo (ops desktop + field mobile).

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000 — banner DEMO selalu tampil
npm run typecheck  # tsc --noEmit
npm run build      # next build (static/SSG)
```

Login demo: kredensial apa pun (pre-filled) → kode MFA statis `482916` (dicetak di layar).
Tidak ada session yang dibuat — ini simulasi UI, lihat audit §E.

## Struktur Repo

| Path | Keterangan |
|---|---|
| `app/` | Next.js App Router — `(ops)` desktop shell, `(field)` mobile shell, `(auth)` login |
| `components/` | Komponen React; design system **A** (desktop/dispatch) & **B** (field/rugged) |
| `lib/canon.ts` | Kanon data (sumber tunggal ID/harga/persona/tenant `APX-NUSA-01`) |
| `web/` | Prototipe HTML standalone (arsip Fase B–E; wiring `hx-*` menunjuk API yang **tidak ada**) |
| `stitch_facility_maintenance_platform_ui/` | Arsip mockup Stitch — **BEKU, JANGAN DIEDIT** |
| `docs/` | Audit & spesifikasi: `AUDIT_SAAS_E2E.md`, `CANON_DATA.md`, `ui-audit/` (20 layar × 2 pass), dll. |
| `ci/ci.yml` | Workflow CI **siap pakai** (typecheck + `npm audit` prod high+ + build) — aktivasi: salin ke `.github/workflows/ci.yml` (lihat header file; butuh permission `workflows`) |

## Stack

Next.js 16 (App Router, static/SSG) · React 18 · Tailwind 3 · Radix UI · lucide-react.
Font via system stack sementara (self-host woff2 masih TODO Fase 1 — lihat `PROGRESS.md`).

**Sengaja tanpa backend** (Phase 0). Rencana pembangunan produk nyata (auth, DB multi-tenant,
API, billing, observability): `docs/AUDIT_SAAS_E2E.md` §K — Phase 1 dst.

## Lihat Mockup Referensi

```bash
python3 -m http.server 8000
# contoh: http://localhost:8000/stitch_facility_maintenance_platform_ui/operations_dashboard/code.html
```

Bandingkan tiap `code.html` dengan `screen.png` di folder yang sama.

### Dua Design System

- **A — Apex Operational Facility System** (`apex_operational_facility_system/DESIGN.md`):
  dispatch desktop/command center. Canvas `#F8FAFC`, cobalt `#2563EB`, Inter + JetBrains Mono.
- **B — Apex Ops CMMS** (`apex_ops_cmms/DESIGN.md`):
  field/rugged (tablet sarung tangan). Border tebal, hard shadow, touch target 48px,
  Space Grotesk + tombol PASS/FAIL besar.

Aturan kerja agent: `AGENTS.md` · Status kerja: `PROGRESS.md` · Roadmap fase: `TODO.md`.
