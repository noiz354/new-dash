# service_requests_triage_hub

- File: `service_requests_triage_hub/screen.png`
- Design system: A
- Jenis layar: service request triage desk
- Ringkasan visual: antrean request di kiri dan panel evaluasi/konversi di kanan, dengan filter prioritas, AI score, SLA clock, SCADA correlation, routing, dan chat log.
- Kekuatan: selected row sangat jelas; risk score dan dispatch level mudah dipahami; panel kanan memberi workflow konversi lengkap; chat log memberi konteks audit.
- Masalah visual: tabel kiri punya banyak kolom yang mulai sempit; beberapa summary request dipotong; chat composer di bawah panel kanan membutuhkan tinggi tetap agar tidak menekan konten.
- Risiko rebuild: sedang-tinggi karena selected request harus mengubah panel kanan, form routing, LOTO checkbox, dan log.
- Komponen reusable yang teridentifikasi: RequestQueueTable, RiskScorePanel, DispatchRoutingForm, LinkedAssetCard, TechnicianSelect, TriageChatLog, ScadaCorrelationStrip.
- Elemen yang perlu binding data/API: backlog counts, request rows, AI score, SLA timer, SCADA feed, asset registry match, technician availability, conversion action, chat messages.
- Verifikasi tambahan terhadap `code.html`: cek batch triage, reassignment zone, reject/duplicate, dan empty queue preview.
- Prioritas perbaikan:
  - P0: pastikan action "Convert to Work Order" punya guard dan confirmation.
  - P1: tabel harus berubah menjadi card list pada mobile.
  - P2: rapikan truncation issue summary dengan tooltip/detail drawer.
