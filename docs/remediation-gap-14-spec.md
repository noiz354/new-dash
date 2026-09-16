# GAP-14 Spec — Reports + vendors + BIM (F21+F14+F8) (CLOSE ALL GAPS)

## Problem (audit)

- **F21 Reports hub** FRONTEND-ONLY + fiksi: KPI cards statis (OPEX $1,428,650 / MTTR 2.38h / 99.82% / $582,340), charts MONTHS/CATS/SLA statis, DOSSIERS statis, schedule() local-only dengan toast "Dispatch scheduled" (tanpa email backend). `runQuery` SUDAH live (GAP-12). Sisa: KPI cards + honest-label untuk yang statis + schedule jujur.
- **F14 Vendors** DEAD-END: backend MISSING total (nol route/service; tabel `vendors` + seed orphan). Klaim fiksi: DUNS-verified, WO-0905 drafted, SHA-anchored. Break: handler→API (nothing exists).
- **F8 BIM** MOCKED: `refresh()` = setTimeout 600ms + label `· live`; NODES literal; "38 telemetry nodes". Backend ADA: `GET /api/telemetry/ingest` (listRecentSensorReadings nyata). Break: handler→service (tak ada fetch).

## Decision

- F21: MUST INTEGRATE (KPI←aggregates) + honest-label statis. Target: END-TO-END (KPI) + PARTIAL-honest (charts/schedule).
- F14: MUST INTEGRATE (service+routes dari schema yang ADA + migrasi kecil). Target: END-TO-END.
- F8: MUST INTEGRATE (poll ingest asli). Target: END-TO-END (refresh live) + reference fallback berlabel.

## Backend — vendor-service baru (`lib/services/vendor-service.ts`)

Mengikuti pola org-service / procurement-service:

- `listVendors(db, ctx)` → rows vendors tenant + derived `msaStatus` (ACTIVE/EXPIRED by date/null→'NO MSA'), `daysLeft`.
- `getVendor(db, ctx, slug)` → 404 `VENDOR_NOT_FOUND` tenant-scoped.
- `createVendor(db, ctx, {name, tier, scope?, contact?, phone?, duns?})`:
  slugify nama; konflik slug → 409 `VENDOR_SLUG_EXISTS`; zod di route (name min3, tier enum TIER-1/2/3, duns regex opsional `##-###-####` — format-only, copy jujur "format checked, not DUNS-registry verified"); audit `VENDOR_CREATE`; idempoten scope `vendor.create`.
- `updateVendor(db, ctx, slug, {scope?, contact?, phone?, duns?, tier?})` → 404; audit `VENDOR_AMEND` (before/after); idempoten scope `vendor.update`.
- `renewVendor(db, ctx, slug, {termMonths: 12|24|36, msaNumber?})` → 404; `msaExpiresOn` baru = max(expiry lama, today) + termMonths; audit `VENDOR_RENEW`; idempoten scope `vendor.renew`.
- `commendVendor(db, ctx, slug, {note min10})` → 404; audit `VENDOR_COMMEND` (note di after); tanpa tabel scorecard — toast jujur "recorded in audit trail".
- Related POs: reuse `listPurchases` filter vendorSlug (baca procurement-service; bila signature tak mendukung, query langsung purchaseOrders by vendorSlug di service vendor).

Migrasi 0004 (`db:generate`): `vendors.scope/contact/phone/duns` nullable text (amend/onboard persist penuh; tanpa migrasi amend hanya audit = half-E2E — DITOLAK).

Routes:
- `GET /api/vendors` (perm `vendors.read`) → `{vendors}`.
- `POST /api/vendors` (perm baru `vendors.manage`) → 201.
- `GET /api/vendors/[slug]` (`vendors.read`) → `{vendor, relatedPOs}`; 404 jujur.
- `PATCH /api/vendors/[slug]` (`vendors.manage`) → body `{op:'amend'|'renew'|'commend', ...}` atau tiga route kecil? Satu PATCH dengan `op` discriminator (pola scale-down; dokumentasikan).
- RBAC: tambah `'vendors.manage'` ke PERMISSIONS + mapping: Facility Director + Engineering Lead dapat manage (cermin po.approve/inventory.mutate); Senior Field Tech tetap read-only.

Dispatch WO dari vendor: TIDAK ada endpoint vendor-dispatch baru — dialog POST langsung ke `POST /api/work-orders` yang ADA (perm `wo.create`; body title+assetCode+priority; Idempotency-Key otomatis apiFetch) → nomor WO canon nyata. MSA-expired → dispatch dikunci (UI disabled + server? server tak tahu vendor — UI-level lock + copy jujur; enforcement penuh butuh kolom vendor di WO = GAP-16 decision).

## Frontend

**VendorList.tsx**: live `GET /api/vendors` + SEED fallback demo-badge (pola GAP-09); create → POST + refetch; renew → PATCH op=renew + refetch; KPI dari baris (active/expired/avg onTimePct); export CSV jujur (live vs demo); copy "DUNS verified format" → "DUNS format checked (not registry-verified)".
**VendorDetail.tsx**: live `GET /api/vendors/[slug]` + 404 jujur (resolveVendor/synthetic fallback DIHAPUS); amend → PATCH; renew → PATCH; dispatch → POST work-orders (hasil nomor nyata; MSA-expired → locked); commend → PATCH op=commend (toast audit-trail); PdfDialog → honest-label ("reference excerpt — not a signed document; hash illustrative") + link Verify-Hash DIHAPUS (tak ada anchor nyata); Direct Ring → honest-local label ("desk number — no telephony integration"); perf scorecard → onTimePct server + sisa berlabel reference; openWork → relatedPOs live + curated links berlabel.
**ReportsHub.tsx**: KPI cards ← aggregates (fetch on mount + Refresh button + badge Live/Demo + gagal→banner tanpa angka); charts MONTHS/CATS/SLA + DOSSIERS diberi honest header ("design reference — archived figures, not live"); schedule dialog + copy "local reminder — email delivery not connected" (tanpa klaim terkirim).
**AssetBim.tsx**: `refresh()` → `GET /api/telemetry/ingest?assetCode=<assetId>&limit=20`; map sensorType→node (TEMPERATURE→TT-04A °C, VIBRATION→VT-04B mm/s, REFRIGERANT_PPM→GS-04C ppm, PRESSURE_PSI→PT-03A PSI, VOLTAGE_KV→EL-DP02 V); `updated` = recordedAt nyata + "live reading"; tabel kosong → honest "no live readings — design reference values" (NODES sebagai fallback berlabel); `pick()` tak reset timestamp; header "38 telemetry nodes" → "5 reference nodes · live via Refresh"; node tanpa reading → nilai reference berlabel.

## Tests (tests/integration.test.ts)

1. vendor create happy (slug canon, audit VENDOR_CREATE, tenant-isolation via decoy) + 409 slug duplikat + replay idempoten.
2. vendor amend + renew (expiry maju, audit) + 404 unknown slug + tenant.
3. vendor commend (audit VENDOR_COMMEND, 400 note pendek).
4. telemetry ingest POST (perm wo.create) → GET ?assetCode= memuat reading (dukung runtime F8; GET list-route coverage).

## Runtime MCP (dev :3145, m.vance)

- /vendors: badge live; onboard via UI → baris baru; reload persists.
- /vendors/<slug>: amend scope via UI → persists; renew → expiry maju; dispatch WO via UI → nomor WO-2026-XXXX nyata (buka di /work-orders); commend → audit-trail berisi VENDOR_COMMEND; PDF viewer label jujur.
- /reports: KPI live ("Live aggregates…"); charts berlabel reference; schedule copy jujur.
- /assets/<canon>/bim: POST ingest 5 readings via API (curl ber-cookie) → Refresh via UI → nilai live + timestamp nyata; tanpa readings (asset lain) → honest empty.
- Console 0 JS error.

## Out of scope (GAP-15/16)

- Export-label CSV/XLS (GAP-15); scorecard readout penuh; kolom vendor di WO + server-side dispatch-lock (GAP-16); builder-SQL vs tabel nyata (GAP-16 decision); email delivery schedule.

## Docs

- TODO GAP-14 checked; audit-map F21/F14/F8 → CLOSED; PROGRESS GAP CLOSED #14.
