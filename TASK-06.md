## TASK-06.md — Backend settings KV (bertahap, copy-first)

**Goal**
Fase 1: sapu klaim settings yang tanpa sumber (`production KV-store`, `SCADA healthy · 1,420 msgs/min`, PIN `2468`, secret tersimpan). Fase 2: bangun tabel `settings_kv` + service + routes (izin `settings.manage` yang sudah ada) dan wire UI sehingga pengaturan **bertahan setelah reload**, dan secret server **hash-only + tampil sekali**.

**Current state**
- `components/settings/SettingsHub.tsx`: `TABS` (15); `SEQS` (19–25); `SNAPS` (29–33) memuat `842.6 MB` (baris ret pertama sudah ber-qualifier `30-day Lock • Glacier Deep (planned — no backup job)`); `HOOKS` (37–41) health `'200 OK'`, lat `'68ms'/'114ms'/'92ms'`; `genKey` (48) = `apx_live_sec_${…}`; `SettingsHub` (64); state `epVal = 'mqtt://10.14.0.8:1883'` (**baris 93 — string terlarang `10.14.0.8` ADA di sini**), `erpSync='4 mins ago'`, `pin/pinOpen/pinTouched` (110–112), `extraKeys/shownOnce` (116–117); `useEffect(() => setKey(genKey()), [])` (119–121); `push` (123–127); `save` (129–133) toast saat ini **`TX-${n} · local state only — not persisted.`**; `exportBundle` (135–148) `apex-settings-bundle`; baris 440 link `View Job & Snapshot History` → `/settings/jobs`.
- **Tidak ada** tabel `settings_kv`, `lib/services/settings-service.ts`, atau route settings KV. `app/api/settings/` saat ini hanya `api-keys/route.ts`, `api-keys/[id]/route.ts`, `api-keys/[id]/revoke/route.ts` → **pola acuan = `lib/services/api-key-service.ts`** (hash-only + tampil-sekali).
- Izin `settings.manage` **sudah ada** (rbac.ts:21) → pakai itu, jangan buat izin baru.
- Peta F26 (282–288): FRONTEND-ONLY + klaim berat (`persisted · production KV-store`, `SCADA healthy · 1,420 msgs/min`, PIN 2468 reveal); Decision `MUST FIX copy dulu` + `NEED PRODUCT DECISION`; P2/S-then-L/MODULE.
- **DISKREPANSI PENTING:** PROMPT fase 1 mengutip toast `save` = `persisted · production KV-store + 3 node clusters` (~129–133) dan PIN `2468` (~705–706), tetapi sumber saat ini sudah memuat copy jujur (`local state only — not persisted`). **Verifikasi ulang saat eksekusi**: sapu sisa klaim yang benar-benar masih ada (mis. `10.14.0.8`, `200 OK` hooks, `842.6 MB`, `Glacier`, `SOC2`, `Fixer.io`, `Oracle ERP`, `99.94%`, PIN `2468` bila masih ada). Jangan "memperbaiki" yang sudah jujur.

**Fase 1 — copy fix (satu per satu)**
- `save` → `saved locally (demo — not persisted)`.
- `testConn` (~180–186, setTimeout) → `not connected (local demo)`.
- `registerHook` (~188–196) → `local demo — no delivery`.
- `reveal` (~205–213): hapus validasi PIN `2468` (input PIN + teks `Approver PIN 2468 required` ~705–706 ikut dihapus); reveal hanya untuk nilai demo lokal.
- `rotate` (~215–221) + `issue` (~223–233): secret dari `genKey` dilabeli `local demo key — not stored server-side` sampai fase 2.
- `snapshot` (~160–163) + `restoreSim` (~165–173): pertahankan kata `simulated`; toast sebut `0 rows touched`.
- Toggle `maint` (~253–255): label `local only — not enforced server-side` sampai fase 2.
- Sapu string tanpa sumber: `99.94%`, `Glacier`, `SOC2`, `Fixer.io`, `Oracle ERP` → hapus atau beri qualifier `planned / not connected`.

**Fase 2 — backend + wire**
- Tabel `settings_kv` (org-scoped key-value + metadata `scope`/`key`/`value`/`type`/`updatedBy`/timestamps) + migrasi bernomor berikutnya.
- Service `lib/services/settings-service.ts`: get/set/rotate/reveal-sekali + audit transaksional `SETTINGS_UPDATE`/`SETTINGS_SECRET_ROTATE`.
- Routes `app/api/settings/*` izin `settings.manage`: GET baca, PUT simpan, POST rotate (secret baru hash-only, tampil sekali), webhook CRUD + toggle maint (sebagai key khusus), snapshot/restore sebagai **metadata jujur** (bukan backup DB).
- Wire semua handler `SettingsHub` ke endpoint nyata. Reveal secret server hanya tampil sekali; setelah itu hanya `last4`/metadata.

**What NOT to touch**
- Jangan sentuh arsip beku `stitch_facility_maintenance_platform_ui/`.
- Jangan buat izin baru — pakai `settings.manage`.
- Jangan integrasikan Oracle ERP/Fixer.io/SCADA broker sungguhan (out-of-scope).
- Jangan ubah endpoint/route lain. Jangan tambah dependensi. Jangan commit file generated.

**Acceptance criteria**
- Fase 1: nol klaim produksi, PIN `2468` hilang, `10.14.0.8` disapu dari `SettingsHub`.
- Fase 2: round-trip save/load per tenant bertahan setelah reload; isolasi tenant terjaga; rotate → secret lama invalid & hanya hash tersimpan; reveal secret tampil sekali lalu hilang setelah reload; audit `SETTINGS_UPDATE`/`SETTINGS_SECRET_ROTATE` tertulis; snapshot/restore = metadata jujur.
- Guard-test: string klaim lama + `2468` tidak muncul lagi.
- `npm test` hijau, `npx tsc --noEmit` bersih, konsol browser nol error.

**Validation command**
```bash
npm test
npx tsc --noEmit
npm run dev
curl -s localhost:<port>/api/settings -b "<cookie>"     # imbauan: cek round-trip via UI lebih utama
```
Runtime: ubah pengaturan via UI → reload → tetap; rotate secret → tampil sekali → reload → hilang; konsol nol error.

**Expected output**
- Pengaturan bertahan setelah refresh; secret tak pernah plaintext di DB.
- Tanpa klaim produksi tanpa write; PIN `2468` dan `10.14.0.8` hilang.
- Seksi F26 di map diperbarui; satu commit tugas ini (mis. `GAP-16 TASK 6/7 (F26): settings KV backend + honest copy`).
