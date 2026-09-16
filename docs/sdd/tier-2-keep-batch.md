# Tier 2 — GAP-17 KEEP Batch (6 sub-item, 1 checkbox TODO)

> Keputusan "KEEP no-op" = perilaku dipertahankan + label jujur + guard-test.
> BUKAN bebas klaim: tiap item diverifikasi eksistensinya lalu di-centang dengan bukti.

## T2-1 — F1 SSO

- Verifikasi: alur SSO di `/login` (M3) enforced seperti klaim; tidak ada tombol SSO mati/bohong.
- AC: tiap kontrol SSO hidup → backend nyata, atau disabled + copy jujur. Runtime CDP klik-melalui.

## T2-2 — F4 clone-policy

- Verifikasi: clone policy berfungsi terhadap data nyata (bukan duplikat tampilan).
- AC: clone → row baru persist (reload tahan) + audit event; atau label scope jujur.

## T2-3 — F7 print templates

- Verifikasi: template print WO/PO/badge/permit (L3) menyatakan sumber CANON; tombol print → output benar (PDF/print-view), bukan dead button.
- AC: tiap tombol print diverifikasi CDP (dialog print muncul / file terunduh).

## T2-4 — F9 ledger-fallback

- Verifikasi: fallback ledger ber-badge SEED/demo dan terganti data live saat API sukses (pola MOV_SEED GAP-16 T2).
- AC: matikan API (atau kosongkan DB) → badge tampil; API hidup → data live, nol refs fiktif.

## T2-5 — F22 telemetry-infra

- Verifikasi: klaim telemetri jujur (NOT CONNECTED / LOCAL DEMO / Simulated) mengikuti pola GAP-10; tidak ada "synced" palsu.
- AC: grep `synced|Modbus.*connected|HTMX` case-insensitive di area telemetri → nol klaim palsu; guard-test.

## T2-6 — F28 import-defer

- Verifikasi: keputusan defer import terdokumentasi di UI (label "Phase 2"/not-implemented jujur, bukan tombol mati).
- AC: tiap entry-point import punya state jujur; tidak ada 404 diam-diam.

## Verdict batch

Semua 6 PASS → centang `GAP-17` di TODO + baris PROGRESS. Satu pun FAIL → spec perbaikan Tier 4 baru untuk item itu.
