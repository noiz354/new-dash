# field_inspections_audit_queue_hub

- File: `field_inspections_audit_queue_hub/screen.png`
- Design system: A
- Jenis layar: inspection audit queue dan template builder desktop
- Ringkasan visual: halaman audit desktop dengan KPI, scheduled inspections table, template builder kanan, gateway link, dan shortcut cards ke mobile execution/findings.
- Kekuatan: split antara queue dan template builder efektif; badge compliance/queued jelas; checklist step cards punya tipe input dan guardrail yang eksplisit.
- Masalah visual: bagian template builder kanan sangat panjang dan tombol publish berada dekat batas bawah; table queue banyak teks kecil; shortcut cards bawah rawan terlewat.
- Risiko rebuild: sedang-tinggi karena template builder butuh reorder, input type, guardrail, publish draft, dan transisi ke mobile.
- Komponen reusable yang teridentifikasi: InspectionKpiCards, AuditQueueTable, TemplateStepCard, ChecklistStepBuilder, GatewayStatusStrip, ShortcutCard.
- Elemen yang perlu binding data/API: audit queue, template draft, step definitions, compliance stats, mobile submissions, SCADA gateway, publish template.
- Verifikasi tambahan terhadap `code.html`: cek button add step, save draft, publish, dan link mobile/tablet execution.
- Prioritas perbaikan:
  - P0: builder harus punya dirty-state dan publish confirmation.
  - P1: queue table perlu mobile card fallback.
  - P2: shortcut cards perlu visual priority lebih jelas.
