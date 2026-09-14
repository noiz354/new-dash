# new-dash — Apex Ops CMMS (demo — Phase 1 berjalan)

> **Status: DEMO dengan backend nyata untuk auth + flow Work Order (Phase 1 slice 1).**
> Database PostgreSQL (PGlite/WASM repo-lokal), auth nyata (scrypt + sesi DB + TOTP MFA +
> RBAC + rate limit), API tervalidasi, dan transisi work order yang **persisten**.
> Layar di luar dashboard/work-order masih menampilkan data kanon statis (jujur berlabel).
> Detail slice: **[`docs/PHASE1_SLICE1.md`](docs/PHASE1_SLICE1.md)** · Audit end-to-end +
> roadmap Phase 0–4: **[`docs/AUDIT_SAAS_E2E.md`](docs/AUDIT_SAAS_E2E.md)**.

Platform **Facility Maintenance / CMMS "Apex Ops"** — rebuild UI dari mockup Stitch
(20 layar, 2 design system) menjadi app Next.js: 28 route (ops desktop + field mobile).

## Quick Start

```bash
npm install
npm run db:setup   # migrasi + seed database demo (idempoten; dev server harus STOP)
npm run dev        # http://localhost:3000 → redirect ke /login
npm test           # 28 unit + integration test (PGlite temp, aman paralel dgn dev)
npm run typecheck  # tsc --noEmit
npm run build      # next build
npm run db:reset   # wipe + setup ulang database demo
```

Login demo: `m.vance@apexops.io` / `demo-pass-4821` (sudah pre-filled) → **Continue** →
kode MFA 6 digit ditampilkan sebagai *dev hint* di layar (TOTP RFC 6238 nyata; hint mati
otomatis di production build). Sesi persisten di database — refresh/restart tidak me-reset.

## Struktur Repo

| Path | Keterangan |
|---|---|
| `app/` | Next.js App Router — `(ops)` desktop shell, `(field)` mobile shell, `(auth)` login, `app/api/*` (7 route JSON) |
| `middleware.ts` | Gate murah: tanpa cookie sesi → `/login` (verifikasi sebenarnya di layout server) |
| `db/` | `schema.ts` (16 tabel multi-tenant Drizzle), `client.ts` (PGlite), `seed.ts`/`setup.ts`/`reset.ts`, `migrations/` (SQL, committed) |
| `lib/auth/` | scrypt password, TOTP RFC 6238, RBAC 6 role, rate limit, sesi DB + cookie |
| `lib/api/`, `lib/services/`, `lib/domain/` | Envelope HTTP + guard, service transaksional (auth, WO, idempotency), state machine WO + error domain |
| `tests/` | `npm test` — unit (domain/auth) + integration (PGlite temp: auth, isolasi tenant, lifecycle WO, idempotency) |
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
