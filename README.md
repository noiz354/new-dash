# Facility Maintenance Platform UI — Apex Ops (Stitch Export)

Mockup UI statis (Stitch) untuk platform **Facility Maintenance / CMMS "Apex Ops"**:
20 layar HTML + screenshot + 2 design system. Ini **referensi visual**, bukan aplikasi jadi.

## Isi Repo

| Path | Keterangan |
|---|---|
| `stitch_facility_maintenance_platform_ui/` | Arsip referensi (JANGAN DIEDIT) — 20 `code.html` + `screen.png`, 2 `DESIGN.md` |
| `docs/INVENTORY.md` | Tabel inventaris 20 layar + ukuran file |
| `AGENTS.md` | Instruksi wajib untuk AI agent |
| `PROGRESS.md` | Status kerja berjalan |
| `TODO.md` | Roadmap fase |
| `stitch_facility_maintenance_platform_ui.zip` | Arsip asli |

## Lihat Mockup

```bash
python3 -m http.server 8000
# contoh: http://localhost:8000/stitch_facility_maintenance_platform_ui/operations_dashboard/code.html
```

Bandingkan tiap `code.html` dengan `screen.png` di folder yang sama.

## Dua Design System

- **A — Apex Operational Facility System** (`apex_operational_facility_system/DESIGN.md`):
  dispatch desktop/command center. Canvas `#F8FAFC`, cobalt `#2563EB`, Inter + JetBrains Mono.
- **B — Apex Ops CMMS** (`apex_ops_cmms/DESIGN.md`):
  field/rugged (tablet sarung tangan). Border tebal, hard shadow, touch target 48px,
  Space Grotesk + tombol PASS/FAIL besar.

## Status

Fase 0 selesai (ekstraksi + dokumen). Fase 1 menunggu **keputusan stack produksi**
(usul default: Next.js + Tailwind + shadcn). Detail: `TODO.md`, `PROGRESS.md`.
# new-dash
