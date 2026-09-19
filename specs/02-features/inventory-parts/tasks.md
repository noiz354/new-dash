# Inventory & Parts — Tasks (QUARANTINED 2026-09-19)

> ⛔ **VERDICT: SUPERSEDED / UNVERIFIED — JANGAN pakai sebagai acuan.**
> Investigasi P0 (2026-09-19) menemukan: klaim `(GAP-11, P1S3)` salah atribusi —
> GAP-11 = "Force-dispatch fix + field queue wire" (`docs/remediation-gap-11-spec.md`,
> CLOSED 2026-09-16 per `docs/audit-non-e2e-remediation-map.md` baris 246/293, domain
> DISPATCH/field-queue, BUKAN inventory); string `P1S3` tidak muncul di file `docs/` mana pun.
> File ini dipertahankan utuh sebagai evidence (dilarang hapus), digantikan oleh koreksi di bawah.
> Lihat: `specs/06-history/decisions.md` (keputusan karantina P0).

## Isi asli (unverified, dipertahankan verbatim)

- [x] Parts CRUD + adjust + transactions FIFO (GAP-11, P1S3)
- [x] Stock-take + cycle-counts
- [ ] Sisa Tier-4 terkait inventory; E2E browser re-run (BLOCKED-BY-ENV)

## Koreksi terverifikasi (2026-09-19)

- [x] Parts CRUD + adjust + transactions FIFO — cakupan inventory slice
  `docs/PHASE1_SLICE3.md` baris 52 (link part↔asset/BOM, pergerakan stok, requisition dari WO).
- [x] Stock-take + cycle-counts — rute/API ada (`implementation.md`); bukti uji: 182/182 unit pass.
- [ ] E2E Playwright (6 tests, proyek chromium): BLOCKED-BY-ENV — hanya browser `webkit-2336`
  terinstal di `~/.cache/ms-playwright`; butuh `npx playwright install chromium` (network, di luar scope).
