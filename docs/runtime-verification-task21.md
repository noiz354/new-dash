# Runtime Verification — TASK-21 Windowing

**Verdict: PASS** (fix-nothing-needed; 3 oracle harness bug dikoreksi, bukti diulang jujur)
**Tanggal:** 2026-09-16 · **Pelaksana:** OpenCode (Muse Spark) · **Branch:** `arena/01a0a835-new-dash`
**Metode:** Chrome DevTools MCP (browser milik MCP, sesi nyata) + unit SSR atas hook asli.
**Sesi:** terverifikasi ASLI via `GET /api/auth/session` → `m.vance@apexops.io` (Enterprise Admin, `APX-NUSA-01`).
**Target:** `/inventory` movement ledger — `useWindow(movFiltered, { rowHeight: 76, threshold: 60, initialHeight: 480 })`
(`components/inventory/InventoryLedger.tsx:131`, hook `lib/ui/useWindow.ts`).

> Catatan migrasi tooling: verifikasi ini dieksekusi via **MCP chrome-devtools**
> (migrasi dari driver raw CDP sesuai keputusan user). MCP masih mengendalikan
> browser launchingannya sendiri (`--browserUrl http://127.0.0.1:9227` sudah
> ditambahkan ke `~/.config/opencode/opencode.jsonc` namun belum berlaku —
> perlu restart MCP). Sesi di browser MCP adalah login nyata (dibuktikan via
> endpoint session di atas), jadi evidence tetap sah.

## Oracle & bukti

| Oracle | Hasil | Bukti |
|---|---|---|
| A. Initial full render (≤ threshold) | PASS | Snapshot MCP: 5 seed movements (`WO-2026-0894`, `PO-2026-0298`, `PM-PLN-0104`, `TRF-2026-0044`, `ADJ-2026-0019`), tab `All (1840)`; DOM 5/5 `<li>`, `topPad 0`, `bottomPad 0` — fallback render penuh benar |
| B. Dataset tumbuh ke 65 via UI nyata | PASS | 60 receipts via dialog **Receive Stock** asli (4×15 chunk `evaluate_script`, `PO-2026-0301…0615`, qty default, validasi format PO lolos tiap post). Tab `All (1900)` = `1840 + 65 − 5` — delta matematika TEPAT → dataset 65 |
| C. DOM << dataset + spacer math | PASS | DOM **25 `<li>`** (24 kartu + 1 spacer bawah), `topPad 0`, `botPad 3116` = `(65−24)×76` TEPAT. Benefit terukur (§16 spec): **24/65 = 37% kartu di DOM** (62% node movement-list dihemat; angka pasti, bukan klaim) |
| D. Scroll user nyata menggeser slice | PASS | Tombol keyboard asli (bukan `scrollTop` programatik): **End** → `scrollTop 1716`, `topPad 1064` (=14×76), `botPad 2052` (=27×76), 24 item, `first3 = PO-2026-0601/0515/0514`; **Home** → `scrollTop 0`, `topPad 0`, `botPad 3116`, `first3 = PO-2026-0615/0614/0613`. Slice disjoint dua arah. Cross-check rumus: `start = floor(1716/76)−8 = 14` ✅ |
| E. Filter jujur (shrink + tetap benar) | PASS | **Receipts** → 61 item → 24 rendered, `botPad 2812` = `(61−24)×76` TEPAT, semua baris `GRN Rec`; **WO Out** → 2 item, tanpa spacer (full render di bawah threshold ✅); **All** → kembali 24 + `botPad 3116` |
| F. Console | PASS (catatan) | `list_console_messages` tipe error = **kosong**. Nuansa jujur: run raw-CDP sebelumnya mencatat 2 `console.error` dev-only — React dev-mode memanggil `eval()` yang diblokir CSP **enforcing** tanpa `unsafe-eval` (upstream wave 5/TASK-22 menegakkan CSP; dulunya report-only). Seluruh perilaku lolos penuh; production build tidak memakai React dev → tidak terdampak. Klasifikasi: environmental/dev-only, BUKAN cacat TASK-21 |
| G. Network | PASS | Ledger sepenuhnya client-side (tanpa request aplikasi); run raw-CDP: `NET-FAILS []`, 0 respons ≥400 |

## Koreksi metodologi (jujur, didokumentasikan)

1. **Tiga bug oracle harness** (bukan bug aplikasi) — diperbaiki dengan bukti ulang, bukan edit angka:
   - B membandingkan `liTotal` DOM (25) dengan dataset (65) — salah ukur; dataset dibuktikan independen via delta tab `All (1900)`.
   - D membandingkan teks baris pertama kartu (`+2 ea`, identik di semua receipt) — diganti bukti PO unik per baris kedua.
   - E berekspektasi filter Receipts mengecil di bawah 24 — keliru (61 item → tetap windowed 24); ekspektasi dikoreksi ke matematika hook.
2. **`scrollTop` programatik TIDAK mem-fire scroll event** (counter listener native = 0 di kedua arah; spacer macet) — artefak harness/browser, bukan bug `useWindow` (hook hanya membaca event scroll). Bukti D memakai tombol keyboard **End/Home asli** yang memicu event scroll nyata.
3. **Fluktuasi `git status`** sempat menampilkan `M next.config.mjs` hilang/muncul antar-perintah tanpa tulisan dari sisi asisten; diverifikasi final via `git diff`: worktree = fix PGlite milik sesi ini (menggantikan baris komentar upstream). Kemungkinan artefak racy-git; tidak berdampak (diff final terverifikasi sebelum commit).

## Temuan di luar scope (→ Step 2, bukan fix di sini)

- Angka tab `Receipts (1240)` / `WO Out (560)` / `Transfers (40)` / `Monthly Stock Movement 1,840` dan badge `SYNCED · sha256:d8a2..f041` / `Live Audit Bus` adalah statis/fiksi — copy inventory, bukan windowing. Sudah dicatat sebagai kandidat Step 2.
- `next.config.mjs`: `serverExternalPackages: ['@electric-sql/pglite']` WAJIB ada — tanpanya semua query PGlite gagal via Turbopack (`path must be string... Received URL`). Dikomit bersama verdict ini.

## Test

- `tests/windowing.test.ts` (4 test SSR atas hook asli — komit `3b89b02`): render penuh ≤60, window 23-row di 200 rows + spacer math eksak, boundary 61, empty/single.
- `npm test`: **65/65 PASS** (61 lama + 4 baru), `tsc`: 0 error di file terkait (116 error pre-existing di file lain, tak tersentuh).

## Evidence

- Screenshot: `/tmp/opencode/evidence/task21/mcp-windowed.png` (viewport saat windowed, via MCP).
- Evidence run mentah (driver raw CDP pra-migrasi, untuk audit silang): `/tmp/opencode/evidence/task21/out.json`, `slice.json`, `scroll-fact.json`, `scroll-down.json`, `01-inventory-initial.png`, `02-grown-65.png`, `03-scrolled-bottom.png`, `04-filter.png`, `05-slice-proof.png`.
- Driver: `/tmp/opencode/cdp/task21.cjs`, probe `probe-slice*.cjs` (dokumentasi artefak scroll programatik).

**TASK-21 → PASS.** Lanjut: Wave 4 (TASK-24/25/26) + final matrix.
