# Purchasing & GRN — Verification

> REVISI P2 (2026-09-19): tabel versi lama FABRIKAN — semua path `src/...`
> (`src/services/`, `src/app/api/pos*`, `src/app/(app)/ops/*`,
> `src/app/print/*`) TIDAK ADA di repo. DIHAPUS, diganti bukti nyata.

## Bukti implementasi (observed sesi ini)

| Klaim | Bukti | Status |
|---|---|---|
| Service procurement ada | `lib/services/procurement-service.ts` (`ls`, isi belum dibaca) | 🟢 file ADA |
| API purchasing | `app/api/purchasing/route.ts`, `[number]/decision/route.ts`, `grn/route.ts`, `invoices/route.ts` | 🟢 ADA |
| UI purchasing | `app/(ops)/purchasing/page.tsx`, `[id]/page.tsx`, `invoices/[id]/page.tsx`, print `app/purchasing/[id]/print/page.tsx` | 🟢 ADA |
| Stok auto-update saat GRN | klaim Closure T3-15 | 🔶 REPORTED |
| Vendor scorecard | klaim SDD T3-12 | 🔶 REPORTED |
| Unit test procurement | `npm test` 182/182 ✅ (pemetaan butir→file belum dipetakan) | 🔶 REPORTED per-butir |

## Yang belum dibuktikan

- [ ] GRN parsial multi-batch — baca ulang service + `grn/route.ts` sebelum klaim penuh
- [ ] Tidak ada e2e purchasing — smoke sesi ini tidak mencakup PO→GRN
- [ ] Vendor performance metrics — REPORTED dari docs
- [ ] TIDAK ADA API `purchase-orders*`, `receive*`, `grn/[id]`; TIDAK ADA page `/grn`
