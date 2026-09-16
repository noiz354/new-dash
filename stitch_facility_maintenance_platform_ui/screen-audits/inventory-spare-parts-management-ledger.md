# inventory_spare_parts_management_ledger

- File: `inventory_spare_parts_management_ledger/screen.png`
- Design system: A
- Jenis layar: spare parts and consumables ledger
- Ringkasan visual: inventory dashboard dengan KPI valuation/availability/reorder/movement, SKU table kiri, movement ledger dan mutation desk kanan.
- Kekuatan: low-stock risk terlihat cepat; movement ledger jelas membedakan receipts, WO out, transfer, adjust; mutation desk memberi preview balance sebelum commit.
- Masalah visual: angka valuation melebar dan terlihat hampir terpotong; tabel SKU padat; right mutation form panjang dan membutuhkan sticky submit; beberapa reserved/lock icons kecil.
- Risiko rebuild: tinggi untuk transaksi inventory karena mutation harus idempotent dan running balance konsisten.
- Komponen reusable yang teridentifikasi: InventoryKpiCards, SkuTable, MovementLedger, MutationDesk, QuantityStepper, WarehouseHubSelect, PinVerifiedStrip.
- Elemen yang perlu binding data/API: SKU rows, bin/hub, on-hand/reserved, movements, transfer reason, destination, quantity, WO reference, approver PIN.
- Verifikasi tambahan terhadap `code.html`: cek receive stock, barcode/QR, advanced filter, and CSV export.
- Prioritas perbaikan:
  - P0: mutation commit harus punya confirmation and idempotency key.
  - P1: perbaiki overflow angka KPI valuation.
  - P2: visual lock/reserved perlu tooltip.
