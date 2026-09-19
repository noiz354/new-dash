# Purchasing & GRN — Tasks

> REVISI P2 (2026-09-19): versi lama memakai path `src/...` + endpoint
> `/api/pos*` yang TIDAK ADA. Status jujur: file ADA, isi/logika = REPORTED.

## T1 — Procurement service (file ADA, isi REPORTED)

- [x] `lib/services/procurement-service.ts` (keberadaan ADA; create PO, GRN, update stok = REPORTED)
- [🔶] Unit test procurement — `npm test` 182/182 ✅ global, pemetaan file test belum dipetakan
- [🔶] Validasi Zod di API routes — REPORTED

## T2 — PO lifecycle (file ADA, semantik REPORTED)

- [x] GET/POST `app/api/purchasing/route.ts` (file ADA)
- [x] `app/api/purchasing/[number]/decision/route.ts` (file ADA; DRAFT→ORDERED→PARTIAL→RECEIVED = REPORTED)
- [x] UI list + detail + print (file ADA; klaim badge "mock" G14 = REPORTED)

## T3 — GRN flow (file ADA, semantik REPORTED)

- [x] `app/api/purchasing/grn/route.ts` (file ADA; terima sebagian/penuh = REPORTED)
- [🔶] Update stok part otomatis saat GRN — REPORTED (klaim Closure T3-15)
- [🔶] Batch tracking per GRN line — REPORTED

## T4 — Vendor context (REPORTED)

- [🔶] Link PO ke vendor, vendor scorecard parsial (klaim SDD T3-12)

## T5 — Sisa (backlog)

- [ ] GRN approval workflow terpisah — selain status PO (§6 product-requirements)
- [ ] Bulk GRN multi-PO sekaligus (§6)
- [ ] Audit trail GRN adjustments — sekarang hanya snapshot (REPORTED)
- [ ] Vendor performance dashboard penuh — REPORTED dari docs
- [ ] Integrasi goods-issue lapangan (permintaan dari Closure T3-15 — REPORTED)
