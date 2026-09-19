# Aligner — Canonical Specs (Sumber Tunggal Terstruktur)

> Consolidation pass 2026-09-19. Branch `arena/tier4-cd-new-dash`, HEAD `d69d793`.
> Baseline = **implementasi existing**, bukan aplikasi baru.
> Fakta observasi dipisahkan dari usulan (usulan → `05-roadmap/`).

## Cara baca

1. Mulai: `00-product/product-overview.md` → `existing-features.md` (inventarisasi kanonis + status).
2. Arsitektur aktual: `01-architecture/`.
3. Per domain: `02-features/<domain>/{spec,implementation,tasks,verification}.md`.
4. Desain & screenshot: `03-design/`. Kualitas & submission: `04-quality/`.
5. Sisa kerja: `05-roadmap/`. Keputusan & migrasi docs: `06-history/`.

## Hubungan dengan docs existing (tidak diduplikasi buta)

| Sistem | Peran | Lokasi |
|---|---|---|
| `specs/` (ini) | Spesifikasi kanonis per fitur + traceability | `specs/` |
| SDD eksekusi per tier | Spec eksekusi ±200 unit + verdict runtime | `docs/sdd/` (`00-master-spec.md` + tier-0..tier-6) |
| Slice & remediation specs | Bukti implementasi per slice/gap | `docs/PHASE1_SLICE1.md`, `docs/PHASE1_SLICE3.md` (SLICE2 TIDAK ADA), `docs/remediation-gap-*-spec.md` |
| Audit evidence | Audit UI 2-pass, screen-audits, second-pass, runtime-verification | `docs/ui-audit/`, `stitch_facility_maintenance_platform_ui/screen-audits/`, `docs/runtime-verification-*.md` (task19,20,21,23,24,25,26 + wave-3-4). KOREKSI: truth-map `audit-saas`/`ui` FABRIKAN — jangan dikutip |
| Roadmap operasional | Backlog eksekusi harian | `TODO.md` (+ `PROGRESS.md` log) |
| Permintaan konsolidasi | Dokumen sumber pesan user 2026-09-19 | `docs/CONSOLIDATION-PLAN-2026-09-19.md` |

`specs/` menunjuk ke dokumen di atas sebagai evidence; tidak me-rewrite implementasi.
Original `.md` **tidak dihapus** di pass pertama (lihat `06-history/documentation-migration.md`).

## Status konsolidasi

- Pass 1 (2026-09-19): 5 domain penuh (work-orders, service-requests,
  findings-inspections, inventory-parts, purchasing-grn) + kerangka
  produk/arsitektur/desain/kualitas/roadmap/history.
- Split 4-file untuk domain lain (vendors, PM, facilities, reports,
  audit-trail, notifications, organization, settings, shifts, auth, billing,
  telemetry, queue) = backlog `05-roadmap/implementation-plan.md`.
- Skill eksternal: **tidak diinstal** (butuh otorisasi; lihat `06-history/decisions.md`).
