# GAP-15 — Spec (F11 export-label + F18 runs-badge)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md` F11/F18.

## F11 — Export CSV label overclaim

- Fakta: satu-satunya label overclaim adalah
  `components/inventory/InventoryLedger.tsx:375` — tombol `Export (CSV/XLS)`
  padahal handler `exportCsv` (`:238-245`) hanya menghasilkan CSV dari baris
  termuat (`downloadText('spare-parts-ledger.csv', …)`), tanpa server export.
  Toast provenance sudah jujur (live vs demo).
- Situs lain terverifikasi JUJUR, tak diubah:
  - `PurchaseList.tsx:209` sudah `Export (CSV)`, toast menyebut file CSV nyata.
  - `PurchaseDetail.tsx:207` `Export lines` → Blob `text/csv` nyata + toast jujur.
  - `AuditTrail.tsx:745` `Export CSV / JSON Log` → kedua format benar dihasilkan
    (`audit-ledger.csv` `:629` / `audit-ledger.json` `:631`).
- Fix (1 baris): label tombol → `Export CSV (loaded rows)`.
- Guard-test: `InventoryLedger.tsx` tidak mengandung `CSV/XLS`.

## F18 — Runs INS-0415/0418 dead-end tanpa affordance

- Fakta: kartu queue `AuditQueue.tsx:191-218` me-link semua audit ke
  `/field/audits/${id}/run`, tapi route `run/page.tsx:15` hanya me-render
  `RunChecklist` untuk `id === CANON.inspection` (INS-2026-0412); sisanya
  EmptyState "TODO Fase 2" (200, tanpa affordance di kartu).
- Fix: badge bersyarat di kartu — bila `a.id !== CANON.inspection`, tampilkan
  badge `Phase 2 · run checklist not available yet` (berlaku untuk baris demo
  maupun baris live non-kanon; keduanya memang tak bisa dibuka hari ini).
  Link dipertahankan (bukan disabled) agar EmptyState jujur di route tetap
  terjangkau; tidak ada perubahan route/backend.
- Guard-test: `AuditQueue.tsx` mengandung `Phase 2` dan syarat `CANON.inspection`.

## Non-goals

- Server export full-catalog (DEFER, effort M — lih. F11 decision).
- Rute transfer/adjustment, run checklist untuk non-kanon (butuh product decision).
- Tak ada migrasi, tak ada route baru, tak ada perubahan API.

## Test & runtime

- `npm test` hijau (guard-test GAP-15 baru di `tests/audit-truthfulness.test.ts`).
- `tsc --noEmit` bersih.
- Runtime MCP dev :3145 (m.vance): `/inventory` tombol berlabel baru;
  `/field/audits` badge Phase 2 pada kartu non-kanon bila terlihat (bila live
  list hanya berisi kanon, nyatakan verified-by-construction + guard-test).
