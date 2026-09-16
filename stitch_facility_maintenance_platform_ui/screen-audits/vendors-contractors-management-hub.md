# vendors_contractors_management_hub

- File: `vendors_contractors_management_hub/screen.png`
- Design system: A dengan artefak Sistem B
- Jenis layar: vendors and contractors management hub
- Ringkasan visual: registry vendor dengan KPI, vendor table, selected vendor detail, MSA status, permits, performance index, active cleared techs, dan dispatch/commendation actions.
- Kekuatan: vendor detail kanan kaya dan actionable; MSA timeline jelas; performance bars mudah dipindai; active field work orders menghubungkan vendor ke operasi.
- Masalah visual: P0 visual: bottom nav mobile field menimpa tabel dan permit section; header berbeda dari shell A; judul halaman terpotong "Vendors & Contractor ..."; beberapa content kanan bawah tertutup overlay.
- Risiko rebuild: tinggi bila artefak mobile terbawa; sedang untuk MSA/PDF/amend/dispatch interactions.
- Komponen reusable yang teridentifikasi: VendorKpiCards, VendorRegistryTable, VendorDetailPanel, MsaStatusTimeline, PermitList, PerformanceIndexBars, ClearedTechsCard.
- Elemen yang perlu binding data/API: vendor rows, MSA expiry, SLA compliance, permits, active WOs/POs, cleared techs, dispatch, amendment, PDF viewer.
- Verifikasi tambahan terhadap `code.html`: cek bottom nav source, title truncation, and action button states.
- Prioritas perbaikan:
  - P0: hapus/isolasi bottom nav mobile dari layar desktop.
  - P1: pulihkan shell desktop A and full title.
  - P2: add document viewer and amendment guard states.
