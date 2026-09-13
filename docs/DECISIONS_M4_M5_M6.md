# Keputusan Desain M4–M6 (Fase C)

> Tanggal: 2026-09-13. Status: DIPUTUS OTONOM per default CODEX.md §0
> (pola terdekat `ui-state-patterns` + layar sejenis; drawer untuk detail,
> modal untuk konfirmasi). Semua butir bertanda `[ASUMSI-OTOMATIS]` —
> menunggu review user.

## M4 — Target global `+ New Dispatch / Request` [ASUMSI-OTOMATIS]

**Putusan: command palette ⌘K + modal kontekstual (BUKAN halaman baru).**

- Tombol header `+ New Dispatch / Request` dan kolom search membuka palette
  (pola `[POLA-BARU]` command palette ⌘K dari `INTERACTION_TREES.md` —
  kandidat kontrak komponen Fase F).
- Aksi dalam palette me-resolve ke SATU dari: (a) route file eksak
  (`work-order-detail.html`, `purchase-detail.html`, …), (b) modal
  kontekstual (Create WO = WOD-01, Authorize, Print), (c) drawer
  (requisition M5).
- Implementasi rujukan: `web/work-order-detail.html` (`#palette` + `⌘K`/
  `Ctrl+K` + ESC + filter). Berlaku global untuk semua file desktop baru.
- L4 (global search) MELEBUR ke M4 — satu palette, dua nama. Tidak ada file
  `search.html` terpisah.

## M5 — Prefill flows [ASUMSI-OTOMATIS]

**Putusan: konvensi query-string (BUKAN halaman baru). Berlaku global:**

| Param | Contoh | Dipakai di |
|---|---|---|
| `?asset=` | `?asset=AST-HVAC-004` | Create WO / Schedule PM dari registry; Change linked asset (M2 modal) |
| `?location=` | `?location=B-201` | Log Defect / Dispatch Room Audit dari facility |
| `?wo=` | `?wo=WO-2026-0894` | Requisition drawer (H1 WOD-08); Log Defect dari WO |
| `?vendorId=` | `?vendorId=trane-technologies` | Dispatch WO dari vendor (M1 modal) |
| `?tab=` | `?tab=match` | Deep-link tab (H3 purchase-detail) |
| `?q=&priority=&status=&page=` | filter list | Filter + pagination (H3, registry) |

- Aturan: nilai ID selalu format kanon penuh (C10); consumer yang menerima
  param WAJIB validasi format + fallback ke lookup modal bila kosong.
- Implementasi rujukan: drawer requisition H1 (header `Prefill
  ?wo=WO-2026-0894`), tab H3 (`?tab=` + `history.replaceState`).

## M6 — BIM 3D viewer [ASUMSI-OTOMATIS]

**Putusan: FILE TERPISAH `web/asset-bim.html` (BUKAN tab asset-detail).**

- Alasan: viewer butuh viewport penuh (peta SVG + layer + drawer node);
  menanamkannya sebagai tab menyempitkan kanvas di bawah 3 breakpoint dan
  melanggar pola "satu layar = satu unit kerja".
- Isi: skematik SVG manual CUP BASEMENT L2 · SECTOR WEST (foto Chicago =
  artefak, tidak direplikasi), 3 layer toggle (Mechanical/Electrical/
  Telemetry), 5 node critical-path → drawer detail (drawer-untuk-detail),
  tautan WO-2026-0894 + registry.
- Entry: tombol `Open BIM 3D Model` di registry → `asset-bim.html`;
  kembali via tombol back → asset-detail (arsip).

## Dampak ke Fase D (wiring)

- Semua tombol `+ New Dispatch / Request` di file baru WAJIB
  `data-open-palette` (desktop) — bukan `href` mati.
- Semua prefill memakai tabel M5 di atas; Fase D memverifikasi konsistensi
  nama param lintas file (`rg '\?(asset|location|wo|vendorId|tab)='`).
