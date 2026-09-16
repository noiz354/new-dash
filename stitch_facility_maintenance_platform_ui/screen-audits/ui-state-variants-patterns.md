# ui_state_variants_patterns

- File: `ui_state_variants_patterns/screen.png`
- Design system: A
- Jenis layar: design system state matrix / component pattern spec
- Ringkasan visual: katalog pola empty state, validation/error topology, offline banner, toast, skeleton loading, hover/focus/kanban states.
- Kekuatan: sangat berguna sebagai kontrak komponen; menampilkan normal/error/offline/loading/focus states; visual hierarchy antar pattern jelas.
- Masalah visual: active sidebar tetap Operations Dashboard karena halaman ini bukan route produk utama; beberapa contoh memakai data placeholder/artefak; error toast merah sangat dominan dan perlu aturan durasi/stacking.
- Risiko rebuild: rendah sebagai halaman, tinggi sebagai sumber komponen karena harus diterjemahkan menjadi states reusable yang konsisten.
- Komponen reusable yang teridentifikasi: EmptyState, ValidationField, OfflineBanner, ErrorToast, TableSkeleton, HoverActionCard, FocusRingInput, KanbanHoverCard.
- Elemen yang perlu binding data/API: tidak wajib sebagai halaman; gunakan sebagai fixture/contract untuk state components.
- Verifikasi tambahan terhadap `code.html`: cek toggle toast dan contoh field validation; pastikan tidak ikut masuk nav produksi sebagai layar biasa kecuali dev route.
- Prioritas perbaikan:
  - P0: jadikan source contract komponen, bukan halaman operasional.
  - P1: definisikan stacking/toast timeout.
  - P2: sinkronkan sample IDs dengan kanon.
