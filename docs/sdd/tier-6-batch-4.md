# Tier 6 — Batch 4 ui-audit (15+1ref PROMOTE + 4 (U))

> Detail triase: `docs/triase-batch-4-ui-audit.md`. 1 USANG sudah diputus
> (endpoint `verify-root`, konvensi `/api/v1/*`) — tidak dikerjakan.

## Rute hilang (3)

- `inventory/transfers/[id]`, `inventory/adjustments/[id]`: bangun backend transfer/adjust (membatalkan out-of-scope F12 — butuh keputusan produk baru) ATAU nyatakan out-of-scope eksplisit + hapus semua link ke rute ini (grep link → nol).
- Halaman `field/runs*`: F18 ber-badge honest; putuskan — bangun ATAU kunci eksplisit.

## Backend belum ada (10)

- vendors (+MSA +summary); assets/registry (+telemetri/BOM); settings/system; locations/facilities (terkait GAP-16 T5 — verifikasi dulu T0, sisa di sini); live-queue/steps/time-entries; dispatch-queue/batch; notifications read-all/preferences; webhook vendor (billing.webhook hanya Stripe inbound); wo-draft; purchase authorize flow (terpisah dari `po.create`).
- AC per backend: route + service + RBAC + audit + test + UI wire (atau keputusan kunci eksplisit ala T4-3).

## Temuan TASK-25 (1 + ref, tak diduplikasi)

- Lihat Tier 4 T4-5 (server persist background sync). Batch 4 hanya me-ref; verdict tunggal di T4-5.
- PIN supervisor nyata (kini `2468`): sama dengan Batch 2 Inventory — verdict tunggal di sana; batch ini me-ref.

## (U) 4 — verifikasi saat implementasi

Wiring UI reports/inventory; pemicu auto-flush reconnect; impersonate enforcement (ref batch 3).

## Verdict batch

15+1ref + 4 (U) berverdict, nol duplikasi dengan T4-5/Batch 2 (ref saja) → Batch 4 CLOSED → seluruh Tier 6 CLOSED → program ±200 unit SELESAI.
