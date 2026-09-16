# GAP-22 — Spec (F27 handover backend, badge-first — TASK 7 dari 2026-09-16-PROMPT)

Status: audit DONE 2026-09-16. Sumber: `docs/audit-non-e2e-remediation-map.md`
F27. Keputusan produk (final): **bangun backend handover** — FASE 1 (badge/
label jujur) lalu FASE 2 (backend + wire) dalam task yang sama.

## 1. Fakta audit (dibaca langsung)

- `components/shifts/ShiftPlan.tsx` (279 baris) — FRONTEND-ONLY:
  - `HISTORIC_HANDOVERS` const (`:28-62`) — 3 baris fiktif `HND-2026-0523-B/A`,
    `0522-B` berlabel ACCEPTED/REJECTED (audit-history klaim tanpa backend).
  - Badge `AUDIT COMPLIANT` (`:231`) tanpa baris audit.
  - `accept` (`:77`): hanya setState + toast klaim "active timer transferred";
    `reject` (`:82`): toast "Handover blocked" + "Escalated" tanpa persistensi.
- Route halaman: `app/(ops)/shifts/plan/page.tsx` → ShiftPlan; konteks WO
  memakai `CANON.workOrderSeal`, lead A Elena Voronova / lead B David Chen.

## 2. FASE 2 — keputusan desain (dokumentasi pilihan prompt)

- Tabel `handovers` (migrasi 0007): `id` uuid (opaque), `organizationId` FK
  cascade, `shiftFrom`/`shiftTo`, `leadFrom`/`leadTo` (nama display),
  `woRef` text nullable (ref WO saat initiate dari konteks WO), `items`,
  `notes`, `status` text enum `PENDING|ACCEPTED|REJECTED`, `rejectReason`
  text NULL, `decidedBy` text NULL, `createdAt`/`updatedAt`/`decidedAt` TZ.
  PK `(organizationId, id)`. **Seed KOSONG** (prompt melarang baris fiksi).
- Service `lib/services/handover-service.ts` (mirror pola vendor/facility):
  - `listHandovers(db, ctx)` desc createdAt.
  - `createHandover(db, ctx, {shiftFrom, shiftTo, leadFrom, leadTo, woRef?,
    items?, notes?}, opts)` → audit `HANDOVER_CREATE`; idempoten scope
    `handover.create`.
  - `decideHandover(db, ctx, id, {action:'accept'|'reject', reason?}, opts)`
    → 404 `HANDOVER_NOT_FOUND`; status !== PENDING → 409 `HANDOVER_TERMINAL`;
    reject tanpa alasan → 400 `REASON_REQUIRED`; audit `HANDOVER_ACCEPT` /
    `HANDOVER_REJECT` (before/after lengkap); idempoten scope
    `handover.decide`.
- **Path dipilih: `app/api/shifts/handovers`** (prompt memperbolehkan satu
  pilihan): route.ts — GET `shifts.read` (list + can.manage), POST
  `shifts.manage` (create, zod≤batas) → 201. `[id]/route.ts` — POST
  `shifts.manage` zod `{action:'accept'|'reject', reason?}` memutuskan.
- RBAC: pasangan baru `shifts.read` (READ_ALL) + `shifts.manage` (role set
  persis vendors.manage: Facility Director, Engineering Lead, Enterprise
  Admin via `*`).
- Badge kepatuhan: hanya berbasis baris audit/server — live + ada baris →
  `AUDIT TRAIL · server records`; live kosong → `SERVER · no records yet`;
  offline → `LOCAL DEMO` (penanda jujur per FASE 1).
- HISTORIC_HANDOVERS tetap sebagai FALLBACK SAJA saat (a) API offline, dan
  header tabel menandai `local demo — not persisted`; saat live-kosong tabel
  menampilkan empty-state jujur, saat live-terisi menampilkan rows server
  (badge status server, notes, decidedAt/decidedBy, rejectReason).
- Active queue card: live + PENDING ada → tombol accept/reject melakukan POST
  decision (toast memuat id server + aksi audit); live + pending kosong →
  tombol `Initiate Handover (server)` (create via POST, toast id); offline →
  perilaku lokal + toast `recorded locally (demo)`.

## 3. Test

- Integration (service-level): create happy+idempoten+audit CREATE; accept
  happy (status ACCEPTED, decidedBy=actor, audit ACCEPT, before/after);
  reject happy + alasan (<3 → 400 REASON_REQUIRED); aksi ganda pada row
  terminal → 409 HANDOVER_TERMINAL; unknown id → 404; decoy blind (list
  tak memuat rows canon) + tidak bisa decide (404); RBAC assertions.
- Guard-truthfulness: ShiftPlan nol `AUDIT COMPLIANT`/`HND-2026-0523`
  (saat fallback tetap boleh memuat konstanta demo → guard ditargetkan pada
  render-label: keberadaan marker `local demo — not persisted` wajib bila
  fallback ditampilkan — diuji via kehadiran string + nol badge finit).
- `npm test` + `tsc` hijau.

## 4. Runtime

Isolasi :3158: GET list kosong → POST create → 201 PENDING → POST accept →
ACCEPTED (decidedBy) → aksi kedua → 409 → reject tanpa alasan → 400 →
reject beralasan pada baris baru → REJECTED + reason → unauth 401 →
audit-trail HANDOVER_* → halaman `/shifts/plan` 200 (nol AUDIT COMPLIANT,
badge jujur) .

## 5. Docs (commit sama)

F27 CLOSED + master 27; truth-map shift row; TODO 7/7; PROGRESS; PROMPT
pelacakan (TASK 7 DONE + backfill hash TASK 6 `88b4a08`).

## Gerbang sweep (bagian penutup GAP-16, commit sama)

- `components/audit/AuditTrail.tsx` & `components/field/RunChecklist.tsx`:
  label jujur untuk `10.14.0.8` (ip audit → qualifier; Modbus read → demo
  copy) sehingga guard-test fiksi gerbang (#4 daftar string) bersih
  repo-wide tanpa mengubah perilaku halaman di luar tujuh task.
- Guard-test gerbang diperluas: perintah sweep memverifikasi nol
  `10.14.0.8`, `MODEL MATCHED`, `production KV-store`, `AUDIT COMPLIANT`,
  `SOC2 AUDIT READY`, `TRF-`/`ADJ-` (ledger), `2468`.

## Non-goals

- Penjadwalan shift otomatis; notifikasi pager/SMS; koreksi claim di
  halaman komponen lain di luar gerbang-string list.
