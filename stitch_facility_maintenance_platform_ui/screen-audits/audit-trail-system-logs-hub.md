# audit_trail_system_logs_hub

- File: `audit_trail_system_logs_hub/screen.png`
- Design system: A
- Jenis layar: immutable audit trail and system logs
- Ringkasan visual: event ledger dengan KPI audit/security/integrity, filter scope, live stream, diff inspector, auth/session envelope, Merkle root status.
- Kekuatan: immutable/security framing sangat kuat; diff inspector mudah dipahami; pagination dan scope filters cocok untuk data besar; cryptographic root CTA jelas.
- Masalah visual: active content padat dengan banyak monospace kecil; beberapa raw hash terpotong; ada indikasi endpoint `/api/v2` pada visual yang perlu dikonfirmasi dengan kanon API.
- Risiko rebuild: sedang-tinggi karena live polling, diff selection, raw JSON tab, proof download, rollback simulation, and flag review.
- Komponen reusable yang teridentifikasi: AuditKpiCards, ScopeFilterBar, EventStream, DiffInspector, AuthEnvelope, MerkleStatusCard, AuditPagination.
- Elemen yang perlu binding data/API: audit event totals, filters, event stream, selected transaction, diff fields, hash/proof, identity/session metadata, Merkle status.
- Verifikasi tambahan terhadap `code.html`: cek API version, pagination behavior, raw JSON tab, and rollback/flag actions.
- Prioritas perbaikan:
  - P0: proof/rollback/flag harus jelas permission dan confirmation.
  - P1: hash fields perlu copy affordance.
  - P2: raw/diff tabs harus keyboard accessible.
