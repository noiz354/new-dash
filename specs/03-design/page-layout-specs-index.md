# Page-Layout Specs Index (Missing-Pages Backlog)

> Jembatan antara second-pass audit dan implementasi.
> Sumber: `stitch_facility_maintenance_platform_ui/screen-audits/page-layout-specs/` (25 file:
> README + 24 spec halaman) + `screen-audits/second-pass-summary.md`.
> Rekonsiliasi: "24 missing pages (P0:5, P1:9, P2:7)" di second-pass + P3:3 = **24 spec** — cocok 1:1. ✅

## P0 (5) — eksekusi inti rusak/tidak ada

| Spec | Target halaman |
|---|---|
| p0-action-result-audit-handoff | status hasil action + handoff audit |
| p0-mobile-finding-capture | capture temuan mobile (first-class page, bukan fragmen tab) |
| p0-new-dispatch-create-work-order | alur create-dispatch / create-WO lengkap |
| p0-purchase-detail-coverage | detail purchase |
| p0-work-order-detail-coverage | detail work order |

## P1 (9) — detail/history per entitas

p1-audit-event-detail-proof · p1-facility-room-detail · p1-inventory-sku-detail ·
p1-notification-target-resolver · p1-pm-plan-detail-create-edit · p1-report-dossier-detail ·
p1-service-request-detail-coverage · p1-settings-job-history · p1-user-detail-role-history

## P2 (7) — cakupan dokumen & serah-terima

p2-asset-and-bim-coverage · p2-asset-document-detail · p2-purchase-invoice-match-result ·
p2-saved-search-filter-views · p2-shift-handover-detail · p2-vendor-detail-coverage ·
p2-vendor-document-msa-detail

## P3 (3) — cetak & galeri state

p3-badge-qr-print-library · p3-component-state-gallery · p3-print-work-permit

## Aturan pakai

- Spec di folder `page-layout-specs/` adalah HISTORICAL backlog — jangan edit.
- Setiap item yang diimplementasikan: catat route + commit di feature spec domain terkait
  (`specs/02-features/<domain>/tasks.md`) dan tandai di `specs/05-roadmap/roadmap.md`.
- Temuan baru (di luar 24 ini) masuk sebagai gap baru di `specs/04-quality/known-gaps.md`.
