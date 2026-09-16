# notifications_sla_alerts_hub

- File: `notifications_sla_alerts_hub/screen.png`
- Design system: A
- Jenis layar: notifications and SLA alerts hub
- Ringkasan visual: list alert berbasis severity di kiri dan preferences/routing/debugger/compliance di kanan, dengan KPI unread/SLA/sign-off/channel telemetry.
- Kekuatan: alert cards punya accent warna kuat; actions per alert jelas; routing matrix memberi kontrol operasional; debugger panel gelap menonjol sebagai tool teknis.
- Masalah visual: active sidebar salah menyorot Audit Trail & Logs, bukan Notifications; alert list panjang tanpa grouping visual yang kuat; beberapa action destructive seperti revoke terlihat perlu konfirmasi.
- Risiko rebuild: sedang-tinggi karena actions per alert berbeda: view WO, escalate, authorize PO, reorder, reassign, revoke session.
- Komponen reusable yang teridentifikasi: AlertKpiCards, AlertListCard, RoutingPreferencesPanel, EscalationRuleCard, BusDebugger, SlaComplianceChart.
- Elemen yang perlu binding data/API: alert counts, alert rows, routing toggles, escalation targets, debugger state, SLA chart, action outcomes.
- Verifikasi tambahan terhadap `code.html`: cek active nav, reject/revoke confirmation, mark all read, quiet hours.
- Prioritas perbaikan:
  - P0: destructive actions wajib confirmation.
  - P1: active nav harus sesuai halaman.
  - P2: add batch/grouping by severity.
