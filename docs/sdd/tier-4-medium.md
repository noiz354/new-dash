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
- Verdict **PASS** (2026-09-17, sesi new-dash, branch `arena/tier4-cd-new-dash`): forensik runtime menemukan 2 bug nyata — (a) redirect `router.push` saat offline → chrome-error (fix: guard `navigator.onLine`, `FindingCapture.tsx:212`); (b) `requestHash({...input, requestId})` di `inspection-service.ts:375` mencampur requestId unik-per-request ke hash → flush konkuren menghasilkan 201 + 422 IDEMPOTENCY_KEY_REUSED (fix: hash domain-input saja + regression test `integration.test.ts:554`). Bukti ulang probe #2: offline→QUEUED→online (pemicu global FieldShell, fired dari halaman form)→SYNCED `FND-2026-0190`, server total 2→3, console nol. Satu entry lama ber-key pra-fix tetap FAILED (jujur — key-nya terlanjur tersimpan dengan hash tercemar). Pemicu auto-flush (bagian T4-14) ikut terbukti via probe ini.

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
- Verdict **PASS** (2026-09-17): F-418 — satu-satunya render-branch capability di `components/` (`has.webAuthn()` di `LoginForm:163`, false saat SSR) di-fix dengan gate `mounted` (useEffect); 3x reload /login NOL console error, tombol Passkey tetap ada pasca-mount. Pemicu auto-flush TERBUKTI (FieldShell global utk semua `/field/*` + SyncStatus page-level + SW message; probe T4-5 #2 membuktikan flush fired dari halaman form). Minor pre-existing: `/favicon.ico` 404.

## T4-15 — Slice 4 skema: tabel `part_movements` + link part↔asset + test coverage (PROMOSI dari T0-5, 2026-09-17)

- Fakta (verdict T0-5 PARTIAL): ledger mutasi stok kini tercatat sebagai `auditEvents` `PART_*` (append-only via audit, qty implisit dari before/after diff); `parts` TIDAK punya kolom `asset_code` dan TIDAK ada tabel `part_movements`; test inventory belum mencakup ADJUST eksplisit + isolasi tenant.
- AC:
  1. Migrasi baru: tabel `part_movements` append-only (org, id uuid, sku FK parts, type ISSUE/RECEIVE/ADJUST/RESERVE/RELEASE, qty, refNumber, reason, actorUserId/Name, stepUpAt, requestId, idempotency-key hash, createdAt).
  2. `mutateStock` menulis row `part_movements` DALAM transaksi yang sama (tetap tulis audit event — audit dan ledger adalah dua aliran berbeda; jangan hilangkan salah satu).
  3. Link part↔asset: kolom `asset_code` di `parts` (soft ref, pola `workOrders.assetCode`) ATAU tabel `asset_parts` (BOM) — pilih satu, dokumentasikan keputusan di file ini.
  4. Feed `GET /api/parts/movements` membaca dari `part_movements` (bukan audit) — UI InventoryLedger tetap hidup tanpa perubahan kontrak.
  5. Test baru: ADJUST (reason wajib + set absolut) + isolasi tenant (decoy APX-GL-9021 blind) + movement row count == mutation count (replay idempoten tidak menambah row).
  6. Guard-test: absence feed-fabrikasi (feed harus dari DB rows, bukan const JSX).
- Verifikasi: `npm run db:setup` (migrasi idempotent, server STOP) → test hijau → runtime curl: RECEIVE → row muncul di feed + audit tetap ada → reload tahan.
- Estimasi: medium (migrasi + service + feed + test). Kaitan: T3-1 (seed checklist), T4-1 (KPI inventory jujur).
- Verdict **PASS** (2026-09-17): migrasi 0008 `part_movements` (append-only, check type/qty, idx org+ts/org+sku) + `parts.asset_code` nullable; `mutateStock` tulis 1 row ledger DALAM tx yang sama (audit `PART_*` tetap ditulis — dua aliran); `GET /api/parts/movements` baca `part_movements` (kontrak UI identik). Keputusan AC#3: kolom `asset_code` soft-ref (pola `workOrders.assetCode`), BUKAN tabel BOM — kebutuhan relasi kuantitatif part↔asset belum ada; `sku` di ledger logical-ref (parts PK komposit tak bisa jadi target FK); +2 kolom snapshot before/after_on_hand agar delta feed identik byte-per-byte. Test baru 3 (ADJUST absolut+REASON_REQUIRED, decoy blind via gap14Decoy + PART_NOT_FOUND, count==mutations & replay tulis nol) — suite 177/177, tsc bersih. Runtime: POST RECEIVE 200 → feed row dari DB + audit PART_RECEIVE tetap ada → reload tahan. Insiden: test decoy awal pakai sessionFor ke-9 → 429 RATE_LIMITED di test lain; fix pakai gap14Decoy() cached (tanpa login).

## T4-16 — 3-way match engine nyata (PROMOSI dari T3-4, 2026-09-17)

- Fakta: dossier `/purchasing/invoices/[id]` masih data demo statis (label sudah jujur: "DEMO DOSSIER", placeholder audit ID `EVT-MATCH-*` sudah dihapus dari tombol Audit Trail).
- AC: engine hitung per baris dari `po_line_items` vs `goods_receipt_notes` (qty/price) + invoice nyata bila ada; mismatch → flag + payment-hold state; feed ke dossier (endpoint atau RSC fetch); test mismatch→flag + matched→ok + tenant-scope; hapus `INVOICES` const statis.
- Verifikasi: runtime — GRN qty ≠ PO qty → dossier EXCEPTION_DISPUTED nyata + audit row; reload tahan.
- Estimasi: medium. Kaitan: T4-3 (expose/lock reports/aggregates).
- Verdict **PASS** (2026-09-17): migrasi 0009 `invoices` (PK org+number, check `INV-YYYY-NNNN`, status PENDING|MATCHED|DISPUTED + paymentHold) + `invoice_line_items` + kolom `goods_receipt_notes.sku_received/qty_received` nullable (check NULL OR >0; toleransi legacy: row GRN lama tanpa sku/qty ikut `grnCount` tapi di-skip dari qty agregat). `postGoodsReceipt` persist sku/qty tanpa auto-dispute (status tetap RECEIVED). `registerInvoice` idempoten (`procurement.invoice`) + step-up wajib + guard (format nomor, PO ada & kind=PO, lines non-empty, PO punya lines, 409 duplikat) + auto-jalankan `computeMatch` DALAM tx yang sama → status stored MATCHED/DISPUTED + paymentHold + audit `INVOICE_REGISTER` + `MATCH_RECONCILED`/`MATCH_DISPUTED` (returning id = auditTrailId). Engine strict: semua baris PO harus full-received + full-invoiced + harga sama; sku invoice di luar PO → mismatch; GRN kosong → DISPUTED (inv 0). Route `POST /api/purchasing/invoices` (po.approve + TOTP) → 201 dossier; GET list tenant-scoped + filter poNumber. Dossier RSC live: `INVOICES` const + `resolveInvoice()` fallback fabrikasi + `generateStaticParams` + label DEMO dihapus; unknown id → 404 jujur; mapping MATCHED→RECONCILED / DISPUTED→EXCEPTION_DISPUTED / PENDING→MATCH_PENDING; pilar PO/GRN/Invoice + matriks lines + banner dispute dinamis + evidence audit id. Seed: 1 baris PO-2026-0298 (seal qty2@145000 = 290000 cocok header). Test baru 5 (mismatch→flag+hold+audit, matched→ok, tenant-scope via gap14Decoy tanpa sessionFor baru, replay idempoten, guards 403/422/409) — suite 182/182, tsc bersih. Runtime: INV-2026-9999 → 404; GRN seal qty1 (vs PO qty2) + invoice full → 201 DISPUTED hold $1450 auditTrailId #333 grnCount 2 → dossier EXCEPTION_DISPUTED + LIVE DOSSIER + PARTIAL DOCK + evidence + matriks 2/1/2 MISMATCH → reload tahan.
