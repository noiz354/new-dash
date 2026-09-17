# Tier 0 — Verifikasi + Centang (5 unit, termudah)

> Semua unit ini diduga SUDAH selesai oleh GAP lain. Kerja = re-verifikasi
> runtime cepat + centang checkbox TODO + catat verdict. Bila verifikasi GAGAL,
> unit dipromosikan ke Tier 4 dengan spec baru.

## T0-1 — G1: Deactivate User dialog (GAP-2)

- Klaim: `PATCH /api/organization/users/[id]` ter-wire ke dialog Deactivate + refetch + bukti 401.
- Verifikasi: login → `/organization` → deactivate user non-self → roster berkurang → login sebagai user itu → 401; reactivate → bisa login lagi. Console 0 error.
- AC: refetch otomatis (tanpa reload manual); self-deactivate → 403.
- Output: centang TODO (Truth Map P0 G1) atau promosikan.

## T0-2 — G4/G5: purchasing + jobs wire (GAP-9 / GAP-16 T3)

- Klaim: `po.list/create/receive` + `queue/jobs` live di UI + polling status.
- Verifikasi: `/purchasing` create PR → approve → GRN (persist, reload tahan);
  `/settings/jobs` enqueue → run_cycle → COMPLETED tampil di tabel (paritas UI↔API, pola verifikasi TASK-3 2026-09-16).
- AC: nol marker fiksi Tier-3 (DAEMON/SOC2/auditHash/JOB-2026-084).
- Output: centang TODO (Truth Map P1 G4/G5) atau promosikan.

## T0-3 — OrgHub provision refetch (GAP-12 F3)

- Klaim: roster SEED → refetch setelah provision (roster 6→7 + RFID re-attach).
- Verifikasi: `/organization` → provision user baru → roster bertambah TANPA reload; RFID ter-attach.
- Output: centang TODO (OrgHub provision) atau promosikan.

## T0-4 — Master §0 item 1: final matrix Wave 3–4

- Klaim: TASK-19 PARTIAL, 20/21/23/24/26 PASS, 25 FAIL + laporan per task ada di `docs/runtime-verification-task*.md`.
- Verifikasi: baca 7 laporan + cocokkan dengan klaim matrix; TASK-25 FAIL harus punya backlog follow-up (→ Tier 4 T4-6).
- Output: centang TODO §0 item 1.

## T0-5 — Slice 4: konfirmasi selesai penuh (GAP-3)

- Klaim: semua 6 checkbox Slice 4 `[x]` (skema, service, API, UI, seed, test).
- Verifikasi: `rg 'n( \[ \])' TODO.md` pada blok Slice 4 → nol; spot-check `/inventory` receive+mutasi persist + step-up TOTP (pola runtime GAP-3).
- Output: tidak ada aksi bila bersih (sudah `[x]` semua); catat verdict di PROGRESS.

---

## Verdict (dieksekusi 2026-09-17, pre-flight: tsc hijau · dev :3157 UP · db:setup · login seed+TOTP OK)

| Unit | Verdict | Bukti |
|---|---|---|
| T0-1 G1 deactivate | **PASS** | self-deact → 403 `USER_SELF_DEACTIVATE`; deactivate Kowalski → `isActive:false` + login → `INVALID_CREDENTIALS`; reactivate → login OK; UI `ConfirmDialog` → `setActive` → PATCH → `setPeople` (tanpa reload). TODO P0 G1 ✓ |
| T0-2 G4/G5 | **PASS** | PR-2026-0316 create→APPROVE; GRN butuh PO (409 `WRONG_DOCUMENT_KIND` jujur); GRN PO-2026-0302 → stok 6→8, replay key idempoten; enqueue → run_cycle `{1,1,0}` → COMPLETED attempts 1; guard GAP-18 nol fiksi di jobs page (auditHash di vendors/contracts = scope T4-2). TODO P1 G4/G5 ✓ |
| T0-3 provision refetch | **PASS** | POST provision → roster 6→7; `OrgHub.provision()` re-fetch GET users + RFID re-attach; fallback lokal berlabel jujur. TODO OrgHub ✓ |
| T0-4 matrix Wave 3–4 | **PASS** | 7 laporan ada; verdict cocok (19 PARTIAL, 20/21/23/24/26 PASS, 25 FAIL); follow-up TASK-25 ada (TODO §Temuan + T4-5). TODO §0 item 1 ✓ |
| T0-5 Slice 4 | **PARTIAL** | Runtime spot-check PASS (RECEIVE 2→3 persist, step-up wajib: salah→`STEP_UP_INVALID`, kosong→400). Checkbox: Service/API/UI/Seed ✓ dicentang; **Skema + Test TIDAK sesuai spek → promosi Tier 4 T4-15** (tidak ada tabel `part_movements`/link part↔asset — ledger via auditEvents; kurang test ADJUST + isolasi tenant) |
