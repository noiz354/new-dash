## TASK-04.md — Deprecate retention digest secara eksplisit

**Goal**
Endpoint `GET /api/retention/digest` ditandai **deprecated secara eksplisit** tanpa menambah cron/consumer: respons memuat `deprecated: true`, `sunset` (ISO = tanggal eksekusi + 90 hari), dan `note`; handler + docstring diberi penanda deprecated. Endpoint **tidak dihapus**.

**Current state**
- `app/api/retention/digest/route.ts` = 15 baris: `GET(req)` → `withRoute({ op: 'retention.digest', method: 'GET', permission: 'wo.read' })` → `generateRetentionDigest(getDb(), ctx!.orgId)` → `{ data: digest }`. Docstring menyebut `Phase 3 C.5`; **tidak ada** kata deprecated.
- `lib/services/retention-service.ts` (`generateRetentionDigest`) = komputasi read-only; **nol caller lain** (tak ada UI, cron, atau consumer) → orphan.
- Peta audit F25 (baris 276–281): BACKEND-ONLY orphan, Decision `NEED PRODUCT DECISION`; keputusan produk, bukan bug.
- Tidak ada UI untuk endpoint ini → verifikasi runtime cukup `curl`.

**Relevant files**
- `app/api/retention/digest/route.ts` → ubah respons + komentar `@deprecated` + docstring.
- `lib/services/retention-service.ts` → tambahkan metadata deprecated di sini (lihat catatan test), jangan ubah logika komputasi.
- `docs/audit-non-e2e-remediation-map.md` → seksi F25: catat deprecated + tanggal sunset.
- `tests/integration.test.ts` → tambah test (wajib di file existing; `npm test` tidak menjalankan file baru).

Catatan test: handler authed tidak bisa dipanggil langsung di test (`withRoute` → `next/headers` `cookies()` → 401/`DYNAMIC_SERVER_USAGE`). Karena itu letakkan `deprecated`/`sunset`/`note` di `generateRetentionDigest` (service) supaya bisa diuji service-level, dan route cukup meneruskan. Hindari mocking `next/headers` bila tak perlu.

**What NOT to touch**
- **Jangan hapus** endpoint, service, atau permission `wo.read`.
- Jangan tambah cron / `pg_cron` / consumer notifikasi (eksplisit out-of-scope).
- Jangan ubah `db/schema.ts`, migrasi, atau RBAC.
- Jangan sentuh arsip beku `stitch_facility_maintenance_platform_ui/`.
- Jangan tambah dependensi. Jangan commit `next-env.d.ts` (generated) atau `.codegraph/codegraph.db`.
- Jangan pakai HTTP login flow di test (budget rate-limit habis) — pakai `admin` fixture.

**Acceptance criteria**
- `GET /api/retention/digest` dengan sesi → **200**, body `{ data: { ..., deprecated: true, sunset: '<ISO>', note: '<kalimat>' } }`.
- `sunset` = tanggal eksekusi + 90 hari, format ISO (`YYYY-MM-DD`), valid.
- `note` menyatakan: endpoint orphan, tanpa trigger/scheduler/consumer, tidak akan dikembangkan.
- Komentar `@deprecated` di atas handler + docstring route diperbarui.
- Tanpa sesi → **401** (izin `wo.read` tetap ditegakkan).
- Seksi F25 peta audit mencatat `deprecated` + tanggal sunset.
- `npm test` hijau, `npx tsc --noEmit` bersih.

**Validation command**
```bash
npm test
npx tsc --noEmit
npm run dev
curl -s -i localhost:<port>/api/retention/digest                 # tanpa cookie → 401
curl -s localhost:<port>/api/retention/digest -b "<cookie>"      # → deprecated:true + sunset
```
Runtime: cek flag + sunset pada respons dan 401 tanpa sesi (tak ada UI).

**Expected output**
- Respons JSON memuat `deprecated: true`, `sunset` ISO, `note`.
- Request tanpa autentikasi = 401.
- `deprecated` muncul di route + service; seksi F25 memuat tanggal sunset.
- F25 di map diperbarui; satu commit tugas ini (gaya repo, mis. `GAP-16 TASK 4/7 (F25): deprecate retention digest (sunset <date>)`).
