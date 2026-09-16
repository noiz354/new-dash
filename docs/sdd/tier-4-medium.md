# Tier 4 — Fitur Medium (14 unit)

## T4-1 — G6: KPI inventory jujur

- Fakta: konstanta `4,218`/`1,840`/`MOV_TOTAL` fiktif.
- AC: agregat server (COUNT/SUM dari `parts` + `part_movements`) ATAU label scope jujur; tidak ada angka hardcode di UI.
- Verifikasi: ubah stok via API → KPI berubah; grep konstanta lama → nol.

## T4-2 — G7–G12: cleanup klaim (copy cluster)

- Scope: klaim Live/WS-PUSH/SYNCED-hash, EVT-fallback tanpa auditId (wajib fail-closed seperti GAP-08), seed-tanpa-badge, perm `assets.read`→tulis, rute transfers/adjustments/runs, export-scope label.
- AC per sub-klaim: hapus ATAU jadikan jujur + guard-test; dialog tanpa auditId → fail-closed.
- Verifikasi: grep-test + CDP spot-check per rute.

## T4-3 — BACKEND-ONLY: putuskan expose atau kunci

- Daftar: inspections CRUD + force-dispatch, wo tasks, parts/movements, purchasing/grn, reports/aggregates, telemetry ingest/metrics, billing UI.
- AC per endpoint: EXPOSED (ada UI + RBAC + audit) ATAU dikunci (404/403 jujur + tercatat di spec ini). Tidak boleh ada jalan ketiga (endpoint hidup tanpa UI tanpa catatan).
- Output: matriks keputusan di file ini.

## T4-4 — FRONTEND-ONLY: wire atau label jujur

- Daftar: reports hub, PM hub, vendors flows, jobs page (SEED badge), print templates (sumber CANON).
- AC per hub: LIVE (data API) ATAU badge scope jujur + alasan. Pola: GAP-10 (PM), GAP-14 (vendors/reports).

## T4-5 — TASK-25 follow-up: server persist background sync

- Fakta (laporan TASK-25 FAIL): outbox klien nyata, TAPI server fabrikasi — POST 201-tanpa-persist + GET hardcode; auto-flush unproven.
- AC: POST persist ke tabel (outbox/sync-jobs) + GET baca DB + auto-flush reconnect TERBUKTI runtime (offline → online → flush → rows server); guard-test persist-vs-hardcode.
- Verifikasi: CDP offline/online + tabel DB + reload tahan. Ini menutup verdict FAIL Wave 3–4.

## T4-6 — D.4 load test jalur kritis

- Scope: login, dashboard, list WO, submit inspeksi, checkout.
- AC: harness + angka TERUKUR (p50/p95/error-rate) tercatat di `docs/load-test.md`; **dilarang klaim throughput sebelum terukur** (tetap berlaku).
- Verifikasi: 2 run konsisten; tidak ada degradasi fungsional pasca-run.

## T4-7 — E.5 sisa komponen statis

- Scope: `OrgHub` KPI fiktif (sisanya sudah nyata via GAP-12/13/14: AuditQueue/SyncStatus, ProfileSessions, dialogs purchase/vendor).
- AC: KPI OrgHub ← agregat nyata atau label scope; audit per perubahan role (sudah ada — verifikasi).

## T4-8..T4-11 — Fase 3 (4 checkbox)

- T4-8: routing + navigasi antar-layar sesuai sidebar Stitch (crawl semua link → 0 dead link, pola Wave-2).
- T4-9: state mock → API contract (skema WO, Asset, Inventory, Vendor, RBAC, Audit — kontrak ditulis di `docs/api-contracts.md` bila belum ada).
- T4-10: responsif 3 breakpoint + uji kontras badge (terkait QA wave-1 T4-12).
- T4-11: hapus CDN Play → build Tailwind proper (verifikasi: `rg 'cdn.tailwindcss' app components` → nol; build hijau).

## T4-12 — QA wave-1

- AC: 3 breakpoint × tiap route prod × (empty/loading/error/offline) + format WIB + 62 item checklist; tiap temuan jadi backlog baru (bukan diam-diam di-fix).
- Verifikasi: matriks QA di `docs/qa-wave-1.md` terisi penuh dengan verdict per sel.

## T4-13 — OBS: entryHash backfill

- Fakta: ledger mode hash-opsional, entryHash selalu null.
- AC: putuskan — backfill saat insert (chain tegas) ATAU nyatakan hash-opsional by design di docs + UI copy jujur. Tidak boleh menggantung.
- Verifikasi: insert baru → entryHash terisi (bila chain tegas) + verify-chain tetap VALID.

## T4-14 — F-418 React hydration #418 di /login + F-FINDINGS sisa auto-flush

- F-418: reproduksi clean-load → root-cause → fix → 3× reload bersih + tidak regresi di route lain.
- F-FINDINGS sisa: pemicu auto-flush SyncStatus diselidiki + terdokumentasi (persist-nya sudah GAP-1; yang kurang kejelasan pemicu — terkait T4-5).
