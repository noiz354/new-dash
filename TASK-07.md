## TASK-07.md — Backend handover shift (bertahap, badge-first)

**Goal**
Fase 1: ganti badge `AUDIT COMPLIANT` yang tak berdasar dan jujurkan histori/toast handover. Fase 2: bangun tabel `handovers` + service + routes dan wire `ShiftPlan` sehingga status **bertahan setelah reload**, reject tanpa alasan = 400, dan setiap accept/reject punya **baris audit nyata**.

**Current state**
- `components/shifts/ShiftPlan.tsx`: `HandoverRecord`; `HISTORIC_HANDOVERS` (baris **28**) = 3 baris fiktif tanpa DB: `HND-2026-0523-B` (time `2026-05-23 23:05 WIB`, itemsHandedOver `4 WOs, Cleanroom BMS telemetry nominal`), `HND-2026-0523-A` (`2026-05-23 15:10 WIB`, `2 WOs, 1 inspection completed`), `HND-2026-0522-B` (`2026-05-22 23:25 WIB`); `ShiftPlan` (baris **65**); state `status: 'pending'|'accepted'|'rejected'`, `rejectReason`, `rejectOpen`; `accept` (77–80) toast `${CANON.workOrderSeal} · active timer transferred to Shift B lead.`; `reject` (82–87) toast `Handover blocked: "…". Escalated to Ops Lead.`; badge `AUDIT COMPLIANT` (~231) — **tanpa ledger**. Dirender `app/(ops)/shifts/plan/page.tsx` → `ShiftPlanPage`.
- **Belum ada** tabel `handovers`, `lib/services/handover-service.ts`, atau route `app/api/handovers|shifts/*`.
- Pola acuan: `lib/services/vendor-service.ts` (audit transaksional + `withIdempotency` + `DomainError(400/409)`), routes `app/api/vendors/*`, RBAC pasangan read/manage.
- Peta F27 (290–294): FRONTEND-ONLY + badge `AUDIT COMPLIANT` tanpa ledger, `HND-*` historis tanpa DB; Decision `MUST FIX badge` + `NEED PRODUCT DECISION`; P2/S-then-M/MODULE.

**Fase 1 — badge/copy fix**
- Badge `AUDIT COMPLIANT` (~231) → hapus, ganti netral `LOCAL DEMO` sampai fase 2.
- `HISTORIC_HANDOVERS` (~28–62) diberi header/label `local demo — not persisted`.
- Toast `accept` & `reject` → `recorded locally (demo)`, tanpa klaim audit/timer-transfer sampai fase 2.

**Fase 2 — backend + wire**
- Tabel `handovers` (shift, crew/lead, status `pending`/`accepted`/`rejected`, `rejectReason` **wajib** saat rejected, timestamps, org tenant) + migrasi bernomor berikutnya + **seed kosong** (tanpa baris fiksi).
- Service `lib/services/handover-service.ts`: accept (guard **409** bila sudah terminal) + reject (alasan wajib → **400** bila kosong) + audit transaksional `HANDOVER_ACCEPT`/`HANDOVER_REJECT` + idempoten.
- Routes: pilih **satu** path — `app/api/handovers/*` ATAU `app/api/shifts/*` — dan dokumentasikan pilihannya: GET list/history + POST accept/reject.
- RBAC: daftarkan `shifts.read`/`shifts.manage` meniru pasangan vendors, dipetakan ke peran yang sama.
- Wire `ShiftPlan`: daftar + histori dari server; `HISTORIC_HANDOVERS` dihapus setelah server terisi, sementara dijadikan fallback demo ber-label bila server kosong (meniru pola SEED-fallback ber-badge). Penanda kepatuhan boleh kembali **hanya** sebagai label berbasis baris audit nyata.

**What NOT to touch**
- Jangan sentuh arsip beku `stitch_facility_maintenance_platform_ui/`.
- Jangan buat dua path endpoint sekaligus — pilih satu.
- Penjadwalan shift otomatis & notifikasi pager/SMS = out-of-scope.
- Jangan ubah permission existing — hanya tambah `shifts.*`. Jangan ubah endpoint lain.
- Jangan tambah dependensi. Jangan commit file generated.

**Acceptance criteria**
- Fase 1: `AUDIT COMPLIANT` hilang, `LOCAL DEMO` tampil, histori ber-label local demo, toast tanpa klaim audit.
- Fase 2: accept via UI → reload → status **tetap**; reject tanpa alasan → 400 jujur; aksi ganda (accept setelah terminal) → 409; audit `HANDOVER_ACCEPT`/`HANDOVER_REJECT` tertulis; isolasi tenant terjaga.
- `npm test` hijau, `npx tsc --noEmit` bersih, konsol browser nol error.

**Validation command**
```bash
npm test
npx tsc --noEmit
npm run dev
curl -s localhost:<port>/api/handovers -b "<cookie>"    # atau /api/shifts sesuai path yang dipilih
```
Runtime: accept via UI → reload → status tetap; reject tanpa alasan → 400 jujur; audit-trail memuat event handover; konsol nol error.

**Expected output**
- Status handover bertahan setelah refresh; setiap accept/reject tercatat di audit trail.
- Badge compliance fiktif hilang.
- Seksi F27 di map diperbarui; satu commit tugas ini (mis. `GAP-16 TASK 7/7 (F27): shift handover backend + honest badge`).
