# inspection_findings_auto_wo_conversion_desk

- File: `inspection_findings_auto_wo_conversion_desk/screen.png`
- Design system: A
- Jenis layar: defect ledger dan auto-work-order conversion desk
- Ringkasan visual: daftar temuan kritis di kiri, detail finding di kanan, evidence image, auto-WO dispatch profile, BOM staging, LOTO enforcement, dan tiga CTA disposition.
- Kekuatan: prioritas emergency P1 sangat tegas; card finding selected jelas; perbandingan nominal vs actual membantu keputusan; enforce LOTO tampil sebagai guardrail.
- Masalah visual: foto evidence dan EXIF sangat kecil untuk audit; judul generated WO terpotong di input; tombol bawah banyak dan perlu hierarchy yang lebih ketat.
- Risiko rebuild: tinggi karena conversion harus atomic: finding detail, generated WO, parts staging, LOTO checkbox, schedule/dismiss/convert.
- Komponen reusable yang teridentifikasi: FindingList, FindingDetailHeader, EvidenceViewer, AutoWoProfile, PartsStagingTable, SafetyGuardrail, DispositionActions.
- Elemen yang perlu binding data/API: finding list, evidence metadata, acceptance criteria, actual reading, technician availability, generated WO, parts BOM, conversion action.
- Verifikasi tambahan terhadap `code.html`: cek EXIF coordinates, generated WO title, LOTO enforcement, dan dismiss justification.
- Prioritas perbaikan:
  - P0: convert/dismiss wajib confirmation dan audit reason.
  - P1: evidence photo perlu lightbox zoom.
  - P2: perbaiki truncation pada generated scope/title.
