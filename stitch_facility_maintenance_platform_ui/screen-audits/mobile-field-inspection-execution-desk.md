# mobile_field_inspection_execution_desk

- File: `mobile_field_inspection_execution_desk/screen.png`
- Design system: B
- Jenis layar: mobile rugged checklist execution
- Ringkasan visual: layar sempit field execution dengan header asset, progress, PASS/FAIL segmented action, numeric telemetry, mandatory visual evidence, notes, queued next steps, submit auto-dispatch, save offline, dan bottom nav.
- Kekuatan: touch target besar; failure state sangat jelas dengan red accent; evidence photo memberi bukti lapangan; offline/local draft CTA sesuai konteks field; bottom nav minimal.
- Masalah visual: lebar 286px membuat beberapa teks terpotong seperti "Vibration Spectrum..." dan alert footer; beberapa chip kecil masih mendekati batas keterbacaan; card step aktif sangat panjang.
- Risiko rebuild: tinggi untuk offline state, camera/audio upload, pass/fail override PIN, auto-dispatch, dan safe-area bottom nav.
- Komponen reusable yang teridentifikasi: FieldHeader, AssetSummaryCard, ExecutionProgress, PassFailSegment, TelemetryInput, EvidencePhotoCard, FieldNotes, OfflineDraftButton, FieldBottomNav.
- Elemen yang perlu binding data/API: asset/protocol IDs, step status, telemetry ppm, photo attachment, voice note, notes, auto-dispatch queue, offline sync state.
- Verifikasi tambahan terhadap `code.html`: ganti `alert()` supervisor sign-off menjadi dialog/PIN; cek bottom nav routes.
- Prioritas perbaikan:
  - P0: supervisor override dan auto-dispatch harus memakai confirmation/PIN, bukan alert.
  - P1: pastikan semua action minimum 48x48 dan aman untuk safe-area.
  - P2: pendekkan label panjang atau gunakan expansion detail.
