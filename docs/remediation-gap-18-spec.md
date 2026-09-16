# GAP-18 — Spec (F23 jobs page jujur + wire ke queue nyata — TASK 3 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F23. Keputusan produk (final): **jujurkan + wire ke queue nyata**.

## 1. Fakta audit (dibaca langsung)

- `app/(ops)/settings/jobs/page.tsx` (209 baris): konstanta `JOBS` `:19-92` —
  6 baris fiksi maintenance DB (`JOB-2026-084..089`: S3 Glacier 842.6MB,
  RTO 11min, vacuum 48.2MB, purge 184.200, seed reset, FIDO2 rotation) +
  `auditHash` hex + link `/audit-trail?search=JOB-…`; badge
  `DAEMON OPERATIONAL`/`SOC2 AUDIT READY` `:108-109`; 4 KPI karangan
  (`482` jobs-30D `100% success`, `11 min`, `842.6 MB`, `02:00 UTC`).
  Semuanya tanpa sumber: worker in-memory tak menulis ini, audit_events tak
  pernah menerima event JOB-*.
- `app/api/queue/jobs/route.ts` (52 baris, kontrak MATCH PROMPT): GET izin
  `audit.read`, query `topic`/`status`/`limit=50` → `listJobs({orgId,…})`;
  POST izin `org.manage` — `action:'run_cycle'` → `{processed,completed,failed}`;
  `action:'retry'+jobId` → **job atau `null` (200 + data:null — TIDAK jujur,
  terbukti kurang → fix 404 `JOB_NOT_FOUND`, 2 baris, via DomainError pola
  repo)**; enqueue zod `{topic∈4 enum, payload record, maxAttempts 1-10 opt}`.
- `lib/queue/worker.ts` (174 baris): store in-memory `jobs[]` modul-level +
  **preseed 3 job fiksi di `listJobs` bila hasil filter kosong** — dua dosa:
  (a) orgId decoy/filter asing TETAP melihat 3 baris `APX-NUSA-01` (kebocoran
  tenant semu), (b) filter status topik yang sah-hasil-kosong malah menampilkan
  preseed. PROMPT langkah-4 menawarkan hapus ATAU label `contoh ephemeral`.
  **PILIHAN: HAPUS preseed** — lebih jujur (filter kosong = kosong + banner
  ephemeral di UI menjelaskan store hilang saat restart), konsisten dengan
  acceptance "setiap baris berasal dari API". Pilihan ini didokumentasikan di
  komentar kode + laporan + PROGRESS.
- `executeQueueCycle` menandai PENDING→COMPLETED (50ms no-op dispatch, tak
  pernah gagal) — count summary nyata atas store; UI menyebutnya dispatch loop
  tanpa efek eksternal (banner jujur), out-of-scope scheduler/executor nyata.
- Konsumen worker: HANYA route ini (grep enqueueJob/listJobs/retryJob/
  executeQueueCycle). `lib/queue/worker.ts` tak dipakai service lain.
- Terkait copy: `components/ops/CommandPalette.tsx:27` hint `S3 snapshot & WAL
  restore` untuk `/settings/jobs` → 1 baris jujurkan (nav copy halaman ini).
  SettingsHub (S3 vault/snapshot) = ruang TASK 6/F26, tak disentuh.

## 2. Perubahan

1. `lib/queue/worker.ts`: hapus blok preseed (12 baris) + komentar pilihan.
2. `app/api/queue/jobs/route.ts`: retry bila `retryJob()` null →
   `throw new DomainError(404,'JOB_NOT_FOUND',…)` (re-export di withRoute).
3. Tulis ulang `app/(ops)/settings/jobs/page.tsx` sebagai komponen klien:
   fetch `GET /api/queue/jobs` saat mount + filter change + pasca-aksi;
   tabel kolom yang didukung API saja (ID mono, topic badge, status badge,
   attempts n/max, created/completed UTC, payload ringkas mono, error);
   banner `In-memory queue — jobs hilang saat restart server · dispatch loop
   on-demand`; tombol `Run cycle` (window.confirm) → POST run_cycle → toast
   ringkasan `{processed,completed,failed}` nyata; tombol `Retry` per baris
   FAILED_DLQ → POST retry → refresh; form Enqueue ringkas (topic select
   4 enum + payload JSON opsional + maxAttempts) → POST 201 → refresh;
   filter topic/status mengisi query GET; empty state jujur; error API
   (termasuk 403 role tanpa `org.manage`) tampil apa adanya. HAPUS: JOBS
   const, kedua badge compliance, 4 KPI, auditHash+link audit-trail,
   narasi snapshot. Back-to-Settings link dipertahankan.
4. `CommandPalette.tsx` hint → `Live in-memory background job queue`.
5. Tak ada migrasi/izin baru (izin `audit.read`/`org.manage` sudah ada).

## 3. Test (`tests/unit.test.ts` — worker murni in-memory, tanpa DB/login HTTP)

- queue (GAP-18): list kosong awal (regresi preseed-dihapus); enqueue →
  list org-scoped + isolasi tenant (org B melihat 0); filter topic/status/
  limit; run_cycle: enqueue 2 → `{processed:2,completed:2,failed:0}` +
  state COMPLETED + attempts=1 + startedAt/completedAt; retryJob:
  FAILED_DLQ → PENDING reset attempts/error, id tak dikenal → null.
- Kontrak negatif route (404 retry tak ada, 400 topic invalid, 401 unauth)
  diverifikasi RUNTIME via curl (session seed): route 401-before-zod di test
  tak dapat menjangkau parse tanpa sesi — dibuktikan di laporan runtime,
  konsisten dengan larangan login-HTTP di test.
- `npm test` + `npx tsc --noEmit` hijau.

## 4. Runtime (dev :3157, sesi seed via login+TOTP dev-hint)

GET `/api/queue/jobs` → `[]` jujur; POST enqueue → 201 job nyata; GET
`?topic=pm_generator` → 1 baris; POST run_cycle → summary+job COMPLETED;
POST retry jobId-jadul → 404 `JOB_NOT_FOUND`; POST topic invalid → 400;
GET tanpa sesi → 401. UI `/settings/jobs` → 200, markup klien; paritas baris
dengan API di cek via request yang sama.

## 5. Docs (commit yang sama)

- `docs/audit-non-e2e-remediation-map.md` F23 → CLOSED + baris #23 master.
- `TODO.md` GAP-16 3/7; `PROGRESS.md` entri; `2026-09-16-PROMPT.md`
  pelacakan TASK 3 DONE + backfill hash TASK 2.

## Non-goals

- Scheduler/cron persisten, tabel DB jobs, executor side-effect nyata
  (out-of-scope PROMPT) — banner sudah menyatakan batas ini.
- SettingsHub S3/snapshot fiction (TASK 6/F26).
