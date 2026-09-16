# GAP-12 Spec — 4 quick-close (F5, F10, F3, F17): wire UI ke backend yang ADA

## F5 — WO task checklist (BACKEND-ONLY → END-TO-END)
- Backend ADA: GET/POST `/api/work-orders/[id]/tasks` + `task-service.ts`
  (sequence lock + photo gate + unlock-next + audit WO_TASK_UPDATE). NOL caller UI.
- Fix:
  1. Seed 7 `wo_tasks` untuk CANON.workOrderSeal (isi = 7 langkah dossier statis:
     LOTO, refrigerant recovery, disassemble, install+torque, nitrogen test,
     evacuation+recharge, baseline run) dengan status DONE×4 / IN_PROGRESS×1 /
     PENDING×1 / LOCKED×1 (cocok dossier "4/7 Complete", step 04 torqued).
     `requiresPhoto: true` untuk step 01 (LOTO) + 04 (install) agar photo-gate
     punya arti. Idempotent via onConflictDoNothing (PK org+id).
     ID stabil: `WOSEAL-T01..T07`.
  2. `app/(ops)/work-orders/[id]/page.tsx` (server): `listWoTasks()` untuk WO
     canon; ganti `<ol>` statis dengan komponen klien baru
     `components/ops/WoChecklist.tsx` (props: number, initialTasks, canTransition).
  3. `WoChecklist`: render dari server tasks; tombol Advance
     (PENDING→IN_PROGRESS→DONE) via POST + Idempotency-Key; error
     SEQUENCE_VIOLATION / PHOTO_REQUIRED ditampilkan jujur (bukan toast sukses);
     badge LOCKED/PENDING/IN_PROGRESS/DONE; verifiedBy/verifiedAt bila DONE;
     daftar kosong → "No execution tasks recorded for this work order."
  4. Checklist statis canon DIHAPUS (diganti live). Header "Step Progress 4/7"
     dihitung dari tasks (bukan hardcode).
- Out of scope: upload foto per-task di UI checklist (photo-gate tetap
  dienforce server; evidence upload sudah ada via RunChecklist).
- Test: seed → GET tasks 7 baris urut; POST DONE step 05 (IN_PROGRESS, prior
  DONE semua) sukses + unlock step 06; POST DONE step 07 duluan → 422
  SEQUENCE_VIOLATION; POST DONE step 01 tanpa evidence → 422 PHOTO_REQUIRED
  (step 01 requiresPhoto); replay idempoten.
  Catatan: seed status DONE untuk T01/T04 yang requiresPhoto — update path
  tak menyentuh baris DONE (hanya advance), jadi gate tak menghalangi seed.

## F10 — ReportsHub runQuery (fiksi 46ms/412 → agregat nyata)
- `runQuery` → GET `/api/reports/aggregates`; tampilkan angka nyata
  (total/open/completed WO, assets, SKUs, valuasi, low-stock, SR) + latensi
  terukur (ms); label "server aggregate query — live".
- Gagal fetch → banner jujur + aksi disabled (pola FindingDesk).
- Builder SQL + CSV dossier lokal tetap (honest-local, beri label "local preview").
- Badge "BI v4.6-OLAP / READ REPLICA: SYNCED" → "server aggregates (this database)".
- Catatan audit: endpoint aggregates sendiri PARTIAL (slaCompliancePct fallback
  98.4, avgResolutionHours 2.8, operationalPct 99.2 hardcode) — UI hanya tampilkan
  field hitungan nyata, JANGAN tampilkan 3 field derivasi fiktif itu.

## F3 — OrgHub provision refetch (append → revalidate)
- Setelah POST sukses: GET `/api/organization/users` ulang → `setPeople` dari
  server; RFID line ditempel ulang ke baris created (local-display-only, toast
  sudah jujur); focus ke created.
- Gagal refetch → fallback append lama + toast jujur "created on server —
  roster refresh failed, showing local copy".

## F17 — FieldShell auto-flush (refresh-only → flush+refresh)
- Handler `online` di FieldShell: `flushOutbox({})` (silent, try/catch) lalu
  `refresh()` (badge update via subscribe otomatis).
- Toast "Back online" tetap milik SyncStatus (punya konteks toast); shell silent.
- Test: none baru (perilaku klien); verifikasi via runtime manual bila sempat,
  else verified-by-construction + catat.

## Verifikasi
- `npm test` hijau, `tsc` nol error baru.
- Runtime MCP: WO canon checklist live + advance jujur; reports angka nyata;
  provision refetch; console bersih.
- Docs: TODO GAP-12 checked; audit-map F5/F10/F3/F17 → CLOSED.
- Satu commit; push; verifikasi in-commit.
