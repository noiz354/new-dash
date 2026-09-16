# GAP-3 SPEC — Inventory receive/mutasi + approver PIN → server-backed

> Status: SPEC (ditulis sebelum implementasi — spec-driven workflow).
> Sumber: truth map G3 (`InventoryLedger.tsx` setRows/setMovs lokal + PIN `'2468'`
> hardcoded & tercetak di label; `inventory.mutate` ADA tak dipanggil) + TODO P1 G3
> + triase batch 2/4 (wire-up `inventory.mutate`, PIN approver nyata).

## 1. Masalah (previously BROKEN)

1. Receive dialog + mutation desk + Issue-to-WO memutasi `useState` lokal, toast
   "sukses / audit-chained" — DB `parts` tak tersentuh (PUTUS di layer Request).
2. Gerbang approval = `pin.trim() === '2468'` di bundle JS, PIN dicetak di label
   UI ("demo: 2468") — bypass trivial (AUDIT_SAAS_E2E P1 VERIFIED).
3. Nomor dokumen `TRF-2026-0044…` / `ADJ-2026-0019…` = sekuens klien fiktif.
4. Badge `SYNCED · sha256:d8a2..f041` tanpa dasar; KPI (`$1,428,650.00`, `4,218`
   SKU, `94.2%`, `1,840`) konstanta; feed `MOV_SEED` statis.

## 2. Keputusan desain (final, minimal blast radius)

- **Tanpa migrasi skema.** Tabel `parts` tak punya kolom kategori/hub; UI me-merge
  kuantitas live (onHand/reserved/available) dari `GET /api/parts` ke katalog seed
  (pembawa metadata cat/spec/hub). Seed = metadata display + fallback offline,
  DITANDAI jujur — bukan sumber stok.
- **PIN diganti step-up TOTP server-side.** Semua mutasi wajib `stepUpCode`
  (6 digit, kode authenticator user yang sedang login) yang diverifikasi server
  via `verifyTotp` terhadap `users.totpSecret`. Tanpa MFA → 403
  `STEP_UP_UNAVAILABLE` jujur ("enroll MFA dulu"). Nol PIN di bundle/label.
- **Feed gerakan dari audit.** `GET /api/parts/movements` (baru, perm
  `inventory.read`) memetakan event audit `PART_*` → feed. Tanpa tabel baru.
- **KPI jujur parsial.** Saat live: valuasi = Σ onHand×price dari baris termuat,
  counts = baris termuat, label "loaded page". Saat demo: copy statis + badge Demo.
- **Out of scope (catat, jangan kerjakan):** tombol Reorder PR/PO (draft lokal →
  gap purchasing/prefill `?sku=`); rute transfers/adjustments; enrich kolom
  katalog (category/hub) via migrasi; CSV/XLS server-side.

## 3. Kontrak API

### 3a. POST /api/parts/movements (ubah — tambah step-up wajib)

Body = skema lama + `stepUpCode: z.string().regex(/^\d{6}$/)` (wajib).
Server, SEBELUM `mutateStock`:
1. Load `users.totpSecret` milik `ctx.userId`.
2. `null` → `forbiddenOp('STEP_UP_UNAVAILABLE', '…enroll MFA…')` (403).
3. `!verifyTotp(secret, code)` → `forbiddenOp('STEP_UP_INVALID', '…')` (403).
4. Lolos → `mutateStock` seperti biasa + catat `after.stepUpAt` di audit event.
`Idempotency-Key` tetap dihormati (di dalam `mutateStock`).

### 3b. GET /api/parts/movements (baru)

- `withRoute({ op: 'inventory.movements', method: 'GET', permission: 'inventory.read' })`.
- Baca `auditEvents` org ini, `action LIKE 'PART_%'`, order desc, limit 50.
- Map → `{ kind: IN|OUT|ADJ|TRF, delta, doc, ts, part, detail }`:
  `PART_RECEIVE`→IN, `PART_ISSUE`→OUT, `PART_ADJUST`→ADJ, `PART_RESERVE`/`RELEASE`→TRF;
  delta dari after.before–after.onHand; doc = after.ref ?? entityId;
  detail = reason + actor.
- Respons: `{ data: { movements } }`.

## 4. Kontrak UI (`InventoryLedger.tsx`)

1. Saat mount: `GET /api/parts` → merge qty per SKU → `live=true`;
   gagal → `live=false` + badge **"Demo offline"** (pola GAP-2).
   SKU seed yang tak ada di DB (VALV-GT2, FUSE-600V): baris berlabel
   "Not in system catalog" + kontrol mutasi/receive/issue disabled.
   SKU DB di luar seed (BRG-6204): append sebagai baris live, cat "—".
2. Receive dialog: tambah field **Approver code** (6 digit, tanpa nilai contoh);
   submit → POST RECEIVE + `Idempotency-Key: crypto.randomUUID()` →
   sukses: refetch list + prepend feed lokal sementara + toast berisi SKU/qty/PO;
   gagal: toast pesan server (tanpa ubah state).
3. Mutation desk: PIN → Approver code; mapping reason→type:
   Transfer/Emergency-borrow → ISSUE (`refNumber` = WO ref / dest);
   Scrap → ISSUE (`reason` = teks scrap); Cycle-count → ADJUST
   (`qty` = max(0, onHand−qn), `reason` wajib — server sudah enforce).
   Hapus sekuens TRF/ADJ klien; doc di toast = `refNumber` yang dikirim.
   Guard "available → 0": ISSUE yang menghabiskan available mewajibkan WO ref
   (validasi klien tetap + server 422 bila stok kurang).
4. Issue-to-WO: klik-1 membuka inline code field per baris; klik-2 POST ISSUE
   qty 1 + stepUp; tanpa kode tak ada request.
5. Copy jujur: hapus SEMUA kemunculan `2468` + label "demo: …";
   badge feed → `Live · server-fed` / `Demo offline`;
   hapus badge sha palsu; KPI live dihitung dari baris termuat;
   CSV mengekspor baris termuat + copy "loaded rows".
6. Feed: satukan gerakan audit-server (GET baru) + gerakan baru diposting sesi
   ini di atas; seed hanya saat demo.

## 5. Acceptance (test + runtime)

- Test integrasi baru (`tests/`): (a) POST tanpa stepUpCode → 400/403;
  (b) stepUp salah → 403 STEP_UP_INVALID, stok tak berubah;
  (c) user tanpa MFA → 403 STEP_UP_UNAVAILABLE;
  (d) happy RECEIVE + ISSUE (stok berubah + audit PART_* + stepUpAt);
  (e) replay Idempotency-Key → tanpa mutasi ganda;
  (f) ISSUE melebihi stok → 422, stok tetap;
  (g) GET movements memuat event barusan.
- `npm test` hijau; `tsc` nol error baru.
- Runtime MCP dev :3145 (m.vance, TOTP dari SEED_TOTP_SECRET):
  receive + mutation + issue persist (reload membuktikan),
  kode salah → toast jujur + stok tetap, baris non-katalog disabled,
  0 console error (di luar artefak offline bila dipakai).
- Update: truth map (baris Inventory → END-TO-END/PARTIAL jujur + [CLOSED GAP-3]),
  TODO (P1 G3 checked), PROGRESS (GAP CLOSED #3).
- Commit + push + verifikasi IN-COMMIT (pelajaran b5).
