# apex_ops_logo

- File: `apex_ops_logo/screen.png`
- Design system: Tidak berlaku, aset brand
- Jenis layar: logo asset
- Ringkasan visual: logo horizontal Apex Ops dengan mark biru berbentuk rounded square, ikon segitiga/alert, wordmark biru tua/biru terang, dan subtitle "Facility & Assets".
- Kekuatan: mark terbaca pada ukuran kecil; warna cocok dengan primary cobalt; aset ringkas untuk sidebar/header.
- Masalah visual: screenshot berbackground transparan/gelap viewer sehingga perlu versi terang/gelap diuji; subtitle kecil rawan hilang di ukuran sidebar compact.
- Risiko rebuild: rendah, tetapi perlu SVG/component source yang tajam dan tidak bergantung image remote.
- Komponen reusable yang teridentifikasi: LogoMark, LogoHorizontal, LogoCompact.
- Elemen yang perlu binding data/API: tidak ada.
- Verifikasi tambahan terhadap `code.html`: gunakan sebagai dasar SVG/component; cek warna exact dan export sizes.
- Prioritas perbaikan:
  - P0: simpan logo sebagai component lokal, bukan remote image.
  - P1: buat compact mark untuk collapsed sidebar.
  - P2: uji kontras di sidebar gelap dan header terang.
