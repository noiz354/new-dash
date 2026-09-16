# Runtime Verification — TASK-20 Audit Truthfulness

- **Tanggal (UTC):** 2026-09-16
- **Branch:** `arena/01a0a835-new-dash`
- **Metode:** Chrome DevTools Protocol murni via `ws://127.0.0.1:9227` (driver Node WebSocket
  `/tmp/opencode/cdp/task20.cjs` + `cdplib.cjs`, reuse pola TASK-19/23). Bukan MCP browser.
- **Login:** real password + MFA (devHint TOTP) sebagai `m.vance@apexops.io` (Enterprise Admin —
  satu-satunya role demo dengan `audit.read`; Senior Field Tech tidak punya permission ini).
- **Halaman:** `/audit-trail` (server component `app/(ops)/audit-trail/page.tsx` +
  `components/audit/AuditTrail.tsx`).
- **Evidence:** `/tmp/opencode/evidence/task20/` (`01-audit-page.png`, `02-verify-chain.png`,
  `03-after-refresh.png`, `out.json`).

## Putusan: PASS

| Oracle | Hasil | Bukti |
|---|---|---|
| A render baris server | PASS | 8 kartu feed: 2 baris server nyata (`AUTH_MFA_OK`, `AUTH_MFA_CHALLENGE` dari login sesi ini) + 6 demo |
| B kolom hash jujur | PASS | 8× label "— no hash" (penulis audit belum mengisi `entryHash` → mode hash-opsional, dirender jujur, bukan dipalsukan) |
| C verify-chain server VALID | PASS | `POST /api/audit-trail/verify-chain` → 200, dialog `VALID — no mismatch`, root `86ceaa97…`, KPI integrity `100% / 2 events checked`, header Tip terisi reaktif |
| D nol copy fiksi di DOM | PASS | grep 16 frasa (`REAL-TIME SECURE`, `Merkle`, `WS Broker`, `Live Polling`, `NUSA-LEDGER`, `TXN-`, `L30D`, `Signed Proof`, …) → `[]` |
| E filter tanggal nyata | PASS | jumlah kartu 8 → 2 (`Today`) → 8 (`All Time`) |
| F refresh me-re-fetch | PASS | toast `Activity Feed Re-fetched` terlihat di screenshot 03 + probe independen 1212 ms (poll harness utama miss karena konteks JS hancur sesaat saat `router.refresh()` — artefak harness, didokumentasikan) |
| G nol console error | PASS | 0 error/exception; 114 log info semuanya spam CSP report-only dari injeksi Kaspersky (environmental, sama seperti TASK-19) |
| Network failures | — | tidak ada (tidak ada request APP ≥ 400) |

## Perbaikan yang dilakukan sebelum verdict (fix-then-verify)

1. **Hapus endpoint fabrikasi** `POST /api/audit-trail/verify-root` — mengembalikan `root`
   hard-coded `sha256:9a01f7bb…`, `blockHeight: 892104`, `consensusNode: NUSA-LEDGER-A`
   tanpa menyentuh DB. Tidak dipakai komponen mana pun. (Docs arsip `INTERACTION_TREES.md`,
   `exp-trees/part-governance.md`, `ui-audit/pass2/audit-trail.md` masih merujuknya —
   dicatat sebagai temuan, arsip tidak diubah.)
2. **Bug nyata ditemukan test baru:** `verifyAuditHashChain` memakai `asc` yang tidak diimport
   → endpoint verify-chain selalu 500 sejak awal. Test integrasi baru mengeksposnya; fix 1 baris.
   Artinya tombol Verify tidak pernah berfungsi sebelum fix ini.
3. **Copy jujur:** badge `AUDIT BUS: REAL-TIME SECURE` → `AUDIT LEDGER • APPEND-ONLY`;
   `SHA-256 Merkle Chain` → `SHA-256 hash chain (server)` (rantai linear, bukan Merkle);
   `Epoch: 1748097318` → Tip root-hash reaktif (`unverified` sebelum verify);
   `TXN-{id}-NUSA` → `Event #`; `Signed Proof` → `Event Evidence (JSON)`, manifest
   `…_EVIDENCE_V1`, catatan "Unsigned JSON"; `IMMUTABLE` → `APPEND-ONLY`.
4. **KPI fabrikasi → hitungan nyata:** `Security Overrides 3` → Critical Events dalam view;
   `Active Telemetry Terminals 42 / WS Broker: 12ms` → Fallback Demo Rows (transparan soal campuran);
   `Total Audited Events (L30D)` → Total Ledger Events (server); Integrity sudah jujur (`— / Not verified`).
5. **Metadata sesi palsu untuk baris server dihapus** (IP `10.14.8.42`, terminal `NUSA-CORE-NODE`,
   badge `USR-…`, MFA `Session Token Cookie Validated`, role tebakan, `requestId` `req_audit_…_auto`)
   → `—` + tooltip `Not recorded by the server`. Baris demo ber-badge `DEMO` di feed + inspector.
6. **Kontrol palsu:** checkbox `Live Polling (5s)` (tanpa efek) dihapus; tombol refresh sekarang
   `router.refresh()` nyata. Filter tanggal yang tadinya no-op kini memfilter beneran
   (`Today` = batas hari UTC). PDF yang berpura-pura men-download kini disabled + caption jujur;
   Flag/Rollback berlabel jujur (tidak menulis apa pun).
7. **Test:** `tests/audit-truthfulness.test.ts` (20 grep frasa fiksi + assert verify-root tetap
   terhapus + delegasi verify-chain) didaftarkan di `npm test`; test integrasi
   `verifyAuditHashChain` valid + deteksi tamper (`entryHash` salah → `valid:false`,
   `tamperedEventId` tepat). **`npm test`: 61/61 PASS.** Typecheck: 116 error pre-existing,
   0 di file yang diubah (sama sebelum/sesudah).

## Observasi (bukan blocker)

- Ledger berjalan dalam **mode hash-opsional**: semua penulis `audit_events` membiarkan
  `entryHash` null sehingga kolom hash tampil `—` dan verify-chain me-recompute (bukan
  meng-assert hash tersimpan), kecuali bila suatu baris kelak menyimpan `entryHash`
  (jalur assert + tamper-detection sudah diuji). Backfill `entryHash` saat insert adalah
  kandidat backlog, bukan bagian TASK-20.
- Sidebar/title global masih memuat copy lain (`Live Sync Active`, `TELEMETRY BUS`, demo banner)
  — di luar scope TASK-20, kandidat Step 2.
