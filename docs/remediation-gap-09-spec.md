# GAP-09 Spec — Purchasing wire list/detail/GRN → po-service (F13)

Source: `docs/audit-non-e2e-remediation-map.md` §F13 (decision: MUST INTEGRATE, big-rock-lite M/L, target END-TO-END).
Status audit: BROKEN — endorse/GRN-9941/match/RFQ toast tanpa 1 request; `po-service` + routes + DB + idempotency nganggur; break di component→API.

## G9.0 Temuan audit (ringkas)

- Backend NYATA: `listPurchases` / `getPurchase` / `createRequisition` / `postGoodsReceipt` (`lib/services/procurement-service.ts`); routes `GET+POST /api/purchasing` (perm `po.read` / `po.approve`), `POST /api/purchasing/grn` (perm `inventory.mutate`, idempoten); DB `purchaseOrders` / `poLineItems` / `goodsReceiptNotes`; seed 7 dokumen (semua ID SEED UI ada di DB).
- GAP-SIAP-WIRE: (a) TAK ADA endpoint approve/reject — status `PENDING_APPROVAL` tak bisa bergerak; (b) TAK ADA GET single (hanya list+filter); (c) `POST grn` TAK WAJIBKAN `stepUpCode` — inkonsisten dengan kebijakan GAP-3 (mutasi stok RECEIVE tanpa TOTP, `stepUpAt=null` di audit); (d) nomor GRN `Math.random` 4-digit (collision-prone) padahal onboarding sudah niatkan sekuens `GRN` — tapi `SequenceEntity` tak memuat `'GRN'` dan `seedAll` tak men-seed barisnya; (e) `postGoodsReceipt` tak validasi PO ada / kind PO.
- UI: `PurchaseList` (SEED + create lokal + export CSV lokal — export-nya nyata-lokal), `PurchaseDetail` (`KNOWN_DOCS` + `resolveDoc` fabrikasi generik + endorse/postGrn/runMatch `setTimeout`), `dialogs.tsx` (Auth/RFQ/Reject/Dispute — Auth berlabel "local simulation", Reject klaim "logged to audit trail" palsu).
- Kontrak form: dialog New Requisition hanya title/vendor/amount — API wajib `lineItems[]`. Dialog tak bisa dipetakan 1:1 tanpa tambah field SKU/qty/harga.

## G9.1 Backend (baru/diubah)

1. `SequenceEntity` += `'GRN'` (`lib/services/sequence.ts`); `seedAll` += baris `{ ORG, 'GRN', year, nextVal: 1 }` → nomor `GRN-YYYY-NNNN` via `nextNumber` di `postGoodsReceipt` (ganti `Math.random`). Repair dev DB: insert baris GRN manual via tsx saat dev stop (terdokumentasi di PROGRESS, bukan migrasi — sequences = data).
2. `decidePurchase(db, ctx, number, { decision, reason?, idempotencyKey?, requestId? })` di procurement-service:
   - GET doc (tenant-scoped) → 404 `PURCHASE_DOCUMENT` bila tak ada.
   - Guard terminal: status `APPROVED|DISPATCHED|RECEIVED|REJECTED` → 409 `ALREADY_DECIDED`; sumber sah hanya `PENDING_APPROVAL|CREATED`.
   - APPROVE → status `APPROVED`; REJECT → wajib `reason` min 3 (400 `REASON_REQUIRED` — pola inventory ADJUST) → status `REJECTED`.
   - Audit transaksional `PO_APPROVE` / `PO_REJECT` (actor + after `{ status, reason? }`); idempoten via `withIdempotency` scope `procurement.decision`.
   - Copy jujur: TIDAK ada transmit EDI — approve = persetujuan tercatat, dispatch tetap manual (out-of-scope: integrasi EDI).
3. `POST /api/purchasing/[number]/decision/route.ts` (baru): zod `{ decision: enum APPROVE|REJECT, reason?: max 300 }`; perm `po.approve`; teruskan Idempotency-Key.
4. `GET /api/purchasing?number=` — saring `number` di `listPurchases` (tanpa file route baru); tak ketemu → 404 `PURCHASE_DOCUMENT` (detail butuh 404 jujur, bukan `resolveDoc` fabrikasi).
5. `POST /api/purchasing/grn`: tambah `stepUpCode` (regex 6-digit, pola movements route) → `verifyStepUpCode` → teruskan `stepUpAt` ke `postGoodsReceipt` → `mutateStock` (audit `PART_RECEIVE.after.stepUpAt` terisi — konsisten GAP-3).
6. `postGoodsReceipt`: validasi PO ada (404) + `kind === 'PO'` (422 `WRONG_DOCUMENT_KIND`); pertahankan update status `RECEIVED` + kopling `mutateStock` + `DUPLICATE_RECEIPT` 409 + idempotency `procurement.grn`.

## G9.2 Frontend (di-wire)

- `PurchaseList`: fetch `GET /api/purchasing?limit=100` saat mount; skeleton saat load; banner jujur + aksi disabled saat gagal/`403`; SEED dipertahankan sebagai fallback demo ber-badge (pola GAP-3); KPI dihitung dari baris termuat (live) / hardcode + `(demo)` saat fallback; New Requisition tambah field SKU + qty + unit price → `POST /api/purchasing` (201 → prepend baris server + toast nomor nyata; error → toast jujur). Filter/search/kind/status tetap client-side. Export CSV tetap lokal (label di GAP-15).
- `PurchaseDetail`: fetch `GET /api/purchasing?number=<id>`; loading skeleton; 404 → state jujur "not found" (hapus `resolveDoc`); tab review dari data server (title/vendor-slug/amount/status/line-items; requestor/carrier/waybill fiktif DIHAPUS).
- `endorse` → hapus (diganti AuthDialog yang di-wire); `postGrn` → form receiving (waybill wajib + sku default line-1 + qty + dock + stepUpCode 6-digit) → `POST grn` → tampil nomor GRN server + refetch doc; `runMatch` → honest placeholder disabled (tak ada backend invoice-match; di luar F13).
- `AuthDialog(docId, status, onDecided)`: confirm → `POST decision {APPROVE}` → toast `APPROVED — tercatat; EDI auto-dispatch tidak tersambung, dispatch manual`; doc non-pending → tombol disabled + state jujur.
- `RejectDialog(docId, onDecided)`: reason wajib → `POST decision {REJECT, reason}` → klaim "logged to audit trail" menjadi BENAR (server audit `PO_REJECT`).
- `RfqDialog` / `DisputeDialog`: tetap lokal + copy jujur ("logged locally — no vendor integration"); hilangkan hardcode ID spesifik via props.
- Tab signatures: nama signer fiktif DIHAPUS → tampil status keputusan + catatan "full chain in audit trail".

## G9.3 Test (`tests/integration.test.ts`, pola service-level)

1. PR create happy → nomor `PR-YYYY-NNNN` + audit `PR_CREATE` + tenant-isolasi (decoy tak terlihat).
2. PR validasi → 400-ish (lineItems kosong) — via service? (service tak validasi; cukup route-level? pilih: tambah guard min-1 di service → DomainError 400 `LINE_ITEMS_REQUIRED`).
3. Approve happy (doc `PO-2026-0315` seed `PENDING_APPROVAL`) → `APPROVED` + audit `PO_APPROVE`; replay idempoten (key sama, tanpa audit ganda).
4. Approve ganda (tanpa key baru? status terminal) → 409 `ALREADY_DECIDED`.
5. Reject tanpa reason → 400; reject happy → `REJECTED` + audit.
6. GRN happy (PO-2026-0298 + seal SKU, stepUp TOTP admin) → GRN `GRN-YYYY-NNNN` + stok +qty + `PART_RECEIVE.after.stepUpAt` terisi + PO → `RECEIVED`.
7. GRN stepUp salah → 403 `STEP_UP_INVALID`; GRN PO tak ada → 404; GRN SKU tak ada → 404 `PART`; GRN ke PR → 422 `WRONG_DOCUMENT_KIND`.

## G9.4 Di luar GAP-09 (eksplisit)

RFQ backend, dispute endpoint, 3-way-match engine, transmit EDI, vendor-name lookup (F14), export-server (GAP-15), transfer/runs routes (GAP-16).

## G9.5 Acceptance runtime (MCP dev :3145, m.vance)

`/purchasing` list live → New Requisition via UI → 201 → detail doc baru → Approve via dialog → RECEIVING tab POST GRN + TOTP → GRN server tampil + stok ledger bertambah + reload persist → 0 console error.
