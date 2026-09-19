# 01-Architecture — Navigation Map (Observed)

> Sumber: `find app -name page.tsx` (52 file, 2026-09-19). Hanya direktori
> dengan `page.tsx` yang dicantumkan. Klaim versi lama (`/dashboard`, `/ops`,
> `/requests`, `/findings`, `/inspections`, `/templates`, `/schedule`, `/grn`,
> `/locations`, `/audit`, `/sessions`, `/field` home, `/field/work/*`,
> `/mfa-setup`, grup `(print)`) = FABRIKAN, DIHAPUS.

## Desktop `(ops)` — root + pages

`/` (ops root) · `/assets` + `[id]` (+`bim`, +`documents/[docId]`) ·
`/audit-logs` · `/audit-trail` + `[id]` · `/facilities` + `[id]` ·
`/field` + `/field/findings` + `[id]` · `/field-inspections` + `new` + `[id]` ·
`/inventory` + `[sku]` · `/notifications` · `/organization` + `users/[id]` ·
`/preventive-maintenance` + `[id]` · `/profile` · `/purchasing` + `[id]` +
`invoices/[id]` · `/reports` + `[id]` · `/service-requests` + `[id]` ·
`/settings` + `jobs` · `/shifts/plan` SAJA (TANPA root `/shifts`) ·
`/ui-patterns` · `/vendors` + `[id]` + `contracts/[id]` ·
`/work-orders` + `new` + `[id]`.

## Field `(field)` — System B (TANPA home)

`field/audits` + `[id]/run` · `field/findings/new` · `field/sync`.
TIDAK ADA: `/field` home, `/field/work/*`, `/field/inspections*`.

## Auth + print + offline (di luar grup ops)

`(auth)/login` · `(auth)/signup` (TANPA `/mfa-setup`) ·
`app/offline` (fallback + outbox, lihat G12) ·
print TANPA grup: `work-orders/[id]/print` · `purchasing/[id]/print` ·
`permits/[id]/print` · `badges/[id]/print`.

## Temuan navigasi (dari screen-audits)

Active-nav salah/highlight ganda di beberapa halaman; artefak bottom-nav mobile
di desktop; inkonsistensi shell antar layar Stitch (catat, jangan diam-diam
diperbaiki — lihat `03-design/screen-audits.md`).
KOREKSI: ref lama ke `03-design/screen-mapping.md` — file itu TIDAK ADA.
