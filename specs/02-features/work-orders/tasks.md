# Work Orders — Tasks (From SDD/TODO, bukan baru)

- [x] CRUD + transisi tervalidasi (GAP-08 = REPORTED docs; rute aktual:
  `[id]/transitions`, TANPA endpoint `sla`)
- [x] SLA endpoint + guard destruktif (GAP-08) — ⚠️ endpoint `sla` TAK
  TERVERIFIKASI (tidak ada di `app/api/work-orders/`); butir ini REPORTED
- [x] ID display + link detail (GAP-07 = REPORTED)
- [ ] Sisa Tier-4 terkait WO (lihat `docs/sdd/tier-4-cd-execution.md`)
- [ ] Re-run journey setelah app-fix `sr-service.ts:301` (bukan BLOCKED lagi —
  smoke 5/5 ✅ 2026-09-19)
