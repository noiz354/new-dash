# asset_registry_lifecycle_management_ledger

- File: `asset_registry_lifecycle_management_ledger/asset_registry_lifecycle_management_ledger.png`
- Design system: A
- Jenis layar: asset registry ledger dengan detail side panel
- Ringkasan visual: daftar asset di kiri, selected asset detail di kanan, KPI fleet, map/location card, lifecycle audit trail, dan technical docs.
- Kekuatan: selected asset terlihat jelas; health bars memberi scan cepat; right detail panel kaya konteks; lifecycle dan docs mendukung audit trace.
- Masalah visual: filename mismatch karena file PNG bukan `screen.png`; tabel asset sangat padat; beberapa metadata kecil di image/detail card sulit dibaca; map embedded tampak dekoratif jika tidak interaktif.
- Risiko rebuild: tinggi untuk responsive tri-pane dan linked actions create WO, schedule PM, transfer, decommission.
- Komponen reusable yang teridentifikasi: AssetKpiCards, AssetRegistryTable, AssetDetailPanel, HealthScoreBars, LifecycleTimeline, DocumentList, LocationMapCard.
- Elemen yang perlu binding data/API: asset rows, health/compliance, selected asset media, financials, actions, audit events, docs, BIM link.
- Verifikasi tambahan terhadap `code.html`: cek source filename mismatch, asset status values, image source, and action menu.
- Prioritas perbaikan:
  - P0: tri-pane harus collapse menjadi list + drawer pada mobile/tablet.
  - P1: decommission perlu destructive confirmation.
  - P2: map/BIM CTA harus jelas apakah preview atau navigasi.
