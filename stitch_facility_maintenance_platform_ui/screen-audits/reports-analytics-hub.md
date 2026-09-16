# reports_analytics_hub

- File: `reports_analytics_hub/screen.png`
- Design system: A
- Jenis layar: reports and analytics hub
- Ringkasan visual: analytics dashboard dengan OPEX KPI, MTTR, availability, inventory valuation, charts, SLA cards, report table, dan custom query builder.
- Kekuatan: chart dan cost allocation mudah dipahami; report dossier table kaya metadata; query builder memberi workflow produksi yang jelas.
- Masalah visual: active sidebar salah menyorot Audit Trail & Logs, bukan Reports & Analytics; screenshot sangat tinggi sehingga bagian bawah rawan terlewat; query builder controls padat.
- Risiko rebuild: sedang-tinggi karena charting, report generation, schedule, query builder, and export formats.
- Komponen reusable yang teridentifikasi: AnalyticsKpiCards, BarChartCard, AllocationLegend, SlaComplianceCards, ReportDossierTable, QueryBuilderPanel.
- Elemen yang perlu binding data/API: OPEX/MTTR/availability metrics, chart series, cost categories, SLA rates, report rows, query params, generation/export action.
- Verifikasi tambahan terhadap `code.html`: cek active nav, run simulation, schedule automated dispatch, and export dossier.
- Prioritas perbaikan:
  - P0: active nav harus sesuai halaman.
  - P1: query builder perlu validation and loading state.
  - P2: chart labels harus responsive.
