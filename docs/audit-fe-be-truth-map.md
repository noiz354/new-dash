# TRUTH MAP FRONTEND ↔ BACKEND (Audit Mocked / Dead-End / Unintegrated)

> Spec: `docs/audit-mocked-deadend-unintegrated-spec.md` (§1–§70).
> Metode: read-only, berbasis implementasi aktual. Klaim tanpa bukti ditandai (U).
> Konteks sesi: Wave 3–4 runtime verification (CDP/MCP) + Step 2 triase batch 1–4 sudah membuktikan sebagian besar jalur di bawah ini secara runtime.
> Legenda klasifikasi: MOCKED · DEAD-END · UNINTEGRATED · PARTIAL · ORPHAN-BE/FE · BROKEN CONTRACT · FAKE SUCCESS · LOCAL-ONLY · SILENT FALLBACK · DUAL SOURCE · HONEST PLACEHOLDER.

## §56 EXECUTIVE SUMMARY (20 poin)

1. FAKE SUCCESS P0 — Deactivate User (`components/org/OrgHub.tsx`): toast "access revoked · audit-chained", hanya `setPeople` lokal; backend `PATCH /api/organization/users/[id]` ADA tapi tak dipanggil. User yakin akses dicabut padahal aktif.
2. FAKE SUCCESS P0 — Finding create (`FindingCapture.tsx` → `POST /api/findings` → 201 + id acak, tanpa persist; outbox menandai SYNCED). Data-loss dengan wajah sukses (TASK-25 FAIL).
3. LOCAL-ONLY P1 — Mutasi inventory (`InventoryLedger.tsx`: receive/postMutation `setRows`/`setMovs`, PIN hardcoded `'2468'`); backend `inventory.mutate` POST ADA (dipakai rute GRN, bukan UI).
4. LOCAL-ONLY P1 — Purchasing authorize/GRN: dialog fase EDI simulasi; backend `po.list/create/receive` + `queue.jobs` NYATA tapi tak dipanggil UI.
5. UNINTEGRATED P1 — `settings/jobs` NOL pemanggilan fetch; backend `GET/POST /api/queue/jobs` nyata → status job di UI tidak berbasis server.
6. FABRICATED METRIC P1 — KPI inventory hardcoded (`4,218` SKU, `$1,428,650.00`, `94.2%`, `1,840` + `MOV_TOTAL`) di `InventoryLedger.tsx:31,244-247`.
7. MISLEADING P2 — Klaim realtime/konsensus tanpa dasar: `Live Sync Active` (`SideNav.tsx:75`), `WS-PUSH: 12ms` (`NotificationsHub.tsx:489`), `SYNCED · sha256:d8a2..f041` (`InventoryLedger.tsx:341`).
8. SILENT FALLBACK P2 — `critical-action-dialog.tsx:75`: `res.auditId || EVT-<acak>` menyembunyikan kegagalan audit.
9. PARTIAL P2 — Export CSV nyata TAPI hanya dari data termuat (bukan total server); PDF disabled-jujur (HONEST PLACEHOLDER, bukan bug).
10. (U) P2 — Penomoran acak persisten (`INS-…-acak`, `PM-…-acak`, `GRN-…-acak`): sah bila unik, tapi bukan sekuens kanonis.
11. FRONTEND-ONLY P2 — Flow vendor (onboard/amendment/dispatch-prefill) belum ada backend (tak ada rute vendors).
12. SEED-MIXING P2 — Seed inventory disajikan sebagai ledger tanpa badge (audit memberi badge DEMO — pola benar yang belum ditiru).
13. DEAD-END P2 — Rute hilang: `inventory/transfers`, `inventory/adjustments`, `field/runs` (referensi TO-8891/ADJ-…/INS-… menggantung).
14. BROKEN CONTRACT P2 — `POST /api/findings` memakai permission `assets.read` untuk operasi tulis.
15. ORPHAN-BE P3 — `retention/digest`, `reports/aggregates`, `telemetry/metrics` tanpa caller UI terdeteksi (kandidat, bukan vonis hapus).
16. END-TO-END NYATA — auth (scrypt+TOTP+MFA, sesi httpOnly, RBAC server, logout 401 + purge SW/cache), WO/SR CRUD + transisi + audit-chain, audit verify-chain, windowing, PWA+SW+offline-/offline, outbox klien (IDB/key/retry/badge), SSE jujur + fallback + recovery, PWA installability.
17. Tenant isolation TERBUKTI (integration test decoy-tenant); NOL mock-auth di kode (grep nihil).
18. Error handling JUJUR (typed `ApiError`, tanpa `catch→[]`; 404→null legitimate); NOL MSW/test-leak; env-fallback benign; TODO/FIXME hanya 4 deferral jujur.
19. Upload evidence NYATA (tulis berkas + auth) tapi PARTIAL (belum disajikan publik — sesuai TODO-nya sendiri).
20. Pagination jujur di audit (window 500 dinyatakan); filter inventory lokal atas seed sementara mengklaim katalog 4.218 → PARTIAL-DATA SEARCH.

## §57 MOCK INVENTORY

| Feature | Mock source | UI exposure | Production risk | Severity |
|---|---|---|---|---|
| Findings create/list | `app/api/findings/route.ts` hardcode 3 baris + POST tanpa insert | FindingCapture + FindingDesk + /field/sync | Data-loss berwajah sukses | P0 |
| Deactivate user | `OrgHub.tsx` setState lokal | ConfirmDialog + toast "access revoked" | Akses tak tercabut | P0 |
| Mutasi inventory | `InventoryLedger.tsx` setRows/setMovs + PIN `2468` | Receive/Mutation desk + toast sukses | Stok fiktif + bypass approval | P1 |
| Purchasing authorize/GRN | `dialogs.tsx`/`PurchaseDetail.tsx` fase simulasi | Sign-off/Dock desk + EDI toast | Komitmen PO fiktif | P1 |
| Job status | `settings/jobs` tanpa fetch | jobs page | Status basi | P1 |
| KPI inventory | konstanta `CAT_COUNT`/`MOV_TOTAL`/valuasi | kartu + tab counts + export note | Keputusan dari angka fiktif | P1 |
| Vendor flows | rute backend TAK ADA | VendorDetail/List dialogs | Aksi buntu | P2 |
| Klaim Live/Sync | teks statis 3 lokasi | nav/debugger/badge | Kepercayaan telemetry palsu | P2 |
| Seed ledger | `MOV_SEED`/katalog tanpa badge | movement feed | Campur demo–produksi | P2 |

## §58 DEAD-END INVENTORY

| Entry point | User action | Where flow stops | Consequence |
|---|---|---|---|
| `inventory` refs TO-8891/ADJ-2024-Q4 | klik referensi transfer/adjustment | rute `/inventory/transfers`, `/inventory/adjustments` TAK ADA | buntu |
| field audit INS-2026-0412 | buka hasil run | rute `/field/runs` TAK ADA | buntu |
| Vendor onboard/amendment | submit dialog | backend TAK ADA | buntu |
| PDF compliance audit | klik Generate | tombol disabled (JUJUR) | HONEST PLACEHOLDER |
| Flag audit | Confirm Flag | tanpa endpoint (dinyatakan di UI) | HONEST PLACEHOLDER |
| Rollback audit | Acknowledge | dry-run dinyatakan | HONEST PLACEHOLDER |

## §59 FRONTEND → BACKEND MATRIX (sampel berisiko; penuh di Step 2 batch 1–4)

| Feature | FE | Request | Backend | DB/External | Status |
|---|---|---|---|---|---|
| Login+MFA+logout | LoginForm/TopBar | POST login/mfa/logout | auth-service + sessions | DB sessions | END-TO-END |
| WO/SR CRUD+transisi | dialog/detail pages | POST/PATCH wo/sr | wo/sr-service + auditEvents | DB | END-TO-END |
| Audit trail+verify | AuditTrail | POST verify-chain | audit-service recompute | DB audit_events | END-TO-END |
| Finding create | FindingCapture/outbox | POST /api/findings | route fiksi (201 tanpa insert) | — | BROKEN (FAKE SUCCESS) |
| Deactivate user | OrgHub dialog | — (tak ada) | PATCH users/[id] ADA | DB users | DEAD-END (FAKE SUCCESS) |
| Mutasi inventory | InventoryLedger | — (tak ada) | inventory.mutate ADA | DB parts | DEAD-END (LOCAL-ONLY) |
| Authorize/GRN PO | dialogs/PurchaseDetail | — (tak ada) | po.list/create/receive ADA | DB po/grn | DEAD-END (LOCAL-ONLY) |
| Job monitor | settings/jobs | — (tak ada) | queue/jobs GET+POST ADA | worker | UNINTEGRATED |
| SSE alerts | useSlaStream/Hub | GET stream (EventSource) | poll-10s jujur + heartbeat | DB notif/sla | END-TO-END |
| API push subscribe | PushOptIn | POST push/subscribe | push-service | push subs | END-TO-END |
| Evidence upload | finding flow | POST evidence/upload | writeFile + auth | FS + (U)ref | PARTIAL |
| Search global | (tak ada caller pasti) | /api/search (U) | search.query ADA | DB | UNKNOWN |

## §60 BACKEND → FRONTEND MATRIX (61 op; sorotan)

| Endpoint | Backend works? | Frontend caller | UI consumer | Status |
|---|---|---|---|---|
| auth/* (13 op) | Ya (runtime) | LoginForm/TopBar | sesi + RBAC | INTEGRATED |
| wo/sr/* (11 op) | Ya (runtime) | WO/SR components | list/detail/dialog | INTEGRATED |
| audit-trail + verify-chain | Ya (runtime) | AuditTrail | ledger + widget | INTEGRATED |
| notifications + stream | Ya (runtime) | Hub + useSlaStream | kartu + label jujur | INTEGRATED |
| inventory.mutate | Ya (dipakai rute GRN) | TAK ADA (UI lokal) | — | FRONTEND NOT FOUND |
| po.list/create/receive | Ya (withRoute) | TAK ADA (UI simulasi) | — | FRONTEND NOT FOUND |
| queue/jobs | Ya (worker ada) | TAK ADA (jobs tanpa fetch) | — | FRONTEND NOT FOUND |
| org.users | Ya | OrgHub (GET; PATCH tak dipakai) | roster | PARTIAL |
| parts/movements | Ya (klaim batch 4) | (U) | — | UNKNOWN |
| findings | TIDAK (fiksi) | FindingCapture (korban) | outbox SYNCED palsu | MOCKED |
| retention/digest | Ada | TAK ADA terdeteksi | — | ORPHAN-BE kandidat |
| reports/aggregates | Ada | TAK ADA terdeteksi | — | ORPHAN-BE kandidat |
| telemetry/metrics | Ada | TAK ADA (ingest dipakai RUM) | — | ORPHAN-BE kandidat |
| csp-report | Ada | browser (via header CSP) | — | INTEGRATED (non-UI) |
| verify-root | DIHAPUS (fiksi) | — | — | DEAD |

## §61 CONTRACT MISMATCHES

| API | Mismatch | Frontend | Backend | Risk |
|---|---|---|---|---|
| POST /api/findings | perm `assets.read` untuk tulis | FindingCapture | route (tanpa cek tulis) | P2 authz smell |
| Export CSV ledger/audit | klaim katalog/total vs isi = view termuat | InventoryLedger/AuditTrail | — (tanpa endpoint) | P2 scope claim |
| Audit window 500 | dinyatakan jujur di UI | pagination note | listAuditEvents limit | OK (bukan drift) |
| MOV_TOTAL/tab counts | angka fiktif 1840 vs `movs.length` | pill counts | — | P1 (F6) |

## §62 FAKE SUCCESS STATES

| Action | Fake success mechanism | Actual persistence | Severity |
|---|---|---|---|
| Deactivate User | setState + toast "access revoked · audit-chained" | NIHIL | P0 |
| Finding Captured | POST 201 + toast + outbox SYNCED | NIHIL | P0 |
| Stock received | setMovs + toast "ledger +1" | NIHIL (lokal) | P1 |
| Mutation posted | setRows + toast "audit-chained" | NIHIL (lokal) | P1 |
| PO Authorized / GRN Posted | fase EDI + toast | NIHIL (lokal) | P1 |

## §63 LOCAL-ONLY BUSINESS STATE

| Feature | Local mutation | Expected canonical source | Risk |
|---|---|---|---|
| Deactivate user | `setPeople` status | PATCH users/[id] → DB | P0 |
| Receive/post mutation | `setRows`/`setMovs` | inventory.mutate → DB parts | P1 |
| Authorize/GRN | phase state | po.* → DB po/grn | P1 |
| Job view | (statis) | queue/jobs → worker | P1 |

## §64 ORPHANS

## Orphan Frontend

- (U) `AssetBim.tsx` dipakai rute bim (bukan orphan — terverifikasi ada).
- Tak ada orphan-FE signifikan terdeteksi; 57 komponen, 13 memanggil API, sisanya ter-render via props/rute (FRONTEND-ONLY ≠ orphan).

## Orphan Backend (kandidat — JANGAN hapus otomatis)

- `retention/digest`, `reports/aggregates`, `telemetry/metrics` (tanpa caller UI).
- `verify-root` sudah dihapus (bukan orphan lagi).
- `csp-report` BUKAN orphan (konsumen = browser via header CSP, pipeline 204 terbukti).

## §65 MISLEADING UI

| UI claim | Actual behavior | Classification | Severity |
|---|---|---|---|
| `Live Sync Active` (SideNav:75) | tanpa socket/sync indicator nyata | MISLEADING REALTIME | P2 |
| `WS-PUSH: 12ms` (Hub:489) | teks statis debugger | FABRICATED METRIC | P2 |
| `SYNCED · sha256:d8a2..` (Ledger:341) | badge statis | FABRICATED STATUS | P2 |
| Tab counts `All (1,840)` | `MOV_TOTAL` fiktif + delta lokal | FABRICATED COUNT | P1 |
| `AUDIT BUS REAL-TIME` dkk | SUDAH dibersihkan (TASK-20) | — (selesai) | — |

## §66 TOP INTEGRATION GAPS (12; batas 20 tak tercapai karena sweep jenuh)

**G1 — Deactivate User palsu.** Category: FAKE SUCCESS. Severity: P0.
User-visible: dialog konfirmasi → toast "access revoked · audit-chained".
Frontend: `components/org/OrgHub.tsx` (setPeople lokal). Backend: `PATCH /api/organization/users/[id]` ADA tak dipanggil.
Break point: handler onConfirm (tanpa fetch). Risk: akses tak tercabut. Needs: wire PATCH + refetch roster + bukti 401.

**G2 — Finding create palsu.** Category: FAKE SUCCESS + MOCKED. Severity: P0.
Frontend: FindingCapture/outbox (SYNCED jujur menurut klien). Backend: `app/api/findings/route.ts` 201 tanpa insert; GET hardcode.
Break point: route handler. Risk: data-loss. Needs: persist ke tabel findings + GET baca DB (backlog TASK-25).

**G3 — Mutasi inventory lokal.** Category: LOCAL-ONLY. Severity: P1.
Frontend: InventoryLedger setRows/setMovs + PIN `2468`. Backend: inventory.mutate ADA (dipakai GRN).
Break point: receive()/postMutation (tanpa POST). Risk: stok fiktif + bypass approval. Needs: wire POST + PIN server + guard available→0.

**G4 — Purchasing lokal.** Category: LOCAL-ONLY. Severity: P1. Backend po.*/queue.jobs nyata tak dipanggil. Needs: wire authorize/GRN + job polling.

**G5 — Jobs tanpa fetch.** Category: UNINTEGRATED. Severity: P1. Needs: GET queue/jobs + polling status.

**G6 — KPI fiktif.** Category: MOCKED. Severity: P1. Needs: agregat server atau label jujur.

**G7 — Klaim Live/Sync.** Category: MISLEADING. Severity: P2. Needs: hapus/ukur nyata (F-COPY Step 2).

**G8 — EVT- fallback acak.** Category: SILENT FALLBACK. Severity: P2. `critical-action-dialog.tsx:75`. Needs: gagalkan transaksi bila auditId absen.

**G9 — Rute hilang.** Category: DEAD-END. Severity: P2. transfers/adjustments/runs. Needs: bangun atau cabut referensi.

**G10 — Seed tanpa badge.** Category: SEED MIXING. Severity: P2. Needs: tiru pola badge DEMO audit.

**G11 — Perm baca untuk tulis.** Category: BROKEN CONTRACT. Severity: P2. POST findings `assets.read`. Needs: perm tulis + enforce.

**G12 — Export parsial.** Category: PARTIAL. Severity: P2. CSV dari view. Needs: endpoint export server-total atau label scope.

## §67 END-TO-END COVERAGE

## FULLY INTEGRATED

auth(login/MFA/logout+purge), WO/SR CRUD+transisi+audit, audit+verify-chain, windowing, PWA+SW+offline, SSE+fallback+recovery, push-subscribe, CSP-report pipeline, tenant isolation.

## PARTIALLY INTEGRATED

org users (GET ya/PATCH tak dipakai), evidence upload (simpan ya/saji belum), CSV export (data-view ya/total belum), audit window (500 dinyatakan), notifications (stream ya/read-all belum).

## MOCKED

findings server, KPI inventory + tab counts, klaim Live/WS-PUSH/SYNCED-hash, vendor flows (tanpa backend).

## DEAD-END

deactivate (UI buntu), transfers/adjustments/runs (rute buntu), vendor onboard (backend buntu).

## BACKEND ONLY

inventory.mutate (UI), po.*/queue.jobs (UI), retention/digest, reports/aggregates, telemetry/metrics (caller UI).

## FRONTEND ONLY

Deactivate (tanpa panggil), mutasi inventory (tanpa panggil), authorize/GRN (tanpa panggil), jobs view (tanpa panggil).

## UNKNOWN

callers `/api/search`, `/api/parts/movements`; persistensi nomor acak INS/PM/GRN; adopsi FormField guard.

## §68 IMPLEMENTATION ORDER

1. P0 fake states: G2 (persist findings), G1 (wire PATCH deactivate) — keduanya user-percaya-tersimpan.
2. Auth gaps: G11 (perm tulis findings); PIN server (G3) — keamanan.
3. Data-loss/local-only: G3, G4, G12-scope.
4. Dead-end: G9 (bangun/cabut), vendor flows (putuskan scope).
5. Kontrak: envelope/scope klaim export; MOV_TOTAL → hitung nyata.
6. Backend belum dipakai: G5, po.*/inventory.mutate wire-up, orphan review (retention/reports/telemetry).
7. Sisa mock: G6, G7, G10, penomoran kanonis.
8. Orphan cleanup: terakhir, tanpa auto-delete.

## §70 FINAL QUESTION — jawaban eksplisit

> Dari seluruh frontend dan backend, fitur mana yang benar-benar end-to-end, mana yang hanya terlihat selesai tetapi masih mocked/partial/dead-end, di titik mana integrasi putus, dan gap mana yang paling berisiko terhadap user atau data?

**Benar-benar end-to-end (§67 FULLY):** auth + RBAC + logout/purge; WO/SR CRUD, transisi, audit-chain; audit verify-chain; windowing; PWA/SW/offline-/offline; SSE + fallback + recovery; push-subscribe; CSP pipeline; isolasi tenant. Semua TERBUKTI runtime Wave 3–4, bukan klaim.

**Terlihat selesai tetapi putus:** G1 deactivate (putus di handler — tanpa fetch), G2 finding (putus di route — 201 tanpa insert), G3/G4 mutasi inventory & purchasing (putus di handler — tanpa POST padahal endpoint ada), G5 jobs (putus di view — tanpa fetch), G6 KPI (putus di sumber — konstanta).

**Titik putus dominan:** (a) handler UI tak memanggil endpoint yang SUDAH ADA (G1/G3/G4/G5 — pola sesi ini: backend lebih nyata dari frontend); (b) SATU endpoint fiktif di jalur kritis (G2); (c) klaim UI tanpa pengukur (G7/F6).

**Paling berisiko:** G2 lalu G1 (keduanya P0: user percaya data/akses berubah padahal tidak — data-loss dan revocation-failure), disusul G3 (stok fiktif + PIN hardcoded = keamanan + integritas transaksi).
