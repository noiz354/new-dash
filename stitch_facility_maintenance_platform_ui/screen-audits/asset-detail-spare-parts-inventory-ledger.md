# asset_detail_spare_parts_inventory_ledger

- File: `asset_detail_spare_parts_inventory_ledger/asset_detail_spare_parts_inventory_ledger.png`
- Design system: A
- Jenis layar: asset detail dengan spare parts ledger
- Ringkasan visual: halaman detail chiller dengan asset summary, health telemetry, lifecycle/audit trail, BOM cards, BOM table, dan immutable stock movement ledger.
- Kekuatan: hubungan asset-health-parts terlihat kuat; BOM risk cards jelas; ledger transaksi menampilkan running balance dan source document; data operasional memakai monospace.
- Masalah visual: filename mismatch karena file PNG bukan `screen.png`; halaman sangat panjang dan padat; beberapa tabel ledger memiliki font kecil; top actions banyak dan perlu state hierarchy.
- Risiko rebuild: tinggi karena tabs, BOM filtering, stock issue/PR, ledger paging, dan telemetry sampling harus saling sinkron.
- Komponen reusable yang teridentifikasi: AssetHeader, TelemetryDiagnosticsCard, LifecycleAuditList, BomSummaryCards, BomPartsTable, StockMovementLedger, WarehouseTabs.
- Elemen yang perlu binding data/API: asset spec, telemetry, warranty, lifecycle events, BOM SKUs, stock levels, PR/WO actions, ledger transactions.
- Verifikasi tambahan terhadap `code.html`: cek tab Asset 360/Spare Parts/IoT, BOM totals, and stock movement hash.
- Prioritas perbaikan:
  - P0: ledger dan BOM action harus menjaga running balance valid.
  - P1: buat sticky section nav untuk halaman panjang.
  - P2: perbesar teks ledger pada viewport kecil.
