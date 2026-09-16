# GAP-20 — Spec (F15 facilities hub honest-first + backend — TASK 5 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F15. Keputusan produk (final): **bangun backend facilities** — FASE 1 (copy
honest) lalu FASE 2 (backend + wire) dalam task yang sama.

## 1. Fakta audit (dibaca langsung)

- `components/facilities/FacilityHub.tsx` (575 baris) — FRONTEND-ONLY:
  - `:257` recalibrate → toast `…drift 0.00m (local simulation)` (FASE 1→
    `local demo — no GIS write`).
  - `:353` `BIM REVIT 2026.2 MODEL MATCHED` (FASE 1→ `BIM reference (design
    only — not connected)`).
  - `:111` dispatchAudit AUD-2026-0{id lokal} → tambah label `local counter —
    not persisted` (qualifier `no pager`/`local simulation` dipertahankan).
  - savePolygon `:101`, addRoom `:117`, logDefect `:127`, reassign `:135`,
    exportGeo `:82-96` → suffix `local staging — not persisted` pada toast
    sukses (berlaku di cabang fallback/offline pasca-wire).
  - Sudah-jujur & TAK disentuh: `Spatial sync: local demo · no broker`
    (`:161`), `geometries unseeded` (exportGeo), badge `STAGED`, struktur
    `seeded:` ROOMS, copy note struktural lain.
  - `10.14.0.8` TIDAK ada di file ini (ada di SettingsHub/RunChecklist/
    AuditTrail = scope task lain/gerbang final). Guard-test tetap mengunci
    absensinya di FacilityHub per PROMPT.
- Backend facilities: NOL — tak ada tabel/service/route/izin. Vendor =
  templat pola (schema PK komposit org+slug, service audit+idempoten, route
  zod+withRoute, RBAC vendors.read/manage).

## 2. FASE 2 — keputusan desain (dokumentasi eksplisit per PROMPT)

- Tabel `facilities`: `id` uuid (opaque server), `organizationId` FK cascade,
  `code` TEXT (org-unique — turunan slug UPPER dari nama di server, mirror
  vendor slug; TANPA nomor canon), `name`, `geojson` TEXT NULL (unmapped),
  `meta` TEXT JSON `{defects:[], transfers:[]}`, `createdAt`+`updatedAt` TZ.
  PK komposit `(organizationId, code)` + uniqueIndex pada `id` (mirror vendors).
- **Pilihan penyimpanan defect & reassign (PROMPT menawarkan 2 opsi untuk
  defect): "update facility" dipilih untuk KEDUANYA** — defect & transfer
  request direkam server-side sebagai append ke `meta` (entri
  `{text|assetCode,toCode, at, by}`), setiap append + edit name/geojson =
  baris FASE audit `FACILITY_UPDATE` transaksional. Bukan tabel defect kecil.
  Alasan: satu mekanisme jujur untuk dua aksi stage; audit-trail tetap
  granular per aksi.
- Migrasi `0005_*` via `npm run db:generate` (drizzle-kit lokal).
- Seed idempoten (onConflictDoNothing): canon `B2-MECH-204`
  "Centrifugal Chiller Plant Room #B-204" (align node UI LOC-B2-MECH-204;
  geojson NULL = unmapped) + 1 baris decoy `DOCK-QA-01` di APX-GL-9021.
- `lib/services/facility-service.ts` mirror vendor-service: `listFacilities`
  /`getFacility` (404 `FACILITY_NOT_FOUND`) / `createFacility`
  (zod-validasi service: name 2–160; `codify()` name→code; 409
  `FACILITY_CODE_EXISTS`; audit `FACILITY_CREATE`; `withIdempotency` scope
  `facility.create`) / `updateFacility` (name/geojson/defect/transfer; patch
  kosong → 400 `VALIDATION_ERROR`; audit `FACILITY_UPDATE`; idempoten scope
  `facility.update`).
- Routes: `app/api/facilities/route.ts` GET `facilities.read`
  (`{facilities, can:{manage}}` — can() nyata), POST `facilities.manage`
  (zod + header idempotency-key, 201). `app/api/facilities/[id]/route.ts`
  GET `facilities.read`, PATCH `facilities.manage` (zod union field opsional).
- RBAC (`lib/auth/rbac.ts`): tambah `facilities.read` (grup READ_ALL) +
  `facilities.manage` (peran persis sama dengan `vendors.manage`: Enterprise
  Admin via `*`, Facility Director, Engineering Lead).

## 3. FASE 2 — wire FacilityHub (FASE 1 labels berlaku di cabang offline)

- State `facilities` + `facLive` dari GET on-mount; badge provenance
  `Live · server-fed` / `Demo offline` di header (pola modul lain).
- Panel "Server locations" baru di kolom indeks: baris rows server (code
  mono + name + badge LIVE + count meta defects/transfers), empty-state jujur
  bila DB kosong. ROOMS/struktur tree tetap demo struktural (label `seeded`
  ada) — TIDAK diklaim server.
- addRoom: online → POST `{name}` → toast `Facility <code> created · id … ·
  server-persisted`; offline → perilaku lama + suffix `local staging — not
  persisted`. 409 duplikat → toast error jujur.
- logDefect/reassign: online → PATCH canon `B2-MECH-204` `{defect}` /
  `{transfer:{assetCode,toCode}}` → toast menyebut code + count server +
  `FACILITY_UPDATE audited`; offline → staging lokal + suffix wajib.
- exportGeo: online → fitur dari rows server (`geometry` = geojson ter-parse,
  properties `mapped`/`unmapped`), toast menyebut N rows server; offline →
  perilaku lama (sudah jujur) + suffix.
- savePolygon tetap lokal (suffix wajib); Recalibrate/AUD/BIM copy FASE 1.
- Defect list menampilkan meta.defects server (badge `SERVER`) bila live,
  fallback list lokal (badge `LOGGED — staging`).

## 4. Test

- `tests/integration.test.ts` (service-level): create happy (code turunan,
  id, audit CREATE) + replay idempoten (key sama → row sama, audit tetap 1) +
  409 code dup + guard tenant decoy (list 0, get 404) + update defect/transfer
  append persist (get → arrays tumbuh) + empty patch 400 + name/geojson patch
  + audit UPDATE. createSession/verifySession decoy pola gap14.
- `tests/audit-truthfulness.test.ts`: absence `10.14.0.8` + `MODEL MATCHED`
  di FacilityHub; presence `/api/facilities`, `local staging — not persisted`,
  `local demo — no GIS write`, `local counter — not persisted`, `design only`.
- `npm test` + `tsc` hijau.

## 5. Runtime (dev :3157, sesi seed + curl)

`db:setup` (migrasi 0005) → GET list (1 baris seed canon, geojson null) →
POST nama baru → 201 + code → GET ulang 2 baris (persist) → PATCH defect +
transfer (metas tumbuh) → PATCH `{}` → 400 → POST nama sama → 409 →
`/api/audit-trail` memuat FACILITY_CREATE/UPDATE → unauth 401 → HTML
`/facilities` 200: nol `MODEL MATCHED`, copy honest live. UI reload-persistence
diwakili GET kembali (state server = sumber UI).

## 6. Docs (commit yang sama)

- remediation map F15 → CLOSED + master row 15; truth-map facilities row;
  TODO (4/7→5/7 + FRONTEND-ONLY bullet facilities dicoret); PROGRESS entri;
  PROMPT pelacakan TASK 5 DONE + backfill hash TASK 4.

## Non-goals

- Broker spasial sungguhan, integrasi Revit/BIM, peta interaktif baru
  (out-of-scope PROMPT); hierarchy multi-tier di backend (rows flat + code).
- Migrasi ROOMS struktural ke server (tetap demo ber-label); gerbang-final
  sweep `10.14.0.8` di file lain (TASK 6/7).
