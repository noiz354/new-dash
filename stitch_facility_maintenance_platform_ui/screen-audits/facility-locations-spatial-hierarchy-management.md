# facility_locations_spatial_hierarchy_management

- File: `facility_locations_spatial_hierarchy_management/screen.png`
- Design system: A
- Jenis layar: facility spatial topology hub
- Ringkasan visual: spatial tree di kiri, room detail dan blueprint di tengah, asset/work order cards kanan bawah, dengan KPI lokasi dan action edit/print/audit.
- Kekuatan: spatial hierarchy mudah dipahami; blueprint vector memberi konteks fisik; room metrics jelas; active critical alert tampil tegas.
- Masalah visual: blueprint punya teks kecil dan elemen padat; tree kiri memotong beberapa nama lokasi; right work order card perlu lebih kuat untuk status SLA.
- Risiko rebuild: tinggi karena tree selection, blueprint layer controls, heatmap, linked assets, and work orders perlu sinkron.
- Komponen reusable yang teridentifikasi: SpatialTree, RoomHeaderMetrics, BlueprintViewer, LayerToolbar, InstalledAssetsTable, ActiveWorkOrdersCard, ZoneComplianceCard.
- Elemen yang perlu binding data/API: location tree, room metrics, blueprint layers/nodes, assets in room, open WOs, audit defects, export GeoJSON/BIM.
- Verifikasi tambahan terhadap `code.html`: cek fragment HTMX, shortened IDs, edit polygon, and room audit dispatch.
- Prioritas perbaikan:
  - P0: blueprint harus punya zoom/pan dan accessible fallback.
  - P1: tree harus keyboard navigable.
  - P2: truncate location labels with tooltip.
