# 01-Architecture — Domain Model (Observed)

> Sumber: `db/schema.ts` (KOREKSI: `lib/db/schema.ts` TIDAK ADA; isi belum
> dibaca), `lib/canon.ts` (ADA), services `lib/services/`.

## Entitas inti

- **Tenant/Org** (`APX-NUSA-01` demo) → memisahkan semua data operasional.
- **User + Session + Role** (6 role) + MFA TOTP.
- **Asset** (`AST-HVAC-004` Trane / `AST-AHU-012` Daikin) + lokasi + riwayat.
- **WorkOrder** (WO-2026-0894/0895): status draft→open→assigned→in_progress→
  on_hold→completed→closed (+cancelled), prioritas, SLA, assignee, parts.
- **ServiceRequest** (12; 4 pending): submitted→approved/rejected→converted→WO.
- **Finding** (9; 3 critical) → konversi WO; **Inspection** template-driven.
- **Part** (PART-SEAL-8821 $1,450) + transaksi FIFO + stock-take + cycle-count.
- **PurchaseOrder → GRN**: draft→sent→approved→partial→received; GRN receive→stock.
- **Vendor, PM schedule, Shift + handover, Notification, AuditLog**.

## State machines (di service, bukan UI)

- WO: `lib/services/wo-service.ts` — transisi tervalidasi + guard destruktif
  (KOREKSI: `lib/work-order-service.ts` TIDAK ADA).
- SR: `lib/services/sr-service.ts` — transisi approve/reject/convert
  (KOREKSI: `lib/service-request-service.ts` TIDAK ADA; tidak ada endpoint
  approve/convert terpisah).
- PO/GRN: `lib/services/procurement-service.ts` — approve→receive→stock =
  REPORTED (KOREKSI: `lib/procurement-service.ts` top-level TIDAK ADA).
- Shift: handover flow (T4-10..13 = REPORTED dari docs).

## Kanon angka demo

`lib/canon.ts` + `docs/CANON_DATA.md` adalah satu-satunya sumber angka yang
boleh tampil di UI (WO numbers, AST tags, SKU, harga, count). Perubahan angka
demo harus lewat kanon, bukan hardcode per halaman.
