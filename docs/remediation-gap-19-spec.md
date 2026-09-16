# GAP-19 — Spec (F25 deprecate retention digest — TASK 4 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F25. Keputusan produk (final): **deprecate eksplisit** — TANPA cron/consumer;
endpoint TIDAK dihapus.

## 1. Fakta audit (dibaca langsung)

- `app/api/retention/digest/route.ts` (16 baris): GET via `withRoute`
  (`op: 'retention.digest'`, izin `wo.read`) → `generateRetentionDigest(getDb(),
  ctx.orgId)` → `{ data: digest }`. MATCH dengan deskripsi PROMPT.
- `lib/services/retention-service.ts`: compute read-only murni
  (`urgentSlaThreats` dari WO aktif w/ SLA ≤240m, `upcomingPreventiveMaintenances`
  dari pmRules, `healthScorePct`) — tanpa side effect; **konsumen satu-satunya
  = route di atas** (grep nol caller lain). Nol cron/trigger/notifier di repo.
- Sunset: tanggal eksekusi 2026-09-16 + 90 hari = **2026-12-15**.

## 2. Perubahan

1. `app/api/retention/digest/route.ts`:
   - Respons GET → `{ data: { ...digest, deprecated: true, sunset: '2026-12-15',
     note: <kalimat> } }` — status tetap 200, izin `wo.read` tetap.
   - Komentar `// Deprecated:` di atas handler + docstring route diperbarui
     (deprecated per 2026-09-16, removal setelah sunset, tanpa trigger/
     scheduler/consumer).
   - Konstanta sunset/note diambil dari service (satu sumber — bisa diuji tanpa
     HTTP; lihat bawah).
2. `lib/services/retention-service.ts`: tambah 2 ekspor konstanta
   `RETENTION_DIGEST_SUNSET = '2026-12-15'` + `RETENTION_DIGEST_NOTE` (kalimat:
   endpoint orphan tanpa trigger/scheduler/consumer, tidak akan dikembangkan,
   penghapusan pada tanggal sunset). Compute digest TIDAK diubah.
3. Tidak ada migrasi/route baru/izin baru.

## 3. Test (`tests/integration.test.ts` — pola GAP sebelumnya)

- digest regression: `generateRetentionDigest(db, admin.orgId)` tetap menghasilkan
  shape lama (organizationId/urgentSlaThreats array/healthScorePct number) —
  compute tidak berubah akibat retrofit flag.
- deprecation contract: `RETENTION_DIGEST_SUNSET === '2026-12-15'` dan selisih
  `sunset − 2026-09-16` tepat 90 hari; `RETENTION_DIGEST_NOTE` menyebut no
  trigger/scheduler/consumer.
- izin tetap: panggil GET handler dengan `NextRequest` tanpa cookie → 401
  `UNAUTHENTICATED` (pola signup-400 TASK 1).
- 200 + flag pada envelope penuh diverifikasi runtime (curl authed) — handler
  berizin tidak bisa mint sesi di node:test (cookies() → null), dibuktikan di
  laporan runtime.
- `npm test` + `npx tsc --noEmit` hijau.

## 4. Runtime (curl dev :3157; tanpa UI — endpoint backend-only)

- GET authed (sesi seed) → 200 envelope `data.deprecated === true`,
  `data.sunset === '2026-12-15'`, `data.note` non-empty + shape digest lama utuh.
- GET tanpa sesi → 401 `UNAUTHENTICATED`.

## 5. Docs (commit yang sama)

- `docs/audit-non-e2e-remediation-map.md` F25 → CLOSED (sebut tanggal sunset)
  + baris #25 master; `docs/audit-full-app-truth-map.md` baris retention bila
  ada → deprecated; `TODO.md` (retention/digest decided-deprecated + GAP-16
  4/7); `PROGRESS.md` entri; `2026-09-16-PROMPT.md` TASK 4 DONE + backfill
  hash TASK 3.

## Non-goals

- Penghapusan endpoint, cron/pg_cron, consumer notifikasi (out-of-scope PROMPT).
- Redirect/guidance ke endpoint lain (tak ada konsumen yang dirugikan).
