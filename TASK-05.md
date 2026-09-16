## TASK-05.md — Backend facilities hub (bertahap, honest-first)

**Goal**
Fase 1: jujurkan copy `FacilityHub` (hapus klaim GIS/BIM/realtime yang fiktif). Fase 2: bangun tabel + service + routes `facilities` yang nyata dan wire UI sehingga data **bertahan setelah reload** dan tiap mutasi punya baris audit.

**Current state**
- `components/facilities/FacilityHub.tsx` (`export function FacilityHub()` baris 48): handler `exportGeo` (82–96, `download('basement-l2-spatial.geojson', …)` dengan `geometry: null`), `savePolygon` (98–106), `dispatchAudit` (108–112 → `AUD-2026-0${140+n} · Room #B-204 · TMPL-HVAC-CHL-02 · crew notify logged (no pager) · local simulation.`), `addRoom` (114–122), `logDefect` (124–132), `reassign` (134–137). Semua state lokal murni (`extraRooms`, `defects`) → **hilang saat reload**. KPI `12 Sites · 34 Bldgs · 1,420 Rooms` (~193), Badge `BIM LOD-350` (~206).
- Baris ~161 (`Spatial sync: local demo · no broker`), ~95 (`geometries unseeded`), dan qualifier `no pager`/`local simulation` **sudah jujur** → jangan diubah.
- **Belum ada** tabel `facilities`, `lib/services/facility-service.ts`, maupun `app/api/facilities/*`.
- Pola acuan: `lib/services/vendor-service.ts` (`createVendor` 116 → slug unik `409 VENDOR_SLUG_EXISTS`, audit `VENDOR_CREATE`, `withIdempotency` + `requestHash`; `amendVendor` 182; `renewVendor` 245); routes `app/api/vendors/route.ts` + `app/api/vendors/[slug]/route.ts`; RBAC `vendors.read`/`vendors.manage` (rbac.ts:17, di `READ_ALL`:28, Facility Director:36, Engineering Lead:40).
- Peta F15 (172–177): FRONTEND-ONLY + klaim `Spatial Sync Realtime · HEALTHY`/`BIM MATCHED`; Decision `HONEST PLACEHOLDER` + `NEED PRODUCT DECISION`; P2/S/MODULE.
- `app/(ops)/facilities/page.tsx` merender `<FacilityHub>`; `app/(ops)/facilities/[id]/page.tsx` punya `ROOMS` + `FacilityRoomDetailPage` sendiri (read-only, di luar scope).

**Fase 1 — honest copy (ubah hanya yang fiktif)**
- Tombol Recalibrate (~257) toast `GIS recalibrated … drift 0.00m (local simulation)` → label jujur `local demo — no GIS write`.
- Baris ~353 `BIM REVIT 2026.2 MODEL MATCHED` → `BIM reference (design only — not connected)`.
- `dispatchAudit`: pertahankan `no pager` + `local simulation`; pastikan ID `AUD-2026-0…` berlabel `local counter — not persisted`.
- Tambah suffix `local staging — not persisted` pada toast sukses `savePolygon`, `addRoom`, `logDefect`, `reassign`, `exportGeo`.
- Pertahankan apa adanya: baris ~161, ~95, badge `STAGED` (~242).

**Fase 2 — backend + wire**
- Tabel `facilities` (id, organizationId tenant, name, code unik per org, geojson nullable TEXT, timestamps) + migrasi bernomor berikutnya (0005) + seed minimal 1 baris canon per org seed.
- Service baru `lib/services/facility-service.ts` meniru `vendor-service.ts`: list/get/create/update + audit transaksional `FACILITY_CREATE`/`FACILITY_UPDATE` + `withIdempotency` untuk create/update. **Tanpa nomor canon**, pakai `code`/slug seperti vendor.
- Routes: `app/api/facilities/route.ts` (GET izin baru `facilities.read`, POST `facilities.manage` + zod) dan `app/api/facilities/[id]/route.ts` (GET + PATCH).
- RBAC: daftarkan `facilities.read` (ke `READ_ALL`) + `facilities.manage` (Facility Director + Engineering Lead), meniru pasangan vendors.
- Wire FacilityHub ke endpoint nyata: daftar lokasi + tambah sub-location + reassign + log defect. Defect disimpan sebagai baris/update facility ATAU tabel defect kecil — **pilih satu, dokumentasikan**. GeoJSON export pakai geometri server; `null` → label `unmapped`. Toast sukses menyebut ID server.

**What NOT to touch**
- Jangan sentuh arsip beku `stitch_facility_maintenance_platform_ui/`.
- Jangan tambah broker spasial nyata, integrasi Revit/BIM, atau peta interaktif baru (out-of-scope).
- Jangan ubah permission existing — hanya tambah pasangan `facilities.*`.
- Jangan ubah endpoint lain atau `app/(ops)/facilities/[id]/page.tsx` kecuali perlu konsistensi.
- Jangan tambah dependensi. Jangan commit file generated.

**Acceptance criteria**
- Fase 1: nol klaim GIS/BIM/realtime fiktif (yang sudah jujur tetap).
- Fase 2: tambah lokasi via UI → reload → **tetap ada**; `code` duplikat per-org → 409; isolasi tenant terjaga (decoy org); audit `FACILITY_CREATE`/`FACILITY_UPDATE` tertulis; GeoJSON dari server (`null` → `unmapped`); toast sukses menyebut ID server.
- Guard-test: `10.14.0.8` dan `MODEL MATCHED` tidak muncul lagi di `FacilityHub`.
- `npm test` hijau, `npx tsc --noEmit` bersih, konsol browser nol error.

**Validation command**
```bash
npm test
npx tsc --noEmit
npm run dev
curl -s localhost:<port>/api/facilities -b "<cookie>"     # daftar facility org
npm run dev   # runtime: buka /facilities via chrome-devtools
```
Runtime: tambah lokasi → reload → tetap; edit → audit-trail memuat event facility; konsol nol error.

**Expected output**
- FacilityHub tanpa klaim GIS/BIM/realtime fiktif; data lokasi bertahan setelah refresh.
- Audit trail memuat event facility nyata.
- Seksi F15 di map diperbarui; satu commit tugas ini (mis. `GAP-16 TASK 5/7 (F15): honest facilities hub + backend`).
