# operations_dashboard

- File: `operations_dashboard/screen.png`
- Design system: A
- Jenis layar: dashboard command center desktop
- Ringkasan visual: shell desktop paling lengkap dengan sidebar gelap, topbar fasilitas, KPI tiles, chart downtime/cost, dispatch queue, rail kanan untuk asset health, live log, dan shift roster.
- Kekuatan: hierarchy kuat; status critical/healthy mudah dipindai; rail kanan memberi konteks operasional tanpa membuka detail; ID WO dan asset sudah memakai treatment monospace.
- Masalah visual: tabel dispatch mulai padat dan beberapa issue summary terpotong; chart memakai label kecil yang riskan di tablet; active nav cocok, tetapi semua layar lain harus memakai pola sidebar/topbar ini secara konsisten.
- Risiko rebuild: tinggi untuk responsif karena layout 3 area harus berubah menjadi stacked cards di mobile; chart dan right rail perlu komponen yang stabil dimensinya.
- Komponen reusable yang teridentifikasi: AppShell, FacilityScope, SyncStatusPill, KpiCard, TimeRangeTabs, FilterBar, LineChartCard, DispatchQueueTable, RightRailCard, ActivityTimeline.
- Elemen yang perlu binding data/API: KPI work orders/SLA/MTTR/PM/vendor, chart trend, asset health list, dispatch queue, live log, roster, telemetry bus.
- Verifikasi tambahan terhadap `code.html`: cek action button dispatch, pagination, filter, dan link "View System Diagnostic Logs" agar tidak menjadi dead control.
- Prioritas perbaikan:
  - P0: pastikan tabel dispatch dan right rail tidak overlap pada tablet/mobile.
  - P1: buat chart responsive dengan label yang tetap terbaca.
  - P2: standar warna badge SLA dan active nav lintas layar.
