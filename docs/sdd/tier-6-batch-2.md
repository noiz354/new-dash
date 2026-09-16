# Tier 6 — Batch 2 Aset & Resource (45 PROMOTE + 11 (U))

> Detail triase: `docs/triase-batch-2-aset.md`. Dependensi kanon (WO seal ganda,
> OEM Trane vs Daikin, skor 68/88/88,4, harga PART-SEAL-8821, bin CRIB-B vs
> SUB-LCK-4B, MSA 312d vs 288d, label WO-0894 vs WO-2026-0894) TIDAK diputus di sini.

## Asset Registry (6)

- Flow + konfirmasi Decommission (guard: WO open memblokir, audit).
- Flow + modal Transfer Loc (mutasi lokasi persist + audit).
- Modal Register New Asset + POST (validasi server, numbering bila ada).
- Batch QR Print massal/satuan (QR = kode nyata, print terverifikasi).
- Export async job (Compiling→Ready, FAILED+Retry — pola batch 3 Reports).
- Filter/pagination → query params (`?q=`, `Page 1 of 308` sinkron dengan URL).

## Asset Detail (14)

- Sub-tab IoT Diagnostics / PM Schedules / Compliance & Docs (data nyata atau empty jujur).
- Dossier PDF 360°; export full ledger + hash (hash = verify-chain nyata, bukan karangan).
- Guardrail Issue-to-WO saat SKU DEFICIT (blokir + pesan jujur).
- Modal Quick Dispatch + Log Inspection; modal Add SKU to BOM; flow +PR Request baris kritis; flow +Quick PO.
- Warehouse scope toggle; pill filter timeline; badge telemetri STALE/reconnect (jujur).

## Inventory (6)

- POST mutasi idempoten (`Idempotency-Key` server-side, kini lokal).
- Verifikasi PIN approver NYATA (kini hardcoded `2468` — ganti step-up TOTP pola GAP-3, hapus 2468 total).
- Approval khusus saat available → 0.
- Rute detail `transfers/[id]` + `adjustments/[id]` (keputusan: bangun backend ATAU out-of-scope eksplisit + hapus link — terkait F12).
- Prefill Draft PO (`?sku=`); link PM-PLN-0104 (perbaiki/ganti ref valid).

## Purchasing (6)

- POST nyata authorize/GRN (kini simulasi fase — sambungkan ke service GAP-9).
- Modal + validasi Create PR/PO; backend Flag Discrepancy / Reject / RFQ.
- Guard mismatch qty + envelope tak cukup (server-side).
- Rute detail GRN-9941; job export CSV/Audit + print batch.

## Vendors (6)

- Flow + modal Onboard vendor/MSA + approval; flow + modal Initiate Amendment.
- Modal Dispatch prefill `?vendorId=`; countdown renewal single-source (selisih 312d vs 288d DILURUSKAN ke satu sumber).
- Aksi Commendation; dossier + export compliance.
- Footer Sync Oracle ERP gagal + Retry (jujur); viewer MSA PDF gagal + unduh langsung.

## (U) 11 — verifikasi saat implementasi

Prefill WO/PM dari drawer registry; tombol copy tag + fallback; referensi gantung WO/PO/TO/ADJ; link simbol CHILLER #04; klik node tree spasial; polling feed inventory + badge hash; Print QR rak-bin; Expiry Ledger inline vs halaman; empty state direktori; `tel:` Direct Ring.
AC: tiap (U) → DONE-semu (bukti) atau dikerjakan penuh.

## Verdict batch

45 + 11 (U) berverdict + PIN 2468 musnah total (grep nol) → Batch 2 CLOSED.
