# GAP-17 — Spec (F12 hapus refs transfer/adjust fiktif — TASK 2 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F12. Keputusan produk (final): **hapus refs fiktif** — TANPA membangun backend
transfer/adjustment (out-of-scope eksplisit).

## 1. Fakta audit (dibaca langsung)

- `components/inventory/InventoryLedger.tsx:46-47` — dua-satunya `MOV_SEED`
  entri fiktif (fallback feed yang juga ikut ter-render SSR/HTML saat server
  up, sebelum fetch `/api/parts/movements` selesai):
  - `:46` `TRF-2026-0044` — delta `+5 ea [TRF]`, detail
    `North Depot → Central · Internal Courier #02 · waybill #772`
    (PART-VALV-GT2). Dokumen transfer tak pernah ada/routenya TAK ADA.
  - `:47` `ADJ-2026-0019` — delta `−2 pcs [ADJ]`, detail
    `Terminal pin defect · scrap write-off VP Operations · cc:QA-SCRAP`
    (PART-FUSE-600V). Adjustment doc tak pernah ada.
- `MOV_SEED` sisa (3 entri) semuanya **resolvable sebagai link** oleh cabang
  render `:564-573` (`m.doc === CANON.workOrderSeal` → WO link;
  `startsWith(CANON.purchaseOrder)` → purchasing link; `startsWith(CANON.pmPlan)`
  → PM link) — acceptance "ledger hanya menampilkan ref yang resolvable".
- Perilaku cabang render: entri `TRF-`/`ADJ-` jatuh ke teks biasa — *dipertahankan*
  untuk refs non-link yang sah dari server (langkah-1 PROMPT eksplisit).
- Klaim `waybill` di `PurchaseDetail.tsx` + `procurement-service.ts` = field GRN
  NYATA ber-backend (tabel goods receipts) — BUKAN scope penghapusan.
- `REASONS[0..3]` ('Transfer to Sub-Warehouse…', 'Scrap / Damaged…', dst.) =
  opsi form mutation desk yang POST ke `/api/parts/movements` NYATA (type
  `ISSUE`/`ADJUST` server) — bukan refs dok fiktif, **tidak disentuh**.
- `MovKind` `'ADJ'|'TRF'` + tab `Adjust`/`Transfers` + pewarnaan badge = masih
  sah untuk baris server future; empty-state jujur
  `No movements in this bucket yet.` — **tidak disentuh**.
- Grep `TRF-\d|ADJ-\d` seluruh `components/`, `app/`, `lib/` → hanya 2 baris di
  atas. **[Koreksi saat implementasi]** re-grep non-filter menemukan **situs
  ke-2**: `app/(ops)/inventory/[sku]/page.tsx:64` — baris `TXN-811` statis
  (`type: 'CYCLE_ADJUST', ref: 'ADJ-2026-Q1'`, qtyDelta 0, plain-text tanpa
  `refUrl`) di halaman detail SKU hardcoded (page masih era desain: `SKU_DATA`
  const, nol API). Decision task: baris fiktif itu **dihapus** (sama-sama
  "ADJ-… ref ke dokumen tak ada" — acceptance identical). Ref lain di halaman
  (PO-/WO-…) = pola link resolvable → bukan scope F12, tak disentuh.
- Hits `TRF-2026-0044`/`ADJ-2026-0019` di `docs/` = catatan audit historis
  (diizinkan PROMPT langkah-3).

## 2. Perubahan

1. Hapus kedua baris dari `MOV_SEED` (`InventoryLedger.tsx:46-47`) — nol
   pengganti. Feed fallback kini 3 entri kanon yang semuanya me-link.
2. Guard-test baru `tests/audit-truthfulness.test.ts` (pola GAP-15: baca file
   komponen, assert): absent `TRF-`, `ADJ-`, `Internal Courier #02`,
   `waybill #772`, `cc:QA-SCRAP` (angka/doc refs + teks pendukung fiktif tak
   boleh kembali); present: `MOV_SEED` masih ada sebagai fallback berlabel
   (Live/Demo badge sudah jujur) dan ketiga cabang link kanon
   (`CANON.workOrderSeal`, `CANON.purchaseOrder`, `CANON.pmPlan`) tetap.
3. Tak ada migrasi/route/izin/API baru; tak ada perubahan backend.

## 3. Test

- `npm test` hijau (guard-test GAP-17 baru ikut suite
  `tests/audit-truthfulness.test.ts`); `npx tsc --noEmit` bersih.
- Runtime dev :3157: `GET /inventory` (dengan sesi seed) → HTML SSR (feed
  fallback pra-hidrasi) TIDAK memuat `TRF-`/`ADJ-`/`waybill #772`/`QA-SCRAP`
  dan MEMUAT refs kanon; `GET /api/parts/movements` (sesi seed) → feed server
  tanpa ref fiktif. Tanpa sesi → 401/redirect (guard tak berubah).

## 4. Docs (commit yang sama)

- `docs/audit-non-e2e-remediation-map.md` F12 → `[CLOSED GAP-16 TASK 2]` +
  baris Master Table #12.
- `TODO.md` — butir dead-end transfers/adjustments → keputusan final (refs
  dihapus; rute deferred eksplisit out-of-scope) + status GAP-16 2/7.
- `PROGRESS.md` — entri GAP-16 TASK 2; backfill hash TASK 1 di tabel
  Pelacakan `2026-09-16-PROMPT.md` + TASK 2 DONE.

## Non-goals

- Tabel `transfers`, rute `/inventory/transfers|adjustments`, dok nomor canon
  TRF-/ADJ- (keputusan produk: tanpa backend transfer).
- Perubahan `MovKind`/tabs/badge — dipertahankan untuk pemakaian sah.
