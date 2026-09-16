# preventive_maintenance_scheduling_automation_hub

- File: `preventive_maintenance_scheduling_automation_hub/screen.png`
- Design system: A
- Jenis layar: preventive maintenance scheduling and automation hub
- Ringkasan visual: dashboard PM dengan KPI, hybrid trigger matrix, daftar plan, dispatch queue, workload balancing, chart compliance, dan SCADA connection panel.
- Kekuatan: konsep dual-trigger time/meter divisualkan jelas; engine logic gelap kontras dan mudah dikenali; queue kanan memberi tindakan batch yang kuat.
- Masalah visual: formula engine memakai teks kecil; tabel plan punya kolom padat dan beberapa nama plan terpotong; chart bawah perlu label yang lebih tahan responsive.
- Risiko rebuild: tinggi untuk interaksi generate batch, simulate run, dan kombinasi calendar/meter trigger.
- Komponen reusable yang teridentifikasi: PmKpiCards, TriggerMatrix, LogicEnginePanel, MaintenancePlanTable, GenerationQueue, WorkloadBars, DispatchVolumeChart, ScadaConnectionCard.
- Elemen yang perlu binding data/API: active PM plans, compliance, overdue cycles, cron status, meter values, plan rows, generated WO batch, workload capacity, SCADA gateway.
- Verifikasi tambahan terhadap `code.html`: cek nilai meter threshold dan WO generation sequence.
- Prioritas perbaikan:
  - P0: batch dispatch harus menampilkan preview dan rollback/confirmation.
  - P1: logic engine perlu syntax block yang tetap terbaca.
  - P2: sediakan filter saved view untuk plan list.
