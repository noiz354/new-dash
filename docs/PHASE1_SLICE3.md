# Phase 1 — Slice 3: Audit Trail Live, Asset Registry Live, Dossier WO Generik

> Status: ✅ selesai di branch `arena/01a09dd4-new-dash` · 2026-09-14
> Melanjutkan `docs/PHASE1_SLICE2.md`. Tema: membuat layar governance & aset membaca database, dan melengkapi flow WO agar **setiap** nomor punya dossier operasional nyata.

## 1. Apa yang berubah

| Layar | Sebelum | Sesudah (slice 3) |
|---|---|---|
| `/audit-trail` | Ledger fiktif (hash karangan, "Merkle verify" simulasi, probe live palsu, hitungan 184.9k karangan) | **`audit_events` nyata**: aktor, aksi, entitas, before/after JSON, `requestId` (sama dengan log server); hitungan per scope dari SQL `GROUP BY`; export CSV/JSON = unduhan baris persisten nyata; gating `audit.read` (403-EmptyState utk role tanpa izin) |
| `/assets` | Registry statis di komponen | Rows dari tabel `assets` + **hitungan workload nyata per asset** (open/total WO, active SR — subquery SQL, bukan angka tempelan) |
| `/assets/[id]` | Hanya asset kanon; lainnya EmptyState | **Dossier live untuk SEMUA asset**: field registry nyata + daftar WO & SR yang mereferensikan asset (link hidup) + chain kanon utk seal asset + link BIM (simulated, berlabel) |
| `/work-orders/[id]` | Dossier penuh hanya utk seal; nomor lain EmptyState | **Generic dossier utk semua WO**: status/SLA countdown nyata, origin SR (lookup `converted_wo_number`), Transition History, kartu Record, toolbar penuh (Hold/Escalate/Resume/Sign-off/**Cancel baru**/Print) |
| Toolbar WO | Tanpa cancel | `CancelDialog` (reason wajib, terminal) — melengkapi 7 aksi state machine yang bisa dilakukan dari UI |

## 2. Service baru

- `lib/services/audit-service.ts` — `listAuditEvents(db, ctx, limit=500)`: rows terbaru (urut `ts,id desc`), counts per `entityType` (GROUP BY nyata), `total`, flag `truncated` (jujur bila ledger > window; paging server-side = utang observability slice).
- `lib/services/asset-service.ts` — `listAssets` (subquery hitungan WO/SR per asset), `getAssetDossier` (asset + WO terkait + SR terkait), `findSrByConvertedWo` (cross-link origin WO ← SR konversi).
- `WoRow.assetCode` ditambahkan ke DTO (dipakai generic dossier + link asset).

## 3. Kejujuran yang dijaga (dan fiksi yang dibuang)

- **Dibuang**: Merkle root verify (1.6s pura-pura), hash `sha256:7f4c9a…` karangan, "rollback simulated", synthetic live probes 5-detik, signed proof TXN-88120, jumlah ledger 184.9k. Gantinya: pernyataan integritas yang benar — *append-only table + tulisan transaksional; hash-chained ledger = item hardening masa depan, tidak diklaim hari ini*.
- **Dipertahankan berlabel**: BIM view asset (`/assets/[id]/bim`) tetap "simulated"; telemetry/stopwatch di dossier seal tetap berlabel; catatan kaki registry: "edits (health, BOM) arrive with the inventory slice — no fake mutations here".
- Severity di audit trail **diturunkan dari action** (FAIL/LOCKED → Critical; HOLD/ESCALATE/CANCEL/CLOSE → Notice; lainnya Info) dan ditampilkan apa adanya, bukan kolom fiktif.
- `AssetDetail.tsx` (403 baris statis, orphan setelah rewrite) **dihapus**; `AssetBim` tetap (dipakai halaman BIM berlabel simulated).

## 4. Definisi PASS — bukti

| Kriteria | Bukti |
|---|---|
| Aksi → backend → UI | Setiap login/transisi WO/SR yang sudah ada kini **terlihat** di /audit-trail (baris nyata + before/after + requestId) tanpa aksi tambahan |
| Persisten | Ledger & registry dari PGlite on-disk; restart dev server tidak menghapus (sudah dibuktikan slice 2, berlaku sama) |
| UI merefleksikan | Asset registry menampilkan hitungan WO/SR yang berubah saat flow berjalan (WO hasil konversi SR-2026-0895 menambah workload AST-HVAC-003 — diverifikasi test) |
| Gagal terdiagnosis | `requestId` di UI audit = `requestId` di log server & envelope error; RBAC menolak dengan penjelasan role/permission di layar |
| Outcome bisnis | Auditor/governance dapat menelusuri siapa-melakukan-apa-kapan terhadap tiket mana; dispatcher dapat melihat beban kerja asset sebelum membuat WO |

Test: `npm test` → **38/38 pass** (2 test integrasi baru: ledger berisi `AUTH_MFA_OK/WO_HOLD/WO_COMPLETE/SR_CREATE/SR_CONVERT/SR_CLOSE` + before/after hold reason + isolasi tenant decoy; registry ≥4 assets, health kanon 68/DEGRADED, workload AST-HVAC-003 dari konversi SR, dossier relasi seal (WO-2026-0894 COMPLETED + SR-2026-0894 CONVERTED), origin cross-link, cross-tenant 404 `ASSET_NOT_FOUND`).

E2E curl (dev server): `/audit-trail` 200 + events nyata; `/assets` 200 + AST-HVAC-004 DEGRADED; `/assets/AST-HVAC-004` 200 + relasi WO/SR + canon chain; `/assets/AST-BOGUS-99` → EmptyState format; `/work-orders/WO-2026-0910` (hasil konversi E2E slice 2) → generic dossier dengan **Origin: SR-2026-0895** + event `Converted from SR-2026-0895` + tombol Cancel; field tech (Voronova) → `/audit-trail` menampilkan 403-EmptyState `audit.read`, `/assets` & `/work-orders` tetap 200.

## 5. Batasan yang dicatat

- Audit trail mengambil 500 event terbaru (window klien); server-side pagination + filter tanggal = slice observability.
- `before/after` payload audit saat ini ringkas (status/reason); snapshot penuh entity = keputusan skema tersendiri nanti.
- Asset registry read-only (mutasi health/BOM menunggu inventory slice bersama `parts` — tabel parts belum punya link asset; butuh kolom/tabel BOM).
- Playwright E2E di CI belum (browser download di sandbox berat) — smoke E2E curl terdokumentasi di file ini; direncanakan saat CI diaktifkan maintainer.

## 6. Slice 4 (berikutnya)

1. Inventory & parts: link part↔asset (BOM), pergerakan stok, requisition dari WO (mutasi nyata pertama di inventory).
2. Checklist/tasks WO DB-driven (tabel baru) → dossier eksekusi untuk semua WO.
3. Evidence storage (foto sign-off) — upload lokal/objek + gating nyata.
4. Observability: server-side pagination audit, metrik request, healthcheck DB mendalam.
