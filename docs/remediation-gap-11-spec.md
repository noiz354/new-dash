# GAP-11 Spec — Force-dispatch fix + field queue wire (F20→F16)

> Status: SPEC (belum implementasi). Target: END-TO-END. Pri P1, Eff M, CROSS-MODULE.
> Dep: GAP-08 (copy-honesty — DONE e1785f3). Prasyarat F16 = F20-fix dulu.

## F20 — backend repair (route → service + audit)

1. **`forceDispatchInspection(db, ctx, number, opts)` baru di `lib/services/inspection-service.ts`:**
   - 404 `INSPECTION` bila nomor tak ada (tenant-scoped, via `notFound`).
   - Guard terminal: status `COMPLETED` → 409 `ALREADY_COMPLETED`.
   - Selain itu: `status → IN_PROGRESS`, `progressPct` DIPERTAHANKAN (tidak
     di-reset ke 0 — reset menghancurkan progres run; perilaku route lama
     yang me-reset adalah data-loss kecil).
   - Satu transaksi + audit `INSPECTION_FORCE_DISPATCH` (before/after
     status+progress, reason opsional) + `requestId`.
   - Idempoten scope `'inspection.force_dispatch'` (pola
     `withIdempotency`, spt `finding.create`).
2. **Route `POST /api/inspections/[id]/force-dispatch` → wrapper tipis:**
   zod `{ reason?: string ≤500 }`, baca header `idempotency-key`,
   delegasi ke service. Permission tetap `assets.read` (Senior Field Tech
   wajib bisa dispatch; dispatch ≠ pembuatan WO; tanpa churn RBAC).
3. **Route `POST /api/inspections` → delegasi ke `createInspection`:**
   nomor canon `INS-YYYY-NNNN` via `nextNumber` (hapus `Math.random`),
   audit `INSPECTION_CREATE` ikut dari service. Permission tetap
   `assets.read`.
4. **Route `GET /api/inspections` → delegasi ke `listInspections`:**
   HAPUS fallback 3-row CANON hardcode (MOCKED-inside-real); kosong →
   `{ rows: [], total: 0 }` jujur. Seed sudah isi 1 baris canon, jadi dev
   tak kosong; org baru via signup dapat list kosong yang jujur.
5. **Route BARU `POST /api/inspections/[id]/progress`:**
   zod `{ progressPct: 0–100 int, status?: string ≤20 }` →
   `updateInspectionProgress`. Tanpa idempotency-key (semantik PUT-like).
6. **`updateInspectionProgress` ditambah audit `INSPECTION_PROGRESS`**
   transaksional (sebelumnya write tanpa audit). Signature tetap.

## F16 — frontend wire (queue ← inspections; run ← progress)

7. **`AuditQueue.tsx` → live GET `/api/inspections`:**
   - Mount: `apiFetch` list; `loading=false` setelah settle (HAPUS timer
     600ms fiktif).
   - Mapping status → kartu: `OVERDUE`→pill warn, `IN_PROGRESS`→progress
     bar, `SCHEDULED`→pill QUEUED, `COMPLETED`→pill pass/DONE.
   - Gagal/offline → fallback `AUDITS` const + badge `Demo offline`
     (pola GAP-3) + aksi tetap jalan ke run page.
   - Badge sync header `2` hardcode → count nyata via `listOutbox()`.
   - Seksi "Last Submission" fiktif ("hash-chained") → turunan server:
     inspeksi COMPLETED terbaru, atau seksi disembunyikan bila nihil.
   - Teks footer "3 assigned" → count dari data termuat.
8. **`FieldInspectionsHub.tsx` (ops-side):**
   - Mount: GET list → ganti `INITIAL_AUDITS` (map: id, name=title,
     assignee=auditorName; status server → hub; tak dikenal → `READY`).
     Gagal → INITIAL + badge demo.
   - `handleForceDispatch` → `POST …/force-dispatch` + update baris dari
     respons + toast nomor server; error → toast jujur (`ApiError`
     code). Hapus toast "dispatched to active crew" tanpa request.
   - Template/steps handlers tetap lokal (butuh keputusan produk —
     didefer ke GAP-16, dicatat di file).
9. **`RunChecklist.tsx` → submit persists via progress API:**
   - `onSubmit` → `POST …/progress { progressPct: 100, status:
     'COMPLETED' }` → toast status SERVER; gagal → toast jujur +
     `submitted` tetap false.
   - HAPUS teater PIN: `SUPERVISOR_PIN='2468'`, modal, toast
     "Override logged · audit-chained". PASS/FAIL = verdict lokal
     berlabel "self-assessed" yang persist saat submit.
   - Copy jujur: "WO auto-dispatched" → "Run recorded · <status server>";
     link WO fiktif → tombol Back to Audits + Open Conversion Desk
     (rute finding nyata, dipertahankan).
   - `onFail` toast "finding … stays open" → tanpa klaim status finding.
   - Autosave: indikator jujur — "Unsaved changes" saat dirty,
     "Saved HH:MM WIB" hanya setelah GET/POST server sukses (HAPUS
     timer 500ms).
   - Voice: "queued to sync" → "stored on this device only (not synced)".
   - IoT: copy jadi demo eksplisit ("demo reading — not saved") TANPA
     wiring; wiring telemetry = GAP-14 (F8), dicatat di file.
   - `photoState` awal fiktif ("1 frame attached") → "No photo attached
     yet". Upload flow nyata dipertahankan.
   - Mount: GET list → prefill progress server untuk `auditId`
     (jujur bila run sudah COMPLETED di server → tampil submitted).
10. **Run page gate (`run/page.tsx:15`) DIPERTAHANKAN** — EmptyState
    Fase-2 jujur; badge kartu ditambah di GAP-15 (F18).

## Out of scope (eksplisit)

- Template/protocol CRUD backend (GAP-16 NEED DECISION).
- IoT/telemetry wiring (GAP-14). Runs Fase-2 badge (GAP-15).
- Permission baru / perubahan RBAC map.
- Migrasi DB (nihil; kolom sudah cukup).

## Tests (service-level, `tests/integration.test.ts`)

- createInspection: nomor canon + `INSPECTION_CREATE` di audit + tenant
  isolation (decoy tak melihat).
- forceDispatch: SCHEDULED→IN_PROGRESS + audit; replay key sama tanpa
  audit ganda; 404 nomor asing; 409 bila COMPLETED; progress
  dipertahankan.
- updateInspectionProgress: 100→COMPLETED + audit `INSPECTION_PROGRESS`;
  clamp/validasi via route zod (test service: 150 → clamp 100? service
  clamp — assert 100).
- listInspections: tenant-scoped.

## Runtime (MCP, dev :3145, m.vance)

1. `/field/audits` tampil baris server (seed: 1 IN_PROGRESS) + badge live.
2. Buat inspeksi via API (curl ber-cookie) → muncul di queue setelah reload.
3. Force-dispatch via hub (klik) → status IN_PROGRESS + audit-trail
   `INSPECTION_FORCE_DISPATCH` terlihat.
4. Run submit via UI → COMPLETED + reload persists + toast server.
5. Negatif: force-dispatch nomor asing → 404 jujur; dispatch yang sudah
   COMPLETED → 409.
6. Console 0 error.

## Acceptance

- `npm test` hijau; `tsc` nol error baru.
- Satu commit `fix(gap-11): …`, in-commit verified, push.
- TODO/GAP, audit-map F20+F16 → CLOSED, PROGRESS append.
