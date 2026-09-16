# purchasing_pos_management_hub

- File: `purchasing_pos_management_hub/screen.png`
- Design system: A dengan artefak Sistem B
- Jenis layar: purchasing and procurement operations hub
- Ringkasan visual: hub purchasing dengan KPI, tabs PR/PO/GRN/match, triage queue, receiving desk, purchase sign-off desk, dan KPI vendor/SLA bawah.
- Kekuatan: workflow PR to PO to GRN tergambar jelas; sign-off chain sangat kuat; receiving desk memperlihatkan ledger mutation preview.
- Masalah visual: P0 visual: bottom nav mobile field menimpa konten desktop; header tidak memakai shell sidebar A seperti layar lain; beberapa area tabel tertutup oleh nav overlay; palet hitam/hijau berbeda dari Sistem A desktop.
- Risiko rebuild: tinggi karena perlu memisahkan desktop purchasing shell dari mobile field nav, lalu wire PR/PO/GRN/sign-off.
- Komponen reusable yang teridentifikasi: ProcurementKpiCards, ProcurementTabs, PurchaseQueueTable, ReceivingDesk, SignOffChain, BudgetEnvelopeCard, VendorSlaKpi.
- Elemen yang perlu binding data/API: PR/PO rows, vendor, valuation, SLA, receiving count, ledger mutation preview, approval chain, budget envelope, authorize/reject/RFQ.
- Verifikasi tambahan terhadap `code.html`: cek apakah bottom nav berasal dari artefak code; pastikan desktop rebuild tidak membawanya.
- Prioritas perbaikan:
  - P0: hapus/isolasi bottom nav mobile dari layar desktop.
  - P1: satukan topbar/sidebar dengan Sistem A.
  - P2: perjelas active tab and selected row.
