# GAP-21 — Spec (F26 settings KV backend, copy-first — TASK 6 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F26. Keputusan produk (final): **bangun KV backend** — FASE 1 (copy honest)
lalu FASE 2 (backend + wire) dalam task yang sama. Izin repurpose:
`settings.manage` (SUDAH ada; assignments efektif via `*` Enterprise Admin —
prompt melarang izin baru).

## 1. Fakta audit (dibaca langsung)

- `components/settings/SettingsHub.tsx` (739 baris). Sudah honest sebagian dari
  era GAP-12 (banyak label `(local demo)`); res ≤ FASE 1:
  - `2468` PIN: validasi `pin.trim() !== '2468'` (`:207`) + input/`Approver PIN
    2468 required` (`:704-706`) → DIHAPUS total; reveal hanya untuk nilai demo
    lokal / plaintext-rotate di memori komponen.
  - `10.14.0.8`: default broker/epVal (`:91/93`) → diganti kosong/tidak
    dikonfigurasi (render fallback `not configured (local demo)`).
  - rotate/issue (`:215-233`) → toast rahasia wajib berlabel `local demo key —
    not stored server-side` pada fallback offline (FASE 2: toast memuat
    last4 tersimpan server).
  - snapshot/restoreSim (`:160-176`) → kata `simulated` + `0 rows touched`
    pada toast; download manifest kini menyebut metadata-jujur.
  - maint toggle (`:253`) → toast/label `local only — not enforced
    server-side` (fallback); FASE 2: persisted via key khusus.
  - Sweep `99.94%`/`Glacier`/`SOC2`/`Fixer.io`/`Oracle ERP`: periksa satu-satu
    — sebagian sudah berqualifier planned (dipertahankan); dipastikan tak ada
    klaim tanpa qualifier.
  - `save` (`:131`) sudah 'staged (local) · not persisted' — FASE 2
    mengganti dengan write server saat live.
- Backend settings KV: NOL. Pola referensi: `lib/services/api-key-service.ts`
  (hash-only + tampil-sekali, GAP-13).

## 2. FASE 2 — keputusan desain

- Tabel `settings_kv` (migrasi 0006): kolom — `organizationId` text FK cascade,
  `key` text (identifier dot-hierarki, regex `^[A-Za-z0-9_.:-]{2,120}$` tanpa
  slash), `value` text (JSON ter-encode; untuk kind=secret bukan nilai
  plaintext), `kind` text ('value'|'secret'), `last4` text nullable (secret),
  `updatedBy` text (display name), timestamps TZ. PK `(organizationId, key)`.
  Seed 1 baris canon: `ops.maint_mode` = `false` (kind value) — satu set
  setting minimal per prompt. [ASUMSI-OTOMATIS: tanpa baris seed fiktif lain;
  format nilai diambil dari kebutuhan UI sekarang.]
- `lib/services/settings-service.ts` (meniru api-key pattern):
  - `listSettings(db, ctx)` → `{ key, kind, last4, value (bila kind=value), updatedAt, updatedBy }[]` — nilai secret TIDAK PERNAH keluar.
  - `putSetting(db, ctx, key, { value, kind? }, opts)` — upsert org-scoped;
    kind=value menyimpan JSON.stringify; bila kind=secret → 400 (secret wajib
    lewat rotate — tak pernah PUT plaintext dari UI). audit `SETTINGS_UPDATE`
    (before/after tanpa nilai secret). idempoten scope `settings.put`.
  - `rotateSecret(db, ctx, key, opts)` — generate `apx_live_sec_<32hex>`
    crypto server-side; simpan sha256 → `value` = hash, `last4`; return
    plaintext SEKALI (body 201/200). audit `SETTINGS_SECRET_ROTATE` (last4 lama
    → baru; nilai tak pernah dicatat). idempoten scope `settings.rotate`
    — replay tidak mendobel row audit & mengembalikan respons asli (replay
    HARUS menyertakan plaintext tersimpan dari respons asli — denganIdempotency
    menyimpan envelope, jadi replay mengembalikan plaintext yang sama; OK).
- Routes (izin `settings.manage` semua endpoint):
  - `app/api/settings/route.ts` — GET list.
  - `app/api/settings/[key]/route.ts` — PUT (zod: value JSON ≤ 16k; kind
    'value'|'secret'; kind=secret → 400 SECRET_VIA_ROTATE).
  - `app/api/settings/[key]/rotate/route.ts` — POST → `{ key, last4, secret }`.
- Key yang dipakai UI (dokumentasi sumber kebenaran):
  - `general.profile` (value: `{company,brand,ccy,tz,fiscal,week}`),
  - `integrations.broker` (value: string; kosong = not configured),
  - `integrations.webhooks` (array {url,name,topics,auth} — tanpa health/lat
    karena delivery tidak pernah diuji),
  - `ops.maint_mode` (bool), `ops.backup_last_snapshot` /
    `ops.backup_last_restore` (metadata jujur: `{ts, mode:'simulated',
    rowsTouched:0}` — BUKAN backup DB),
  - `security.core_api_secret` (kind secret), `security.issued_keys`
    (array {name,last4} metadata).
- UI wire (semua handler): load GET on mount + provenance badge (sudah ada
  pola); save → PUT general.profile; broker endpoint save → PUT
  integrations.broker; maint → PUT ops.maint_mode; hooks add/edit/delete →
  PUT integrations.webhooks; snapshot/restore → PUT metadata ops.backup_*;
  rotate → POST rotate (plaintext TOAST tampil sekali; last4 server-render);
  issue → POST rotate `security.issued.<slug>` + PUT integrations.issued_keys;
  reveal → hanya plaintext rotate di memori komponen, selain itu jujur
  "hash-only — rotate untuk melihat baru". Fallback offline: perilaku lama +
  label jujur (toast menyebut 'not persisted'/'local demo').

## 3. Test

- Integration (service-level, pola sebelumnya): PUT/GET round-trip value;
  secret rotate 2× → hash beda, last4 beda, GET tak membocorkan nilai, plaintext
  hanya di respons rotate; replay idempoten (audit tak dobel); tenant guard
  (decoy list tanpa baris canon; put decoy pada key canon tak menyentuh baris
  canon); SETTINGS_UPDATE & SETTINGS_SECRET_ROTATE tertulis; PUT kind=secret → 400.
- Guard-truthfulness: SettingsHub nol `2468`/`10.14.0.8`/`KV-store`/
  `handshake 200 OK`; ada `/api/settings`, `not stored server-side`,
  `simulated · 0 rows touched`.
- `npm test` + `tsc` hijau.

## 4. Runtime

Rangkaian isolasi :3158 (seperti TASK 5): list GET → PUT general.profile →
reload GET persists → rotate → respons memuat secret + last4 → GET sesudahnya
tak memuat nilai → PUT kind=secret → 400 → unauth 401 → `[key]` zod 400 →
halaman /settings 200 + gui strings fiksi nol.

## 5. Docs (commit sama)

F26 CLOSED + master 26; truth-map settings row; TODO + GAP-16 6/7; PROGRESS;
PROMPT pelacakan (TASK 6 DONE + backfill hash TASK 5 `26ffe6e`).

## Non-goals

- Integrasi Oracle ERP / Fixer.io / SCADA broker sungguhan; enforce maintenance
  mode di middleware (out-of-scope prompt: toggle tetap metadata saat ini);
  backup DB sungguhan.
