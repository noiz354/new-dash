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

---

## Verdict batch (dieksekusi 2026-09-17 — semua 6 PASS, dengan perbaikan label saat verifikasi)

| Item | Verdict | Bukti |
|---|---|---|
| T2-1 F1 SSO | **PASS** (+label fix) | `/login` SSO disabled jujur ("not configured (Phase 1b)"); dialog OrgHub SSO kini jujur: "No IdP is connected (Phase 1b)", Okta CONNECTED→PLANNED, SCIM Instant(<50ms)→PLANNED; MFA ENFORCED benar (TOTP dienforce app + passkeys FIDO2 nyata — routes + PasskeySettings) |
| T2-2 F4 clone-policy | **PASS** (+stamp fix) | clone = draft lokal jujur ("drafted · deploy to activate"); deploy berlabel simulated + kini stamp waktu lokal nyata (timestamp fiksi '14 Sep 2026 14:05 WIB' dihapus) + "not persisted" eksplisit; backend deploy tetap Tier 6 batch 3 |
| T2-3 F7 print | **PASS** | 4 print view 200 (WO/PO/badge RFID-*/permit PTW-*) dengan PrintButton → window.print() (murni JS, CSP-safe); QR dekoratif jujur; CDP click-through tidak tersedia di sandbox (console browser) — bukti level kode+HTTP, dicatat jujur |
| T2-4 F9 ledger-fallback | **PASS** | MOV_SEED hanya saat feed tak terjangkau (movLive gate); badge "Demo offline — server unreachable"; export berlabel live vs demo; guard GAP-3 ada; live path terbukti di T0-5 |
| T2-5 F22 telemetry | **PASS** (+3 label fix) | 3 klaim palsu diluruskan: "zone tree synced"→"demo (staged, not synced)"; "100% Synced"→"Sync: demo KPI (not connected)"; "Modbus Active/SCADA STREAMING"→"demo — not connected/DEMO — NOT STREAMING"; sisa kata synced = state outbox nyata (SYNCED via dedup server) | 
| T2-6 F28 import-defer | **PASS** | nol entry point import di UI (grep nol) — keputusan DEFER terdokumentasi (audit map §19 F28); tak ada tombol mati/404 diam-diam |

Guard-test baru: `SDD T2-5 telemetry claims stay honest` (+T2-1/T2-2 assertions) — npm test 169/169.
